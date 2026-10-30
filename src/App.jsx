import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Escenarios from './components/Escenarios.jsx';
import Simulador from './components/Simulador.jsx';
import FlujoCaja from './components/FlujoCaja.jsx';
import Recomendacion from './components/Recomendacion.jsx';

export default function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`app-shell${collapsed ? ' sidebar-collapsed' : ''}`} data-currency="USD">
      <a className="skip-link" href="#contenido-principal">Saltar al contenido principal</a>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((current) => !current)}
      />
      <main id="contenido-principal">
        <Dashboard />
        <Escenarios />
        <Simulador />
        <FlujoCaja />
        <Recomendacion />
      </main>
    </div>
  );
}
