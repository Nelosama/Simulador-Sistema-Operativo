export class Nodo {
    constructor(proceso) {
        this.proceso = proceso;
        this.siguiente = null;
    }
}

export class ListaEnlazada {
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
