
let cameraState = "intro";   // "intro" | "juego"


const CAM_OFFSET_Y =  4;   // altura sobre el suelo
const CAM_OFFSET_Z =  7;   // detrás de la nave (nave en z=1, cámara en z=8)
const CAM_ROT_X   = -15;   // ligera inclinación hacia abajo para ver la nave y el campo

AFRAME.registerComponent('follow-player', {
    tick: function () {
        if (cameraState !== "juego") return;

        const player = document.querySelector('#player');
        if (!player || !player.object3D) return;

        const px = player.object3D.position.x;
        const pz = player.object3D.position.z;  // nave en z≈1

        // Cámara detrás de la nave en Z, fija en Y
        this.el.object3D.position.x = px;
        this.el.object3D.position.y = CAM_OFFSET_Y;
        this.el.object3D.position.z = pz + CAM_OFFSET_Z;  // detrás = z+ de la nave

        // Apuntar hacia Z negativo (donde vienen los aliens)
        // rotation.x en radianes: -15° ≈ -0.2618 rad
        this.el.object3D.rotation.x = THREE.MathUtils.degToRad(CAM_ROT_X);
        this.el.object3D.rotation.y = 0;
        this.el.object3D.rotation.z = 0;
    }
});


const LABEL_CONFIG = [
    
    { fila: 0, puntos: 30, color: "#ffffff", label: "INVADER-A" },
    { fila: 1, puntos: 20, color: "#ffffff", label: "INVADER-B" },
    { fila: 2, puntos: 20, color: "#ffffff", label: "INVADER-B" },
    { fila: 3, puntos: 10, color: "#ffffff", label: "INVADER-C" },
    { fila: 4, puntos: 10, color: "#ffffff", label: "INVADER-C" },
];


function crearLabelsIntro() {
    const scene = document.querySelector("a-scene");


    const vistas = new Set();

    LABEL_CONFIG.forEach(cfg => {
        const key = `${cfg.puntos}-${cfg.color}`;
        if (vistas.has(key)) return;
        vistas.add(key);
        
    });


}

function eliminarLabelsIntro() {
    const labels = document.querySelectorAll(`.${LABEL_CLASS}`);
    console.log(` Eliminando ${labels.length} labels de intro`);
    labels.forEach(el => {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    });
}

// ── Transición intro → juego ─────────────────────────────────────
function iniciarJuego() {

    if (cameraState === "juego") return;

    const intro = document.getElementById("retroIntro");
    if (intro) intro.style.display = "none";

    const cam = document.querySelector("#mainCamera");
    const player = document.querySelector("#player");

    const px = player.object3D.position.x;
    const pz = player.object3D.position.z;

    // Posición final detrás de la nave
    const finalPos = `${px} ${CAM_OFFSET_Y} ${pz + CAM_OFFSET_Z}`;
    const finalRot = `${CAM_ROT_X} 0 0`;

    // Animación de posición
    cam.setAttribute("animation__move", {
        property: "position",
        to: finalPos,
        dur: 1500,
        easing: "easeInOutQuad"
    });

    // Animación de rotación
    cam.setAttribute("animation__rotate", {
        property: "rotation",
        to: finalRot,
        dur: 1500,
        easing: "easeInOutQuad"
    });

    // Cuando termine la animación
    cam.addEventListener("animationcomplete__move", () => {
        cameraState = "juego";
    }, { once: true });
}


// ── Escuchar "cualquier tecla" sólo en la intro ──────────────────
function escucharTeclaInicio() {
    console.log("Escuchando teclas para iniciar juego...");
    
    const handler = (e) => {
        console.log("⌨️ Tecla presionada:", e.key);
        
        // Ignorar teclas de control del navegador
        if (["F5", "F11", "F12"].includes(e.key)) {
            console.log(" Tecla de control ignorada");
            return;
        }

        console.log(" Tecla válida, iniciando juego...");
        iniciarJuego();
        window.removeEventListener("keydown", handler);
        console.log(" Listener de teclado removido");
    };

    window.addEventListener("keydown", handler);
    console.log(" Listener de keydown agregado");
}



// ── Inicialización principal ─────────────────────────────────────
window.addEventListener("load", () => {
    console.log(" camera.js cargado - configurando intro...");
    
    const scene = document.querySelector("a-scene");

    if (!scene) {
        console.error(" No se encontró a-scene");
        return;
    }

    const setupIntro = () => {
        console.log(" setupIntro() ejecutándose...");
        
        crearLabelsIntro();

        escucharTeclaInicio();
        escucharClickInicio();

        console.log(" Intro lista – esperando tecla o click");
        console.log(" Estado actual de cameraState:", cameraState);
    };

    if (scene.hasLoaded) {
        console.log(" Escena ya cargada, ejecutando setupIntro");
        setupIntro();
    } else {
        console.log(" Esperando que la escena cargue...");
        scene.addEventListener("loaded", () => {
            console.log(" Escena cargada, ejecutando setupIntro");
            setupIntro();
        });
    }
});



window.addEventListener("keydown", (e) => {

}, true);  // capture = true para ir antes que otros listeners

//score