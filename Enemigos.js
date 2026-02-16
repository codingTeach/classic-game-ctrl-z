let ufoActivo = false;
let ufoEntity = null;
let ufoVida = 0;
let ufoVidaMaxima = 5;
const ufoSpeed = 0.043;
const ufoLimit = 18;


//direccion
let alienGroup = null;
let alienDirection = 1; 
const alienSpeed = 0.05;
const alienLimit = 15; 
const alienStepDown = 1.2; 


function spawnUFO() {
    if (ufoActivo) return;

    ufoActivo = true;
    ufoVida = ufoVidaMaxima;

    const scene = document.querySelector('a-scene');
    const ufo = document.createElement('a-entity');

    ufo.setAttribute('gltf-model', 'models/nave_espacial_ufo.glb');
    ufo.setAttribute('scale', '0.005 0.005 0.005');

    // posición fija para ajustar
    ufo.setAttribute('position', {
        x: -ufoLimit,
        y: 0.5,
        z: -25,
    });
    ufo.setAttribute('rotation', '-90 0 0')
    ufo.baseRotation = { x: -90, y: 0, z: 0 };


    scene.appendChild(ufo);

    ufoEntity = ufo;
    moveUFO(ufo);
}


function moveUFO(ufo) {

    function update() {
        if (!juegoActivo) return;

        ufo.object3D.position.x += ufoSpeed;

        if (ufo.object3D.position.x > ufoLimit) {
            ufo.parentNode.removeChild(ufo);
            ufoActivo = false;
            scheduleNextUFO();
            return;
        }

        requestAnimationFrame(update);
    }

    update();
}
//no aparece otro asta que este salga de ecena o sea destruido
function scheduleNextUFO() {
    setTimeout(() => {
        spawnUFO();
    }, 26500);
}



//simple animacion para ufon
function flashRedUFO() {

    if (!ufoEntity) return;

    ufoEntity.object3D.traverse((child) => {

        if (child.isMesh) {

            if (!child.originalColor) {
                child.originalColor = child.material.color.clone();
            }

            child.material.color.set("#ff0000");

            setTimeout(() => {
                if (ufoEntity && child.material)
                    child.material.color.copy(child.originalColor);
            }, 100);
        }
    });
}

//simple animacion de la nave 
function explosionUFO(position) {

    const scene = document.querySelector("a-scene");
    const container = document.createElement("a-entity");
    container.setAttribute("position", position);

    scene.appendChild(container);

    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {

        const particle = document.createElement("a-sphere");

        particle.setAttribute("radius", 0.08);
        particle.setAttribute("color", "#ff6600");
        particle.setAttribute("emissive", "#ff2200");
        particle.setAttribute("emissiveIntensity", 2);

        container.appendChild(particle);

        // Dirección aleatoria
        const dir = new THREE.Vector3(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6
        );

        animateParticle(particle, dir);
    }

    // eliminar contenedor después
    setTimeout(() => {
        if (container.parentNode)
            container.parentNode.removeChild(container);
    }, 800);
}

function animateParticle(particle, direction) {

    let life = 0;

    function update() {

        life += 0.02;

        particle.object3D.position.addScaledVector(direction, 0.02);

        // desvanecer
        const opacity = 1 - life;
        particle.setAttribute("opacity", opacity);
        particle.setAttribute("transparent", true);

        if (life < 1) {
            requestAnimationFrame(update);
        }
    }

    update();
}

function crearFilaInvaders(modelo, filaIndex, puntos) {

    const scene = document.querySelector("a-scene");

    const cantidad = 7;
    const separacion = 2;
    const startX = -((cantidad - 1) * separacion) / 2;

    const posY = 0.5; // MISMA altura para todas
    const posZBase = -24;      // fila superior
    const separacionFilas = 2; // distancia en profundidad

    const posZ = posZBase + (filaIndex * separacionFilas);

    for (let i = 0; i < cantidad; i++) {

        const alien = document.createElement("a-entity");

        alien.setAttribute("gltf-model", `models/${modelo}`);
        alien.setAttribute("scale", "1 1 1");

        alien.setAttribute("position", {
            x: startX + i * separacion,
            y: posY,
            z: posZ
        });

        alien.classList.add("alien");
        alien.vida = 1;

        alien.puntos = puntos;
        alienGroup.appendChild(alien);

    }
}



function explosionAlien(alien) {

    if (!alien) return;

    const scene = document.querySelector("a-scene");

    // Obtener posición real del alien en el mundo
    const worldPos = new THREE.Vector3();
    alien.object3D.getWorldPosition(worldPos);

    const container = document.createElement("a-entity");
    container.setAttribute("position", worldPos);

    scene.appendChild(container);

    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {

        const particle = document.createElement("a-sphere");

        particle.setAttribute("radius", 0.06);
        particle.setAttribute("color", "#f0f729");
        particle.setAttribute("emissive", "#f0f729");
        particle.setAttribute("emissiveIntensity", 1.5);

        container.appendChild(particle);

        const dir = new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
        );

        animateParticle(particle, dir);
    }

    setTimeout(() => {
        container.remove();
    }, 600);
}

function moverAliens() {

    function update() {
        if (!juegoActivo) return;
        if (!alienGroup) return;

        alienGroup.object3D.position.x += alienSpeed * alienDirection;

        // Detectar límites
        const aliens = Array.from(alienGroup.children);

        let extremoDerecha = -Infinity;
        let extremoIzquierda = Infinity;

        aliens.forEach(alien => {

            if (!alien.object3D) return;

            const worldPos = new THREE.Vector3();
            alien.object3D.getWorldPosition(worldPos);

            if (worldPos.x > extremoDerecha) extremoDerecha = worldPos.x;
            if (worldPos.x < extremoIzquierda) extremoIzquierda = worldPos.x;
        });

        if (extremoDerecha > alienLimit || extremoIzquierda < -alienLimit) {
            alienDirection *= -1;

            // bajar en Z
            alienGroup.object3D.position.z += alienStepDown;
        }

        requestAnimationFrame(update);
    }

    update();
}



// ===============================
// DISPARO DE ALIENS
// ===============================
let alienShootInterval = null;

function iniciarDisparosAliens() {
    // Disparan cada 1-2 segundos (aleatorio para más variedad)
    alienShootInterval = setInterval(() => {
        if (!juegoActivo) return;
        
        // Disparar entre 1 y 3 aliens al mismo tiempo
        const cantidadDisparos = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < cantidadDisparos; i++) {
            dispararAlienAleatorio();
        }
    }, 1500); // Cada 1.5 segundos
}

function dispararAlienAleatorio() {
    const aliens = document.querySelectorAll(".alien");
    if (aliens.length === 0) return;

    // Buscar aliens que pueden disparar (con carril despejado)
    const alienesQuePuedenDisparar = [];

    aliens.forEach(alien => {
        if (tieneCarrilDespejado(alien)) {
            alienesQuePuedenDisparar.push(alien);
        }
    });

    if (alienesQuePuedenDisparar.length === 0) return;

    // Seleccionar uno aleatorio
    const alienSeleccionado = alienesQuePuedenDisparar[
        Math.floor(Math.random() * alienesQuePuedenDisparar.length)
    ];

    crearDisparoAlien(alienSeleccionado);
}

function tieneCarrilDespejado(alien) {
    const aliens = document.querySelectorAll(".alien");
    
    const posAlien = new THREE.Vector3();
    alien.object3D.getWorldPosition(posAlien);

    // Verificar si hay algún alien debajo en el mismo carril
    for (let otroAlien of aliens) {
        if (otroAlien === alien) continue;

        const posOtro = new THREE.Vector3();
        otroAlien.object3D.getWorldPosition(posOtro);

        // Mismo carril X (con margen de 1 unidad)
        const mismoCarril = Math.abs(posAlien.x - posOtro.x) < 1;
        
        // El otro está más adelante (mayor Z)
        const estaDebajo = posOtro.z > posAlien.z;

        if (mismoCarril && estaDebajo) {
            return false; // Hay un alien bloqueando
        }
    }

    return true; // Carril despejado
}

function crearDisparoAlien(alien) {
    const scene = document.querySelector('a-scene');
    const disparo = document.createElement('a-entity');

    const alienPos = new THREE.Vector3();
    alien.object3D.getWorldPosition(alienPos);

    disparo.setAttribute('position', {
        x: alienPos.x,
        y: alienPos.y,
        z: alienPos.z
    });

    // Crear el rayo (similar al original de Space Invaders)
    const rayo = document.createElement('a-box');
    rayo.setAttribute('width', 0.1);
    rayo.setAttribute('height', 0.4);
    rayo.setAttribute('depth', 0.1);
    rayo.setAttribute('color', '#00ff00');
    rayo.setAttribute('emissive', '#00ff00');
    rayo.setAttribute('emissiveIntensity', 3);

    disparo.appendChild(rayo);
    scene.appendChild(disparo);

    moverDisparoAlien(disparo);
}

function moverDisparoAlien(disparo) {
    const speed = 0.2;
    let activo = true;

    function update() {
        if (!juegoActivo || !activo) return;

        disparo.object3D.position.z += speed; // Avanza hacia el jugador

        // Verificar colisión con jugador
        const disparoPos = disparo.object3D.position;
        const playerPos = player.object3D.position;

        const dx = Math.abs(disparoPos.x - playerPos.x);
        const dy = Math.abs(disparoPos.y - playerPos.y);
        const dz = Math.abs(disparoPos.z - playerPos.z);

        if (dx < 0.5 && dy < 0.5 && dz < 0.5) {
            // Impacto en el jugador
            if (disparo.parentNode)
                disparo.parentNode.removeChild(disparo);
            activo = false;
            perderVida();
            return;
        }

        // Verificar colisión con bloques
        const bloques = document.querySelectorAll(".bloque");
        
        for (let bloque of bloques) {
            const bloqueWorldPos = new THREE.Vector3();
            bloque.object3D.getWorldPosition(bloqueWorldPos);

            const dx = Math.abs(bloqueWorldPos.x - disparoPos.x);
            const dy = Math.abs(bloqueWorldPos.y - disparoPos.y);
            const dz = Math.abs(bloqueWorldPos.z - disparoPos.z);

            if (dx < 0.2 && dy < 0.2 && dz < 0.5) {
                bloque.vida--;

                if (bloque.vida === 1) {
                    bloque.setAttribute("color", "orange");
                }

                if (bloque.vida <= 0) {
                    bloque.parentNode.removeChild(bloque);
                }

                if (disparo.parentNode)
                    disparo.parentNode.removeChild(disparo);
                
                activo = false;
                return;
            }
        }

        // Si sale del límite
        if (disparo.object3D.position.z > 5) {
            if (disparo.parentNode)
                disparo.parentNode.removeChild(disparo);
            activo = false;
            return;
        }

        requestAnimationFrame(update);
    }

    update();
}

// Detener disparos cuando termine el juego
function detenerDisparosAliens() {
    if (alienShootInterval) {
        clearInterval(alienShootInterval);
        alienShootInterval = null;
    }
}

// Iniciar los disparos cuando cargue el juego
window.addEventListener("load", () => {
    setTimeout(() => {
        iniciarDisparosAliens();
    }, 2000); // Espera 2 segundos antes de empezar a disparar
});

// ===============================
// SISTEMA DE VIDAS
// ===============================
function explosionPlayer() {
    const scene = document.querySelector("a-scene");
    
    const playerWorldPos = new THREE.Vector3();
    player.object3D.getWorldPosition(playerWorldPos);

    const container = document.createElement("a-entity");
    container.setAttribute("position", playerWorldPos);

    scene.appendChild(container);

    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("a-sphere");

        particle.setAttribute("radius", 0.08);
        particle.setAttribute("color", "#00ffff");
        particle.setAttribute("emissive", "#00ffff");
        particle.setAttribute("emissiveIntensity", 2);

        container.appendChild(particle);

        const dir = new THREE.Vector3(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6
        );

        animateParticlePlayer(particle, dir);
    }

    setTimeout(() => {
        if (container.parentNode)
            container.parentNode.removeChild(container);
    }, 800);
}

function animateParticlePlayer(particle, direction) {
    let life = 0;

    function update() {
        life += 0.02;

        particle.object3D.position.addScaledVector(direction, 0.02);

        const opacity = 1 - life;
        particle.setAttribute("opacity", opacity);
        particle.setAttribute("transparent", true);

        if (life < 1) {
            requestAnimationFrame(update);
        }
    }

    update();
}

function perderVida() {
    if (playerInvencible) return;

    playerVidas--;
    updateVidas(playerVidas);
    console.log("Vidas restantes: ", playerVidas);

    // Explosión
    explosionPlayer();

    if (playerVidas <= 0) {
        // Game Over
        setTimeout(() => {
            gameOver();
        }, 500);
    } else {
        // Respawn con invencibilidad
        respawnPlayer();
    }
}

function respawnPlayer() {
    // Ocultar temporalmente al jugador
    player.setAttribute('visible', false);

    setTimeout(() => {
        // Resetear posición
        player.object3D.position.set(0, 0.5, 1);
        
        // Hacer visible
        player.setAttribute('visible', true);
        
        // Activar invencibilidad
        activarInvencibilidad();
    }, 1000);
}

function activarInvencibilidad() {
    playerInvencible = true;
    console.log("Invencibilidad activada");

    // Efecto visual de parpadeo
    let parpadeoInterval = setInterval(() => {
        if (!juegoActivo) {
            clearInterval(parpadeoInterval);
            return;
        }
        
        const visible = player.getAttribute('visible');
        player.setAttribute('visible', !visible);
    }, 200);

    // Desactivar después de 3 segundos
    playerInvencibleTimer = setTimeout(() => {
        playerInvencible = false;
        player.setAttribute('visible', true);
        clearInterval(parpadeoInterval);
        console.log("Invencibilidad desactivada");
    }, 3000);
}

window.addEventListener("load", () => {

    const scene = document.querySelector("a-scene");

    const initGame = () => {
        alienGroup = document.createElement("a-entity");
        scene.appendChild(alienGroup);

        scheduleNextUFO();
        crearFilaInvaders("invader_4.glb", 0, 30); // fila superior
        crearFilaInvaders("invader_3.glb", 1, 20); // fila debajo
        crearFilaInvaders("invader_3.glb", 2, 20);
        crearFilaInvaders("invader_2.glb", 3, 10); // fila debajo
        crearFilaInvaders("invader_2.glb", 4, 10);

        moverAliens();
    };

    if (scene.hasLoaded) {
        initGame();
    } else {
        scene.addEventListener("loaded", initGame);
    }

});




