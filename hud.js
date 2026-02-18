// HUD — SCORE Y VIDAS
// El HUD vive como overlay CSS en el DOM, no como a-text en la
// escena 3D. Esto permite estilos completos, animaciones y

let score = 0;

// Referencias a los elementos del DOM
let scoreEl = null;
let vidasEl = null;

// INICIALIZACIÓN

function initScore() {
    _inyectarEstilos();
    _crearHUD();
}

function _inyectarEstilos() {
    const style = document.createElement("style");
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        #hud {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            padding: 16px 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 999;
            pointer-events: none;
            box-sizing: border-box;
            background: linear-gradient(
                to bottom,
                rgba(0, 0, 0, 0.75) 0%,
                rgba(0, 0, 0, 0) 100%
            );
        }

        .hud-block {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .hud-label {
            font-family: 'Press Start 2P', monospace;
            font-size: 40px;
            letter-spacing: 0.15em;
            color: rgba(254, 254, 81, 0.5);
            text-transform: uppercase;
        }

        .hud-value {
            font-family: 'Press Start 2P', monospace;
            font-size: 68px;
            color: #fefe51;
            text-shadow:
                0 0 8px rgba(254, 254, 81, 0.9),
                0 0 20px rgba(254, 254, 81, 0.4);
            letter-spacing: 0.05em;
            transition: transform 0.08s ease, color 0.08s ease;
        }

        /* Pulso al actualizar score */
        .hud-value.bump {
            transform: scale(1.2);
            color: #ffffff;
        }

        /* Corazones de vida */
        .hud-vidas-iconos {
            display: flex;
            gap: 8px;
            margin-top: 2px;
        }

        .vida-icono {
            width: 40px;
            height: 40px;
            background: #fefe51;
            clip-path: polygon(
                50% 0%, 61% 4%, 70% 11%, 75% 20%,
                75% 30%, 50% 58%, 25% 30%, 25% 20%,
                30% 11%, 39% 4%
            );
            box-shadow: 0 0 6px rgba(254, 254, 81, 0.8);
            transition: opacity 0.3s, transform 0.3s;
        }

        .vida-icono.perdida {
            opacity: 0.15;
            transform: scale(0.8);
        }
    `;
    document.head.appendChild(style);
}

function _crearHUD() {
    const hud = document.createElement("div");
    hud.id = "hud";

    // Bloque izquierdo — Score
    const bloqueScore = document.createElement("div");
    bloqueScore.className = "hud-block";

    const labelScore = document.createElement("span");
    labelScore.className = "hud-label";
    labelScore.textContent = "score";

    scoreEl = document.createElement("span");
    scoreEl.className = "hud-value";
    scoreEl.textContent = "0";

    bloqueScore.append(labelScore, scoreEl);

    // Bloque derecho — Vidas
    const bloqueVidas = document.createElement("div");
    bloqueVidas.className = "hud-block";
    bloqueVidas.style.alignItems = "flex-end";

    const labelVidas = document.createElement("span");
    labelVidas.className = "hud-label";
    labelVidas.textContent = "vidas";

    vidasEl = document.createElement("div");
    vidasEl.className = "hud-vidas-iconos";
    _renderIconosVidas(playerVidas);

    bloqueVidas.append(labelVidas, vidasEl);

    hud.append(bloqueScore, bloqueVidas);
    document.body.appendChild(hud);
}

/** Dibuja los iconos de corazón según las vidas actuales */
function _renderIconosVidas(vidasActuales) {
    if (!vidasEl) return;

    const total = 3; // vidas máximas
    vidasEl.innerHTML = "";

    for (let i = 0; i < total; i++) {
        const icono = document.createElement("div");
        icono.className = "vida-icono" + (i >= vidasActuales ? " perdida" : "");
        vidasEl.appendChild(icono);
    }
}

// ACTUALIZACIÓN

function addScore(puntos) {
    score += puntos;
    updateScore();
}

function updateScore() {
    if (!scoreEl) return;

    scoreEl.textContent = score;

    // Animación de pulso
    scoreEl.classList.remove("bump");
    void scoreEl.offsetWidth; // fuerza reflow para reiniciar la animación
    scoreEl.classList.add("bump");

    setTimeout(() => scoreEl.classList.remove("bump"), 80);
}

function updateVidas(vidas) {
    _renderIconosVidas(vidas);
}

// INICIALIZACIÓN

document.querySelector("a-scene").addEventListener("loaded", () => {
    initScore();
});