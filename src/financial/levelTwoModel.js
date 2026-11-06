import { SIMULATION_DEFAULTS } from './contracts.js';

export const LEVEL_TWO_CONTROLS = Object.freeze([
  { key: 'metaActual', label: 'Inversión mensual Meta', unit: 'USD', min: 0, max: 20000, step: 500, kind: 'range' },
  { key: 'pricePerBag', label: 'Precio por bolsa', unit: 'USD', min: 0.01, max: 100, step: 0.5, kind: 'number' },
  { key: 'bagCost', label: 'Costo del café por bolsa', unit: 'USD', min: 0, max: 50, step: 0.01, kind: 'number' },
  { key: 'shipping', label: 'Costo de envío', unit: 'USD', min: 0, max: 50, step: 0.01, kind: 'number' },
  { key: 'subscriberShare', label: 'Porcentaje de suscriptores', unit: '%', min: 0, max: 1, step: 0.01, kind: 'range' },
  { key: 'churn', label: 'Cancelación mensual', unit: '%', min: 0, max: 1, step: 0.01, kind: 'range' },
  { key: 'oneTimeOrders12', label: 'Pedidos sueltos en 12 meses', unit: 'pedidos', min: 0, max: 12, step: 0.05, kind: 'number' },
  { key: 'agencyFee', label: 'Fee de agencia', unit: 'USD', min: 0, max: 10000, step: 100, kind: 'number' },
  { key: 'discount', label: 'Descuento del primer pedido (Actual)', unit: '%', min: 0, max: 1, step: 0.01, kind: 'range' },
]);

const definitionByKey = new Map(LEVEL_TWO_CONTROLS.map((definition) => [definition.key, definition]));

export function getControlValue(state, key) {
  if (key === 'pricePerBag') return state.price / 2;
  if (key === 'subscriberShare') return 1 - state.oneTimeShare;
  if (key === 'oneTimeOrders12') return state.oneTimeOrdersByMonth.reduce((sum, value) => sum + value, 0);
  if (key === 'discount') return state.actualDiscount;
  return state[key];
}

export function applyFinancialControl(state, key, value) {
  const definition = definitionByKey.get(key);
  if (!definition) return { status: 'invalid', error: 'Control financiero desconocido.' };
  if (!Number.isFinite(value) || value < definition.min || value > definition.max) {
    return { status: 'invalid', error: `${definition.label}: use un valor entre ${definition.min} y ${definition.max}.` };
  }
  const next = { ...state };
  if (key === 'pricePerBag') next.price = value * 2;
  else if (key === 'subscriberShare') next.oneTimeShare = 1 - value;
  else if (key === 'oneTimeOrders12') {
    const currentTotal = state.oneTimeOrdersByMonth.reduce((sum, item) => sum + item, 0);
    const reference = currentTotal > 0 ? state.oneTimeOrdersByMonth : SIMULATION_DEFAULTS.oneTimeOrdersByMonth;
    const referenceTotal = reference.reduce((sum, item) => sum + item, 0);
    next.oneTimeOrdersByMonth = reference.map((item) => referenceTotal === 0 ? 0 : item * value / referenceTotal);
  } else if (key === 'discount') next.actualDiscount = value;
  else next[key] = value;
  return { status: 'ok', state: next };
}

export function getMarginalContext(spend, history, segments) {
  if (!Number.isFinite(spend) || spend < 0 || spend > 20000) return { status: 'not_applicable', selected: null, previous: null, next: null };
  const exactIndex = history.findIndex(([pointSpend]) => pointSpend === spend);
  if (exactIndex >= 0) {
    return {
      status: 'ok',
      selected: exactIndex > 0 ? segments[exactIndex - 1] : segments[0] ?? null,
      previous: exactIndex > 0 ? segments[exactIndex - 1] : null,
      next: exactIndex < segments.length ? segments[exactIndex] : null,
      atBreakpoint: true,
    };
  }
  const segmentIndex = history.findIndex(([pointSpend]) => pointSpend > spend) - 1;
  const selected = segments[Math.max(0, segmentIndex)] ?? null;
  return { status: selected ? 'ok' : 'not_applicable', selected, previous: selected, next: null, atBreakpoint: false };
}

export function getLtvCacSignal(ratio) {
  if (!Number.isFinite(ratio)) return { key: 'na', label: 'No aplicable', explanation: 'No hay CAC de Meta calculable para esta selección.' };
  if (ratio < 1) return { key: 'red', label: 'No recupera CAC', explanation: 'El LTV de contribución es menor que el costo de adquisición.' };
  if (ratio < 3) return { key: 'yellow', label: 'Recupera CAC con margen limitado', explanation: 'Supera 1:1, pero permanece por debajo del umbral 3:1.' };
  return { key: 'green', label: 'Supera el umbral 3:1', explanation: 'El LTV es al menos tres veces el CAC; no garantiza por sí solo rentabilidad empresarial.' };
}

export function buildLevelTwoView(model, scenarioKey = 'actual') {
  const scenario = model?.scenarios?.[scenarioKey];
  if (model?.status !== 'ok' || !scenario) return { status: 'invalid' };
  const marginal = getMarginalContext(scenario.advertisingSpend, model.state.acquisitionHistory, model.marginalCacSegments);
  return {
    status: 'ok',
    scenarioKey,
    scenario,
    marginal,
    signal: getLtvCacSignal(scenario.ltvCacRatio),
    indicators: {
      contribution: { amount: scenario.firstOrderContribution, rate: scenario.firstOrderMarginRate },
      breakEvenRoas: scenario.breakEvenRoas,
      cac: scenario.cac,
      ltv: scenario.ltv,
      ltvCacRatio: scenario.ltvCacRatio,
      paybackFirstWholeMonth: scenario.paybackFirstWholeMonth,
      paybackInterpolatedMonths: scenario.paybackInterpolatedMonths,
      roasFirstOrder: scenario.roasFirstOrder,
      marginalCac: marginal.selected?.value ?? null,
    },
    charts: {
      customerCash: Object.fromEntries(Object.entries(model.scenarios).map(([key, item]) => [key, item.customerSeries])),
      ltvCac: { cac: scenario.cac, ltv: scenario.ltv, references: [1, 3] },
      acquisition: { history: model.state.acquisitionHistory, segments: model.marginalCacSegments, selectedSpend: scenario.advertisingSpend, selectedCustomers: scenario.acquiredCustomers },
      roasTrap: { adsManagerHistorical: 3, firstOrder: scenario.roasFirstOrder, breakEven: scenario.breakEvenRoas },
    },
  };
}

