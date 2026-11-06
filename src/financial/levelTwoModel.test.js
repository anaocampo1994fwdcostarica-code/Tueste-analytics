import test from 'node:test';
import assert from 'node:assert/strict';
import { SIMULATION_DEFAULTS } from './contracts.js';
import { calculateInteractiveModel, interpolateAcquiredCustomers } from './simulationModel.js';
import { applyFinancialControl, buildLevelTwoView, getControlValue, getLtvCacSignal, getMarginalContext, LEVEL_TWO_CONTROLS } from './levelTwoModel.js';

const closeTo = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} no coincide con ${expected}`);

test('los nueve controles obligatorios están definidos y aceptan sus valores originales', () => {
  assert.equal(LEVEL_TWO_CONTROLS.length, 9);
  let state = { ...SIMULATION_DEFAULTS };
  for (const definition of LEVEL_TWO_CONTROLS) {
    const result = applyFinancialControl(state, definition.key, getControlValue(state, definition.key));
    assert.equal(result.status, 'ok', definition.key);
    state = result.state;
  }
  assert.equal(calculateInteractiveModel(state).status, 'ok');
});

test('precio por bolsa y porcentaje de suscriptores recalculan indicadores', () => {
  const price = applyFinancialControl(SIMULATION_DEFAULTS, 'pricePerBag', 18).state;
  assert.equal(price.price, 36);
  assert.ok(calculateInteractiveModel(price).contributionAmount > 15.89);
  const mix = applyFinancialControl(SIMULATION_DEFAULTS, 'subscriberShare', 0.25).state;
  assert.equal(mix.oneTimeShare, 0.75);
  assert.notEqual(calculateInteractiveModel(mix).scenarios.actual.ltv, calculateInteractiveModel(SIMULATION_DEFAULTS).scenarios.actual.ltv);
});

test('cada control obligatorio conserva el valor editado y produce un modelo válido', () => {
  const samples = { metaActual: 9000, pricePerBag: 18, bagCost: 6, shipping: 5, subscriberShare: 0.2, churn: 0.1, oneTimeOrders12: 4, agencyFee: 1500, discount: 0.1 };
  for (const [key, value] of Object.entries(samples)) {
    const result = applyFinancialControl(SIMULATION_DEFAULTS, key, value);
    assert.equal(result.status, 'ok', key);
    closeTo(getControlValue(result.state, key), value);
    assert.equal(calculateInteractiveModel(result.state).status, 'ok', key);
  }
});

test('cambiar pedidos preserva la forma mensual y ajusta exactamente el total', () => {
  const result = applyFinancialControl(SIMULATION_DEFAULTS, 'oneTimeOrders12', 4);
  closeTo(result.state.oneTimeOrdersByMonth.reduce((sum, value) => sum + value, 0), 4);
  closeTo(result.state.oneTimeOrdersByMonth[0] / result.state.oneTimeOrdersByMonth[1], 1 / 0.15);
});

test('rechaza valores inválidos y porcentajes fuera de 0 a 100%', () => {
  assert.equal(applyFinancialControl(SIMULATION_DEFAULTS, 'bagCost', -1).status, 'invalid');
  assert.equal(applyFinancialControl(SIMULATION_DEFAULTS, 'subscriberShare', 1.01).status, 'invalid');
  assert.equal(applyFinancialControl(SIMULATION_DEFAULTS, 'metaActual', 20001).status, 'invalid');
});

test('interpolación Meta cubre cero, máximo e intermedios sin NaN', () => {
  const history = SIMULATION_DEFAULTS.acquisitionHistory;
  assert.equal(interpolateAcquiredCustomers(0, history), 0);
  assert.equal(interpolateAcquiredCustomers(20000, history), 250);
  assert.equal(interpolateAcquiredCustomers(10000, history), 187.5);
  const zero = calculateInteractiveModel({ ...SIMULATION_DEFAULTS, metaActual: 0 });
  assert.equal(zero.status, 'ok');
  assert.equal(zero.scenarios.actual.acquiredCustomers, 0);
  assert.equal(zero.scenarios.actual.cac, null);
  assert.equal(zero.scenarios.actual.roasFirstOrder, null);
  assert.ok(JSON.stringify(zero).includes('Infinity') === false);
  assert.ok(JSON.stringify(zero).includes('NaN') === false);
});

test('CAC marginal en punto de quiebre expone tramo anterior y siguiente', () => {
  const model = calculateInteractiveModel(SIMULATION_DEFAULTS);
  const context = getMarginalContext(8000, model.state.acquisitionHistory, model.marginalCacSegments);
  assert.equal(context.atBreakpoint, true);
  closeTo(context.previous.value, 61.53846153846154);
  closeTo(context.next.value, 88.88888888888889);
});

test('semáforo cumple exactamente rojo, amarillo y verde', () => {
  assert.equal(getLtvCacSignal(0.99).key, 'red');
  assert.equal(getLtvCacSignal(1).key, 'yellow');
  assert.equal(getLtvCacSignal(2.99).key, 'yellow');
  assert.equal(getLtvCacSignal(3).key, 'green');
  assert.equal(getLtvCacSignal(null).key, 'na');
});

test('vista de Nivel 2 conserva los ocho indicadores y referencias marginales', () => {
  const view = buildLevelTwoView(calculateInteractiveModel(SIMULATION_DEFAULTS), 'actual');
  assert.equal(Object.keys(view.indicators).length, 9); // payback entero e interpolado comparten una tarjeta.
  closeTo(view.indicators.roasFirstOrder, 0.70125);
  assert.equal(view.indicators.paybackFirstWholeMonth, 12);
  assert.equal(view.signal.key, 'yellow');
});

test('datos de los cuatro gráficos representan curvas, referencias, historial y ROAS', () => {
  const model = calculateInteractiveModel(SIMULATION_DEFAULTS);
  const charts = buildLevelTwoView(model, 'actual').charts;
  assert.deepEqual(Object.keys(charts.customerCash), ['actual', 'agency', 'pack']);
  assert.equal(charts.customerCash.actual.length, 13);
  closeTo(charts.customerCash.actual[0], -model.scenarios.actual.cac);
  assert.deepEqual(charts.ltvCac.references, [1, 3]);
  assert.deepEqual(charts.acquisition.history, [[0, 0], [4000, 100], [8000, 165], [12000, 210], [16000, 235], [20000, 250]]);
  assert.equal(charts.acquisition.segments.length, 5);
  closeTo(charts.roasTrap.adsManagerHistorical, 3);
  closeTo(charts.roasTrap.firstOrder, 0.70125);
  closeTo(charts.roasTrap.breakEven, model.scenarios.actual.breakEvenRoas);
});

test('restaurar utiliza una copia íntegra de los valores originales', () => {
  const edited = applyFinancialControl(SIMULATION_DEFAULTS, 'shipping', 8).state;
  assert.notEqual(edited.shipping, SIMULATION_DEFAULTS.shipping);
  const restored = { ...SIMULATION_DEFAULTS, oneTimeOrdersByMonth: [...SIMULATION_DEFAULTS.oneTimeOrdersByMonth] };
  assert.equal(restored.shipping, 4.5);
  closeTo(getControlValue(restored, 'oneTimeOrders12'), 3);
});
