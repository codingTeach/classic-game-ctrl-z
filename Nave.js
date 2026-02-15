const player = document.querySelector('#player');
const speed = 0.15;
const limitX = 15;
//const minZ = -5;
//const maxZ = 0;
const keys = {};

let lastShot = 0;
const fireRate = 200;

// ===============================
// CONTROLES
// ===============================
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);



function movePlayer() {
    const pos = player.object3D.position;

    if (keys['ArrowLeft'] || keys['a']) {
        if (pos.x > -limitX) pos.x -= speed;
    }

    if (keys['ArrowRight'] || keys['d']) {
        if (pos.x < limitX) pos.x += speed;
    }
    if (keys[' ']){
        tryShoot();
    }
    //if(keys['Arrowup'] || keys['w']){
       // if(pos.z > minZ) pos.z -= speed;
    //}
    //if(keys['Arrowdown'] || keys['s']){
       // if(pos.z < maxZ) pos.z += speed;
   // }

    requestAnimationFrame(movePlayer);
}

movePlayer();

// ===============================
// DISPARO
// ===============================
function shoot() {

    const scene = document.querySelector('a-scene');
    const bala = document.createElement('a-sphere');

    const playerPos = player.object3D.position;

    bala.setAttribute('position', {
        x: playerPos.x,
        y: 0.5,
        z: playerPos.z - 0.5
    });
    // capa interior
    bala.setAttribute('radius', 0.1);
    bala.setAttribute('material', {
        color: '#00ffff',
        emissive: '#00ffff',
        emissiveIntensity: 10
    });


    //capa exterior 
    const glow = document.createElement('a-sphere');
    glow.setAttribute('radius', 0.18);
    glow.setAttribute('material', {
        color: '#00ffff',
        transparent: true,
        opacity: 0.25
    });
    bala.appendChild(glow);
    

    scene.appendChild(bala);

    movimientobala(bala);
}

function tryShoot(){
    const now = Date.now();

    if(now - lastShot >= fireRate){
        shoot();
        lastShot = now;
    }
}

function movimientobala(bala) {
    const speed = 0.4;

    function update() {

        bala.object3D.position.z -= speed;

        detectarColision(bala);

        if (bala.object3D.position.z < -30) {
            if (bala.parentNode)
                bala.parentNode.removeChild(bala);
            return;
        }

        requestAnimationFrame(update);
    }

    update();
}

// ===============================
// CREAR BASES (ROTADAS 180°)
// ===============================
function crearBase(xPos) {

    const scene = document.querySelector("a-scene");

    const base = document.createElement("a-entity");

    // Rotación 180 grados
    base.setAttribute("rotation", "-90  0 180");

    // Posición
    base.setAttribute("position", `${xPos} 0.6   -3`);

    const filas = 5;
    const columnas = 9;
    const tamaño = 0.3;

    for (let y = 0; y < filas; y++) {
        for (let x = 0; x < columnas; x++) {

            // Forma clásica tipo arcade
            if (
                (y === 0 && (x <= 1 || x >= 7)) ||
                (y === 4 && x === 4)
            ) {
                continue;
            }

            const bloque = document.createElement("a-box");

            bloque.setAttribute("width", tamaño);
            bloque.setAttribute("height", tamaño);
            bloque.setAttribute("depth", 1);
            bloque.setAttribute("color", "#EDE4CC");

            bloque.setAttribute("position", {
                x: (x - columnas / 2) * tamaño,
                y: y * tamaño,
                z: 0
            });

            bloque.classList.add("bloque");
            bloque.vida = 2;

            base.appendChild(bloque);
        }
    }

    scene.appendChild(base);
}

// Crear 3 bases
crearBase(-6);
crearBase(0);
crearBase(6);

// ===============================
// COLISIONES AJUSTADAS
// ===============================
function detectarColision(bala) {

    const bloques = document.querySelectorAll(".bloque");

    bloques.forEach(bloque => {

        const bloqueWorldPos = new THREE.Vector3();
        bloque.object3D.getWorldPosition(bloqueWorldPos);

        const balaPos = bala.object3D.position;

        const dx = Math.abs(bloqueWorldPos.x - balaPos.x);
        const dy = Math.abs(bloqueWorldPos.y - balaPos.y);
        const dz = Math.abs(bloqueWorldPos.z - balaPos.z);

        // Ajustado para tamaño 0.3
        if (dx < 0.2 && dy < 0.2 && dz < 0.2) {

            bloque.vida--;

            if (bloque.vida === 1) {
                bloque.setAttribute("color", "orange");
            }

            if (bloque.vida <= 0) {
                bloque.parentNode.removeChild(bloque);
            }

            if (bala.parentNode)
                bala.parentNode.removeChild(bala);
        }
    });

    //colision con ufo
    if (ufoActivo && ufoEntity){
        const balaPos = bala.object3D.position;
        const ufoWorldPos = new THREE.Vector3();

        ufoEntity.object3D.getWorldPosition(ufoWorldPos);

        const dx = Math.abs(ufoWorldPos.x - balaPos.x);
        const dy = Math.abs(ufoWorldPos.y - balaPos.y);
        const dz = Math.abs(ufoWorldPos.z - balaPos.z);

        if (dx < 1 && dy < 1 && dz < 1){
            if(bala.parentNode)
                bala.parentNode.removeChild(bala);

            ufoVida--;
           flashRedUFO();

            console.log("Vida UFo : ", ufoVida);

            ufoEntity.setAttribute("scale", "0.0045 0.0045 0.0045");
            setInterval(() => {
                if (ufoEntity)
                    ufoEntity.setAttribute("scale", "0.005 0.005 0.005");
            }, 100);

            if(ufoVida <=0 ){
                const pos = ufoEntity.getAttribute("position");

                explosionUFO(pos);
                if (ufoEntity.parentNode)
                    ufoEntity.parentNode.removeChild(ufoEntity);

            ufoActivo = false;
            ufoEntity = null;

            console.log("UFO destruido")

            }
        }
    }
}
