export const exportToCSV = (data, filename = 'sales_report.csv') => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));

  data.forEach(row => {
    const values = headers.map(header => {
      let val = row[header] ?? '';
      let str = String(val);

      // Defend against CSV/Formula Injection (CWE-1236)
      // If cell begins with =, +, -, @, \t, or \r, prefix with a single quote
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }

      // Escape quotes by doubling them according to RFC 4180
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  a.click();
  window.URL.revokeObjectURL(url);
};
