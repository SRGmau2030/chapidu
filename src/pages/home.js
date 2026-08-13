// ===== CHAPIDU - Home Page =====
import { getProducts, getStockStatus, isAdmin } from '../store.js';
import { navigate } from '../router.js';

export function renderHome(container) {
  const products = getProducts();
  const featured = products.filter(p => p.stock > 0).slice(0, 4);

  container.innerHTML = `
    <!-- HERO -->
    <section class="hero">
      <div class="hero-shapes"><span></span><span></span><span></span></div>
      <div class="hero-inner">
        <div class="hero-text">
          <span class="badge">🐾 Tienda de Mascotas</span>
          <h1>Las mejores croquetas para tu mascota</h1>
          <p>Encarga las croquetas favoritas de tu perro o gato. Pide a domicilio.</p>
          <button class="btn btn-primary" id="hero-cta">Ver Catálogo 🛒</button>
        </div>
        <div class="home/hero-img">
          <img src="/home/hero-banner.png" alt="Mascotas felices con croquetas Chapidu" />
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="section">
      <div class="container">
        <div class="section-title fade-in">
          <h2>Nuestras Categorías</h2>
          <p>Encuentra el alimento ideal para tu mascota</p>
        </div>
        <div class="categories-grid">
          <div class="category-card fade-in-delay-1" data-cat="perros">
            <img src="/home/category-dogs.png" alt="Croquetas para perros" />
            <div class="overlay">
              <h3>🐕 Para Perros</h3>
              <p>${products.filter(p => p.category === 'perros').length} productos</p>
            </div>
          </div>
          <div class="category-card fade-in-delay-2" data-cat="gatos">
            <img src="/home/category-cats.png" alt="Croquetas para gatos" />
            <div class="overlay">
              <h3>🐱 Para Gatos</h3>
              <p>${products.filter(p => p.category === 'gatos').length} productos</p>
            </div>
          </div>
          <div class="category-card fade-in-delay-3" data-cat="conejos">
            <img src="/home/category-rabbit.png" alt="Croquetas para conejos" />
            <div class="overlay">
              <h3>🐇 Para Conejos</h3>
              <p>${products.filter(p => p.category === 'conejos').length} productos</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURED PRODUCTS -->
    <section class="section" style="background: white;">
      <div class="container">
        <div class="section-title">
          <h2>Productos Destacados</h2>
          <p>Los favoritos de nuestros clientes</p>
        </div>
        <div class="products-grid">
          ${featured.map(p => {
    const status = getStockStatus(p.stock);
    return `
            <div class="product-card fade-in" data-id="${p.id}">
              <span class="stock-badge ${status.class}">${status.label}</span>
              <div class="card-img">
                ${p.image
                  ? `<img src="${p.image}" alt="${p.name}" loading="lazy" />`
                  : (p.emoji || '🐾')
                }
              </div>
              <div class="card-body">
                <h3>${p.name}</h3>
                <p class="brand">${p.brand}</p>
                <div class="price-row">
                  <span class="price">$${p.pricePerKg}/kg</span>
                  <span class="price-unit">Bolsa ${p.bagWeight}kg: $${p.priceBag}</span>
                </div>
                <div class="card-actions">
                  <button class="btn btn-primary btn-sm order-btn" data-id="${p.id}">Encargar</button>
                </div>
              </div>
            </div>`;
  }).join('')}
        </div>
        <div style="text-align:center; margin-top:30px;">
          <button class="btn btn-outline" id="see-all-btn">Ver todos los productos →</button>
        </div>
      </div>
    </section>

    <!-- PROMO BANNER -->
    <section class="section">
      <div class="container">
        <div class="promo-banner fade-in">
          <img src="/home/promo-banner.png" alt="Promoción Chapidu" />
          <div class="promo-overlay">
            <div>
              <h2>¡Encarga y recoge o pide a domicilio!</h2>
              <p>Elige tus croquetas, selecciona la cantidad por kilo o por precio, y nosotros te las preparamos.</p>
              <button class="btn btn-primary" id="promo-cta">Hacer un encargo →</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- WHY US -->
    <section class="section" style="background: white;">
      <div class="container">
        <div class="section-title">
          <h2>¿Por qué elegirnos?</h2>
        </div>
        <div class="features-grid">
          <div class="feature-card fade-in-delay-1" style="position:relative; opacity:0.7;">
            <span style="position:absolute; top:12px; right:12px; background:#f1b94c; color:#0a1680; font-size:0.65rem; font-weight:800; padding:3px 8px; border-radius:20px; letter-spacing:0.05em; text-transform:uppercase;">Próximamente</span>
            <div class="icon">🏪</div>
            <h3>Recoge en tienda</h3>
            <p>Tu pedido listo para recoger cuando quieras</p>
          </div>
          <div class="feature-card fade-in-delay-2">
            <div class="icon">🚚</div>
            <h3>Envío a domicilio</h3>
            <p>Te llevamos las croquetas hasta la puerta de tu casa</p>
          </div>
          <div class="feature-card fade-in-delay-3">
            <div class="icon">⭐</div>
            <h3>Marcas Premium</h3>
            <p>Solo las mejores marcas para tu mascota</p>
          </div>
        </div>
      </div>
    </section>
  `;

  // Event listeners
  container.querySelector('#hero-cta')?.addEventListener('click', () => navigate('/productos'));
  container.querySelector('#see-all-btn')?.addEventListener('click', () => navigate('/productos'));
  container.querySelector('#promo-cta')?.addEventListener('click', () => navigate('/productos'));

  container.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => navigate(`/productos?cat=${card.dataset.cat}`));
  });

  container.querySelectorAll('.order-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(`/encargar?id=${btn.dataset.id}`));
  });
}
