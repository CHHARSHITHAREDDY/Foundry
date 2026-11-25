export const analyticsSnippet = `
  window.addEventListener('DOMContentLoaded', () => {
    fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ event: 'pageview', path: window.location.pathname }) });
  });
`;
