import { ListaEnlazada } from './estructuras.js';

export let listaProcesos = new ListaEnlazada();

let procesosGuardados = JSON.parse(localStorage.getItem("procesosSO")) || [];
procesosGuardados.forEach(p => listaProcesos.agregar(p));

export function obtenerListaProcesos() {
    return listaProcesos.obtenerTodos();
}

export function guardarProcesosEnLocalStorage() {
    localStorage.setItem("procesosSO", JSON.stringify(listaProcesos.obtenerTodos()));
}

export let ultimaSecuenciaEjecucion = [];

export function guardarSecuencia(resultadoPlan) {
    ultimaSecuenciaEjecucion = resultadoPlan.map(turno => turno.id);
}

export function obtenerUltimaSecuenciaEjecucion() {
    return ultimaSecuenciaEjecucion;
}

export let configuracionSO = JSON.parse(
    localStorage.getItem("configuracionSO")
) || {
    quantum: 2,
    paginasVirtuales: 8,
    marcosFisicos: 3,
    espacioDisco: 16,
    algoritmoPredeterminado: "FIFO"
};

export function guardarConfiguracionSO(nuevaConfig) {
    configuracionSO = { ...nuevaConfig };
    localStorage.setItem("configuracionSO", JSON.stringify(configuracionSO));
}
