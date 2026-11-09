export const DEMO_ROLE = Object.freeze({
  GUEST: 'guest',
  CLIENT: 'client',
  ADMIN: 'admin',
});

export const DEMO_ROLE_STORAGE_KEY = 'tueste-demo-role';
export const DEMO_ROLE_CHANGE_EVENT = 'tueste-demo-role-change';

const ROUTE_PERMISSIONS = Object.freeze({
  inicio: Object.freeze([DEMO_ROLE.GUEST, DEMO_ROLE.CLIENT, DEMO_ROLE.ADMIN]),
  'tueste-rewards': Object.freeze([DEMO_ROLE.GUEST, DEMO_ROLE.CLIENT, DEMO_ROLE.ADMIN]),
  'panel-growth': Object.freeze([DEMO_ROLE.ADMIN]),
  'panel-principal': Object.freeze([DEMO_ROLE.ADMIN]),
  escenarios: Object.freeze([DEMO_ROLE.ADMIN]),
  'nivel-2': Object.freeze([DEMO_ROLE.ADMIN]),
  'nivel-3': Object.freeze([DEMO_ROLE.ADMIN]),
  simulador: Object.freeze([DEMO_ROLE.ADMIN]),
  'flujo-caja': Object.freeze([DEMO_ROLE.ADMIN]),
  recomendacion: Object.freeze([DEMO_ROLE.ADMIN]),
  'dashboard-comercial': Object.freeze([DEMO_ROLE.ADMIN]),
});

export function getActiveDemoRole(storage = sessionStorage) {
  const role = storage.getItem(DEMO_ROLE_STORAGE_KEY);
  return Object.values(DEMO_ROLE).includes(role) ? role : DEMO_ROLE.GUEST;
}

export function setActiveDemoRole(role, storage = sessionStorage) {
  if (!Object.values(DEMO_ROLE).includes(role)) {
    throw new Error(`Rol DEMO no valido: ${role}`);
  }
  storage.setItem(DEMO_ROLE_STORAGE_KEY, role);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DEMO_ROLE_CHANGE_EVENT, { detail: role }));
  }
}

export function clearActiveDemoRole(storage = sessionStorage) {
  storage?.removeItem?.(DEMO_ROLE_STORAGE_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DEMO_ROLE_CHANGE_EVENT, { detail: DEMO_ROLE.GUEST }));
  }
}

export function canAccessRoute(route, role = getActiveDemoRole()) {
  return ROUTE_PERMISSIONS[route]?.includes(role) ?? false;
}
