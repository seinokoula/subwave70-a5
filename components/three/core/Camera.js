import * as THREE from 'three';

export default class CameraManager {
  constructor(container) {
    this.camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    this.camera.position.set(0, 3, -5);
    this.camera.lookAt(0, 0, 10);

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  handleResize() {
    const container = document.getElementById('game-container');
    if (container) {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  }

  get() {
    return this.camera;
  }

  followCar(carPosition) {
    this.camera.position.x = carPosition.x * 0.3;
    this.camera.position.z = carPosition.z - 5;
    this.camera.lookAt(carPosition.x * 0.5, 0, carPosition.z + 10);
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize);
  }
}
