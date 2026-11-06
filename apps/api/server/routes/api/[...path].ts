// Unknown API paths answer with the API error contract.

export default defineEventHandler((event) => {
  setResponseStatus(event, 404);
  setResponseHeader(event, 'content-type', 'application/json; charset=utf-8');
  return {error: {code: 'notFound'}};
});
