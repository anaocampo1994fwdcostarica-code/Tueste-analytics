import test from 'node:test';
import assert from 'node:assert/strict';
import { SIMULATION_DEFAULTS } from './contracts.js';
import { calculateInteractiveModel, interpolateAcquiredCustomers } from './simulationModel.js';

const closeTo = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} no coincide con ${expected}`);

test('la simulación base conserva Actual y aplica las reglas corregidas de Agencia y Pack', () => {
  const model = calculateInteractiveModel(SIMULATION_DEFAULTS);
  assert.equal(model.status, 'ok');
  closeTo(model.scenarios.actual.finalCash, 32715.23018943266);
  closeTo(model.scenarios.agency.finalCash, -60970.02893620655);
  closeTo(model.scenarios.pack.finalCash, 74403.2457420854);
  closeTo(model.scenarios.actual.minimumCash, 24447.5098798131);
  closeTo(model.scenarios.pack.minimumCash, 32467.475534000005);
  assert.deepEqual([model.scenarios.actual.belowFloorMonths, model.scenarios.agency.belowFloorMonths, model.scenarios.pack.belowFloorMonths], [0, 10, 0]);
  assert.equal(model.scenarios.actual.paybackFirstWholeMonth, 12);
  closeTo(model.contributionMarginRate, 0.4673529411764705);
});

test('la interpolación histórica no extrapola clientes por encima de USD 20.000', () => {
  assert.equal(interpolateAcquiredCustomers(8000, SIMULATION_DEFAULTS.acquisitionHistory), 165);
  assert.equal(interpolateAcquiredCustomers(10000, SIMULATION_DEFAULTS.acquisitionHistory), 187.5);
  assert.equal(interpolateAcquiredCustomers(25000, SIMULATION_DEFAULTS.acquisitionHistory), 250);
});

test('cambiar un supuesto recalcula resultados sin mutar los valores originales', () => {
  const edited = { ...SIMULATION_DEFAULTS, initialCash: 40000 };
  const model = calculateInteractiveModel(edited);
  closeTo(model.scenarios.actual.finalCash, 37715.23018943266);
  assert.equal(SIMULATION_DEFAULTS.initialCash, 35000);
});

test('las series financieras contienen el valor inicial y doce meses calculados', () => {
  const model = calculateInteractiveModel(SIMULATION_DEFAULTS);
  for (const scenario of Object.values(model.scenarios)) {
    assert.equal(scenario.cashSeries.length, 13);
    assert.equal(scenario.customerSeries.length, 13);
    assert.ok(scenario.cashSeries.every(Number.isFinite));
    assert.ok(scenario.customerSeries.every(Number.isFinite));
  }
});
