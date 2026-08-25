// ===== CHAPIDU STORE - Data Management =====

const STORAGE_KEY = 'chapidu_data';
const ADMIN_CODE = 'FIDAC';
const ADMIN_SESSION_KEY = 'chapidu_admin';

// Default products — productos reales Chapidu
// Nota: priceBag = pricePerKg × bagWeight (precio bolsa completa referencial)
// emoji: se usa en el dropdown del formulario y en el mensaje de WhatsApp
const DEFAULT_PRODUCTS = [
  // ── PERROS (8) ──────────────────────────────────────────────────────────────
  {
    id: 1,
    name: 'Ganador Premium Adulto Razas Pequeñas',
    brand: 'Ganador',
    category: 'perros',
    emoji: '🐕',
    pricePerKg: 68,
    bagWeight: 10,
    priceBag: 680,
    stock: 30,
    unit: 'kg',
    image: '/products/dog/ganadorPrem-rp.png',
    description: 'Croquetas premium para perros adultos de razas pequeñas',
  },
  {
    id: 2,
    name: 'Ganador Premium Adulto Razas Grandes',
    brand: 'Ganador',
    category: 'perros',
    emoji: '🐕',
    pricePerKg: 68,
    bagWeight: 20,
    priceBag: 1360,
    stock: 30,
    unit: 'kg',
    image: '/products/dog/ganaorPrem-rg.png',
    description: 'Croquetas premium para perros adultos de razas grandes',
  },
  {
    id: 3,
    name: 'Poder Canino',
    brand: 'Poder Canino',
    category: 'perros',
    emoji: '🦮',
    pricePerKg: 30,
    bagWeight: 25,
    priceBag: 750,
    stock: 50,
    unit: 'kg',
    image: '/products/dog/poder.canino.png',
    description: 'Alimento económico para perros adultos',
  },
  {
    id: 4,
    name: 'Dog Chow Adulto Razas Medianas/Grandes',
    brand: 'Dog Chow',
    category: 'perros',
    emoji: '🐶',
    pricePerKg: 58,
    bagWeight: 18,
    priceBag: 1044,
    stock: 35,
    unit: 'kg',
    image: '/products/dog/dogchow-adult-rmg.png',
    description: 'Croquetas Dog Chow para perros adultos de razas medianas y grandes',
  },
  {
    id: 5,
    name: 'Dog Chow Adulto Razas Pequeñas',
    brand: 'Dog Chow',
    category: 'perros',
    emoji: '🐶',
    pricePerKg: 58,
    bagWeight: 8,
    priceBag: 464,
    stock: 35,
    unit: 'kg',
    image: '/products/dog/dogchow-adult-rp.png',
    description: 'Croquetas Dog Chow para perros adultos de razas pequeñas',
  },
  {
    id: 6,
    name: 'Ganador Original Cachorro Razas Pequeñas',
    brand: 'Ganador',
    category: 'perros',
    emoji: '🐩',
    pricePerKg: 62,
    bagWeight: 10,
    priceBag: 620,
    stock: 25,
    unit: 'kg',
    image: '/products/dog/ganadorOg-cachorro-rp.png',
    description: 'Alimento para cachorros de razas pequeñas',
  },
  {
    id: 7,
    name: 'Ganador Original Cachorro Razas Grandes',
    brand: 'Ganador',
    category: 'perros',
    emoji: '🐩',
    pricePerKg: 62,
    bagWeight: 20,
    priceBag: 1240,
    stock: 25,
    unit: 'kg',
    image: '/products/dog/ganadorOg-cachorro.png',
    description: 'Alimento para cachorros de razas grandes',
  },
  {
    id: 8,
    name: 'Choice Nutrition Adulto',
    brand: 'Choice Nutrition',
    category: 'perros',
    emoji: '🐕‍🦺',
    pricePerKg: 70,
    bagWeight: 20,
    priceBag: 1400,
    stock: 20,
    unit: 'kg',
    image: '/products/dog/c-nutri-adult.png',
    description: 'Alimento super premium para perros adultos',
  },
  // ── GATOS (2) ───────────────────────────────────────────────────────────────
  {
    id: 9,
    name: 'Minino Plus',
    brand: 'Minino',
    category: 'gatos',
    emoji: '🐱',
    pricePerKg: 70,
    bagWeight: 10,
    priceBag: 700,
    stock: 30,
    unit: 'kg',
    image: '/products/cat/minino.png',
    description: 'Alimento completo para gatos adultos',
  },
  {
    id: 10,
    name: 'Whiskas Adulto',
    brand: 'Whiskas',
    category: 'gatos',
    emoji: '🐈',
    pricePerKg: 58,
    bagWeight: 9,
    priceBag: 522,
    stock: 30,
    unit: 'kg',
    image: '/products/cat/whiskas.png',
    description: 'Croquetas Whiskas para gatos adultos',
  },
  // ── CONEJOS (1) ─────────────────────────────────────────────────────────────
  {
    id: 11,
    name: 'Conejina',
    brand: 'Conejina',
    category: 'conejos',
    emoji: '🐰',
    pricePerKg: 20,
    bagWeight: 5,
    priceBag: 100,
    stock: 20,
    unit: 'kg',
    image: '/products/rabbit/conejina.png',
    description: 'Alimento para conejos enanos y adultos',
  },
];

function getStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = { products: DEFAULT_PRODUCTS, sales: [], nextId: 12 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  const data = JSON.parse(raw);
  // Migration: sync DEFAULT_PRODUCTS — agrega nuevos y parchea campos faltantes (ej. image)
  let changed = false;
  DEFAULT_PRODUCTS.forEach(def => {
    const existing = data.products.find(p => p.id === def.id);
    if (!existing) {
      data.products.push(def);
      if (def.id >= data.nextId) data.nextId = def.id + 1;
      changed = true;
    } else {
      // Parcha TODOS los campos canónicos desde DEFAULT_PRODUCTS
      // Incluye name, brand y category para corregir datos viejos (ej. "Proplan gato indoor" → "Conejina")
      ['name', 'brand', 'category', 'image', 'pricePerKg', 'priceBag', 'bagWeight', 'description'].forEach(field => {
        if (def[field] !== undefined && existing[field] !== def[field]) {
          existing[field] = def[field];
          changed = true;
        }
      });
      // Parcha también el emoji (ahora es un campo intencional, no se elimina)
      if (def.emoji !== undefined && existing.emoji !== def.emoji) { existing.emoji = def.emoji; changed = true; }
    }
  });
  // Purga productos demo del sistema anterior (IDs conocidos que ya no forman parte del catálogo real)
  const PURGE_IDS = new Set([13, 14]); // Cunipic Premium Conejo, Versele-Laga Cuni Nature
  const defaultIds = new Set(DEFAULT_PRODUCTS.map(p => p.id));
  const before = data.products.length;
  data.products = data.products.filter(p => defaultIds.has(p.id) || (!PURGE_IDS.has(p.id) && p.id >= 12));
  if (data.products.length !== before) changed = true;
  if (data.nextId < 12) { data.nextId = 12; changed = true; }
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
