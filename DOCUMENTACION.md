#  SPACE INVADERS 3D 

##  Índice
1. [Descripción General](#descripción-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Arquitectura del Código](#arquitectura-del-código)
5. [Sistemas del Juego](#sistemas-del-juego)
6. [Controles](#controles)
7. [Mecánicas del Juego](#mecánicas-del-juego)
8. [Instalación y Ejecución](#instalación-y-ejecución)
9. [Personalización](#personalización)

---

## Descripción General

**Space Invaders 3D** es una versión modernizada del clásico juego Space Invaders, recreado en 3D usando A-Frame (WebVR). El juego presenta una experiencia con gráficos en 3D, efectos de sonido, sistema de niveles progresivo y animaciones visuales.

### Características Principales:
- Entorno 3D con A-Frame
- Sistema de 3 niveles con dificultad progresiva
- HUD (interfaz) con puntuación, vidas y nivel
- Sistema de audio
- Bases de defensa destructibles
- Efectos visuales (explosiones, partículas)
- Ambiente espacial con estrellas y asteroides
- Herramientas de debug integradas

---

##  Estructura del Proyecto

```
classic-game-ctrl-z/
│
├── HTMLJuego.html          # Archivo HTML principal
├── audio.js                # Sistema de audio
├── hud.js                  # Sistema de HUD (interfaz)
├── Enemigos.js             # Lógica de enemigos
├── niveles.js              # Sistema de niveles y progresión
├── Nave.js                 # Controlador del jugador
├── stars.js                # Efectos visuales del espacio
├── camara.js               # Control de cámara y transiciones
├── debug.js                # Herramientas de depuración
│
├── sound/                  # Archivos de audio
│   ├── disparo.mp3
│   ├── explocion.mp3
│   ├── life.mp3
│   ├── game_over.mp3
│   ├── pasar_nivel.mp3
│   ├── win.mp3
│   └── fondo.mp3
│
├── models/                 # Modelos 3D (.glb)
│   ├── nave_inimiga.glb
│   ├── nave_espacial_ufo.glb
│   ├── invader_4.glb
│   ├── invader_3.glb
│   └── invader_2.glb
```

---

##  Tecnologías Utilizadas

### Librerías y Frameworks:
- **A-Frame 1.4.2**: Framework de WebVR para crear experiencias 3D
- **THREE.js**: Motor 3D (usado internamente por A-Frame)
- **A-Frame Particle System**: Sistema de partículas para explosiones

### Lenguajes:
- **HTML5**: Estructura de la página
- **CSS3**: Estilos del HUD y UI
- **JavaScript (ES6+)**: Lógica del juego

### Fuentes:
- **Press Start 2P**: Fuente retro de Google Fonts

---

##  Arquitectura del Código

### Orden de Carga de Scripts

```html
<script src="audio.js"></script>      <!-- 1. Sistema de audio -->
<script src="hud.js"></script>        <!-- 2. Sistema de HUD -->
<script src="Enemigos.js"></script>   <!-- 3. Enemigos y UFO -->
<script src="niveles.js"></script>    <!-- 4. Sistema de niveles -->
<script src="Nave.js"></script>       <!-- 5. Jugador y mecánicas -->
<script src="stars.js"></script>      <!-- 6. Efectos visuales -->
<script src="camara.js"></script>     <!-- 7. Control de cámara -->
<script src="debug.js"></script>      <!-- 8. Herramientas debug -->
```

 El orden de carga es crucial porque algunos scripts dependen de funciones definidas en otros.

---

##  Sistemas del Juego

### 1. Sistema de Audio (`audio.js`)

#### Configuración:
```javascript
AUDIO_CONFIG = {
    disparo: { src: 'sound/disparo.mp3', volumen: 0.3 },
    explosion: { src: 'sound/explocion.mp3', volumen: 0.4 },
    vida: { src: 'sound/life.mp3', volumen: 0.5 },
    gameOver: { src: 'sound/game_over.mp3', volumen: 0.6 },
    pasarNivel: { src: 'sound/pasar_nivel.mp3', volumen: 0.5 },
    win: { src: 'sound/win.mp3', volumen: 0.6 },
    musicaFondo: { src: 'sound/fondo.mp3', volumen: 0.2, loop: true }
}
```

#### Funciones Principales:
- `inicializarAudio()`: Precarga todos los sonidos
- `reproducirSonido(nombre)`: Reproduce un efecto de sonido
- `iniciarMusicaFondo()`: Inicia la música de fondo
- `pausarMusicaFondo()`: Pausa la música
- `toggleAudio()`: Activa/desactiva efectos de sonido
- `toggleMusica()`: Activa/desactiva música

#### Eventos de Audio:
| Evento | Función | Ubicación |
|--------|---------|-----------|
| Disparar | `sonidoDisparo()` | Nave.js - función `shoot()` |
| Explosión jugador | `sonidoExplosion()` | Enemigos.js - función `explosionPlayer()` |
| Respawn | `sonidoVida()` | Enemigos.js - función `respawnPlayer()` |
| Pasar nivel | `sonidoPasarNivel()` | niveles.js - función `pasarSiguienteNivel()` |
| Victoria | `sonidoWin()` | niveles.js - función `mostrarPantallaVictoria()` |
| Game Over | `sonidoGameOver()` | Nave.js - función `gameOver()` |

---

### 2. Sistema de HUD (`hud.js`)

#### Estructura del HUD:
```
┌─────────────────────────────────────────────────┐
│  SCORE          NIVEL          VIDAS            │
│  12345            2            ♥ ♥ ♥            │
└─────────────────────────────────────────────────┘
```

#### Variables Globales:
- `score`: Puntuación actual del jugador
- `scoreEl`: Elemento DOM para mostrar el score
- `vidasEl`: Elemento DOM para mostrar las vidas
- `nivelEl`: Elemento DOM para mostrar el nivel

#### Funciones Principales:
- `initScore()`: Inicializa el HUD completo
- `addScore(puntos)`: Añade puntos al score
- `updateScore()`: Actualiza la visualización del score
- `updateVidas(vidas)`: Actualiza los iconos de vidas
- `updateNivel(nivel)`: Actualiza el número de nivel

#### Estilos:
- Fuente: Press Start 2P (estilo retro)
- Color principal: Amarillo (#fefe51) con glow
- Fondo: Gradiente negro semi-transparente
- Animación: Efecto "bump" al actualizar valores

---

### 3. Sistema de Enemigos (`Enemigos.js`)

#### Configuración Global (CONFIG):
```javascript
CONFIG = {
    ufo: {
        speed: 0.043,
        limit: 18,
        vidaMaxima: 5,
        respawnDelay: 26500
    },
    aliens: {
        speed: 0.05,
        limit: 15,
        stepDown: 1.2,
        shootInterval: 1500,
        shootCount: { min: 1, max: 3 },
        startDelay: 2000
    },
    rows: [
        { model: "invader_4.glb", puntos: 30 },
        { model: "invader_3.glb", puntos: 20 },
        { model: "invader_3.glb", puntos: 20 },
        { model: "invader_2.glb", puntos: 10 },
        { model: "invader_2.glb", puntos: 10 }
    ]
}
```

#### UFO (Nave Espacial Especial):
- **Aparición**: Cada 26.5 segundos
- **Movimiento**: Horizontal de izquierda a derecha
- **Vida**: 5 hits
- **Puntos**: 300
- **Función principal**: `spawnUFO()`

#### Aliens (Invasores):
- **Formación**: 5 filas x 7 columnas = 35 aliens
- **Movimiento**: En grupo, horizontal con descenso al tocar límites
- **Disparos**: 1-3 aliens disparan aleatoriamente cada 1.5s
- **Funciones clave**:
  - `crearNuevoGrupoAliens()`: Crea el contenedor de aliens
  - `crearFilaInvaders(modelo, fila, puntos)`: Crea una fila de aliens
  - `moverAliens()`: Loop de movimiento del grupo
  - `iniciarDisparosAliens()`: Sistema de disparos automáticos
  - `dispararAlienAleatorio()`: Selecciona alien para disparar

#### Sistema de Disparos de Aliens:
- **Carril despejado**: Solo disparan aliens que no tienen otro delante
- **Proyectiles**: Cajas verdes (`a-box`) con emisión
- **Daño**: Afectan al jugador y a los bloques de defensa

#### Explosiones:
- `createExplosion(position, options)`: Sistema de partículas
- Partículas: 40-80 esferas que se expanden desde el punto de impacto
- Colores: Amarillo para aliens (#f0f729), Naranja para UFO (#ff6600)

---

### 4. Sistema de Niveles (`niveles.js`)

#### Configuración de Niveles:
```javascript
CONFIG_NIVELES = {
    1: { filas: 5, shootInterval: 1500, mensaje: "NIVEL 1" },
    2: { filas: 5, shootInterval: 1200, mensaje: "NIVEL 2" },  // 20% más rápido
    3: { filas: 5, shootInterval: 900,  mensaje: "NIVEL 3" }   // 40% más rápido
}
```

#### Variables de Control:
- `nivelActual`: Nivel en curso (1-3)
- `NIVEL_MAXIMO`: 3
- `transicionEnCurso`: Evita múltiples transiciones simultáneas

#### Flujo de Progresión:
1. **Eliminar todos los aliens**
   - `verificarNivelCompletado()` detecta cuando no quedan aliens
   
2. **Transición de nivel**
   - Se reproduce `sonidoPasarNivel()`
   - Se muestra pantalla "NIVEL X" durante 3 segundos
   - Se limpia el campo de juego
   
3. **Reinicio de nivel**
   - Se regeneran las bases de defensa
   - Se crean nuevos aliens (misma formación)
   - Se actualiza la velocidad de disparo de enemigos
   - Se reinicia el movimiento

#### Funciones Principales:
- `verificarNivelCompletado()`: Verifica si quedan aliens
- `pasarSiguienteNivel()`: Gestiona la transición
- `mostrarMensajeNivel()`: Pantalla de transición
- `reiniciarNivel()`: Configura el nuevo nivel
- `mostrarPantallaVictoria()`: Pantalla al completar los 3 niveles
- `reiniciarJuegoCompleto()`: Reinicia todo desde el nivel 1

#### Pantalla de Victoria:
- Aparece al completar el nivel 3
- Muestra: "¡GANASTE!" y puntuación final
- Pausa la música de fondo
- Reproduce sonido de victoria

---

### 5. Sistema del Jugador (`Nave.js`)

#### Variables del Jugador:
```javascript
playerVidas = 3
playerInvencible = false
juegoActivo = true
limitX = 15  // Límite de movimiento horizontal
fireRate = 600  // Milisegundos entre disparos
```

#### Controles del Jugador:
- **Movimiento**: Flechas izquierda/derecha o A/D
- **Disparo**: Barra espaciadora
- **Pausa**: Tecla P
- **Reiniciar**: Tecla R (solo en game over)

#### Sistema de Disparos:
```javascript
function shoot() {
    // Crea esfera cyan con glow
    // Velocidad: 0.4 unidades/frame hacia Z negativo
    // Cooldown: 600ms entre disparos
}
```

#### Colisiones:
- **Con aliens**: 
  - Destruye al alien
  - Suma puntos según tipo (10, 20 o 30)
  - Crea explosión
  - Verifica nivel completado

- **Con UFO**:
  - Reduce vida del UFO (5 hits total)
  - Flash rojo visual
  - Al destruir: 300 puntos + explosión grande

- **Con bloques**:
  - Reduce vida del bloque (2 hits)
  - Cambia color a naranja al dañarse
  - Se destruye al segundo hit

#### Bases de Defensa:
- **Cantidad**: 3 bases
- **Posiciones**: X = -6, 0, 6
- **Estructura**: 5 filas x 9 columnas de bloques
- **Forma**: Diseño tipo bunker con hueco central
- **Función**: `crearBase(xPos)`, `limpiarBases()`, `crearTodasLasBases()`

#### Sistema de Vidas:
- **Vida inicial**: 3
- **Perder vida**: Al ser alcanzado por disparo alien
- **Invencibilidad**: 3 segundos después de respawn
- **Efecto visual**: Parpadeo cada 200ms durante invencibilidad
- **Respawn**: Posición (0, 0.5, 1) después de 1 segundo

#### Game Over:
- Se activa cuando `playerVidas <= 0`
- Detiene todos los movimientos y disparos
- Muestra pantalla roja con "GAME OVER"
- Permite reiniciar con tecla R

---

### 6. Sistema de Cámara (`camara.js`)

#### Estados de la Cámara:
- **"intro"**: Vista inicial con título del juego
- **"juego"**: Vista de juego siguiendo al jugador

#### Configuración de Cámara:
```javascript
CAM_OFFSET_Y = 4    // Altura sobre el jugador
CAM_OFFSET_Z = 7    // Distancia detrás del jugador
CAM_ROT_X = -15     // Inclinación hacia abajo (grados)
```

#### Componente `follow-player`:
- Sigue la posición X del jugador
- Mantiene altura y distancia constantes
- Se activa solo en estado "juego"

#### Transición Intro → Juego:
```javascript
function iniciarJuego() {
    // 1. Oculta pantalla de introducción
    // 2. Muestra el HUD
    // 3. Inicia música de fondo
    // 4. Anima la cámara (1.5s) a posición de juego
    // 5. Cambia estado a "juego"
}
```

#### Listener de Inicio:
- `escucharTeclaInicio()`: Detecta cualquier tecla (excepto F5, F11, F12)
- Se remueve después de la primera activación

---

### 7. Sistema Visual Espacial (`stars.js`)

#### Componente `estrellas-espaciales`:

##### Estrellas (150):
- **Tipo**: Esferas blancas
- **Tamaño**: Aleatorio entre 0.02 y 0.08
- **Material**: 
  - Color: Blanco
  - Emisivo con intensidad 1.5 (glow)
- **Movimiento**: Velocidad constante 0.08 hacia el jugador
- **Reciclaje**: Cuando pasan Z > 5, vuelven a Z = -40

##### Asteroides (8):
- **Tipo**: Cubos (`a-box`)
- **Tamaño**: Aleatorio entre 0.15 y 0.45
- **Color**: Gris (#777777)
- **Rotación**: Continua en los 3 ejes (X +0.5°, Y +0.7°)
- **Movimiento**: Velocidad 0.05 hacia el jugador
- **Reciclaje**: Cuando pasan Z > 5, vuelven a Z = -35

##### Loop de Animación (`tick`):
```javascript
tick: function() {
    // Cada frame:
    // 1. Actualiza posición Z de todas las estrellas
    // 2. Actualiza posición Z y rotación de asteroides
    // 3. Recicla elementos que pasaron la cámara
}
```

---

### 8. Sistema de Debug (`debug.js`)

#### Controles de Debug:

| Tecla | Función | Descripción |
|-------|---------|-------------|
| **K** | Matar aliens | Elimina todos los aliens con explosiones |
| **I** | Información | Muestra stats en consola |
| **G** | God mode | Restaura vidas a 3 |
| **N** | Next level | Salta al siguiente nivel |
| **M** | Música | Toggle música on/off |
| **S** | Sonidos | Toggle efectos on/off |

#### Función `matarTodosLosAliens()`:
```javascript
// 1. Obtiene todos los aliens (.alien)
// 2. Por cada alien (con delay de 50ms):
//    - Crea explosión
//    - Suma puntos
//    - Elimina alien
// 3. Al final verifica nivel completado
```

#### Función `mostrarInfoDebug()`:
```javascript
// Imprime en consola:
// - Nivel actual
// - Score
// - Vidas
// - Aliens restantes
// - Bloques de defensa
// - Estado del juego
// - Estado de cámara
```

---

##  Controles

### Controles de Juego:
| Tecla | Acción |
|-------|--------|
| ← / A | Mover nave a la izquierda |
| → / D | Mover nave a la derecha |
| Espacio | Disparar |
| P | Pausar/Reanudar juego |
| R | Reiniciar (solo en Game Over o Victoria) |

### Controles de Audio:
| Tecla | Acción |
|-------|--------|
| M | Activar/Desactivar música |
| S | Activar/Desactivar efectos de sonido |

### Controles de Debug (Desarrollo):
| Tecla | Acción |
|-------|--------|
| K | Matar todos los aliens instantáneamente |
| I | Mostrar información del juego en consola |
| G | Restaurar vidas (God mode) |
| N | Saltar al siguiente nivel |

---

##  Mecánicas del Juego

### Sistema de Puntuación:

| Enemigo | Puntos | Características |
|---------|--------|-----------------|
| Invader A (Fila 1) | 30 | Modelo: invader_4.glb |
| Invader B (Filas 2-3) | 20 | Modelo: invader_3.glb |
| Invader C (Filas 4-5) | 10 | Modelo: invader_2.glb |
| UFO | 300 | 5 vidas, aparece cada 26.5s |

### Progresión de Dificultad:

| Nivel | Aliens | Velocidad de Disparo | Descripción |
|-------|--------|---------------------|-------------|
| 1 | 35 (5x7) | 1500ms | Velocidad base |
| 2 | 35 (5x7) | 1200ms | 20% más rápido |
| 3 | 35 (5x7) | 900ms | 40% más rápido |

### Flujo del Juego:

```
Inicio
  ↓
Pantalla de Título
  ↓
[Presionar cualquier tecla]
  ↓
Nivel 1
  ↓
[Eliminar todos los aliens]
  ↓
Transición "NIVEL 2"
  ↓
Nivel 2 (disparos más rápidos)
  ↓
[Eliminar todos los aliens]
  ↓
Transición "NIVEL 3"
  ↓
Nivel 3 (disparos muy rápidos)
  ↓
[Eliminar todos los aliens]
  ↓
¡VICTORIA!
```

### Condiciones de Victoria:
 Completar los 3 niveles eliminando todos los aliens

### Condiciones de Derrota:
 Perder las 3 vidas

---

##  Instalación y Ejecución

### Requisitos:
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (para cargar A-Frame y fuentes)

### ¿Por qué servidor local?
- Los navegadores bloquean la carga de archivos locales por seguridad (CORS)
- Los modelos .glb y sonidos .mp3 necesitan ser servidos por HTTP

---

##  Personalización

### Cambiar Sonidos:

Edita `audio.js` en la sección `AUDIO_CONFIG`:
```javascript
const AUDIO_CONFIG = {
    disparo: {
        src: 'sound/tu-disparo.mp3',  // ← Cambia aquí
        volumen: 0.5                   // ← Ajusta volumen (0.0 - 1.0)
    }
}
```

### Cambiar Dificultad:

Edita `Enemigos.js` en `CONFIG`:
```javascript
aliens: {
    speed: 0.05,           // Velocidad de movimiento
    shootInterval: 1500,   // Milisegundos entre disparos
    shootCount: { min: 1, max: 3 }  // Aliens que disparan
}
```

### Cambiar Niveles:

Edita `niveles.js` en `CONFIG_NIVELES`:
```javascript
CONFIG_NIVELES = {
    1: { 
        filas: 5,              // Filas de aliens
        shootInterval: 1500,   // Velocidad de disparo
        mensaje: "NIVEL 1" 
    }
}
```

### Cambiar Vidas Iniciales:

Edita `Nave.js`:
```javascript
let playerVidas = 3;  // ← Cambia el número de vidas
```

### Cambiar Colores del HUD:

Edita `hud.js` en la función `_inyectarEstilos()`:
```javascript
.hud-value {
    color: #fefe51;  // ← Color del texto
    text-shadow: 0 0 8px rgba(254, 254, 81, 0.9);  // ← Glow
}
```

### Modificar Estrellas:

Edita `stars.js`:
```javascript
// Número de estrellas
for (let i = 0; i < 150; i++) { // ← Cambia cantidad

// Velocidad
pos.z += 0.08;  // ← Mayor = más rápido
```

---

##  Flujo de Datos

### Inicialización:
```
1. HTMLJuego.html carga
   ↓
2. Scripts se cargan en orden
   ↓
3. audio.js inicializa sistema de sonido
   ↓
4. hud.js crea interfaz (oculta)
   ↓
5. Enemigos.js espera a que escena cargue
   ↓
6. niveles.js se prepara
   ↓
7. Nave.js configura jugador y bases
   ↓
8. stars.js crea estrellas y asteroides
   ↓
9. camara.js configura vista inicial
   ↓
10. Se muestra pantalla de título
```

### Durante el Juego:
```
Loop Principal (requestAnimationFrame):
│
├── Nave.js: movePlayer()
│   ├── Lee teclas (keys)
│   ├── Actualiza posición del jugador
│   └── Detecta disparo (tryShoot)
│
├── Nave.js: verificarColisionConPlayer()
│   └── Comprueba colisiones aliens-jugador
│
├── Enemigos.js: moverAliens()
│   ├── Actualiza posición del grupo
│   └── Detecta límites y desciende
│
├── Enemigos.js: moveUFO()
│   └── Mueve UFO horizontalmente
│
├── stars.js: tick()
│   ├── Mueve estrellas
│   └── Rota asteroides
│
├── camara.js: follow-player tick()
│   └── Actualiza posición de cámara
│
└── Cada bala y disparo alien
    └── Actualiza su posición y detecta colisiones
```

---

##  Debugging

### Consola del Navegador:

El juego imprime información útil:
```
 Espacio creado con 150 estrellas y 8 asteroides
 Inicializando sistema de audio...
 Sistema de audio inicializado
 Nivel 1 iniciado - Velocidad disparo: 1500ms
 Aliens restantes: 35
 Nivel 1 completado!
```

### Errores Comunes:

1. **No se cargan los modelos**:
   - Verifica que la carpeta `models/` existe
   - Verifica que estás usando un servidor HTTP

2. **No se escucha el audio**:
   - Presiona M para activar música
   - Presiona S para activar sonidos
   - Verifica volumen del navegador

3. **Los aliens no se mueven**:
   - Revisa la consola en busca de errores
   - Asegúrate de que `juegoActivo === true`

4. **No pasa de nivel**:
   - Verifica que todos los aliens fueron eliminados
   - Revisa que `cameraState === "juego"`
   - Usa la tecla K (debug) para probar

---

##  Variables Globales Importantes

### Estado del Juego:
- `juegoActivo` (boolean): Si el juego está en marcha
- `juegoEnPausa` (boolean): Si está pausado
- `cameraState` (string): "intro" o "juego"
- `nivelActual` (number): Nivel actual (1-3)
- `transicionEnCurso` (boolean): Si está cambiando de nivel

### Jugador:
- `player` (HTMLElement): Referencia a la nave del jugador
- `playerVidas` (number): Vidas restantes (0-3)
- `playerInvencible` (boolean): Si tiene invencibilidad temporal
- `score` (number): Puntuación acumulada

### Enemigos:
- `alienGroup` (HTMLElement): Contenedor del grupo de aliens
- `alienDirection` (number): Dirección de movimiento (-1 o 1)
- `ufoActivo` (boolean): Si hay un UFO en escena
- `ufoEntity` (HTMLElement): Referencia al UFO

---

##  Conceptos Técnicos

### A-Frame y Three.js:

A-Frame usa un sistema Entity-Component-System (ECS):
- **Entidad** (`<a-entity>`): Objeto en la escena
- **Componente**: Comportamiento o apariencia
- **Sistema**: Lógica global que afecta múltiples entidades

### Componentes Personalizados:

```javascript
AFRAME.registerComponent('nombre', {
    init: function() {
        // Se ejecuta una vez al crear
    },
    tick: function(time, deltaTime) {
        // Se ejecuta cada frame (~60 FPS)
    }
});
```

### Sistema de Coordenadas:

```
Y (altura)
↑
│
│     Z (profundidad)
│    ↗
│   /
│  /
│ /
└────────→ X (horizontal)
```

- **Jugador**: Z positivo (cerca)
- **Aliens**: Z negativo (lejos)
- **Movimiento hacia jugador**: Z aumenta

---

##  Licencia y Créditos

### Desarrollado por:
- Gustavo
- Marco
_ Grisel

### Tecnologías:
- A-Frame Framework
- THREE.js
- Google Fonts (Press Start 2P)

### Inspiración:
- Space Invaders (1978) - Taito Corporation

---

## 🔮 Posibles Mejoras Futuras

1. **Más niveles**: Añadir niveles 4, 5, 6...
2. **Power-ups**: Items que caen al destruir enemigos
3. **Tipos de disparo**: Disparo triple, láser, etc.
4. **Boss final**: Enemigo grande al final de cada nivel
5. **Tabla de puntuaciones**: LocalStorage para guardar récords
6. **Modos de dificultad**: Fácil, Normal, Difícil
7. **Efectos VR**: Soporte para visores VR


**¡Disfruta del juego! 🚀👾**
