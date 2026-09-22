import {
    obtenerListaProcesos,
    configuracionSO,
    guardarConfiguracionSO,
    colaPersonalizada,
    usarColaPersonalizada,
    setUsarColaPersonalizada,
    agregarAColaPersonalizada,
    moverEnColaPersonalizada,
    eliminarDeColaPersonalizada,
    vaciarColaPersonalizada
} from './estado.js';

export function actualizarTabla() {
    const tabla = document.getElementById("tablaProcesos");

    if (!tabla) {
        return;
    }

    const lista = obtenerListaProcesos();

    if (lista.length === 0) {
        tabla.innerHTML = `
            <p class="texto-secundario">No hay procesos registrados.</p>
        `;
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Llegada</th>
                    <th>Duración</th>
                    <th>Prioridad</th>
                    <th>Boletos</th>
                    <th>Páginas</th>
                    <th>Quantum Restante</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
    `;

    lista.forEach(proceso => {
        html += `
            <tr>
                <td class="dato-mono">${proceso.id}</td>
                <td>${proceso.nombre}</td>
                <td class="dato-mono">${proceso.llegada}</td>
                <td class="dato-mono">${proceso.duracion}</td>
                <td class="dato-mono">${proceso.prioridad}</td>
                <td class="dato-mono">${proceso.boletos}</td>
                <td class="dato-mono">${proceso.paginasRequeridas || 1}</td>
                <td class="dato-mono">${proceso.quantumRestante !== undefined ? proceso.quantumRestante : configuracionSO.quantum}</td>
                <td>${proceso.estado}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    tabla.innerHTML = html;
}

export function renderizarTablaPaginas() {
    const contenedor = document.getElementById("tablaPaginasMapeo");
    if (!contenedor) {
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Página Virtual</th>
                    <th>Estado</th>
                    <th>Marco Físico Asignado</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 1; i <= configuracionSO.paginasVirtuales; i++) {
        const marcoAsignado = i <= configuracionSO.marcosFisicos ? `Marco ${i}` : "En Disco Duro";
        const estado = i <= configuracionSO.marcosFisicos ? "En Memoria Principal" : "No Cargada";
        html += `
            <tr>
                <td class="dato-mono">Página ${i}</td>
                <td>${estado}</td>
                <td class="dato-mono">${marcoAsignado}</td>
            </tr>
        `;
    }

    html += `
            </tbody>
        </table>
    `;

    contenedor.innerHTML = html;
}

export function guardarConfiguracion() {
    const nuevaConfig = {
        quantum: Number(document.getElementById("quantum").value),
        paginasVirtuales: Number(document.getElementById("paginasVirtuales").value),
        marcosFisicos: Number(document.getElementById("marcosFisicos").value),
        algoritmoPredeterminado: document.getElementById("algoritmoPredeterminadoMMU").value
    };

    guardarConfiguracionSO(nuevaConfig);

    renderizarTablaPaginas();

    document.getElementById("mensajeConfiguracion").innerHTML = `
        <div class="mensaje-exito">
            <p><strong>Configuración guardada correctamente.</strong></p>
            <p>Quantum: <span class="dato-mono">${configuracionSO.quantum}</span></p>
            <p>Páginas virtuales: <span class="dato-mono">${configuracionSO.paginasVirtuales}</span></p>
            <p>Marcos físicos: <span class="dato-mono">${configuracionSO.marcosFisicos}</span></p>
            <p>Algoritmo MMU predeterminado: <span>${configuracionSO.algoritmoPredeterminado}</span></p>
        </div>
    `;
}

export function mostrarSeccion(seccion) {
    const contenido = document.getElementById("contenido");

    if (seccion === "programas") {
        contenido.innerHTML = `
            <h2>Configuración de programas</h2>

            <p class="subtitulo-seccion">
                Agregue los procesos que serán ejecutados por el sistema operativo.
            </p>

            <div class="formulario">

                <div>
                    <label>ID del proceso:</label>
                    <input type="text" id="idProceso" placeholder="Ejemplo: P1" class="dato-mono">
                </div>

                <div>
                    <label>Nombre del programa:</label>
                    <input type="text" id="nombreProceso" placeholder="Ejemplo: Programa 1">
                </div>

                <div>
                    <label>Tiempo de llegada:</label>
                    <input type="number" id="llegadaProceso" min="0" value="0" class="dato-mono">
                </div>

                <div>
                    <label>Tiempo de ejecución:</label>
                    <input type="number" id="duracionProceso" min="1" value="1" class="dato-mono">
                </div>

                <div>
                    <label>Prioridad:</label>
                    <input type="number" id="prioridadProceso" min="1" value="1" class="dato-mono">
                </div>

                <div>
                    <label>Boletos (sorteo):</label>
                    <input type="number" id="boletosProceso" min="1" value="10" class="dato-mono">
                </div>

                <div>
                    <label>Páginas requeridas:</label>
                    <input type="number" id="paginasProceso" min="1" value="1" class="dato-mono">
                </div>

            </div>

            <div class="acciones-formulario">
                <button class="boton-agregar" onclick="agregarProceso()">
                    Agregar proceso
                </button>

                <button class="boton-secundario" onclick="limpiarProcesos()">
                    Limpiar procesos
                </button>
            </div>

            <h3>Procesos registrados</h3>

            <div id="tablaProcesos">
                <p class="texto-secundario">No hay procesos registrados.</p>
            </div>
        `;

        actualizarTabla();
    } else if (seccion === "planificador") {
        contenido.innerHTML = `
            <h2>Lista de ejecución</h2>

            <p class="subtitulo-seccion">
                Configure la cola de ejecución o seleccione el algoritmo de planificación de procesos.
            </p>

            <div class="panel-cola-personalizada">
                <div class="toggle-cola-contenedor">
                    <label class="switch-label">
                        <input type="checkbox" id="toggleUsarCola" ${usarColaPersonalizada ? "checked" : ""} onchange="cambiarModoCola(this.checked)">
                        <strong>Usar cola personalizada</strong>
                    </label>
                </div>

                <div id="seccionControlesCola" style="${usarColaPersonalizada ? "" : "display: none;"}">
                    <div class="agregar-cola-controles">
                        <div>
                            <label>Proceso:</label>
                            <select id="selectProcesoCola"></select>
                        </div>
                        <div>
                            <label>Llegada personalizada (opcional):</label>
                            <input type="number" id="llegadaProcesoCola" min="0" placeholder="Ej: 0" class="dato-mono">
                        </div>
                        <button class="boton-agregar" onclick="agregarProcesoAColaUI()">
                            Agregar a la cola
                        </button>
                        <button class="boton-secundario" onclick="vaciarColaUI()">
                            Vaciar cola
                        </button>
                    </div>

                    <div id="listaColaVisual" class="lista-cola-visual"></div>
                </div>
            </div>

            <div class="control-planificador">
                <select id="algoritmoPlanificador">
                    <option value="FCFS">FCFS</option>
                    <option value="SJF">SJF</option>
                    <option value="RR">Round Robin</option>
                    <option value="PRIORIDAD">Por Prioridad</option>
                    <option value="SORTEO">Por Sorteo</option>
                </select>

                <button onclick="ejecutarPlanificador()">
                    Ejecutar planificación
                </button>
            </div>

            <div id="resultadoPlanificador"></div>
        `;

        poblarSelectProcesosCola();
        renderizarColaVisual();
    } else if (seccion === "sistema") {
        contenido.innerHTML = `
            <h2>Configuración del Sistema Operativo</h2>

            <div class="formulario">

                <div>
                    <label>Quantum:</label>
                    <input type="number" id="quantum" min="1" value="2" class="dato-mono">
                </div>

                <div>
                    <label>Cantidad de páginas virtuales:</label>
                    <input type="number" id="paginasVirtuales" min="1" value="8" class="dato-mono">
                </div>

                <div>
                    <label>Cantidad de marcos físicos:</label>
                    <input type="number" id="marcosFisicos" min="1" value="3" class="dato-mono">
                </div>

                <div>
                    <label>Algoritmo MMU por defecto:</label>
                    <select id="algoritmoPredeterminadoMMU">
                        <option value="FIFO">FIFO</option>
                        <option value="LRU">LRU</option>
                        <option value="OPTIMO">Óptimo</option>
                        <option value="CLOCK">Clock</option>
                        <option value="SEGUNDA_OPORTUNIDAD">Segunda Oportunidad</option>
                        <option value="MRU">MRU</option>
                        <option value="LFU">LFU</option>
                        <option value="NRU">NRU</option>
                    </select>
                </div>

            </div>

            <button onclick="guardarConfiguracion()">
                Guardar configuración
            </button>

            <div id="mensajeConfiguracion"></div>

            <h3>Tabla de Páginas (Mapeo Virtual - Físico)</h3>
            <div id="tablaPaginasMapeo"></div>
        `;

        document.getElementById("quantum").value = configuracionSO.quantum;
        document.getElementById("paginasVirtuales").value = configuracionSO.paginasVirtuales;
        document.getElementById("marcosFisicos").value = configuracionSO.marcosFisicos;
        document.getElementById("algoritmoPredeterminadoMMU").value = configuracionSO.algoritmoPredeterminado || "FIFO";

        renderizarTablaPaginas();
    } else if (seccion === "mmu") {
        contenido.innerHTML = `
            <h2>Emular MMU</h2>

            <p class="subtitulo-seccion">
                Seleccione el algoritmo de paginación:
            </p>

            <div class="panel-cola-personalizada" style="margin-bottom: 20px;">
                <div class="toggle-cola-contenedor">
                    <label class="switch-label">
                        <input type="checkbox" id="modoManualMMU" onchange="toggleModoManualMMU(this.checked)">
                        <strong>Ingresar referencias manualmente</strong>
                    </label>
                </div>

                <div id="contenedorReferenciasManual" style="display: none; margin-top: 12px;">
                    <label style="display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; color: #6B6B6B; margin-bottom: 6px;">Referencias de página (separadas por coma):</label>
                    <textarea id="referenciasManualMMU" placeholder="A0, B8, C3, D0, A0, B3, AT, C4..."></textarea>
                </div>
            </div>

            <div class="control-planificador">
                <select id="algoritmoMMU">
                    <option value="FIFO">FIFO</option>
                    <option value="LRU">LRU</option>
                    <option value="OPTIMO">Óptimo</option>
                    <option value="CLOCK">Clock</option>
                    <option value="SEGUNDA_OPORTUNIDAD">Segunda Oportunidad</option>
                    <option value="MRU">MRU</option>
                    <option value="LFU">LFU</option>
                    <option value="NRU">NRU</option>
                </select>

                <button onclick="ejecutarMMU()">
                    Ejecutar MMU
                </button>
            </div>

            <div id="resultadoMMU"></div>
        `;

        const comboMMU = document.getElementById("algoritmoMMU");
        if (comboMMU && configuracionSO.algoritmoPredeterminado) {
            comboMMU.value = configuracionSO.algoritmoPredeterminado;
        }
    }
}

export function toggleModoManualMMU(activado) {
    const contenedor = document.getElementById("contenedorReferenciasManual");
    if (contenedor) {
        contenedor.style.display = activado ? "block" : "none";
    }
}

export function cambiarModoCola(activado) {
    setUsarColaPersonalizada(activado);
    const seccion = document.getElementById("seccionControlesCola");
    if (seccion) {
        seccion.style.display = activado ? "" : "none";
    }
}

export function poblarSelectProcesosCola() {
    const select = document.getElementById("selectProcesoCola");
    if (!select) return;

    const procesos = obtenerListaProcesos();
    if (procesos.length === 0) {
        select.innerHTML = `<option value="">No hay procesos disponibles</option>`;
        return;
    }

    let html = "";
    procesos.forEach(p => {
        html += `<option value="${p.id}">${p.id} — ${p.nombre} (Llegada: ${p.llegada}, Duración: ${p.duracion})</option>`;
    });
    select.innerHTML = html;
}

export function renderizarColaVisual() {
    const contenedor = document.getElementById("listaColaVisual");
    if (!contenedor) return;

    if (colaPersonalizada.length === 0) {
        contenedor.innerHTML = `<p class="texto-secundario">La cola personalizada está vacía.</p>`;
        return;
    }

    let html = `<ul class="lista-instancias-cola">`;

    colaPersonalizada.forEach((item, indice) => {
        html += `
            <li class="item-instancia-cola">
                <span class="info-instancia">
                    <strong class="dato-mono">${item.idProceso}</strong> — instancia ${item.numeroInstancia}
                    <span class="llegada-instancia">(Llegada: <span class="dato-mono">${item.llegadaCustom !== null ? item.llegadaCustom : "Original"}</span>)</span>
                </span>
                <div class="acciones-instancia">
                    <button class="boton-secundario btn-sm" onclick="moverItemColaUI(${indice}, -1)" ${indice === 0 ? "disabled" : ""}>▲</button>
                    <button class="boton-secundario btn-sm" onclick="moverItemColaUI(${indice}, 1)" ${indice === colaPersonalizada.length - 1 ? "disabled" : ""}>▼</button>
                    <button class="boton-secundario btn-sm btn-eliminar" onclick="eliminarItemColaUI(${indice})">✕</button>
                </div>
            </li>
        `;
    });

    html += `</ul>`;
    contenedor.innerHTML = html;
}

export function agregarProcesoAColaUI() {
    const select = document.getElementById("selectProcesoCola");
    if (!select || !select.value) {
        alert("Debe seleccionar un proceso válido.");
        return;
    }

    const idProceso = select.value;
    const inputLlegada = document.getElementById("llegadaProcesoCola");
    const valorLlegada = inputLlegada && inputLlegada.value !== "" ? Number(inputLlegada.value) : null;

    const instanciasExistentes = colaPersonalizada.filter(item => item.idProceso === idProceso);
    const numeroInstancia = instanciasExistentes.length + 1;

    agregarAColaPersonalizada({
        idProceso: idProceso,
        numeroInstancia: numeroInstancia,
        llegadaCustom: valorLlegada
    });

    if (inputLlegada) {
        inputLlegada.value = "";
    }

    renderizarColaVisual();
}

export function moverItemColaUI(indice, direccion) {
    moverEnColaPersonalizada(indice, direccion);
    renderizarColaVisual();
}

export function eliminarItemColaUI(indice) {
    eliminarDeColaPersonalizada(indice);

    const conteos = {};
    colaPersonalizada.forEach(item => {
        conteos[item.idProceso] = (conteos[item.idProceso] || 0) + 1;
        item.numeroInstancia = conteos[item.idProceso];
    });

    renderizarColaVisual();
}

export function vaciarColaUI() {
    vaciarColaPersonalizada();
    renderizarColaVisual();
}

export function salir() {
    alert("Gracias por utilizar el Simulador de Sistema Operativo.");
    window.close();
}
