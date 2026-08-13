// ===== CHAPIDU - Products Catalog Page =====
import { getProducts, getStockStatus } from '../store.js';
import { navigate } from '../router.js';

export function renderProducts(container) {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const initialCat = params.get('cat') || 'todos';

  container.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>Nuestro Catálogo</h2>
          <p>Croquetas premium para perros y gatos</p>
        </div>
        <div class="products-toolbar">
          <div class="search-box">
            <span>🔍</span>
            <input type="text" id="search-input" placeholder="Buscar croquetas..." />
          </div>
          <div class="filter-tabs">
            <button class="filter-tab ${initialCat === 'todos' ? 'active' : ''}" data-cat="todos">Todos</button>
            <button class="filter-tab ${initialCat === 'perros' ? 'active' : ''}" data-cat="perros">🐕 Perros</button>
            <button class="filter-tab ${initialCat === 'gatos' ? 'active' : ''}" data-cat="gatos">🐱 Gatos</button>
            <button class="filter-tab ${initialCat === 'conejos' ? 'active' : ''}" data-cat="conejos">🐇 Conejos</button>
          </div>
        </div>
        <div class="products-grid" id="products-list"></div>
      </div>
    </section>
  `;

  let currentCat = initialCat;
  let searchTerm = '';

  function renderGrid() {
    let products = getProducts();
    if (currentCat !== 'todos') products = products.filter(p => p.category === currentCat);
    if (searchTerm) products = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm)
    );

    const grid = container.querySelector('#products-list');
    if (products.length === 0) {
      grid.innerHTML = `<div class="empty-state"><div class="icon">🔍</div><h3>No se encontraron productos</h3><p>Intenta con otra búsqueda o categoría</p></div>`;
      return;
    }

    grid.innerHTML = products.map(p => {
      const status = getStockStatus(p.stock);
      return `
        <div class="product-card fade-in">
          <span class="stock-badge ${status.class}">${status.label}</span>
          <div class="card-img">
              ${p.image
                ? `<img src="${p.image}" alt="${p.name}" loading="lazy" />`
                : (p.emoji || '🐾')
              }
            </div>
          <div class="card-body">
            <h3>${p.name}</h3>
            <p class="brand">${p.brand} · ${{ perros: '🐕 Perros', gatos: '🐱 Gatos', conejos: '🐇 Conejos' }[p.category] || p.category}</p>
            <div class="price-row">
              <span class="price">$${p.pricePerKg}/kg</span>
              <span class="price-unit">Bolsa ${p.bagWeight}kg: $${p.priceBag?.toLocaleString()}</span>
            </div>
            <div class="card-actions">
              <button class="btn btn-primary btn-sm order-btn" data-id="${p.id}" ${p.stock <= 0 ? 'disabled style="opacity:0.5"' : ''}>
                ${p.stock <= 0 ? 'Agotado' : 'Encargar 🛒'}
              </button>
            </div>
          </div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.order-btn').forEach(btn => {
      btn.addEventListener('click', () => navigate(`/encargar?id=${btn.dataset.id}`));
    });
  }

  container.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCat = tab.dataset.cat;
      renderGrid();
    });
  });

  container.querySelector('#search-input').addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    renderGrid();
  });

  renderGrid();
}
