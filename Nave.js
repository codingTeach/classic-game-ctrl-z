let playerVidas = 3;
let playerInvencible = false;
let playerInvencibleTimer = null; 
const player = document.querySelector('#player');
const speed = 0.15;
const limitX = 15;
//const minZ = -5;
//const maxZ = 0;
const keys = {};

let lastShot = 0;
const fireRate = 600;

let juegoActivo = true;
// ===============================
// CONTROLES
// ===============================
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);



function movePlayer() {
    if (!juegoActivo) return;
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
    let activo = true; 

    function update() {
        if (!juegoActivo || !activo) return;

        bala.object3D.position.z -= speed;

        const impacto = detectarColision(bala); 
        
        if (impacto) {
            activo = false; 
            return;
        }

        if (bala.object3D.position.z < -30) {
            if (bala.parentNode)
                bala.parentNode.removeChild(bala);
            activo = false; 
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

    for (let bloque of bloques) {

        const bloqueWorldPos = new THREE.Vector3();
        bloque.object3D.getWorldPosition(bloqueWorldPos);

        const balaPos = bala.object3D.position;

        const dx = Math.abs(bloqueWorldPos.x - balaPos.x);
        const dy = Math.abs(bloqueWorldPos.y - balaPos.y);
        const dz = Math.abs(bloqueWorldPos.z - balaPos.z);

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
            
            return true; 
        }
    }

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
            setTimeout(() => {
                if (ufoEntity)
                    ufoEntity.setAttribute("scale", "0.005 0.005 0.005");
            }, 100);

            if(ufoVida <=0 && ufoEntity ){
                const pos = ufoEntity.getAttribute("position");

                explosionUFO(pos);
                addScore(300);
                if (ufoEntity.parentNode)
                    ufoEntity.parentNode.removeChild(ufoEntity);

                ufoActivo = false;
                ufoEntity = null;

                scheduleNextUFO();

                console.log("UFO destruido")
            }
            
            return true; 
        }
    }

    // COLISION CON ALIENS
    const aliens = document.querySelectorAll(".alien");

    for (let alien of aliens) {

        const alienWorldPos = new THREE.Vector3();
        alien.object3D.getWorldPosition(alienWorldPos);

        const balaPos = bala.object3D.position;

        const dx = Math.abs(alienWorldPos.x - balaPos.x);
        const dy = Math.abs(alienWorldPos.y - balaPos.y);
        const dz = Math.abs(alienWorldPos.z - balaPos.z);

        if (dx < 0.8 && dy < 0.8 && dz < 0.8) {

            if (bala.parentNode)
                bala.parentNode.removeChild(bala);

            explosionAlien(alien);
            alien.remove();
            addScore(alien.puntos || 10);

            console.log("Alien destruido");

            return true; 
        }
    }

    return false; 
}

// ===============================
// GAME OVER
// ===============================
  

function verificarColisionConPlayer() {
    if (!juegoActivo) return;

    const aliens = document.querySelectorAll(".alien");
    const playerPos = player.object3D.position;

    aliens.forEach(alien => {
        const alienWorldPos = new THREE.Vector3();
        alien.object3D.getWorldPosition(alienWorldPos);

        const dx = Math.abs(alienWorldPos.x - playerPos.x);
        const dy = Math.abs(alienWorldPos.y - playerPos.y);
        const dz = Math.abs(alienWorldPos.z - playerPos.z);

        // Si un alien toca al jugador
        if (dx < 1 && dy < 1 && dz < 2) {
            if (!playerInvencible) {
                perderVida(); 
            }
        }
    });

    if (juegoActivo) {
        requestAnimationFrame(verificarColisionConPlayer);
    }
}

function gameOver() {
    juegoActivo = false;
    detenerDisparosAliens();

    // Crear overlay de Game Over
    const overlay = document.createElement('div');
    overlay.id = 'gameOverScreen';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    // Texto GAME OVER
    const gameOverText = document.createElement('div');
    gameOverText.textContent = 'GAME OVER';
    gameOverText.style.fontSize = '120px';
    gameOverText.style.fontWeight = 'bold';
    gameOverText.style.color = 'red';
    gameOverText.style.fontFamily = 'Arial, sans-serif';
    gameOverText.style.textShadow = '0 0 20px red';
    gameOverText.style.marginBottom = '30px';

    // Texto de reinicio
    const restartText = document.createElement('div');
    restartText.textContent = 'Presiona R para reiniciar el juego';
    restartText.style.fontSize = '36px';
    restartText.style.color = 'white';
    restartText.style.fontFamily = 'Arial, sans-serif';

    overlay.appendChild(gameOverText);
    overlay.appendChild(restartText);
    document.body.appendChild(overlay);

    console.log("GAME OVER");
}

function reiniciarJuego() {
    location.reload();
}

// Detectar tecla R para reiniciar
window.addEventListener('keydown', (e) => {
    if (!juegoActivo && e.key.toLowerCase() === 'r') {
        reiniciarJuego();
    }
});

// Iniciar verificación de colisión con player
window.addEventListener('load', () => {
    setTimeout(() => {
        verificarColisionConPlayer();
    }, 1000);
});