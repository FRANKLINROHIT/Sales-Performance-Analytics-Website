export const exportToCSV = (data, filename = 'sales_report.csv') => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  data.forEach(row => {
    const values = headers.map(header => {
      const escaped = ('' + (row[header] ?? '')).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  a.click();
};
