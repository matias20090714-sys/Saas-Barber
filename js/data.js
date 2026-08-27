/* ==========================================================================
   BARBERFLOW - MULTI-TENANT ISOLATED DATA STORE
   Cada barbería tiene su espacio de almacenamiento 100% independiente
   aislado por ID/Slug en la URL o navegador local.
   ========================================================================== */

function getShopIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    let shopId = params.get('shop') || params.get('barberia');
    if (!shopId) {
        shopId = localStorage.getItem('BARBERFLOW_LAST_ACTIVE_SHOP') || 'mi-barberia';
    }
    return shopId.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}

function getStorageKey(shopId) {
    return `BARBERFLOW_DATA_${shopId || getShopIdFromUrl()}`;
}

const DEFAULT_SHOP_TEMPLATE = {
    shop: {
        id: 'mi-barberia',
        name: 'Mi Barbería',
        address: '',
        phone: '',
        currency: '$'
    },
    services: [
        { id: 'srv-1', name: 'Corte de Cabello', duration: 30, price: 10, desc: '' },
        { id: 'srv-2', name: 'Arreglo de Barba', duration: 20, price: 6, desc: '' },
        { id: 'srv-3', name: 'Corte + Barba', duration: 45, price: 15, desc: '' }
    ],
    barbers: [
        { id: 'barb-1', name: 'Barbero 1', specialty: 'General', commissionPct: 50, active: true }
    ],
    appointments: [],
    posTransactions: [],
    clients: []
};

function getStore() {
    try {
        const shopId = getShopIdFromUrl();
        const key = getStorageKey(shopId);
        const local = localStorage.getItem(key);
        if (!local) {
            const initial = JSON.parse(JSON.stringify(DEFAULT_SHOP_TEMPLATE));
            initial.shop.id = shopId;
            initial.shop.name = formatShopName(shopId);
            saveStore(initial);
            return initial;
        }
        return JSON.parse(local);
    } catch (e) {
        console.error('Error al cargar datos', e);
        return JSON.parse(JSON.stringify(DEFAULT_SHOP_TEMPLATE));
    }
}

function saveStore(data) {
    try {
        const shopId = getShopIdFromUrl();
        const key = getStorageKey(shopId);
        localStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem('BARBERFLOW_LAST_ACTIVE_SHOP', shopId);
    } catch (e) {
        console.error('Error al guardar datos', e);
    }
}

function formatShopName(slug) {
    if (!slug || slug === 'mi-barberia') return 'Mi Barbería';
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
