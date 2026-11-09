import { useEffect, useState } from 'react';
import cafeGranos from '../assets/landing/tueste-cafe-granos.jpg';
import momentoCafe from '../assets/landing/tueste-momento-cafe.jpg';
import cafeEditorial from '../assets/landing/tueste-cafe-editorial.jpg';
import landpageHero from '../assets/landing/tueste-landpage-hero.jpg';
import granosVerdes from '../assets/landing/tueste-granos-verdes.jpg';
import tazaCafe from '../assets/landing/tueste-taza-cafe.jpg';
import { getReferralCode as readReferralCode } from '../config/routing.js';
import { DEMO_INVITER, REWARD_CONFIG } from '../growth/rewardsDemo.js';
import { DEMO_ROLE, setActiveDemoRole } from '../config/accessControl.js';
import { clearActiveDemoProfile, createDemoProfile, loadDemoProfiles, setActiveDemoProfile } from '../growth/demoProfiles.js';

const navigate = (hash) => { window.location.hash = hash; };
const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export function getReferralCode(hash = window.location.hash) {
  return readReferralCode(hash);
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [adminAccessOpen, setAdminAccessOpen] = useState(false);
  const [accountScreen, setAccountScreen] = useState('options');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [registration, setRegistration] = useState({ name: '', email: '' });
  const [accountError, setAccountError] = useState('');
  const demoProfiles = loadDemoProfiles(window.localStorage);
  const referralCode = getReferralCode();
  const validReferral = referralCode === DEMO_INVITER.code;
  const friendBenefit = REWARD_CONFIG.friendBenefit;

  useEffect(() => {
    if (!accessOpen && !adminAccessOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setAccessOpen(false);
        setAdminAccessOpen(false);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [accessOpen, adminAccessOpen]);

  const go = (hash) => {
    setMenuOpen(false);
    navigate(hash);
  };
  const enterRewards = (...args) => {
    const [requestedHash] = args;
    const destination = typeof requestedHash === 'string' ? requestedHash : 'tueste-rewards';
    setAccessOpen(false);
    setActiveDemoRole(DEMO_ROLE.CLIENT);
    window.location.hash = destination;
  };
  const openAccountSelection = () => {
    setAccountError('');
    setSelectedProfileId('');
    setAccountScreen('existing');
  };
  const openFirstTimeRegistration = () => {
    setAccountError('');
    setRegistration({ name: '', email: '' });
    setAccountScreen('register');
  };
  const enterRewardsWithProfile = (profileId) => {
    const profile = demoProfiles.find((item) => item.id === profileId);
    if (!profile) {
      setAccountError('Seleccione un perfil DEMO antes de continuar.');
      return;
    }
    setActiveDemoProfile(window.localStorage, profile.id);
    enterRewards();
  };
  const registerDemoAccount = (event) => {
    event.preventDefault();
    const result = createDemoProfile(window.localStorage, registration);
    if (result.status !== 'ok') {
      setAccountError(result.reason === 'duplicate_email' ? 'Ya existe una cuenta DEMO con este correo.' : result.reason === 'invalid_email' ? 'Ingrese un correo DEMO válido.' : 'Ingrese su nombre.');
      return;
    }
    setActiveDemoProfile(window.localStorage, result.profile.id);
    enterRewards();
  };
  const openAccessModal = () => {
    setAccountError('');
    setSelectedProfileId('');
    setAccountScreen('options');
    setAccessOpen(true);
  };
  const enterAsGuest = (hash) => {
    setActiveDemoRole(DEMO_ROLE.GUEST);
    go(hash);
  };
  const enterAsAdmin = () => {
    clearActiveDemoProfile(window.localStorage);
    setActiveDemoRole(DEMO_ROLE.ADMIN);
    go('panel-growth');
  };

  return (
    <div className="tueste-public-site">
      <header className="public-header">
        <a className="public-brand" href="#inicio" aria-label="Tueste, ir al inicio">
          <span>TUESTE</span>
        </a>
        <button className="public-menu-button" type="button" aria-expanded={menuOpen} aria-controls="public-navigation" onClick={() => setMenuOpen((open) => !open)}>
          <span className="public-menu-icon" aria-hidden="true" />
          <span className="public-menu-label">Menú</span>
        </button>
        <nav id="public-navigation" className={`public-navigation${menuOpen ? ' is-open' : ''}`} aria-label="Navegación principal">
          <button type="button" onClick={() => scrollToSection('inicio')}>Inicio</button>
          <button type="button" onClick={() => scrollToSection('nuestro-cafe')}>Nuestro café</button>
          <button type="button" onClick={() => scrollToSection('nuestra-historia')}>Nuestra historia</button>
          <button type="button" onClick={() => enterRewards()}>Tueste Rewards</button>
          <button className="public-access-button" type="button" onClick={openAccessModal}>Mi cuenta</button>
        </nav>
      </header>

      <main>
        <section className="public-hero" id="inicio">
          <img src={landpageHero} alt="Taza de café rodeada de granos tostados" />
          <div className="public-hero-overlay" />
          <div className="public-hero-content">
            <p className="public-eyebrow">CAFÉ DE ESPECIALIDAD</p>
            <h1>El buen café se vive.<br />Se comparte.</h1>
            <p>Cada taza es una oportunidad para disfrutar, conectar y crear nuevas historias.</p>
            <div className="public-hero-actions">
              <button className="public-button public-button-light" type="button" onClick={() => scrollToSection('nuestro-cafe')}>Descubrir nuestro café</button>
              <button className="public-button public-button-outline" type="button" onClick={() => scrollToSection('tueste-rewards')}>Conocer Tueste Rewards</button>
            </div>
          </div>
        </section>

        {validReferral && (
          <section className="public-referral-banner" aria-label="Invitación por referido">
            <div>
              <p className="public-eyebrow">Tu regalo de bienvenida</p>
              <h2>¡Alguien quiere compartir un buen café con usted!</h2>
              <p><strong>{DEMO_INVITER.name}</strong> le ha invitado a descubrir Tueste.</p>
              <p>Tiene <strong>USD {friendBenefit.cost}</strong> de beneficio DEMO para su primera compra elegible.</p>
              <p className="public-referral-small">Su beneficio ya está asociado a esta invitación. Descubra nuestro café y continúe con su compra simulada.</p>
            </div>
            <div className="public-referral-actions">
              <button className="public-button public-button-dark" type="button" onClick={() => enterAsGuest(`tueste-rewards?ref=${encodeURIComponent(referralCode)}`)}>Descubrir mi regalo</button>
              <button className="public-text-button" type="button" onClick={() => scrollToSection('nuestro-cafe')}>Explorar el café</button>
            </div>
          </section>
        )}

        <section className="public-welcome" id="nuestro-cafe">
          <p className="public-eyebrow public-eyebrow-dark">Nuestro café</p>
          <h2>De nuestra tierra a su taza.</h2>
          <p>Creemos que un buen café comienza mucho antes del primer sorbo. Cada taza refleja el cuidado, la dedicación y la pasión que hacen especial nuestra experiencia.</p>
          <p>Seleccionamos nuestro café pensando en quienes disfrutan los pequeños detalles: su aroma, su sabor y ese momento especial que acompaña cada taza.</p>
          <button className="public-button public-button-dark" type="button" onClick={() => scrollToSection('coffee-story')}>Explorar nuestro café</button>
        </section>

        <section className="public-gallery" id="nuestra-historia" aria-label="Galería Tueste">
          <div className="public-gallery-copy">
            <p className="public-eyebrow public-eyebrow-dark">La experiencia Tueste</p>
            <h2>Los mejores momentos merecen un buen café.</h2>
            <p>Una conversación, una pausa o el comienzo de un nuevo día. En Tueste queremos acompañar esos pequeños momentos que se convierten en grandes recuerdos.</p>
            <strong>Más que café, momentos para recordar.</strong>
            <img src={granosVerdes} alt="Granos y proceso de café" />
            <img src={cafeGranos} alt="Café de Tueste" />
          </div>
          <div className="public-gallery-column">
            <img src={momentoCafe} alt="Momento compartido con café" />
            <img src={tazaCafe} alt="Taza de café Tueste" />
          </div>
        </section>

        <section className="public-rewards" id="tueste-rewards">
          <div className="public-rewards-copy">
            <p className="public-eyebrow public-eyebrow-dark">Tueste Rewards</p>
            <h2>Compartir tiene sus recompensas.</h2>
            <p>El buen café sabe todavía mejor cuando se comparte. Invite a sus amigos a descubrir Tueste y disfruten juntos de beneficios especiales.</p>
            <strong>Una buena recomendación merece una recompensa.</strong>
            <div className="public-hero-actions">
              <button className="public-button public-button-dark" type="button" onClick={() => enterRewards()}>Descubrir mis recompensas</button>
              <button className="public-text-button public-text-button-dark" type="button" onClick={() => scrollToSection('como-funciona')}>¿Cómo funciona?</button>
            </div>
          </div>
          <img src={momentoCafe} alt="Amigos compartiendo café Tueste" />
        </section>

        <section className="public-steps" id="como-funciona">
          <p className="public-eyebrow public-eyebrow-dark">Tueste Rewards</p>
          <h2>Comparta el café. Multiplique los buenos momentos.</h2>
          <div className="public-steps-grid">
            <article><span>01</span><h3>Disfrute su café</h3><p>Reciba su pedido, prepare su taza favorita y disfrute la experiencia Tueste.</p></article>
            <article><span>02</span><h3>Invite a un amigo</h3><p>Comparta su enlace personal por WhatsApp de manera rápida y sencilla.</p></article>
            <article><span>03</span><h3>Su amigo descubre Tueste</h3><p>Su amigo recibe una invitación especial y puede aprovechar su beneficio en la primera compra.</p></article>
            <article><span>04</span><h3>Ambos ganan</h3><p>Cuando se completa una compra válida, el programa reconoce las recompensas correspondientes.</p></article>
          </div>
          <button className="public-button public-button-dark" type="button" onClick={() => enterRewards()}>Comenzar a compartir</button>
        </section>

        <section className="public-closing" id="coffee-story">
          <img src={cafeEditorial} alt="Experiencia de café Tueste" />
          <div>
            <h2>Hay historias que comienzan con una taza de café.</h2>
            <h3>La próxima puede ser la suya.</h3>
            <p>Descubra el sabor de Tueste, encuentre su momento favorito y comparta la experiencia con quienes más quiere.</p>
            <div className="public-hero-actions">
              <button className="public-button public-button-light" type="button" onClick={() => scrollToSection('nuestro-cafe')}>Descubra Tueste</button>
              <button className="public-button public-button-outline" type="button" onClick={() => enterRewards()}>Comparta con un amigo</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <a className="public-brand public-brand-footer" href="#inicio"><span>TUESTE</span></a>
        <p className="public-footer-tagline">El buen café se vive. Se comparte.</p>
        <nav aria-label="Navegación del pie de página">
          <button type="button" onClick={() => scrollToSection('inicio')}>Inicio</button>
          <button type="button" onClick={() => scrollToSection('nuestro-cafe')}>Nuestro café</button>
          <button type="button" onClick={() => scrollToSection('nuestra-historia')}>Nuestra historia</button>
          <button type="button" onClick={() => enterRewards()}>Tueste Rewards</button>
          <button type="button" onClick={openAccessModal}>Mi cuenta</button>
        </nav>
        <button className="public-admin-link" type="button" onClick={() => setAdminAccessOpen(true)}>Acceso administrativo</button>
        <p>© 2026 Tueste. Prototipo académico de comercio electrónico y estrategia de crecimiento.</p>
      </footer>

      {accessOpen && (
        <div className="public-access-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAccessOpen(false); }}>
          <section className="public-access-dialog" role="dialog" aria-modal="true" aria-labelledby="access-title">
            <button className="public-dialog-close" type="button" aria-label="Cerrar acceso" onClick={() => setAccessOpen(false)}>×</button>
            {accountScreen === 'existing' ? (
              <div className="public-access-content public-profile-screen">
                <p className="public-eyebrow public-eyebrow-dark">Mi cuenta</p>
                <h2 id="access-title">Elija su perfil DEMO.</h2>
                <p>Seleccione la cuenta con la que desea continuar. Cada perfil conserva su propio progreso y recompensas.</p>
                <div className="public-profile-list" role="radiogroup" aria-label="Clientes DEMO">
                  {demoProfiles.map((profile) => (
                    <label className={selectedProfileId === profile.id ? 'selected' : ''} key={profile.id}>
                      <input type="radio" name="demo-profile" value={profile.id} checked={selectedProfileId === profile.id} onChange={(event) => { setSelectedProfileId(event.target.value); setAccountError(''); }} />
                      <span><strong>{profile.name}</strong><small>{profile.email}</small></span>
                    </label>
                  ))}
                </div>
                {accountError && <p className="public-account-error" role="alert">{accountError}</p>}
                <button className="public-access-primary" type="button" disabled={!selectedProfileId} onClick={() => enterRewardsWithProfile(selectedProfileId)}>Continuar con esta cuenta</button>
                <button className="public-access-secondary" type="button" onClick={openFirstTimeRegistration}>Crear una cuenta DEMO</button>
              </div>
            ) : accountScreen === 'register' ? (
              <form className="public-access-content public-profile-screen" onSubmit={registerDemoAccount}>
                <p className="public-eyebrow public-eyebrow-dark">Tueste Rewards</p>
                <h2 id="access-title">Bienvenido a Tueste Rewards</h2>
                <p>El buen café sabe mejor cuando se comparte. Cree su perfil de demostración, invite a sus amigos y descubra las recompensas que puede obtener.</p>
                <label className="public-account-field">Nombre<input type="text" autoComplete="name" value={registration.name} onChange={(event) => setRegistration((current) => ({ ...current, name: event.target.value }))} required /></label>
                <label className="public-account-field">Correo electrónico DEMO<input type="email" autoComplete="email" value={registration.email} onChange={(event) => setRegistration((current) => ({ ...current, email: event.target.value }))} required /></label>
                {accountError && <p className="public-account-error" role="alert">{accountError}</p>}
                <button className="public-access-primary" type="submit">Crear mi cuenta DEMO</button>
                <button className="public-access-secondary" type="button" onClick={openAccessModal}>Volver a Mi cuenta</button>
              </form>
            ) : (
              <div className="public-access-content">
                <p className="public-eyebrow public-eyebrow-dark">Mi cuenta</p>
                <h2 id="access-title">Su café, sus recompensas.</h2>
                <p>Bienvenido a Tueste. Acceda a su espacio para compartir buenos momentos y descubrir sus beneficios.</p>
                <button className="public-access-primary" type="button" onClick={openAccountSelection}>Ingresar a mi cuenta</button>
                <p className="public-access-note">Acceso de demostración · No requiere contraseña</p>
                <button className="public-access-secondary" type="button" onClick={openFirstTimeRegistration}>¿Es su primera vez en Tueste? Conozca Rewards.</button>
              </div>
            )}
          </section>
        </div>
      )}

      {adminAccessOpen && (
        <div className="public-access-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAdminAccessOpen(false); }}>
          <section className="public-access-dialog public-admin-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-access-title">
            <button className="public-dialog-close" type="button" aria-label="Cerrar acceso administrativo" onClick={() => setAdminAccessOpen(false)}>×</button>
            <div className="public-access-content">
              <p className="public-eyebrow public-eyebrow-dark">Administración</p>
              <h2 id="admin-access-title">Panel de administración</h2>
              <p>Consulte el crecimiento, las recompensas y los indicadores de Tueste.</p>
              <button className="public-access-primary" type="button" onClick={enterAsAdmin}>Ingresar como administrador DEMO</button>
              <p className="public-access-note">Acceso de demostración · No requiere contraseña</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
