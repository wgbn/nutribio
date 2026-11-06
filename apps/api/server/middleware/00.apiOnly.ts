// The project ships a server, not a web app: every path outside `/api`
// answers with the API error contract instead of the framework's HTML shell.

export default defineEventHandler((event) => {
  if (getRequestURL(event).pathname.startsWith('/api/')) return;

  setResponseStatus(event, 404);
  setResponseHeader(event, 'content-type', 'application/json; charset=utf-8');
  return {error: {code: 'notFound'}};
});
