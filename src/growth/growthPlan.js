export const GROWTH_PLAN_STORAGE_KEY = 'tueste-growth-plan-demo-v1';
export const GROWTH_PLAN_SCHEMA_VERSION = 1;
export const PLAN_STATUSES = Object.freeze(['propuesto', 'en progreso', 'completado', 'bloqueado']);

export const DEFAULT_GROWTH_PLAN = Object.freeze([
  Object.freeze({ id: 'plan-referral', period: 'Días 1–30', action: 'Programa de referidos', owner: 'Growth', hypothesis: 'Activar después de entrega reduce fricción.', metric: 'Compradores referidos válidos / 100 elegibles', counter: 'Costo por referido', goal: 'Hipótesis: 6 → 9', status: 'propuesto' }),
  Object.freeze({ id: 'plan-conversion', period: 'Días 1–30', action: 'Optimización de conversión', owner: 'E-commerce', hypothesis: 'Beneficio aplicado mejora visita a compra.', metric: 'Compra de amigo', counter: 'Descuento total', goal: 'Hipótesis por validar', status: 'propuesto' }),
  Object.freeze({ id: 'plan-activation', period: 'Días 31–60', action: 'Activación post-entrega', owner: 'CRM', hypothesis: 'El momento posterior a entrega eleva invitaciones.', metric: 'Invitaciones por invitador', counter: 'Quejas', goal: 'Hipótesis por validar', status: 'propuesto' }),
  Object.freeze({ id: 'plan-retention', period: 'Días 61–90', action: 'Retención y recompra', owner: 'Operaciones', hypothesis: 'Pausa reduce cancelaciones evitables.', metric: 'Retención de cohorte', counter: 'Margen', goal: 'Hipótesis por validar', status: 'propuesto' }),
]);

const clone = (value) => JSON.parse(JSON.stringify(value));
const required = ['id', 'period', 'action', 'owner', 'metric', 'counter', 'goal', 'status'];
const validAction = (item) => item && required.every((key) => typeof item[key] === 'string' && item[key].trim()) && PLAN_STATUSES.includes(item.status);

export function createInitialGrowthPlanState() {
  return { version: GROWTH_PLAN_SCHEMA_VERSION, actions: clone(DEFAULT_GROWTH_PLAN), sequence: 1 };
}

export function hydrateGrowthPlanState(raw) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed || parsed.version !== GROWTH_PLAN_SCHEMA_VERSION || !Array.isArray(parsed.actions) || !Number.isInteger(parsed.sequence)) return createInitialGrowthPlanState();
    if (!parsed.actions.every(validAction) || new Set(parsed.actions.map(({ id }) => id)).size !== parsed.actions.length) return createInitialGrowthPlanState();
    return parsed;
  } catch { return createInitialGrowthPlanState(); }
}

export function loadGrowthPlanState(storage) { return hydrateGrowthPlanState(storage?.getItem(GROWTH_PLAN_STORAGE_KEY)); }
export function saveGrowthPlanState(storage, state) { storage?.setItem(GROWTH_PLAN_STORAGE_KEY, JSON.stringify(state)); return state; }
export function resetGrowthPlanState(storage) { const state = createInitialGrowthPlanState(); return saveGrowthPlanState(storage, state); }

export function addGrowthPlanAction(state, input) {
  const action = { id: `plan-custom-${state.sequence}`, period: '', action: '', owner: '', hypothesis: '', metric: '', counter: '', goal: '', status: 'propuesto', ...input };
  if (!validAction(action)) return { status: 'rejected', reason: 'invalid_action' };
  return { status: 'ok', value: { ...state, actions: [...state.actions, action], sequence: state.sequence + 1 } };
}

export function updateGrowthPlanAction(state, id, changes) {
  const current = state.actions.find((item) => item.id === id);
  if (!current) return { status: 'rejected', reason: 'unknown_action' };
  const updated = { ...current, ...changes, id: current.id };
  if (!validAction(updated)) return { status: 'rejected', reason: 'invalid_action' };
  return { status: 'ok', value: { ...state, actions: state.actions.map((item) => item.id === id ? updated : item) } };
}

export function deleteGrowthPlanAction(state, id) {
  if (!state.actions.some((item) => item.id === id)) return { status: 'rejected', reason: 'unknown_action' };
  return { status: 'ok', value: { ...state, actions: state.actions.filter((item) => item.id !== id) } };
}
