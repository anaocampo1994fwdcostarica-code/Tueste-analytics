import { LEVEL_TWO_CONTROLS, buildLevelTwoView, getControlValue } from '../financial/levelTwoModel.js';

const money = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const number = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 2 });
const percentage = new Intl.NumberFormat('es-CR', { style: 'percent', maximumFractionDigits: 2 });
const labels = { actual: 'Actual', agency: 'Agencia', pack: 'Pack' };
const scenarioColors = { actual: '#6D3C1C', agency: '#A7473F', pack: '#2D5A43' };

const nullable = (value, formatter) => Number.isFinite(value) ? formatter(value) : 'No aplicable';
const payback = (scenario) => scenario.cac == null
  ? 'No aplicable'
  : scenario.paybackFirstWholeMonth == null
    ? 'No recuperado en 12 meses'
    : `Mes ${scenario.paybackFirstWholeMonth}`;

function Control({ definition, state, onChange }) {
  const canonicalValue = getControlValue(state, definition.key);
  const displayValue = definition.unit === '%' ? canonicalValue * 100 : canonicalValue;
  const displayMin = definition.unit === '%' ? definition.min * 100 : definition.min;
  const displayMax = definition.unit === '%' ? definition.max * 100 : definition.max;
  const displayStep = definition.unit === '%' ? definition.step * 100 : definition.step;
  const commit = (raw) => onChange(definition.key, definition.unit === '%' ? Number(raw) / 100 : Number(raw));
  return <label className="level2-control"><span>{definition.label}<small>{definition.unit}</small></span>{definition.kind === 'range' && <input aria-label={`${definition.label} deslizador`} type="range" min={displayMin} max={displayMax} step={displayStep} value={displayValue} onChange={(event) => commit(event.target.value)}/>}<input aria-label={definition.label} type="number" min={displayMin} max={displayMax} step={displayStep} value={displayValue} onChange={(event) => commit(event.target.value)}/></label>;
}

function MetricCard({ label, value, unit, explanation, children }) {
  return <article className="finance-card level2-metric"><span>{label}</span><strong>{value}</strong>{unit && <small className="metric-unit">{unit}</small>}<p>{explanation}</p>{children}</article>;
}

export function LtvCacChart({ scenario, signal }) {
  if (!Number.isFinite(scenario.cac) || !Number.isFinite(scenario.ltv)) return <div className="chart-empty">No hay CAC de Meta calculable con inversión USD 0.</div>;
  const width = 560; const height = 300; const left = 58; const right = 20; const top = 22; const bottom = 45;
  const maximum = Math.max(scenario.ltv, scenario.cac * 3) * 1.15;
  const x = (value) => left + value / maximum * (width - left - right);
  const y = (value) => height - bottom - value / maximum * (height - top - bottom);
  return <><svg className="level2-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`LTV ${money.format(scenario.ltv)} frente a CAC ${money.format(scenario.cac)}, referencias uno a uno y tres a uno`}>
    {[0, .25, .5, .75, 1].map((ratio) => <g key={ratio}><line x1={left} y1={y(maximum * ratio)} x2={width - right} y2={y(maximum * ratio)} className="chart-grid-line"/><text x={left - 8} y={y(maximum * ratio) + 4} textAnchor="end" className="chart-axis-label">{Math.round(maximum * ratio)}</text></g>)}
    <line x1={x(0)} y1={y(0)} x2={x(maximum)} y2={y(maximum)} className="ratio-line one"/><line x1={x(0)} y1={y(0)} x2={x(maximum / 3)} y2={y(maximum)} className="ratio-line three"/>
    <text x={x(maximum * .78)} y={y(maximum * .78) + 16} className="chart-axis-label">1:1</text><text x={x(maximum / 3) - 28} y={y(maximum) + 16} className="chart-axis-label">3:1</text>
    <circle cx={x(scenario.cac)} cy={y(scenario.ltv)} r="8" fill="#245b47"><title>{`CAC ${money.format(scenario.cac)} · LTV ${money.format(scenario.ltv)}`}</title></circle>
    <text x={x(scenario.cac) + 12} y={y(scenario.ltv) - 8} className="chart-value-label">LTV {money.format(scenario.ltv)}</text><text x={x(scenario.cac) + 12} y={y(scenario.ltv) + 10} className="chart-axis-label">CAC {money.format(scenario.cac)}</text>
    <text x={(left + width - right) / 2} y={height - 10} textAnchor="middle" className="chart-axis-label">CAC real (USD)</text>
  </svg><div className={`ratio-signal ${signal.key}`}><i/><span><strong>{signal.label}</strong>{signal.explanation}</span></div></>;
}

export function AcquisitionChart({ history, segments, scenario, marginal }) {
  const width = 700; const height = 320; const left = 62; const right = 22; const top = 25; const bottom = 62;
  const x = (value) => left + value / 20000 * (width - left - right);
  const y = (value) => height - bottom - value / 275 * (height - top - bottom);
  return <svg className="level2-chart acquisition-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Clientes nuevos de Meta según inversión e indicadores de CAC marginal por tramo">
    {[0, 100, 200, 275].map((value) => <g key={value}><line x1={left} y1={y(value)} x2={width-right} y2={y(value)} className="chart-grid-line"/><text x={left-8} y={y(value)+4} textAnchor="end" className="chart-axis-label">{value}</text></g>)}
    <polyline points={history.map(([spend, customers]) => `${x(spend)},${y(customers)}`).join(' ')} fill="none" stroke="#447f70" strokeWidth="3"/>
    {history.map(([spend, customers]) => <circle key={spend} cx={x(spend)} cy={y(customers)} r="5" fill="#fff" stroke="#245b47" strokeWidth="3"><title>{`${money.format(spend)} · ${number.format(customers)} clientes históricos`}</title></circle>)}
    {segments.map((segment) => <g key={segment.toSpend}><text x={x((segment.fromSpend+segment.toSpend)/2)} y={y((segment.fromCustomers+segment.toCustomers)/2)-12} textAnchor="middle" className="segment-label">{money.format(segment.value)}/cliente</text></g>)}
    <line x1={x(scenario.advertisingSpend)} y1={y(0)} x2={x(scenario.advertisingSpend)} y2={y(scenario.acquiredCustomers)} className="selected-investment-line"/>
    <circle cx={x(scenario.advertisingSpend)} cy={y(scenario.acquiredCustomers)} r="8" fill="#d99b39" stroke="#fff" strokeWidth="3"><title>{`Selección: ${money.format(scenario.advertisingSpend)}, ${number.format(scenario.acquiredCustomers)} clientes`}</title></circle>
    <text x={x(scenario.advertisingSpend)} y={height-30} textAnchor="middle" className="chart-value-label">{money.format(scenario.advertisingSpend)}</text>
    <text x={(left+width-right)/2} y={height-8} textAnchor="middle" className="chart-axis-label">Inversión Meta mensual</text>
    {marginal.next && <text x={width-right} y={top} textAnchor="end" className="chart-axis-label">Siguiente tramo: {money.format(marginal.next.value)}/cliente</text>}
  </svg>;
}

export function RoasTrapChart({ scenario }) {
  const values = [
    { label: 'Ads Manager', value: 3, color: '#8b6d79', note: 'Histórico fijo atribuido por Meta' },
    { label: 'Primer pedido', value: scenario.roasFirstOrder, color: '#bf7769', note: 'Clientes nuevos y primer pedido' },
    { label: 'Break-even', value: scenario.breakEvenRoas, color: '#2b9b6d', note: 'Mínimo según margen del pedido' },
  ];
  const maximum = Math.max(3.3, ...values.filter((item) => Number.isFinite(item.value)).map((item) => item.value * 1.12));
  return <div className="roas-bars" role="img" aria-label="Comparación entre ROAS de Ads Manager, ROAS real del primer pedido y ROAS break-even">{values.map((item) => <div className="roas-row" key={item.label}><span><strong>{item.label}</strong><small>{item.note}</small></span><div><i style={{ width: `${Number.isFinite(item.value) ? item.value / maximum * 100 : 0}%`, background: item.color }}/></div><b>{nullable(item.value, (value) => `${number.format(value)}x`)}</b></div>)}</div>;
}

export default function LevelTwoDashboard({ model, assumptions, selectedScenario, onSelectScenario, onControlChange, validationError }) {
  const view = buildLevelTwoView(model, selectedScenario);
  if (view.status !== 'ok') return null;
  const { scenario, indicators, marginal, signal } = view;
  const marginalDetail = marginal.atBreakpoint && marginal.next
    ? `Tramo anterior ${money.format(marginal.previous.value)}; siguiente ${money.format(marginal.next.value)} por cliente extra.`
    : marginal.selected ? `Tramo activo ${money.format(marginal.selected.fromSpend)}–${money.format(marginal.selected.toSpend)}.` : 'No aplicable.';
  const roasBelow = Number.isFinite(scenario.roasFirstOrder) && Number.isFinite(scenario.breakEvenRoas) && scenario.roasFirstOrder < scenario.breakEvenRoas;
  return <section className="finance-section level2-board" id="nivel-2"><header className="level2-header"><div><p className="finance-eyebrow">Tablero interactivo</p><h2>Unidad económica y adquisición en vivo</h2><p>Modelo financiero original. No utiliza datos comerciales MYSQL_DEMO.</p></div><div className="scenario-switch" aria-label="Escenario seleccionado">{Object.entries(labels).map(([key,label]) => <button key={key} type="button" className={selectedScenario===key?'active':''} onClick={() => onSelectScenario(key)}>{label}</button>)}</div></header>
    <div className="level2-layout"><article className="finance-card controls-card"><h3>Supuestos editables</h3><p>Los límites corresponden al caso académico. Los porcentajes se validan entre 0 % y 100 %.</p><div className="level2-controls">{LEVEL_TWO_CONTROLS.map((definition) => <Control key={definition.key} definition={definition} state={assumptions} onChange={onControlChange}/>)}</div>{validationError && <p className="control-error" role="alert">{validationError}</p>}<p className="finance-note">Al cambiar pedidos sueltos se escala proporcionalmente la distribución mensual original, conservando su forma. Restaurar recupera exactamente la distribución 1; 0,15; 0,20…</p></article>
      <div className="level2-metrics" aria-label="Ocho indicadores financieros">
        <MetricCard label="Margen de contribución" value={nullable(indicators.contribution.amount, money.format)} unit={`${nullable(indicators.contribution.rate, percentage.format)} del pedido`} explanation="Precio menos café, envío, pasarela y empaque."/>
        <MetricCard label="ROAS break-even" value={nullable(indicators.breakEvenRoas, (value) => `${number.format(value)}x`)} unit="mínimo del pedido suelto" explanation="1 dividido entre el margen de contribución porcentual."/>
        <MetricCard label="CAC real" value={nullable(indicators.cac, money.format)} unit="Meta + fee / clientes Meta" explanation="Los 47 orgánicos no entran en el denominador."/>
        <MetricCard label="LTV · 12 meses" value={nullable(indicators.ltv, money.format)} unit="contribución por cliente" explanation="Mezcla pedidos sueltos y suscriptores retenidos."/>
        <MetricCard label="LTV / CAC" value={nullable(indicators.ltvCacRatio, (value) => `${number.format(value)}x`)} unit={signal.label} explanation={signal.explanation}><span className={`mini-signal ${signal.key}`}/></MetricCard>
        <MetricCard label="Payback" value={payback(scenario)} unit={Number.isFinite(indicators.paybackInterpolatedMonths) ? `${number.format(indicators.paybackInterpolatedMonths)} meses interpolados` : null} explanation="Primer mes entero en que la contribución acumulada recupera el CAC."/>
        <MetricCard label="ROAS real del primer pedido" value={nullable(indicators.roasFirstOrder, (value) => `${number.format(value)}x`)} unit="no es el ROAS atribuido por Meta" explanation="Primer pedido de clientes nuevos Meta / inversión."/>
        <MetricCard label="CAC marginal" value={nullable(indicators.marginalCac, money.format)} unit="por cliente Meta adicional" explanation={marginalDetail}/>
      </div></div>
    <div className="level2-charts"><article className="finance-card level2-chart-card"><h3>LTV frente a CAC</h3><p>El punto seleccionado se compara con referencias reales 1:1 y 3:1.</p><LtvCacChart scenario={scenario} signal={signal}/></article><article className="finance-card level2-chart-card"><h3>Clientes nuevos según inversión</h3><p>Puntos históricos, interpolación lineal y CAC marginal de cada tramo.</p><AcquisitionChart history={assumptions.acquisitionHistory} segments={model.marginalCacSegments} scenario={scenario} marginal={marginal}/></article></div>
    <article className="finance-card roas-trap-card"><div><h3>La trampa del ROAS</h3><p>El 3,0x de Ads Manager es una referencia histórica fija: incluye atribución y retargeting. Los otros valores se recalculan con el escenario seleccionado y tienen bases distintas.</p><p className={`threshold-message ${roasBelow ? 'below' : 'above'}`}><strong>{roasBelow ? 'Por debajo del break-even:' : 'Sobre el break-even:'}</strong> el ROAS real del primer pedido {roasBelow ? 'no cubre' : 'supera'} el umbral del margen. Esto no garantiza por sí solo rentabilidad empresarial ni liquidez.</p></div><RoasTrapChart scenario={scenario}/><p className="roas-answer"><strong>¿Por qué 3,0 no coincide con el banco?</strong> Meta se atribuye USD 24.000 que incluyen recompras y audiencias de retargeting; el banco refleja contribución, fee, costos fijos y gasto publicitario. Por eso atribución no equivale a caja incremental.</p></article>
  </section>;
}
