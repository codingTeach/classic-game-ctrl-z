// 🎵 SISTEMA DE AUDIO DEL JUEGO
// Configuración centralizada de todos los sonidos

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE ARCHIVOS DE AUDIO
// ═══════════════════════════════════════════════════════════════

const AUDIO_CONFIG = {
    // Efectos de sonido
    disparo: {
        src: 'sound/disparo.mp3',
        volumen: 0.3
    },
    explosion: {
        src: 'sound/explocion.mp3',  // Nota: el archivo se llama "explocion"
        volumen: 0.4
    },
    vida: {
        src: 'sound/life.mp3',
        volumen: 0.5
    },
    gameOver: {
        src: 'sound/game_over.mp3',
        volumen: 0.6
    },
    pasarNivel: {
        src: 'sound/pasar_nivel.mp3',
        volumen: 0.5
    },
    win: {
        src: 'sound/win.mp3',
        volumen: 0.6
    },
    
    // Música de fondo
    musicaFondo: {
        src: 'sound/fondo.mp3',
        volumen: 0.2,
        loop: true
    }
};

// ═══════════════════════════════════════════════════════════════
// SISTEMA DE AUDIO
// ═══════════════════════════════════════════════════════════════

let audioHabilitado = true;
let musicaHabilitada = true;

// Pool de objetos Audio para efectos de sonido
const audioPool = {};

// Música de fondo
let musicaFondo = null;

// Inicializar sistema de audio
function inicializarAudio() {
    console.log('🎵 Inicializando sistema de audio...');
    
    // Crear objetos Audio para efectos de sonido
    for (const [nombre, config] of Object.entries(AUDIO_CONFIG)) {
        if (nombre !== 'musicaFondo') {
            audioPool[nombre] = new Audio(config.src);
            audioPool[nombre].volume = config.volumen;
            audioPool[nombre].preload = 'auto';
        }
    }
    
    // Crear objeto para música de fondo
    musicaFondo = new Audio(AUDIO_CONFIG.musicaFondo.src);
    musicaFondo.volume = AUDIO_CONFIG.musicaFondo.volumen;
    musicaFondo.loop = AUDIO_CONFIG.musicaFondo.loop;
    musicaFondo.preload = 'auto';
    
    console.log('✅ Sistema de audio inicializado');
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES PARA REPRODUCIR SONIDOS
// ═══════════════════════════════════════════════════════════════

function reproducirSonido(nombre) {
    if (!audioHabilitado || !audioPool[nombre]) return;
    
    try {
        const audio = audioPool[nombre];
        audio.currentTime = 0;  // Reiniciar desde el inicio
        audio.play().catch(err => {
            console.warn(`⚠️ No se pudo reproducir el sonido ${nombre}:`, err);
        });
    } catch (error) {
        console.warn(`⚠️ Error al reproducir ${nombre}:`, error);
    }
}

function iniciarMusicaFondo() {
    if (!musicaHabilitada || !musicaFondo) return;
    
    try {
        musicaFondo.play().catch(err => {
            console.warn('⚠️ No se pudo iniciar la música de fondo:', err);
            // Intentar reproducir cuando el usuario interactúe
            document.addEventListener('click', () => {
                musicaFondo.play().catch(e => console.warn('Error música:', e));
            }, { once: true });
        });
    } catch (error) {
        console.warn('⚠️ Error al iniciar música de fondo:', error);
    }
}

function pausarMusicaFondo() {
    if (musicaFondo) {
        musicaFondo.pause();
    }
}

function detenerMusicaFondo() {
    if (musicaFondo) {
        musicaFondo.pause();
        musicaFondo.currentTime = 0;
    }
}

// ═══════════════════════════════════════════════════════════════
// FUNCIONES ESPECÍFICAS DEL JUEGO
// ═══════════════════════════════════════════════════════════════

function sonidoDisparo() {
    reproducirSonido('disparo');
}

function sonidoExplosion() {
    reproducirSonido('explosion');
}

function sonidoVida() {
    reproducirSonido('vida');
}

function sonidoGameOver() {
    reproducirSonido('gameOver');
}

function sonidoPasarNivel() {
    reproducirSonido('pasarNivel');
}

function sonidoWin() {
    reproducirSonido('win');
}

// ═══════════════════════════════════════════════════════════════
// CONTROLES DE VOLUMEN
// ═══════════════════════════════════════════════════════════════

function cambiarVolumenEfectos(volumen) {
    // volumen debe ser entre 0.0 y 1.0
    for (const [nombre, audio] of Object.entries(audioPool)) {
        const volumenOriginal = AUDIO_CONFIG[nombre].volumen;
        audio.volume = volumenOriginal * volumen;
    }
}

function cambiarVolumenMusica(volumen) {
    // volumen debe ser entre 0.0 y 1.0
    if (musicaFondo) {
        musicaFondo.volume = AUDIO_CONFIG.musicaFondo.volumen * volumen;
    }
}

function toggleAudio() {
    audioHabilitado = !audioHabilitado;
    console.log(`🔊 Efectos de sonido: ${audioHabilitado ? 'ON' : 'OFF'}`);
}

function toggleMusica() {
    musicaHabilitada = !musicaHabilitada;
    if (musicaHabilitada) {
        iniciarMusicaFondo();
    } else {
        pausarMusicaFondo();
    }
    console.log(`🎵 Música: ${musicaHabilitada ? 'ON' : 'OFF'}`);
}

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════

// Inicializar cuando la página cargue
window.addEventListener('load', () => {
    inicializarAudio();
    
    // La música de fondo se iniciará cuando el usuario presione una tecla para jugar
    // Esto evita problemas de autoplay en navegadores
});

// ═══════════════════════════════════════════════════════════════
// CONTROLES DE TECLADO OPCIONALES (M para música, S para sonidos)
// ═══════════════════════════════════════════════════════════════

window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm') {
        toggleMusica();
    }
    if (e.key.toLowerCase() === 's') {
        toggleAudio();
    }
});

console.log('🎵 Audio.js cargado - Controles: M (música), S (sonidos)');
