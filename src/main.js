// ===== CHAPIDU - Main Entry Point =====
import './style.css';
import { isAdmin, loginAdmin, logoutAdmin } from './store.js';
import { registerRoute, initRouter, navigate, setOnRouteChange, getCurrentRoute } from './router.js';
import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { renderHome } from './pages/home.js';
import { renderProducts } from './pages/products.js';
import { renderOrder } from './pages/order.js';
import { renderAdmin } from './pages/admin.js';

// Build the app shell
document.querySelector('#app').innerHTML = `
  <!-- NAVBAR -->
  <nav class="navbar" id="main-navbar">
    <div class="navbar-inner">
      <a href="#/" class="navbar-logo">
        <img src="/logo.png" alt="Chapidu Logo" onerror="this.style.display='none'" />
        <span>Chapidu</span>
      </a>
      <button class="hamburger" id="hamburger-btn">☰</button>
      <div class="navbar-links" id="nav-links">
        <a href="#/" class="nav-link" data-route="/">🏠 Inicio</a>
        <a href="#/productos" class="nav-link" data-route="/productos">🛒 Catálogo</a>
        <a href="#/encargar" class="nav-link" data-route="/encargar">📋 Encargar</a>
        <span class="admin-badge" id="admin-badge">🔒 Admin</span>
        <div class="nav-admin-links" id="nav-admin-links">
          <a href="#/admin" class="nav-link" data-route="/admin">📊 Panel Admin</a>
          <button class="btn btn-sm btn-logout-admin" id="logout-admin-btn">Salir Admin</button>
        </div>
      </div>
    </div>
  </nav>

  <!-- PAGE CONTENT -->
  <main id="page-content"></main>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-inner">
      <div>
        <h3>🐾 Chapidu</h3>
        <p>Tu tienda de confianza para croquetas premium para perros y gatos.</p>
        <p style="margin-top:12px;">📍 Mérida, Yucatán</p>
        <p>📧 chapidumid@gmail.com</p>
        <p style="margin-top:12px;"><a href="https://www.facebook.com/share/1EugNm28v7/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">📘 Facebook</a></p>
      </div>
      <div>
        <h3>Enlaces</h3>
        <p><a href="#/">Inicio</a></p>
        <p><a href="#/productos">Catálogo</a></p>
        <p><a href="#/encargar">Hacer un encargo</a></p>
      </div>
      <div>
        <h3>Horario</h3>
        <p>Lun - Dom: 7:00 - 22:00</p>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Chapidu. Todos los derechos reservados.</span>
      <button class="admin-key-btn" id="admin-key-btn" title="Acceso administrador">🔑</button>
    </div>
  </footer>
`;

// Register routes
registerRoute('/', renderHome);
registerRoute('/productos', renderProducts);
registerRoute('/encargar', renderOrder);
registerRoute('/admin', renderAdmin);

// Update active nav link
function updateNav(path) {
  const basePath = path.split('?')[0];
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.route === basePath);
  });
  const adminMode = isAdmin();
  document.getElementById('admin-badge').classList.toggle('show', adminMode);
  document.getElementById('nav-admin-links').classList.toggle('show', adminMode);
}

setOnRouteChange(updateNav);

// Hamburger menu
document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('nav-links').classList.toggle('open');
});

// Close mobile menu on nav click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('nav-links').classList.remove('open');
  });
});

// Admin key button
document.getElementById('admin-key-btn').addEventListener('click', () => {
  if (isAdmin()) {
    showToast('Ya estás en modo administrador', 'info');
    return;
  }
  showModal({
    title: '🔒 Acceso Administrador',
    message: 'Ingresa el código de acceso para activar el modo administrador.',
    content: '<div class="form-group"><input type="password" id="admin-code-input" placeholder="Código de acceso" style="padding:12px;border:2px solid var(--border);border-radius:8px;width:100%;font-size:1rem;" /></div>',
    confirmText: 'Acceder',
    onConfirm: (modal) => {
      const code = modal.querySelector('#admin-code-input').value.trim();
      if (loginAdmin(code)) {
        showToast('¡Modo administrador activado! 🔓', 'success');
        updateNav(getCurrentRoute());
      } else {
        showToast('Código incorrecto ❌', 'error');
      }
    }
  });
});

// Logout admin
document.getElementById('logout-admin-btn').addEventListener('click', () => {
  logoutAdmin();
  showToast('Sesión de administrador cerrada', 'info');
  updateNav(getCurrentRoute());
  navigate('/');
});

// Initialize
initRouter();
updateNav(getCurrentRoute());
