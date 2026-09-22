import {
    mostrarSeccion,
    salir,
    guardarConfiguracion,
    actualizarTabla,
    renderizarTablaPaginas,
    toggleModoManualMMU,
    cambiarModoCola,
    agregarProcesoAColaUI,
    moverItemColaUI,
    eliminarItemColaUI,
    vaciarColaUI
} from './ui.js';
import { agregarProceso, limpiarProcesos } from './procesos.js';
import { ejecutarPlanificador } from './planificadores.js';
import { ejecutarMMU } from './mmu.js';

// Exponer funciones necesarias en window para los handlers inline (onclick) del HTML
window.mostrarSeccion = mostrarSeccion;
window.salir = salir;
window.agregarProceso = agregarProceso;
window.limpiarProcesos = limpiarProcesos;
window.ejecutarPlanificador = ejecutarPlanificador;
window.guardarConfiguracion = guardarConfiguracion;
window.ejecutarMMU = ejecutarMMU;
window.actualizarTabla = actualizarTabla;
window.renderizarTablaPaginas = renderizarTablaPaginas;
window.toggleModoManualMMU = toggleModoManualMMU;
window.cambiarModoCola = cambiarModoCola;
window.agregarProcesoAColaUI = agregarProcesoAColaUI;
window.moverItemColaUI = moverItemColaUI;
window.eliminarItemColaUI = eliminarItemColaUI;
window.vaciarColaUI = vaciarColaUI;
