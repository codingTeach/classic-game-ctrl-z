// SISTEMA DE NIVELES

let nivelActual = 1;
const NIVEL_MAXIMO = 3;
let transicionEnCurso = false;

// Configuración por nivel
const CONFIG_NIVELES = {
    1: {
        filas: 5,
        shootInterval: 1500,
        mensaje: "NIVEL 1"
    },
    2: {
        filas: 6,
        shootInterval: 1200,
        mensaje: "NIVEL 2"
    },
    3: {
        filas: 7,
        shootInterval: 900,
        mensaje: "NIVEL 3"
    }
};

// Verificar si quedan enemigos
function verificarNivelCompletado() {
    if (transicionEnCurso || !juegoActivo) return;
    
    // Solo verificar si el estado de la cámara es "juego" (después de la intro)
    if (typeof cameraState !== 'undefined' && cameraState !== 'juego') return;
    
    const aliensRestantes = document.querySelectorAll('.alien').length;
    console.log(`👾 Aliens restantes: ${aliensRestantes}`);
    
    if (aliensRestantes === 0) {
        console.log(`✅ Nivel ${nivelActual} completado!`);
        
        if (nivelActual >= NIVEL_MAXIMO) {
            mostrarPantallaVictoria();
        } else {
            pasarSiguienteNivel();
        }
    }
}

// Pasar al siguiente nivel
function pasarSiguienteNivel() {
    transicionEnCurso = true;
    nivelActual++;
    
    console.log(`📈 Avanzando a nivel ${nivelActual}`);
    
    // 🔊 Reproducir sonido de pasar nivel
    if (typeof sonidoPasarNivel === 'function') {
        sonidoPasarNivel();
    }
    
    // Actualizar HUD
    if (typeof updateNivel === 'function') {
        updateNivel(nivelActual);
    }
    
    // Detener disparos de aliens
    detenerDisparosAliens();
    
    // Mostrar mensaje de nivel
    mostrarMensajeNivel();
    
    // Esperar 3 segundos y luego iniciar el nuevo nivel
    setTimeout(() => {
        ocultarMensajeNivel();
        reiniciarNivel();
        transicionEnCurso = false;
    }, 3000);
}

// Mostrar mensaje de nivel
function mostrarMensajeNivel() {
    const config = CONFIG_NIVELES[nivelActual];
    
    const overlay = document.createElement('div');
    overlay.id = 'nivelOverlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1000',
        animation: 'fadeIn 0.5s ease-in'
    });
    
    const titulo = document.createElement('div');
    titulo.textContent = config.mensaje;
    Object.assign(titulo.style, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '80px',
        color: '#fefe51',
        textShadow: '0 0 30px rgba(254, 254, 81, 0.9), 0 0 60px rgba(254, 254, 81, 0.5)',
        marginBottom: '30px',
        animation: 'pulse 1s infinite'
    });
    
    const subtitulo = document.createElement('div');
    subtitulo.textContent = 'PREPÁRATE';
    Object.assign(subtitulo.style, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '24px',
        color: '#ffffff',
        opacity: '0.8'
    });
    
    overlay.appendChild(titulo);
    overlay.appendChild(subtitulo);
    document.body.appendChild(overlay);
    
    // Añadir animación CSS
    if (!document.getElementById('nivelAnimations')) {
        const style = document.createElement('style');
        style.id = 'nivelAnimations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);
    }
}

function ocultarMensajeNivel() {
    const overlay = document.getElementById('nivelOverlay');
    if (overlay) overlay.remove();
}

// Reiniciar nivel con nueva configuración
function reiniciarNivel() {
    const config = CONFIG_NIVELES[nivelActual];
    
    console.log(`🔄 Reiniciando nivel ${nivelActual}...`);
    
    // Actualizar configuración de enemigos (solo velocidad de disparo cambia)
    CONFIG.aliens.shootInterval = config.shootInterval;
    
    // Limpiar aliens anteriores
    limpiarAliens();
    
    // Regenerar bases de defensa
    if (typeof limpiarBases === 'function' && typeof crearTodasLasBases === 'function') {
        limpiarBases();
        crearTodasLasBases();
    }
    
    // SIEMPRE crear las mismas 5 filas del nivel 1
    // Solo cambia la velocidad de disparo para aumentar dificultad
    if (typeof crearNuevoGrupoAliens === 'function') {
        crearNuevoGrupoAliens();
    }
    
    const modelos = CONFIG.rows;
    
    // Siempre crear las 5 filas originales
    console.log(`📊 Creando formación estándar (5 filas)...`);
    
    for (let i = 0; i < 5; i++) {
        const { model, puntos } = modelos[i];
        console.log(`  Fila ${i}: ${model} (${puntos} pts)`);
        crearFilaInvaders(model, i, puntos);
    }
    
    // Verificar cuántos aliens se crearon
    setTimeout(() => {
        const aliensCreados = document.querySelectorAll('.alien').length;
        console.log(`✅ Aliens creados: ${aliensCreados}`);
    }, 100);
    
    // Reiniciar movimiento
    moverAliens();
    
    // Reiniciar disparos con nueva velocidad
    iniciarDisparosAliens();
    
    console.log(`🎮 Nivel ${nivelActual} iniciado - Velocidad disparo: ${config.shootInterval}ms`);
}

// Limpiar todos los aliens
function limpiarAliens() {
    // Limpiar cualquier alien suelto
    document.querySelectorAll('.alien').forEach(alien => {
        if (alien && alien.parentElement) {
            alien.remove();
        }
    });
    
    // Limpiar disparos de aliens
    document.querySelectorAll('a-entity').forEach(entity => {
        if (entity && entity.querySelector) {
            const box = entity.querySelector('a-box[color="#00ff00"]');
            if (box && entity.parentElement) {
                entity.remove();
            }
        }
    });
    
    // NOTA: alienGroup se limpia y recrea en crearNuevoGrupoAliens()
}

// Mostrar pantalla de victoria
function mostrarPantallaVictoria() {
    juegoActivo = false;
    detenerDisparosAliens();
    
    // 🎵 Pausar música de fondo
    if (typeof pausarMusicaFondo === 'function') {
        pausarMusicaFondo();
    }
    
    // 🔊 Reproducir sonido de victoria
    if (typeof sonidoWin === 'function') {
        sonidoWin();
    }
    
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '1001',
        animation: 'fadeIn 1s ease-in'
    });
    
    const titulo = document.createElement('div');
    titulo.textContent = '¡GANASTE!';
    Object.assign(titulo.style, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '100px',
        fontWeight: 'bold',
        color: '#00ff00',
        textShadow: '0 0 40px rgba(0, 255, 0, 0.9), 0 0 80px rgba(0, 255, 0, 0.5)',
        marginBottom: '40px',
        animation: 'pulse 1.5s infinite'
    });
    
    const mensaje = document.createElement('div');
    mensaje.textContent = '¡COMPLETASTE TODOS LOS NIVELES!';
    Object.assign(mensaje.style, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '20px',
        color: '#ffffff',
        marginBottom: '60px',
        textAlign: 'center'
    });
    
    const scoreText = document.createElement('div');
    scoreText.textContent = `PUNTUACIÓN FINAL: ${score}`;
    Object.assign(scoreText.style, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '28px',
        color: '#fefe51',
        textShadow: '0 0 20px rgba(254, 254, 81, 0.8)',
        marginBottom: '40px'
    });
    
    const reiniciar = document.createElement('div');
    reiniciar.textContent = 'Presiona R para jugar de nuevo';
    Object.assign(reiniciar.style, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '16px',
        color: 'white',
        opacity: '0.7',
        animation: 'blink 1.5s infinite'
    });
    
    overlay.appendChild(titulo);
    overlay.appendChild(mensaje);
    overlay.appendChild(scoreText);
    overlay.appendChild(reiniciar);
    document.body.appendChild(overlay);
    
    // Añadir animación de parpadeo si no existe
    if (!document.getElementById('victoryAnimations')) {
        const style = document.createElement('style');
        style.id = 'victoryAnimations';
        style.textContent = `
            @keyframes blink {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 0.2; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Obtener configuración del nivel actual
function obtenerConfigNivel() {
    return CONFIG_NIVELES[nivelActual];
}

// Reiniciar el juego completo
function reiniciarJuegoCompleto() {
    console.log('🔄 Reiniciando juego completo...');
    
    // Resetear variables globales
    nivelActual = 1;
    score = 0;
    playerVidas = 3;
    transicionEnCurso = false;
    juegoActivo = true;
    
    // Limpiar elementos
    limpiarAliens();
    
    // Regenerar bases de defensa
    if (typeof limpiarBases === 'function' && typeof crearTodasLasBases === 'function') {
        limpiarBases();
        crearTodasLasBases();
    }
    
    // Limpiar disparos del jugador
    document.querySelectorAll('a-sphere[material*="cyan"]').forEach(bala => {
        if (bala.parentElement.tagName === 'A-SCENE') {
            bala.remove();
        }
    });
    
    // Resetear HUD
    if (typeof updateScore === 'function') updateScore();
    if (typeof updateVidas === 'function') updateVidas(playerVidas);
    if (typeof updateNivel === 'function') updateNivel(nivelActual);
    
    // Resetear posición del jugador
    if (player) {
        player.object3D.position.set(0, 0.5, 1);
        player.setAttribute('visible', true);
        playerInvencible = false;
    }
    
    // 🎵 Reiniciar música de fondo
    if (typeof iniciarMusicaFondo === 'function') {
        iniciarMusicaFondo();
    }
    
    // Reiniciar nivel 1
    reiniciarNivel();
}

// Listener global para reiniciar con R
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r' && !juegoActivo) {
        // Remover overlays
        document.querySelectorAll('[style*="position: fixed"]').forEach(overlay => {
            if (overlay.id !== 'hud' && overlay.id !== 'retroIntro') {
                overlay.remove();
            }
        });
        
        reiniciarJuegoCompleto();
    }
});
