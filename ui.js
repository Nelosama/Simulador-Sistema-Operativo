import { obtenerListaProcesos, configuracionSO, guardarConfiguracionSO } from './estado.js';

export function actualizarTabla() {
    const tabla = document.getElementById("tablaProcesos");

    if (!tabla) {
        return;
    }

    const lista = obtenerListaProcesos();

    if (lista.length === 0) {
        tabla.innerHTML = `
            <p>No hay procesos registrados.</p>
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
                <td>${proceso.id}</td>
                <td>${proceso.nombre}</td>
                <td>${proceso.llegada}</td>
                <td>${proceso.duracion}</td>
                <td>${proceso.prioridad}</td>
                <td>${proceso.boletos}</td>
                <td>${proceso.paginasRequeridas || 1}</td>
                <td>${proceso.quantumRestante !== undefined ? proceso.quantumRestante : configuracionSO.quantum}</td>
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
                <td>Página ${i}</td>
                <td>${estado}</td>
                <td>${marcoAsignado}</td>
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
        espacioDisco: Number(document.getElementById("espacioDisco").value),
        algoritmoPredeterminado: document.getElementById("algoritmoPredeterminadoMMU").value
    };

    guardarConfiguracionSO(nuevaConfig);

    renderizarTablaPaginas();

    document.getElementById("mensajeConfiguracion").innerHTML = `
        <p class="mensaje-exito">
            Configuración guardada correctamente.
        </p>
        <p>
            Quantum: ${configuracionSO.quantum}
        </p>
        <p>
            Páginas virtuales: ${configuracionSO.paginasVirtuales}
        </p>
        <p>
            Marcos físicos: ${configuracionSO.marcosFisicos}
        </p>
        <p>
            Espacio de Disco Duro: ${configuracionSO.espacioDisco} bloques
        </p>
        <p>
            Algoritmo MMU predeterminado: ${configuracionSO.algoritmoPredeterminado}
        </p>
    `;
}

export function mostrarSeccion(seccion) {
    const contenido = document.getElementById("contenido");

    if (seccion === "programas") {
        contenido.innerHTML = `
            <h2>Configuración de programas</h2>

            <p>
                Agregue los procesos que serán ejecutados por el sistema operativo.
            </p>

            <div class="formulario">

                <div>
                    <label>ID del proceso:</label>
                    <input type="text" id="idProceso" placeholder="Ejemplo: P1">
                </div>

                <div>
                    <label>Nombre del programa:</label>
                    <input type="text" id="nombreProceso" placeholder="Ejemplo: Programa 1">
                </div>

                <div>
                    <label>Tiempo de llegada:</label>
                    <input type="number" id="llegadaProceso" min="0" value="0">
                </div>

                <div>
                    <label>Tiempo de ejecución:</label>
                    <input type="number" id="duracionProceso" min="1" value="1">
                </div>

                <div>
                    <label>Prioridad:</label>
                    <input type="number" id="prioridadProceso" min="1" value="1">
                </div>

                <div>
                    <label>Boletos (sorteo):</label>
                    <input type="number" id="boletosProceso" min="1" value="10">
                </div>

                <div>
                    <label>Páginas requeridas:</label>
                    <input type="number" id="paginasProceso" min="1" value="1">
                </div>

            </div>

            <button class="boton-agregar" onclick="agregarProceso()">
                Agregar proceso
            </button>

            <button class="boton-secundario" onclick="limpiarProcesos()">
                Limpiar procesos
            </button>

            <h3>Procesos registrados</h3>

            <div id="tablaProcesos">
                <p>No hay procesos registrados.</p>
            </div>
        `;

        actualizarTabla();
    } else if (seccion === "planificador") {
        contenido.innerHTML = `
            <h2>Lista de ejecución</h2>

            <p>
                Seleccione el algoritmo de planificación de procesos.
            </p>

            <select id="algoritmoPlanificador">
                <option value="FCFS">FCFS</option>
                <option value="SJF">SJF</option>
                <option value="RR">Round Robin</option>
                <option value="PRIORIDAD">Por Prioridad</option>
                <option value="SORTEO">Por Sorteo</option>
            </select>

            <br><br>

            <button onclick="ejecutarPlanificador()">
                Ejecutar planificación
            </button>

            <div id="resultadoPlanificador"></div>
        `;
    } else if (seccion === "sistema") {
        contenido.innerHTML = `
            <h2>Configuración del Sistema Operativo</h2>

            <div class="formulario">

                <div>
                    <label>Quantum:</label>
                    <input type="number" id="quantum" min="1" value="2">
                </div>

                <div>
                    <label>Cantidad de páginas virtuales:</label>
                    <input type="number" id="paginasVirtuales" min="1" value="8">
                </div>

                <div>
                    <label>Cantidad de marcos físicos:</label>
                    <input type="number" id="marcosFisicos" min="1" value="3">
                </div>

                <div>
                    <label>Espacio de Disco Duro (Bloques):</label>
                    <input type="number" id="espacioDisco" min="1" value="16">
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
        document.getElementById("espacioDisco").value = configuracionSO.espacioDisco || 16;
        document.getElementById("algoritmoPredeterminadoMMU").value = configuracionSO.algoritmoPredeterminado || "FIFO";

        renderizarTablaPaginas();
    } else if (seccion === "mmu") {
        contenido.innerHTML = `
            <h2>Emular MMU</h2>

            <p>
                Seleccione el algoritmo de paginación:
            </p>

            <select id="algoritmoMMU">
                <option value="FIFO">FIFO</option>
                <option value="LRU">LRU</option>
                <option value="OPTIMO">Óptimo</option>
                <option value="CLOCK">Clock</option>
                <option value="SEGUNDA_OPORTUNIDAD">Segunda Oportunidad</option>
                <option value="MRU">MRU</option>
                <option value="LFU">LFU</option>
            </select>

            <br><br>

            <button onclick="ejecutarMMU()">
                Ejecutar MMU
            </button>

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
