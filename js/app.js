// Responsabilidad futura: inicializar la aplicación y coordinar la interfaz con los datos y cálculos.

const sidebarToggle = document.querySelector('.sidebar-toggle');
const sidebar = document.querySelector('.sidebar');
const navLinks = document.querySelectorAll('.nav-link');

sidebarToggle?.addEventListener('click', () => {
  const collapsed = document.body.classList.toggle('sidebar-collapsed');
  sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
  sidebarToggle.setAttribute('aria-label', collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral');

  if (window.matchMedia('(max-width: 760px)').matches) {
    sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
  }
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.forEach((item) => {
      item.classList.remove('active');
      item.removeAttribute('aria-current');
    });

    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  });
});
