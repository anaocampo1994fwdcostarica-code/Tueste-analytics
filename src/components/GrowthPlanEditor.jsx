import { useState } from 'react';
import { PLAN_STATUSES, addGrowthPlanAction, deleteGrowthPlanAction, loadGrowthPlanState, resetGrowthPlanState, saveGrowthPlanState, updateGrowthPlanAction } from '../growth/growthPlan.js';

const emptyAction = { period: 'Días 1–30', action: '', owner: '', hypothesis: '', metric: '', counter: '', goal: '', status: 'propuesto' };
const fields = [['period', 'Período'], ['action', 'Acción'], ['owner', 'Responsable'], ['metric', 'Métrica'], ['counter', 'Contramétrica'], ['goal', 'Meta']];

export default function GrowthPlanEditor() {
  const [plan, setPlan] = useState(() => loadGrowthPlanState(window.localStorage));
  const [draft, setDraft] = useState(emptyAction);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState('Los cambios se guardan localmente en este navegador.');
  const commit = (next, message) => { saveGrowthPlanState(window.localStorage, next); setPlan(next); setNotice(message); };
  const changeDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    const result = editingId ? updateGrowthPlanAction(plan, editingId, draft) : addGrowthPlanAction(plan, draft);
    if (result.status !== 'ok') return setNotice('Completa todos los campos obligatorios antes de guardar.');
    commit(result.value, editingId ? 'Acción actualizada y guardada.' : 'Acción creada y guardada.');
    setDraft(emptyAction); setEditingId(null);
  };
  const edit = (action) => { setEditingId(action.id); setDraft({ ...action }); setNotice(`Editando: ${action.action}`); };
  const remove = (action) => {
    if (!window.confirm(`¿Eliminar la acción “${action.action}”?`)) return;
    const result = deleteGrowthPlanAction(plan, action.id);
    if (result.status === 'ok') commit(result.value, 'Acción eliminada.');
  };
  const changeStatus = (id, status) => { const result = updateGrowthPlanAction(plan, id, { status }); if (result.status === 'ok') commit(result.value, 'Estado actualizado.'); };
  const reset = () => { if (window.confirm('¿Restablecer el plan DEMO y descartar los cambios locales?')) { setDraft(emptyAction); setEditingId(null); commit(resetGrowthPlanState(window.localStorage), 'Plan DEMO restablecido.'); } };

  return <section className="growth-section growth-plan-editor"><div className="growth-plan-heading"><div><p className="finance-eyebrow">Plan de 90 días · persistente</p><h2>Más → Mejor → Nuevo</h2></div><button className="btn btn-secondary" type="button" onClick={reset}>Restablecer plan DEMO</button></div><p className="rewards-notice" aria-live="polite">{notice}</p>
    <div className="finance-table-wrap"><table><thead><tr><th>Período</th><th>Acción</th><th>Responsable</th><th>Métrica</th><th>Contramétrica</th><th>Meta</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{plan.actions.map((row) => <tr key={row.id}><td>{row.period}</td><td>{row.action}</td><td>{row.owner}</td><td>{row.metric}</td><td>{row.counter}</td><td>{row.goal}</td><td><select aria-label={`Estado de ${row.action}`} value={row.status} onChange={(event) => changeStatus(row.id, event.target.value)}>{PLAN_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></td><td><div className="plan-row-actions"><button type="button" onClick={() => edit(row)}>Editar</button><button type="button" onClick={() => remove(row)}>Eliminar</button></div></td></tr>)}</tbody></table></div>
    <form className="growth-plan-form" onSubmit={submit}><h3>{editingId ? 'Editar acción' : 'Crear acción'}</h3><div className="growth-plan-fields">{fields.map(([key, label]) => <label key={key}>{label}<input required value={draft[key]} onChange={(event) => changeDraft(key, event.target.value)} /></label>)}<label>Estado<select value={draft.status} onChange={(event) => changeDraft('status', event.target.value)}>{PLAN_STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label></div><label>Hipótesis (opcional)<input value={draft.hypothesis ?? ''} onChange={(event) => changeDraft('hypothesis', event.target.value)} /></label><div className="finance-actions"><button className="btn btn-primary" type="submit">{editingId ? 'Guardar cambios' : 'Crear acción'}</button>{editingId && <button className="btn btn-secondary" type="button" onClick={() => { setEditingId(null); setDraft(emptyAction); }}>Cancelar</button>}</div></form>
  </section>;
}
