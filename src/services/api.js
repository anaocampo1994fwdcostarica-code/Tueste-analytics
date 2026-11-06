// A relative URL lets Vite proxy development traffic and keeps production builds portable.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request(resource) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/${resource}`, { headers: { Accept: 'application/json' } });
  } catch (error) {
    throw new Error(`No se pudo conectar con la API de Tueste Analytics (${error.message}).`);
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `La API respondió HTTP ${response.status} al consultar ${resource}.`);
  return payload;
}

export async function getApiData(resource) {
  return (await request(resource)).data;
}
export async function getApiResponse(resource) {
  return request(resource);
}
export async function loadDashboardData() {
  const results = await Promise.allSettled([
    getApiData('products'), getApiData('offers'), getApiData('costs'), getApiData('scenarios'),
    getApiData('financial-assumptions'), getApiData('simulations'), getApiData('acquisition-history'),
    getApiData('repurchase-patterns'),
  ]);
  const [products, offers, costs, scenarios, assumptions, simulations, acquisitionHistory, repurchasePatterns] = results.map((result) => result.status === 'fulfilled' ? result.value : []);
  const failed = results.find((result) => result.status === 'rejected');
  return { products, offers, costs, scenarios, assumptions, simulations, acquisitionHistory, repurchasePatterns, error: failed?.reason?.message || null };
}

export async function loadCommercialData() {
  const resources = ['summary','campaigns','channels','funnel','conversions','opportunities','contents','handoffs','customers','subscriptions','orders','ticket-average','financial-status'];
  const [healthResult, ...results] = await Promise.allSettled([
    getApiResponse('health'),
    ...resources.map((name) => getApiResponse(`commercial/${name}`)),
  ]);
  const data = {};
  resources.forEach((name,index) => { data[name.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())] = results[index].status === 'fulfilled' ? results[index].value.data : null; });
  const firstSuccess = results.find((result) => result.status === 'fulfilled');
  const firstFailure = healthResult.status === 'rejected' ? healthResult : results.find((result) => result.status === 'rejected');
  return {
    ...data,
    health: healthResult.status === 'fulfilled' ? healthResult.value : null,
    meta: firstSuccess?.value?.meta || healthResult.value?.meta || null,
    error: firstFailure?.reason?.message || null,
  };
}
