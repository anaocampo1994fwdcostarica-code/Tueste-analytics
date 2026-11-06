const money = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 });
const number = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 8 });
const integer = new Intl.NumberFormat('es-CR', { maximumFractionDigits: 0 });
const statusLabel = { active: 'Activa', paused: 'Pausada', cancelled: 'Cancelada', accepted: 'Aceptado', rejected: 'Rechazado', pending: 'Pendiente', published: 'Publicado', approved: 'Aprobado', in_review: 'En revisión', draft: 'Borrador', won: 'Ganada', lost: 'Perdida' };

const finite = (value) => value !== null && value !== '' && Number.isFinite(Number(value));
const format = (formatter) => (value) => finite(value) ? formatter.format(Number(value)) : '—';
const formatMoney = format(money);
const formatNumber = format(number);
const formatInteger = format(integer);
const formatPercent = (value) => finite(value) ? `${number.format(Number(value) * 100)} %` : '—';

function Section({ id, eyebrow, title, description, children }) {
  return <section className="dashboard-section" id={id}><header className="section-header"><p className="section-eyebrow">{eyebrow}</p><h2>{title}</h2>{description && <p>{description}</p>}</header>{children}</section>;
}

function State({ loading, error, empty, onRetry }) {
  if (loading) return <div className="state-message" role="status"><span className="loader" aria-hidden="true"/>Consultando la base académica…</div>;
  if (error) return <div className="state-message error" role="alert"><strong>No fue posible cargar los datos.</strong><span>{error}</span>{onRetry && <button type="button" onClick={onRetry}>Reintentar</button>}</div>;
  if (empty) return <p className="state-message">La consulta se completó, pero no devolvió registros.</p>;
  return null;
}

function Table({ columns, rows, loading, error, onRetry }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  if (loading || error || !safeRows.length) return <State loading={loading} error={error} empty={!safeRows.length} onRetry={onRetry}/>;
  return <div className="table-wrap"><table className="data-table"><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead><tbody>{safeRows.map((row, index) => <tr key={row.id ?? index}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row[column.key], row) : row[column.key] ?? '—'}</td>)}</tr>)}</tbody></table></div>;
}

export default function CommercialDashboard({ data, loading, onRetry }) {
  const hasError = Boolean(data.error);
  const summary = Array.isArray(data.summary) ? data.summary[0] : null;
  const kpis = [
    ['Campañas', summary?.campaigns, formatInteger], ['Leads', summary?.leads, formatInteger],
    ['Conversión', finite(summary?.converted_leads) && finite(summary?.leads) && Number(summary.leads) > 0 ? Number(summary.converted_leads) / Number(summary.leads) : null, formatPercent],
    ['Ingresos reconocidos', summary?.recognized_revenue_usd, formatMoney], ['CPC', summary?.cpc_usd, formatMoney],
    ['CTR', summary?.ctr_percent, (value) => finite(value) ? `${formatNumber(value)} %` : '—'], ['CAC', summary?.cac_usd, formatMoney], ['ROAS', summary?.roas, formatNumber],
    ['Ciclo de venta', summary?.average_sales_cycle_days, (value) => finite(value) ? `${formatNumber(value)} días` : '—'],
    ['Ticket promedio', summary?.average_ticket_usd, formatMoney],
  ];

  return <>
    <header className="dashboard-hero" id="dashboard-comercial"><div><div className="commercial-context"><p className="section-eyebrow">Inteligencia comercial</p><span className="context-label demo">Datos de demostración</span></div><h1>Decisiones rentables, con datos verificables</h1><p>Campañas, clientes, suscripciones y resultados comerciales ficticios en una sola vista.</p></div><div className={`connection-chip ${hasError ? 'offline' : 'online'}`}><span aria-hidden="true"/>{loading ? 'Conectando…' : hasError ? 'API sin conexión' : `${data.health?.tableCount ?? '—'} tablas · MySQL conectado`}</div></header>

    <Section id="resumen-comercial" eyebrow="Resumen comercial" title="Dashboard comercial" description="Indicadores calculados por MySQL sobre los registros ficticios validados."><State loading={loading} error={data.error} onRetry={onRetry}/>{!loading && !hasError && <div className="kpi-grid commercial-kpis">{kpis.map(([label, value, formatter]) => <article className="kpi-card" key={label}><span className="kpi-label">{label}</span><strong className="kpi-value">{formatter(value)}</strong><span className="kpi-detail">Métrica comercial consultada en tiempo real.</span></article>)}</div>}</Section>

    <Section id="campanas" eyebrow="Publicidad" title="Campañas y canales" description="Métricas de vanidad y resultados de negocio, visibles sin mezclarlas."><Table rows={data.campaigns} loading={loading} error={data.error} onRetry={onRetry} columns={[{ key: 'name', label: 'Campaña' }, { key: 'channel', label: 'Canal' }, { key: 'impressions', label: 'Impresiones', render: formatInteger }, { key: 'clicks', label: 'Clics', render: formatInteger }, { key: 'media_spend_usd', label: 'Gasto', render: formatMoney }, { key: 'cpc_usd', label: 'CPC', render: formatMoney }, { key: 'ctr_rate', label: 'CTR', render: formatPercent }, { key: 'cac_usd', label: 'CAC', render: formatMoney }, { key: 'roas', label: 'ROAS', render: formatNumber }]}/></Section>

    <Section id="embudo" eyebrow="Ventas" title="Embudo y oportunidades" description="Avance por etapa, conversiones observadas y ciclo comercial.">{!loading && !hasError && Array.isArray(data.funnel) && data.funnel.length > 0 && <div className="funnel-bars">{data.funnel.map((stage) => <div key={stage.id}><span>{stage.name}</span><strong>{formatInteger(stage.leads)}</strong><i style={{ width: `${Math.max(12, Number(stage.leads) / 12 * 100)}%` }}/></div>)}</div>}<Table rows={data.conversions} loading={loading} error={data.error} onRetry={onRetry} columns={[{ key: 'from_stage', label: 'Origen' }, { key: 'to_stage', label: 'Destino' }, { key: 'entered', label: 'Entradas', render: formatInteger }, { key: 'transitioned', label: 'Avances', render: formatInteger }, { key: 'conversion_rate', label: 'Conversión', render: formatPercent }]}/><Table rows={data.opportunities} loading={loading} error={data.error} onRetry={onRetry} columns={[{ key: 'contact', label: 'Contacto' }, { key: 'status', label: 'Estado', render: (value) => statusLabel[value] || value }, { key: 'expected_value_usd', label: 'Valor esperado', render: formatMoney }, { key: 'sales_cycle_days', label: 'Ciclo (días)', render: formatNumber }]}/></Section>

    <Section id="clientes" eyebrow="Relación recurrente" title="Clientes, suscripciones y pedidos" description="Trazabilidad desde el contacto hasta el ingreso reconocido."><h3 className="table-title">Clientes</h3><Table rows={data.customers} loading={loading} error={data.error} onRetry={onRetry} columns={[{ key: 'name', label: 'Cliente' }, { key: 'company_name', label: 'Empresa' }, { key: 'customer_type', label: 'Tipo' }, { key: 'leads', label: 'Leads', render: formatInteger }, { key: 'subscriptions', label: 'Suscripciones', render: formatInteger }]}/><h3 className="table-title">Suscripciones</h3><Table rows={data.subscriptions} loading={loading} error={data.error} onRetry={onRetry} columns={[{ key: 'customer', label: 'Cliente' }, { key: 'customer_type', label: 'Tipo' }, { key: 'plan', label: 'Plan' }, { key: 'status', label: 'Estado', render: (value) => statusLabel[value] || value }, { key: 'orders', label: 'Pedidos', render: formatInteger }, { key: 'recognized_revenue_usd', label: 'Ingreso', render: formatMoney }]}/><h3 className="table-title">Pedidos</h3><Table rows={data.orders} loading={loading} error={data.error} onRetry={onRetry} columns={[{ key: 'order_number', label: 'Pedido' }, { key: 'customer', label: 'Cliente' }, { key: 'status', label: 'Estado' }, { key: 'ordered_at', label: 'Fecha' }, { key: 'recognized_revenue_usd', label: 'Ingreso reconocido', render: formatMoney }]}/></Section>

    <Section id="contenidos" eyebrow="Gobernanza" title="Contenidos y aprobaciones"><Table rows={data.contents} loading={loading} error={data.error} onRetry={onRetry} columns={[{ key: 'title', label: 'Contenido' }, { key: 'content_type', label: 'Tipo' }, { key: 'author', label: 'Autor' }, { key: 'status', label: 'Estado', render: (value) => statusLabel[value] || value }, { key: 'reviews', label: 'Revisiones', render: formatInteger }]}/></Section>

    <Section id="traspasos" eyebrow="Mercadeo → ventas" title="Traspasos a ventas"><Table rows={data.handoffs} loading={loading} error={data.error} onRetry={onRetry} columns={[{ key: 'lead_id', label: 'Lead' }, { key: 'marketing_owner', label: 'Mercadeo' }, { key: 'sales_owner', label: 'Ventas' }, { key: 'decision', label: 'Decisión', render: (value) => statusLabel[value] || value }, { key: 'decision_hours', label: 'Horas', render: formatNumber }, { key: 'followups', label: 'Seguimientos', render: formatInteger }]}/></Section>

    <aside className="commercial-methodology" aria-label="Alcance de los datos comerciales"><strong>Alcance de esta vista.</strong> CPC, CTR, CAC, ROAS, conversión, ciclo y ticket provienen de registros ficticios de MySQL. No se usan para reemplazar el modelo financiero académico ni para estimar impuestos, CAPEX, deuda o caja bancaria real.</aside>
  </>;
}
