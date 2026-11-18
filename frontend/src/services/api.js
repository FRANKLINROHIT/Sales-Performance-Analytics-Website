const API_BASE = '/api';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('analytics_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
  } catch (err) {
    // Catch client-side network disconnects / offline states
    throw new Error(`Network error: Unable to connect to backend server (${err.message}). Ensure the backend server is running.`);
  }

  // Safely read response text first to prevent "Unexpected end of JSON input" on empty/HTML responses
  const rawText = await response.text();
  let data = null;

  if (rawText && rawText.trim().length > 0) {
    try {
      data = JSON.parse(rawText);
    } catch (parseErr) {
      // Server returned HTML (e.g. 504 Gateway Timeout or 404 page from Vite/Vercel)
      if (!response.ok) {
        if (response.status === 504 || response.status === 502) {
          throw new Error(`Backend server is unreachable (HTTP ${response.status}). Please make sure the backend server is running on port 5000.`);
        }
        throw new Error(`Server returned error ${response.status} (${response.statusText}): ${rawText.slice(0, 120)}`);
      }
      throw new Error(`Unexpected non-JSON response from server (HTTP ${response.status}).`);
    }
  }

  // Handle HTTP error statuses
  if (!response.ok) {
    const serverMessage = data?.message || data?.error;
    if (response.status === 504 || response.status === 502) {
      throw new Error(serverMessage || `Backend server is not responding (HTTP ${response.status}). Please ensure the backend is started with 'npm run dev' or 'npm run dev:backend'.`);
    }
    if (response.status === 503) {
      throw new Error(serverMessage || 'Backend service is currently unavailable. Please ensure the backend server is running on port 5000.');
    }
    if (response.status === 500 && !serverMessage) {
      throw new Error('Backend server error (HTTP 500). Please check backend console logs and ensure the backend is running on port 5000.');
    }
    if (response.status === 401) {
      throw new Error(serverMessage || 'Unauthorized: Please log in again.');
    }
    if (response.status === 403) {
      throw new Error(serverMessage || 'Access Denied: You do not have permission for this action.');
    }
    throw new Error(serverMessage || `API request failed with status ${response.status}.`);
  }

  return data || {};
};
