// ===== CHAPIDU - Order Page (Multi-item ordering) =====
import { getProductById, getProducts } from '../store.js';
import { showToast } from '../toast.js';
import { navigate } from '../router.js';

export function renderOrder(container) {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const preselectedId = parseInt(params.get('id')) || null;
  const allProducts = getProducts().filter(p => p.stock > 0);

  // ── State ──────────────────────────────────────────────────────────────
  let items = [createItem(preselectedId)]; // array of item state objects

  function createItem(productId = null) {
    return { id: Date.now() + Math.random(), productId, type: 'kilo', kilos: 1, monto: 0 };
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  function productOptions(selectedId) {
    return `<option value="">Selecciona un producto</option>` +
      allProducts.map(p =>
        `<option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>${p.emoji} ${p.name} (${p.brand}) - $${p.pricePerKg}/kg</option>`
      ).join('');
  }

  function calcItem(item) {
    const p = allProducts.find(x => x.id === item.productId);
    if (!p) return { product: null, totalPrice: 0, totalKg: 0 };
    if (item.type === 'kilo') {
      const kg = parseFloat(item.kilos) || 0;
      return { product: p, totalPrice: kg * p.pricePerKg, totalKg: kg };
    } else {
      const monto = parseFloat(item.monto) || 0;
      const kg = p.pricePerKg > 0 ? monto / p.pricePerKg : 0;
      return { product: p, totalPrice: monto, totalKg: kg };
    }
  }

  function grandTotal() {
    return items.reduce((sum, item) => {
      const { totalPrice } = calcItem(item);
      return sum + totalPrice;
    }, 0);
  }

  // ── Render ─────────────────────────────────────────────────────────────
  function renderItemCard(item, idx) {
    const { product, totalPrice, totalKg } = calcItem(item);
    const isKilo = item.type === 'kilo';
    const canDelete = items.length > 1;

    return `
      <div class="order-item-card" data-item-id="${item.id}">
        <div class="order-item-header">
          <span class="order-item-num">Artículo ${idx + 1}</span>
          ${canDelete ? `<button type="button" class="btn-remove-item" data-id="${item.id}" title="Quitar artículo">✕</button>` : ''}
        </div>

        <div class="form-group">
          <label>Producto</label>
          <select class="item-product" data-id="${item.id}">
            ${productOptions(item.productId)}
          </select>
        </div>

        <div class="form-group">
          <label>¿Cómo quieres comprar?</label>
          <div class="purchase-type-selector">
            <button type="button" class="purchase-type-btn item-type-btn ${isKilo ? 'active' : ''}" data-id="${item.id}" data-type="kilo">Por Kilo</button>
            <button type="button" class="purchase-type-btn item-type-btn ${!isKilo ? 'active' : ''}" data-id="${item.id}" data-type="precio">Por Precio ($)</button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group item-kilo-group" ${!isKilo ? 'style="display:none;"' : ''}>
            <label>Cantidad en kilos</label>
            <input type="number" class="item-kilos" data-id="${item.id}" min="0.5" step="0.5" value="${item.kilos || 1}" placeholder="Ej: 5" />
          </div>
          <div class="form-group item-monto-group" ${isKilo ? 'style="display:none;"' : ''}>
            <label>Monto en pesos (MXN)</label>
            <input type="number" class="item-monto" data-id="${item.id}" min="10" step="10" value="${item.monto || ''}" placeholder="Ej: 200" />
          </div>
          <div class="form-group">
            <label class="item-result-label">${isKilo ? 'Precio estimado' : 'Kilos que recibirás'}</label>
            <div class="item-result-value">
              ${product
                ? (isKilo
                    ? `$${totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                    : `${totalKg.toFixed(2)} kg`)
                : (isKilo ? '$0.00' : '0.00 kg')}
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderSummary() {
    const total = grandTotal();
    const summaryEl = container.querySelector('#order-summary');
    if (!summaryEl) return;
    summaryEl.innerHTML = `
      <div class="order-summary-inner">
        <span>Total estimado del encargo</span>
        <span class="order-grand-total">$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
      </div>`;
  }

  function renderItems() {
    const listEl = container.querySelector('#items-list');
    if (!listEl) return;
    listEl.innerHTML = items.map((item, idx) => renderItemCard(item, idx)).join('');
    attachItemListeners();
    renderSummary();
  }

  // ── Shell HTML ──────────────────────────────────────────────────────────
  container.innerHTML = `
    <section class="section">
      <div class="container" style="max-width:700px; padding-left:16px; padding-right:16px;">
        <div class="section-title">
          <h2>Hacer un Encargo</h2>
          <p>Llena el formulario y nosotros preparamos tu pedido</p>
          <div style="display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,#fff3cd,#ffeaa0); border:2px solid var(--secondary); border-radius:12px; padding:10px 18px; margin-top:14px; max-width:560px; text-align:left;">
            <span style="font-size:1.2rem; flex-shrink:0;">📍</span>
            <p style="margin:0; font-size:0.88rem; color:#7a5a00; font-weight:600; line-height:1.45;">
              <strong style="color:#5a3e00;">Únicamente envíos a:</strong> Santa Cruz Palomeque, Gran Santa Cruz, Santa Cruz Norte, Palomeque Residencial y Punta Cruz
            </p>
          </div>
        </div>

        <div class="order-section">
          <form class="order-form" id="order-form">

            <!-- Datos del cliente -->
            <div class="form-group">
              <label>Tu nombre</label>
              <input type="text" id="order-name" placeholder="Ej: María García" required />
            </div>
            <div class="form-group">
              <label>Tu teléfono (WhatsApp)</label>
              <input type="tel" id="order-phone" placeholder="Ej: 999 123 4567" required />
            </div>

            <!-- Separador -->
            <div class="items-section-label">🛒 Productos a encargar</div>

            <!-- Lista de artículos -->
            <div id="items-list"></div>

            <!-- Botón agregar artículo -->
            <button type="button" class="btn-add-item" id="add-item-btn">
              + Agregar otro producto
            </button>

            <!-- Resumen total -->
            <div id="order-summary" class="order-summary"></div>

            <!-- Entrega -->
            <div class="form-group">
              <label>Entrega</label>
              <select id="order-delivery" required>
                <option value="tienda" disabled>🏪 Recoger en tienda (Próximamente)</option>
                <option value="domicilio" selected>🚚 Envío a domicilio (Sin costo extra)</option>
              </select>
            </div>
            <div class="form-group" id="address-group">
              <label>Dirección de entrega</label>
              <textarea id="order-address" rows="2" placeholder="Calle, número, colonia..."></textarea>
            </div>
            <div class="form-group">
              <label>Notas adicionales (opcional)</label>
              <textarea id="order-notes" rows="2" placeholder="Alguna indicación especial..."></textarea>
            </div>

            <button type="submit" class="btn btn-secondary" style="width:100%; justify-content:center;">
              Enviar Encargo por WhatsApp 📱
            </button>
          </form>
        </div>
      </div>
    </section>
  `;

  // ── Attach listeners to dynamic item elements ───────────────────────────
  function attachItemListeners() {
    // Remove item
    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        items = items.filter(i => i.id !== parseFloat(btn.dataset.id));
        renderItems();
      });
    });

    // Product selector
    container.querySelectorAll('.item-product').forEach(sel => {
      sel.addEventListener('change', () => {
        const item = items.find(i => i.id === parseFloat(sel.dataset.id));
        if (item) { item.productId = parseInt(sel.value) || null; renderItems(); }
      });
    });

    // Purchase type toggle
    container.querySelectorAll('.item-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = items.find(i => i.id === parseFloat(btn.dataset.id));
        if (!item) return;
        item.type = btn.dataset.type;
        renderItems();
      });
    });

    // Kilos input
    container.querySelectorAll('.item-kilos').forEach(input => {
      input.addEventListener('input', () => {
        const item = items.find(i => i.id === parseFloat(input.dataset.id));
        if (item) { item.kilos = input.value; renderSummaryOnly(); updateItemResult(item); }
      });
    });

    // Monto input
    container.querySelectorAll('.item-monto').forEach(input => {
      input.addEventListener('input', () => {
        const item = items.find(i => i.id === parseFloat(input.dataset.id));
        if (item) { item.monto = input.value; renderSummaryOnly(); updateItemResult(item); }
      });
    });
  }

  // Update only the result display of a single item (avoids full re-render on typing)
  function updateItemResult(item) {
    const card = container.querySelector(`[data-item-id="${item.id}"]`);
    if (!card) return;
    const { product, totalPrice, totalKg } = calcItem(item);
    const isKilo = item.type === 'kilo';
    const resultVal = card.querySelector('.item-result-value');
    const resultLabel = card.querySelector('.item-result-label');
    if (resultLabel) resultLabel.textContent = isKilo ? 'Precio estimado' : 'Kilos que recibirás';
    if (resultVal) {
      resultVal.textContent = product
        ? (isKilo
            ? `$${totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
            : `${totalKg.toFixed(2)} kg`)
        : (isKilo ? '$0.00' : '0.00 kg');
    }
  }

  function renderSummaryOnly() {
    renderSummary();
  }

  // Add item button
  container.querySelector('#add-item-btn').addEventListener('click', () => {
    items.push(createItem());
    renderItems();
    // Scroll to new item
    setTimeout(() => {
      const cards = container.querySelectorAll('.order-item-card');
      cards[cards.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  });

  // Delivery toggle (address already visible since domicilio is default)
  const deliverySelect = container.querySelector('#order-delivery');
  const addressGroup = container.querySelector('#address-group');
  deliverySelect.addEventListener('change', () => {
    addressGroup.style.display = deliverySelect.value === 'domicilio' ? '' : 'none';
  });

  // ── Submit ─────────────────────────────────────────────────────────────
  container.querySelector('#order-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = container.querySelector('#order-name').value.trim();
    const phone = container.querySelector('#order-phone').value.trim();

    // Validate all items have a product selected
    const validItems = items.filter(i => i.productId);
    if (validItems.length === 0) { showToast('Selecciona al menos un producto', 'error'); return; }

    // Build items text
    let totalGeneral = 0;
    const itemsText = validItems.map((item, idx) => {
      const { product, totalPrice, totalKg } = calcItem(item);
      if (!product) return '';
      totalGeneral += totalPrice;
      const isKilo = item.type === 'kilo';
      const cantidadText = isKilo
        ? `${item.kilos} kg`
        : `$${item.monto} MXN (≈${totalKg.toFixed(1)} kg)`;
      const precioText = isKilo
        ? `$${totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
        : `${totalKg.toFixed(2)} kg`;
      const resultLabel = isKilo ? 'Precio est.' : 'Kilos aprox.';
      return `  ${idx + 1}. ${product.emoji} *${product.name}* (${product.brand})\n     📏 Cantidad: ${cantidadText}\n     ${resultLabel}: ${precioText}`;
    }).filter(Boolean).join('\n\n');

    const delivery = deliverySelect.value === 'domicilio' ? 'Envío a domicilio' : 'Recoger en tienda';
    const address = container.querySelector('#order-address')?.value || '';
    const notes = container.querySelector('#order-notes').value || '';
    const totalStr = `$${totalGeneral.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

    const msg =
      `🐾 *ENCARGO CHAPIDU*\n\n` +
      `👤 *Cliente:* ${name}\n📱 *Tel:* ${phone}\n\n` +
      `📦 *Productos:*\n${itemsText}\n\n` +
      `💰 *Total estimado:* ${totalStr}\n\n` +
      `🚚 *Entrega:* ${delivery}` +
      (address ? `\n📍 *Dirección:* ${address}` : '') +
      (notes ? `\n📝 *Notas:* ${notes}` : '');

    const waUrl = `https://wa.me/5219992845798?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    showToast('¡Encargo enviado! Se abrió WhatsApp', 'success');
  });

  // Initial render
  renderItems();
}
