import test from 'node:test';
import assert from 'node:assert/strict';
import { SIMULATION_DEFAULTS } from './contracts.js';
import { calculateInteractiveModel } from './simulationModel.js';

const closeTo = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} no coincide con ${expected}`);

test('caso original: márgenes, CAC, ROAS, LTV y payback coinciden con el PDF', () => {
  const model = calculateInteractiveModel(SIMULATION_DEFAULTS);
  const actual = model.scenarios.actual;
  closeTo(model.contributionAmount, 15.89);
  closeTo(model.contributionMarginRate, 0.4673529411764706);
  closeTo(model.subscriptionContribution, 12.643);
  closeTo(model.subscriptionMarginRate, 0.4131699346405229);
  closeTo(model.discountedContribution, 6.149);
  closeTo(actual.cacAds, 48.484848484848484);
  closeTo(actual.cac, 54.54545454545455);
  closeTo(actual.roasFirstOrder, 0.70125);
  closeTo(model.breakEvenRoas, 2.1397105097545626);
  closeTo(model.subscriptionBreakEvenRoas, 2.420311634896781);
  closeTo(actual.oneTimeLtv, 47.67);
  closeTo(actual.subscriberLtv, 95.17713791810885);
  closeTo(actual.ltv, 54.796070687716345);
  closeTo(actual.ltvCacRatio, 1.0045946292747996);
  assert.equal(actual.paybackFirstWholeMonth, 12);
  closeTo(actual.paybackInterpolatedMonths, 11.92570687818569);
});

test('descuento 30% afecta solo el primer pedido suelto y no suscripciones ni clientes', () => {
  const model = calculateInteractiveModel(SIMULATION_DEFAULTS);
  const actual = model.scenarios.actual;
  const agency = model.scenarios.agency;
  closeTo(model.discountedContribution, 6.149);
  closeTo(agency.oneTimeLtv, actual.oneTimeLtv - (15.89 - 6.149));
  closeTo(agency.subscriberLtv, actual.subscriberLtv);
  assert.equal(agency.acquiredCustomers, 235);
  assert.equal(agency.paybackFirstWholeMonth, null);
  assert.equal(agency.paybackInterpolatedMonths, null);
});

test('CAC marginal cubre todos los tramos históricos y la comparación 8k a 16k', () => {
  const model = calculateInteractiveModel(SIMULATION_DEFAULTS);
  assert.deepEqual(model.marginalCacSegments.map((segment) => segment.value), [40, 61.53846153846154, 88.88888888888889, 160, 266.6666666666667]);
  closeTo(model.marginalCac8to16, 114.28571428571429);
});

for (const [adoption, expected] of [
  [0, { ltv: 71.3525045321143, ratio: 1.3081292497554287, payback: 8 }],
  [0.5, { ltv: 75.4707545321143, ratio: 1.3836304997554287, payback: 8 }],
  [1, { ltv: 79.5890045321143, ratio: 1.4591317497554288, payback: 7 }],
]) {
  test(`Pack con adopción ${adoption * 100}% respeta umbral de envío y recalcula LTV`, () => {
    const model = calculateInteractiveModel({ ...SIMULATION_DEFAULTS, packAdoption: adoption });
    const pack = model.scenarios.pack;
    closeTo(pack.ltv, expected.ltv);
    closeTo(pack.ltvCacRatio, expected.ratio);
    assert.equal(pack.paybackFirstWholeMonth, expected.payback);
    closeTo(pack.subscriberLtv, 129.05336354742866);
  });
}

test('los cambios A, B y combinado se calculan por separado desde la propuesta de agencia', () => {
  const model = calculateInteractiveModel(SIMULATION_DEFAULTS);
  const { baseline, changeA, changeB, combined } = model.proposedChanges;
  assert.equal(baseline.mode, 'agency');
  closeTo(changeA.scenario.cac, baseline.cac);
  assert.ok(changeA.scenario.ltv > baseline.ltv);
  closeTo(changeB.scenario.ltv, baseline.ltv);
  assert.ok(changeB.scenario.cac < baseline.cac);
  closeTo(combined.scenario.ltv, model.scenarios.pack.ltv);
  closeTo(combined.scenario.cac, model.scenarios.pack.cac);
  assert.ok(combined.scenario.ltvCacRatio > changeA.scenario.ltvCacRatio);
  assert.ok(combined.scenario.ltvCacRatio > changeB.scenario.ltvCacRatio);
});
