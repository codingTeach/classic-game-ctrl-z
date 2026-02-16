let score = 0;
let scoreText = null;

function initScore() {

    const camera = document.querySelector("[camera]");

    if (!camera) {
        console.error("No se encontró la cámara");
        return;
    }

    const hud = document.createElement("a-entity");
    hud.setAttribute("position", "0 1.5 -2"); // un poco más arriba

    scoreText = document.createElement("a-text");
    scoreText.setAttribute("value", "SCORE: 0");
    scoreText.setAttribute("color", "#fefe51");
    scoreText.setAttribute("align", "center");
    scoreText.setAttribute("width", 4);
    

    hud.appendChild(scoreText);
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

document.querySelector("a-scene").addEventListener("loaded", () => {
    initScore();
});


