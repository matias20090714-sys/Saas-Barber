/* ==========================================================================
   BARBERFLOW - DATOS INICIALES Y LOCALSTORAGE
   ========================================================================== */

const STORAGE_KEY = 'BARBERFLOW_TOOL_V1';

const INITIAL_DATA = {
    // 1. Configuración editable de la barbería
    shop: {
        id: 'shop-01',
        name: 'Mi Barbería VIP',
        address: 'Av. Principal 450, Centro',
        phone: '+5491122334455',
        currency: '$'
    },

    // 2. Catálogo de Servicios
    services: [
        { id: 'srv-1', name: 'Fade / Degradado Moderno', duration: 40, price: 15, desc: 'Degradado con navaja y perfilado.' },
        { id: 'srv-2', name: 'Corte Clásico a Tijera', duration: 35, price: 12, desc: 'Corte tradicional personalizado.' },
        { id: 'srv-3', name: 'Ritual de Barba y Toalla Caliente', duration: 30, price: 10, desc: 'Afeitado con navaja y aceites esenciales.' },
        { id: 'srv-4', name: 'Combo VIP (Corte + Barba)', duration: 60, price: 22, desc: 'Experiencia completa de corte y barba.' },
        { id: 'srv-5', name: 'Color / Claritos / Platinado', duration: 90, price: 30, desc: 'Decoloración y matizado profesional.' }
    ],

    // 3. Barberos del Local
    barbers: [
        { id: 'barb-1', name: 'Franco Rossi', specialty: 'Especialista en Fades', commissionPct: 55, active: true },
        { id: 'barb-2', name: 'Mateo Delgado', specialty: 'Master Barber & Barbas', commissionPct: 50, active: true },
        { id: 'barb-3', name: 'Lucas Benítez', specialty: 'Cortes Clásicos & Tijera', commissionPct: 50, active: true }
    ],

    // 4. Turnos de la Agenda
    appointments: [
        {
            id: 'app-101',
            clientName: 'Ignacio Gómez',
            clientPhone: '+54 9 11 4455-6677',
            serviceId: 'srv-1',
            barberId: 'barb-1',
            date: new Date().toISOString().split('T')[0],
            time: '11:00',
            status: 'Completado',
            notes: 'Fade alto en 0',
            paid: true,
            amount: 15
        },
        {
            id: 'app-102',
            clientName: 'Gonzalo Silva',
            clientPhone: '+54 9 11 3322-1144',
            serviceId: 'srv-4',
            barberId: 'barb-2',
            date: new Date().toISOString().split('T')[0],
            time: '12:00',
            status: 'Completado',
            notes: 'Combo VIP',
            paid: true,
            amount: 22
        },
        {
            id: 'app-103',
            clientName: 'Martín Torres',
            clientPhone: '+54 9 11 7788-9900',
            serviceId: 'srv-2',
            barberId: 'barb-1',
            date: new Date().toISOString().split('T')[0],
            time: '15:00',
            status: 'EnAtencion',
            notes: 'Solo tijera arriba',
            paid: false,
            amount: 12
        },
        {
            id: 'app-104',
            clientName: 'Nicolás Paredes',
            clientPhone: '+54 9 11 9988-1122',
            serviceId: 'srv-1',
            barberId: 'barb-3',
            date: new Date().toISOString().split('T')[0],
            time: '16:30',
            status: 'Pendiente',
            notes: 'Primera visita',
            paid: false,
            amount: 15
        },
        {
            id: 'app-105',
            clientName: 'Facundo Rivas',
            clientPhone: '+54 9 11 6655-4433',
            serviceId: 'srv-3',
            barberId: 'barb-2',
            date: new Date().toISOString().split('T')[0],
            time: '17:30',
            status: 'Pendiente',
            notes: 'Arreglo de barba',
            paid: false,
            amount: 10
        }
    ],

    // 5. Caja & POS
    posTransactions: [
        {
            id: 'pos-1',
            time: '11:45',
            concept: 'Fade / Degradado Moderno',
            client: 'Ignacio Gómez',
            barberId: 'barb-1',
            method: 'Efectivo',
            amount: 15,
            type: 'income'
        },
        {
            id: 'pos-2',
            time: '12:15',
            concept: 'Pomada Fijadora Mate',
            client: 'Ignacio Gómez',
            barberId: 'barb-1',
            method: 'Efectivo',
            amount: 10,
            type: 'income'
        },
        {
            id: 'pos-3',
            time: '13:00',
            concept: 'Combo VIP (Corte + Barba)',
            client: 'Gonzalo Silva',
            barberId: 'barb-2',
            method: 'Transferencia',
            amount: 22,
            type: 'income'
        }
    ],

    // 6. Base de Clientes (CRM)
    clients: [
        { id: 'cli-1', name: 'Ignacio Gómez', phone: '+54 9 11 4455-6677', visits: 6, totalSpent: 125, lastVisit: new Date().toISOString().split('T')[0], notes: 'Fade alto con 0' },
        { id: 'cli-2', name: 'Gonzalo Silva', phone: '+54 9 11 3322-1144', visits: 4, totalSpent: 98, lastVisit: new Date().toISOString().split('T')[0], notes: 'Combo VIP' },
        { id: 'cli-3', name: 'Martín Torres', phone: '+54 9 11 7788-9900', visits: 2, totalSpent: 24, lastVisit: new Date().toISOString().split('T')[0], notes: 'Solo tijera' },
        { id: 'cli-4', name: 'Nicolás Paredes', phone: '+54 9 11 9988-1122', visits: 1, totalSpent: 15, lastVisit: new Date().toISOString().split('T')[0], notes: 'Degradado medio' }
    ]
};

function getStore() {
    try {
        const local = localStorage.getItem(STORAGE_KEY);
        if (!local) {
            saveStore(INITIAL_DATA);
            return JSON.parse(JSON.stringify(INITIAL_DATA));
        }
        return JSON.parse(local);
    } catch (e) {
        console.error('Error loading store', e);
        return JSON.parse(JSON.stringify(INITIAL_DATA));
    }
}

function saveStore(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving store', e);
    }
}

function resetStore() {
    localStorage.removeItem(STORAGE_KEY);
    saveStore(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
}
