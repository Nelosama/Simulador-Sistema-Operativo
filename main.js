import { mostrarSeccion, salir, guardarConfiguracion, actualizarTabla, renderizarTablaPaginas } from './ui.js';
import { agregarProceso, limpiarProcesos } from './procesos.js';
import { ejecutarPlanificador } from './planificadores.js';
import { ejecutarMMU } from './mmu.js';

window.mostrarSeccion = mostrarSeccion;
window.salir = salir;
window.agregarProceso = agregarProceso;
window.limpiarProcesos = limpiarProcesos;
window.ejecutarPlanificador = ejecutarPlanificador;
window.guardarConfiguracion = guardarConfiguracion;
window.ejecutarMMU = ejecutarMMU;
window.actualizarTabla = actualizarTabla;
window.renderizarTablaPaginas = renderizarTablaPaginas;
