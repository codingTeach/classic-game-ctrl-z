#  Space Invaders 3D

Un remake moderno del clásico Space Invaders en 3D usando A-Frame.

##  Características

-  Gráficos 3D inmersivos con A-Frame
-  Sistema de audio 
-  3 niveles con dificultad progresiva
-  Efectos visuales (partículas, explosiones, estrellas)
-  Bases de defensa destructibles
-  Sistema de puntuación y vidas

##  Controles

| Tecla | Acción |
|-------|--------|
| ← → o A/D | Mover nave |
| Espacio | Disparar |
| P | Pausar |
| M | Toggle música |
| S | Toggle sonidos |


##  Estructura

```
├── HTMLJuego.html      # Archivo principal
├── audio.js            # Sistema de audio
├── hud.js              # Interfaz (HUD)
├── Enemigos.js         # Lógica de enemigos
├── niveles.js          # Sistema de niveles
├── Nave.js             # Control del jugador
├── stars.js            # Efectos visuales
├── camara.js           # Manejo de cámara
├── debug.js            # Herramientas de debug
├── sound/              # Archivos de audio
└── models/             # Modelos 3D (.glb)
```

##  Documentación Completa

Para información detallada sobre cómo funciona el código, consulta:
- **[DOCUMENTACION.md](DOCUMENTACION.md)** - Documentación técnica completa

##  Sistema de Puntuación

| Enemigo | Puntos |
|---------|--------|
| Invader A | 30 pts |
| Invader B | 20 pts |
| Invader C | 10 pts |
| UFO | 300 pts |

##  Debug

| Tecla | Función |
|-------|---------|
| K | Matar todos los aliens |
| I | Info en consola |
| G | Restaurar vidas |
| N | Siguiente nivel |

##  Tecnologías

- **A-Frame 1.4.2** - Framework WebVR
- **THREE.js** - Motor 3D
- **JavaScript ES6+** - Lógica del juego
- **HTML5 + CSS3** - Estructura y estilos

**¡Diviértete!**
