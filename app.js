/// ============ GESTIÓN DE DATOS ============

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
        const mesActual = obtenerMesActual();
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

// ============ FUNCIONES DE FECHA ============

// Función para obtener la fecha local en formato YYYY-MM-DD
function obtenerFechaLocal() {
    const ahora = new Date();
    
    // Obtener componentes de fecha en hora LOCAL
    const año = ahora.getFullYear();
    const mes = ahora.getMonth() + 1;
    const dia = ahora.getDate();
    
    // Formatear con ceros a la izquierda
    const mesFormateado = mes < 10 ? `0${mes}` : mes;
    const diaFormateado = dia < 10 ? `0${dia}` : dia;
    
    return `${año}-${mesFormateado}-${diaFormateado}`;
}

// Función para obtener el mes actual en formato YYYY-MM
function obtenerMesActual() {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = ahora.getMonth() + 1;
    const mesFormateado = mes < 10 ? `0${mes}` : mes;
    return `${año}-${mesFormateado}`;
}

// Mostrar fecha actual en el encabezado
function mostrarFechaActual() {
    const ahora = new Date();
    
    const opciones = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    };
    
    document.getElementById('fechaActual').textContent = 
        ahora.toLocaleDateString('es-ES', opciones);
}

// Formatear fecha para mostrar
function formatearFecha(fechaISO) {
    if (!fechaISO) return 'Fecha no disponible';
    
    // Dividir la fecha ISO en componentes
    const [año, mes, dia] = fechaISO.split('-').map(Number);
    
    // Crear fecha con componentes locales
    const fecha = new Date(año, mes - 1, dia);
    
    return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

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

// Guardar nuevo viaje
function guardarViaje(event) {
    event.preventDefault();
    
    console.log('💾 Iniciando guardado de viaje...');
    
    // Obtener la fecha del formulario
    let fechaViaje = document.getElementById('fecha').value;

        // NO MODIFICAR la fecha si ya tiene un valor
    console.log('📅 Fecha del input:', fechaViaje);
    
    // Si no hay fecha, usar la fecha local actual
    if (!fechaViaje) {
        fechaViaje = obtenerFechaLocal();
        document.getElementById('fecha').value = fechaViaje;
        console.log('📅 No había fecha, se usó la actual:', fechaViaje);
    }
    
    // Verificar que la fecha no sea futura
   // const fechaActual = obtenerFechaLocal();
   // if (fechaViaje > fechaActual) {
    //    console.warn('⚠️ Fecha futura detectada:', fechaViaje);
    //    alert('⚠️ La fecha no puede ser futura');
    //    document.getElementById('fecha').value = fechaActual;
     //   return;
    }
    
    const viaje = {
        fecha: fechaViaje,
        hodometroInicial: parseInt(document.getElementById('hodometroInicial').value),
        hodometroFinal: parseInt(document.getElementById('hodometroFinal').value),
        lugar: document.getElementById('lugar').value,
        proposito: document.getElementById('proposito').value,
        timestamp: new Date().toISOString()
    };
    
    console.log('📊 Datos del viaje a guardar:', viaje);
    
    // Validar que el hodómetro final sea mayor al inicial
    if (viaje.hodometroFinal <= viaje.hodometroInicial) {
        alert('⚠️ El hodómetro final debe ser mayor que el inicial');
        //return;
    }
    
    // Guardar viaje
    gestor.agregarViaje(viaje);
    
    // Calcular kilómetros
    const kilometros = viaje.hodometroFinal - viaje.hodometroInicial;
    
    // Mostrar último viaje
    mostrarUltimoViaje(viaje, kilometros);
    
    // Limpiar formulario
    document.getElementById('formViaje').reset();
    
    // Restablecer la fecha actual
    document.getElementById('fecha').value = obtenerFechaLocal();
    
    // Actualizar sugerencias de lugares
    actualizarSugerenciasLugares();
    
    // Mensaje de éxito
    alert(`✅ Viaje guardado correctamente\n📅 Fecha: ${formatearFecha(viaje.fecha)}\n📍 Lugar: ${viaje.lugar}\n📏 ${kilometros} km recorridos`);
    
    console.log('✅ Viaje guardado exitosamente');
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
        console.log(`🔍 Filtrando por mes: ${mes} - ${viajesFiltrados.length} viajes encontrados`);
    }
}

// Limpiar filtro
function limpiarFiltro() {
    document.getElementById('filtroMes').value = '';
    mostrarHistorial();
    console.log('🔄 Filtro limpiado');
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
                <span class="veces">${veces} ${veces === 1 ? 'vez' : 'veces'}</span>
            </div>
        `).join('')
        : '<p>No hay datos suficientes</p>';
    
    document.getElementById('lugaresFrecuentes').innerHTML = lugaresHTML;
    
    console.log('📊 Estadísticas actualizadas:', stats);
}

// Actualizar sugerencias de lugares
function actualizarSugerenciasLugares() {
    const lugares = gestor.lugaresFrecuentes(10);
    const datalist = document.getElementById('lugaresSugeridos');
    
    if (datalist) {
        datalist.innerHTML = lugares.map(([lugar]) => 
            `<option value="${lugar}">`
        ).join('');
    }
}

// ============ FUNCIONES DE CORRECCIÓN ============

// Función para corregir fechas de viajes existentes
function corregirFechasExistentes() {
    const viajes = gestor.obtenerViajes();
    let corregidos = 0;
    
    viajes.forEach(viaje => {
        // Verificar si la fecha parece incorrecta (futura)
        const fechaActual = obtenerFechaLocal();
        if (viaje.fecha > fechaActual) {
            // Corregir restando un día
            const [año, mes, dia] = viaje.fecha.split('-').map(Number);
            const fechaCorregida = new Date(año, mes - 1, dia - 1);
            
            viaje.fecha = `${fechaCorregida.getFullYear()}-${String(fechaCorregida.getMonth() + 1).padStart(2, '0')}-${String(fechaCorregida.getDate()).padStart(2, '0')}`;
            corregidos++;
            
            console.log(`🔧 Corregida fecha de viaje: ${viaje.lugar} - ${viaje.fecha}`);
        }
    });
    
    if (corregidos > 0) {
        gestor.guardar();
        console.log(`🔧 Se corrigieron ${corregidos} viajes con fechas incorrectas`);
        alert(`🔧 Se corrigieron ${corregidos} viajes con fechas incorrectas`);
    }
}

// ============ INICIALIZACIÓN ============

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando aplicación...');
    
    // Mostrar fecha actual en el encabezado
    mostrarFechaActual();
    
    // Establecer fecha actual en el formulario
    const fechaActual = obtenerFechaLocal();
    const inputFecha = document.getElementById('fecha');
    if (inputFecha) {
        inputFecha.value = fechaActual;
        console.log('📅 Fecha establecida en formulario:', fechaActual);
    }
    
    // Corregir fechas de viajes existentes
    corregirFechasExistentes();
    
    // Event listeners para las pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cambiarTab(btn.dataset.tab);
        });
    });
    
    // Event listener para el formulario
    const formViaje = document.getElementById('formViaje');
    if (formViaje) {
        formViaje.addEventListener('submit', guardarViaje);
    }
    
    // Cargar sugerencias de lugares
    actualizarSugerenciasLugares();
    
    // Mostrar historial inicial
    mostrarHistorial();
    
    // Información de depuración
    console.log('📅 Fecha del formulario:', fechaActual);
    console.log('🕐 Hora actual:', new Date().toLocaleTimeString());
    console.log('✅ Aplicación inicializada correctamente');
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