/* ==========================================================================
   BARBERFLOW - CONTROLADOR DE HERRAMIENTAS OPERATIVAS (100% REAL)
   ========================================================================== */

let currentAgendaDate = new Date().toISOString().split('T')[0];
let currentBarberFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    loadShopBranding();
    loadAgenda();
    loadPOS();
    loadCommissions();
    loadClientsCRM();
    loadBarbersManage();
    loadServicesManage();

    const agendaPicker = document.getElementById('agendaDatePicker');
    if (agendaPicker) agendaPicker.value = currentAgendaDate;

    const walkInDate = document.getElementById('walkInDate');
    if (walkInDate) walkInDate.value = currentAgendaDate;
}

/* ==========================================================================
   NAVEGACIÓN ENTRE PESTAÑAS
   ========================================================================== */
function switchMainTab(tabName) {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    const target = document.getElementById(`panel${capitalizeFirst(toCamelCase(tabName))}`);
    if (target) target.classList.add('active');

    if (tabName === 'agenda') loadAgenda();
    if (tabName === 'pos') loadPOS();
    if (tabName === 'commissions') loadCommissions();
    if (tabName === 'clients') loadClientsCRM();
    if (tabName === 'barbers') loadBarbersManage();
    if (tabName === 'settings') loadServicesManage();
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-circle-check text-green' : 'fa-circle-info text-blue';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ==========================================================================
   CONFIGURACIÓN Y AJUSTES DE LA BARBERÍA (CON FOTO Y LOGO)
   ========================================================================== */
function getBookingPortalUrl() {
    const store = getStore();
    const shopId = store.shop.id || getShopIdFromUrl();
    const baseUrl = window.location.href.split('?')[0].replace('index.html', '');
    return `${baseUrl}booking.html?shop=${shopId}`;
}

function loadShopBranding() {
    const store = getStore();
    const curr = store.shop.currency || '$';
    
    document.getElementById('headerShopTitle').textContent = store.shop.name;
    document.getElementById('settingShopName').value = store.shop.name;
    document.getElementById('settingShopAddress').value = store.shop.address || '';
    document.getElementById('settingShopPhone').value = store.shop.phone || '';
    document.getElementById('settingCurrency').value = curr;

    const bookingUrl = getBookingPortalUrl();
    const publicBookingInput = document.getElementById('publicBookingLinkInput');
    if (publicBookingInput) publicBookingInput.value = bookingUrl;

    // Render avatar photo if set
    renderShopPhotoAvatar(store.shop.photo);
}

function renderShopPhotoAvatar(photoUrl) {
    const headerLogoBadge = document.getElementById('headerShopLogoBadge');
    const settingsPreview = document.getElementById('settingsPhotoPreview');
    const btnRemove = document.getElementById('btnRemovePhoto');

    if (photoUrl) {
        if (headerLogoBadge) headerLogoBadge.innerHTML = `<img src="${photoUrl}" alt="Logo">`;
        if (settingsPreview) settingsPreview.innerHTML = `<img src="${photoUrl}" alt="Logo">`;
        if (btnRemove) btnRemove.style.display = 'inline-flex';
    } else {
        if (headerLogoBadge) headerLogoBadge.innerHTML = `<i class="fa-solid fa-scissors"></i>`;
        if (settingsPreview) settingsPreview.innerHTML = `<i class="fa-solid fa-scissors"></i>`;
        if (btnRemove) btnRemove.style.display = 'none';
    }
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Por favor selecciona una imagen menor a 2MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Photo = e.target.result;
        const store = getStore();
        store.shop.photo = base64Photo;
        saveStore(store);
        renderShopPhotoAvatar(base64Photo);
        showToast('Foto de la barbería actualizada con éxito', 'success');
    };
    reader.readAsDataURL(file);
}

function removeShopPhoto() {
    if (confirm('¿Eliminar la foto de la barbería?')) {
        const store = getStore();
        store.shop.photo = '';
        saveStore(store);
        renderShopPhotoAvatar('');
        showToast('Foto eliminada', 'info');
    }
}

function saveShopSettings() {
    const store = getStore();
    const newName = document.getElementById('settingShopName').value.trim();
    store.shop.name = newName || 'Mi Barbería';
    store.shop.address = document.getElementById('settingShopAddress').value.trim();
    store.shop.phone = document.getElementById('settingShopPhone').value.trim();
    store.shop.currency = document.getElementById('settingCurrency').value.trim() || '$';

    saveStore(store);
    loadShopBranding();
    showToast('¡Ajustes guardados!', 'success');
}

function copyPublicBookingLink() {
    const bookingUrl = getBookingPortalUrl();
    navigator.clipboard.writeText(bookingUrl);
    showToast('¡Link de reservas copiado al portapapeles!', 'success');
}

function shareBookingWhatsApp() {
    const store = getStore();
    const bookingUrl = getBookingPortalUrl();
    const msg = encodeURIComponent(`💈 ¡Hola! Reserva tu turno online en ${store.shop.name} directamente desde este link:\n${bookingUrl}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
}

function openBookingPortalTab() {
    window.open(getBookingPortalUrl(), '_blank');
}

function exportDataBackup() {
    const store = getStore();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `barberflow-${store.shop.name.replace(/\s+/g, '_')}.json`);
    dlAnchorElem.click();
    showToast('Respaldo descargado', 'success');
}

function importDataBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.shop || !data.services) {
                alert('El archivo no contiene un respaldo válido de BarberFlow.');
                return;
            }
            saveStore(data);
            initApp();
            showToast('¡Copia de seguridad restaurada con éxito!', 'success');
        } catch (err) {
            alert('Error al leer el archivo de respaldo.');
        }
    };
    reader.readAsText(file);
}

/* ==========================================================================
   1. AGENDA EN VIVO
   ========================================================================== */
function changeAgendaDate(delta) {
    const current = new Date(currentAgendaDate + 'T00:00:00');
    current.setDate(current.getDate() + delta);
    currentAgendaDate = current.toISOString().split('T')[0];
    document.getElementById('agendaDatePicker').value = currentAgendaDate;
    loadAgenda();
}

function loadAgenda() {
    const picker = document.getElementById('agendaDatePicker');
    if (picker && picker.value) currentAgendaDate = picker.value;

    const store = getStore();
    const curr = store.shop.currency || '$';
    const container = document.getElementById('agendaAppointmentsContainer');
    const filtersContainer = document.getElementById('agendaBarberFilters');

    // Filtros de barberos
    let filterHtml = `<button class="barber-pill-btn ${currentBarberFilter === 'all' ? 'active' : ''}" onclick="setBarberFilter('all')">Todos</button>`;
    (store.barbers || []).forEach(b => {
        filterHtml += `<button class="barber-pill-btn ${currentBarberFilter === b.id ? 'active' : ''}" onclick="setBarberFilter('${b.id}')"><i class="fa-solid fa-scissors"></i> ${b.name}</button>`;
    });
    filtersContainer.innerHTML = filterHtml;

    // Filtrar turnos
    const dayApps = (store.appointments || []).filter(a => {
        const matchDate = a.date === currentAgendaDate;
        const matchBarber = currentBarberFilter === 'all' || a.barberId === currentBarberFilter;
        return matchDate && matchBarber;
    });

    // Actualizar KPIs
    document.getElementById('kpiTodayCount').textContent = dayApps.length;
    const estRev = dayApps.reduce((acc, a) => acc + (a.amount || 0), 0);
    document.getElementById('kpiTodayRevenue').textContent = `${curr}${estRev}`;
    document.getElementById('kpiActiveBarbers').textContent = (store.barbers || []).filter(b => b.active).length;
    
    const nextPending = dayApps.find(a => a.status === 'Pendiente' || a.status === 'EnProceso');
    document.getElementById('kpiNextTime').textContent = nextPending ? nextPending.time : '--:--';

    const pendingCount = (store.appointments || []).filter(a => a.date === currentAgendaDate && a.status === 'Pendiente').length;
    document.getElementById('badgePendingCount').textContent = pendingCount;

    if (dayApps.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
                <i class="fa-solid fa-calendar-xmark text-muted" style="font-size: 2.5rem; margin-bottom: 0.8rem;"></i>
                <h3>No hay turnos agendados para esta fecha</h3>
                <p class="text-muted">Los turnos que reserven tus clientes por el link o los que agregues manualmente aparecerán aquí en vivo.</p>
                <div style="display:flex; justify-content:center; gap:0.8rem; margin-top:1.2rem;">
                    <button class="btn btn-primary" onclick="openNewWalkInModal()">+ Agendar Turno</button>
                    <button class="btn btn-secondary" onclick="switchMainTab('booking-link')"><i class="fa-solid fa-link"></i> Ver Link de Reservas</button>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = dayApps.map(app => {
        const service = (store.services || []).find(s => s.id === app.serviceId) || { name: 'Servicio', price: app.amount };
        const barber = (store.barbers || []).find(b => b.id === app.barberId) || { name: 'Sin asignar' };

        const statusLabels = {
            'Pendiente': 'Pendiente',
            'EnProceso': 'En Proceso',
            'Completado': 'Completado',
            'NoAsistio': 'No Asistió'
        };

        return `
            <div class="app-card status-${app.status}">
                <div class="app-card-head">
                    <span class="app-time"><i class="fa-regular fa-clock"></i> ${app.time} hs</span>
                    <span class="status-badge status-${app.status}">${statusLabels[app.status] || app.status}</span>
                </div>
                <div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.2rem;">${app.clientName}</h3>
                    <div class="text-gold" style="font-weight:600; font-size: 0.9rem;"><i class="fa-solid fa-scissors"></i> ${service.name} (${curr}${app.amount})</div>
                    <div class="text-muted" style="font-size: 0.82rem; margin-top: 0.3rem;"><i class="fa-solid fa-user-tie"></i> Barbero: <strong>${barber.name}</strong></div>
                    ${app.notes ? `<div class="text-muted mt-2" style="font-size: 0.78rem;">Nota: ${app.notes}</div>` : ''}
                </div>
                <div class="app-actions">
                    ${app.status === 'Pendiente' ? `
                        <button class="btn btn-secondary btn-block" onclick="updateAppointmentStatus('${app.id}', 'EnProceso')"><i class="fa-solid fa-scissors"></i> En Proceso</button>
                    ` : ''}
                    ${app.status === 'EnProceso' ? `
                        <button class="btn btn-primary btn-block" onclick="completeAndPayAppointment('${app.id}')"><i class="fa-solid fa-check"></i> Cobrar y Finalizar</button>
                    ` : ''}
                    ${app.status === 'Pendiente' ? `
                        <button class="btn-icon" title="Avisar por WhatsApp" onclick="sendWhatsAppReminder('${app.id}')"><i class="fa-brands fa-whatsapp text-green"></i></button>
                        <button class="btn-icon" title="No asistió" onclick="updateAppointmentStatus('${app.id}', 'NoAsistio')"><i class="fa-solid fa-user-xmark text-red"></i></button>
                    ` : ''}
                    ${app.status === 'Completado' ? `
                        <span class="text-green" style="font-size: 0.85rem; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Cobrado ${curr}${app.amount}</span>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function setBarberFilter(barberId) {
    currentBarberFilter = barberId;
    loadAgenda();
}

function updateAppointmentStatus(appId, newStatus) {
    const store = getStore();
    const app = (store.appointments || []).find(a => a.id === appId);
    if (app) {
        app.status = newStatus;
        saveStore(store);
        loadAgenda();
        loadCommissions();
        showToast('Turno actualizado', 'info');
    }
}

function completeAndPayAppointment(appId) {
    const store = getStore();
    const app = (store.appointments || []).find(a => a.id === appId);
    if (!app) return;

    app.status = 'Completado';
    app.paid = true;

    const service = (store.services || []).find(s => s.id === app.serviceId) || { name: 'Corte', price: app.amount };

    // Registrar en POS
    if (!store.posTransactions) store.posTransactions = [];
    store.posTransactions.push({
        id: 'pos-' + Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        concept: service.name,
        client: app.clientName,
        barberId: app.barberId,
        method: 'Efectivo',
        amount: app.amount,
        type: 'income'
    });

    // Actualizar cliente en CRM
    if (!store.clients) store.clients = [];
    const cli = store.clients.find(c => (app.clientPhone && c.phone === app.clientPhone) || c.name === app.clientName);
    if (cli) {
        cli.totalSpent = (cli.totalSpent || 0) + app.amount;
        cli.lastVisit = app.date;
    }

    saveStore(store);
    loadAgenda();
    loadPOS();
    loadCommissions();
    loadClientsCRM();
    showToast(`Turno cobrado ($${app.amount}) e ingresado a caja`, 'success');
}

function sendWhatsAppReminder(appId) {
    const store = getStore();
    const app = (store.appointments || []).find(a => a.id === appId);
    if (!app) return;

    const service = (store.services || []).find(s => s.id === app.serviceId) || { name: 'Corte' };
    const msg = encodeURIComponent(`Hola ${app.clientName}! Te confirmamos tu turno de hoy a las ${app.time} hs para "${service.name}" en ${store.shop.name}. ¿Nos confirmas tu asistencia? ¡Te esperamos!`);
    window.open(`https://wa.me/${(app.clientPhone || '').replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
}

/* ==========================================================================
   2. CAJA & PUNTO DE VENTA (POS)
   ========================================================================== */
function loadPOS() {
    const store = getStore();
    const curr = store.shop.currency || '$';
    const tbody = document.getElementById('posTableBody');
    if (!tbody) return;

    let total = 0;
    let cash = 0;
    let card = 0;
    let transfer = 0;

    (store.posTransactions || []).forEach(t => {
        const amt = t.type === 'expense' ? -t.amount : t.amount;
        total += amt;
        if (t.method === 'Efectivo') cash += amt;
        if (t.method === 'Tarjeta') card += amt;
        if (t.method === 'Transferencia') transfer += amt;
    });

    document.getElementById('posTotalToday').textContent = `${curr}${total.toFixed(2)}`;
    document.getElementById('posCashToday').textContent = `${curr}${cash.toFixed(2)}`;
    document.getElementById('posCardToday').textContent = `${curr}${card.toFixed(2)}`;
    document.getElementById('posTransferToday').textContent = `${curr}${transfer.toFixed(2)}`;

    if (!store.posTransactions || store.posTransactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;" class="text-muted">No hay movimientos registrados aún</td></tr>`;
        return;
    }

    tbody.innerHTML = store.posTransactions.slice().reverse().map(t => {
        const barber = (store.barbers || []).find(b => b.id === t.barberId) || { name: 'Local' };
        const isExp = t.type === 'expense';
        return `
            <tr>
                <td>${t.time}</td>
                <td><strong>${t.concept}</strong></td>
                <td>${t.client || '-'}</td>
                <td>${barber.name}</td>
                <td><span class="status-badge status-Pendiente">${t.method}</span></td>
                <td class="${isExp ? 'text-red' : 'text-green'}"><strong>${isExp ? '-' : '+'}${curr}${t.amount.toFixed(2)}</strong></td>
                <td>
                    <button class="btn-icon" title="Eliminar registro" onclick="deletePosTransaction('${t.id}')"><i class="fa-solid fa-trash text-muted"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function deletePosTransaction(id) {
    const store = getStore();
    store.posTransactions = (store.posTransactions || []).filter(t => t.id !== id);
    saveStore(store);
    loadPOS();
    showToast('Movimiento eliminado', 'info');
}

/* ==========================================================================
   3. COMISIONES
   ========================================================================== */
function loadCommissions() {
    const store = getStore();
    const curr = store.shop.currency || '$';
    const grid = document.getElementById('commissionsGrid');
    const tbody = document.getElementById('commissionsTableBody');
    if (!grid || !tbody) return;

    if (!store.barbers || store.barbers.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 2rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
                <p class="text-muted">Aún no has agregado barberos. Ve a la pestaña <strong>Equipo</strong> para añadir a tu personal.</p>
                <button class="btn btn-primary btn-sm mt-2" onclick="switchMainTab('barbers')">+ Agregar Barbero</button>
            </div>
        `;
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;" class="text-muted">No hay cortes realizados</td></tr>`;
        return;
    }

    const completedApps = (store.appointments || []).filter(a => a.status === 'Completado');

    grid.innerHTML = store.barbers.map(barber => {
        const bApps = completedApps.filter(a => a.barberId === barber.id);
        const totalBilled = bApps.reduce((sum, a) => sum + (a.amount || 0), 0);
        const barberCut = totalBilled * (barber.commissionPct / 100);
        const shopCut = totalBilled - barberCut;

        return `
            <div class="comm-card">
                <div class="comm-head">
                    <div style="width:40px;height:40px;border-radius:50%;background:var(--gold);color:#080c10;display:flex;align-items:center;justify-content:center;font-weight:800;">
                        ${barber.name.charAt(0)}
                    </div>
                    <div>
                        <h4 style="font-size:1.05rem;">${barber.name}</h4>
                        <span class="text-gold" style="font-size:0.8rem; font-weight:700;">${barber.commissionPct}% de Comisión</span>
                    </div>
                </div>
                <div class="comm-split-row">
                    <div>
                        <span class="text-muted" style="font-size:0.75rem; display:block;">Pago al Barbero</span>
                        <strong class="text-green" style="font-size:1.2rem;">${curr}${barberCut.toFixed(2)}</strong>
                    </div>
                    <div>
                        <span class="text-muted" style="font-size:0.75rem; display:block;">Ganancia del Local</span>
                        <strong class="text-gold" style="font-size:1.2rem;">${curr}${shopCut.toFixed(2)}</strong>
                    </div>
                </div>
                <div class="text-muted mt-2" style="font-size:0.78rem;">${bApps.length} cortes completados</div>
            </div>
        `;
    }).join('');

    if (completedApps.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;" class="text-muted">No hay cortes completados para liquidar aún</td></tr>`;
        return;
    }

    tbody.innerHTML = completedApps.map(app => {
        const barber = (store.barbers || []).find(b => b.id === app.barberId) || { name: 'Barbero', commissionPct: 50 };
        const service = (store.services || []).find(s => s.id === app.serviceId) || { name: 'Servicio' };
        const barberPay = (app.amount * (barber.commissionPct / 100)).toFixed(2);
        const shopProfit = (app.amount - barberPay).toFixed(2);

        return `
            <tr>
                <td>${app.date} ${app.time}</td>
                <td><strong>${barber.name}</strong></td>
                <td>${service.name}</td>
                <td>${curr}${app.amount}</td>
                <td>${barber.commissionPct}%</td>
                <td class="text-green"><strong>${curr}${barberPay}</strong></td>
                <td class="text-gold"><strong>${curr}${shopProfit}</strong></td>
            </tr>
        `;
    }).join('');
}

/* ==========================================================================
   4. CLIENTES & CRM
   ========================================================================== */
function loadClientsCRM() {
    const store = getStore();
    renderClientsTable(store.clients || []);
}

function renderClientsTable(list) {
    const store = getStore();
    const curr = store.shop.currency || '$';
    const tbody = document.getElementById('clientsTableBody');
    if (!tbody) return;

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;" class="text-muted">No hay clientes en el historial. Los clientes se añadirán automáticamente al agendar o cobrar turnos.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(c => `
        <tr>
            <td><strong>${c.name}</strong></td>
            <td><i class="fa-brands fa-whatsapp text-green"></i> ${c.phone || '-'}</td>
            <td><span class="status-badge status-Pendiente">${c.visits || 1} visitas</span></td>
            <td class="text-green"><strong>${curr}${c.totalSpent || 0}</strong></td>
            <td>${c.lastVisit || '-'}</td>
            <td><em style="color:var(--text-muted);">${c.notes || '-'}</em></td>
            <td>
                ${c.phone ? `
                    <button class="btn-icon" title="Escribir por WhatsApp" onclick="window.open('https://wa.me/${c.phone.replace(/[^0-9]/g, '')}', '_blank')">
                        <i class="fa-brands fa-whatsapp text-green"></i>
                    </button>
                ` : '-'}
            </td>
        </tr>
    `).join('');
}

function filterClientsList() {
    const q = document.getElementById('clientSearchInput').value.toLowerCase();
    const store = getStore();
    const filtered = (store.clients || []).filter(c => (c.name && c.name.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q)));
    renderClientsTable(filtered);
}

/* ==========================================================================
   5. EQUIPO & BARBEROS
   ========================================================================== */
function loadBarbersManage() {
    const store = getStore();
    const container = document.getElementById('barbersManageContainer');
    if (!container) return;

    if (!store.barbers || store.barbers.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
                <i class="fa-solid fa-user-group text-muted" style="font-size: 2.5rem; margin-bottom: 0.8rem;"></i>
                <h3>No hay barberos registrados</h3>
                <p class="text-muted">Agrega los barberos de tu equipo para asignarles turnos y liquidar sus comisiones.</p>
                <button class="btn btn-primary mt-4" onclick="openAddBarberModal()">+ Agregar Barbero</button>
            </div>
        `;
        return;
    }

    container.innerHTML = store.barbers.map(b => `
        <div class="barber-manage-card">
            <div class="barber-manage-info">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
                    <h3>${b.name}</h3>
                    <span class="status-badge status-Completado">${b.active ? 'Activo' : 'Inactivo'}</span>
                </div>
                <p class="text-muted" style="font-size:0.85rem; margin-bottom:0.4rem;">${b.specialty || 'Barbero'}</p>
                <div class="text-gold" style="font-weight:700; font-size:0.9rem;">Comisión: ${b.commissionPct}%</div>
            </div>
            <div style="margin-top:1.2rem; display:flex; justify-content:flex-end; gap:0.5rem;">
                <button class="btn-icon" title="Eliminar Barbero" onclick="deleteBarber('${b.id}')"><i class="fa-solid fa-trash text-muted"></i></button>
            </div>
        </div>
    `).join('');
}

function deleteBarber(id) {
    const store = getStore();
    if (confirm('¿Eliminar este barbero del equipo?')) {
        store.barbers = (store.barbers || []).filter(b => b.id !== id);
        saveStore(store);
        loadBarbersManage();
        loadAgenda();
        showToast('Barbero eliminado', 'info');
    }
}

/* ==========================================================================
   6. SERVICIOS & PRECIOS
   ========================================================================== */
function loadServicesManage() {
    const store = getStore();
    const curr = store.shop.currency || '$';
    const container = document.getElementById('manageServicesList');
    if (!container) return;

    if (!store.services || store.services.length === 0) {
        container.innerHTML = `<p class="text-muted" style="padding: 1rem; text-align:center;">No hay servicios configurados. Agrega uno con el botón "+ Nuevo Servicio".</p>`;
        return;
    }

    container.innerHTML = store.services.map(s => `
        <div class="service-item-row">
            <div>
                <strong>${s.name}</strong>
                <span class="text-muted" style="display:block; font-size:0.78rem;">${s.duration} min ${s.desc ? '- ' + s.desc : ''}</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.8rem;">
                <strong class="text-green">${curr}${s.price}</strong>
                <button class="btn-icon" style="width:32px;height:32px;" onclick="deleteService('${s.id}')"><i class="fa-solid fa-trash text-muted"></i></button>
            </div>
        </div>
    `).join('');
}

function deleteService(id) {
    const store = getStore();
    store.services = (store.services || []).filter(s => s.id !== id);
    saveStore(store);
    loadServicesManage();
    showToast('Servicio eliminado', 'info');
}

/* ==========================================================================
   MODALES
   ========================================================================== */
function openModal(id) {
    document.getElementById(id)?.classList.add('active');
}

function closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
}

function openNewWalkInModal() {
    const store = getStore();
    const curr = store.shop.currency || '$';

    const srvSelect = document.getElementById('walkInServiceSelect');
    if (!store.services || store.services.length === 0) {
        srvSelect.innerHTML = `<option value="">(Primero agrega servicios en Ajustes)</option>`;
    } else {
        srvSelect.innerHTML = store.services.map(s => `<option value="${s.id}">${s.name} (${curr}${s.price})</option>`).join('');
    }

    const barbSelect = document.getElementById('walkInBarberSelect');
    if (!store.barbers || store.barbers.length === 0) {
        barbSelect.innerHTML = `<option value="">(Sin asignar / General)</option>`;
    } else {
        barbSelect.innerHTML = store.barbers.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    }

    openModal('walkInModal');
}

function handleWalkInSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('walkInClientName').value.trim();
    const phone = document.getElementById('walkInClientPhone').value.trim() || '';
    const srvId = document.getElementById('walkInServiceSelect').value;
    const barbId = document.getElementById('walkInBarberSelect').value;
    const date = document.getElementById('walkInDate').value;
    const time = document.getElementById('walkInTime').value;

    const store = getStore();
    const service = (store.services || []).find(s => s.id === srvId);

    const newApp = {
        id: 'app-' + Date.now(),
        clientName: name,
        clientPhone: phone,
        serviceId: srvId,
        barberId: barbId,
        date: date,
        time: time,
        status: 'EnProceso',
        notes: '',
        paid: false,
        amount: service ? service.price : 10
    };

    if (!store.appointments) store.appointments = [];
    store.appointments.push(newApp);

    // Agregar en CRM
    if (!store.clients) store.clients = [];
    const cli = store.clients.find(c => (phone && c.phone === phone) || c.name === name);
    if (cli) {
        cli.visits = (cli.visits || 1) + 1;
    } else {
        store.clients.push({
            id: 'cli-' + Date.now(),
            name: name,
            phone: phone,
            visits: 1,
            totalSpent: 0,
            lastVisit: date,
            notes: ''
        });
    }

    saveStore(store);
    closeModal('walkInModal');
    loadAgenda();
    loadClientsCRM();
    showToast('Turno guardado y puesto En Proceso', 'success');
}

function openQuickSaleModal() {
    const store = getStore();
    const barbSelect = document.getElementById('saleBarberSelect');
    barbSelect.innerHTML = `<option value="">Venta General del Local</option>` + (store.barbers || []).map(b => `<option value="${b.id}">${b.name}</option>`).join('');
    openModal('quickSaleModal');
}

function handleQuickSaleSubmit(e) {
    e.preventDefault();
    const concept = document.getElementById('saleConcept').value.trim();
    const amount = parseFloat(document.getElementById('saleAmount').value);
    const method = document.getElementById('salePaymentMethod').value;
    const barberId = document.getElementById('saleBarberSelect').value;

    const store = getStore();
    if (!store.posTransactions) store.posTransactions = [];
    store.posTransactions.push({
        id: 'pos-' + Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        concept: concept,
        client: 'Venta Mostrador',
        barberId: barberId || null,
        method: method,
        amount: amount,
        type: 'income'
    });

    saveStore(store);
    closeModal('quickSaleModal');
    loadPOS();
    showToast(`Venta registrada en caja`, 'success');
}

function openExpenseModal() {
    const concept = prompt('Concepto del Gasto o Retiro de Caja:');
    if (!concept) return;
    const amountStr = prompt('Monto a retirar ($):');
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    const store = getStore();
    if (!store.posTransactions) store.posTransactions = [];
    store.posTransactions.push({
        id: 'pos-' + Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        concept: 'Gasto: ' + concept,
        client: 'Egreso de Caja',
        barberId: null,
        method: 'Efectivo',
        amount: amount,
        type: 'expense'
    });

    saveStore(store);
    loadPOS();
    showToast(`Gasto registrado`, 'info');
}

function openAddBarberModal() {
    openModal('addBarberModal');
}

function handleAddBarberSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('newBarberName').value.trim();
    const specialty = document.getElementById('newBarberSpecialty').value.trim();
    const commission = parseInt(document.getElementById('newBarberCommission').value);

    const store = getStore();
    if (!store.barbers) store.barbers = [];
    store.barbers.push({
        id: 'barb-' + Date.now(),
        name: name,
        specialty: specialty || 'Barbero',
        commissionPct: commission || 50,
        active: true
    });

    saveStore(store);
    closeModal('addBarberModal');
    loadBarbersManage();
    loadAgenda();
    showToast(`Barbero ${name} agregado`, 'success');
}

function openAddServiceModal() {
    openModal('addServiceModal');
}

function handleAddServiceSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('newServiceName').value.trim();
    const price = parseFloat(document.getElementById('newServicePrice').value);
    const duration = parseInt(document.getElementById('newServiceDuration').value);
    const desc = document.getElementById('newServiceDesc').value.trim();

    const store = getStore();
    if (!store.services) store.services = [];
    store.services.push({
        id: 'srv-' + Date.now(),
        name: name,
        price: price,
        duration: duration || 30,
        desc: desc
    });

    saveStore(store);
    closeModal('addServiceModal');
    loadServicesManage();
    showToast(`Servicio ${name} creado`, 'success');
}
