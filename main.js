// ==========================================
// SIMULADOR DE SISTEMA OPERATIVO
// ==========================================

class Nodo {
    constructor(proceso) {
        this.proceso = proceso;
        this.siguiente = null;
    }
}

class ListaEnlazada {
    constructor() {
        this.cabeza = null;
    }

    agregar(proceso) {
        const nuevoNodo = new Nodo(proceso);
        if (!this.cabeza) {
            this.cabeza = nuevoNodo;
        } else {
            let actual = this.cabeza;
            while (actual.siguiente) {
                actual = actual.siguiente;
            }
            actual.siguiente = nuevoNodo;
        }
    }

    obtenerTodos() {
        const lista = [];
        let actual = this.cabeza;
        while (actual) {
            lista.push(actual.proceso);
            actual = actual.siguiente;
        }
        return lista;
    }

    limpiar() {
        this.cabeza = null;
    }

    longitud() {
        let contador = 0;
        let actual = this.cabeza;
        while (actual) {
            contador++;
            actual = actual.siguiente;
        }
        return contador;
    }
}

let listaProcesos = new ListaEnlazada();
let procesosGuardados = JSON.parse(localStorage.getItem("procesosSO")) || [];
procesosGuardados.forEach(p => listaProcesos.agregar(p));

function obtenerListaProcesos() {
    return listaProcesos.obtenerTodos();
}

// Guarda la última secuencia generada por el planificador
let ultimaSecuenciaEjecucion = [];
// ==========================================
// GUARDAR ÚLTIMA SECUENCIA DE EJECUCIÓN
// ==========================================

function guardarSecuencia(resultadoPlan) {

    ultimaSecuenciaEjecucion =
        resultadoPlan.map(
            turno => turno.id
        );

}


// ==========================================
// MOSTRAR SECCIONES
// ==========================================

function mostrarSeccion(seccion) {

    const contenido = document.getElementById("contenido");

    // CONFIGURACIÓN DE PROGRAMAS
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
    }


    // PLANIFICADOR
    else if (seccion === "planificador") {

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
    }


    // CONFIGURACIÓN DEL SO
    else if (seccion === "sistema") {

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

    // Cargar los últimos valores guardados
    document.getElementById("quantum").value =
        configuracionSO.quantum;

    document.getElementById("paginasVirtuales").value =
        configuracionSO.paginasVirtuales;

    document.getElementById("marcosFisicos").value =
        configuracionSO.marcosFisicos;

    document.getElementById("espacioDisco").value =
        configuracionSO.espacioDisco || 16;

    document.getElementById("algoritmoPredeterminadoMMU").value =
        configuracionSO.algoritmoPredeterminado || "FIFO";

    renderizarTablaPaginas();
    }


    // MMU
    else if (seccion === "mmu") {

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


// ==========================================
// AGREGAR PROCESO
// ==========================================

function agregarProceso() {

    const id = document.getElementById("idProceso").value;
    const nombre = document.getElementById("nombreProceso").value;
    const llegada = Number(document.getElementById("llegadaProceso").value);
    const duracion = Number(document.getElementById("duracionProceso").value);
    const prioridad = Number(document.getElementById("prioridadProceso").value);
    const boletos = Number(document.getElementById("boletosProceso").value);
    const paginas = Number(document.getElementById("paginasProceso") ? document.getElementById("paginasProceso").value : 1);


    // Validar que los campos estén llenos

    if (id === "" || nombre === "") {

        alert("Debe ingresar el ID y el nombre del proceso.");

        return;
    }


    // Crear el proceso

    const proceso = {

        id: id,
        nombre: nombre,
        llegada: llegada,
        duracion: duracion,
        prioridad: prioridad,
        boletos: boletos,
        paginasRequeridas: paginas,
        quantumRestante: configuracionSO.quantum,

        // Variables que utilizaremos posteriormente
        tiempoRestante: duracion,
        estado: "Listo"
    };


    // Agregar proceso a la lista enlazada

    listaProcesos.agregar(proceso);
    localStorage.setItem("procesosSO", JSON.stringify(obtenerListaProcesos()));

    // Actualizar tabla

    actualizarTabla();


    // Limpiar campos

    document.getElementById("idProceso").value = "";
    document.getElementById("nombreProceso").value = "";

}


// ==========================================
// MOSTRAR TABLA DE PROCESOS
// ==========================================

function actualizarTabla() {

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


// ==========================================
// LIMPIAR PROCESOS
// ==========================================

function limpiarProcesos() {

    if (obtenerListaProcesos().length === 0) {
        return;
    }

    const confirmar = confirm(
        "¿Está seguro de eliminar todos los procesos?"
    );

    if (confirmar) {

        listaProcesos.limpiar();
        localStorage.removeItem("procesosSO");

        actualizarTabla();
    }
}


// ==========================================
// CONFIGURACIÓN DEL SO
// ==========================================

let configuracionSO = JSON.parse(
    localStorage.getItem("configuracionSO")
) || {
    quantum: 2,
    paginasVirtuales: 8,
    marcosFisicos: 3,
    espacioDisco: 16,
    algoritmoPredeterminado: "FIFO"
};

function renderizarTablaPaginas() {
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



function guardarConfiguracion() {

    configuracionSO.quantum =
        Number(document.getElementById("quantum").value);

    configuracionSO.paginasVirtuales =
        Number(document.getElementById("paginasVirtuales").value);

    configuracionSO.marcosFisicos =
        Number(document.getElementById("marcosFisicos").value);

    configuracionSO.espacioDisco =
        Number(document.getElementById("espacioDisco").value);

    configuracionSO.algoritmoPredeterminado =
        document.getElementById("algoritmoPredeterminadoMMU").value;

    localStorage.setItem(
        "configuracionSO",
        JSON.stringify(configuracionSO)
    );

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

// Cargar la última configuración guardada
const quantumInput = document.getElementById("quantum");
const paginasInput = document.getElementById("paginasVirtuales");
const marcosInput = document.getElementById("marcosFisicos");

if (quantumInput) {
    quantumInput.value = configuracionSO.quantum;
}

if (paginasInput) {
    paginasInput.value = configuracionSO.paginasVirtuales;
}

if (marcosInput) {
    marcosInput.value = configuracionSO.marcosFisicos;
}

// ==========================================
// PLANIFICADOR
// ==========================================

function ejecutarPlanificador() {

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

function mostrarResultadoPrioridad(resultadoPlan) {

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

function mostrarResultadoSorteo(resultadoPlan) {

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

function mostrarResultadoRoundRobin(
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

function mostrarResultadoPlanificacion(
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

function ejecutarMMU() {

    const algoritmo =
        document.getElementById("algoritmoMMU").value;

    const resultado =
        document.getElementById("resultadoMMU");


    const procesos = obtenerListaProcesos();

    // ==========================================
    // VERIFICAR PROCESOS
    // ==========================================

    if (procesos.length === 0) {

        resultado.innerHTML = `
            <p class="mensaje-error">
                Primero debe agregar procesos.
            </p>
        `;

        return;
    }


    // ==========================================
    // OBTENER CANTIDAD DE MARCOS
    // ==========================================

    const cantidadMarcos =
        configuracionSO.marcosFisicos;


    if (!cantidadMarcos || cantidadMarcos <= 0) {

        resultado.innerHTML = `
            <p class="mensaje-error">
                Configure primero la cantidad de marcos físicos.
            </p>
        `;

        return;
    }


// ==========================================
// GENERAR REFERENCIAS DESDE EL PLANIFICADOR
// ==========================================

let referencias = [];


if (ultimaSecuenciaEjecucion.length === 0) {

    resultado.innerHTML = `

        <p class="mensaje-error">

            Primero debe ejecutar un algoritmo
            de planificación.

        </p>

    `;

    return;
}


ultimaSecuenciaEjecucion.forEach(idProceso => {
    let digitos = idProceso.replace(/\D/g, "");
    let numeroPagina = digitos !== "" ? parseInt(digitos) : (idProceso.charCodeAt(0) % configuracionSO.paginasVirtuales) + 1;
    referencias.push(numeroPagina);
});

    if (algoritmo === "FIFO") {

        ejecutarFIFO(
            referencias,
            cantidadMarcos,
            resultado
        );

        return;
    }
    else if (algoritmo === "LRU") {

        ejecutarLRU(
            referencias,
            cantidadMarcos,
            resultado
        );

        return;
    }
    else if (algoritmo === "OPTIMO") {

        ejecutarOptimo(
            referencias,
            cantidadMarcos,
            resultado
        );

        return;
    }
    else if (algoritmo === "CLOCK") {

        ejecutarClock(
            referencias,
            cantidadMarcos,
            resultado
        );

        return;
    }
    else if (algoritmo === "SEGUNDA_OPORTUNIDAD") {

        ejecutarSegundaOportunidad(
            referencias,
            cantidadMarcos,
            resultado
        );

        return;
    }
    else if (algoritmo === "MRU") {

        ejecutarMRU(
            referencias,
            cantidadMarcos,
            resultado
        );

        return;
    }
    else if (algoritmo === "LFU") {

        ejecutarLFU(
            referencias,
            cantidadMarcos,
            resultado
        );

        return;
    }

}
// ==========================================
// ALGORITMO FIFO
// ==========================================

function mostrarResultadoMMU(
    resultado,
    nombreAlgoritmo,
    referencias,
    cantidadMarcos,
    pasos,
    aciertos,
    fallos
) {
    const totalReferencias = referencias.length;
    const porcentajeAciertos = totalReferencias > 0 ? (aciertos / totalReferencias) * 100 : 0;
    const porcentajeFallos = totalReferencias > 0 ? (fallos / totalReferencias) * 100 : 0;

    let html = `
        <h3>Simulación MMU - ${nombreAlgoritmo}</h3>

        <p>
            <strong>Referencias de página:</strong>
            ${referencias.join(" → ")}
        </p>

        <h3>Matriz Paso a Paso (Intercambio entre Página y Marco)</h3>

        <div class="tabla-mmu-contenedor">
            <table class="tabla-mmu-horizontal">
                <tbody>
                    <tr>
                        <th class="encabezado-fila">REFERENCIA</th>
    `;

    pasos.forEach(paso => {
        html += `<td class="celda-referencia">${paso.pagina}</td>`;
    });

    html += `</tr>`;

    for (let m = 0; m < cantidadMarcos; m++) {
        html += `
            <tr>
                <th class="encabezado-fila">MARCO ${m + 1}</th>
        `;

        pasos.forEach(paso => {
            const valor = paso.marcos[m];
            html += `<td>${valor !== null ? valor : ""}</td>`;
        });

        html += `</tr>`;
    }

    html += `
        <tr>
            <th class="encabezado-fila">FALLOS</th>
    `;

    pasos.forEach(paso => {
        const esFallo = paso.resultado === "Fallo de página";
        const claseStatus = esFallo ? "fallo-simbolo" : "hit-simbolo";
        const textoStatus = esFallo ? "X" : "—";
        html += `<td class="${claseStatus}">${textoStatus}</td>`;
    });

    html += `
                </tr>
            </tbody>
        </table>
        </div>

        <h3>Rendimiento de la MMU</h3>

        <div class="estadisticas-mmu">
            <p>Total de referencias: <strong>${totalReferencias}</strong></p>
            <p>Aciertos: <strong>${aciertos}</strong></p>
            <p>Fallos de página: <strong>${fallos}</strong></p>
            <p>Tasa de aciertos: <strong>${porcentajeAciertos.toFixed(2)}%</strong></p>
            <p>Tasa de fallos: <strong>${porcentajeFallos.toFixed(2)}%</strong></p>
        </div>
    `;

    resultado.innerHTML = html;
}

function ejecutarFIFO(
    referencias,
    cantidadMarcos,
    resultado
) {
    let marcos = new Array(cantidadMarcos).fill(null);
    let colaFIFO = [];
    let aciertos = 0;
    let fallos = 0;
    let pasos = [];

    referencias.forEach((pagina, indice) => {
        const posicion = marcos.indexOf(pagina);

        if (posicion !== -1) {
            aciertos++;
            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Acierto",
                marcos: [...marcos]
            });
        } else {
            fallos++;
            const marcoVacio = marcos.indexOf(null);

            if (marcoVacio !== -1) {
                marcos[marcoVacio] = pagina;
                colaFIFO.push(pagina);
            } else {
                const paginaSalida = colaFIFO.shift();
                const posicionSalida = marcos.indexOf(paginaSalida);
                marcos[posicionSalida] = pagina;
                colaFIFO.push(pagina);
            }

            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Fallo de página",
                marcos: [...marcos]
            });
        }
    });

    mostrarResultadoMMU(
        resultado,
        "FIFO",
        referencias,
        cantidadMarcos,
        pasos,
        aciertos,
        fallos
    );
}
// ================================================
// ALGORITMO LRU
// ================================================

function ejecutarLRU(
    referencias,
    cantidadMarcos,
    resultado
) {

    // Marcos físicos inicialmente vacíos
    let marcos = new Array(cantidadMarcos).fill(null);

    // Guarda el orden de uso de las páginas
    let ordenUso = [];

    // Contadores
    let aciertos = 0;
    let fallos = 0;

    // Guardar los pasos de la simulación
    let pasos = [];

    // ================================================
    // PROCESAR REFERENCIAS
    // ================================================

    referencias.forEach((pagina, indice) => {

        // Buscar la página en los marcos
        const posicion = marcos.indexOf(pagina);

        // ============================================
        // ACIERTO
        // ============================================

        if (posicion !== -1) {

            aciertos++;

            // La página acaba de utilizarse,
            // por lo tanto pasa a ser la más reciente
            ordenUso = ordenUso.filter(
                p => p !== pagina
            );

            ordenUso.push(pagina);

            // Guardar paso
            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Acierto",
                marcos: [...marcos]
            });

        }

        // ============================================
        // FALLO DE PÁGINA
        // ============================================

        else {

            fallos++;

            // Buscar marco vacío
            const marcoVacio =
                marcos.indexOf(null);

            // ========================================
            // TODAVÍA HAY ESPACIO
            // ========================================

            if (marcoVacio !== -1) {

                marcos[marcoVacio] = pagina;

            }

            // ========================================
            // MEMORIA LLENA
            // ========================================

            else {

                // El primer elemento de ordenUso
                // es el menos recientemente utilizado
                const paginaSalida =
                    ordenUso.shift();

                // Buscar su marco
                const posicionSalida =
                    marcos.indexOf(paginaSalida);

                // Reemplazar
                marcos[posicionSalida] = pagina;
            }

            // La nueva página pasa a ser
            // la más recientemente utilizada
            ordenUso.push(pagina);

            // Guardar paso
            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Fallo de página",
                marcos: [...marcos]
            });

        }

    });

    mostrarResultadoMMU(
        resultado,
        "LRU",
        referencias,
        cantidadMarcos,
        pasos,
        aciertos,
        fallos
    );
}
// ================================================
// ALGORITMO LFU
// ================================================

function ejecutarLFU(
    referencias,
    cantidadMarcos,
    resultado
) {

    // Marcos físicos inicialmente vacíos
    let marcos = new Array(cantidadMarcos).fill(null);

    // Contador de frecuencia de cada página
    let frecuencias = {};

    // Orden de llegada para desempatar
    let ordenLlegada = [];

    // Contadores
    let aciertos = 0;
    let fallos = 0;

    // Guardar los pasos
    let pasos = [];

    // ================================================
    // PROCESAR REFERENCIAS
    // ================================================

    referencias.forEach((pagina, indice) => {

        // Si la página todavía no tiene contador
        if (frecuencias[pagina] === undefined) {
            frecuencias[pagina] = 0;
        }

        // Buscar la página en los marcos
        const posicion = marcos.indexOf(pagina);

        // ============================================
        // ACIERTO
        // ============================================

        if (posicion !== -1) {

            aciertos++;

            // Aumentar frecuencia
            frecuencias[pagina]++;

            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Acierto",
                marcos: [...marcos]
            });

        }

        // ============================================
        // FALLO DE PÁGINA
        // ============================================

        else {

            fallos++;

            // Aumentar frecuencia porque la página
            // acaba de ser cargada
            frecuencias[pagina]++;

            // Buscar marco vacío
            const marcoVacio = marcos.indexOf(null);

            if (marcoVacio !== -1) {

                // Todavía hay espacio
                marcos[marcoVacio] = pagina;

                ordenLlegada.push(pagina);

            }

            else {

                // ========================================
                // MEMORIA LLENA
                // ========================================

                // Buscar la página con menor frecuencia
                let paginaSalida = marcos[0];

                for (let i = 1; i < marcos.length; i++) {

                    const paginaActual = marcos[i];

                    if (
                        frecuencias[paginaActual] <
                        frecuencias[paginaSalida]
                    ) {

                        paginaSalida = paginaActual;

                    }
                    else if (
                        frecuencias[paginaActual] ===
                        frecuencias[paginaSalida]
                    ) {

                        // Desempate: sale la que llegó primero
                        const posicionActual =
                            ordenLlegada.indexOf(paginaActual);

                        const posicionSalida =
                            ordenLlegada.indexOf(paginaSalida);

                        if (
                            posicionActual < posicionSalida
                        ) {

                            paginaSalida = paginaActual;

                        }
                    }
                }

                // Buscar el marco de la página que sale
                const posicionSalida =
                    marcos.indexOf(paginaSalida);

                // Reemplazar
                marcos[posicionSalida] = pagina;

                // Actualizar orden de llegada
                ordenLlegada =
                    ordenLlegada.filter(
                        p => p !== pagina
                    );

                ordenLlegada.push(pagina);
            }

            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Fallo de página",
                marcos: [...marcos]
            });
        }
    });

    mostrarResultadoMMU(
        resultado,
        "LFU",
        referencias,
        cantidadMarcos,
        pasos,
        aciertos,
        fallos
    );
}
// ============================================
// ALGORITMO CLOCK (RELOJ)
// ============================================

function ejecutarClock(
    referencias,
    cantidadMarcos,
    resultado
) {
    let marcos = new Array(cantidadMarcos).fill(null);
    let bitsUso = new Array(cantidadMarcos).fill(0);
    let puntero = 0;
    let aciertos = 0;
    let fallos = 0;
    let pasos = [];

    referencias.forEach((pagina, indice) => {
        const posicion = marcos.indexOf(pagina);

        if (posicion !== -1) {
            aciertos++;
            bitsUso[posicion] = 1;
            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Acierto",
                marcos: [...marcos]
            });
        } else {
            fallos++;
            const marcoVacio = marcos.indexOf(null);

            if (marcoVacio !== -1) {
                marcos[marcoVacio] = pagina;
                bitsUso[marcoVacio] = 1;
                puntero = (marcoVacio + 1) % cantidadMarcos;
            } else {
                while (true) {
                    if (bitsUso[puntero] === 0) {
                        marcos[puntero] = pagina;
                        bitsUso[puntero] = 1;
                        puntero = (puntero + 1) % cantidadMarcos;
                        break;
                    } else {
                        bitsUso[puntero] = 0;
                        puntero = (puntero + 1) % cantidadMarcos;
                    }
                }
            }

            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Fallo de página",
                marcos: [...marcos]
            });
        }
    });

    mostrarResultadoMMU(
        resultado,
        "Clock (Reloj)",
        referencias,
        cantidadMarcos,
        pasos,
        aciertos,
        fallos
    );
}

// ============================================
// ALGORITMO SEGUNDA OPORTUNIDAD
// ============================================

function ejecutarSegundaOportunidad(
    referencias,
    cantidadMarcos,
    resultado
) {
    let marcos = new Array(cantidadMarcos).fill(null);
    let cola = [];
    let bitsUso = {};
    let aciertos = 0;
    let fallos = 0;
    let pasos = [];

    referencias.forEach((pagina, indice) => {
        const posicion = marcos.indexOf(pagina);

        if (posicion !== -1) {
            aciertos++;
            bitsUso[pagina] = 1;
            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Acierto",
                marcos: [...marcos]
            });
        } else {
            fallos++;
            const marcoVacio = marcos.indexOf(null);

            if (marcoVacio !== -1) {
                marcos[marcoVacio] = pagina;
                cola.push(pagina);
                bitsUso[pagina] = 0;
            } else {
                while (true) {
                    const candidato = cola.shift();
                    if (bitsUso[candidato] === 1) {
                        bitsUso[candidato] = 0;
                        cola.push(candidato);
                    } else {
                        const posicionSalida = marcos.indexOf(candidato);
                        marcos[posicionSalida] = pagina;
                        cola.push(pagina);
                        bitsUso[pagina] = 0;
                        delete bitsUso[candidato];
                        break;
                    }
                }
            }

            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Fallo de página",
                marcos: [...marcos]
            });
        }
    });

    mostrarResultadoMMU(
        resultado,
        "Segunda Oportunidad",
        referencias,
        cantidadMarcos,
        pasos,
        aciertos,
        fallos
    );
}

// ============================================
// ALGORITMO MRU (MÁS RECIENTEMENTE USADO)
// ============================================

function ejecutarMRU(
    referencias,
    cantidadMarcos,
    resultado
) {
    let marcos = new Array(cantidadMarcos).fill(null);
    let ultimoUso = null;
    let aciertos = 0;
    let fallos = 0;
    let pasos = [];

    referencias.forEach((pagina, indice) => {
        const posicion = marcos.indexOf(pagina);

        if (posicion !== -1) {
            aciertos++;
            ultimoUso = pagina;
            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Acierto",
                marcos: [...marcos]
            });
        } else {
            fallos++;
            const marcoVacio = marcos.indexOf(null);

            if (marcoVacio !== -1) {
                marcos[marcoVacio] = pagina;
            } else {
                const posicionReemplazo = marcos.indexOf(ultimoUso);
                if (posicionReemplazo !== -1) {
                    marcos[posicionReemplazo] = pagina;
                } else {
                    marcos[0] = pagina;
                }
            }

            ultimoUso = pagina;
            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Fallo de página",
                marcos: [...marcos]
            });
        }
    });

    mostrarResultadoMMU(
        resultado,
        "MRU (Más Recientemente Usado)",
        referencias,
        cantidadMarcos,
        pasos,
        aciertos,
        fallos
    );
}

// ============================================
// ALGORITMO ÓPTIMO
// ============================================

function ejecutarOptimo(
    referencias,
    cantidadMarcos,
    resultado
) {

    // Marcos físicos inicialmente vacíos
    let marcos =
        new Array(cantidadMarcos).fill(null);

    // Contadores
    let aciertos = 0;
    let fallos = 0;

    // Guardar los pasos de la simulación
    let pasos = [];

    // ============================================
    // PROCESAR REFERENCIAS
    // ============================================

    referencias.forEach(
        (pagina, indice) => {

            // Buscar si la página ya está en memoria
            const posicion =
                marcos.indexOf(pagina);

            // ========================================
            // ACIERTO
            // ========================================

            if (posicion !== -1) {

                aciertos++;

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Acierto",
                    marcos: [...marcos]
                });

            }

            // ========================================
            // FALLO DE PÁGINA
            // ========================================

            else {

                fallos++;

                // Buscar un marco vacío
                const marcoVacio =
                    marcos.indexOf(null);

                // ====================================
                // TODAVÍA HAY ESPACIO
                // ====================================

                if (marcoVacio !== -1) {

                    marcos[marcoVacio] =
                        pagina;

                }

                // ====================================
                // MEMORIA LLENA
                // ====================================

                else {

                    let posicionReemplazo = 0;
                    let mayorDistancia = -1;

                    // Analizar cada página que está
                    // actualmente en memoria
                    for (
                        let i = 0;
                        i < marcos.length;
                        i++
                    ) {

                        const paginaEnMarco =
                            marcos[i];

                        // Buscar cuándo volverá a utilizarse
                        const siguienteUso =
                            referencias
                                .slice(indice + 1)
                                .indexOf(paginaEnMarco);

                        // Si nunca vuelve a utilizarse,
                        // es la mejor candidata para reemplazar
                        if (siguienteUso === -1) {

                            posicionReemplazo = i;
                            break;
                        }

                        // Guardar la página cuyo próximo
                        // uso está más lejos
                        if (
                            siguienteUso >
                            mayorDistancia
                        ) {

                            mayorDistancia =
                                siguienteUso;

                            posicionReemplazo = i;
                        }
                    }

                    // Reemplazar la página seleccionada
                    marcos[posicionReemplazo] =
                        pagina;
                }

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos]
                });
            }
        }
    );

    mostrarResultadoMMU(
        resultado,
        "Óptimo",
        referencias,
        cantidadMarcos,
        pasos,
        aciertos,
        fallos
    );
}
// ==========================================
// SALIR
// ==========================================

function salir() {

    alert(
        "Gracias por utilizar el Simulador de Sistema Operativo.");
        window.close();
    }