export const PUBLIC_ROUTES = Object.freeze(['inicio']);

export function normalizeHashRoute(hash = '') {
  const routeWithQuery = String(hash).replace(/^#/, '');
  const route = routeWithQuery.split('?')[0];
  return route || 'inicio';
}

export function getReferralCode(hash = '') {
  const queryStart = String(hash).indexOf('?');
  if (queryStart === -1) return '';
  return new URLSearchParams(String(hash).slice(queryStart + 1)).get('ref')?.trim() ?? '';
}
