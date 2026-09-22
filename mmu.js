import { obtenerListaProcesos, ultimaSecuenciaEjecucion, ultimosProcesosEjecutados, configuracionSO, guardarResultadoMMU, ultimoResultadoPlan } from "./estado.js";

export function ejecutarMMU() {

    const algoritmo =
        document.getElementById("algoritmoMMU").value;

    const resultado =
        document.getElementById("resultadoMMU");


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


    let referencias = [];

    const elementoManual = document.getElementById("modoManualMMU");
    const esModoManual = elementoManual ? elementoManual.checked : false;

    if (esModoManual) {
        const elementoTexto = document.getElementById("referenciasManualMMU");
        const textoManual = elementoTexto ? elementoTexto.value : "";
        const tokensManuales = textoManual
            .split(",")
            .map(t => t.trim().toUpperCase())
            .filter(t => t.length > 0);

        const patronValido = /^[A-Z]([0-9]+|T)$/;
        const esValido = tokensManuales.length > 0 && tokensManuales.every(t => patronValido.test(t));

        if (!esValido) {
            resultado.innerHTML = `
                <p class="mensaje-error">
                    Ingrese referencias válidas en el formato correcto (ejemplo: A0, B8, AT).
                </p>
            `;
            return;
        }

        referencias = tokensManuales;
    } else {
        const procesos = obtenerListaProcesos();

        if (procesos.length === 0) {

            resultado.innerHTML = `
                <p class="mensaje-error">
                    Primero debe agregar procesos.
                </p>
            `;

            return;
        }

        if (ultimaSecuenciaEjecucion.length === 0) {

            resultado.innerHTML = `

                <p class="mensaje-error">

                    Primero debe ejecutar un algoritmo
                    de planificación.

                </p>

            `;

            return;
        }


        const listaProcesosUso = (ultimosProcesosEjecutados && ultimosProcesosEjecutados.length > 0)
            ? ultimosProcesosEjecutados
            : procesos;

        const mapaProcesos = {};
        listaProcesosUso.forEach(p => {
            mapaProcesos[p.id] = p;
        });

        let contadorPaginaGlobal = 1;
        const paginasPorProceso = {};

        listaProcesosUso.forEach(p => {
            const cantidadPaginas = p.paginasRequeridas || 1;
            const listaPaginasProc = [];
            for (let k = 0; k < cantidadPaginas; k++) {
                let pagAsignada = ((contadorPaginaGlobal - 1) % configuracionSO.paginasVirtuales) + 1;
                listaPaginasProc.push(pagAsignada);
                contadorPaginaGlobal++;
            }
            paginasPorProceso[p.id] = listaPaginasProc;
        });

        ultimaSecuenciaEjecucion.forEach(idProceso => {
            const paginasAsignadas = paginasPorProceso[idProceso];
            if (paginasAsignadas && paginasAsignadas.length > 0) {
                paginasAsignadas.forEach(numPagina => {
                    referencias.push(numPagina);
                });
            } else {
                const proc = mapaProcesos[idProceso];
                const cantidadPaginas = proc && proc.paginasRequeridas ? proc.paginasRequeridas : 1;
                for (let k = 1; k <= cantidadPaginas; k++) {
                    let numPagina = ((k - 1) % configuracionSO.paginasVirtuales) + 1;
                    referencias.push(numPagina);
                }
            }
        });
    }

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
    else if (algoritmo === "NRU") {

        ejecutarNRU(
            referencias,
            cantidadMarcos,
            resultado
        );

        return;
    }

}

export function mostrarResultadoMMU(
    resultado,
    nombreAlgoritmo,
    referencias,
    cantidadMarcos,
    pasos,
    aciertos,
    fallos
) {
    guardarResultadoMMU({
        nombreAlgoritmo,
        referencias,
        cantidadMarcos,
        pasos,
        aciertos,
        fallos
    });

    const totalReferencias = referencias.length;
    const porcentajeAciertos = totalReferencias > 0 ? (aciertos / totalReferencias) * 100 : 0;
    const porcentajeFallos = totalReferencias > 0 ? (fallos / totalReferencias) * 100 : 0;

    let html = `
        <div class="panel-simulacion">
            <h3>Simulación MMU - ${nombreAlgoritmo}</h3>

            <p>
                <strong>Referencias de página:</strong>
                <span class="dato-mono">${referencias.join(" → ")}</span>
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
            let claseCelda = "dato-mono";
            let tooltipCelda = paso.motivo || `Paso ${paso.turno}: Página ${paso.pagina}`;

            if (paso.marcoModificado === m) {
                if (paso.tipoCambio === "reemplazo") {
                    claseCelda += " celda-reemplazada";
                } else if (paso.tipoCambio === "carga") {
                    claseCelda += " celda-cargada";
                } else if (paso.tipoCambio === "hit") {
                    claseCelda += " celda-hit";
                }
            }

            html += `<td class="${claseCelda}" title="${tooltipCelda}">${valor !== null ? valor : ""}</td>`;
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

            <details class="detalle-ejecucion" style="margin-top: 24px;">
                <summary>Ver criterio de reemplazo paso a paso</summary>
                <div class="detalle-contenido">
                    <ul class="lista-criterio-pasos">
    `;

    pasos.forEach((paso) => {
        const esFallo = paso.resultado === "Fallo de página";
        const badgeClase = esFallo ? "badge-fallo" : "badge-acierto";
        html += `
            <li class="item-criterio-paso">
                <div class="encabezado-paso">
                    <span class="paso-num dato-mono">Turno ${paso.turno}</span>
                    <span class="paso-ref dato-mono">Ref: Página ${paso.pagina}</span>
                    <span class="${badgeClase}">${paso.resultado}</span>
                </div>
                <div class="paso-motivo">${paso.motivo}</div>
            </li>
        `;
    });

    html += `
                    </ul>
                </div>
            </details>
        </div>
    `;

    resultado.innerHTML = html;
}

export function ejecutarFIFO(
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
                marcos: [...marcos],
                marcoModificado: posicion,
                tipoCambio: "hit",
                motivo: `Página ${pagina} ya presente en el marco ${posicion + 1} (Acierto).`
            });
        } else {
            fallos++;
            const marcoVacio = marcos.indexOf(null);

            if (marcoVacio !== -1) {
                marcos[marcoVacio] = pagina;
                colaFIFO.push(pagina);
                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: marcoVacio,
                    tipoCambio: "carga",
                    colaPrevia: [...colaFIFO],
                    motivo: `Fallo de página. Marco ${marcoVacio + 1} estaba libre; se asigna la página ${pagina}.`
                });
            } else {
                const colaVigente = [...colaFIFO];
                const paginaSalida = colaFIFO.shift();
                const posicionSalida = marcos.indexOf(paginaSalida);
                marcos[posicionSalida] = pagina;
                colaFIFO.push(pagina);

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: posicionSalida,
                    tipoCambio: "reemplazo",
                    paginaSalida: paginaSalida,
                    paginaEntrante: pagina,
                    colaPrevia: colaVigente,
                    motivo: `Cola de llegada (FIFO): [${colaVigente.join(", ")}]; la próxima en salir es la página ${paginaSalida}. Se reemplaza en el marco ${posicionSalida + 1} por la página ${pagina}.`
                });
            }
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

// Esta función implementa la interpretación del criterio de clasificación NRU explicado en clase.
//
// Estado por página residente:
// - recienCargada: true solo para la página cargada en el ÚLTIMO fallo resuelto.
// - fueReferenciada: true si la página recibió al menos un acierto (hit) desde que fue cargada.
//
// Clasificación al reemplazar:
// - Clase 3: recienCargada === true
// - Clase 2: recienCargada === false && fueReferenciada === true
// - Clase 0: recienCargada === false && fueReferenciada === false
// - Clase 1: NO SE USA en esta implementación (queda sin definir por falta de aclaración del criterio de terminación).
export function ejecutarNRU(
    referencias,
    cantidadMarcos,
    resultado
) {
    let marcos = new Array(cantidadMarcos).fill(null);
    let cola = [];
    let recienCargada = {};
    let fueReferenciada = {};
    let aciertos = 0;
    let fallos = 0;
    let pasos = [];

    referencias.forEach((token, indice) => {
        const esTerminacion = /^[A-Z]T$/.test(token);

        if (esTerminacion) {
            const idProceso = token.slice(0, -1);
            let paginasLiberadas = [];

            marcos.forEach((p, idx) => {
                if (p !== null && p.startsWith(idProceso)) {
                    paginasLiberadas.push(p);
                    marcos[idx] = null;
                }
            });

            cola = cola.filter(p => !paginasLiberadas.includes(p));
            paginasLiberadas.forEach(p => {
                delete recienCargada[p];
                delete fueReferenciada[p];
            });

            pasos.push({
                turno: indice + 1,
                pagina: token,
                resultado: "Terminación",
                marcos: [...marcos],
                marcoModificado: -1,
                tipoCambio: "normal",
                motivo: `Finaliza proceso ${idProceso} (${token}). Se liberan los marcos ocupados por sus páginas.`
            });
            return;
        }

        const pagina = token;
        const posicion = marcos.indexOf(pagina);

        if (posicion !== -1) {
            aciertos++;
            fueReferenciada[pagina] = true;

            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Acierto",
                marcos: [...marcos],
                marcoModificado: posicion,
                tipoCambio: "hit",
                recienCargada: { ...recienCargada },
                fueReferenciada: { ...fueReferenciada },
                motivo: `Página ${pagina} ya presente en el marco ${posicion + 1} (Acierto). fueReferenciada puesta en true.`
            });
        } else {
            fallos++;
            const marcoVacio = marcos.indexOf(null);

            if (marcoVacio !== -1) {
                marcos[marcoVacio] = pagina;
                cola.push(pagina);

                marcos.forEach(p => {
                    if (p !== null) {
                        recienCargada[p] = false;
                    }
                });
                recienCargada[pagina] = true;
                fueReferenciada[pagina] = false;

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: marcoVacio,
                    tipoCambio: "carga",
                    recienCargada: { ...recienCargada },
                    fueReferenciada: { ...fueReferenciada },
                    motivo: `Fallo de página. Marco ${marcoVacio + 1} estaba libre; se asigna página ${pagina} (reciénCargada=true, fueReferenciada=false).`
                });
            } else {
                const clasesEvaluadas = marcos.map(p => {
                    let clase;
                    if (recienCargada[p] === true) {
                        clase = 3;
                    } else if (fueReferenciada[p] === true) {
                        clase = 2;
                    } else {
                        clase = 0;
                    }
                    return {
                        pagina: p,
                        clase: clase
                    };
                });

                let claseSeleccionada = 3;
                if (clasesEvaluadas.some(c => c.clase === 0)) {
                    claseSeleccionada = 0;
                } else if (clasesEvaluadas.some(c => c.clase === 2)) {
                    claseSeleccionada = 2;
                }

                const candidatos = clasesEvaluadas.filter(c => c.clase === claseSeleccionada);

                let candidatoSalida = null;
                for (let p of cola) {
                    if (candidatos.some(c => c.pagina === p)) {
                        candidatoSalida = p;
                        break;
                    }
                }

                if (candidatoSalida === null) {
                    candidatoSalida = candidatos[0].pagina;
                }

                const hayEmpate = candidatos.length > 1;
                const posicionSalida = marcos.indexOf(candidatoSalida);

                marcos[posicionSalida] = pagina;
                cola = cola.filter(p => p !== candidatoSalida);
                cola.push(pagina);

                delete recienCargada[candidatoSalida];
                delete fueReferenciada[candidatoSalida];

                marcos.forEach(p => {
                    if (p !== null) {
                        recienCargada[p] = false;
                    }
                });
                recienCargada[pagina] = true;
                fueReferenciada[pagina] = false;

                let motivoText = `Clases residentes: ${clasesEvaluadas.map(c => `Pág ${c.pagina}: Clase ${c.clase}`).join(", ")}. `;
                motivoText += `Clase más baja no vacía: Clase ${claseSeleccionada}. `;
                motivoText += `Se reemplaza la página ${candidatoSalida}`;
                if (hayEmpate) {
                    motivoText += ` [desempate por antigüedad en memoria]`;
                }
                motivoText += ` en el marco ${posicionSalida + 1} por la página ${pagina}.`;

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: posicionSalida,
                    tipoCambio: "reemplazo",
                    paginaSalida: candidatoSalida,
                    paginaEntrante: pagina,
                    recienCargada: { ...recienCargada },
                    fueReferenciada: { ...fueReferenciada },
                    clasesEvaluadas: clasesEvaluadas,
                    motivo: motivoText
                });
            }
        }
    });

    mostrarResultadoMMU(
        resultado,
        "NRU (Criterio de Clase)",
        referencias,
        cantidadMarcos,
        pasos,
        aciertos,
        fallos
    );
}

export function ejecutarLRU(
    referencias,
    cantidadMarcos,
    resultado
) {
    let marcos = new Array(cantidadMarcos).fill(null);
    let ordenUso = [];
    let aciertos = 0;
    let fallos = 0;
    let pasos = [];

    referencias.forEach((pagina, indice) => {
        const posicion = marcos.indexOf(pagina);

        if (posicion !== -1) {
            aciertos++;
            ordenUso = ordenUso.filter(p => p !== pagina);
            ordenUso.push(pagina);

            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Acierto",
                marcos: [...marcos],
                marcoModificado: posicion,
                tipoCambio: "hit",
                ordenUsoActual: [...ordenUso],
                motivo: `Página ${pagina} ya presente en el marco ${posicion + 1} (Acierto). Se actualiza orden de uso.`
            });
        } else {
            fallos++;
            const marcoVacio = marcos.indexOf(null);

            if (marcoVacio !== -1) {
                marcos[marcoVacio] = pagina;
                ordenUso.push(pagina);

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: marcoVacio,
                    tipoCambio: "carga",
                    ordenUsoActual: [...ordenUso],
                    motivo: `Fallo de página. Marco ${marcoVacio + 1} estaba libre; se asigna la página ${pagina}.`
                });
            } else {
                const ordenPrevio = [...ordenUso];
                const paginaSalida = ordenUso.shift();
                const posicionSalida = marcos.indexOf(paginaSalida);
                marcos[posicionSalida] = pagina;
                ordenUso.push(pagina);

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: posicionSalida,
                    tipoCambio: "reemplazo",
                    paginaSalida: paginaSalida,
                    paginaEntrante: pagina,
                    ordenUsoPrevio: ordenPrevio,
                    ordenUsoActual: [...ordenUso],
                    motivo: `Orden de uso (menos→más reciente): [${ordenPrevio.join(", ")}]; se reemplaza la página ${paginaSalida} por ser la menos usada recientemente (marco ${posicionSalida + 1}) por la página ${pagina}.`
                });
            }
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

export function ejecutarLFU(
    referencias,
    cantidadMarcos,
    resultado
) {
    let marcos = new Array(cantidadMarcos).fill(null);
    let frecuencias = {};
    let ordenLlegada = [];
    let aciertos = 0;
    let fallos = 0;
    let pasos = [];

    referencias.forEach((pagina, indice) => {
        if (frecuencias[pagina] === undefined) {
            frecuencias[pagina] = 0;
        }

        const posicion = marcos.indexOf(pagina);

        if (posicion !== -1) {
            aciertos++;
            frecuencias[pagina]++;

            pasos.push({
                turno: indice + 1,
                pagina: pagina,
                resultado: "Acierto",
                marcos: [...marcos],
                marcoModificado: posicion,
                tipoCambio: "hit",
                frecuencias: { ...frecuencias },
                motivo: `Página ${pagina} ya presente en el marco ${posicion + 1} (Acierto). Frecuencia aumentada a ${frecuencias[pagina]}.`
            });
        } else {
            fallos++;
            frecuencias[pagina]++;

            const marcoVacio = marcos.indexOf(null);

            if (marcoVacio !== -1) {
                marcos[marcoVacio] = pagina;
                ordenLlegada.push(pagina);

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: marcoVacio,
                    tipoCambio: "carga",
                    frecuencias: { ...frecuencias },
                    motivo: `Fallo de página. Marco ${marcoVacio + 1} estaba libre; se asigna la página ${pagina}.`
                });
            } else {
                let tablaFrecuenciasResidentes = marcos.map(p => ({
                    pagina: p,
                    frecuencia: frecuencias[p],
                    posicionOrden: ordenLlegada.indexOf(p)
                }));

                let paginaSalida = marcos[0];
                let hayEmpate = false;

                for (let i = 1; i < marcos.length; i++) {
                    const paginaActual = marcos[i];

                    if (frecuencias[paginaActual] < frecuencias[paginaSalida]) {
                        paginaSalida = paginaActual;
                        hayEmpate = false;
                    } else if (frecuencias[paginaActual] === frecuencias[paginaSalida]) {
                        hayEmpate = true;
                        const posicionActual = ordenLlegada.indexOf(paginaActual);
                        const posicionSalida = ordenLlegada.indexOf(paginaSalida);

                        if (posicionActual < posicionSalida) {
                            paginaSalida = paginaActual;
                        }
                    }
                }

                const posicionSalida = marcos.indexOf(paginaSalida);
                marcos[posicionSalida] = pagina;
                ordenLlegada = ordenLlegada.filter(p => p !== pagina);
                ordenLlegada.push(pagina);

                let motivoText = `Frecuencias residentes: ${tablaFrecuenciasResidentes.map(f => `Pág ${f.pagina}: ${f.frecuencia}`).join(", ")}. `;
                motivoText += `Se reemplaza la página ${paginaSalida} (frecuencia ${tablaFrecuenciasResidentes.find(f => f.pagina === paginaSalida).frecuencia})`;
                if (hayEmpate) {
                    motivoText += ` [desempate por orden de llegada]`;
                }
                motivoText += ` en el marco ${posicionSalida + 1} por la página ${pagina}.`;

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: posicionSalida,
                    tipoCambio: "reemplazo",
                    paginaSalida: paginaSalida,
                    paginaEntrante: pagina,
                    frecuenciasResidentes: tablaFrecuenciasResidentes,
                    hayEmpate: hayEmpate,
                    motivo: motivoText
                });
            }
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

export function ejecutarClock(
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
                marcos: [...marcos],
                marcoModificado: posicion,
                tipoCambio: "hit",
                bitsUso: [...bitsUso],
                puntero: puntero,
                motivo: `Página ${pagina} ya presente en el marco ${posicion + 1} (Acierto). Bit de uso puesto en 1.`
            });
        } else {
            fallos++;
            const marcoVacio = marcos.indexOf(null);

            if (marcoVacio !== -1) {
                marcos[marcoVacio] = pagina;
                bitsUso[marcoVacio] = 1;
                const marcoAsignado = marcoVacio;
                puntero = (marcoVacio + 1) % cantidadMarcos;

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: marcoAsignado,
                    tipoCambio: "carga",
                    bitsUso: [...bitsUso],
                    puntero: puntero,
                    motivo: `Fallo de página. Marco ${marcoAsignado + 1} estaba libre; se asigna página ${pagina} con bit de uso 1. Puntero avanza a marco ${puntero + 1}.`
                });
            } else {
                let evaluados = [];
                let marcoReemplazado = null;
                let paginaSalida = null;

                while (true) {
                    evaluados.push({
                        marco: puntero,
                        pagina: marcos[puntero],
                        bitAntes: bitsUso[puntero]
                    });

                    if (bitsUso[puntero] === 0) {
                        marcoReemplazado = puntero;
                        paginaSalida = marcos[puntero];
                        marcos[puntero] = pagina;
                        bitsUso[puntero] = 1;
                        puntero = (puntero + 1) % cantidadMarcos;
                        break;
                    } else {
                        bitsUso[puntero] = 0;
                        puntero = (puntero + 1) % cantidadMarcos;
                    }
                }

                let motivoText = `Evaluación del reloj: `;
                motivoText += evaluados.map(ev => {
                    if (ev.bitAntes === 1) {
                        return `marco ${ev.marco + 1} (Pág ${ev.pagina}, bit 1→0, segunda oportunidad)`;
                    } else {
                        return `marco ${ev.marco + 1} (Pág ${ev.pagina}, bit 0 → reemplazada)`;
                    }
                }).join("; ") + `. `;
                motivoText += `Se reemplaza página ${paginaSalida} en marco ${marcoReemplazado + 1} por página ${pagina}. Puntero avanza a marco ${puntero + 1}.`;

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: marcoReemplazado,
                    tipoCambio: "reemplazo",
                    paginaSalida: paginaSalida,
                    paginaEntrante: pagina,
                    bitsUso: [...bitsUso],
                    puntero: puntero,
                    evaluados: evaluados,
                    motivo: motivoText
                });
            }
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

export function ejecutarSegundaOportunidad(
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
                marcos: [...marcos],
                marcoModificado: posicion,
                tipoCambio: "hit",
                bitsUso: { ...bitsUso },
                cola: [...cola],
                motivo: `Página ${pagina} ya presente en el marco ${posicion + 1} (Acierto). Bit de uso puesto en 1.`
            });
        } else {
            fallos++;
            const marcoVacio = marcos.indexOf(null);

            if (marcoVacio !== -1) {
                marcos[marcoVacio] = pagina;
                cola.push(pagina);
                bitsUso[pagina] = 0;

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: marcoVacio,
                    tipoCambio: "carga",
                    bitsUso: { ...bitsUso },
                    cola: [...cola],
                    motivo: `Fallo de página. Marco ${marcoVacio + 1} estaba libre; se asigna página ${pagina} con bit de uso 0.`
                });
            } else {
                let evaluados = [];
                let candidatoSalida = null;
                let posicionSalida = null;

                while (true) {
                    const candidato = cola.shift();
                    const bitAntes = bitsUso[candidato];

                    if (bitAntes === 1) {
                        bitsUso[candidato] = 0;
                        cola.push(candidato);
                        evaluados.push({
                            pagina: candidato,
                            bitAntes: 1,
                            accion: "Segunda oportunidad (bit 1→0, enviada al final de la cola)"
                        });
                    } else {
                        candidatoSalida = candidato;
                        posicionSalida = marcos.indexOf(candidato);
                        marcos[posicionSalida] = pagina;
                        cola.push(pagina);
                        bitsUso[pagina] = 0;
                        delete bitsUso[candidato];
                        evaluados.push({
                            pagina: candidato,
                            bitAntes: 0,
                            accion: "Reemplazada (bit era 0)"
                        });
                        break;
                    }
                }

                let motivoText = `Evaluación Segunda Oportunidad: `;
                motivoText += evaluados.map(ev => `Pág ${ev.pagina}: ${ev.accion}`).join("; ") + `. `;
                motivoText += `Se reemplaza página ${candidatoSalida} en marco ${posicionSalida + 1} por página ${pagina}.`;

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: posicionSalida,
                    tipoCambio: "reemplazo",
                    paginaSalida: candidatoSalida,
                    paginaEntrante: pagina,
                    bitsUso: { ...bitsUso },
                    cola: [...cola],
                    evaluados: evaluados,
                    motivo: motivoText
                });
            }
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

export function ejecutarMRU(
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
                marcos: [...marcos],
                marcoModificado: posicion,
                tipoCambio: "hit",
                ultimoUso: ultimoUso,
                motivo: `Página ${pagina} ya presente en el marco ${posicion + 1} (Acierto). Se actualiza última página usada a ${pagina}.`
            });
        } else {
            fallos++;
            const marcoVacio = marcos.indexOf(null);

            if (marcoVacio !== -1) {
                marcos[marcoVacio] = pagina;
                ultimoUso = pagina;

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: marcoVacio,
                    tipoCambio: "carga",
                    ultimoUso: ultimoUso,
                    motivo: `Fallo de página. Marco ${marcoVacio + 1} estaba libre; se asigna la página ${pagina}.`
                });
            } else {
                const ultimoUsoPrevio = ultimoUso;
                let posicionReemplazo = marcos.indexOf(ultimoUsoPrevio);
                if (posicionReemplazo === -1) {
                    posicionReemplazo = 0;
                }

                const paginaSalida = marcos[posicionReemplazo];
                marcos[posicionReemplazo] = pagina;
                ultimoUso = pagina;

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: posicionReemplazo,
                    tipoCambio: "reemplazo",
                    paginaSalida: paginaSalida,
                    paginaEntrante: pagina,
                    ultimoUsoPrevio: ultimoUsoPrevio,
                    ultimoUso: ultimoUso,
                    motivo: `Última página usada (MRU): página ${ultimoUsoPrevio}. Se reemplaza explícitamente en el marco ${posicionReemplazo + 1} por la nueva página ${pagina}.`
                });
            }
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

export function ejecutarOptimo(
    referencias,
    cantidadMarcos,
    resultado
) {
    let marcos = new Array(cantidadMarcos).fill(null);
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
                marcos: [...marcos],
                marcoModificado: posicion,
                tipoCambio: "hit",
                motivo: `Página ${pagina} ya presente en el marco ${posicion + 1} (Acierto).`
            });
        } else {
            fallos++;
            const marcoVacio = marcos.indexOf(null);

            if (marcoVacio !== -1) {
                marcos[marcoVacio] = pagina;

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: marcoVacio,
                    tipoCambio: "carga",
                    motivo: `Fallo de página. Marco ${marcoVacio + 1} estaba libre; se asigna la página ${pagina}.`
                });
            } else {
                let posicionReemplazo = 0;
                let mayorDistancia = -1;
                let distanciasFuturas = [];

                for (let i = 0; i < marcos.length; i++) {
                    const paginaEnMarco = marcos[i];
                    const siguienteUsoRelativo = referencias.slice(indice + 1).indexOf(paginaEnMarco);

                    if (siguienteUsoRelativo === -1) {
                        distanciasFuturas.push({
                            pagina: paginaEnMarco,
                            marco: i,
                            turnoAbsoluto: null,
                            distancia: Infinity,
                            texto: "nunca más"
                        });
                    } else {
                        const turnoAbsoluto = (indice + 1) + siguienteUsoRelativo + 1;
                        distanciasFuturas.push({
                            pagina: paginaEnMarco,
                            marco: i,
                            turnoAbsoluto: turnoAbsoluto,
                            distancia: siguienteUsoRelativo + 1,
                            texto: `turno ${turnoAbsoluto}`
                        });
                    }
                }

                for (let i = 0; i < distanciasFuturas.length; i++) {
                    const item = distanciasFuturas[i];
                    if (item.distancia === Infinity) {
                        posicionReemplazo = item.marco;
                        break;
                    }
                    if (item.distancia > mayorDistancia) {
                        mayorDistancia = item.distancia;
                        posicionReemplazo = item.marco;
                    }
                }

                const paginaSalida = marcos[posicionReemplazo];
                marcos[posicionReemplazo] = pagina;

                let motivoText = `Distancias futuras: ${distanciasFuturas.map(d => `Pág ${d.pagina} → ${d.texto}`).join(", ")}. `;
                motivoText += `Se reemplaza página ${paginaSalida} en marco ${posicionReemplazo + 1} por ser la de mayor distancia/nunca más por la página ${pagina}.`;

                pasos.push({
                    turno: indice + 1,
                    pagina: pagina,
                    resultado: "Fallo de página",
                    marcos: [...marcos],
                    marcoModificado: posicionReemplazo,
                    tipoCambio: "reemplazo",
                    paginaSalida: paginaSalida,
                    paginaEntrante: pagina,
                    distanciasFuturas: distanciasFuturas,
                    motivo: motivoText
                });
            }
        }
    });

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
