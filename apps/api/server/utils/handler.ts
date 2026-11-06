// Single place where a route failure becomes an HTTP response.
//
// Routes are wrapped with `apiHandler` so the JSON contract is produced here
// instead of relying on the framework's default error page. Logs carry only
// the route, the status and the code — never bodies, tokens or health data.

import type {H3Event} from 'h3';
import {normalizeError} from './errors';

export function apiHandler<T>(handler: (event: H3Event) => Promise<T> | T) {
  return defineEventHandler(async (event) => {
    try {
      return await handler(event);
    } catch (error) {
      const {status, body} = normalizeError(error);
      if (status >= 500) {
        console.error(
          JSON.stringify({route: getRequestURL(event).pathname, status, code: body.error.code}),
        );
      }
      setResponseStatus(event, status);
      setResponseHeader(event, 'content-type', 'application/json; charset=utf-8');
      return body;
    }
  });
}
