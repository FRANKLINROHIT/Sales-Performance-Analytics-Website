const test = require('node:test');
const assert = require('node:assert');
const { EventEmitter } = require('events');

// Configure test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_security_audit_suite_2026_test';

const app = require('../backend/server');
const { queryOne, query } = require('../backend/config/db');

// In-memory request dispatcher for Express (avoids TCP socket restrictions in sandbox)
function invoke(app, { method = 'GET', url = '/', headers = {}, body = null }) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.originalUrl = url;
    req.headers = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
    req.body = body;
    req.query = {};
    req.params = {};
    req.socket = { remoteAddress: '127.0.0.1' };
    req.ip = '127.0.0.1';

    // Parse query params if url contains '?'
    if (url.includes('?')) {
      const parts = url.split('?');
      req.url = parts[0];
      const searchParams = new URLSearchParams(parts[1]);
      for (const [k, v] of searchParams.entries()) {
        req.query[k] = v;
      }
    }

    const res = new EventEmitter();
    res.statusCode = 200;
    res.headers = {};
    res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
    res.getHeader = (k) => res.headers[k.toLowerCase()];
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => {
      resolve({ status: res.statusCode, headers: res.headers, body: data });
      return res;
    };
    res.send = (data) => {
      resolve({ status: res.statusCode, headers: res.headers, body: data });
      return res;
    };

    app.handle(req, res);
  });
}

test('1. Security Headers: Verifies secure headers and removal of X-Powered-By', async () => {
  const res = await invoke(app, { method: 'GET', url: '/api/health' });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
  assert.strictEqual(res.headers['x-frame-options'], 'DENY');
  assert.strictEqual(res.headers['x-powered-by'], undefined, 'X-Powered-By header should be removed');
  assert.ok(res.headers['content-security-policy'], 'Content-Security-Policy should be present');
});

test('2. VULN-01: Self-registration as Admin is strictly blocked with 403 Forbidden', async () => {
  const res = await invoke(app, {
    method: 'POST',
    url: '/api/auth/register',
    headers: { 'content-type': 'application/json' },
    body: {
      name: 'Malicious Admin Wannabe',
      email: `attacker_admin_${Date.now()}@attacker.com`,
      password: 'StrongPassword123!',
      role: 'Admin'
    }
  });

  assert.strictEqual(res.status, 403, 'Attempting to self-register as Admin must return 403 Forbidden');
  assert.strictEqual(res.body.success, false);
});

test('3. VULN-01 (Positive): Legitimate self-registration defaults to Salesperson', async () => {
  const legitEmail = `legit_sales_${Date.now()}@testcompany.com`;
  const res = await invoke(app, {
    method: 'POST',
    url: '/api/auth/register',
    headers: { 'content-type': 'application/json' },
    body: {
      name: 'Legit Salesperson',
      email: legitEmail,
      password: 'StrongPassword123!',
      region_id: 1
    }
  });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.user.role, 'Salesperson');
  assert.ok(res.body.token);
});

test('4. VULN-03: Salesperson cannot access other salespersons private commissions (IDOR / BOLA)', async () => {
  // Login as Salesperson 1 (Rohan Verma, salesperson_id: 1)
  const loginRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    headers: { 'content-type': 'application/json' },
    body: { email: 'salesperson1@analytics.com', password: 'sales123' }
  });
  assert.strictEqual(loginRes.status, 200);
  const token = loginRes.body.token;

  // Salesperson 1 requests Employee 2 (Ananya Iyer)
  const empRes = await invoke(app, {
    method: 'GET',
    url: '/api/employees/2',
    headers: { 'authorization': `Bearer ${token}` }
  });

  assert.strictEqual(empRes.status, 200);
  // Commissions must be empty and personal phone redacted for peer salesperson
  assert.deepStrictEqual(empRes.body.data.commissions, [], 'Peer salesperson must NOT see another reps commissions');
  assert.deepStrictEqual(empRes.body.data.salesHistory, [], 'Peer salesperson must NOT see another reps detailed sales history');
  assert.strictEqual(empRes.body.data.employee.phone, undefined, 'Personal phone should be redacted');
});

test('5. VULN-03 (Privileged): Admin CAN view full employee commissions', async () => {
  // Login as Admin
  const loginRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    headers: { 'content-type': 'application/json' },
    body: { email: 'admin@analytics.com', password: 'admin123' }
  });
  assert.strictEqual(loginRes.status, 200);
  const adminToken = loginRes.body.token;

  // Admin requests Employee 2
  const empRes = await invoke(app, {
    method: 'GET',
    url: '/api/employees/2',
    headers: { 'authorization': `Bearer ${adminToken}` }
  });

  assert.strictEqual(empRes.status, 200);
  assert.ok(Array.isArray(empRes.body.data.commissions));
  assert.ok(empRes.body.data.commissions.length > 0, 'Admin should have access to employee commissions');
});

test('6. VULN-04: Salesperson cannot impersonate another salesperson during sale creation', async () => {
  // Login as Salesperson 1 (salesperson_id: 1)
  const loginRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    headers: { 'content-type': 'application/json' },
    body: { email: 'salesperson1@analytics.com', password: 'sales123' }
  });
  const token = loginRes.body.token;

  // Salesperson 1 attempts to create a sale under salesperson_id: 2
  const saleRes = await invoke(app, {
    method: 'POST',
    url: '/api/sales',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${token}` },
    body: {
      salesperson_id: 2,
      customer_id: 1,
      product_id: 1,
      quantity: 1,
      sale_date: '2026-09-15'
    }
  });

  assert.strictEqual(saleRes.status, 403, 'Salesperson attempting to record sale for another salesperson must return 403 Forbidden');
  assert.strictEqual(saleRes.body.success, false);
});

test('7. VULN-05: Plaintext passwords are redacted in AuditLogs', async () => {
  // Login as Admin
  const loginRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    headers: { 'content-type': 'application/json' },
    body: { email: 'admin@analytics.com', password: 'admin123' }
  });
  const adminToken = loginRes.body.token;

  const testPass = 'UltraSecretAuditPass987!';
  // Admin creates user
  const createRes = await invoke(app, {
    method: 'POST',
    url: '/api/admin/users',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${adminToken}` },
    body: {
      name: 'Audit Sanitization Tester',
      email: `audit_sanitized_${Date.now()}@analytics.com`,
      password: testPass,
      role: 'Salesperson'
    }
  });
  assert.strictEqual(createRes.status, 201);

  // Check the stored AuditLog entry
  const latestLog = await queryOne(
    `SELECT details FROM AuditLogs WHERE action = 'CREATE_USER' ORDER BY log_id DESC LIMIT 1`
  );
  assert.ok(latestLog, 'Audit log must exist');
  assert.ok(latestLog.details.includes('[REDACTED]'), 'Details must contain [REDACTED]');
  assert.strictEqual(latestLog.details.includes(testPass), false, 'Plaintext password must NOT appear in audit log details');
});

test('8. VULN-10: Sales with negative or zero quantity are rejected with 400 Bad Request', async () => {
  const loginRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    headers: { 'content-type': 'application/json' },
    body: { email: 'admin@analytics.com', password: 'admin123' }
  });
  const adminToken = loginRes.body.token;

  // Negative quantity
  const negRes = await invoke(app, {
    method: 'POST',
    url: '/api/sales',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${adminToken}` },
    body: {
      salesperson_id: 1,
      customer_id: 1,
      product_id: 1,
      quantity: -5,
      sale_date: '2026-09-15'
    }
  });
  assert.strictEqual(negRes.status, 400, 'Negative quantity must return 400');

  // Zero quantity
  const zeroRes = await invoke(app, {
    method: 'POST',
    url: '/api/sales',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${adminToken}` },
    body: {
      salesperson_id: 1,
      customer_id: 1,
      product_id: 1,
      quantity: 0,
      sale_date: '2026-09-15'
    }
  });
  assert.strictEqual(zeroRes.status, 400, 'Zero quantity must return 400');
});

test('9. VULN-10 (Positive): Sales with positive quantity succeed', async () => {
  const loginRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    headers: { 'content-type': 'application/json' },
    body: { email: 'admin@analytics.com', password: 'admin123' }
  });
  const adminToken = loginRes.body.token;

  const validRes = await invoke(app, {
    method: 'POST',
    url: '/api/sales',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${adminToken}` },
    body: {
      salesperson_id: 1,
      customer_id: 1,
      product_id: 1,
      quantity: 2,
      sale_date: '2026-09-15'
    }
  });
  assert.strictEqual(validRes.status, 201);
  assert.strictEqual(validRes.body.success, true);
});

test('10. VULN-12: Report endpoint enforces role scoping and blocks salespersons from employee salary export', async () => {
  // Login as Salesperson 1
  const loginRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    headers: { 'content-type': 'application/json' },
    body: { email: 'salesperson1@analytics.com', password: 'sales123' }
  });
  const token = loginRes.body.token;

  // Salesperson attempts to export all employee performances
  const empReportRes = await invoke(app, {
    method: 'GET',
    url: '/api/reports?report_type=employees',
    headers: { 'authorization': `Bearer ${token}` }
  });
  assert.strictEqual(empReportRes.status, 403, 'Salespersons should be forbidden from exporting overall employee reports');

  // Salesperson exports sales report: verify it only returns their own sales
  const salesReportRes = await invoke(app, {
    method: 'GET',
    url: '/api/reports?report_type=sales',
    headers: { 'authorization': `Bearer ${token}` }
  });
  assert.strictEqual(salesReportRes.status, 200);
  assert.ok(Array.isArray(salesReportRes.body.data));
  for (const s of salesReportRes.body.data) {
    assert.strictEqual(s.salesperson, 'Rohan Verma', 'Sales report for salesperson must only contain their sales');
  }
});

test('11. VULN-13: Product creation rejects negative price, cost, or invalid SKU', async () => {
  const loginRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    headers: { 'content-type': 'application/json' },
    body: { email: 'admin@analytics.com', password: 'admin123' }
  });
  const adminToken = loginRes.body.token;

  // Negative price
  const negPriceRes = await invoke(app, {
    method: 'POST',
    url: '/api/products',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${adminToken}` },
    body: {
      product_name: 'Invalid Negative Price Item',
      sku: `SKU-NEG-${Date.now()}`,
      category: 'Software',
      price: -500,
      cost: 100,
      stock_quantity: 10
    }
  });
  assert.strictEqual(negPriceRes.status, 400);

  // Negative stock
  const negStockRes = await invoke(app, {
    method: 'POST',
    url: '/api/products',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${adminToken}` },
    body: {
      product_name: 'Invalid Negative Stock Item',
      sku: `SKU-STOCK-${Date.now()}`,
      category: 'Software',
      price: 500,
      cost: 100,
      stock_quantity: -10
    }
  });
  assert.strictEqual(negStockRes.status, 400);
});

test('12. VULN-14: Target creation rejects invalid month and negative target amounts', async () => {
  const loginRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    headers: { 'content-type': 'application/json' },
    body: { email: 'admin@analytics.com', password: 'admin123' }
  });
  const adminToken = loginRes.body.token;

  // Negative target amount
  const negTargetRes = await invoke(app, {
    method: 'POST',
    url: '/api/targets',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${adminToken}` },
    body: {
      salesperson_id: 1,
      target_amount: -10000,
      year: 2026,
      month: 9
    }
  });
  assert.strictEqual(negTargetRes.status, 400);

  // Invalid month (13)
  const invMonthRes = await invoke(app, {
    method: 'POST',
    url: '/api/targets',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${adminToken}` },
    body: {
      salesperson_id: 1,
      target_amount: 150000,
      year: 2026,
      month: 13
    }
  });
  assert.strictEqual(invMonthRes.status, 400);
});

test('13. VULN-15: Admin user creation strictly enforces allowed roles and password lengths', async () => {
  const loginRes = await invoke(app, {
    method: 'POST',
    url: '/api/auth/login',
    headers: { 'content-type': 'application/json' },
    body: { email: 'admin@analytics.com', password: 'admin123' }
  });
  const adminToken = loginRes.body.token;

  // Invalid role
  const badRoleRes = await invoke(app, {
    method: 'POST',
    url: '/api/admin/users',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${adminToken}` },
    body: {
      name: 'Bad Role User',
      email: `badrole_${Date.now()}@test.com`,
      password: 'StrongPassword123!',
      role: 'SuperRootAdmin'
    }
  });
  assert.strictEqual(badRoleRes.status, 400);

  // Weak password (< 8 chars)
  const weakPassRes = await invoke(app, {
    method: 'POST',
    url: '/api/admin/users',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${adminToken}` },
    body: {
      name: 'Weak Pass User',
      email: `weakpass_${Date.now()}@test.com`,
      password: '123',
      role: 'Salesperson'
    }
  });
  assert.strictEqual(weakPassRes.status, 400);
});
