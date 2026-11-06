import { useEffect, useState } from 'react';
const navigation=[
  ['panel-principal','Panel principal','nav-icon-panel'],['escenarios','Escenarios','nav-icon-scenarios'],
  ['nivel-2','Tablero interactivo','nav-icon-simulator'],['nivel-3','Simulador 24 meses','nav-icon-cashflow'],
  ['simulador','Simulador','nav-icon-simulator'],['flujo-caja','Flujo de caja','nav-icon-cashflow'],
  ['recomendacion','Recomendación','nav-icon-recommendation'],['dashboard-comercial','Comercial DEMO','nav-icon-panel'],
];
export default function Sidebar({collapsed,onToggle}){
  const [active,setActive]=useState(window.location.hash.slice(1)||'panel-principal');
  useEffect(()=>{const sync=()=>setActive(window.location.hash.slice(1)||'panel-principal');window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync)},[]);
  return <aside className="sidebar" id="sidebar"><div className="brand-row"><div className="brand" aria-label="Tueste Analytics"><img className="brand-coffee-photo" src="/images/cafe-humeante.png" alt="Taza de café humeante"/><span className="brand-copy"><strong>TUESTE</strong><span>ANALYTICS</span></span></div><button className="sidebar-toggle" type="button" aria-controls="sidebar" aria-expanded={!collapsed} aria-label={collapsed?'Mostrar navegación':'Ocultar navegación'} onClick={onToggle}><span aria-hidden="true"/></button></div><nav className="side-nav" aria-label="Navegación principal"><ul>{navigation.map(([id,label,icon])=><li key={id}><a className={`nav-link${active===id?' active':''}`} href={`#${id}`} aria-current={active===id?'page':undefined}><span className={`nav-icon ${icon}`} aria-hidden="true"/><span>{label}</span></a></li>)}</ul></nav><p className="sidebar-note">CASO A · Proyecto académico<br/>Modelo financiero · 24 meses<br/><br/>Valores en USD ($)</p></aside>;
}
