# Simulador de Sistema Operativo

Este proyecto es una aplicación web para simular la planificación de procesos y la administración de memoria en un sistema operativo.

## Requisitos

- Navegador web moderno
- Node.js 18+ recomendado
- npm

## Ejecutar el proyecto

### Opción 1: Servidor local con Node (recomendada)

Desde la raíz del proyecto:

```bash
npm install
npx http-server . -p 8000
```

Luego abre en el navegador:

```text
http://localhost:8000
```

### Opción 2: Usar un servidor estático con Python

Si tienes Python instalado:

```bash
python -m http.server 8000
```

Y luego accede a:

```text
http://localhost:8000
```

## Estructura principal

- `index.html` - página principal
- `main.js` - punto de entrada de la aplicación
- `ui.js` - lógica de la interfaz
- `procesos.js` - gestión de procesos
- `planificadores.js` - lógica de planificación
- `mmu.js` - gestión de memoria y MMU
- `estado.js` - estado general del sistema
- `estructuras.js` - estructuras y datos compartidos
- `estilos.css` - estilos visuales

## Nota importante

Este proyecto está pensado como una app frontend estática, por lo que no necesita un backend ni compilación compleja. La forma más simple de ejecutarlo es levantando un servidor local y abriéndolo desde el navegador.

## Si aparece error de conexión

Asegúrate de que el puerto 8000 esté libre y que el servidor siga corriendo. Si el puerto está ocupado, prueba otro:

```bash
npx http-server . -p 8080
```

Luego abre:

```text
http://localhost:8080
```

## Detener el servidor

En la terminal, presiona:

```bash
Ctrl + C
```
