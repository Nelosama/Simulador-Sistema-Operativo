import { obtenerListaProcesos, guardarSecuencia, configuracionSO, ultimoResultadoMMU } from "./estado.js";

export function ejecutarPlanificador() {

    const algoritmo =
        document.getElementById("algoritmoPlanificador").value;

    const resultado =
        document.getElementById("resultadoPlanificador");


    const procesos = obtenerListaProcesos();

    if (procesos.length === 0) {

        resultado.innerHTML = `
            <p class="mensaje-error">
                Primero debe agregar procesos.
            </p>
        `;

        return;
    }


    if (algoritmo === "FCFS") {

        let orden = [...procesos];

        orden.sort((a, b) => a.llegada - b.llegada);

        let tiempoActual = 0;

        let resultadoPlan = [];


        orden.forEach(proceso => {

            if (tiempoActual < proceso.llegada) {
                tiempoActual = proceso.llegada;
            }

            const inicio = tiempoActual;

            const fin = inicio + proceso.duracion;


            resultadoPlan.push({

                id: proceso.id,
                nombre: proceso.nombre,
                llegada: proceso.llegada,
                duracion: proceso.duracion,
                inicio: inicio,
                fin: fin,
                ejecutado: proceso.duracion,
                restante: 0

            });


            tiempoActual = fin;

        });

        guardarSecuencia(resultadoPlan);
        mostrarResultadoPlanificacion(
            resultadoPlan,
            "FCFS"
        );

    }


    else if (algoritmo === "SJF") {

        let pendientes = [...procesos];

        let resultadoPlan = [];

        let tiempoActual = 0;


        while (pendientes.length > 0) {

            let disponibles = pendientes.filter(
                proceso => proceso.llegada <= tiempoActual
            );


            if (disponibles.length === 0) {

                tiempoActual = Math.min(
                    ...pendientes.map(
                        proceso => proceso.llegada
                    )
                );

                continue;
            }


            disponibles.sort(
                (a, b) => {
                    if (a.duracion !== b.duracion) {
                        return a.duracion - b.duracion;
                    }
                    return a.llegada - b.llegada;
                }
            );


            const proceso = disponibles[0];

            const inicio = tiempoActual;

            const fin = inicio + proceso.duracion;


            resultadoPlan.push({

                id: proceso.id,
                nombre: proceso.nombre,
                llegada: proceso.llegada,
                duracion: proceso.duracion,
                inicio: inicio,
                fin: fin,
                ejecutado: proceso.duracion,
                restante: 0

            });


            tiempoActual = fin;


            pendientes = pendientes.filter(
                p => p.id !== proceso.id
            );

        }

        guardarSecuencia(resultadoPlan);
        mostrarResultadoPlanificacion(
            resultadoPlan,
            "SJF"
        );

    }


    else if (algoritmo === "RR") {

        const quantum = configuracionSO.quantum;


        if (quantum <= 0) {

            resultado.innerHTML = `
                <p class="mensaje-error">
                    El Quantum debe ser mayor que 0.
                </p>
            `;

            return;
        }


        let pendientes = procesos.map(proceso => ({

            ...proceso,

            tiempoRestante: proceso.duracion

        }));


        pendientes.sort(
            (a, b) => a.llegada - b.llegada
        );


        let cola = [];

        let resultadoPlan = [];

        let tiempoActual = 0;

        let indiceLlegada = 0;


        while (
            indiceLlegada < pendientes.length ||
            cola.length > 0
        ) {


            if (cola.length === 0) {

                tiempoActual =
                    Math.max(
                        tiempoActual,
                        pendientes[indiceLlegada].llegada
                    );
            }


            while (
                indiceLlegada < pendientes.length &&
                pendientes[indiceLlegada].llegada <= tiempoActual
            ) {

                cola.push(
                    pendientes[indiceLlegada]
                );

                indiceLlegada++;

            }


            const proceso = cola.shift();


            const inicio = tiempoActual;


            const tiempoEjecutado =
                Math.min(
                    quantum,
                    proceso.tiempoRestante
                );


            tiempoActual += tiempoEjecutado;


            proceso.tiempoRestante -= tiempoEjecutado;


            resultadoPlan.push({

                id: proceso.id,
                nombre: proceso.nombre,
                llegada: proceso.llegada,
                duracion: proceso.duracion,
                inicio: inicio,
                fin: tiempoActual,
                ejecutado: tiempoEjecutado,
                restante: proceso.tiempoRestante

            });


            while (
                indiceLlegada < pendientes.length &&
                pendientes[indiceLlegada].llegada <= tiempoActual
            ) {

                cola.push(
                    pendientes[indiceLlegada]
                );

                indiceLlegada++;

            }


            if (proceso.tiempoRestante > 0) {

                cola.push(proceso);

            }

        }

        guardarSecuencia(resultadoPlan);
        mostrarResultadoRoundRobin(
            resultadoPlan,
            quantum
        );

    }


    else if (algoritmo === "PRIORIDAD") {

        let pendientes = [...procesos];

        let resultadoPlan = [];

        let tiempoActual = 0;


        while (pendientes.length > 0) {

            let disponibles = pendientes.filter(
                proceso => proceso.llegada <= tiempoActual
            );


            if (disponibles.length === 0) {

                tiempoActual = Math.min(
                    ...pendientes.map(
                        proceso => proceso.llegada
                    )
                );

                continue;
            }


            disponibles.sort(
                (a, b) => {

                    if (a.prioridad !== b.prioridad) {

                        return a.prioridad - b.prioridad;

                    }

                    return a.llegada - b.llegada;

                }
            );


            const proceso = disponibles[0];


            const inicio = tiempoActual;

            const fin =
                inicio + proceso.duracion;


            resultadoPlan.push({

                id: proceso.id,
                nombre: proceso.nombre,
                llegada: proceso.llegada,
                duracion: proceso.duracion,
                prioridad: proceso.prioridad,
                inicio: inicio,
                fin: fin,
                ejecutado: proceso.duracion,
                restante: 0

            });


            tiempoActual = fin;


            pendientes = pendientes.filter(
                p => p.id !== proceso.id
            );

        }

        guardarSecuencia(resultadoPlan);
        mostrarResultadoPrioridad(
            resultadoPlan
        );

    }

else if (algoritmo === "SORTEO") {

    let pendientes = [...procesos];

    let resultadoPlan = [];

    let tiempoActual = 0;


    while (pendientes.length > 0) {

        let disponibles = pendientes.filter(
            proceso => proceso.llegada <= tiempoActual
        );


        if (disponibles.length === 0) {

            tiempoActual = Math.min(
                ...pendientes.map(
                    proceso => proceso.llegada
                )
            );

            continue;
        }


        const totalBoletos =
            disponibles.reduce(
                (total, proceso) =>
                    total + proceso.boletos,
                0
            );


        const numeroSorteo =
            Math.floor(
                Math.random() * totalBoletos
            ) + 1;


        let acumulado = 0;

        let ganador = null;


        for (const proceso of disponibles) {

            acumulado += proceso.boletos;


            if (numeroSorteo <= acumulado) {

                ganador = proceso;

                break;

            }

        }


        const inicio = tiempoActual;

        const fin =
            inicio + ganador.duracion;


        resultadoPlan.push({

            id: ganador.id,
            nombre: ganador.nombre,
            llegada: ganador.llegada,
            duracion: ganador.duracion,
            boletos: ganador.boletos,
            sorteo: numeroSorteo,
            totalBoletos: totalBoletos,
            inicio: inicio,
            fin: fin,
            ejecutado: ganador.duracion,
            restante: 0

        });


        tiempoActual = fin;


        pendientes = pendientes.filter(
            proceso => proceso.id !== ganador.id
        );

    }

    guardarSecuencia(resultadoPlan);
    mostrarResultadoSorteo(
        resultadoPlan
    );

}

    else {

        resultado.innerHTML = `

            <p>
                El algoritmo <strong>${algoritmo}</strong>
                todavía está en desarrollo.
            </p>

        `;

    }

}

export function renderizarGanttVisual(resultadoPlan) {
    if (!resultadoPlan || resultadoPlan.length === 0) return '';

    const tiempoTotal = Math.max(...resultadoPlan.map(t => t.fin));
    const listaProcesosFormato = [];

    resultadoPlan.forEach(t => {
        if (!listaProcesosFormato.includes(t.id)) {
            listaProcesosFormato.push(t.id);
        }
    });

    let ganttHtml = `
        <div class="panel-simulacion">
            <h3>Diagrama de Gantt</h3>
            <div class="gantt-contenedor">
                <div class="gantt-wrapper">
    `;

    listaProcesosFormato.forEach(procId => {
        const turnosProceso = resultadoPlan.filter(t => t.id === procId);
        ganttHtml += `
            <div class="gantt-fila-proceso">
                <div class="gantt-label-proceso">${procId}</div>
                <div class="gantt-pista">
        `;

        turnosProceso.forEach(t => {
            const leftPct = (t.inicio / tiempoTotal) * 100;
            const widthPct = ((t.fin - t.inicio) / tiempoTotal) * 100;
            const tooltipText = `Proceso: ${t.id} &#10;Inicio: ${t.inicio} &#10;Fin: ${t.fin} &#10;Tiempo restante: ${t.restante !== undefined ? t.restante : 0}`;

            ganttHtml += `
                <div class="gantt-bloque gantt-bloque-ejecutando"
                     style="left: ${leftPct}%; width: ${widthPct}%;"
                     title="Proceso: ${t.id}&#10;Inicio: ${t.inicio}&#10;Fin: ${t.fin}&#10;Tiempo restante: ${t.restante !== undefined ? t.restante : 0}">
                    ${t.id} (${t.inicio}-${t.fin})
                </div>
            `;
        });

        ganttHtml += `
                </div>
            </div>
        `;
    });

    ganttHtml += `
                <div class="gantt-eje-tiempo">
    `;

    for (let t = 0; t <= tiempoTotal; t++) {
        const pct = (t / tiempoTotal) * 100;
        ganttHtml += `
            <div class="gantt-marca-tiempo" style="left: ${pct}%;">${t}</div>
        `;
    }

    ganttHtml += `
                </div>
    `;

    if (ultimoResultadoMMU && ultimoResultadoMMU.pasos && ultimoResultadoMMU.pasos.length > 0) {
        const totalRefs = ultimoResultadoMMU.pasos.length;
        ganttHtml += `
            <div class="mmu-eje-fila">
                <div class="mmu-eje-label">MMU</div>
                <div class="mmu-eje-pista">
        `;

        ultimoResultadoMMU.pasos.forEach((paso, idx) => {
            const pct = (idx / (totalRefs - 1 || 1)) * 100;
            const esFallo = paso.resultado === "Fallo de página";
            const claseMarcador = esFallo ? "mmu-marcador-fallo" : "mmu-marcador-acierto";
            const tooltipText = `Ref #${idx + 1}: Pag ${paso.pagina} (${paso.resultado})`;

            ganttHtml += `
                <div class="mmu-marcador-ref ${claseMarcador}"
                     style="left: ${pct}%;"
                     title="${tooltipText}">
                    P${paso.pagina}
                </div>
            `;
        });

        ganttHtml += `
                </div>
            </div>
        `;
    }

    ganttHtml += `
                </div>
            </div>
        </div>
    `;

    return ganttHtml;
}

export function mostrarResultadoPrioridad(resultadoPlan) {
    const resultado = document.getElementById("resultadoPlanificador");

    let ganttHtml = renderizarGanttVisual(resultadoPlan);

    let html = `
        ${ganttHtml}

        <details class="detalle-ejecucion">
            <summary>Ver Detalle de Ejecución</summary>
            <div class="detalle-contenido">
                <p>Regla utilizada: <strong>1 = mayor prioridad</strong></p>
                <p>Orden de ejecución:</p>
                <div class="secuencia">
    `;

    resultadoPlan.forEach(proceso => {
        html += `<span class="proceso-secuencia dato-mono">${proceso.id}</span> `;
    });

    html += `
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Proceso</th>
                            <th>Llegada</th>
                            <th>Duración</th>
                            <th>Prioridad</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    resultadoPlan.forEach(proceso => {
        html += `
            <tr>
                <td class="dato-mono">${proceso.id}</td>
                <td class="dato-mono">${proceso.llegada}</td>
                <td class="dato-mono">${proceso.duracion}</td>
                <td class="dato-mono">${proceso.prioridad}</td>
                <td class="dato-mono">${proceso.inicio}</td>
                <td class="dato-mono">${proceso.fin}</td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </details>
    `;

    resultado.innerHTML = html;
}

export function mostrarResultadoSorteo(resultadoPlan) {
    const resultado = document.getElementById("resultadoPlanificador");

    let ganttHtml = renderizarGanttVisual(resultadoPlan);

    let html = `
        ${ganttHtml}

        <details class="detalle-ejecucion">
            <summary>Ver Detalle de los Sorteos</summary>
            <div class="detalle-contenido">
                <p>Cada proceso participa con sus boletos. El ganador se selecciona aleatoriamente.</p>
                <p>Orden de ejecución:</p>
                <div class="secuencia">
    `;

    resultadoPlan.forEach(proceso => {
        html += `<span class="proceso-secuencia dato-mono">${proceso.id}</span> `;
    });

    html += `
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Turno</th>
                            <th>Proceso ganador</th>
                            <th>Boletos</th>
                            <th>Total boletos</th>
                            <th>Número sorteado</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    resultadoPlan.forEach((proceso, indice) => {
        html += `
            <tr>
                <td class="dato-mono">${indice + 1}</td>
                <td class="dato-mono">${proceso.id}</td>
                <td class="dato-mono">${proceso.boletos}</td>
                <td class="dato-mono">${proceso.totalBoletos}</td>
                <td class="dato-mono">${proceso.sorteo}</td>
                <td class="dato-mono">${proceso.inicio}</td>
                <td class="dato-mono">${proceso.fin}</td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </details>
    `;

    resultado.innerHTML = html;
}

export function mostrarResultadoRoundRobin(resultadoPlan, quantum) {
    const resultado = document.getElementById("resultadoPlanificador");

    let ganttHtml = renderizarGanttVisual(resultadoPlan);

    let html = `
        ${ganttHtml}

        <details class="detalle-ejecucion">
            <summary>Ver Detalle de Ejecución (Round Robin)</summary>
            <div class="detalle-contenido">
                <p>Quantum utilizado: <strong class="dato-mono">${quantum}</strong></p>
                <p>Secuencia de ejecución:</p>
                <div class="secuencia">
    `;

    resultadoPlan.forEach(turno => {
        html += `<span class="proceso-secuencia dato-mono">${turno.id}</span> `;
    });

    html += `
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Turno</th>
                            <th>Proceso</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                            <th>Ejecutado</th>
                            <th>Tiempo restante</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    resultadoPlan.forEach((turno, indice) => {
        html += `
            <tr>
                <td class="dato-mono">${indice + 1}</td>
                <td class="dato-mono">${turno.id}</td>
                <td class="dato-mono">${turno.inicio}</td>
                <td class="dato-mono">${turno.fin}</td>
                <td class="dato-mono">${turno.ejecutado}</td>
                <td class="dato-mono">${turno.restante}</td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </details>
    `;

    resultado.innerHTML = html;
}

export function mostrarResultadoPlanificacion(resultadoPlan, nombreAlgoritmo) {
    const resultado = document.getElementById("resultadoPlanificador");

    let ganttHtml = renderizarGanttVisual(resultadoPlan);

    let html = `
        ${ganttHtml}

        <details class="detalle-ejecucion">
            <summary>Ver Detalle de Ejecución (${nombreAlgoritmo})</summary>
            <div class="detalle-contenido">
                <p>Orden de ejecución:</p>
                <div class="secuencia">
    `;

    resultadoPlan.forEach(proceso => {
        html += `<span class="proceso-secuencia dato-mono">${proceso.id}</span> `;
    });

    html += `
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Proceso</th>
                            <th>Llegada</th>
                            <th>Duración</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    resultadoPlan.forEach(proceso => {
        html += `
            <tr>
                <td class="dato-mono">${proceso.id}</td>
                <td class="dato-mono">${proceso.llegada}</td>
                <td class="dato-mono">${proceso.duracion}</td>
                <td class="dato-mono">${proceso.inicio}</td>
                <td class="dato-mono">${proceso.fin}</td>
            </tr>
        `;
    });

    html += `
                    </tbody>
                </table>
            </div>
        </details>
    `;

    resultado.innerHTML = html;
}
