import { useMemo, useState } from 'react';
import { SIMULATION_DEFAULTS } from '../financial/contracts.js';
import { calculateInteractiveModel } from '../financial/simulationModel.js';
import { applyFinancialControl } from '../financial/levelTwoModel.js';
import LevelTwoDashboard from './LevelTwoDashboard.jsx';

const money = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const money2 = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const number = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('es-CR', { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' });
const colors = { actual: '#6D3C1C', agency: '#A7473F', pack: '#2D5A43', floor: '#C57938' };

const fieldDefinitions = [
  ['metaAgency', 'Meta agencia ($)', 0, 20000, 500],
  ['packPrice', 'Precio pack 3 bolsas ($)', 20, 100, 0.5], ['packAdoption', 'Adopción pack (%)', 0, 100, 5, true],
  ['fixedCosts', 'Costos fijos mensuales ($)', 0, 25000, 100],
  ['existingContribution', 'Contribución existente mes 1 ($)', 0, 30000, 100], ['organicCustomers', 'Clientes orgánicos por mes', 0, 500, 1],
  ['initialCash', 'Caja inicial ($)', 0, 100000, 500], ['safetyFloor', 'Piso de seguridad ($)', 0, 50000, 500],
];

function LineChart({ series, referenceLine, ariaLabel }) {
  const width = 760; const height = 310; const left = 70; const right = 18; const top = 20; const bottom = 40;
  const validSeries = series.map((item) => ({ ...item, data: item.data.map((value) => Number.isFinite(value) ? value : null) }));
  const values = validSeries.flatMap((item) => item.data.filter(Number.isFinite)).concat(Number.isFinite(referenceLine) ? [referenceLine] : []);
  if (values.length === 0) return <div className="chart-empty" role="img" aria-label={ariaLabel}>No aplicable con los supuestos actuales.</div>;
  let minimum = Math.min(...values); let maximum = Math.max(...values);
  if (maximum - minimum < 1) { maximum += 1; minimum -= 1; }
  const padding = (maximum - minimum) * 0.1; minimum -= padding; maximum += padding;
  const pointsCount = Math.max(...validSeries.map((item) => item.data.length));
  const x = (index) => left + (index * (width - left - right)) / (pointsCount - 1);
  const y = (value) => top + ((maximum - value) * (height - top - bottom)) / (maximum - minimum);
  const largestAbsolute = Math.max(Math.abs(minimum), Math.abs(maximum));
  const formatAxis = (value) => largestAbsolute >= 1000 ? `${Math.round(value / 1000)}k` : number.format(value);
  return <svg className="finance-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={ariaLabel}>
    {Array.from({ length: 5 }, (_, index) => { const value = minimum + ((maximum - minimum) * index) / 4; const py = y(value); return <g key={index}><line x1={left} y1={py} x2={width - right} y2={py} className="chart-grid-line"/><text x={left - 9} y={py + 4} textAnchor="end" className="chart-axis-label">{formatAxis(value)}</text></g>; })}
    {Array.from({ length: 7 }, (_, index) => index * 2).map((month) => <text key={month} x={x(month)} y={height - 13} textAnchor="middle" className="chart-axis-label">{month}</text>)}
    {referenceLine != null && <line x1={left} y1={y(referenceLine)} x2={width - right} y2={y(referenceLine)} className="chart-reference-line"/>}
    {validSeries.map((item) => { const points = item.data.map((value, index) => Number.isFinite(value) ? `${x(index)},${y(value)}` : null).filter(Boolean); const last = item.data.findLastIndex(Number.isFinite); return <g key={item.key}>{points.length > 1 && <polyline points={points.join(' ')} fill="none" stroke={item.color} strokeWidth="3.3" strokeLinejoin="round" strokeLinecap="round"/>}{last >= 0 && <circle cx={x(last)} cy={y(item.data[last])} r="4.5" fill={item.color}/>}</g>; })}
  </svg>;
}

function Legend({ includeFloor = false, floor }) {
  return <div className="finance-legend">{[['actual', 'Actual'], ['agency', 'Agencia'], ['pack', 'Pack']].map(([key, label]) => <span key={key}><i style={{ background: colors[key] }}/>{label}</span>)}{includeFloor && <span><i style={{ background: colors.floor }}/>Piso de seguridad: {money.format(floor)}</span>}</div>;
}

function ScenarioCard({ label, scenario, className }) {
  const negative = scenario.finalCash < 0;
  const rows = [
    ['Inversión Meta', money.format(scenario.advertisingSpend)], ['Clientes Meta / mes', number.format(scenario.acquiredCustomers)],
    ['CAC real', Number.isFinite(scenario.cac) ? money2.format(scenario.cac) : 'No aplicable'], ['LTV / CAC', Number.isFinite(scenario.ltvCacRatio) ? `${number.format(scenario.ltvCacRatio)}x` : 'No aplicable'],
    ['Payback', scenario.paybackFirstWholeMonth == null ? 'No recuperado en 12 meses' : `Mes ${scenario.paybackFirstWholeMonth}`],
    ['Caja mínima', money.format(scenario.minimumCash)], ['Meses bajo piso', scenario.belowFloorMonths],
  ];
  return <article className={`finance-card strategy-card ${className}`}><span className={`finance-pill${scenario.belowFloorMonths ? ' warning' : ''}`}>{scenario.belowFloorMonths ? 'Riesgo de liquidez' : 'Sin cruce del piso'}</span><h3>{label}</h3><p className="strategy-subtitle">Caja estimada · mes 12</p><strong className={`strategy-total${negative ? ' negative' : ''}`}>{money.format(scenario.finalCash)}</strong><dl>{rows.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl></article>;
}

function ChangeComparison({ model }) {
  const rows = [
    ['Propuesta agencia', model.proposedChanges.baseline, null],
    ['Cambio A · Pack y política de envío', model.proposedChanges.changeA.scenario, model.proposedChanges.changeA.deltas],
    ['Cambio B · Mantener Meta en USD 8.000', model.proposedChanges.changeB.scenario, model.proposedChanges.changeB.deltas],
    ['Cambios A + B', model.proposedChanges.combined.scenario, model.proposedChanges.combined.deltas],
  ];
  return <div className="finance-table-wrap change-table"><table><thead><tr><th>Estrategia</th><th>CAC</th><th>LTV</th><th>LTV/CAC</th><th>Payback entero</th><th>Caja mes 12</th></tr></thead><tbody>{rows.map(([label, scenario, deltas]) => <tr key={label}><td><strong>{label}</strong>{deltas && <small>{percent.format(deltas.ltvCacRatio.percent)} en LTV/CAC vs agencia</small>}</td><td>{money2.format(scenario.cac)}</td><td>{money2.format(scenario.ltv)}</td><td>{number.format(scenario.ltvCacRatio)}x</td><td>{scenario.paybackFirstWholeMonth == null ? 'No recuperado en 12 meses' : `Mes ${scenario.paybackFirstWholeMonth}`}</td><td>{money.format(scenario.finalCash)}</td></tr>)}</tbody></table></div>;
}

export default function Dashboard({ activeView = 'panel-principal' }) {
  const [assumptions, setAssumptions] = useState(() => ({ ...SIMULATION_DEFAULTS }));
  const [exporting, setExporting] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('actual');
  const [controlError, setControlError] = useState('');
  const model = useMemo(() => calculateInteractiveModel(assumptions), [assumptions]);
  const update = (key, rawValue, percentage) => {
    if (rawValue === '') return;
    const value = Number(rawValue); if (!Number.isFinite(value)) return;
    setAssumptions((current) => ({ ...current, [key]: percentage ? value / 100 : value }));
  };
  const updateLevelTwoControl = (key, rawValue) => {
    const result = applyFinancialControl(assumptions, key, rawValue);
    if (result.status !== 'ok') { setControlError(result.error); return; }
    setControlError('');
    setAssumptions(result.state);
  };
  const restoreOriginals = () => {
    setControlError('');
    setSelectedScenario('actual');
    setAssumptions({ ...SIMULATION_DEFAULTS, oneTimeOrdersByMonth: [...SIMULATION_DEFAULTS.oneTimeOrdersByMonth] });
  };
  const exportResults = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const { downloadFinancialWorkbook } = await import('../financial/financialExport.js');
      await downloadFinancialWorkbook(model);
    } finally {
      setExporting(false);
    }
  };
  if (model.status !== 'ok') return <section className="finance-workspace"><p className="state-message">La simulación está incompleta. Revise los supuestos antes de continuar.</p></section>;
  const { actual, agency, pack } = model.scenarios;
  const chartSeries = [{ key: 'actual', color: colors.actual, data: actual.cashSeries }, { key: 'agency', color: colors.agency, data: agency.cashSeries }, { key: 'pack', color: colors.pack, data: pack.cashSeries }];
  const customerSeries = [{ key: 'actual', color: colors.actual, data: actual.customerSeries }, { key: 'agency', color: colors.agency, data: agency.customerSeries }, { key: 'pack', color: colors.pack, data: pack.customerSeries }];
  const isView = (...views) => views.includes(activeView);
  return <div className="finance-workspace" data-source="SIMULACION_EDITABLE">
    {isView('panel-principal') && <>
    <section className="finance-top" id="panel-principal"><div><p className="finance-eyebrow">Herramienta de decisiones financieras</p><h1>¿Cómo debería crecer Tueste?</h1><p>Comparamos rentabilidad por cliente, inversión en Meta y liquidez empresarial.</p></div><div className="finance-actions"><button type="button" className="finance-button" onClick={restoreOriginals}>↻ Restaurar datos originales</button><button type="button" className="finance-button primary" disabled={exporting} onClick={exportResults}>{exporting ? 'Generando Excel…' : '↓ Exportar resultados'}</button></div></section>
    <div className="finance-context"><span className="context-label finance">Modelo financiero académico</span><span>Supuestos originales verificados; los controles crean una simulación editable separada de MYSQL_DEMO.</span></div>
    <section className="finance-kpis" aria-label="Indicadores financieros principales">{[
      ['CAC real actual', Number.isFinite(actual.cac) ? money2.format(actual.cac) : 'No aplicable', 'Publicidad + fee / clientes Meta'],
      ['LTV actual · 12 meses', money2.format(actual.ltv), 'Contribución ponderada por cliente'],
      ['LTV / CAC', Number.isFinite(actual.ltvCacRatio) ? `${number.format(actual.ltvCacRatio)}x` : 'No aplicable', 'Referencia: superar 1,0x'],
      ['ROAS break-even', `${number.format(model.breakEvenRoas)}x`, 'Para pedido suelto de 2 bolsas'],
    ].map(([label, value, detail]) => <article className="finance-card finance-kpi" key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>)}</section>
    <section className="validated-metrics" aria-label="Métricas financieras validadas"><div><span>Contribución por pedido</span><strong>{money2.format(model.contributionAmount)}</strong></div><div><span>Margen de contribución</span><strong>{number.format(model.contributionMarginRate * 100)}%</strong></div><div><span>Payback Excel</span><strong>{actual.paybackFirstWholeMonth == null ? 'No aplicable' : `Mes ${actual.paybackFirstWholeMonth}`}</strong></div></section>
    <section className="finance-section academic-section" id="evidencia-academica"><div className="academic-heading"><p className="finance-eyebrow">Evidencia académica</p><h2>Análisis verificable del caso</h2><p>Fórmulas y decisiones calculadas con los supuestos vigentes; no utiliza datos MYSQL_DEMO.</p></div>
      <article className="finance-card academic-card"><h3>Verificación manual de cálculos</h3><div className="manual-grid"><div><strong>CAC real de septiembre</strong><p><b>Datos:</b> Meta {money.format(assumptions.metaActual)}, fee {money.format(assumptions.agencyFee)}, {number.format(actual.acquiredCustomers)} clientes Meta. Fuente: secciones 3 y 7 del caso.</p><code>({number.format(assumptions.metaActual)} + {number.format(assumptions.agencyFee)}) / {number.format(actual.acquiredCustomers)} = {money2.format(actual.cac)}</code><p>Coincide con el motor financiero.</p></div><div><strong>Contribución del pedido suelto</strong><p><b>Fórmula:</b> precio − café − envío − pasarela − empaque.</p><code>{number.format(assumptions.price)} − ({number.format(assumptions.bagCost)} × 2) − {number.format(assumptions.shipping)} − ({number.format(assumptions.price)} × {number.format(assumptions.paymentFeePercent * 100)}%) − {number.format(assumptions.packaging)} = {money2.format(model.contributionAmount)}</code><p>Suscripción: contribución {money2.format(model.subscriptionContribution)}, margen {number.format(model.subscriptionMarginRate * 100)}% y ROAS break-even {number.format(model.subscriptionBreakEvenRoas)}x. Fuente: secciones 1 y 2 del caso.</p></div></div></article>
      <article className="finance-card academic-card"><h3>CAC marginal de inversión publicitaria</h3><p>Se calcula con inversión adicional / clientes Meta adicionales. El fee fijo no se suma: permanece en USD 1.000 entre tramos con inversión y corresponde al CAC real promedio, no al marginal publicitario.</p><div className="marginal-list">{model.marginalCacSegments.map((segment) => <div key={segment.toSpend}><span>{money.format(segment.fromSpend)} → {money.format(segment.toSpend)}</span><strong>{money2.format(segment.value)}</strong></div>)}<div className="featured"><span>{money.format(8000)} → {money.format(16000)}</span><strong>{money2.format(model.marginalCac8to16)}</strong></div></div></article>
      <article className="finance-card academic-card full"><h3>Dos cambios propuestos y efecto individual</h3><p>Base de comparación: propuesta de agencia (Meta USD 16.000 + descuento de 30 %). Cambio A sustituye el descuento por Pack/política de envío y mantiene USD 16.000. Cambio B mantiene el descuento pero limita Meta a USD 8.000. El combinado aplica Pack/política de envío con USD 8.000.</p><ChangeComparison model={model}/><p className="finance-note"><strong>Riesgos:</strong> la adopción del Pack es un supuesto editable; no se ha demostrado que conserve conversión o frecuencia. Mantener USD 8.000 reduce CAC, pero el descuento aislado sigue sin recuperar el CAC en 12 meses.</p></article>
    </section>
    </>}
    {isView('nivel-2') && <LevelTwoDashboard assumptions={assumptions} model={model} selectedScenario={selectedScenario} onSelectScenario={setSelectedScenario} onControlChange={updateLevelTwoControl} validationError={controlError}/>} 
    {isView('escenarios') && <section className="finance-section" id="escenarios"><h2>Tres estrategias, una decisión</h2><div className="strategy-grid"><ScenarioCard label="Actual" scenario={actual} className="actual"/><ScenarioCard label="Agencia + descuento" scenario={agency} className="agency"/><ScenarioCard label="Pack 3 bolsas" scenario={pack} className="pack"/></div></section>}
    {isView('simulador', 'flujo-caja') && <section className="finance-section finance-two" id={activeView}>{isView('flujo-caja') && <article className="finance-card chart-card"><h2>Proyección de caja empresarial</h2><p>Saldo final de cada mes, incluyendo cohortes nuevas, clientes existentes y costos.</p><LineChart series={chartSeries} referenceLine={assumptions.safetyFloor} ariaLabel="Proyección de caja empresarial para Actual, Agencia y Pack"/><Legend includeFloor floor={assumptions.safetyFloor}/></article>}{isView('simulador') && <article className="finance-card simulator-card"><div className="simulator-heading"><div><h2>Simulador de supuestos</h2><p>Modificá los datos y todos los indicadores se actualizarán automáticamente.</p></div><span>Proyección basada en supuestos</span></div><div className="finance-controls">{fieldDefinitions.map(([key, label, min, max, step, percentage]) => <label key={key}>{label}<input type="number" min={min} max={max} step={step} value={percentage ? assumptions[key] * 100 : assumptions[key]} onChange={(event) => update(key, event.target.value, percentage)}/></label>)}</div><p className="finance-note">La respuesta de nuevos clientes a Meta se interpola con datos históricos, no se multiplica proporcionalmente.</p></article>}</section>}
    {isView('flujo-caja') && <section className="finance-section finance-two detail-layout"><article className="finance-card monthly-card"><h2>Detalle mensual de caja</h2><div className="finance-table-wrap"><table><thead><tr><th>Mes</th><th>Actual</th><th>Agencia</th><th>Pack</th></tr></thead><tbody>{Array.from({ length: 13 }, (_, index) => <tr key={index}><td>{index === 0 ? 'Inicial' : index}</td>{[actual, agency, pack].map((scenario) => <td key={scenario.mode} className={scenario.cashSeries[index] < assumptions.safetyFloor ? 'negative' : ''}>{money.format(scenario.cashSeries[index])}</td>)}</tr>)}</tbody></table></div></article><article className="finance-card chart-card recovery-card"><h2>Recuperación por cliente</h2><p>Contribución acumulada de un cliente adquirido en Meta menos su CAC real.</p><LineChart series={customerSeries} referenceLine={0} ariaLabel="Recuperación por cliente para Actual, Agencia y Pack"/><Legend/></article></section>}
    {false && <section className="finance-section academic-section" id="evidencia-academica-legacy"><div className="academic-heading"><p className="finance-eyebrow">Evidencia académica</p><h2>Análisis verificable del caso</h2><p>Fórmulas y decisiones calculadas con los supuestos vigentes; no utiliza datos MYSQL_DEMO.</p></div>
      <article className="finance-card academic-card"><h3>Verificación manual de cálculos</h3><div className="manual-grid"><div><strong>CAC real de septiembre</strong><p><b>Datos:</b> Meta {money.format(assumptions.metaActual)}, fee {money.format(assumptions.agencyFee)}, {number.format(actual.acquiredCustomers)} clientes Meta. Fuente: secciones 3 y 7 del caso.</p><code>({number.format(assumptions.metaActual)} + {number.format(assumptions.agencyFee)}) / {number.format(actual.acquiredCustomers)} = {money2.format(actual.cac)}</code><p>Coincide con el motor financiero.</p></div><div><strong>Contribución del pedido suelto</strong><p><b>Fórmula:</b> precio − café − envío − pasarela − empaque.</p><code>{number.format(assumptions.price)} − ({number.format(assumptions.bagCost)} × 2) − {number.format(assumptions.shipping)} − ({number.format(assumptions.price)} × {number.format(assumptions.paymentFeePercent * 100)}%) − {number.format(assumptions.packaging)} = {money2.format(model.contributionAmount)}</code><p>Suscripción: contribución {money2.format(model.subscriptionContribution)}, margen {number.format(model.subscriptionMarginRate * 100)}% y ROAS break-even {number.format(model.subscriptionBreakEvenRoas)}x. Fuente: secciones 1 y 2 del caso.</p></div></div></article>
      <article className="finance-card academic-card"><h3>CAC marginal de inversión publicitaria</h3><p>Se calcula con inversión adicional / clientes Meta adicionales. El fee fijo no se suma: permanece en USD 1.000 entre tramos con inversión y corresponde al CAC real promedio, no al marginal publicitario.</p><div className="marginal-list">{model.marginalCacSegments.map((segment) => <div key={segment.toSpend}><span>{money.format(segment.fromSpend)} → {money.format(segment.toSpend)}</span><strong>{money2.format(segment.value)}</strong></div>)}<div className="featured"><span>{money.format(8000)} → {money.format(16000)}</span><strong>{money2.format(model.marginalCac8to16)}</strong></div></div></article>
      <article className="finance-card academic-card full"><h3>Dos cambios propuestos y efecto individual</h3><p>Base de comparación: propuesta de agencia (Meta USD 16.000 + descuento de 30 %). Cambio A sustituye el descuento por Pack/política de envío y mantiene USD 16.000. Cambio B mantiene el descuento pero limita Meta a USD 8.000. El combinado aplica Pack/política de envío con USD 8.000.</p><ChangeComparison model={model}/><p className="finance-note"><strong>Riesgos:</strong> la adopción del Pack es un supuesto editable; no se ha demostrado que conserve conversión o frecuencia. Mantener USD 8.000 reduce CAC, pero el descuento aislado sigue sin recuperar el CAC en 12 meses.</p></article>
    </section>}
    {isView('recomendacion') && <section className="finance-section finance-card recommendation-card" id="recomendacion"><h2>Recomendación financiera para Diego</h2><div className="recommendation-alert"><strong>Decisión: ARREGLAR antes de escalar.</strong> No firmar la propuesta de USD 16.000 con 30 % de descuento tal como está. Mantener temporalmente Meta en USD 8.000 y probar la oferta Pack con una muestra controlada antes de comprometer caja.</div><p><strong>Comparación:</strong> Actual termina con {money.format(actual.finalCash)}, CAC {money2.format(actual.cac)}, LTV/CAC {number.format(actual.ltvCacRatio)}x y payback en el mes {actual.paybackFirstWholeMonth}. Agencia termina con <strong>{money.format(agency.finalCash)}</strong>, CAC {money2.format(agency.cac)}, LTV/CAC {number.format(agency.ltvCacRatio)}x y <strong>No recuperado en 12 meses</strong>. El combinado Pack + Meta USD 8.000 termina con <strong>{money.format(pack.finalCash)}</strong>, LTV/CAC {number.format(pack.ltvCacRatio)}x y payback en el mes {pack.paybackFirstWholeMonth}, bajo una adopción del {Math.round(assumptions.packAdoption * 100)}%.</p><p><strong>Efecto de los cambios:</strong> frente a la propuesta de agencia, sustituir el descuento por Pack/política de envío eleva el LTV/CAC en {percent.format(model.proposedChanges.changeA.deltas.ltvCacRatio.percent)}; mantener Meta en USD 8.000 lo eleva en {percent.format(model.proposedChanges.changeB.deltas.ltvCacRatio.percent)} al reducir el CAC; juntos lo elevan en {percent.format(model.proposedChanges.combined.deltas.ltvCacRatio.percent)}.</p><p><strong>Trampa del ROAS:</strong> el 3,0 de Meta no equivale a rentabilidad incremental. El ROAS real del primer pedido actual es {number.format(actual.roasFirstOrder)}x. La agencia cruza el piso durante {agency.belowFloorMonths} meses, por lo que duplicar inversión pone en riesgo liquidez.</p><p><strong>Condiciones para reconsiderar:</strong> validar adopción, conversión y frecuencia del Pack; demostrar LTV/CAC sostenible por encima de 1x con margen de seguridad; mantener la caja sobre {money.format(assumptions.safetyFloor)} y escalar por tramos cuando el CAC marginal sea menor que la contribución esperada por cliente.</p></section>}
  </div>;
}
