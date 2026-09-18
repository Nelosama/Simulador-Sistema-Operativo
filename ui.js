import { obtenerListaProcesos, configuracionSO, guardarConfiguracionSO } from './estado.js';

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
                Seleccione el algoritmo de planificación de procesos.
            </p>

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

            <div class="control-planificador">
                <select id="algoritmoMMU">
                    <option value="FIFO">FIFO</option>
                    <option value="LRU">LRU</option>
                    <option value="OPTIMO">Óptimo</option>
                    <option value="CLOCK">Clock</option>
                    <option value="SEGUNDA_OPORTUNIDAD">Segunda Oportunidad</option>
                    <option value="MRU">MRU</option>
            
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

export function salir() {
    alert("Gracias por utilizar el Simulador de Sistema Operativo.");
    window.close();
}
