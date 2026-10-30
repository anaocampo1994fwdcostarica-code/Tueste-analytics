import { useEffect, useState } from 'react';

const navigation = [
  { id: 'dashboard', label: 'Panel principal', icon: 'nav-icon-panel' },
  { id: 'comparacion', label: 'Escenarios', icon: 'nav-icon-scenarios' },
  { id: 'simulador', label: 'Simulador', icon: 'nav-icon-simulator' },
  { id: 'flujo-caja', label: 'Flujo de caja', icon: 'nav-icon-cashflow' },
  { id: 'conclusiones', label: 'Recomendación', icon: 'nav-icon-recommendation' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const [active, setActive] = useState(window.location.hash.slice(1) || 'dashboard');

  useEffect(() => {
    const syncActiveSection = () => setActive(window.location.hash.slice(1) || 'dashboard');
    window.addEventListener('hashchange', syncActiveSection);
    return () => window.removeEventListener('hashchange', syncActiveSection);
  }, []);

  return (
    <aside className="sidebar" id="sidebar">
      <div className="brand-row">
        <div className="brand" aria-label="Tueste Analytics">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-copy">
            <strong>TUESTE</strong>
            <span>ANALYTICS</span>
          </span>
        </div>
        <button
          className="sidebar-toggle"
          type="button"
          aria-controls="sidebar"
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral'}
          onClick={onToggle}
        >
          <span aria-hidden="true" />
        </button>
      </div>

      <nav className="side-nav" aria-label="Navegación principal">
        <ul>
          {navigation.map((item) => (
            <li key={item.id}>
              <a
                className={`nav-link${active === item.id ? ' active' : ''}`}
                href={`#${item.id}`}
                aria-current={active === item.id ? 'page' : undefined}
              >
                <span className={`nav-icon ${item.icon}`} aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <p className="sidebar-note">CASO A · Proyecto académico<br />Modelo interactivo · 12 meses<br /><br />Valores en USD ($)</p>
    </aside>
  );
}
