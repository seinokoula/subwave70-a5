import * as THREE from 'three';
import SynthwaveSun from '../objects/SynthwaveSun';

export default class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();

    const bgTexture = this.createBackgroundTexture();
    this.scene.background = bgTexture;

    this.scene.fog = new THREE.FogExp2(0x0c0058, 0.015);

    this.sun = new SynthwaveSun(this.scene);
  }

  add(object) {
    this.scene.add(object);
  }

  remove(object) {
    this.scene.remove(object);
  }

  get() {
    return this.scene;
  }

  createBackgroundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const context = canvas.getContext('2d');

    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#330066');
    gradient.addColorStop(0.5, '#220066');
    gradient.addColorStop(1, '#000033');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 2, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;

    return texture;
  }

  animateSun(time) {
    if (this.sun) {
      this.sun.animate(time);
    }
  }
}
