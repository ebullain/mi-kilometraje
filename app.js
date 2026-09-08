// ============ GESTIÓN DE DATOS ============

// Clase para manejar los viajes
class GestorViajes {
    constructor() {
        this.viajes = JSON.parse(localStorage.getItem('viajes')) || [];
    }

    // Guardar todos los viajes en localStorage
    guardar() {
        localStorage.setItem('viajes', JSON.stringify(this.viajes));
    }

    // Agregar un nuevo viaje
    agregarViaje(viaje) {
        this.viajes.push(viaje);
        this.guardar();
    }

    // Obtener todos los viajes
    obtenerViajes() {
        return this.viajes;
    }

    // Filtrar por mes (formato YYYY-MM)
    filtrarPorMes(mes) {
        return this.viajes.filter(viaje => 
            viaje.fecha.startsWith(mes)
        );
    }

    // Calcular kilómetros totales de un conjunto de viajes
    calcularKilometros(viajes) {
        return viajes.reduce((total, viaje) => 
            total + (viaje.hodometroFinal - viaje.hodometroInicial), 0
        );
    }

    // Obtener lugares más frecuentes
    lugaresFrecuentes(limit = 5) {
        const frecuencia = {};
        
        this.viajes.forEach(viaje => {
            frecuencia[viaje.lugar] = (frecuencia[viaje.lugar] || 0) + 1;
        });

        return Object.entries(frecuencia)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    }

    // Obtener estadísticas del mes actual
    estadisticasMesActual() {
        const hoy = new Date();
        const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
        const viajesMes = this.filtrarPorMes(mesActual);
        
        return {
            kilometros: this.calcularKilometros(viajesMes),
            numViajes: viajesMes.length,
            lugaresFrecuentes: this.lugaresFrecuentes()
        };
    }
}

// Inicializar gestor
const gestor = new GestorViajes();

// ============ FUNCIONES DE UI ============

// Cambiar entre pestañas
function cambiarTab(tabName) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar la pestaña seleccionada
    document.getElementById(tabName).classList.add('active');
    
    // Activar el botón correspondiente
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Actualizar contenido según la pestaña
    if (tabName === 'historial') {
        mostrarHistorial();
    } else if (tabName === 'estadisticas') {
        mostrarEstadisticas();
    }
}

// Mostrar fecha actual
function mostrarFechaActual() {
    const fecha = new Date();
    const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
    };
    document.getElementById('fechaActual').textContent = 
        fecha.toLocaleDateString('es-ES', opciones);
}

// Función para obtener la fecha local en formato YYYY-MM-DD
function obtenerFechaLocal() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

// Guardar nuevo viaje
function guardarViaje(event) {
    event.preventDefault();

    // Obtener la fecha del formulario
    let fechaViaje = document.getElementById('fecha').value;
    
    // Si no hay fecha seleccionada, usar la fecha actual local
    if (!fechaViaje) {
        fechaViaje = obtenerFechaLocal();
        document.getElementById('fecha').value = fechaViaje;
    }
    
    const viaje = {
        fecha: document.getElementById('fecha').value,
        hodometroInicial: parseInt(document.getElementById('hodometroInicial').value),
        hodometroFinal: parseInt(document.getElementById('hodometroFinal').value),
        lugar: document.getElementById('lugar').value,
        proposito: document.getElementById('proposito').value,
        timestamp: new Date().toISOString()
    };
    
    // Validar que el hodómetro final sea mayor al inicial
    if (viaje.hodometroFinal <= viaje.hodometroInicial) {
        alert('⚠️ El hodómetro final debe ser mayor que el inicial');
        return;
    }
    
    // Guardar viaje
    gestor.agregarViaje(viaje);
    
    // Calcular kilómetros
    const kilometros = viaje.hodometroFinal - viaje.hodometroInicial;
    
    // Mostrar último viaje
    mostrarUltimoViaje(viaje, kilometros);
    
    // Limpiar formulario
    document.getElementById('formViaje').reset();
    
    // Actualizar sugerencias de lugares
    actualizarSugerenciasLugares();
    
    // Mensaje de éxito
    alert(`✅ Viaje guardado correctamente\n📏 ${kilometros} km recorridos`);
}

// Mostrar último viaje registrado
function mostrarUltimoViaje(viaje, kilometros) {
    const divUltimoViaje = document.getElementById('ultimoViaje');
    divUltimoViaje.innerHTML = `
        <h3>📌 Último Viaje Registrado</h3>
        <p><strong>Fecha:</strong> ${formatearFecha(viaje.fecha)}</p>
        <p><strong>Lugar:</strong> ${viaje.lugar}</p>
        <p><strong>Kilómetros:</strong> ${kilometros} km</p>
        <p><strong>Propósito:</strong> ${viaje.proposito || 'No especificado'}</p>
    `;
}

// Mostrar historial de viajes
function mostrarHistorial(viajes = gestor.obtenerViajes()) {
    const listaViajes = document.getElementById('listaViajes');
    
    if (viajes.length === 0) {
        listaViajes.innerHTML = '<p class="no-datos">📭 No hay viajes registrados</p>';
        return;
    }
    
    listaViajes.innerHTML = viajes.slice().reverse().map(viaje => {
        const kilometros = viaje.hodometroFinal - viaje.hodometroInicial;
        return `
            <div class="viaje-item">
                <div class="fecha">📅 ${formatearFecha(viaje.fecha)}</div>
                <div class="lugar">📍 ${viaje.lugar}</div>
                <div class="kilometros">📏 ${kilometros} km</div>
                <div class="proposito">🎯 ${viaje.proposito || 'Sin propósito'}</div>
            </div>
        `;
    }).join('');
}

// Filtrar por mes
function filtrarPorMes() {
    const mes = document.getElementById('filtroMes').value;
    if (mes) {
        const viajesFiltrados = gestor.filtrarPorMes(mes);
        mostrarHistorial(viajesFiltrados);
    }
}

// Limpiar filtro
function limpiarFiltro() {
    document.getElementById('filtroMes').value = '';
    mostrarHistorial();
}

// Mostrar estadísticas
function mostrarEstadisticas() {
    const stats = gestor.estadisticasMesActual();
    
    document.getElementById('kmMes').textContent = `${stats.kilometros} km`;
    document.getElementById('totalViajes').textContent = stats.numViajes;
    
    const lugaresHTML = stats.lugaresFrecuentes.length > 0 
        ? stats.lugaresFrecuentes.map(([lugar, veces]) => `
            <div class="lugar-frecuente">
                <span>📍 ${lugar}</span>
                <span class="veces">${veces} veces</span>
            </div>
        `).join('')
        : '<p>No hay datos suficientes</p>';
    
    document.getElementById('lugaresFrecuentes').innerHTML = lugaresHTML;
}

// Actualizar sugerencias de lugares
function actualizarSugerenciasLugares() {
    const lugares = gestor.lugaresFrecuentes(10);
    const datalist = document.getElementById('lugaresSugeridos');
    
    datalist.innerHTML = lugares.map(([lugar]) => 
        `<option value="${lugar}">`
    ).join('');
}

// Formatear fecha
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// ============ FUNCIONES DE FECHA CORREGIDAS ============

// Función para obtener la fecha local en formato YYYY-MM-DD
function obtenerFechaLocal() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

// Función para formatear fecha para mostrar
function formatearFecha(fechaISO) {
    if (!fechaISO) return 'Fecha no disponible';
    
    // Crear fecha desde el string ISO
    const partes = fechaISO.split('-');
    const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
    
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

// Mostrar fecha actual
function mostrarFechaActual() {
    const fecha = new Date();
    const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
    };
    document.getElementById('fechaActual').textContent = 
        fecha.toLocaleDateString('es-ES', opciones);
}

// ============ INICIALIZACIÓN ============

document.addEventListener('DOMContentLoaded', () => {
    // Mostrar fecha actual
    mostrarFechaActual();
    
    // Función de depuración para ver qué fecha se está usando
    function depurarFecha() {
        const ahora = new Date();
        console.log('Fecha completa:', ahora.toString());
        console.log('Fecha local:', ahora.toLocaleDateString('es-ES'));
        console.log('Fecha ISO (UTC):', ahora.toISOString());
        console.log('Fecha local formateada:', obtenerFechaLocal());
    }

    // Establecer fecha actual en el formulario (CORREGIDO)
    const fechaHoy = obtenerFechaLocal();
    document.getElementById('fecha').value = fechaHoy;
    
    // Event listeners para las pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cambiarTab(btn.dataset.tab);
        });
    });
    
    // Event listener para el formulario
    document.getElementById('formViaje').addEventListener('submit', guardarViaje);
    
    // Cargar sugerencias de lugares
    actualizarSugerenciasLugares();
    
    // Mostrar historial inicial
    mostrarHistorial();
    
    console.log('📅 Fecha actual:', fechaHoy);
});

// ============ REGISTRO DEL SERVICE WORKER ============

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registrado con éxito:', registration.scope);
            })
            .catch(error => {
                console.log('Error al registrar el Service Worker:', error);
            });
    });
}