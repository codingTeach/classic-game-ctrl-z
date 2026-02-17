
AFRAME.registerComponent('snow-z', {
  init: function () {
    const scene = this.el;

    for (let i = 0; i < 100; i++) {
      const flake = document.createElement('a-sphere');
      flake.setAttribute('radius', 0.05);
      flake.setAttribute('color', 'white');
      flake.setAttribute('opacity', 0.6);

      flake.setAttribute('position', {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20,
        z: -Math.random() * 40   // empiezan lejos
      });

      flake.setAttribute('class', 'flake');
      scene.appendChild(flake);
    }
  },

  tick: function () {
    const flakes = document.querySelectorAll('.flake');

    flakes.forEach(flake => {
      let pos = flake.getAttribute('position');

      pos.z += 0.08;   // velocidad gg

      if (pos.z > 5) {  
        pos.z = -40;     // regresan 
      }

      flake.setAttribute('position', pos);
    });
  }
});

document.querySelector('a-scene').setAttribute('snow-z', '');

