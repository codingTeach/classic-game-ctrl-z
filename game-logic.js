const player = document.querySelector('#player');

const speed = 0.15;

const limitX = 15;
//const minZ = -5;
//const maxZ = 0;

const keys = {};

window.addEventListener('keydown', e => keys[e.key]= true);
window.addEventListener('keyup', e => keys[e.key] = false);

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