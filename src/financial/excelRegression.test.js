import test from 'node:test';
import assert from 'node:assert/strict';
import { EXCEL_ORIGINAL } from './contracts.js';
import { calculateFinancialSnapshot } from './financialAdapter.js';

const closeTo = (actual, expected, tolerance = 1e-10) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} no coincide con ${expected}`);
};
const valueOf = (result, selector = (value) => value) => {
  assert.equal(result.status, 'ok');
  return selector(result.value);
};

test('regresión: contribución, margen y ROAS de equilibrio coinciden con Resultados del Excel', () => {
  const snapshot = calculateFinancialSnapshot(EXCEL_ORIGINAL);
  closeTo(valueOf(snapshot.metrics.contributionMargin, (value) => value.amount), EXCEL_ORIGINAL.verifiedResults.contributionMargin);
  closeTo(valueOf(snapshot.metrics.contributionMarginRate), EXCEL_ORIGINAL.verifiedResults.contributionMarginRate);
  closeTo(valueOf(snapshot.metrics.breakEvenRoas), EXCEL_ORIGINAL.verifiedResults.breakEvenRoas);
});

test('regresión: CAC y ROAS coinciden con Resultados del Excel', () => {
  const snapshot = calculateFinancialSnapshot(EXCEL_ORIGINAL);
  closeTo(valueOf(snapshot.metrics.cac), EXCEL_ORIGINAL.verifiedResults.cac);
  closeTo(valueOf(snapshot.metrics.roas), EXCEL_ORIGINAL.verifiedResults.roas);
});

test('regresión: LTV y LTV/CAC coinciden con Resultados del Excel', () => {
  const snapshot = calculateFinancialSnapshot(EXCEL_ORIGINAL);
  closeTo(valueOf(snapshot.metrics.ltv12Months, (value) => value.ltv), EXCEL_ORIGINAL.verifiedResults.ltv12Months);
  closeTo(valueOf(snapshot.metrics.ltvCacRatio), EXCEL_ORIGINAL.verifiedResults.ltvCacRatio);
});

test('payback conserva por separado el mes entero de Excel y la interpolación del motor', () => {
  const snapshot = calculateFinancialSnapshot(EXCEL_ORIGINAL);
  assert.equal(valueOf(snapshot.metrics.paybackFirstWholeMonth, (value) => value.month), EXCEL_ORIGINAL.verifiedResults.paybackFirstWholeMonth);
  closeTo(valueOf(snapshot.metrics.paybackInterpolated, (value) => value.months), EXCEL_ORIGINAL.verifiedResults.paybackInterpolatedMonths);
});
