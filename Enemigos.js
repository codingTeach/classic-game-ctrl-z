let ufoActivo = false;
let ufoEntity = null;
let ufoVida = 0;
let ufoVidaMaxima = 10;
const ufoSpeed = 0.05;
const ufoLimit = 18;

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

// lo ejecutamos una sola vez
spawnUFO();

function moveUFO(ufo) {

    function update() {

        ufo.object3D.position.x += ufoSpeed;

        if (ufo.object3D.position.x > ufoLimit) {
            ufo.parentNode.removeChild(ufo);
            ufoActivo = false;
            return;
        }

        requestAnimationFrame(update);
    }

    update();
}

// aparición automática cada cierto tiempo
setInterval(() => {
    spawnUFO();
}, 12000);

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





