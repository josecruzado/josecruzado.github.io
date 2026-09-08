import type { APIRoute } from 'astro';

import { API_CONTRACT } from '../lib/api-contract';

/**
 * /openapi.json — el contrato que describe /cv.json y /llms.txt.
 *
 * Es la misma definición que renderiza la sección «Contrato» de la web: si
 * cambia un endpoint, cambian los dos, porque ambos leen de api-contract.ts.
 */
export const GET: APIRoute = () =>
  new Response(JSON.stringify(API_CONTRACT, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
