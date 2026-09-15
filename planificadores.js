import { obtenerListaProcesos, guardarSecuencia, configuracionSO } from "./estado.js";

export function ejecutarPlanificador() {

    const algoritmo =
        document.getElementById("algoritmoPlanificador").value;

    const resultado =
        document.getElementById("resultadoPlanificador");


    const procesos = obtenerListaProcesos();

    // Verificar que existan procesos

    if (procesos.length === 0) {

        resultado.innerHTML = `
            <p class="mensaje-error">
                Primero debe agregar procesos.
            </p>
        `;

        return;
    }


    // ==========================================
    // FCFS
    // ==========================================

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
                fin: fin

            });


            tiempoActual = fin;

        });

        guardarSecuencia(resultadoPlan);
        mostrarResultadoPlanificacion(
            resultadoPlan,
            "FCFS"
        );

    }


    // ==========================================
    // SJF
    // ==========================================

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
                (a, b) => a.duracion - b.duracion
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
                fin: fin

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


    // ==========================================
    // ROUND ROBIN
    // ==========================================

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


    // ==========================================
    // PRIORIDAD
    // ==========================================

    else if (algoritmo === "PRIORIDAD") {

        let pendientes = [...procesos];

        let resultadoPlan = [];

        let tiempoActual = 0;


        while (pendientes.length > 0) {

            // Buscar procesos que ya llegaron

            let disponibles = pendientes.filter(
                proceso => proceso.llegada <= tiempoActual
            );


            // Si no ha llegado ningún proceso,
            // avanzar el reloj

            if (disponibles.length === 0) {

                tiempoActual = Math.min(
                    ...pendientes.map(
                        proceso => proceso.llegada
                    )
                );

                continue;
            }


            // Ordenar por prioridad
            // 1 = mayor prioridad

            disponibles.sort(
                (a, b) => {

                    // Primero comparar prioridad

                    if (a.prioridad !== b.prioridad) {

                        return a.prioridad - b.prioridad;

                    }

                    // Si tienen la misma prioridad,
                    // utilizar primero el que llegó antes

                    return a.llegada - b.llegada;

                }
            );


            // Seleccionar el proceso de mayor prioridad

            const proceso = disponibles[0];


            const inicio = tiempoActual;

            const fin =
                inicio + proceso.duracion;


            // Guardar resultado

            resultadoPlan.push({

                id: proceso.id,
                nombre: proceso.nombre,
                llegada: proceso.llegada,
                duracion: proceso.duracion,
                prioridad: proceso.prioridad,
                inicio: inicio,
                fin: fin

            });


            // Avanzar el reloj

            tiempoActual = fin;


            // Eliminar proceso terminado

            pendientes = pendientes.filter(
                p => p.id !== proceso.id
            );

        }

        guardarSecuencia(resultadoPlan);
        mostrarResultadoPrioridad(
            resultadoPlan
        );

    }
// ==========================================
// SORTEO
// ==========================================

else if (algoritmo === "SORTEO") {

    let pendientes = [...procesos];

    let resultadoPlan = [];

    let tiempoActual = 0;


    // Mientras existan procesos pendientes

    while (pendientes.length > 0) {


        // Buscar procesos que ya llegaron

        let disponibles = pendientes.filter(
            proceso => proceso.llegada <= tiempoActual
        );


        // Si todavía no ha llegado ningún proceso,
        // avanzar el reloj

        if (disponibles.length === 0) {

            tiempoActual = Math.min(
                ...pendientes.map(
                    proceso => proceso.llegada
                )
            );

            continue;
        }


        // ==========================================
        // CALCULAR TOTAL DE BOLETOS
        // ==========================================

        const totalBoletos =
            disponibles.reduce(
                (total, proceso) =>
                    total + proceso.boletos,
                0
            );


        // Generar número aleatorio

        const numeroSorteo =
            Math.floor(
                Math.random() * totalBoletos
            ) + 1;


        // ==========================================
        // DETERMINAR GANADOR
        // ==========================================

        let acumulado = 0;

        let ganador = null;


        for (const proceso of disponibles) {

            acumulado += proceso.boletos;


            if (numeroSorteo <= acumulado) {

                ganador = proceso;

                break;

            }

        }


        // ==========================================
        // EJECUTAR GANADOR
        // ==========================================

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
            fin: fin

        });


        // Avanzar el reloj

        tiempoActual = fin;


        // Eliminar proceso terminado

        pendientes = pendientes.filter(
            proceso => proceso.id !== ganador.id
        );

    }

    guardarSecuencia(resultadoPlan);
    mostrarResultadoSorteo(
        resultadoPlan
    );

}

    // ==========================================
    // OTROS ALGORITMOS
    // ==========================================

    else {

        resultado.innerHTML = `

            <p>
                El algoritmo <strong>${algoritmo}</strong>
                todavía está en desarrollo.
            </p>

        `;

    }

}
// ==========================================
// MOSTRAR RESULTADO POR PRIORIDAD
// ==========================================

export function mostrarResultadoPrioridad(resultadoPlan) {

    const resultado =
        document.getElementById("resultadoPlanificador");


    let html = `

        <h3>Resultado por Prioridad</h3>

        <p>
            Regla utilizada:
            <strong>1 = mayor prioridad</strong>
        </p>

        <p>
            Orden de ejecución:
        </p>

        <div class="secuencia">

    `;


    // Mostrar secuencia

    resultadoPlan.forEach(proceso => {

        html += `

            <span class="proceso-secuencia">
                ${proceso.id}
            </span>

        `;

    });


    html += `

        </div>

        <h3>Detalle de ejecución</h3>

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


    // Crear filas

    resultadoPlan.forEach(proceso => {

        html += `

            <tr>

                <td>${proceso.id}</td>

                <td>${proceso.llegada}</td>

                <td>${proceso.duracion}</td>

                <td>${proceso.prioridad}</td>

                <td>${proceso.inicio}</td>

                <td>${proceso.fin}</td>

            </tr>

        `;

    });


    html += `

            </tbody>

        </table>

    `;


    resultado.innerHTML = html;

}
// ==========================================
// MOSTRAR RESULTADO SORTEO
// ==========================================

export function mostrarResultadoSorteo(resultadoPlan) {

    const resultado =
        document.getElementById("resultadoPlanificador");


    let html = `

        <h3>Resultado por Sorteo</h3>

        <p>
            Cada proceso participa con sus boletos.
            El ganador se selecciona aleatoriamente.
        </p>

        <p>
            Orden de ejecución:
        </p>

        <div class="secuencia">

    `;


    // Mostrar secuencia

    resultadoPlan.forEach(proceso => {

        html += `

            <span class="proceso-secuencia">
                ${proceso.id}
            </span>

        `;

    });


    html += `

        </div>

        <h3>Detalle de los sorteos</h3>

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


    // Crear filas

    resultadoPlan.forEach(
        (proceso, indice) => {

            html += `

                <tr>

                    <td>${indice + 1}</td>

                    <td>${proceso.id}</td>

                    <td>${proceso.boletos}</td>

                    <td>${proceso.totalBoletos}</td>

                    <td>${proceso.sorteo}</td>

                    <td>${proceso.inicio}</td>

                    <td>${proceso.fin}</td>

                </tr>

            `;

        }
    );


    html += `

            </tbody>

        </table>

    `;


    resultado.innerHTML = html;

}
// ==========================================
// MOSTRAR RESULTADO ROUND ROBIN
// ==========================================

export function mostrarResultadoRoundRobin(
    resultadoPlan,
    quantum
) {

    const resultado =
        document.getElementById("resultadoPlanificador");


    let html = `

        <h3>Resultado Round Robin</h3>

        <p>
            Quantum utilizado:
            <strong>${quantum}</strong>
        </p>

        <p>
            Secuencia de ejecución:
        </p>

        <div class="secuencia">

    `;


    // Mostrar cada turno

    resultadoPlan.forEach(turno => {

        html += `

            <span class="proceso-secuencia">
                ${turno.id}
            </span>

        `;

    });


    html += `

        </div>

        <h3>Detalle de ejecución</h3>

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


    // Crear las filas

    resultadoPlan.forEach((turno, indice) => {

        html += `

            <tr>

                <td>${indice + 1}</td>

                <td>${turno.id}</td>

                <td>${turno.inicio}</td>

                <td>${turno.fin}</td>

                <td>${turno.ejecutado}</td>

                <td>${turno.restante}</td>

            </tr>

        `;

    });


    html += `

            </tbody>

        </table>

    `;


    resultado.innerHTML = html;

}

// ==========================================
// MOSTRAR RESULTADO DE PLANIFICACIÓN
// ==========================================

export function mostrarResultadoPlanificacion(
    resultadoPlan,
    nombreAlgoritmo
) {

    const resultado =
        document.getElementById("resultadoPlanificador");


    let html = `

        <h3>Resultado ${nombreAlgoritmo}</h3>

        <p>
            Orden de ejecución:
        </p>

        <div class="secuencia">
    `;


    // Mostrar la secuencia

    resultadoPlan.forEach(proceso => {

        html += `

            <span class="proceso-secuencia">
                ${proceso.id}
            </span>

        `;

    });


    html += `

        </div>

        <h3>Detalle de ejecución</h3>

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


    // Crear filas

    resultadoPlan.forEach(proceso => {

        html += `

            <tr>

                <td>${proceso.id}</td>
                <td>${proceso.llegada}</td>
                <td>${proceso.duracion}</td>
                <td>${proceso.inicio}</td>
                <td>${proceso.fin}</td>

            </tr>

        `;

    });


    html += `

            </tbody>

        </table>

    `;


    resultado.innerHTML = html;
}


// ==========================================
// MMU
// ==========================================
