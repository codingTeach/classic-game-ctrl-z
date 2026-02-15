let ufoActivo = false;
const ufoSpeed = 0.05;
const ufoLimit = 18;

function spawnUFO() {
    if (ufoActivo) return;

    ufoActivo = true;

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

    scene.appendChild(ufo);
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
