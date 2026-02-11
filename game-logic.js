const player = document.querySelector('#player');

const speed = 0.15;

const limitX = 15;
//const minZ = -5;
//const maxZ = 0;

const keys = {};

window.addEventListener('keydown', e => keys[e.key]= true);
window.addEventListener('keyup', e => keys[e.key] = false);
window.addEventListener('keydown', e => {if(e.code === 'Space'){shoot();}});

//quitar los // si quieren que la nave se mueva en Z
function movePlayer(){
    const pos = player.object3D.position;

    if (keys['ArrowLeft'] || keys['a']){
        if (pos.x > -limitX) pos.x -= speed;
    }
    if (keys['ArrowRight'] || keys['d']){
        if(pos.x < limitX) pos.x += speed;
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


function shoot() {
    console.log = ("bala");
    const player = document.querySelector('#player');
    const scene = document.querySelector('a-scene');


    const bala = document.createElement('a-sphere');

    const playerPos = player.object3D.position;

    bala.setAttribute('position', {
        x: playerPos.x,
        y: 0.5,
        z: playerPos.z + 0.5});



    bala.setAttribute('radius', 0.1);
    bala.setAttribute('color', 'yellow');

    scene.appendChild(bala);

    movimientobala(bala);
}

function movimientobala(bala){
    const speed = 0.2;

    function update(){
        bala.object3D.position.z -= speed;

        if (bala.object3D.position.z < -30){
            bala.parentNode.removeChild(bala);
            return;
        }
        requestAnimationFrame(update);
    }
    update();
}