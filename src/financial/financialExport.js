import ExcelJS from 'exceljs';
import {
  LEVEL_THREE_DEFAULTS,
  simulateFourPlans,
  verifyManualMonthOne,
  findBestPlan,
  createInvestmentPitch,
} from './levelThreeModel.js';

const COLORS = Object.freeze({
  green: 'FF174738',
  greenSoft: 'FFE8F1EB',
  cream: 'FFF6F4EF',
  white: 'FFFFFFFF',
  ink: 'FF1E3029',
  muted: 'FF69786F',
  red: 'FFB33A32',
  border: 'FFD9E2DB',
});

const MONEY_FORMAT = '$#,##0.00;[Red]-$#,##0.00';
const NUMBER_FORMAT = '#,##0.00';
const RATIO_FORMAT = '0.00x';
const PERCENT_FORMAT = '0.00%';
const scenarioLabels = { actual: 'Actual', agency: 'Agencia', pack: 'Pack' };

const assumptions = [
  ['metaActual', 'Inversión Meta actual', 'USD', 'Inversión publicitaria mensual del escenario Actual'],
  ['metaAgency', 'Inversión Meta agencia', 'USD', 'Inversión publicitaria mensual del escenario Agencia'],
  ['pricePerBag', 'Precio por bolsa', 'USD', 'Precio unitario; el pedido estándar contiene dos bolsas', (state) => state.price / 2],
  ['actualDiscount', 'Descuento primer pedido Actual', '%', 'Descuento editable del primer pedido del escenario Actual'],
  ['discount', 'Descuento de agencia', '%', 'Descuento aplicado en el escenario Agencia'],
  ['packPrice', 'Precio pack de 3 bolsas', 'USD', 'Precio de venta del pack'],
  ['packAdoption', 'Adopción del pack', '%', 'Proporción de clientes que adopta el pack'],
  ['freeShippingThreshold', 'Umbral de envío gratuito', 'USD', 'Tueste paga el envío desde este importe; debajo, lo paga el cliente'],
  ['churn', 'Churn de suscripción', '% mensual', 'Tasa mensual de cancelación de suscripciones'],
  ['fixedCosts', 'Costos fijos mensuales', 'USD', 'Costos fijos incluidos en la proyección'],
  ['existingContribution', 'Contribución existente del mes 1', 'USD', 'Contribución inicial de clientes existentes'],
  ['organicCustomers', 'Clientes orgánicos por mes', 'clientes', 'Nuevos clientes mensuales sin inversión Meta'],
  ['initialCash', 'Caja inicial', 'USD', 'Saldo de caja al iniciar la proyección'],
  ['safetyFloor', 'Piso de seguridad', 'USD', 'Saldo mínimo de referencia'],
  ['bagCost', 'Costo por bolsa', 'USD', 'Costo variable del producto por bolsa'],
  ['shipping', 'Costo de envío', 'USD', 'Costo de envío por pedido aplicable'],
  ['paymentFeePercent', 'Comisión de pago', '%', 'Comisión variable del medio de pago'],
  ['packaging', 'Empaque pedido estándar', 'USD', 'Costo de empaque del pedido de 2 bolsas'],
  ['packPackaging', 'Empaque del pack', 'USD', 'Costo de empaque del pack de 3 bolsas'],
  ['subscriptionPrice', 'Precio de suscripción', 'USD', 'Precio periódico utilizado por el modelo'],
  ['agencyFee', 'Honorarios de agencia', 'USD', 'Honorarios mensuales incluidos en CAC y caja'],
  ['existingDecay', 'Caída de contribución existente', '% mensual', 'Reducción mensual de la contribución existente'],
  ['subscriberShare', 'Participación de suscriptores', '%', 'Complemento de la proporción de clientes de compra única', (state) => 1 - state.oneTimeShare],
  ['oneTimeOrders12', 'Pedidos sueltos en 12 meses', 'pedidos', 'Suma de la distribución mensual vigente', (state) => state.oneTimeOrdersByMonth.reduce((sum, value) => sum + value, 0)],
];

function styleTitle(sheet, range, title) {
  sheet.mergeCells(range);
  const cell = sheet.getCell(range.split(':')[0]);
  cell.value = title;
  cell.font = { name: 'Aptos Display', size: 18, bold: true, color: { argb: COLORS.white } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.green } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
}

function styleHeader(row) {
  row.height = 24;
  row.eachCell((cell) => {
    cell.font = { name: 'Aptos', size: 11, bold: true, color: { argb: COLORS.white } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.green } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = { bottom: { style: 'thin', color: { argb: COLORS.border } } };
  });
}

function addBorders(row) {
  row.eachCell((cell) => {
    cell.border = {
      bottom: { style: 'hair', color: { argb: COLORS.border } },
      left: { style: 'hair', color: { argb: COLORS.border } },
      right: { style: 'hair', color: { argb: COLORS.border } },
    };
    cell.alignment = { vertical: 'middle', wrapText: true };
  });
}

function autoFitColumns(sheet, minimums, maximum = 58) {
  sheet.columns.forEach((column, index) => {
    let contentWidth = minimums[index] ?? 12;
    column.eachCell({ includeEmpty: false }, (cell) => {
      if (cell.isMerged) return;
      const text = cell.value instanceof Date ? '00/00/0000 00:00' : String(cell.text ?? cell.value ?? '');
      contentWidth = Math.max(contentWidth, text.length + 3);
    });
    column.width = Math.min(contentWidth, maximum);
  });
}

function financialConclusion(model) {
  const entries = Object.entries(model.scenarios);
  const [bestKey, best] = entries.reduce((winner, entry) => entry[1].finalCash > winner[1].finalCash ? entry : winner);
  const agency = model.scenarios.agency;
  return `El escenario ${scenarioLabels[bestKey]} presenta la mayor caja proyectada al mes 12 (${formatUsd(best.finalCash)}). `
    + (agency.belowFloorMonths > 0
      ? `El escenario Agencia permanece ${agency.belowFloorMonths} meses bajo el piso de seguridad y finaliza en ${formatUsd(agency.finalCash)}. `
      : '')
    + 'Estas cifras son proyecciones académicas basadas en los supuestos vigentes, no resultados bancarios reales.';
}

const formatUsd = (value) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);

export function appendLevelThreeSheets(workbook, fourPlansData, manualCheckData, bestPlanData) {
  const fourPlans = fourPlansData ?? simulateFourPlans();
  const manualCheck = manualCheckData ?? verifyManualMonthOne();
  const bestPlan = bestPlanData ?? findBestPlan();
  const [actual, agency, ownA, ownB] = fourPlans.results;

  // 1. Hoja Comparación de 4 Planes
  const comparison = workbook.addWorksheet('Nivel 3 · Comparación 4 planes', { views: [{ state: 'frozen', ySplit: 4 }] });
  comparison.properties.defaultRowHeight = 20;
  styleTitle(comparison, 'A1:E2', 'NIVEL 3 — COMPARACIÓN DE 4 PLANES FINANCIEROS (24 MESES)');
  comparison.getCell('A3').value = 'Horizonte de 24 meses · Proyección de cohortes y restricciones de liquidez';
  comparison.mergeCells('A3:E3');

  const compHeader = comparison.addRow(['Indicador / Métrica', actual.plan.name, agency.plan.name, ownA.plan.name, ownB.plan.name]);
  styleHeader(compHeader);

  const planMetrics = [
    ['Estado de validez', (r) => r.valid ? 'Válido' : 'Inválido', null],
    ['Inversión total 24 meses', (r) => r.totalInvestment, MONEY_FORMAT],
    ['Inversión promedio mensual', (r) => r.totalInvestment / 24, MONEY_FORMAT],
    ['Inversión promedio meses 1–12', (r) => r.averageFirst12Investment, MONEY_FORMAT],
    ['Caja final · mes 24', (r) => r.finalCash, MONEY_FORMAT],
    ['Caja mínima proyectada', (r) => r.minimumCash, MONEY_FORMAT],
    ['Mes de caja mínima', (r) => `Mes ${r.minimumCashMonth}`, null],
    ['Suscriptores activos · mes 24', (r) => r.activeSubscribersMonth24, NUMBER_FORMAT],
    ['Meses bajo piso (USD 5.000)', (r) => r.violations.floor.length ? `${r.violations.floor.length} mes(es): ${r.violations.floor.join(', ')}` : '0 meses (cumple)', null],
    ['Infracción presupuesto (0–20k)', (r) => r.violations.budget.length ? `Mes(es): ${r.violations.budget.join(', ')}` : 'Ninguna (cumple)', null],
    ['Infracción regla mes 13+', (r) => r.violations.postMonth12.length ? `Mes(es): ${r.violations.postMonth12.join(', ')}` : 'Ninguna (cumple)', null],
  ];

  planMetrics.forEach(([label, getter, numFmt]) => {
    const row = comparison.addRow([label, getter(actual), getter(agency), getter(ownA), getter(ownB)]);
    if (numFmt) {
      for (let col = 2; col <= 5; col += 1) {
        if (typeof row.getCell(col).value === 'number') row.getCell(col).numFmt = numFmt;
      }
    }
    addBorders(row);
  });

  comparison.addRow([]);
  const optHeader = comparison.addRow(['Optimización · Mejor plan encontrado', 'Valor', 'Detalle', '', '']);
  comparison.mergeCells(`B${optHeader.number}:E${optHeader.number}`);
  styleHeader(optHeader);

  const optRows = [
    ['Método de búsqueda', bestPlan.method],
    ['Estrategia seleccionada', bestPlan.best?.plan?.name ?? 'No disponible'],
    ['Caja final mes 24', bestPlan.best ? formatUsd(bestPlan.best.finalCash) : 'N/A'],
    ['Suscriptores activos mes 24', bestPlan.best ? bestPlan.best.activeSubscribersMonth24.toFixed(1) : 'N/A'],
    ['Planes evaluados / factibles', `${bestPlan.evaluatedCount} evaluados / ${bestPlan.feasibleCount} factibles`],
  ];

  optRows.forEach(([concept, detail]) => {
    const row = comparison.addRow([concept, detail]);
    comparison.mergeCells(`B${row.number}:E${row.number}`);
    addBorders(row);
  });

  comparison.addRow([]);
  const pitchRow = comparison.addRow(['Pitch de inversión (2 minutos)', createInvestmentPitch(bestPlan.best ?? actual)]);
  comparison.mergeCells(`B${pitchRow.number}:E${pitchRow.number + 2}`);
  comparison.getCell(`A${pitchRow.number}`).font = { bold: true, color: { argb: COLORS.green } };
  comparison.getCell(`B${pitchRow.number}`).alignment = { vertical: 'top', wrapText: true };
  comparison.getRow(pitchRow.number).height = 64;

  autoFitColumns(comparison, [32, 24, 24, 24, 24]);

  // 2. Hoja Flujo de Caja 24 Meses
  const flow = workbook.addWorksheet('Nivel 3 · Flujo 24 meses', { views: [{ state: 'frozen', ySplit: 5, xSplit: 1 }] });
  styleTitle(flow, 'A1:F2', 'PROYECCIÓN DE FLUJO DE CAJA — 24 MESES (4 PLANES)');
  flow.getCell('A3').value = 'Saldo de caja mensual proyectado por cohortes. Piso mínimo exigido: USD 5.000.';
  flow.mergeCells('A3:F3');

  const flowHeader = flow.addRow(['Mes', 'Plan 1 · Actual', 'Plan 2 · Agencia', 'Plan 3 · Propia A', 'Plan 4 · Propia B', 'Piso de seguridad']);
  styleHeader(flowHeader);

  for (let m = 0; m <= 24; m += 1) {
    const row = flow.addRow([
      m === 0 ? 'Caja inicial' : `Mes ${m}`,
      actual.cashSeries[m],
      agency.cashSeries[m],
      ownA.cashSeries[m],
      ownB.cashSeries[m],
      5000,
    ]);
    for (let col = 2; col <= 6; col += 1) row.getCell(col).numFmt = MONEY_FORMAT;
    addBorders(row);
  }

  const summary24 = flow.addRow([
    'Caja final mes 24',
    actual.finalCash,
    agency.finalCash,
    ownA.finalCash,
    ownB.finalCash,
    5000,
  ]);
  styleHeader(summary24);
  for (let col = 2; col <= 6; col += 1) summary24.getCell(col).numFmt = MONEY_FORMAT;

  autoFitColumns(flow, [18, 20, 20, 20, 20, 18]);
  flow.addConditionalFormatting({
    ref: `B6:E${summary24.number}`,
    rules: [
      { type: 'cellIs', operator: 'lessThan', formulae: [5000], style: { font: { color: { argb: COLORS.red }, bold: true } } },
    ],
  });

  // 3. Hoja Verificación Manual Mes 1
  const audit = workbook.addWorksheet('Nivel 3 · Verificación mes 1', { views: [{ state: 'frozen', ySplit: 4 }] });
  styleTitle(audit, 'A1:D2', 'NIVEL 3 — VERIFICACIÓN MANUAL OBLIGATORIA (MES 1)');
  audit.getCell('A3').value = 'Cálculo independiente paso a paso para el Plan de USD 8.000 contrastado contra el motor.';
  audit.mergeCells('A3:D3');

  const auditHeader = audit.addRow(['Paso', 'Concepto', 'Fórmula y Sustitución', 'Resultado']);
  styleHeader(auditHeader);

  manualCheck.steps.forEach((s) => {
    const row = audit.addRow([
      `Paso ${s.step}`,
      s.title,
      `${s.formula}\n→ ${s.substitution}`,
      s.result,
    ]);
    addBorders(row);
    row.getCell(3).alignment = { wrapText: true, vertical: 'middle' };
  });

  autoFitColumns(audit, [12, 28, 55, 25]);

  [comparison, flow, audit].forEach((sheet) => {
    sheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 1, paperSize: 9 };
    sheet.eachRow((row) => row.eachCell((cell) => {
      cell.font = { name: 'Aptos', size: 10, ...cell.font };
    }));
  });
}

export function createFinancialWorkbook(model, generatedAt = new Date(), options = {}) {
  if (model?.status !== 'ok') throw new Error('No es posible exportar un modelo financiero incompleto.');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tueste Analytics';
  workbook.company = 'Tueste Analytics';
  workbook.created = generatedAt;
  workbook.modified = generatedAt;
  workbook.calcProperties.fullCalcOnLoad = true;

  const summary = workbook.addWorksheet('Resumen ejecutivo', { views: [{ state: 'frozen', ySplit: 4 }] });
  summary.properties.defaultRowHeight = 20;
  styleTitle(summary, 'A1:D2', 'TUESTE ANALYTICS — RESULTADOS FINANCIEROS');
  summary.getCell('A3').value = 'Fecha de generación';
  summary.getCell('B3').value = generatedAt;
  summary.getCell('B3').numFmt = 'dd/mm/yyyy hh:mm';
  summary.getRow(5).values = ['Indicador', 'Actual', 'Agencia', 'Pack'];
  styleHeader(summary.getRow(5));
  const scenarioRows = [
    ['CAC anuncios', 'cacAds', MONEY_FORMAT], ['CAC real', 'cac', MONEY_FORMAT],
    ['LTV suelto · 12 meses', 'oneTimeLtv', MONEY_FORMAT], ['LTV suscriptor · 12 meses', 'subscriberLtv', MONEY_FORMAT],
    ['LTV ponderado · 12 meses', 'ltv', MONEY_FORMAT], ['LTV / CAC', 'ltvCacRatio', RATIO_FORMAT],
    ['ROAS real del primer pedido', 'roasFirstOrder', RATIO_FORMAT],
    ['Inversión Meta', 'advertisingSpend', MONEY_FORMAT], ['Clientes Meta / mes', 'acquiredCustomers', NUMBER_FORMAT],
    ['Caja final · mes 12', 'finalCash', MONEY_FORMAT], ['Caja mínima', 'minimumCash', MONEY_FORMAT],
    ['Meses bajo piso', 'belowFloorMonths', '0'], ['Payback · primer mes entero', 'paybackFirstWholeMonth', '0'],
  ];
  scenarioRows.forEach(([label, key, numFmt]) => {
    const display = (scenario) => key === 'paybackFirstWholeMonth' && scenario[key] == null ? 'No recuperado en 12 meses' : scenario[key];
    const row = summary.addRow([label, display(model.scenarios.actual), display(model.scenarios.agency), display(model.scenarios.pack)]);
    for (let column = 2; column <= 4; column += 1) if (typeof row.getCell(column).value === 'number') row.getCell(column).numFmt = numFmt;
    addBorders(row);
  });
  summary.addRow([]);
  const generalHeader = summary.addRow(['Indicadores generales', 'Valor', 'Unidad', 'Origen']);
  styleHeader(generalHeader);
  [
    ['Contribución por pedido', model.contributionAmount, 'USD', MONEY_FORMAT],
    ['Margen de contribución', model.contributionMarginRate, '%', PERCENT_FORMAT],
    ['ROAS break-even', model.breakEvenRoas, 'x', RATIO_FORMAT],
  ].forEach(([label, value, unit, numFmt]) => {
    const row = summary.addRow([label, value, unit, 'Modelo financiero académico']);
    row.getCell(2).numFmt = numFmt; addBorders(row);
  });
  summary.addRow([]);
  const conclusionRow = summary.addRow(['Conclusión financiera', financialConclusion(model)]);
  summary.mergeCells(`B${conclusionRow.number}:D${conclusionRow.number + 2}`);
  summary.getCell(`A${conclusionRow.number}`).font = { bold: true, color: { argb: COLORS.green } };
  summary.getCell(`B${conclusionRow.number}`).alignment = { vertical: 'top', wrapText: true };
  summary.getRow(conclusionRow.number).height = 54;
  autoFitColumns(summary, [31, 24, 24, 28]);
  summary.autoFilter = { from: 'A5', to: `D${5 + scenarioRows.length}` };

  const cash = workbook.addWorksheet('Flujo de caja', { views: [{ state: 'frozen', ySplit: 5, xSplit: 1 }] });
  styleTitle(cash, 'A1:D2', 'PROYECCIÓN DE FLUJO DE CAJA — 12 MESES');
  cash.getCell('A3').value = 'Valores calculados con los supuestos vigentes al momento de exportar.';
  cash.mergeCells('A3:D3');
  cash.getRow(5).values = ['Mes', 'Actual', 'Agencia', 'Pack'];
  styleHeader(cash.getRow(5));
  for (let index = 0; index < 13; index += 1) {
    const row = cash.addRow([
      index === 0 ? 'Caja inicial' : `Mes ${index}`,
      model.scenarios.actual.cashSeries[index], model.scenarios.agency.cashSeries[index], model.scenarios.pack.cashSeries[index],
    ]);
    for (let column = 2; column <= 4; column += 1) row.getCell(column).numFmt = MONEY_FORMAT;
    addBorders(row);
  }
  const finalRow = cash.addRow(['Resumen mes 12', model.scenarios.actual.finalCash, model.scenarios.agency.finalCash, model.scenarios.pack.finalCash]);
  styleHeader(finalRow);
  for (let column = 2; column <= 4; column += 1) finalRow.getCell(column).numFmt = MONEY_FORMAT;
  autoFitColumns(cash, [20, 22, 22, 22]);
  cash.autoFilter = { from: 'A5', to: `D${finalRow.number - 1}` };
  cash.addConditionalFormatting({
    ref: `B6:D${finalRow.number}`,
    rules: [{ type: 'cellIs', operator: 'lessThan', formulae: [0], style: { font: { color: { argb: COLORS.red }, bold: true } } }],
  });
  cash.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 1, paperSize: 9 };

  const inputs = workbook.addWorksheet('Supuestos del simulador', { views: [{ state: 'frozen', ySplit: 5 }] });
  styleTitle(inputs, 'A1:D2', 'SUPUESTOS VIGENTES DEL SIMULADOR');
  inputs.getCell('A3').value = 'Origen académico';
  inputs.getCell('B3').value = 'Modelo financiero original de Tueste Analytics — SIMULACION_EDITABLE';
  inputs.mergeCells('B3:D3');
  inputs.getRow(5).values = ['Supuesto', 'Valor', 'Unidad', 'Descripción'];
  styleHeader(inputs.getRow(5));
  assumptions.forEach(([key, label, unit, description, derive]) => {
    const value = derive ? derive(model.state) : model.state[key];
    const row = inputs.addRow([label, value, unit, description]);
    row.getCell(2).numFmt = unit.startsWith('%') ? PERCENT_FORMAT : unit === 'USD' ? MONEY_FORMAT : NUMBER_FORMAT;
    addBorders(row);
  });
  inputs.addRow([]);
  const note = inputs.addRow(['Nota', 'Proyección financiera basada en supuestos. No representa movimientos bancarios reales']);
  inputs.mergeCells(`B${note.number}:D${note.number}`);
  note.font = { italic: true, color: { argb: COLORS.muted } };
  note.getCell(1).font = { bold: true, color: { argb: COLORS.green } };
  autoFitColumns(inputs, [35, 22, 17, 45]);
  inputs.autoFilter = { from: 'A5', to: `D${5 + assumptions.length}` };

  [summary, cash, inputs].forEach((sheet) => {
    sheet.pageSetup.fitToPage = true;
    sheet.eachRow((row) => row.eachCell((cell) => {
      cell.font = { name: 'Aptos', size: 10, ...cell.font };
    }));
  });

  if (options.includeLevelThree) {
    appendLevelThreeSheets(workbook, options.fourPlansData, options.manualCheckData, options.bestPlanData);
  }

  return workbook;
}

export function createLevelThreeWorkbook(fourPlansData, manualCheckData, bestPlanData, generatedAt = new Date()) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Tueste Analytics';
  workbook.company = 'Tueste Analytics';
  workbook.created = generatedAt;
  workbook.modified = generatedAt;
  workbook.calcProperties.fullCalcOnLoad = true;

  appendLevelThreeSheets(workbook, fourPlansData, manualCheckData, bestPlanData);
  return workbook;
}

export async function downloadFinancialWorkbook(model, options = {}) {
  const workbook = createFinancialWorkbook(model, new Date(), options);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Tueste_Analytics_Resultados_${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function downloadLevelThreeWorkbook(fourPlansData, manualCheckData, bestPlanData) {
  const workbook = createLevelThreeWorkbook(fourPlansData, manualCheckData, bestPlanData);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Tueste_Analytics_Nivel_3_24Meses_${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

