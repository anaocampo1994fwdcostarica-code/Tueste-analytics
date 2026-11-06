import { useState, useMemo, useCallback } from 'react';
import {
  LEVEL_THREE_DEFAULTS,
  createDefaultPlans,
  simulateLevelThreePlan,
  simulateFourPlans,
  verifyManualMonthOne,
  findBestPlan,
  createInvestmentPitch,
  updatePlanInvestment,
  applyInvestmentRange,
  updatePlanChanges,
  updatePlanParameters,
  resetPlan,
} from '../financial/levelThreeModel.js';

const money = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const moneyWhole = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('es-CR', { style: 'percent', maximumFractionDigits: 1 });

const PLAN_COLORS = {
  actual: '#6D3C1C',
  agency: '#A7473F',
  ownA: '#2D5A43',
  ownB: '#C57938',
};

export default function LevelThreeSimulator() {
  const [plans, setPlans] = useState(() => createDefaultPlans());
  const [selectedPlanId, setSelectedPlanId] = useState('ownA');
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(12);
  const [rangeValue, setRangeValue] = useState(8000);
  const [exporting, setExporting] = useState(false);
  const [searchStep, setSearchStep] = useState(2000);

  // Simulación reactiva de los 4 planes
  const fourPlansSimulation = useMemo(() => simulateFourPlans(plans, LEVEL_THREE_DEFAULTS), [plans]);
  const activePlanResult = useMemo(
    () => fourPlansSimulation.results.find((r) => r.plan.id === selectedPlanId) ?? fourPlansSimulation.results[0],
    [fourPlansSimulation, selectedPlanId]
  );

  // Verificación manual independiente del mes 1
  const manualVerification = useMemo(() => verifyManualMonthOne(LEVEL_THREE_DEFAULTS), []);

  // Búsqueda heurística reproducible del mejor plan
  const bestPlanSearch = useMemo(() => findBestPlan(LEVEL_THREE_DEFAULTS, searchStep), [searchStep]);

  // Pitch de inversión generado dinámicamente
  const pitchText = useMemo(
    () => createInvestmentPitch(activePlanResult, LEVEL_THREE_DEFAULTS),
    [activePlanResult]
  );

  // Modificadores de plan
  const handleInvestmentChange = useCallback((monthIndex, value) => {
    setPlans((current) =>
      current.map((p) => {
        if (p.id !== selectedPlanId) return p;
        return updatePlanInvestment(p, monthIndex, value);
      })
    );
  }, [selectedPlanId]);

  const handleApplyRange = useCallback(() => {
    setPlans((current) =>
      current.map((p) => {
        if (p.id !== selectedPlanId) return p;
        return applyInvestmentRange(p, rangeFrom, rangeTo, rangeValue);
      })
    );
  }, [selectedPlanId, rangeFrom, rangeTo, rangeValue]);

  const handleToggleChange = useCallback((key, value) => {
    setPlans((current) =>
      current.map((p) => {
        if (p.id !== selectedPlanId) return p;
        return updatePlanChanges(p, { [key]: value });
      })
    );
  }, [selectedPlanId]);

  const handleParameterChange = useCallback((key, value) => {
    setPlans((current) =>
      current.map((p) => {
        if (p.id !== selectedPlanId) return p;
        return updatePlanParameters(p, { [key]: value });
      })
    );
  }, [selectedPlanId]);

  const handleResetCurrentPlan = useCallback(() => {
    setPlans((current) =>
      current.map((p) => (p.id === selectedPlanId ? resetPlan(p.id) : p))
    );
  }, [selectedPlanId]);

  const handleResetAllPlans = useCallback(() => {
    setPlans(createDefaultPlans());
  }, []);

  const handleLoadBestPlan = useCallback(() => {
    if (!bestPlanSearch.best) return;
    const best = bestPlanSearch.best.plan;
    setPlans((current) =>
      current.map((p) => {
        if (p.id === 'ownA') {
          return {
            ...p,
            investments: [...best.investments],
            changes: { ...best.changes },
            subscriberShare: best.subscriberShare,
            churn: best.churn,
          };
        }
        return p;
      })
    );
    setSelectedPlanId('ownA');
  }, [bestPlanSearch]);

  const handleExportExcel = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const { downloadLevelThreeWorkbook } = await import('../financial/financialExport.js');
      await downloadLevelThreeWorkbook(fourPlansSimulation, manualVerification, bestPlanSearch);
    } finally {
      setExporting(false);
    }
  }, [exporting, fourPlansSimulation, manualVerification, bestPlanSearch]);

  // Cálculos para el gráfico SVG de 24 meses
  const chartData = useMemo(() => {
    const allSeries = fourPlansSimulation.results.map((r) => r.cashSeries);
    let minVal = 5000;
    let maxVal = 35000;
    allSeries.forEach((series) => {
      series.forEach((v) => {
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      });
    });
    // Añadir margen
    minVal = Math.floor(Math.min(minVal, 0) / 10000) * 10000;
    maxVal = Math.ceil(maxVal / 20000) * 20000 + 10000;

    const width = 860;
    const height = 340;
    const padding = { top: 25, right: 35, bottom: 45, left: 75 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const scaleX = (m) => padding.left + (m / 24) * innerW;
    const scaleY = (val) => padding.top + innerH - ((val - minVal) / (maxVal - minVal)) * innerH;

    const yTicks = [];
    const stepY = (maxVal - minVal) / 6;
    for (let i = 0; i <= 6; i += 1) {
      yTicks.push(minVal + i * stepY);
    }

    return { width, height, padding, innerW, innerH, minVal, maxVal, scaleX, scaleY, yTicks };
  }, [fourPlansSimulation]);

  const activePlan = activePlanResult.plan;

  return (
    <section className="finance-section level3-simulator-section" id="nivel-3" aria-label="Simulador de caja de 24 meses">
      {/* Encabezado Nivel 3 */}
      <div className="finance-top">
        <div>
          <p className="finance-eyebrow">Etapa 14 · Modelo de 24 meses</p>
          <h2>Simulador de caja empresarial</h2>
          <p>
            Proyección de 24 meses basada en cohortes dinámicas, restricciones de liquidez y optimización heurística reproducible.
          </p>
        </div>
        <div className="finance-actions">
          <button type="button" className="finance-button" onClick={handleResetAllPlans}>
            ↻ Restaurar los 4 planes
          </button>
          <button
            type="button"
            className="finance-button primary"
            disabled={exporting}
            onClick={handleExportExcel}
          >
            {exporting ? 'Generando Excel 24m…' : '↓ Exportar simulación (Excel)'}
          </button>
        </div>
      </div>

      <div className="finance-context">
        <span className="context-label finance">Modelo verificado</span>
        <span>
          Caja inicial USD 35.000 · Piso mínimo USD 5.000 · Retención mensual 91% · Distr. pedidos edad 13–24: 0,10.
        </span>
      </div>

      {/* 1. Resumen de 24 meses y KPIs del plan activo */}
      <div className="finance-kpis" style={{ margin: '20px 0' }}>
        <article className="finance-card finance-kpi">
          <span>Caja final (Mes 24)</span>
          <strong style={{ color: activePlanResult.finalCash >= 5000 ? 'var(--ink)' : 'var(--red, #b33a32)' }}>
            {money.format(activePlanResult.finalCash)}
          </strong>
          <small>Plan activo: {activePlan.name}</small>
        </article>
        <article className="finance-card finance-kpi">
          <span>Caja mínima en 24m</span>
          <strong style={{ color: activePlanResult.minimumCash >= 5000 ? 'var(--ink)' : 'var(--red, #b33a32)' }}>
            {money.format(activePlanResult.minimumCash)}
          </strong>
          <small>Alcanzada en el mes {activePlanResult.minimumCashMonth}</small>
        </article>
        <article className="finance-card finance-kpi">
          <span>Suscriptores activos m24</span>
          <strong>{number.format(activePlanResult.activeSubscribersMonth24)}</strong>
          <small>Retención acumulada de 24 cohortes</small>
        </article>
        <article className="finance-card finance-kpi">
          <span>Estado del plan</span>
          <strong style={{ color: activePlanResult.valid ? '#245b47' : '#b33a32' }}>
            {activePlanResult.valid ? '✓ Válido' : '✗ Inválido'}
          </strong>
          <small>
            {activePlanResult.valid ? 'Cumple piso y reglas' : `${activePlanResult.reasons.length} restricción(es)`}
          </small>
        </article>
      </div>

      {/* 7. Alertas de incumplimiento del plan activo */}
      {!activePlanResult.valid && (
        <div
          role="alert"
          style={{
            background: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            color: '#a8071a',
          }}
        >
          <strong>⚠️ Restricciones incumplidas en {activePlan.name}:</strong>
          <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
            {activePlanResult.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. Comparación de los cuatro planes obligatorios */}
      <div style={{ marginBottom: '22px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '18px' }}>Comparación de los cuatro planes obligatorios</h3>
        <div className="strategy-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          {fourPlansSimulation.results.map((r) => {
            const isSelected = r.plan.id === selectedPlanId;
            return (
              <div
                key={r.plan.id}
                className={`finance-card strategy-card ${r.plan.id}`}
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--green, #174738)' : undefined,
                  boxShadow: isSelected ? '0 0 0 2px var(--green, #174738)' : undefined,
                  position: 'relative',
                }}
                onClick={() => setSelectedPlanId(r.plan.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`finance-pill ${r.valid ? '' : 'warning'}`}>
                    {r.valid ? 'Plan válido' : 'Inválido'}
                  </span>
                  {isSelected && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green)' }}>
                      ● Seleccionado
                    </span>
                  )}
                </div>
                <h4 style={{ margin: '10px 0 4px', fontSize: '15px' }}>{r.plan.name}</h4>
                <p className="strategy-subtitle" style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Inversión total: {moneyWhole.format(r.totalInvestment)}
                </p>
                <dl style={{ marginTop: '10px' }}>
                  <div>
                    <dt>Caja final m24</dt>
                    <dd style={{ color: r.finalCash >= 5000 ? 'inherit' : 'var(--red, #b33a32)' }}>
                      {money.format(r.finalCash)}
                    </dd>
                  </div>
                  <div>
                    <dt>Caja mínima</dt>
                    <dd style={{ color: r.minimumCash >= 5000 ? 'inherit' : 'var(--red, #b33a32)' }}>
                      {money.format(r.minimumCash)} (m{r.minimumCashMonth})
                    </dd>
                  </div>
                  <div>
                    <dt>Suscriptores m24</dt>
                    <dd>{number.format(r.activeSubscribersMonth24)}</dd>
                  </div>
                  <div>
                    <dt>Piso USD 5k</dt>
                    <dd>{r.violations.floor.length === 0 ? 'Cumple' : `${r.violations.floor.length} m fallados`}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Gráfico de caja de meses 0 a 24 con línea de piso de USD 5.000 */}
      <article className="finance-card chart-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Trayectoria de caja empresarial (Meses 0 a 24)</h3>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
              Evolución mensual para los cuatro planes frente al piso mandatorio de USD 5.000.
            </p>
          </div>
          <div className="finance-legend">
            {fourPlansSimulation.results.map((r) => (
              <span key={r.plan.id} style={{ display: 'inline-flex', alignItems: 'center', marginRight: '12px' }}>
                <i style={{ background: PLAN_COLORS[r.plan.id] ?? '#999', width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '5px' }} />
                <small>{r.plan.name}</small>
              </span>
            ))}
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ borderTop: '2px dashed #b6a66a', width: '16px', display: 'inline-block', marginRight: '5px' }} />
              <small>Piso USD 5.000</small>
            </span>
          </div>
        </div>

        <svg
          className="finance-chart"
          viewBox={`0 0 ${chartData.width} ${chartData.height}`}
          style={{ width: '100%', height: '360px', marginTop: '16px' }}
          role="img"
          aria-label="Gráfico de flujo de caja para los cuatro planes durante 24 meses"
        >
          {/* Líneas de cuadrícula horizontal Y */}
          {chartData.yTicks.map((tick) => {
            const y = chartData.scaleY(tick);
            return (
              <g key={tick}>
                <line
                  x1={chartData.padding.left}
                  y1={y}
                  x2={chartData.width - chartData.padding.right}
                  y2={y}
                  className="chart-grid-line"
                  stroke="#e4eae5"
                />
                <text
                  x={chartData.padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="chart-axis-label"
                  style={{ fontSize: '11px', fill: '#74857b' }}
                >
                  {moneyWhole.format(tick)}
                </text>
              </g>
            );
          })}

          {/* Línea horizontal del piso de USD 5.000 */}
          {5000 >= chartData.minVal && 5000 <= chartData.maxVal && (
            <g>
              <line
                x1={chartData.padding.left}
                y1={chartData.scaleY(5000)}
                x2={chartData.width - chartData.padding.right}
                y2={chartData.scaleY(5000)}
                stroke="#b6a66a"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <text
                x={chartData.width - chartData.padding.right - 4}
                y={chartData.scaleY(5000) - 6}
                textAnchor="end"
                style={{ fontSize: '11px', fill: '#8b7a42', fontWeight: 700 }}
              >
                Piso USD 5.000
              </text>
            </g>
          )}

          {/* Eje X y marcas de meses 0..24 */}
          {Array.from({ length: 25 }, (_, m) => m).map((m) => {
            const x = chartData.scaleX(m);
            const isLabel = m === 0 || m === 6 || m === 12 || m === 18 || m === 24;
            return (
              <g key={m}>
                {isLabel && (
                  <text
                    x={x}
                    y={chartData.height - 15}
                    textAnchor="middle"
                    className="chart-axis-label"
                    style={{ fontSize: '11px', fill: '#74857b' }}
                  >
                    {m === 0 ? 'M0' : `M${m}`}
                  </text>
                )}
              </g>
            );
          })}

          {/* Curvas de los cuatro planes */}
          {fourPlansSimulation.results.map((r) => {
            const color = PLAN_COLORS[r.plan.id] ?? '#447f70';
            const isHighlighted = r.plan.id === selectedPlanId;
            const points = r.cashSeries.map((val, m) => `${chartData.scaleX(m)},${chartData.scaleY(val)}`).join(' ');
            return (
              <g key={r.plan.id}>
                <polyline
                  points={points}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHighlighted ? '3.5' : '1.8'}
                  strokeOpacity={isHighlighted ? 1 : 0.65}
                />
                {r.cashSeries.map((val, m) => {
                  if (m !== 0 && m !== 12 && m !== 24 && val >= 5000) return null;
                  const cx = chartData.scaleX(m);
                  const cy = chartData.scaleY(val);
                  const isViolation = val < 5000;
                  return (
                    <circle
                      key={m}
                      cx={cx}
                      cy={cy}
                      r={isViolation ? 4.5 : isHighlighted ? 4 : 2.5}
                      fill={isViolation ? '#b33a32' : color}
                      stroke="#fff"
                      strokeWidth="1.5"
                    >
                      <title>{`${r.plan.name} · Mes ${m}: ${money.format(val)}`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </article>

      {/* 2. Editor de inversión mensual y palancas del Nivel 1 */}
      <article className="finance-card simulator-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Editor de estrategia: {activePlan.name}</h3>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
              Modificá las inversiones mes a mes o por tramos, y ajustá las palancas del Nivel 1.
            </p>
          </div>
          <button type="button" className="finance-button" onClick={handleResetCurrentPlan}>
            ↺ Restaurar {activePlan.name}
          </button>
        </div>

        {/* Aplicar rango rápido */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            background: 'var(--green-soft, #e8f1eb)',
            padding: '12px 16px',
            borderRadius: '10px',
            margin: '16px 0',
          }}
        >
          <strong style={{ fontSize: '13px', color: 'var(--green, #174738)' }}>Asignar rango:</strong>
          <label style={{ fontSize: '12px' }}>
            De mes:
            <input
              type="number"
              min="1"
              max="24"
              value={rangeFrom}
              onChange={(e) => setRangeFrom(Math.max(1, Math.min(24, Number(e.target.value))))}
              style={{ width: '55px', marginLeft: '6px', padding: '4px' }}
            />
          </label>
          <label style={{ fontSize: '12px' }}>
            A mes:
            <input
              type="number"
              min="1"
              max="24"
              value={rangeTo}
              onChange={(e) => setRangeTo(Math.max(1, Math.min(24, Number(e.target.value))))}
              style={{ width: '55px', marginLeft: '6px', padding: '4px' }}
            />
          </label>
          <label style={{ fontSize: '12px' }}>
            Inversión (USD):
            <input
              type="number"
              min="0"
              max="20000"
              step="500"
              value={rangeValue}
              onChange={(e) => setRangeValue(Number(e.target.value))}
              style={{ width: '90px', marginLeft: '6px', padding: '4px' }}
            />
          </label>
          <button type="button" className="finance-button primary" style={{ padding: '6px 12px' }} onClick={handleApplyRange}>
            Aplicar rango
          </button>
          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
            <button
              type="button"
              className="finance-button"
              style={{ padding: '4px 8px', fontSize: '11px' }}
              onClick={() => { setRangeFrom(1); setRangeTo(12); }}
            >
              M1–12
            </button>
            <button
              type="button"
              className="finance-button"
              style={{ padding: '4px 8px', fontSize: '11px' }}
              onClick={() => { setRangeFrom(13); setRangeTo(24); }}
            >
              M13–24
            </button>
            <button
              type="button"
              className="finance-button"
              style={{ padding: '4px 8px', fontSize: '11px' }}
              onClick={() => { setRangeFrom(1); setRangeTo(24); }}
            >
              Todos (1–24)
            </button>
          </div>
        </div>

        {/* Palancas del Nivel 1 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            padding: '14px',
            border: '1px solid #d9e2db',
            borderRadius: '10px',
            marginBottom: '18px',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={Boolean(activePlan.changes?.pack)}
              onChange={(e) => handleToggleChange('pack', e.target.checked)}
            />
            Pack 3 bolsas ($48)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={Boolean(activePlan.changes?.alternativeShipping)}
              onChange={(e) => handleToggleChange('alternativeShipping', e.target.checked)}
            />
            Envío alternativo (umbral $45)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={Boolean(activePlan.changes?.discount)}
              onChange={(e) => handleToggleChange('discount', e.target.checked)}
            />
            Descuento 30% primer pedido
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span>% Suscriptores:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={Math.round((activePlan.subscriberShare ?? 0.15) * 100)}
              onChange={(e) => handleParameterChange('subscriberShare', Number(e.target.value) / 100)}
              style={{ width: '60px', padding: '3px 6px' }}
            />
            %
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span>Churn mensual:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={Math.round((activePlan.churn ?? 0.09) * 100)}
              onChange={(e) => handleParameterChange('churn', Number(e.target.value) / 100)}
              style={{ width: '60px', padding: '3px 6px' }}
            />
            %
          </label>
        </div>

        {/* Cuadrícula de 24 meses de inversión */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
          {Array.from({ length: 24 }, (_, i) => i + 1).map((month) => {
            const val = activePlan.investments[month - 1];
            const isPost12 = month >= 13;
            const avg12 = activePlanResult.averageFirst12Investment;
            const isUnderAvg = isPost12 && val + 1e-9 < avg12;
            const isInvalidRange = val < 0 || val > 20000;

            return (
              <div
                key={month}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  background: isUnderAvg || isInvalidRange ? '#fff2f0' : '#fcfcfc',
                  border: `1px solid ${isUnderAvg || isInvalidRange ? '#ffccc7' : '#e4eae5'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)' }}>
                  <span>Mes {month}</span>
                  {isPost12 && <span title={`Promedio M1-12: $${avg12.toFixed(0)}`}>{val >= avg12 ? '✓' : '⚠️ < avg'}</span>}
                </div>
                <input
                  type="number"
                  min="0"
                  max="20000"
                  step="500"
                  value={val}
                  onChange={(e) => handleInvestmentChange(month, e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '4px',
                    padding: '4px 6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: '1px solid #d5ded7',
                    borderRadius: '6px',
                  }}
                />
              </div>
            );
          })}
        </div>
      </article>

      {/* 6. Tabla financiera mensual detallada con todas las columnas */}
      <article className="finance-card monthly-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Detalle financiero mensual de 24 meses ({activePlan.name})</h3>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
              Desglose completo de clientes, cohortes acumuladas, salidas de caja y saldo mensual.
            </p>
          </div>
          <span className="finance-pill">24 períodos</span>
        </div>

        <div className="finance-table-wrap" style={{ maxHeight: '420px', overflowY: 'auto' }}>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
              <tr>
                <th style={{ padding: '8px 6px', textAlign: 'center' }}>Mes</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Inversión Meta</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Clientes Meta</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Orgánicos</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Total Nuevos</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Sueltos</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Nuevos Subs</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Existentes</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Cohortes</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Salidas</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Caja Inicial</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Caja Final</th>
                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Subs Activos</th>
                <th style={{ padding: '8px 6px', textAlign: 'center' }}>Piso</th>
              </tr>
            </thead>
            <tbody>
              {activePlanResult.rows.map((r) => {
                const isUnderFloor = r.endingCash < 5000;
                return (
                  <tr
                    key={r.month}
                    style={{
                      background: isUnderFloor ? '#fff2f0' : r.month % 2 === 0 ? '#fafafa' : '#fff',
                      borderBottom: '1px solid #edf0ec',
                    }}
                  >
                    <td style={{ padding: '6px', textAlign: 'center', fontWeight: 600 }}>{r.month}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{moneyWhole.format(r.investment)}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{number.format(r.metaCustomers)}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{r.organicCustomers}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{number.format(r.totalNewCustomers)}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{number.format(r.oneTimeCustomers)}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{number.format(r.newSubscribers)}</td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{money.format(r.existingContribution)}</td>
                    <td style={{ padding: '6px', textAlign: 'right', fontWeight: 600, color: 'var(--green, #174738)' }}>
                      {money.format(r.cohortContribution)}
                    </td>
                    <td style={{ padding: '6px', textAlign: 'right', color: '#b33a32' }}>
                      {money.format(r.totalOutflows)}
                    </td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{money.format(r.openingCash)}</td>
                    <td
                      style={{
                        padding: '6px',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: isUnderFloor ? '#b33a32' : 'inherit',
                      }}
                    >
                      {money.format(r.endingCash)}
                    </td>
                    <td style={{ padding: '6px', textAlign: 'right' }}>{number.format(r.activeSubscribers)}</td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>
                      {isUnderFloor ? (
                        <span style={{ color: '#b33a32', fontWeight: 700 }}>⚠️ &lt; 5k</span>
                      ) : (
                        <span style={{ color: '#245b47' }}>✓</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>

      {/* 8. Verificación manual obligatoria del mes 1 */}
      <article className="finance-card academic-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <p className="finance-eyebrow">Validación formal rigurosa</p>
            <h3 style={{ margin: '4px 0 0', fontSize: '18px' }}>
              Verificación manual obligatoria — Mes 1 (Plan USD 8.000)
            </h3>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
              Cálculo aritmético independiente paso a paso desarrollado sin llamar al motor de simulación.
            </p>
          </div>
          <span
            className="finance-pill"
            style={{
              background: manualVerification.matchesEngine ? '#eaf3ec' : '#fff0e8',
              color: manualVerification.matchesEngine ? '#245b47' : '#b33a32',
              fontWeight: 700,
            }}
          >
            {manualVerification.matchesEngine ? '✓ 100% Coincidencia con motor (Dif: $0.00)' : '⚠️ Discrepancia'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '16px' }}>
          {manualVerification.steps.map((s) => (
            <div
              key={s.step}
              style={{
                padding: '12px 14px',
                background: '#fafcfa',
                border: '1px solid #d9e2db',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--green, #174738)' }}>
                  Paso {s.step}: {s.title}
                </strong>
              </div>
              <p style={{ margin: '0 0 6px', fontSize: '11px', color: 'var(--muted)' }}>
                <b>Fórmula:</b> {s.formula}
              </p>
              <code style={{ display: 'block', fontSize: '11px', background: '#fff', padding: '6px 8px', borderRadius: '4px', border: '1px solid #e8edea', marginBottom: '6px' }}>
                {s.substitution}
              </code>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#174738' }}>
                Resultado: {s.result}
              </p>
            </div>
          ))}
        </div>
      </article>

      {/* 9. Optimización: Mejor plan encontrado y 10. Pitch de inversión */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Mejor plan encontrado */}
        <article className="finance-card recommendation-card">
          <p className="finance-eyebrow">Búsqueda reproducible</p>
          <h3 style={{ margin: '4px 0 10px', fontSize: '18px' }}>Mejor plan encontrado</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 12px' }}>
            {bestPlanSearch.method}
          </p>

          {bestPlanSearch.best ? (
            <div>
              <div
                style={{
                  background: 'var(--green-soft, #e8f1eb)',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '14px',
                }}
              >
                <strong style={{ fontSize: '15px', color: 'var(--green, #174738)' }}>
                  {bestPlanSearch.best.plan.name}
                </strong>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px', fontSize: '13px' }}>
                  <div>
                    <span>Caja final m24:</span>{' '}
                    <strong>{money.format(bestPlanSearch.best.finalCash)}</strong>
                  </div>
                  <div>
                    <span>Caja mínima:</span>{' '}
                    <strong>{money.format(bestPlanSearch.best.minimumCash)}</strong>
                  </div>
                  <div>
                    <span>Suscriptores m24:</span>{' '}
                    <strong>{number.format(bestPlanSearch.best.activeSubscribersMonth24)}</strong>
                  </div>
                  <div>
                    <span>Inversión total:</span>{' '}
                    <strong>{moneyWhole.format(bestPlanSearch.best.totalInvestment)}</strong>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                Se evaluaron {bestPlanSearch.evaluatedCount} combinaciones respetando todas las restricciones (piso USD 5.000, rango 0–20k, regla de inversión mes 13+). Factibles encontradas: {bestPlanSearch.feasibleCount}.
              </p>

              <button
                type="button"
                className="finance-button primary"
                style={{ width: '100%', marginTop: '8px' }}
                onClick={handleLoadBestPlan}
              >
                Cargar esta estrategia en &quot;Estrategia propia A&quot;
              </button>
            </div>
          ) : (
            <p style={{ color: 'var(--red, #b33a32)' }}>No se encontraron planes factibles con el paso actual.</p>
          )}
        </article>

        {/* Pitch de inversión de 2 minutos */}
        <article className="finance-card recommendation-card">
          <p className="finance-eyebrow">Argumento ejecutivo</p>
          <h3 style={{ margin: '4px 0 10px', fontSize: '18px' }}>Pitch de inversión (2 minutos)</h3>
          <div
            style={{
              lineHeight: 1.6,
              fontSize: '13px',
              color: 'var(--ink, #1e3029)',
              background: '#fbfcfb',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid #d9e2db',
            }}
          >
            <p style={{ margin: '0 0 10px' }}>
              <strong>Propuesta:</strong> {pitchText}
            </p>
            <div style={{ borderTop: '1px solid #edf0ec', paddingTop: '10px', marginTop: '10px', fontSize: '12px', color: 'var(--muted)' }}>
              <strong>Puntos clave para el comité:</strong>
              <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                <li>Descartar la duplicación automática propuesta por la agencia (Plan 2 entra en insolvencia en el mes 3).</li>
                <li>Monitorear la tasa de adopción real del Pack y la retención mes a mes.</li>
                <li>Garantizar que la caja nunca descienda de USD 5.000 en ningún escenario.</li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

