import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import LevelThreeSimulator from './components/LevelThreeSimulator.jsx';
import CommercialDashboard from './components/CommercialDashboard.jsx';
import TuesteRewards from './components/TuesteRewards.jsx';
import GrowthDashboard from './components/GrowthDashboard.jsx';
import LandingPage from './components/LandingPage.jsx';
import { normalizeHashRoute } from './config/routing.js';
import { DEMO_ROLE_CHANGE_EVENT, canAccessRoute, getActiveDemoRole } from './config/accessControl.js';
import { loadCommercialData } from './services/api.js';

const FINANCIAL_VIEWS = new Set(['panel-principal', 'escenarios', 'nivel-2', 'simulador', 'flujo-caja', 'recomendacion']);
const getActiveView = () => normalizeHashRoute(window.location.hash);

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commercial, setCommercial] = useState({ error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const [activeView, setActiveView] = useState(getActiveView);
  const [activeRole, setActiveRole] = useState(getActiveDemoRole);
  useEffect(() => {
    const syncView = () => {
      setActiveView(getActiveView());
      setActiveRole(getActiveDemoRole());
    };
    window.addEventListener('hashchange', syncView);
    window.addEventListener(DEMO_ROLE_CHANGE_EVENT, syncView);
    return () => {
      window.removeEventListener('hashchange', syncView);
      window.removeEventListener(DEMO_ROLE_CHANGE_EVENT, syncView);
    };
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeView]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    loadCommercialData().then((commercialResult) => {
      if (!active) return;
      setCommercial(commercialResult);
      setLoading(false);
    });
    return () => { active = false; };
  }, [reloadKey]);
  return (
    activeView === 'inicio' || activeView.startsWith('inicio?') ? <LandingPage /> :
    !canAccessRoute(activeView, activeRole) ? (
      <div className="public-access-denied">
        <div>
          <p className="public-eyebrow public-eyebrow-dark">Acceso DEMO</p>
          <h1>No tiene acceso a esta sección.</h1>
          <p>El acceso solicitado requiere otro rol de demostración.</p>
          <button className="public-button public-button-dark" type="button" onClick={() => { window.location.hash = 'inicio'; }}>Volver al inicio</button>
        </div>
      </div>
    ) :
    <div className={`app-shell${collapsed ? ' sidebar-collapsed' : ''}`} data-currency="USD">
      <a className="skip-link" href="#contenido-principal">Saltar al contenido principal</a>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((current) => !current)}
        role={activeRole}
      />
      <main id="contenido-principal">
        {FINANCIAL_VIEWS.has(activeView) && <Dashboard activeView={activeView} />}
        {activeView === 'nivel-3' && <LevelThreeSimulator />}
        {activeView === 'dashboard-comercial' && <CommercialDashboard data={commercial} loading={loading} onRetry={() => setReloadKey((key) => key + 1)} />}
        {activeView === 'tueste-rewards' && <TuesteRewards role={activeRole} />}
        {activeView === 'panel-growth' && <GrowthDashboard />}
      </main>
    </div>
  );
}
