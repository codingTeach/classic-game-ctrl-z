// 🔧 HERRAMIENTAS DE DEBUG

console.log('🛠️ Modo Debug activado');

// Matar todos los aliens instantáneamente (Tecla K)
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'k') {
        matarTodosLosAliens();
    }
});

function matarTodosLosAliens() {
    const aliens = document.querySelectorAll('.alien');
    console.log(`Matando ${aliens.length} aliens instantáneamente`);
    
    aliens.forEach((alien, index) => {
        setTimeout(() => {
            if (alien && alien.parentElement) {
                // Crear explosión
                if (typeof explosionAlien === 'function') {
                    explosionAlien(alien);
                }
                
                // Sumar puntos
                if (typeof addScore === 'function') {
                    addScore(alien.puntos ?? 10);
                }
                
                // Eliminar el alien
                alien.remove();
                
                // Verificar nivel completado en el último alien
                if (index === aliens.length - 1) {
                    setTimeout(() => {
                        if (typeof verificarNivelCompletado === 'function') {
                            verificarNivelCompletado();
                        }
                    }, 100);
                }
            }
        }, index * 50); // Pequeño delay entre cada uno para ver las explosiones
    });
}

// Tecla I para mostrar información del juego
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'i') {
        mostrarInfoDebug();
    }
});

function mostrarInfoDebug() {
    const aliens = document.querySelectorAll('.alien').length;
    const bloques = document.querySelectorAll('.bloque').length;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(' INFO DEBUG:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(` Nivel actual: ${typeof nivelActual !== 'undefined' ? nivelActual : 'N/A'}`);
    console.log(` Score: ${typeof score !== 'undefined' ? score : 'N/A'}`);
    console.log(` Vidas: ${typeof playerVidas !== 'undefined' ? playerVidas : 'N/A'}`);
    console.log(` Aliens restantes: ${aliens}`);
    console.log(` Bloques de defensa: ${bloques}`);
    console.log(` Juego activo: ${typeof juegoActivo !== 'undefined' ? juegoActivo : 'N/A'}`);
    console.log(` Estado cámara: ${typeof cameraState !== 'undefined' ? cameraState : 'N/A'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Tecla G para añadir vidas (God mode)
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'g') {
        if (typeof playerVidas !== 'undefined') {
            playerVidas = 3;
            if (typeof updateVidas === 'function') {
                updateVidas(playerVidas);
            }
            console.log('Vidas restauradas a 3');
        }
    }
});

// Tecla N para saltar directamente al siguiente nivel
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'n') {
        console.log('Saltando al siguiente nivel');
        matarTodosLosAliens();
    }
});

// Mostrar controles de debug al inicio
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('CONTROLES DE DEBUG:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('K - Matar todos los aliens');
console.log('I - Mostrar información del juego');
console.log('G - Restaurar vidas (God mode)');
console.log('N - Saltar al siguiente nivel');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
