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
export let ultimoResultadoPlan = [];
export let ultimoResultadoMMU = null;

export function guardarSecuencia(resultadoPlan) {
    ultimaSecuenciaEjecucion = resultadoPlan.map(turno => turno.id);
    ultimoResultadoPlan = resultadoPlan;
}

export function guardarResultadoMMU(resultado) {
    ultimoResultadoMMU = resultado;
}

export let configuracionSO = JSON.parse(
    localStorage.getItem("configuracionSO")
) || {
    quantum: 2,
    paginasVirtuales: 8,
    marcosFisicos: 3,
    algoritmoPredeterminado: "FIFO"
};

export function guardarConfiguracionSO(nuevaConfig) {
    configuracionSO = { ...nuevaConfig };
    localStorage.setItem("configuracionSO", JSON.stringify(configuracionSO));
}
