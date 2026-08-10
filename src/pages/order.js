// ===== CHAPIDU - Order Page (Client ordering) =====
import { getProductById, getProducts } from '../store.js';
import { showToast } from '../toast.js';
import { navigate } from '../router.js';

export function renderOrder(container) {
  const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const productId = parseInt(params.get('id'));
  const product = productId ? getProductById(productId) : null;
  const allProducts = getProducts().filter(p => p.stock > 0);

  container.innerHTML = `
    <section class="section">
      <div class="container" style="max-width:700px;">
        <div class="section-title">
          <h2>Hacer un Encargo</h2>
          <p>Llena el formulario y nosotros preparamos tu pedido</p>
        </div>
        <div class="order-section">
          <form class="order-form" id="order-form">
            <div class="form-group">
              <label>Tu nombre</label>
              <input type="text" id="order-name" placeholder="Ej: María García" required />
            </div>
            <div class="form-group">
              <label>Tu teléfono (WhatsApp)</label>
              <input type="tel" id="order-phone" placeholder="Ej: 999 123 4567" required />
            </div>
            <div class="form-group">
              <label>Producto</label>
              <select id="order-product" required>
                <option value="">Selecciona un producto</option>
                ${allProducts.map(p => `<option value="${p.id}" ${p.id === productId ? 'selected' : ''}>${p.emoji} ${p.name} (${p.brand}) - $${p.pricePerKg}/kg</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>¿Cómo quieres comprar?</label>
              <div class="purchase-type-selector">
                <button type="button" class="purchase-type-btn active" data-type="kilo">Por Kilo</button>
                <button type="button" class="purchase-type-btn" data-type="precio">Por Precio ($)</button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" id="kilo-group">
                <label>Cantidad en kilos</label>
                <input type="number" id="order-kilos" min="0.5" step="0.5" value="1" placeholder="Ej: 5" />
              </div>
              <div class="form-group" id="precio-group" style="display:none;">
                <label>Monto en pesos (MXN)</label>
                <input type="number" id="order-monto" min="10" step="10" placeholder="Ej: 200" />
              </div>
              <div class="form-group">
                <label id="total-label">Precio estimado</label>
                <div style="font-size:1.8rem; font-weight:800; color:var(--primary); padding:8px 0;" id="order-total">$0.00</div>
              </div>
            </div>

            <div class="form-group">
              <label>Entrega</label>
              <select id="order-delivery" required>
                <option value="tienda" disabled>🏪 Recoger en tienda (Próximamente)</option>
                <option value="domicilio" selected>🚚 Envío a domicilio (Costo extra)</option>
              </select>
            </div>
            <div class="form-group" id="address-group" style="display:none;">
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

  let purchaseType = 'kilo';
  const productSelect = container.querySelector('#order-product');
  const kilosInput = container.querySelector('#order-kilos');
  const montoInput = container.querySelector('#order-monto');
  const totalDisplay = container.querySelector('#order-total');
  const deliverySelect = container.querySelector('#order-delivery');
  const addressGroup = container.querySelector('#address-group');

  function getSelectedProduct() {
    const id = parseInt(productSelect.value);
    return allProducts.find(p => p.id === id);
  }

  function updateTotal() {
    const p = getSelectedProduct();
    const totalLabel = container.querySelector('#total-label');
    if (!p) {
      totalDisplay.textContent = purchaseType === 'kilo' ? '$0.00' : '0.0 kg';
      return;
    }
    if (purchaseType === 'kilo') {
      totalLabel.textContent = 'Precio estimado';
      const kg = parseFloat(kilosInput.value) || 0;
      const total = kg * p.pricePerKg;
      totalDisplay.textContent = `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
    } else {
      totalLabel.textContent = 'Kilos que recibirás';
      const monto = parseFloat(montoInput.value) || 0;
      const kgEquivalent = monto > 0 ? (monto / p.pricePerKg).toFixed(2) : '0.00';
      totalDisplay.textContent = `${kgEquivalent} kg`;
    }
  }

  // Purchase type toggle
  container.querySelectorAll('.purchase-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.purchase-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      purchaseType = btn.dataset.type;
      container.querySelector('#kilo-group').style.display = purchaseType === 'kilo' ? '' : 'none';
      container.querySelector('#precio-group').style.display = purchaseType === 'precio' ? '' : 'none';
      // Reset display on type change
      const totalLabel = container.querySelector('#total-label');
      totalLabel.textContent = purchaseType === 'kilo' ? 'Precio estimado' : 'Kilos que recibirás';
      totalDisplay.textContent = purchaseType === 'kilo' ? '$0.00' : '0.00 kg';
      updateTotal();
    });
  });

  productSelect.addEventListener('change', updateTotal);
  kilosInput.addEventListener('input', updateTotal);
  montoInput.addEventListener('input', updateTotal);
  updateTotal();

  deliverySelect.addEventListener('change', () => {
    addressGroup.style.display = deliverySelect.value === 'domicilio' ? '' : 'none';
  });

  // Form submit -> generate WhatsApp message
  container.querySelector('#order-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = container.querySelector('#order-name').value.trim();
    const phone = container.querySelector('#order-phone').value.trim();
    const p = getSelectedProduct();
    if (!p) { showToast('Selecciona un producto', 'error'); return; }

    let cantidadText = '';
    if (purchaseType === 'kilo') {
      cantidadText = `${kilosInput.value} kg`;
    } else {
      const monto = parseFloat(montoInput.value) || 0;
      const kgEquivalent = (monto / p.pricePerKg).toFixed(1);
      cantidadText = `$${monto} MXN (≈${kgEquivalent} kg)`;
    }
    const delivery = deliverySelect.value === 'domicilio' ? 'Envío a domicilio' : 'Recoger en tienda';
    const address = container.querySelector('#order-address')?.value || '';
    const notes = container.querySelector('#order-notes').value || '';
    const total = totalDisplay.textContent;

    const msg = `🐾 *ENCARGO CHAPIDU*\n\n👤 *Cliente:* ${name}\n📱 *Tel:* ${phone}\n\n📦 *Producto:* ${p.name} (${p.brand})\n📏 *Cantidad:* ${cantidadText}\n💰 *Total estimado:* ${total}\n\n🚚 *Entrega:* ${delivery}${address ? `\n📍 *Dirección:* ${address}` : ''}${notes ? `\n📝 *Notas:* ${notes}` : ''}`;

    const waUrl = `https://wa.me/5219992845798?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    showToast('¡Encargo enviado! Se abrió WhatsApp', 'success');
  });
}
