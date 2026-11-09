import { useMemo, useState } from 'react';
import { REWARD_CONFIG, createDemoReferral, createReferralLink, createWhatsAppShareLink, getRewardsSummary, loadRewardsState, registerDemoReferral, resetRewardsState, saveRewardsState, simulateEligiblePurchase } from '../growth/rewardsDemo.js';
import { getReferralCode as readReferralCode } from '../config/routing.js';
import { clearActiveDemoRole, DEMO_ROLE } from '../config/accessControl.js';
import { clearActiveDemoProfile, completeGuestReferralPurchase, findDemoProfileByCode, getActiveDemoProfile, getRewardStorageKey, loadDemoProfiles, loadGuestReferralState, loadProfileRewardsState } from '../growth/demoProfiles.js';

const date = new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' });
const money = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

export default function TuesteRewards({ role = DEMO_ROLE.GUEST }) {
  const activeProfile = role === DEMO_ROLE.CLIENT ? (getActiveDemoProfile(window.localStorage) ?? loadDemoProfiles(window.localStorage)[0]) : null;
  const profileStorageKey = activeProfile ? getRewardStorageKey(activeProfile.id) : undefined;
  const [state, setState] = useState(() => activeProfile ? loadProfileRewardsState(window.localStorage, activeProfile) : loadRewardsState(window.localStorage));
  const [screen, setScreen] = useState('inicio');
  const [notice, setNotice] = useState('');
  const [guestPurchase, setGuestPurchase] = useState(() => loadGuestReferralState(window.sessionStorage));
  const summary = useMemo(() => getRewardsSummary(state), [state]);
  const referralLink = createReferralLink(state.inviter.code, window.location.origin);
  const shareLink = createWhatsAppShareLink({ referralLink, inviterName: state.inviter.name });
  const referralCode = (() => {
    const linkedCode = readReferralCode(window.location.hash);
    if (linkedCode) {
      window.sessionStorage.setItem('tueste-referral-code', linkedCode);
      return linkedCode;
    }
    return window.sessionStorage.getItem('tueste-referral-code') ?? '';
  })();
  const invitedProfile = referralCode ? findDemoProfileByCode(window.localStorage, referralCode) : null;
  const commit = (result, success) => { if (result.status === 'ok') { saveRewardsState(window.localStorage, result.value, profileStorageKey); setState(result.value); setNotice(success); } else setNotice(`Acción bloqueada: ${result.reason ?? 'datos no válidos'}.`); };
  const demoReferral = () => commit(createDemoReferral(state, { friendId: `amigo-demo-${state.sequence}` }), 'Invitación DEMO creada.');
  const target = state.referrals.find((item) => !item.registeredAt)
    ?? state.referrals.find((item) => item.registeredAt && !item.purchaseEventId)
    ?? state.referrals.at(-1)
    ?? null;
  const register = () => target && commit(registerDemoReferral(state, target.id), 'Registro DEMO confirmado.');
  const purchase = () => { const candidate = state.referrals.find((item) => item.registeredAt && !item.purchaseEventId); if (candidate) commit(simulateEligiblePurchase(state, candidate.id), 'Compra DEMO válida registrada; no se procesó pago real.'); };
  const copy = async () => { try { await navigator.clipboard.writeText(referralLink); setNotice('Enlace copiado al portapapeles.'); } catch { setNotice('No se pudo copiar automáticamente. Selecciona el enlace para copiarlo.'); } };
  const events = [...state.events].reverse();
  const tabs = [['inicio', 'Inicio'], ['enlace', 'Mi enlace'], ['progreso', 'Progreso'], ['historial', 'Historial']];
  if (role === DEMO_ROLE.ADMIN) tabs.push(['demo', 'Simulador DEMO']);
  const logout = () => {
    clearActiveDemoRole(window.sessionStorage);
    clearActiveDemoProfile(window.localStorage);
    window.sessionStorage.removeItem('tueste-referral-code');
    window.location.hash = 'inicio';
  };
  const completeGuestPurchase = () => {
    const result = completeGuestReferralPurchase(window.localStorage, window.sessionStorage, referralCode);
    if (result.status === 'ok') { setGuestPurchase(loadGuestReferralState(window.sessionStorage)); setNotice('Compra DEMO confirmada. Beneficio aplicado; no se procesó ningún pago real.'); }
    else setNotice(result.reason === 'inviter_unavailable' ? 'Invitación visible, pero el perfil del invitador no está disponible en este navegador. La compra DEMO no se sincroniza entre dispositivos.' : `Compra bloqueada: ${result.reason}.`);
  };
  return <section className="rewards-workspace" id="tueste-rewards">
    <header className="rewards-hero"><div><p className="finance-eyebrow">Tueste Rewards · DEMO local</p><h1>Un café compartido sabe mejor.</h1><p>Invita después de probar Tueste y sigue el progreso de tus recompensas. Ninguna compra ni premio de esta pantalla es real.</p></div><div className="rewards-hero-actions"><span className="context-label demo">Estado persistente en este navegador</span>{role !== DEMO_ROLE.GUEST && <button className="finance-button" type="button" onClick={logout}>Cerrar sesión DEMO</button>}</div></header>
    {role === DEMO_ROLE.CLIENT && <aside className="rewards-account-welcome" aria-label="Bienvenida a la cuenta DEMO">
      <strong>Cuenta DEMO local · {activeProfile?.name ?? state.inviter.name}</strong>
      <p>Ingresó correctamente a su cuenta de demostración. Desde aquí puede conocer más sobre Tueste, consultar su enlace personal, seguir recompensas y explorar cómo funciona el programa.</p>
      <span>Esta cuenta se conserva únicamente en este navegador y no representa un inicio de sesión real.</span>
    </aside>}
    {referralCode && <aside className="rewards-referral-banner" aria-label="Beneficio de invitado"><strong>Invitación recibida</strong><span>{invitedProfile?.name ?? 'Tueste'} te invitó. Código {referralCode}. Beneficio DEMO preaplicado: USD 5 en tu primera compra simulada.</span>{role === DEMO_ROLE.ADMIN ? <button type="button" onClick={() => setScreen('demo')}>Continuar compra simulada</button> : <><button type="button" onClick={() => setScreen('inicio')}>Explorar Tueste Rewards</button>{!guestPurchase || guestPurchase.status !== 'purchased' ? <button type="button" onClick={completeGuestPurchase}>Confirmar compra DEMO</button> : <strong>Compra DEMO confirmada</strong>}</>}</aside>}
    <nav className="rewards-tabs" aria-label="Secciones de Tueste Rewards">{tabs.map(([id, label]) => <button key={id} type="button" className={screen === id ? 'active' : ''} onClick={() => setScreen(id)}>{label}</button>)}</nav>
    {notice && <p className="rewards-notice" role="status">{notice}</p>}
    {screen === 'inicio' && <div className="rewards-grid"><article className="rewards-card rewards-welcome"><p className="finance-eyebrow">Hola, {state.inviter.name}</p><h2>Comparte Tueste con alguien que disfrute el café.</h2><p>Tu amigo recibe un beneficio DEMO aplicado y tú progresas por recompensas configurables.</p><button className="finance-button primary" type="button" onClick={() => setScreen('enlace')}>Invitar a un amigo</button></article><article className="rewards-card"><h2>Recompensas propuestas DEMO</h2>{REWARD_CONFIG.levels.map((level) => <p key={level.id}><strong>{level.threshold} amigo{level.threshold > 1 ? 's' : ''} válido{level.threshold > 1 ? 's' : ''}:</strong> {level.label}</p>)}<button className="text-action" type="button" onClick={() => setScreen('historial')}>Ver historial</button></article></div>}
    {screen === 'enlace' && <article className="rewards-card rewards-link"><p className="finance-eyebrow">Tu enlace personal DEMO</p><h2>{state.inviter.code}</h2><label>Enlace de invitación<input readOnly value={referralLink} aria-label="Enlace personal de referido" /></label><div className="finance-actions"><button className="finance-button" type="button" onClick={copy}>Copiar enlace</button><a className="finance-button primary" href={shareLink} target="_blank" rel="noreferrer">Compartir por WhatsApp</a></div><p>Abre la intención de compartir de WhatsApp; no confirma ni registra el envío automático de un mensaje.</p></article>}
    {screen === 'progreso' && <><div className="rewards-stats">{[['Invitados', summary.invited], ['Registrados', summary.registered], ['Compras válidas', summary.validReferrals], ['Recompensas', summary.rewards]].map(([label, value]) => <article className="rewards-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div><article className="rewards-card rewards-progress"><h2>Tu progreso</h2><div className="progress-track"><i style={{ width: `${Math.min(100, summary.validReferrals / 3 * 100)}%` }} /></div><p>{summary.nextLevel ? `Faltan ${summary.nextLevel.threshold - summary.validReferrals} compra(s) válida(s) para: ${summary.nextLevel.label}.` : 'Completaste todos los niveles configurados para esta DEMO.'}</p><p>Costos DEMO atribuibles: {summary.costs ? money.format(summary.costs.attributableCost) : '—'} · Tope derivado pendiente de confirmar: {summary.costs ? (summary.costs.withinCap ? 'dentro' : 'fuera') : 'sin referidos'}.</p></article></>}
    {screen === 'historial' && <article className="rewards-card"><h2>Historial DEMO</h2><ol className="rewards-history">{events.map((item) => <li key={item.id}><strong>{item.type.replaceAll('_', ' ')}</strong><span>{item.message}</span><time>{date.format(new Date(item.at))}</time></li>)}</ol></article>}
    {screen === 'demo' && role === DEMO_ROLE.ADMIN && <article className="rewards-card rewards-simulator">
      <p className="finance-eyebrow">Herramienta administrativa · No procesa pagos reales</p>
      <h2>Simulador de conversiones</h2>
      <p>Cree una invitación, confirme el registro y valide la compra en ese orden.</p>
      <ol className="rewards-simulator-steps" aria-live="polite">
        <li><strong>1. Invitación:</strong> {target ? `Código ${target.code}; invitación creada.` : 'Aún no hay una invitación activa.'}</li>
        <li><strong>2. Registro:</strong> {target?.registeredAt ? `${target.friendId} quedó registrado.` : 'Pendiente de completar el paso 1.'}</li>
        <li><strong>3. Compra:</strong> {target?.purchaseEventId ? 'Compra válida registrada; Rewards y Growth actualizados.' : target?.registeredAt ? 'Listo para validar la compra.' : 'Pendiente de completar el registro.'}</li>
      </ol>
      <div className="finance-actions">
        <button className="finance-button" type="button" onClick={demoReferral}>1. Crear referido</button>
        <button className="finance-button" type="button" disabled={!target || Boolean(target.registeredAt)} onClick={register}>2. Simular registro</button>
        <button className="finance-button primary" type="button" disabled={!target?.registeredAt || Boolean(target.purchaseEventId)} onClick={purchase}>3. Simular compra válida</button>
      </div>
      <button className="text-action danger" type="button" onClick={() => {
        if (!window.confirm('¿Reiniciar únicamente el escenario DEMO de referidos?')) return;
        const reset = resetRewardsState(window.localStorage);
        setState(reset);
        setNotice('Escenario DEMO reiniciado. Puede comenzar una nueva prueba.');
      }}>Reiniciar escenario DEMO</button>
    </article>}
  </section>;
}
