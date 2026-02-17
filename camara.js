
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
    // { modelo, fila, puntos, color }  – fila 0 = la más al fondo (z más negativo)
    { fila: 0, puntos: 30, color: "#ffffff", label: "INVADER-A" },
    { fila: 1, puntos: 20, color: "#ffffff", label: "INVADER-B" },
    { fila: 2, puntos: 20, color: "#ffffff", label: "INVADER-B" },
    { fila: 3, puntos: 10, color: "#ffffff", label: "INVADER-C" },
    { fila: 4, puntos: 10, color: "#ffffff", label: "INVADER-C" },
];

// Parámetros que deben coincidir con crearFilaInvaders en Enemigos.js
const FILA_SEPARACION = 2;
const FILA_Z_BASE     = -24;
const LABEL_Y         = 3;    // altura de los textos sobre el suelo
const LABEL_CLASS     = "intro-label";

function crearLabelsIntro() {
    const scene = document.querySelector("a-scene");

    // ── Línea de UFO ──────────────────────────────────────────
    const ufoLabel = document.createElement("a-text");
    ufoLabel.setAttribute("value", "UFO  → 300 pts");
    ufoLabel.setAttribute("color", "#ff4444");
    ufoLabel.setAttribute("align", "center");
    ufoLabel.setAttribute("width", 12);
    ufoLabel.setAttribute("position", `0 ${LABEL_Y + 1} -34`);
    ufoLabel.setAttribute("rotation", "0 0 0");
    ufoLabel.classList.add(LABEL_CLASS);
    scene.appendChild(ufoLabel);

    // ── Una línea por tipo de fila ────────────────────────────
    // Evitamos duplicados mostrando sólo filas únicas por puntos
    const vistas = new Set();

    LABEL_CONFIG.forEach(cfg => {
        const key = `${cfg.puntos}-${cfg.color}`;
        if (vistas.has(key)) return;
        vistas.add(key);

        const z = FILA_Z_BASE + cfg.fila * FILA_SEPARACION;

        const label = document.createElement("a-text");
        label.setAttribute("value", `${cfg.label}  → ${cfg.puntos} pts`);
        label.setAttribute("color", cfg.color);
        label.setAttribute("align", "center");
        label.setAttribute("width", 12);
        label.setAttribute("position", `0 ${LABEL_Y} ${z}`);
        label.setAttribute("rotation", "-60 0 0");
        label.classList.add(LABEL_CLASS);
        scene.appendChild(label);
    });

    // ── Línea "BASES protegen a tu nave" ─────────────────────
    const baseLabel = document.createElement("a-text");
    baseLabel.setAttribute("value", "BASES  →  te protegen");
    baseLabel.setAttribute("color", "#ddcfa6");
    baseLabel.setAttribute("align", "center");
    baseLabel.setAttribute("width", 12);
    baseLabel.setAttribute("position", `0 ${LABEL_Y} -3`);
    baseLabel.setAttribute("rotation", "0 0 0");
    baseLabel.classList.add(LABEL_CLASS);
    scene.appendChild(baseLabel);
}

function eliminarLabelsIntro() {
    const labels = document.querySelectorAll(`.${LABEL_CLASS}`);
    console.log(`🗑️ Eliminando ${labels.length} labels de intro`);
    labels.forEach(el => {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    });
}

// ── Transición intro → juego ─────────────────────────────────────
function iniciarJuego() {
    console.log("🎮 iniciarJuego() llamado - estado actual:", cameraState);
    
    if (cameraState === "juego") {
        console.log("⚠️ Ya estamos en juego, saliendo");
        return;
    }
    
    cameraState = "juego";
    console.log("✅ Estado cambiado a:", cameraState);

    // 1. Ocultar overlay HTML
    const overlay = document.getElementById("introOverlay");
    if (overlay) {
        overlay.classList.add("hidden");
        overlay.style.display = "none";  // forzar ocultar
        console.log("✅ Overlay HTML ocultado");
    } else {
        console.error("❌ No se encontró #introOverlay");
    }

    // 2. Quitar labels 3D
    eliminarLabelsIntro();

    // 3. Mover cámara instantáneamente a posición de juego
    const cam    = document.querySelector("#mainCamera");
    const player = document.querySelector("#player");

    if (!cam) console.error("❌ No se encontró la cámara");
    if (!player) console.error("❌ No se encontró el player");

    const px = player ? player.object3D.position.x : 0;
    const pz = player ? player.object3D.position.z : 1;

    cam.setAttribute("position", { x: px, y: CAM_OFFSET_Y, z: pz + CAM_OFFSET_Z });
    cam.setAttribute("rotation", { x: CAM_ROT_X, y: 0, z: 0 });

    console.log(`✅ Cámara reposicionada a (${px}, ${CAM_OFFSET_Y}, ${pz + CAM_OFFSET_Z})`);

    // 4. Inicializar el HUD (score y vidas)
    
}

// ── Escuchar "cualquier tecla" sólo en la intro ──────────────────
function escucharTeclaInicio() {
    console.log("👂 Escuchando teclas para iniciar juego...");
    
    const handler = (e) => {
        console.log("⌨️ Tecla presionada:", e.key);
        
        // Ignorar teclas de control del navegador
        if (["F5", "F11", "F12"].includes(e.key)) {
            console.log("⚠️ Tecla de control ignorada");
            return;
        }

        console.log("✅ Tecla válida, iniciando juego...");
        iniciarJuego();
        window.removeEventListener("keydown", handler);
        console.log("✅ Listener de teclado removido");
    };

    window.addEventListener("keydown", handler);
    console.log("✅ Listener de keydown agregado");
}



// ── Inicialización principal ─────────────────────────────────────
window.addEventListener("load", () => {
    console.log("📦 camera.js cargado - configurando intro...");
    
    const scene = document.querySelector("a-scene");

    if (!scene) {
        console.error("❌ No se encontró a-scene");
        return;
    }

    const setupIntro = () => {
        console.log("🎬 setupIntro() ejecutándose...");
        
        crearLabelsIntro();

        escucharTeclaInicio();
        escucharClickInicio();

        console.log("🎮 Intro lista – esperando tecla o click");
        console.log("📍 Estado actual de cameraState:", cameraState);
    };

    if (scene.hasLoaded) {
        console.log("✅ Escena ya cargada, ejecutando setupIntro");
        setupIntro();
    } else {
        console.log("⏳ Esperando que la escena cargue...");
        scene.addEventListener("loaded", () => {
            console.log("✅ Escena cargada, ejecutando setupIntro");
            setupIntro();
        });
    }
});



window.addEventListener("keydown", (e) => {

}, true);  // capture = true para ir antes que otros listeners

//score