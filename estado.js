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
export let ultimosProcesosEjecutados = [];

export let colaPersonalizada = [];
export let usarColaPersonalizada = false;

export function setUsarColaPersonalizada(valor) {
    usarColaPersonalizada = valor;
}

export function agregarAColaPersonalizada(item) {
    colaPersonalizada.push(item);
}

export function moverEnColaPersonalizada(indice, direccion) {
    const nuevoIndice = indice + direccion;
    if (nuevoIndice < 0 || nuevoIndice >= colaPersonalizada.length) return;
    const temp = colaPersonalizada[indice];
    colaPersonalizada[indice] = colaPersonalizada[nuevoIndice];
    colaPersonalizada[nuevoIndice] = temp;
}

export function eliminarDeColaPersonalizada(indice) {
    colaPersonalizada.splice(indice, 1);
}

export function vaciarColaPersonalizada() {
    colaPersonalizada = [];
}

export function guardarSecuencia(resultadoPlan, listaProcesosUsados = []) {
    ultimaSecuenciaEjecucion = resultadoPlan.map(turno => turno.id);
    ultimoResultadoPlan = resultadoPlan;
    ultimosProcesosEjecutados = listaProcesosUsados;
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
