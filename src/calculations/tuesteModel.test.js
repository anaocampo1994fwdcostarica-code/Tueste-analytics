import test from 'node:test';
import assert from 'node:assert/strict';
import { createFinancialViewModel } from './tuesteModel.js';
import { scenarioReferences } from './scenarioReferences.js';

test('no presenta resultados reales cuando la API no tiene datos', () => {
  const model = createFinancialViewModel({ scenarios: [], acquisitionHistory: [] });
  assert.equal(model.hasRealResults, false);
  assert.equal(model.metrics.roas.status, 'insufficient_data');
  assert.equal(model.metrics.cashFlow.status, 'insufficient_data');
  assert.equal(model.comparison.status, 'insufficient_data');
});

test('conserva las referencias del caso como pendientes de validacion', () => {
  assert.deepEqual(scenarioReferences.map(({ code, monthlyAdvertisingSpend }) => [code, monthlyAdvertisingSpend]), [
    ['A', 8000],
    ['B', 16000],
    ['C', 8000],
  ]);
  assert.equal(scenarioReferences[1].introductoryDiscountRate, 0.30);
  assert.equal(scenarioReferences[2].packageQuantity, 3);
  assert.equal(scenarioReferences[2].packagePrice, 48);
  assert.ok(scenarioReferences.every((scenario) => scenario.validationStatus === 'pending_academic_validation'));
});
