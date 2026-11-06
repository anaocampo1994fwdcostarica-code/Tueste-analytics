import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBreakEvenRoas,
  calculateCac,
  calculateContributionMargin,
  calculateContributionMarginRate,
  calculateLtv12Months,
  calculateLtvCacRatio,
  calculateMonthlyCashFlow,
  calculateMarginalCac,
  calculatePayback,
  calculateRoas,
  compareScenarios,
} from './financialEngine.js';

// Todos los valores de este archivo son sinteticos y no representan el caso Tueste.
test('calcula margen de contribucion por pedido', () => {
  const result = calculateContributionMargin({
    sellingPrice: 100,
    productVariableCosts: [20, 10],
    shippingCost: 5,
    paymentFeePercent: 0.03,
    paymentFeeFixed: 1,
    otherOrderCost: 2,
  });
  assert.deepEqual(result, { status: 'ok', value: { amount: 59, variableCost: 41, productCost: 30, paymentFee: 4 } });
});

test('calcula porcentaje de margen', () => {
  assert.deepEqual(calculateContributionMarginRate({ contributionMargin: 59, revenue: 100 }), { status: 'ok', value: 0.59 });
});

test('calcula CAC incluyendo honorarios', () => {
  assert.deepEqual(calculateCac({ advertisingSpend: 8000, agencyFees: 2000, acquiredCustomers: 100 }), { status: 'ok', value: 100 });
});

test('calcula CAC marginal publicitario sin confundirlo con CAC promedio o fee fijo', () => {
  assert.deepEqual(calculateMarginalCac({ fromSpend: 8000, toSpend: 12000, fromCustomers: 165, toCustomers: 210 }), { status: 'ok', value: 88.88888888888889 });
  assert.deepEqual(calculateMarginalCac({ fromSpend: 8000, toSpend: 16000, fromCustomers: 165, toCustomers: 235 }), { status: 'ok', value: 114.28571428571429 });
});

test('calcula ROAS y ROAS de equilibrio', () => {
  assert.deepEqual(calculateRoas({ attributedRevenue: 30000, advertisingSpend: 10000 }), { status: 'ok', value: 3 });
  assert.deepEqual(calculateBreakEvenRoas({ contributionMarginRate: 0.4 }), { status: 'ok', value: 2.5 });
});

test('calcula LTV de 12 meses y relacion LTV/CAC', () => {
  const months = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    repurchaseProbability: 0.1,
    quantity: 1,
    contributionMargin: 20,
  }));
  const ltv = calculateLtv12Months({ initialContributionMargin: 20, months });
  assert.equal(ltv.status, 'ok');
  assert.equal(ltv.value.ltv, 44);
  assert.deepEqual(calculateLtvCacRatio({ ltv: 400, cac: 100 }), { status: 'ok', value: 4 });
});

test('calcula payback fraccional', () => {
  const result = calculatePayback({ cac: 100, monthlyContributionMargins: [30, 30, 50] });
  assert.equal(result.status, 'ok');
  assert.equal(result.value.months, 2.8);
});

test('informa cuando el payback no se recupera en el horizonte', () => {
  const result = calculatePayback({ cac: 100, monthlyContributionMargins: [20, 20] });
  assert.deepEqual(result, { status: 'not_recovered', value: { months: null, cumulativeContribution: 40 } });
});

test('proyecta flujo de caja mensual', () => {
  const result = calculateMonthlyCashFlow({
    initialCash: 1000,
    months: [
      { month: 1, revenue: 500, variableCosts: 100, fixedCosts: 200, advertisingSpend: 50, otherInflows: 0, otherOutflows: 0 },
      { month: 2, revenue: 300, variableCosts: 100, fixedCosts: 200, advertisingSpend: 50, otherInflows: 25, otherOutflows: 0 },
    ],
  });
  assert.equal(result.status, 'ok');
  assert.equal(result.value.months[0].netCashFlow, 150);
  assert.equal(result.value.endingCash, 1125);
});

test('compara escenarios por cada metrica', () => {
  const result = compareScenarios({
    scenarios: [
      { name: 'Sintetico A', metrics: { roas: 2, endingCash: 100 } },
      { name: 'Sintetico B', metrics: { roas: 3, endingCash: 80 } },
      { name: 'Sintetico C', metrics: { roas: 1, endingCash: 120 } },
    ],
    metricKeys: ['roas', 'endingCash'],
  });
  assert.equal(result.status, 'ok');
  assert.equal(result.value.rankings.roas[0].name, 'Sintetico B');
  assert.equal(result.value.rankings.endingCash[0].name, 'Sintetico C');
});

test('devuelve datos insuficientes sin asumir valores faltantes', () => {
  assert.deepEqual(calculateCac({ advertisingSpend: 8000, acquiredCustomers: 100 }), {
    status: 'insufficient_data',
    missing: ['agencyFees'],
  });
  const ltv = calculateLtv12Months({ initialContributionMargin: 20, months: [] });
  assert.equal(ltv.status, 'insufficient_data');
  assert.equal(ltv.missing.length, 12);
});
