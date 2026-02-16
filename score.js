let score = 0;
let scoreText = null;
let vidasText = null;

function initScore() {

    const camera = document.querySelector("[camera]");

    if (!camera) {
        console.error("No se encontró la cámara");
        return;
    }

    const hud = document.createElement("a-entity");
    hud.setAttribute("position", "0 1.5 -2"); // un poco más arriba

    //Texto de score
    scoreText = document.createElement("a-text");
    scoreText.setAttribute("value", "SCORE: 0");
    scoreText.setAttribute("color", "#fefe51");
    scoreText.setAttribute("align", "center");
    scoreText.setAttribute("width", 4);
    //Texto de vidas
    vidasText = document.createElement("a-text");
    vidasText.setAttribute("value", "VIDAS: 3");
    vidasText.setAttribute("color", "#fefe51");
    vidasText.setAttribute("align", "right");
    vidasText.setAttribute("width", 4);
    vidasText.setAttribute("position", "1.5 0 0");

    hud.appendChild(scoreText);
    hud.appendChild(vidasText);
    camera.appendChild(hud);
}

function addScore(points) {
    score += points;
    updateScore();
}

function updateScore() {
    if (scoreText) {
        scoreText.setAttribute("value", "SCORE: " + score);
    }
}
function updateVidas(vidas){
    if (vidasText){
        vidasText.setAttribute("value", "VIDAS: " + vidas);
    }
}

document.querySelector("a-scene").addEventListener("loaded", () => {
    initScore();
});


