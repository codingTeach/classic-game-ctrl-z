let ufoActivo = false;
let ufoEntity = null;
let ufoVida = 0;
let ufoVidaMaxima = 5;
const ufoSpeed = 0.02;
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




