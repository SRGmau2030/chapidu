// ===== CHAPIDU - Simple Hash Router =====

const routes = {};
let currentRoute = null;
let onRouteChange = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function setOnRouteChange(cb) {
  onRouteChange = cb;
}

export function navigate(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  return window.location.hash.slice(1) || '/';
}

function handleRoute() {
  const path = getCurrentRoute();
  if (path === currentRoute) return;
  currentRoute = path;
  
  const content = document.getElementById('page-content');
  if (!content) return;

  const handler = routes[path] || routes['/'];
  if (handler) {
    content.innerHTML = '';
    handler(content);
  }

  if (onRouteChange) onRouteChange(path);
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  if (!window.location.hash) window.location.hash = '/';
  else handleRoute();
}
