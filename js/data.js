/* ==========================================================================
   BARBERFLOW - MULTI-TENANT REAL STORE (CON VALIDACIÓN DE ESTADO DE PAGO)
   ========================================================================== */

const STORAGE_VERSION = 'BARBERFLOW_PROD_V3';

function getShopIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    let shopId = params.get('shop') || params.get('barberia');
    if (!shopId) {
        shopId = localStorage.getItem('BARBERFLOW_LAST_ACTIVE_SHOP') || 'mi-barberia';
    }
    return shopId.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}

function getStorageKey(shopId) {
    return `${STORAGE_VERSION}_${shopId || getShopIdFromUrl()}`;
}

function isShopBlocked(shopId) {
    try {
        const id = shopId || getShopIdFromUrl();
        const blockedMap = JSON.parse(localStorage.getItem('BARBERFLOW_BLOCKED_SHOPS') || '{}');
        return blockedMap[id] === true;
    } catch (e) {
        return false;
    }
}

const CLEAN_SHOP_TEMPLATE = {
    shop: {
        id: 'mi-barberia',
        name: 'Mi Barbería',
        address: '',
        phone: '',
        currency: '$',
        photo: ''
    },
    services: [
        { id: 'srv-1', name: 'Corte de Cabello', duration: 30, price: 10, desc: 'Corte general' },
        { id: 'srv-2', name: 'Barba', duration: 20, price: 5, desc: 'Arreglo y perfilado' }
    ],
    barbers: [],
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
            const initial = JSON.parse(JSON.stringify(CLEAN_SHOP_TEMPLATE));
            initial.shop.id = shopId;
            initial.shop.name = formatShopName(shopId);
            saveStore(initial);
            return initial;
        }
        return JSON.parse(local);
    } catch (e) {
        console.error('Error al cargar datos', e);
        return JSON.parse(JSON.stringify(CLEAN_SHOP_TEMPLATE));
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
