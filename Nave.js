// ESTADO DEL JUGADOR

let playerVidas         = 3;
let playerInvencible    = false;
let playerInvencibleTimer = null;

const player  = document.querySelector('#player');
const limitX  = 15;
const keys    = {};

let lastShot   = 0;
const fireRate = 600;

let juegoActivo = true;

// CONTROLES

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup',   e => keys[e.key] = false);

window.addEventListener('keydown', e => {
    if (!juegoActivo && e.key.toLowerCase() === 'r') location.reload();
});

function movePlayer() {
    if (!juegoActivo) return;

    const pos   = player.object3D.position;
    const speed = 0.15;

    if ((keys['ArrowLeft']  || keys['a']) && pos.x > -limitX) pos.x -= speed;
    if ((keys['ArrowRight'] || keys['d']) && pos.x <  limitX) pos.x += speed;
    if (keys[' ']) tryShoot();

    requestAnimationFrame(movePlayer);
}

movePlayer();

// DISPARO

function tryShoot() {
    const now = Date.now();
    if (now - lastShot >= fireRate) {
        shoot();
        lastShot = now;
    }
}

function shoot() {
    const scene     = document.querySelector('a-scene');
    const playerPos = player.object3D.position;

    // 🔊 Reproducir sonido de disparo
    if (typeof sonidoDisparo === 'function') {
        sonidoDisparo();
    }

    const bala = document.createElement('a-sphere');
    bala.setAttribute('radius', 0.1);
    bala.setAttribute('position', { x: playerPos.x, y: 0.5, z: playerPos.z - 0.5 });
    bala.setAttribute('material', { color: '#00ffff', emissive: '#00ffff', emissiveIntensity: 10 });

    const glow = document.createElement('a-sphere');
    glow.setAttribute('radius', 0.18);
    glow.setAttribute('material', { color: '#00ffff', transparent: true, opacity: 0.25 });

    bala.appendChild(glow);
    scene.appendChild(bala);
    movimientobala(bala);
}

function movimientobala(bala) {
    const speed = 0.4;
    let activo  = true;

    function update() {
        if (!juegoActivo || !activo) return;

        bala.object3D.position.z -= speed;

        if (detectarColision(bala)) {
            activo = false;
            return;
        }

        if (bala.object3D.position.z < -30) {
            bala.remove();
            activo = false;
            return;
        }

        requestAnimationFrame(update);
    }

    update();
}

// COLISIONES

function detectarColision(bala) {
    const balaPos = bala.object3D.position;

    // --- Bloques de defensa ---
    for (const bloque of document.querySelectorAll('.bloque')) {
        const bPos = getWorldPos(bloque);

        if (Math.abs(bPos.x - balaPos.x) < 0.2 &&
            Math.abs(bPos.y - balaPos.y) < 0.2 &&
            Math.abs(bPos.z - balaPos.z) < 0.2) {

            bloque.vida--;
            if (bloque.vida === 1) bloque.setAttribute('color', 'orange');
            if (bloque.vida <= 0)  bloque.remove();

            bala.remove();
            return true;
        }
    }

    // --- UFO ---
    if (ufoActivo && ufoEntity) {
        const ufoPos = getWorldPos(ufoEntity);

        if (Math.abs(ufoPos.x - balaPos.x) < 1 &&
            Math.abs(ufoPos.y - balaPos.y) < 1 &&
            Math.abs(ufoPos.z - balaPos.z) < 1) {

            bala.remove();
            ufoVida--;
            flashRedUFO();

            ufoEntity.setAttribute('scale', '0.0045 0.0045 0.0045');
            setTimeout(() => {
                if (ufoEntity) ufoEntity.setAttribute('scale', '0.005 0.005 0.005');
            }, 100);

            if (ufoVida <= 0) {
                explosionUFO(ufoEntity.getAttribute('position'));
                addScore(300);
                ufoEntity.remove();
                ufoEntity = null;
                ufoActivo = false;
                scheduleNextUFO();
            }

            return true;
        }
    }

    // --- Aliens ---
    for (const alien of document.querySelectorAll('.alien')) {
        const aPos = getWorldPos(alien);

        if (Math.abs(aPos.x - balaPos.x) < 0.8 &&
            Math.abs(aPos.y - balaPos.y) < 0.8 &&
            Math.abs(aPos.z - balaPos.z) < 0.8) {

            bala.remove();
            explosionAlien(alien);
            addScore(alien.puntos ?? 10);
            alien.remove();
            
            // Verificar si se completó el nivel
            setTimeout(() => {
                if (typeof verificarNivelCompletado === 'function') {
                    verificarNivelCompletado();
                }
            }, 100);
            
            return true;
        }
    }

    return false;
}

// BASES DE DEFENSA

function crearBase(xPos) {
    const scene    = document.querySelector('a-scene');
    const base     = document.createElement('a-entity');
    const filas    = 5;
    const columnas = 9;
    const tamaño   = 0.3;

    base.setAttribute('rotation', '-90 0 180');
    base.setAttribute('position', `${xPos} 0.6 -3`);

    for (let y = 0; y < filas; y++) {
        for (let x = 0; x < columnas; x++) {

            if ((y === 0 && (x <= 1 || x >= 7)) || (y === 4 && x === 4)) continue;

            const bloque = document.createElement('a-box');
            bloque.setAttribute('width',  tamaño);
            bloque.setAttribute('height', tamaño);
            bloque.setAttribute('depth',  1);
            bloque.setAttribute('color',  '#EDE4CC');
            bloque.setAttribute('position', {
                x: (x - columnas / 2) * tamaño,
                y: y * tamaño,
                z: 0,
            });
            bloque.classList.add('bloque');
            bloque.vida = 2;
            base.appendChild(bloque);
        }
    }

    scene.appendChild(base);
}

function crearTodasLasBases() {
    crearBase(-6);
    crearBase(0);
    crearBase(6);
}

function limpiarBases() {
    const basesAEliminar = new Set();
    document.querySelectorAll('.bloque').forEach(bloque => {
        if (bloque.parentElement) {
            basesAEliminar.add(bloque.parentElement);
        }
    });
    basesAEliminar.forEach(base => {
        if (base && base.parentElement) {
            base.remove();
        }
    });
}

// Crear bases al inicio
crearTodasLasBases();

// COLISIÓN ALIEN → JUGADOR

function verificarColisionConPlayer() {
    if (!juegoActivo) return;

    const playerPos = player.object3D.position;

    document.querySelectorAll('.alien').forEach(alien => {
        const aPos = getWorldPos(alien);

        if (Math.abs(aPos.x - playerPos.x) < 1 &&
            Math.abs(aPos.y - playerPos.y) < 1 &&
            Math.abs(aPos.z - playerPos.z) < 2 &&
            !playerInvencible) {
            perderVida();
        }
    });

    requestAnimationFrame(verificarColisionConPlayer);
}

// GAME OVER

function gameOver() {
    juegoActivo = false;
    detenerDisparosAliens();

    // 🔊 Reproducir sonido de game over
    if (typeof sonidoGameOver === 'function') {
        sonidoGameOver();
    }
    
    // Pausar música de fondo
    if (typeof pausarMusicaFondo === 'function') {
        pausarMusicaFondo();
    }

    const estilos = {
        overlay: {
            position: 'fixed', top: 0, left: 0,
            width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            zIndex: 1000,
        },
        titulo: {
            fontSize: '120px', fontWeight: 'bold',
            color: 'red', fontFamily: 'Arial, sans-serif',
            textShadow: '0 0 20px red', marginBottom: '30px',
        },
        subtitulo: {
            fontSize: '36px', color: 'white',
            fontFamily: 'Arial, sans-serif',
        },
    };

    const overlay   = crearElemento('div', estilos.overlay);
    const titulo    = crearElemento('div', estilos.titulo,    'GAME OVER');
    const subtitulo = crearElemento('div', estilos.subtitulo, 'Presiona R para reiniciar');

    overlay.append(titulo, subtitulo);
    document.body.appendChild(overlay);
}

function crearElemento(tag, estilos = {}, texto = '') {
    const el = document.createElement(tag);
    Object.assign(el.style, estilos);
    if (texto) el.textContent = texto;
    return el;
}

// PAUSA

let juegoEnPausa = false;

window.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'p') togglePausa();
});

function togglePausa() {
    juegoEnPausa = !juegoEnPausa;
    juegoActivo = !juegoEnPausa;

    if (juegoEnPausa) {
        mostrarPantallaPausa();
    } else {
        ocultarPantallaPausa();
        // Reanudar loops que dependen de juegoActivo
        movePlayer();
        verificarColisionConPlayer();
        moverAliens();
    }
}

function mostrarPantallaPausa() {
    const overlay = crearElemento('div', {
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        zIndex: 999,
    });
    overlay.id = 'pauseScreen';

    const titulo = crearElemento('div', {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '72px', color: '#fefe51',
        textShadow: '0 0 20px rgba(254,254,81,0.8)',
        marginBottom: '24px',
    }, 'PAUSA');

    const sub = crearElemento('div', {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '16px', color: 'white',
        opacity: '0.7',
    }, 'Presiona P para continuar');

    overlay.append(titulo, sub);
    document.body.appendChild(overlay);
}

function ocultarPantallaPausa() {
    document.getElementById('pauseScreen')?.remove();
}

// INICIALIZACIÓN

window.addEventListener('load', () => {
    setTimeout(verificarColisionConPlayer, 1000);
});

