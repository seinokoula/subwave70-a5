import * as THREE from 'three';

export default class CustomShaders {
  constructor() {
    this.shaders = {};
    this.initShaders();
  }

  initShaders() {

    this.shaders.water = {
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          vec3 newPosition = position;
          newPosition.y += sin(position.x * 10.0 + time) * 0.05;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform sampler2D texture;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vec2 uv = vUv;
          uv.x += sin(uv.y * 10.0 + time * 0.5) * 0.02;
          vec4 color = texture2D(texture, uv);
          color.rgb += vec3(0.1, 0.1, 0.3) * sin(time + vPosition.x * 10.0) * 0.1;
          gl_FragColor = color;
        }
      `,
      uniforms: {
        time: { value: 0 },
        texture: { value: null }
      }
    };

    this.shaders.headlight = {
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float intensity;
        uniform vec3 color;
        varying vec2 vUv;
        
        void main() {
          float dist = length(vUv - vec2(0.5, 0.5));
          float alpha = smoothstep(0.5, 0.0, dist) * intensity;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      uniforms: {
        intensity: { value: 1.0 },
        color: { value: new THREE.Color(0xffffcc) }
      }
    };
  }

  createWaterMaterial(texture) {
    const material = new THREE.ShaderMaterial({
      vertexShader: this.shaders.water.vertexShader,
      fragmentShader: this.shaders.water.fragmentShader,
      uniforms: {
        time: { value: 0 },
        texture: { value: texture }
      },
      transparent: true
    });

    return material;
  }

  createHeadlightMaterial(color = 0xffffcc, intensity = 1.0) {
    const material = new THREE.ShaderMaterial({
      vertexShader: this.shaders.headlight.vertexShader,
      fragmentShader: this.shaders.headlight.fragmentShader,
      uniforms: {
        intensity: { value: intensity },
        color: { value: new THREE.Color(color) }
      },
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    return material;
  }

  updateTime(time) {

    for (const key in this.shaders) {
      if (this.shaders[key].uniforms && this.shaders[key].uniforms.time) {
        this.shaders[key].uniforms.time.value = time;
      }
    }
  }
}
