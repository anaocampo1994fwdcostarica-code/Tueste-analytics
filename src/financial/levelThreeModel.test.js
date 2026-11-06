import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEVEL_THREE_MONTHS,
  INVESTMENT_MIN,
  INVESTMENT_MAX,
  LEVEL_THREE_DEFAULTS,
  createDefaultPlans,
  calculateLevelThreeUnitEconomics,
  ordersForCohortAge,
  simulateLevelThreePlan,
  simulateFourPlans,
  rankValidPlans,
  verifyManualMonthOne,
  findBestPlan,
  createInvestmentPitch,
  updatePlanInvestment,
  applyInvestmentRange,
} from './levelThreeModel.js';
import { createLevelThreeWorkbook, createFinancialWorkbook } from './financialExport.js';
import { calculateInteractiveModel } from './simulationModel.js';

const closeTo = (actual, expected, tolerance = 1e-6) => {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Esperaba ${expected} pero se obtuvo ${actual} (diferencia: ${Math.abs(actual - expected)})`
  );
};

test('horizonte de 24 meses y parámetros base definidos', () => {
  assert.equal(LEVEL_THREE_MONTHS, 24);
  assert.equal(INVESTMENT_MIN, 0);
  assert.equal(INVESTMENT_MAX, 20000);
  assert.equal(LEVEL_THREE_DEFAULTS.months, 24);
  assert.equal(LEVEL_THREE_DEFAULTS.initialCash, 35000);
  assert.equal(LEVEL_THREE_DEFAULTS.safetyFloor, 5000);
  assert.equal(LEVEL_THREE_DEFAULTS.fixedCosts, 6500);
  assert.equal(LEVEL_THREE_DEFAULTS.agencyFee, 1000);
});

test('economía unitaria de nivel 3: estándar, suscripción y pack', () => {
  const units = calculateLevelThreeUnitEconomics(LEVEL_THREE_DEFAULTS);
  closeTo(units.standard, 15.89);
  closeTo(units.subscription, 12.643);
  closeTo(units.pack, 23.62);
});

test('distribución de pedidos por edad de cohorte: meses 1 a 12 y meses 13 a 24', () => {
  const distribution = LEVEL_THREE_DEFAULTS.oneTimeOrdersByMonth;
  for (let age = 0; age < 12; age += 1) {
    assert.equal(ordersForCohortAge(age, distribution), distribution[age]);
  }
  for (let age = 12; age < 24; age += 1) {
    assert.equal(ordersForCohortAge(age, distribution), 0.10);
  }
  assert.equal(ordersForCohortAge(-1), 0);
  assert.equal(ordersForCohortAge(24), 0);
});

test('retención de suscriptores decae según churn mensual del 9%', () => {
  const plan = createDefaultPlans()[0];
  const result = simulateLevelThreePlan(plan);
  assert.equal(result.status, 'ok');
  const rowMonth1 = result.rows[0];
  const rowMonth2 = result.rows[1];
  closeTo(rowMonth1.activeSubscribers, 31.8);
  closeTo(rowMonth2.activeSubscribers, 31.8 * 0.91 + 31.8);
});

test('caja mensual: fórmula exacta y transición mes a mes', () => {
  const plan = createDefaultPlans()[0];
  const result = simulateLevelThreePlan(plan);
  assert.equal(result.rows.length, 24);
  assert.equal(result.cashSeries.length, 25);
  assert.equal(result.cashSeries[0], 35000);

  for (let index = 0; index < 24; index += 1) {
    const row = result.rows[index];
    const prevCash = index === 0 ? 35000 : result.rows[index - 1].endingCash;
    closeTo(row.openingCash, prevCash);
    const expectedEnding = row.openingCash + row.existingContribution + row.cohortContribution - row.totalOutflows;
    closeTo(row.endingCash, expectedEnding);
    closeTo(result.cashSeries[index + 1], row.endingCash);
  }
});

test('restricción de piso de caja (USD 5.000): detecta meses bajo piso sin alterar caja', () => {
  const plans = createDefaultPlans();
  const agencyPlan = plans.find((p) => p.id === 'agency');
  const result = simulateLevelThreePlan(agencyPlan);
  assert.equal(result.status, 'ok');
  assert.equal(result.valid, false);
  assert.ok(result.violations.floor.length > 0);
  assert.ok(result.violations.floor.includes(3));
  closeTo(result.finalCash, -82255.19, 0.5);
  closeTo(result.minimumCash, -82255.19, 0.5);
  assert.equal(result.minimumCashMonth, 24);
});

test('restricción de presupuesto: rechaza inversiones fuera del rango 0 a 20.000', () => {
  let plan = createDefaultPlans()[0];
  plan = updatePlanInvestment(plan, 5, 25000);
  const resultHigh = simulateLevelThreePlan(plan);
  assert.equal(resultHigh.valid, false);
  assert.deepEqual(resultHigh.violations.budget, [5]);

  plan = updatePlanInvestment(plan, 5, -500);
  const resultLow = simulateLevelThreePlan(plan);
  assert.equal(resultLow.valid, false);
  assert.deepEqual(resultLow.violations.budget, [5]);
});

test('restricción de inversión desde mes 13: debe ser >= al promedio de meses 1 a 12', () => {
  let plan = createDefaultPlans()[0]; // 8000 todos los meses
  // Reducir mes 15 a 7000 (menor a promedio 8000)
  plan = updatePlanInvestment(plan, 15, 7000);
  const result = simulateLevelThreePlan(plan);
  assert.equal(result.valid, false);
  assert.deepEqual(result.violations.postMonth12, [15]);
  assert.equal(result.averageFirst12Investment, 8000);
});

test('cuatro planes obligatorios: simulación comparativa de 24 meses', () => {
  const { results, ranking } = simulateFourPlans();
  assert.equal(results.length, 4);
  const [actual, agency, ownA, ownB] = results;

  assert.equal(actual.plan.id, 'actual');
  assert.equal(actual.valid, true);
  closeTo(actual.finalCash, 79596.45, 0.5);
  closeTo(actual.minimumCash, 24447.51, 0.5);
  assert.equal(actual.minimumCashMonth, 6);
  closeTo(actual.activeSubscribersMonth24, 316.6, 0.5);

  assert.equal(agency.plan.id, 'agency');
  assert.equal(agency.valid, false);
  assert.ok(agency.violations.floor.length >= 20);

  assert.equal(ownA.plan.id, 'ownA');
  assert.equal(ownA.valid, true);
  closeTo(ownA.finalCash, 197862.99, 0.5);

  assert.equal(ownB.plan.id, 'ownB');
  assert.equal(ownB.valid, true);
  closeTo(ownB.finalCash, 174553.88, 0.5);

  assert.equal(ranking.length, 3);
  assert.equal(ranking[0].plan.id, 'ownA');
});

test('verificación manual obligatoria del mes 1 coincide al 100% con el motor', () => {
  const verification = verifyManualMonthOne();
  assert.equal(verification.matchesEngine, true);
  assert.equal(verification.difference, 0);
  assert.equal(verification.metaCustomers, 165);
  assert.equal(verification.organicCustomers, 47);
  assert.equal(verification.totalNewCustomers, 212);
  closeTo(verification.oneTimeCustomers, 180.2);
  closeTo(verification.subscribers, 31.8);
  closeTo(verification.oneTimeUnitContribution, 15.89);
  closeTo(verification.subscriptionUnitContribution, 12.643);
  closeTo(verification.oneTimeContributionTotal, 2863.378);
  closeTo(verification.subscriptionContributionTotal, 402.0474);
  closeTo(verification.cohortContribution, 3265.4254);
  assert.equal(verification.existingContribution, 9000);
  assert.equal(verification.investment, 8000);
  assert.equal(verification.agencyFee, 1000);
  assert.equal(verification.fixedCosts, 6500);
  assert.equal(verification.totalOutflows, 15500);
  assert.equal(verification.openingCash, 35000);
  closeTo(verification.endingCash, 31765.4254);
  closeTo(verification.engineEndingCash, 31765.4254);
  assert.equal(verification.steps.length, 8);
});

test('optimización: búsqueda reproducible del mejor plan válido', () => {
  const search = findBestPlan(LEVEL_THREE_DEFAULTS, 2000);
  assert.equal(search.exact, false);
  assert.ok(search.evaluatedCount > 0);
  assert.ok(search.feasibleCount > 0);
  assert.ok(search.best !== null);
  assert.equal(search.best.valid, true);
  assert.ok(search.best.finalCash >= 197862);
  assert.ok(search.best.minimumCash >= 5000);
});

test('pitch de inversión estructurado de dos minutos', () => {
  const actualResult = simulateLevelThreePlan(createDefaultPlans()[0]);
  const pitch = createInvestmentPitch(actualResult);
  assert.ok(pitch.includes('USD 8000.00'));
  assert.ok(pitch.includes('USD 79596.45'));
  assert.ok(pitch.includes('316.6'));
  assert.ok(pitch.includes('USD 24447.51'));
  assert.ok(pitch.includes('mes 6'));
  assert.ok(pitch.includes('riesgo'));
  assert.ok(pitch.includes('piso'));
});

test('modificación de inversiones de plan: puntual y por rango', () => {
  let plan = createDefaultPlans()[2]; // ownA
  plan = updatePlanInvestment(plan, 3, 10000);
  assert.equal(plan.investments[2], 10000);

  plan = applyInvestmentRange(plan, 13, 24, 12000);
  for (let m = 13; m <= 24; m += 1) {
    assert.equal(plan.investments[m - 1], 12000);
  }
});

test('exportación excel de nivel 3: genera hojas de 4 planes, flujo 24m y verificación manual', async () => {
  const fourPlans = simulateFourPlans();
  const manualCheck = verifyManualMonthOne();
  const best = findBestPlan();
  const workbook = createLevelThreeWorkbook(fourPlans, manualCheck, best);

  assert.deepEqual(workbook.worksheets.map((s) => s.name), [
    'Nivel 3 · Comparación 4 planes',
    'Nivel 3 · Flujo 24 meses',
    'Nivel 3 · Verificación mes 1',
  ]);

  const flowSheet = workbook.getWorksheet('Nivel 3 · Flujo 24 meses');
  assert.equal(flowSheet.getCell('B5').value, 35000); // Mes 0 inicial
  closeTo(flowSheet.getCell('B29').value, fourPlans.results[0].finalCash); // Mes 24

  const auditSheet = workbook.getWorksheet('Nivel 3 · Verificación mes 1');
  assert.equal(auditSheet.rowCount >= 10, true);

  // Exportación combinada de 6 hojas
  const baseModel = calculateInteractiveModel(LEVEL_THREE_DEFAULTS);
  const combinedWorkbook = createFinancialWorkbook(baseModel, new Date(), {
    includeLevelThree: true,
    fourPlansData: fourPlans,
    manualCheckData: manualCheck,
    bestPlanData: best,
  });
  assert.equal(combinedWorkbook.worksheets.length, 6);
});
