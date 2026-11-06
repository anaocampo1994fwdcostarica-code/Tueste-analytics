import test from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { SIMULATION_DEFAULTS } from './contracts.js';
import { createFinancialWorkbook } from './financialExport.js';
import { applyFinancialControl } from './levelTwoModel.js';
import { calculateInteractiveModel } from './simulationModel.js';

const closeTo = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance);

test('genera un xlsx real con las tres hojas y formato legible', async () => {
  const model = calculateInteractiveModel(SIMULATION_DEFAULTS);
  const workbook = createFinancialWorkbook(model, new Date('2026-11-06T12:00:00Z'));
  assert.deepEqual(workbook.worksheets.map((sheet) => sheet.name), ['Resumen ejecutivo', 'Flujo de caja', 'Supuestos del simulador']);
  assert.ok(workbook.getWorksheet('Flujo de caja').columns.every((column) => column.width >= 20));
  assert.equal(workbook.getWorksheet('Flujo de caja').views[0].state, 'frozen');
  assert.equal(workbook.getWorksheet('Flujo de caja').getCell('B6').numFmt, '$#,##0.00;[Red]-$#,##0.00');
  const buffer = await workbook.xlsx.writeBuffer();
  assert.equal(Buffer.from(buffer).subarray(0, 2).toString(), 'PK');
  const reloaded = new ExcelJS.Workbook();
  await reloaded.xlsx.load(buffer);
  assert.equal(reloaded.worksheets.length, 3);
  const paybackRow = reloaded.getWorksheet('Resumen ejecutivo').getColumn(1).values.findIndex((value) => value === 'Payback · primer mes entero');
  assert.equal(reloaded.getWorksheet('Resumen ejecutivo').getCell(paybackRow, 3).value, 'No recuperado en 12 meses');
});

test('el flujo exportado coincide con los tres escenarios y el mes 12 del motor', () => {
  const model = calculateInteractiveModel(SIMULATION_DEFAULTS);
  const sheet = createFinancialWorkbook(model).getWorksheet('Flujo de caja');
  closeTo(sheet.getCell('B18').value, model.scenarios.actual.finalCash);
  closeTo(sheet.getCell('C18').value, model.scenarios.agency.finalCash);
  closeTo(sheet.getCell('D18').value, model.scenarios.pack.finalCash);
  closeTo(sheet.getCell('B19').value, model.scenarios.actual.finalCash);
});

test('exporta el supuesto editado y sus resultados recalculados sin usar cifras fijas', () => {
  const editedState = { ...SIMULATION_DEFAULTS, initialCash: 40000 };
  const model = calculateInteractiveModel(editedState);
  const workbook = createFinancialWorkbook(model);
  const cash = workbook.getWorksheet('Flujo de caja');
  const inputs = workbook.getWorksheet('Supuestos del simulador');
  assert.equal(cash.getCell('B6').value, 40000);
  closeTo(cash.getCell('B18').value, 37715.23018943266);
  const initialCashRow = inputs.getColumn(1).values.findIndex((value) => value === 'Caja inicial');
  assert.equal(inputs.getCell(initialCashRow, 2).value, 40000);
});

test('exporta los controles del Nivel 2 con sus unidades y valores vigentes', () => {
  let state = applyFinancialControl(SIMULATION_DEFAULTS, 'pricePerBag', 18).state;
  state = applyFinancialControl(state, 'subscriberShare', 0.25).state;
  state = applyFinancialControl(state, 'oneTimeOrders12', 4).state;
  const inputs = createFinancialWorkbook(calculateInteractiveModel(state)).getWorksheet('Supuestos del simulador');
  const rowFor = (label) => inputs.getColumn(1).values.findIndex((value) => value === label);
  assert.equal(inputs.getCell(rowFor('Precio por bolsa'), 2).value, 18);
  assert.equal(inputs.getCell(rowFor('Participación de suscriptores'), 2).value, 0.25);
  closeTo(inputs.getCell(rowFor('Pedidos sueltos en 12 meses'), 2).value, 4);
});

