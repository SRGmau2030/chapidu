// ===== CHAPIDU - Admin Dashboard =====
import { getProducts, getSales, registerSale, addProduct, updateProduct, deleteProduct, getStockStatus, getTotalProducts, getTotalStock, getLowStockProducts, getTotalSales, getTotalRevenue, isAdmin } from '../store.js';
import { showToast } from '../toast.js';
import { showModal } from '../modal.js';
import { navigate } from '../router.js';

export function renderAdmin(container) {
  if (!isAdmin()) { navigate('/'); return; }

  const lowStock = getLowStockProducts();

  container.innerHTML = `
    <div class="admin-header">
      <div class="container">
        <h1>📊 Panel de Administración</h1>
        <p>Gestiona tu inventario y ventas de Chapidu</p>
      </div>
    </div>
    <div class="container">
      <div class="stats-grid">
        <div class="stat-card fade-in"><div class="stat-value">${getTotalProducts()}</div><div class="stat-label">Productos</div></div>
        <div class="stat-card fade-in-delay-1"><div class="stat-value">${getTotalStock()} kg</div><div class="stat-label">Stock Total</div></div>
        <div class="stat-card fade-in-delay-2"><div class="stat-value">${getTotalSales()}</div><div class="stat-label">Ventas Realizadas</div></div>
        <div class="stat-card fade-in-delay-3"><div class="stat-value">$${getTotalRevenue().toLocaleString()}</div><div class="stat-label">Ingresos Totales</div></div>
      </div>

      ${lowStock.length > 0 ? `
      <div style="background:#fef3c7; border:2px solid #f59e0b; border-radius:var(--radius); padding:16px 24px; margin-bottom:24px; display:flex; align-items:center; gap:12px;">
        <span style="font-size:1.5rem;">⚠️</span>
        <div>
          <strong>Stock bajo:</strong>
          ${lowStock.map(p => `${p.name} (${p.stock}kg)`).join(', ')}
        </div>
      </div>` : ''}

      <!-- Products Table -->
      <div class="admin-table-wrap fade-in">
        <div class="admin-table-header">
          <h2>📦 Productos</h2>
          <button class="btn btn-secondary btn-sm" id="add-product-btn">+ Agregar Producto</button>
        </div>
        <div style="overflow-x:auto;">
          <table class="admin-table" id="admin-products-table">
            <thead>
              <tr>
                <th>Producto</th><th>Categoría</th><th>$/kg</th><th>Stock</th><th>Estado</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody id="products-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- Sales Section -->
      <div class="admin-table-wrap fade-in" style="margin-top:24px;">
        <div class="admin-table-header">
          <h2>💰 Ventas Recientes</h2>
        </div>
        <div id="sales-list"></div>
      </div>
    </div>
  `;

  function renderProductsTable() {
    const products = getProducts();
    const tbody = container.querySelector('#products-tbody');
    tbody.innerHTML = products.map(p => {
      const status = getStockStatus(p.stock);
      return `<tr>
        <td><strong>${p.emoji} ${p.name}</strong><br><small style="color:var(--text-light)">${p.brand}</small></td>
        <td>${p.category === 'perros' ? '🐕 Perros' : '🐱 Gatos'}</td>
        <td>$${p.pricePerKg}</td>
        <td>${p.stock} kg</td>
        <td><span class="stock-badge ${status.class}">${status.label}</span></td>
        <td><div class="actions">
          <button class="btn btn-primary btn-sm sell-btn" data-id="${p.id}" title="Registrar venta">💰</button>
          <button class="btn btn-outline btn-sm edit-btn" data-id="${p.id}" title="Editar">✏️</button>
          <button class="btn btn-danger btn-sm del-btn" data-id="${p.id}" title="Eliminar">🗑️</button>
        </div></td>
      </tr>`;
    }).join('');

    // Sell buttons
    tbody.querySelectorAll('.sell-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = getProducts().find(x => x.id === parseInt(btn.dataset.id));
        if (!p) return;
        showModal({
          title: `💰 Registrar Venta - ${p.name}`,
          content: `
            <div class="order-form">
              <div class="form-group"><label>Cantidad (kg)</label><input type="number" id="sale-qty" min="0.5" step="0.5" value="1" style="padding:10px;border:2px solid var(--border);border-radius:8px;" /></div>
              <div class="form-group"><label>Cliente (opcional)</label><input type="text" id="sale-client" placeholder="Nombre del cliente" style="padding:10px;border:2px solid var(--border);border-radius:8px;" /></div>
              <p style="margin-top:10px;font-size:0.9rem;color:var(--text-light);">Precio: $${p.pricePerKg}/kg · Stock actual: ${p.stock}kg</p>
            </div>`,
          confirmText: 'Registrar Venta',
          onConfirm: (modal) => {
            const qty = parseFloat(modal.querySelector('#sale-qty').value);
            const client = modal.querySelector('#sale-client').value;
            if (!qty || qty <= 0) { showToast('Cantidad inválida', 'error'); return; }
            if (qty > p.stock) { showToast('No hay suficiente stock', 'error'); return; }
            const total = qty * p.pricePerKg;
            registerSale({ productId: p.id, productName: p.name, quantity: qty, total, client });
            showToast(`Venta registrada: ${qty}kg de ${p.name} = $${total}`, 'success');
            renderAdmin(container);
          }
        });
      });
    });

    // Edit buttons
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = getProducts().find(x => x.id === parseInt(btn.dataset.id));
        if (!p) return;
        showProductForm(p);
      });
    });

    // Delete buttons
    tbody.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = getProducts().find(x => x.id === parseInt(btn.dataset.id));
        showModal({
          title: '🗑️ Eliminar Producto',
          message: `¿Estás seguro de eliminar "${p.name}"? Esta acción no se puede deshacer.`,
          confirmText: 'Eliminar',
          onConfirm: () => {
            deleteProduct(p.id);
            showToast(`Producto "${p.name}" eliminado`, 'info');
            renderAdmin(container);
          }
        });
      });
    });
  }

  function renderSalesList() {
    const sales = getSales().slice(-10).reverse();
    const list = container.querySelector('#sales-list');
    if (sales.length === 0) {
      list.innerHTML = '<div class="empty-state"><div class="icon">📊</div><h3>Sin ventas aún</h3><p>Las ventas aparecerán aquí</p></div>';
      return;
    }
    list.innerHTML = `<div class="sales-list">${sales.map(s => `
      <div class="sale-item">
        <div class="sale-info">
          <strong>${s.productName}</strong>
          <small>${s.quantity}kg · ${s.client || 'Cliente anónimo'} · ${new Date(s.date).toLocaleDateString('es-MX')}</small>
        </div>
        <span class="sale-amount">$${(s.total || 0).toLocaleString()}</span>
      </div>`).join('')}</div>`;
  }

  function showProductForm(existing = null) {
    const isEdit = !!existing;
    showModal({
      title: isEdit ? '✏️ Editar Producto' : '➕ Agregar Producto',
      content: `
        <div class="order-form">
          <div class="form-group"><label>Nombre</label><input id="pf-name" value="${existing?.name || ''}" style="padding:10px;border:2px solid var(--border);border-radius:8px;" /></div>
          <div class="form-group"><label>Marca</label><input id="pf-brand" value="${existing?.brand || ''}" style="padding:10px;border:2px solid var(--border);border-radius:8px;" /></div>
          <div class="form-row">
            <div class="form-group"><label>Categoría</label><select id="pf-cat" style="padding:10px;border:2px solid var(--border);border-radius:8px;"><option value="perros" ${existing?.category === 'perros' ? 'selected' : ''}>🐕 Perros</option><option value="gatos" ${existing?.category === 'gatos' ? 'selected' : ''}>🐱 Gatos</option></select></div>
            <div class="form-group"><label>Emoji</label><input id="pf-emoji" value="${existing?.emoji || '🐾'}" maxlength="4" style="padding:10px;border:2px solid var(--border);border-radius:8px;" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Precio por kg ($)</label><input type="number" id="pf-pricekg" value="${existing?.pricePerKg || ''}" style="padding:10px;border:2px solid var(--border);border-radius:8px;" /></div>
            <div class="form-group"><label>Peso bolsa (kg)</label><input type="number" id="pf-bagw" value="${existing?.bagWeight || ''}" style="padding:10px;border:2px solid var(--border);border-radius:8px;" /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Precio bolsa ($)</label><input type="number" id="pf-pricebag" value="${existing?.priceBag || ''}" style="padding:10px;border:2px solid var(--border);border-radius:8px;" /></div>
            <div class="form-group"><label>Stock (kg)</label><input type="number" id="pf-stock" value="${existing?.stock || ''}" style="padding:10px;border:2px solid var(--border);border-radius:8px;" /></div>
          </div>
          <div class="form-group"><label>Descripción</label><textarea id="pf-desc" rows="2" style="padding:10px;border:2px solid var(--border);border-radius:8px;">${existing?.description || ''}</textarea></div>
        </div>`,
      confirmText: isEdit ? 'Guardar' : 'Agregar',
      onConfirm: (modal) => {
        const data = {
          name: modal.querySelector('#pf-name').value.trim(),
          brand: modal.querySelector('#pf-brand').value.trim(),
          category: modal.querySelector('#pf-cat').value,
          emoji: modal.querySelector('#pf-emoji').value || '🐾',
          pricePerKg: parseFloat(modal.querySelector('#pf-pricekg').value) || 0,
          bagWeight: parseFloat(modal.querySelector('#pf-bagw').value) || 0,
          priceBag: parseFloat(modal.querySelector('#pf-pricebag').value) || 0,
          stock: parseFloat(modal.querySelector('#pf-stock').value) || 0,
          description: modal.querySelector('#pf-desc').value.trim(),
          unit: 'kg'
        };
        if (!data.name || !data.brand) { showToast('Nombre y marca son requeridos', 'error'); return; }
        if (isEdit) {
          updateProduct(existing.id, data);
          showToast(`Producto "${data.name}" actualizado`, 'success');
        } else {
          addProduct(data);
          showToast(`Producto "${data.name}" agregado`, 'success');
        }
        renderAdmin(container);
      }
    });
  }

  container.querySelector('#add-product-btn').addEventListener('click', () => showProductForm());
  renderProductsTable();
  renderSalesList();
}
