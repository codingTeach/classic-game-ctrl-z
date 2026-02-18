// 🌌 Sistema de estrellas espaciales

AFRAME.registerComponent('estrellas-espaciales', {
  init: function () {
    const scene = this.el;

    // Crear estrellas con tamaños variados
    for (let i = 0; i < 150; i++) {
      const estrella = document.createElement('a-sphere');
      const tamaño = Math.random() * 0.06 + 0.02; // Tamaños variados
      
      estrella.setAttribute('radius', tamaño);
      estrella.setAttribute('color', 'white');
      estrella.setAttribute('material', {
        emissive: 'white',
        emissiveIntensity: 1.5
      });

      estrella.setAttribute('position', {
        x: (Math.random() - 0.5) * 80,
        y: (Math.random() - 0.5) * 40,
        z: -Math.random() * 40
      });

      estrella.setAttribute('class', 'estrella');
      scene.appendChild(estrella);
    }

    // Agregar algunos asteroides pequeños
    for (let i = 0; i < 8; i++) {
      const asteroide = document.createElement('a-box');
      const tamaño = Math.random() * 0.3 + 0.15;
      
      asteroide.setAttribute('width', tamaño);
      asteroide.setAttribute('height', tamaño);
      asteroide.setAttribute('depth', tamaño);
      asteroide.setAttribute('color', '#777777');

      asteroide.setAttribute('position', {
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 30,
        z: -Math.random() * 35
      });

      asteroide.setAttribute('rotation', {
        x: Math.random() * 360,
        y: Math.random() * 360,
        z: Math.random() * 360
      });

      asteroide.setAttribute('class', 'asteroide');
      scene.appendChild(asteroide);
    }
  },

  tick: function () {
    // Mover estrellas
    const estrellas = document.querySelectorAll('.estrella');
    estrellas.forEach(estrella => {
      let pos = estrella.getAttribute('position');
      pos.z += 0.08;

      if (pos.z > 5) {
        pos.z = -40;
      }

      estrella.setAttribute('position', pos);
    });

    // Mover y rotar asteroides
    const asteroides = document.querySelectorAll('.asteroide');
    asteroides.forEach(asteroide => {
      let pos = asteroide.getAttribute('position');
      let rot = asteroide.getAttribute('rotation');

      pos.z += 0.05;
      rot.x += 0.5;
      rot.y += 0.7;

      if (pos.z > 5) {
        pos.z = -35;
      }

      asteroide.setAttribute('position', pos);
      asteroide.setAttribute('rotation', rot);
    });
  }
});

document.querySelector('a-scene').setAttribute('estrellas-espaciales', '');
