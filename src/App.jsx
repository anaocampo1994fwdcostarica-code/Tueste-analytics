import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import LevelThreeSimulator from './components/LevelThreeSimulator.jsx';
import CommercialDashboard from './components/CommercialDashboard.jsx';
import { loadCommercialData } from './services/api.js';

const FINANCIAL_VIEWS = new Set(['panel-principal', 'escenarios', 'nivel-2', 'simulador', 'flujo-caja', 'recomendacion']);
const getActiveView = () => window.location.hash.slice(1) || 'panel-principal';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commercial, setCommercial] = useState({ error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const [activeView, setActiveView] = useState(getActiveView);
  useEffect(() => {
    const syncView = () => setActiveView(getActiveView());
    window.addEventListener('hashchange', syncView);
    return () => window.removeEventListener('hashchange', syncView);
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
    <div className={`app-shell${collapsed ? ' sidebar-collapsed' : ''}`} data-currency="USD">
      <a className="skip-link" href="#contenido-principal">Saltar al contenido principal</a>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((current) => !current)}
      />
      <main id="contenido-principal">
        {FINANCIAL_VIEWS.has(activeView) && <Dashboard activeView={activeView} />}
        {activeView === 'nivel-3' && <LevelThreeSimulator />}
        {activeView === 'dashboard-comercial' && <CommercialDashboard data={commercial} loading={loading} onRetry={() => setReloadKey((key) => key + 1)} />}
      </main>
    </div>
  );
}
