import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EXCEL_ORIGINAL,
  FINANCIAL_SOURCES,
  createEditableSimulation,
  createMysqlDemoContract,
} from './contracts.js';
import { calculateFinancialSnapshot } from './financialAdapter.js';

test('las tres fuentes financieras tienen identidades distintas', () => {
  assert.deepEqual(Object.values(FINANCIAL_SOURCES), ['EXCEL_ORIGINAL', 'SIMULACION_EDITABLE', 'MYSQL_DEMO']);
  assert.equal(EXCEL_ORIGINAL.source, FINANCIAL_SOURCES.EXCEL_ORIGINAL);
  assert.equal(createEditableSimulation().source, FINANCIAL_SOURCES.SIMULACION_EDITABLE);
  assert.equal(createMysqlDemoContract([], { database: 'demo' }).source, FINANCIAL_SOURCES.MYSQL_DEMO);
});

test('una simulación editable no muta los supuestos originales', () => {
  const simulation = createEditableSimulation({ pricePerBag: 20 });
  assert.equal(simulation.assumptions.pricePerBag, 20);
  assert.equal(EXCEL_ORIGINAL.assumptions.pricePerBag, 17);
  assert.equal(simulation.basedOn, FINANCIAL_SOURCES.EXCEL_ORIGINAL);
});

test('MYSQL_DEMO no se interpreta como supuestos del modelo Excel', () => {
  const demo = createMysqlDemoContract([{ campaigns: 10 }], { database: 'tueste_business_solutions_entrega' });
  const snapshot = calculateFinancialSnapshot(demo);
  assert.equal(snapshot.status, 'insufficient_data');
  assert.ok(snapshot.missing.includes('pricePerBag'));
  assert.deepEqual(demo.commercialData, [{ campaigns: 10 }]);
});

test('los datos faltantes permanecen pendientes y no se sustituyen por cero', () => {
  const snapshot = calculateFinancialSnapshot({
    source: FINANCIAL_SOURCES.SIMULACION_EDITABLE,
    label: 'Incompleta',
    assumptions: { pricePerBag: 17 },
  });
  assert.equal(snapshot.status, 'insufficient_data');
  assert.deepEqual(snapshot.metrics, {});
  assert.ok(snapshot.missing.includes('bagsPerOrder'));
});
