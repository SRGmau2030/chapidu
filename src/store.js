// ===== CHAPIDU STORE - Data Management =====

const STORAGE_KEY = 'chapidu_data';
const ADMIN_CODE = 'FIDAC';
const ADMIN_SESSION_KEY = 'chapidu_admin';

// Default products
const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Royal Canin Medium Adult', brand: 'Royal Canin', category: 'perros', pricePerKg: 165, priceBag: 1650, bagWeight: 10, stock: 25, unit: 'kg', emoji: '🐕', description: 'Alimento seco para perros adultos de razas medianas' },
  { id: 2, name: 'Pedigree Adulto Res', brand: 'Pedigree', category: 'perros', pricePerKg: 85, priceBag: 1700, bagWeight: 20, stock: 40, unit: 'kg', emoji: '🦮', description: 'Croquetas para perros adultos sabor res' },
  { id: 3, name: 'Dog Chow Cachorro', brand: 'Dog Chow', category: 'perros', pricePerKg: 95, priceBag: 1900, bagWeight: 20, stock: 30, unit: 'kg', emoji: '🐶', description: 'Alimento para cachorros todas las razas' },
  { id: 4, name: 'Ganador Premium Adulto', brand: 'Ganador', category: 'perros', pricePerKg: 55, priceBag: 1100, bagWeight: 20, stock: 50, unit: 'kg', emoji: '🐕‍🦺', description: 'Croquetas premium para perros adultos' },
  { id: 5, name: 'Proplan Optistart Cachorro', brand: 'ProPlan', category: 'perros', pricePerKg: 195, priceBag: 2925, bagWeight: 15, stock: 15, unit: 'kg', emoji: '🐩', description: 'Alimento premium para cachorros' },
  { id: 6, name: 'Nupec Adulto', brand: 'Nupec', category: 'perros', pricePerKg: 120, priceBag: 1800, bagWeight: 15, stock: 20, unit: 'kg', emoji: '🐕', description: 'Croquetas super premium para perros adultos' },
  { id: 7, name: 'Whiskas Adulto Atún', brand: 'Whiskas', category: 'gatos', pricePerKg: 110, priceBag: 1100, bagWeight: 10, stock: 35, unit: 'kg', emoji: '🐱', description: 'Alimento para gatos adultos sabor atún' },
  { id: 8, name: 'Felix Gatitos', brand: 'Felix', category: 'gatos', pricePerKg: 130, priceBag: 1300, bagWeight: 10, stock: 20, unit: 'kg', emoji: '🐈', description: 'Alimento para gatitos en crecimiento' },
  { id: 9, name: 'Royal Canin Kitten', brand: 'Royal Canin', category: 'gatos', pricePerKg: 220, priceBag: 2200, bagWeight: 10, stock: 18, unit: 'kg', emoji: '😺', description: 'Alimento premium para gatitos' },
  { id: 10, name: 'Cat Chow Adulto Pescado', brand: 'Cat Chow', category: 'gatos', pricePerKg: 100, priceBag: 1500, bagWeight: 15, stock: 22, unit: 'kg', emoji: '🐈‍⬛', description: 'Croquetas para gatos adultos sabor pescado' },
  { id: 11, name: 'Proplan Gato Indoor', brand: 'ProPlan', category: 'gatos', pricePerKg: 210, priceBag: 3150, bagWeight: 15, stock: 12, unit: 'kg', emoji: '🐱', description: 'Alimento para gatos de interior' },
  { id: 12, name: 'Nupec Gato Adulto', brand: 'Nupec', category: 'gatos', pricePerKg: 155, priceBag: 1550, bagWeight: 10, stock: 16, unit: 'kg', emoji: '😸', description: 'Croquetas super premium para gatos' },
  { id: 13, name: 'Cunipic Premium Conejo', brand: 'Cunipic', category: 'conejos', pricePerKg: 130, priceBag: 1300, bagWeight: 10, stock: 15, unit: 'kg', emoji: '🐇', description: 'Alimento premium para conejos adultos' },
  { id: 14, name: 'Versele-Laga Cuni Nature', brand: 'Versele-Laga', category: 'conejos', pricePerKg: 150, priceBag: 1500, bagWeight: 10, stock: 10, unit: 'kg', emoji: '🐰', description: 'Pellets naturales para conejos enanos y adultos' },
];

function getStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = { products: DEFAULT_PRODUCTS, sales: [], nextId: 15 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  const data = JSON.parse(raw);
  // Migration: add any DEFAULT_PRODUCTS that don't exist in stored data
  let changed = false;
  DEFAULT_PRODUCTS.forEach(def => {
    if (!data.products.find(p => p.id === def.id)) {
      data.products.push(def);
      if (def.id >= data.nextId) data.nextId = def.id + 1;
      changed = true;
    }
  });
  if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function saveStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getProducts() { return getStore().products; }

export function getProductById(id) {
  return getStore().products.find(p => p.id === id);
}

export function getProductsByCategory(cat) {
  if (!cat || cat === 'todos') return getStore().products;
  return getStore().products.filter(p => p.category === cat);
}

export function addProduct(product) {
  const data = getStore();
  product.id = data.nextId++;
  data.products.push(product);
  saveStore(data);
  return product;
}

export function updateProduct(id, updates) {
  const data = getStore();
  const idx = data.products.findIndex(p => p.id === id);
  if (idx !== -1) { data.products[idx] = { ...data.products[idx], ...updates }; saveStore(data); }
}

export function deleteProduct(id) {
  const data = getStore();
  data.products = data.products.filter(p => p.id !== id);
  saveStore(data);
}

export function registerSale(sale) {
  const data = getStore();
  const product = data.products.find(p => p.id === sale.productId);
  if (product) {
    product.stock = Math.max(0, product.stock - sale.quantity);
  }
  data.sales.push({ ...sale, id: Date.now(), date: new Date().toISOString() });
  saveStore(data);
  return product;
}

export function getSales() { return getStore().sales; }

export function isAdmin() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

export function loginAdmin(code) {
  if (code === ADMIN_CODE) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    return true;
  }
  return false;
}

export function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function getStockStatus(stock) {
  if (stock <= 0) return { label: 'Agotado', class: 'no-stock' };
  if (stock <= 10) return { label: `Últimas ${stock} unidades`, class: 'low-stock' };
  return { label: 'Disponible', class: 'in-stock' };
}

export function getTotalProducts() { return getStore().products.length; }
export function getTotalStock() { return getStore().products.reduce((s, p) => s + p.stock, 0); }
export function getLowStockProducts() { return getStore().products.filter(p => p.stock <= 10); }
export function getTotalSales() { return getStore().sales.length; }
export function getTotalRevenue() { return getStore().sales.reduce((s, sale) => s + (sale.total || 0), 0); }
