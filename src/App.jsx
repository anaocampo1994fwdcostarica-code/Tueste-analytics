import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import CommercialDashboard from './components/CommercialDashboard.jsx';
import { loadCommercialData } from './services/api.js';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commercial, setCommercial] = useState({ error: null });
  const [reloadKey, setReloadKey] = useState(0);
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
        <Dashboard />
        <CommercialDashboard data={commercial} loading={loading} onRetry={() => setReloadKey((key) => key + 1)} />
      </main>
    </div>
  );
}
