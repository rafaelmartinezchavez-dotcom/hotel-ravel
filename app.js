/* =============================================
   Hotel Manager - Gestión de Clientes
   CRUD con PostgreSQL Backend
   ============================================= */

const API_URL = '/api/clientes';

// ---- Estado global ----
let clientes        = [];
let clientesFiltrados = [];
let sortColumn      = 'nombre';
let sortAscending   = true;
let idEliminarPendiente = null;

// ---- Utilidades ----

async function cargarClientes() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al cargar clientes');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    mostrarToast('Error al conectar con el servidor', 'error');
    return [];
  }
}

async function crearCliente(datos) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!response.ok) throw new Error('Error al crear cliente');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    mostrarToast('Error al crear cliente', 'error');
    return null;
  }
}

async function actualizarCliente(id, datos) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    if (!response.ok) throw new Error('Error al actualizar cliente');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    mostrarToast('Error al actualizar cliente', 'error');
    return null;
  }
}

async function eliminarClienteAPI(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar cliente');
    return true;
  } catch (error) {
    console.error('Error:', error);
    mostrarToast('Error al eliminar cliente', 'error');
    return false;
  }
}

async function cargarEstadisticas() {
  try {
    const response = await fetch('/api/estadisticas');
    if (!response.ok) throw new Error('Error al cargar estadísticas');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return { totalClientes: 0, clientesHoy: 0 };
  }
}

// ---- Renderizar tabla ----

function renderizarTabla() {
  const tbody = document.getElementById('cuerpoTabla');
  const vacio = document.getElementById('sinResultados');

  if (clientesFiltrados.length === 0) {
    tbody.innerHTML = '';
    vacio.style.display = 'block';
    document.getElementById('resultCount').textContent = 'Sin resultados';
    actualizarStats();
    return;
  }

  vacio.style.display = 'none';

  tbody.innerHTML = clientesFiltrados.map(c => `
    <tr>
      <td>
        <div class="cell-name">${escHtml(c.nombre)}</div>
        <div class="cell-email">${escHtml(c.documento || '')}</div>
      </td>
      <td class="cell-email">${escHtml(c.email)}</td>
      <td>${escHtml(c.telefono)}</td>
      <td><span class="cell-room">${escHtml(c.habitacion)}</span></td>
      <td>${formatFecha(c.checkIn)}</td>
      <td>${formatFecha(c.checkOut)}</td>
      <td><span class="badge badge-${c.estado}">${labelEstado(c.estado)}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon btn-view"   title="Ver detalle" onclick="verDetalle(${c.id})">&#128065;</button>
          <button class="btn-icon btn-edit"   title="Editar"      onclick="abrirModalEditar(${c.id})">&#9998;</button>
          <button class="btn-icon btn-delete" title="Eliminar"    onclick="abrirEliminar(${c.id})">&#128465;</button>
        </div>
      </td>
    </tr>
  `).join('');

  const total = clientesFiltrados.length;
  document.getElementById('resultCount').textContent =
    `${total} cliente${total !== 1 ? 's' : ''} mostrado${total !== 1 ? 's' : ''}`;

  actualizarStats();
}

function actualizarStats() {
  // Usar estadísticas del servidor
  cargarEstadisticas().then(stats => {
    document.getElementById('totalClientes').textContent = stats.totalClientes;
    document.getElementById('clientesHoy').textContent = stats.clientesHoy;
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatFecha(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function labelEstado(estado) {
  const map = { activo: 'Activo', checkout: 'Check-out', reserva: 'Reserva' };
  return map[estado] || estado;
}

// ---- Filtrar y ordenar ----

function filtrarClientes() {
  const query  = document.getElementById('searchInput').value.trim().toLowerCase();
  const estado = document.getElementById('filterEstado').value;

  document.getElementById('btnClearSearch').style.display = query ? 'flex' : 'none';

  clientesFiltrados = clientes.filter(c => {
    const matchEstado = !estado || c.estado === estado;
    const matchQuery  = !query  ||
      c.nombre.toLowerCase().includes(query)     ||
      c.email.toLowerCase().includes(query)       ||
      c.telefono.toLowerCase().includes(query)    ||
      c.habitacion.toLowerCase().includes(query)  ||
      (c.documento || '').toLowerCase().includes(query);
    return matchEstado && matchQuery;
  });

  ordenarFiltrados();
  renderizarTabla();
}

function limpiarBusqueda() {
  document.getElementById('searchInput').value = '';
  filtrarClientes();
}

function ordenarPor(columna) {
  if (sortColumn === columna) {
    sortAscending = !sortAscending;
  } else {
    sortColumn    = columna;
    sortAscending = true;
  }
  ordenarFiltrados();
  renderizarTabla();
}

function ordenarFiltrados() {
  clientesFiltrados.sort((a, b) => {
    let va = (a[sortColumn] || '').toString().toLowerCase();
    let vb = (b[sortColumn] || '').toString().toLowerCase();
    if (va < vb) return sortAscending ? -1 :  1;
    if (va > vb) return sortAscending ?  1 : -1;
    return 0;
  });
}

// ---- Modal Crear/Editar ----

function abrirModalNuevo() {
  document.getElementById('modalTitulo').textContent = 'Nuevo Cliente';
  document.getElementById('btnGuardar').textContent  = 'Guardar Cliente';
  document.getElementById('formCliente').reset();
  document.getElementById('clienteId').value = '';
  ocultarError();

  // Fecha de hoy como default
  const hoy = new Date().toISOString().slice(0, 10);
  document.getElementById('checkIn').value = hoy;
  const manana = new Date(); manana.setDate(manana.getDate() + 1);
  document.getElementById('checkOut').value = manana.toISOString().slice(0, 10);

  abrirModal('modal');
}

function abrirModalEditar(id) {
  const c = clientes.find(x => x.id === id);
  if (!c) return;

  document.getElementById('modalTitulo').textContent = 'Editar Cliente';
  document.getElementById('btnGuardar').textContent  = 'Actualizar Cliente';
  document.getElementById('clienteId').value         = c.id;

  document.getElementById('nombre').value         = c.nombre         || '';
  document.getElementById('email').value          = c.email          || '';
  document.getElementById('telefono').value       = c.telefono       || '';
  document.getElementById('documento').value      = c.documento      || '';
  document.getElementById('habitacion').value     = c.habitacion     || '';
  document.getElementById('tipoHabitacion').value = c.tipoHabitacion || 'doble';
  document.getElementById('checkIn').value        = c.checkIn        || '';
  document.getElementById('checkOut').value       = c.checkOut       || '';
  document.getElementById('estado').value         = c.estado         || 'activo';
  document.getElementById('nacionalidad').value   = c.nacionalidad   || '';
  document.getElementById('notas').value          = c.notas          || '';
  ocultarError();

  cerrarDetalles();
  abrirModal('modal');
}

async function guardarCliente(event) {
  event.preventDefault();

  const checkIn  = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;

  if (checkOut && checkIn && checkOut <= checkIn) {
    mostrarError('La fecha de check-out debe ser posterior al check-in.');
    return;
  }

  const id = document.getElementById('clienteId').value;
  const datos = {
    nombre:         document.getElementById('nombre').value.trim(),
    email:          document.getElementById('email').value.trim(),
    telefono:       document.getElementById('telefono').value.trim(),
    documento:      document.getElementById('documento').value.trim(),
    habitacion:     document.getElementById('habitacion').value.trim(),
    tipoHabitacion: document.getElementById('tipoHabitacion').value,
    checkIn,
    checkOut,
    estado:         document.getElementById('estado').value,
    nacionalidad:   document.getElementById('nacionalidad').value.trim(),
    notas:          document.getElementById('notas').value.trim(),
  };

  if (id) {
    // Editar
    const resultado = await actualizarCliente(id, datos);
    if (resultado) {
      mostrarToast('Cliente actualizado correctamente.', 'success');
    }
  } else {
    // Crear
    const resultado = await crearCliente(datos);
    if (resultado) {
      mostrarToast('Cliente registrado exitosamente.', 'success');
    }
  }

  // Recargar lista desde el servidor
  clientes = await cargarClientes();
  filtrarClientes();
  cerrarModal();
}

function mostrarError(msg) {
  const el = document.getElementById('formError');
  el.textContent = msg;
  el.style.display = 'block';
}

function ocultarError() {
  document.getElementById('formError').style.display = 'none';
}

// ---- Modal Detalle ----

function verDetalle(id) {
  const c = clientes.find(x => x.id === id);
  if (!c) return;

  const iniciales = c.nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  document.getElementById('detalleContenido').innerHTML = `
    <div class="detail-avatar">
      <div class="avatar-circle">${escHtml(iniciales)}</div>
      <div class="detail-avatar-info">
        <h3>${escHtml(c.nombre)}</h3>
        <small>Registrado el ${formatFechaLarga(c.creadoEn)} &bull; <span class="badge badge-${c.estado}">${labelEstado(c.estado)}</span></small>
      </div>
    </div>
    <div class="detail-grid">
      <div class="detail-item">
        <div class="detail-label">Correo electrónico</div>
        <div class="detail-value">${escHtml(c.email)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Teléfono</div>
        <div class="detail-value">${escHtml(c.telefono)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Documento</div>
        <div class="detail-value">${escHtml(c.documento || '—')}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Nacionalidad</div>
        <div class="detail-value">${escHtml(c.nacionalidad || '—')}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Habitación</div>
        <div class="detail-value"><span class="cell-room">${escHtml(c.habitacion)}</span></div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Tipo de habitación</div>
        <div class="detail-value" style="text-transform:capitalize">${escHtml(c.tipoHabitacion || '—')}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Check-in</div>
        <div class="detail-value">${formatFecha(c.checkIn)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Check-out</div>
        <div class="detail-value">${formatFecha(c.checkOut)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Noches</div>
        <div class="detail-value">${calcularNoches(c.checkIn, c.checkOut)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Estado</div>
        <div class="detail-value"><span class="badge badge-${c.estado}">${labelEstado(c.estado)}</span></div>
      </div>
      <div class="detail-item full-width">
        <div class="detail-label">Notas</div>
        <div class="detail-value">${escHtml(c.notas || 'Sin notas adicionales.')}</div>
      </div>
    </div>
  `;

  document.getElementById('btnEditarDetalle').onclick = () => abrirModalEditar(c.id);
  abrirModal('modalDetalle');
}

function formatFechaLarga(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

function calcularNoches(cin, cout) {
  if (!cin || !cout) return '—';
  const d1 = new Date(cin);
  const d2 = new Date(cout);
  const diff = Math.round((d2 - d1) / 86400000);
  return diff > 0 ? `${diff} noche${diff !== 1 ? 's' : ''}` : '—';
}

// ---- Modal Eliminar ----

function abrirEliminar(id) {
  const c = clientes.find(x => x.id === id);
  if (!c) return;
  idEliminarPendiente = id;
  document.getElementById('nombreEliminar').textContent = c.nombre;
  document.getElementById('btnConfirmarEliminar').onclick = () => confirmarEliminar();
  abrirModal('modalEliminar');
}

async function confirmarEliminar() {
  if (!idEliminarPendiente) return;
  
  const resultado = await eliminarClienteAPI(idEliminarPendiente);
  if (resultado) {
    // Recargar lista desde el servidor
    clientes = await cargarClientes();
    filtrarClientes();
    mostrarToast('Cliente eliminado.', 'info');
  }
  
  idEliminarPendiente = null;
  cerrarEliminar();
}

// ---- Control de modales ----

function abrirModal(id) {
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cerrarModal() {
  document.getElementById('modal').classList.remove('active');
  document.body.style.overflow = '';
}

function cerrarDetalles() {
  document.getElementById('modalDetalle').classList.remove('active');
  document.body.style.overflow = '';
}

function cerrarEliminar() {
  document.getElementById('modalEliminar').classList.remove('active');
  document.body.style.overflow = '';
  idEliminarPendiente = null;
}

function cerrarModalFondo(e) {
  if (e.target === document.getElementById('modal')) cerrarModal();
}

function cerrarDetallesFondo(e) {
  if (e.target === document.getElementById('modalDetalle')) cerrarDetalles();
}

function cerrarEliminarFondo(e) {
  if (e.target === document.getElementById('modalEliminar')) cerrarEliminar();
}

// ---- Toast ----

let toastTimer = null;

function mostrarToast(mensaje, tipo = 'info') {
  const toast = document.getElementById('toast');
  const iconos = { success: '✓', error: '✗', info: 'ℹ' };
  toast.textContent = (iconos[tipo] || '') + ' ' + mensaje;
  toast.className = `toast ${tipo} show`;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ---- Teclado ----

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    cerrarModal();
    cerrarDetalles();
    cerrarEliminar();
  }
});

// ---- Init ----
async function inicializar() {
  clientes = await cargarClientes();
  clientesFiltrados = [...clientes];
  filtrarClientes();
}

inicializar();
