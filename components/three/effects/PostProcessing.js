import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { getDevicePerformanceLevel } from '../../../utils/deviceDetection';

export default class PostProcessingManager {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.performanceLevel = getDevicePerformanceLevel();

    this.composer = new EffectComposer(renderer);

    if (this.performanceLevel === 'low') {
      this.bloomIntensity = 0.3;
      this.maxBloomIntensity = 0.5;
      this.bloomFadeSpeed = 0.002;
    } else if (this.performanceLevel === 'medium') {
      this.bloomIntensity = 0.4;
      this.maxBloomIntensity = 0.7;
      this.bloomFadeSpeed = 0.0015;
    } else {
      this.bloomIntensity = 0.5;
      this.maxBloomIntensity = 0.9;
      this.bloomFadeSpeed = 0.001;
    }

    this.resizeHandler = this.handleResize.bind(this);

    this.setupPasses();
    this.handleResize();

    window.addEventListener('resize', this.resizeHandler);
  }

  setupPasses() {
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomResolution = this.performanceLevel === 'low'
      ? new THREE.Vector2(window.innerWidth * 0.5, window.innerHeight * 0.5)
      : new THREE.Vector2(window.innerWidth, window.innerHeight);

    this.bloomPass = new UnrealBloomPass(
      bloomResolution,
      this.bloomIntensity,
      0.3,
      0.9
    );
    this.composer.addPass(this.bloomPass);

    if (this.performanceLevel !== 'low') {
      const scanlineIntensity = this.performanceLevel === 'medium' ? 0.03 : 0.05;
      const scanlineCount = this.performanceLevel === 'medium' ? 400 : 600;

      const scanlinePass = new ShaderPass({
        uniforms: {
          tDiffuse: { value: null },
          scanlineIntensity: { value: scanlineIntensity },
          scanlineCount: { value: scanlineCount }
        },
        vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
        fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float scanlineIntensity;
        uniform float scanlineCount;
        varying vec2 vUv;

        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          float scanline = sin(vUv.y * scanlineCount) * scanlineIntensity;
          color.rgb -= scanline;
          gl_FragColor = color;
        }
      `
      });
      this.composer.addPass(scanlinePass);
    }

    if (this.performanceLevel === 'high') {
      const fxaaPass = new ShaderPass(FXAAShader);
      fxaaPass.uniforms.resolution.value.set(
        1 / window.innerWidth,
        1 / window.innerHeight
      );
      this.composer.addPass(fxaaPass);
    }
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.composer.setSize(width, height);

    const fxaaPass = this.composer.passes.find(
      pass => pass.name === 'ShaderPass' && pass.material && pass.material.uniforms && pass.material.uniforms.resolution
    );

    if (fxaaPass) {
      fxaaPass.uniforms.resolution.value.set(1 / width, 1 / height);
    }
  }

  update() {

    if (this.bloomPass && this.bloomIntensity < this.maxBloomIntensity) {
      this.bloomIntensity += this.bloomFadeSpeed;
      if (this.bloomIntensity > this.maxBloomIntensity) {
        this.bloomIntensity = this.maxBloomIntensity;
      }
      this.bloomPass.strength = this.bloomIntensity;
    }
  }

  render() {
    if (this.composer) {
      this.update();
      this.composer.render();
    }
  }

  dispose() {
    window.removeEventListener('resize', this.resizeHandler);

    if (this.composer) {
      this.composer.passes.forEach(pass => {
        if (pass.dispose) {
          pass.dispose();
        }
        if (pass.material) {
          pass.material.dispose();
        }
        if (pass.fsQuad && pass.fsQuad.material) {
          pass.fsQuad.material.dispose();
        }
      });
    }
  }
}
