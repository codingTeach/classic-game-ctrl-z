// CONFIGURACIÓN GLOBAL

const CONFIG = {
    ufo: {
        speed: 0.043,
        limit: 18,
        vidaMaxima: 5,
        respawnDelay: 26500,
    },
    aliens: {
        speed: 0.05,
        limit: 15,
        stepDown: 1.2,
        shootInterval: 1500,
        shootCount: { min: 1, max: 3 },
        startDelay: 2000,
    },
    player: {
        invincibilityDuration: 3000,
        blinkInterval: 200,
        respawnDelay: 1000,
    },
    rows: [
        { model: "AlienG1.glb", puntos: 30 },
        { model: "invader_3.glb", puntos: 20 },
        { model: "invader_3.glb", puntos: 20 },
        { model: "invader_2.glb", puntos: 10 },
        { model: "invader_2.glb", puntos: 10 },
    ],
    invaderGrid: {
        cantidad: 7,
        separacion: 2,
        posY: 0.5,
        posZBase: -24,
        separacionFilas: 2,
    },
};

// ESTADO

let ufoActivo = false;
let ufoEntity = null;
let ufoVida   = 0;

let alienGroup    = null;
let alienDirection = 1;
let alienShootInterval = null;

// UTILIDADES

/** Devuelve la posición mundial de una entidad A-Frame */
function getWorldPos(entity) {
    const pos = new THREE.Vector3();
    entity.object3D.getWorldPosition(pos);
    return pos;
}

/** Crea una explosión de partículas en una posición dada */
function createExplosion(position, { count = 40, color = "#f0f729", radius = 0.06, spread = 5, duration = 600 } = {}) {
    const scene     = document.querySelector("a-scene");
    const container = document.createElement("a-entity");
    container.setAttribute("position", position);
    scene.appendChild(container);

    for (let i = 0; i < count; i++) {
        const particle = document.createElement("a-sphere");
        particle.setAttribute("radius", radius);
        particle.setAttribute("color", color);
        particle.setAttribute("emissive", color);
        particle.setAttribute("emissiveIntensity", 2);
        container.appendChild(particle);

        const dir = new THREE.Vector3(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread
        );
        animateParticle(particle, dir);
    }

    setTimeout(() => container.remove(), duration);
}

function animateParticle(particle, direction) {
    let life = 0;

    function update() {
        life += 0.02;
        particle.object3D.position.addScaledVector(direction, 0.02);
        particle.setAttribute("opacity", 1 - life);
        particle.setAttribute("transparent", true);
        if (life < 1) requestAnimationFrame(update);
    }

    update();
}

// UFO

function spawnUFO() {
    if (ufoActivo) return;

    ufoActivo = true;
    ufoVida   = CONFIG.ufo.vidaMaxima;

    const ufo = document.createElement("a-entity");
    ufo.setAttribute("gltf-model", "models/nave_espacial_ufo.glb");
    ufo.setAttribute("scale", "0.005 0.005 0.005");
    ufo.setAttribute("position", { x: -CONFIG.ufo.limit, y: 0.5, z: -25 });
    ufo.setAttribute("rotation", "-90 0 0");
    ufo.baseRotation = { x: -90, y: 0, z: 0 };

    document.querySelector("a-scene").appendChild(ufo);
    ufoEntity = ufo;
    moveUFO(ufo);
}

function moveUFO(ufo) {
    function update() {
        if (!juegoActivo) return;

        ufo.object3D.position.x += CONFIG.ufo.speed;

        if (ufo.object3D.position.x > CONFIG.ufo.limit) {
            ufo.remove();
            ufoActivo = false;
            scheduleNextUFO();
            return;
        }

        requestAnimationFrame(update);
    }
    update();
}

function scheduleNextUFO() {
    setTimeout(spawnUFO, CONFIG.ufo.respawnDelay);
}

function flashRedUFO() {
    if (!ufoEntity) return;

    ufoEntity.object3D.traverse(child => {
        if (!child.isMesh) return;
        child.originalColor ??= child.material.color.clone();
        child.material.color.set("#ff0000");

        setTimeout(() => {
            if (ufoEntity && child.material)
                child.material.color.copy(child.originalColor);
        }, 100);
    });
}

function explosionUFO(position) {
    createExplosion(position, { count: 80, color: "#ff6600", radius: 0.08, spread: 6, duration: 800 });
}

// ALIENS

function crearFilaInvaders(modelo, filaIndex, puntos) {
    const { cantidad, separacion, posY, posZBase, separacionFilas } = CONFIG.invaderGrid;
    const startX = -((cantidad - 1) * separacion) / 2;

    for (let i = 0; i < cantidad; i++) {
        const alien = document.createElement("a-entity");
        alien.setAttribute("gltf-model", `models/${modelo}`);
        alien.setAttribute("scale", "1 1 1");
        alien.setAttribute("position", {
            x: startX + i * separacion,
            y: posY,
            z: posZBase + filaIndex * separacionFilas,
        });
        alien.classList.add("alien");
        alien.vida   = 1;
        alien.puntos = puntos;
        alienGroup.appendChild(alien);
    }
}

function moverAliens() {
    function update() {
        if (!juegoActivo || !alienGroup) return;

        alienGroup.object3D.position.x += CONFIG.aliens.speed * alienDirection;

        const posiciones = Array.from(alienGroup.children)
            .filter(a => a.object3D)
            .map(a => getWorldPos(a).x);

        const maxX = Math.max(...posiciones);
        const minX = Math.min(...posiciones);

        if (maxX > CONFIG.aliens.limit || minX < -CONFIG.aliens.limit) {
            alienDirection *= -1;
            alienGroup.object3D.position.z += CONFIG.aliens.stepDown;
        }

        requestAnimationFrame(update);
    }
    update();
}

function explosionAlien(alien) {
    if (!alien) return;
    createExplosion(getWorldPos(alien), { count: 40, color: "#f0f729", spread: 5, duration: 600 });
}

// DISPAROS DE ALIENS

function iniciarDisparosAliens() {
    alienShootInterval = setInterval(() => {
        if (!juegoActivo) return;
        const count = Math.floor(Math.random() * CONFIG.aliens.shootCount.max) + CONFIG.aliens.shootCount.min;
        for (let i = 0; i < count; i++) dispararAlienAleatorio();
    }, CONFIG.aliens.shootInterval);
}

function detenerDisparosAliens() {
    clearInterval(alienShootInterval);
    alienShootInterval = null;
}

function dispararAlienAleatorio() {
    const candidatos = Array.from(document.querySelectorAll(".alien")).filter(tieneCarrilDespejado);
    if (candidatos.length === 0) return;
    crearDisparoAlien(candidatos[Math.floor(Math.random() * candidatos.length)]);
}

function tieneCarrilDespejado(alien) {
    const posAlien = getWorldPos(alien);
    return !Array.from(document.querySelectorAll(".alien")).some(otro => {
        if (otro === alien) return false;
        const posOtro = getWorldPos(otro);
        return Math.abs(posAlien.x - posOtro.x) < 1 && posOtro.z > posAlien.z;
    });
}

function crearDisparoAlien(alien) {
    const scene   = document.querySelector("a-scene");
    const disparo = document.createElement("a-entity");
    disparo.setAttribute("position", getWorldPos(alien));

    const rayo = document.createElement("a-box");
    rayo.setAttribute("width", 0.1);
    rayo.setAttribute("height", 0.4);
    rayo.setAttribute("depth", 0.1);
    rayo.setAttribute("color", "#00ff00");
    rayo.setAttribute("emissive", "#00ff00");
    rayo.setAttribute("emissiveIntensity", 3);

    disparo.appendChild(rayo);
    scene.appendChild(disparo);
    moverDisparoAlien(disparo);
}

function moverDisparoAlien(disparo) {
    const speed  = 0.2;
    let activo   = true;

    function update() {
        if (!juegoActivo || !activo) return;

        disparo.object3D.position.z += speed;

        const pos       = disparo.object3D.position;
        const playerPos = player.object3D.position;

        // Colisión con jugador
        if (Math.abs(pos.x - playerPos.x) < 0.5 &&
            Math.abs(pos.y - playerPos.y) < 0.5 &&
            Math.abs(pos.z - playerPos.z) < 0.5) {
            disparo.remove();
            activo = false;
            perderVida();
            return;
        }

        // Colisión con bloques
        for (const bloque of document.querySelectorAll(".bloque")) {
            const bPos = getWorldPos(bloque);
            if (Math.abs(bPos.x - pos.x) < 0.2 &&
                Math.abs(bPos.y - pos.y) < 0.2 &&
                Math.abs(bPos.z - pos.z) < 0.5) {

                bloque.vida--;
                if (bloque.vida === 1) bloque.setAttribute("color", "orange");
                if (bloque.vida <= 0)  bloque.remove();

                disparo.remove();
                activo = false;
                return;
            }
        }

        if (pos.z > 5) {
            disparo.remove();
            activo = false;
            return;
        }

        requestAnimationFrame(update);
    }

    update();
}

// VIDAS / JUGADOR

function explosionPlayer() {
    createExplosion(getWorldPos(player), { count: 60, color: "#00ffff", radius: 0.08, spread: 6, duration: 800 });
}

function perderVida() {
    if (playerInvencible) return;
    playerVidas--;
    updateVidas(playerVidas);
    explosionPlayer();
    playerVidas <= 0 ? setTimeout(gameOver, 500) : respawnPlayer();
}

function respawnPlayer() {
    player.setAttribute("visible", false);
    setTimeout(() => {
        player.object3D.position.set(0, 0.5, 1);
        player.setAttribute("visible", true);
        activarInvencibilidad();
    }, CONFIG.player.respawnDelay);
}

function activarInvencibilidad() {
    playerInvencible = true;

    const blink = setInterval(() => {
        if (!juegoActivo) { clearInterval(blink); return; }
        player.setAttribute("visible", !player.getAttribute("visible"));
    }, CONFIG.player.blinkInterval);

    playerInvencibleTimer = setTimeout(() => {
        playerInvencible = false;
        player.setAttribute("visible", true);
        clearInterval(blink);
    }, CONFIG.player.invincibilityDuration);
}

// INICIALIZACIÓN

window.addEventListener("load", () => {
    const scene = document.querySelector("a-scene");

    function initGame() {
        alienGroup = document.createElement("a-entity");
        scene.appendChild(alienGroup);

        scheduleNextUFO();

        CONFIG.rows.forEach(({ model, puntos }, index) => {
            crearFilaInvaders(model, index, puntos);
        });

        moverAliens();
    }

    scene.hasLoaded ? initGame() : scene.addEventListener("loaded", initGame);

    setTimeout(iniciarDisparosAliens, CONFIG.aliens.startDelay);
});