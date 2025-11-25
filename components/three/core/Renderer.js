import * as THREE from 'three';
import { isMobileDevice, getDevicePerformanceLevel } from '../../../utils/deviceDetection';

export default class RendererManager {
  constructor(container) {
    const performanceLevel = getDevicePerformanceLevel();
    const isMobile = isMobileDevice();

    this.renderer = new THREE.WebGLRenderer({
      antialias: performanceLevel === 'high',
      alpha: true,
      powerPreference: isMobile ? "default" : "high-performance",
      stencil: false,
      depth: true
    });

    let pixelRatio = window.devicePixelRatio;
    if (performanceLevel === 'low') {
      pixelRatio = Math.min(pixelRatio, 1);
    } else if (performanceLevel === 'medium') {
      pixelRatio = Math.min(pixelRatio, 1.5);
    } else {
      pixelRatio = Math.min(pixelRatio, 2);
    }

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = performanceLevel !== 'low';
    this.renderer.shadowMap.type = performanceLevel === 'high'
      ? THREE.PCFSoftShadowMap
      : THREE.BasicShadowMap;

    container.appendChild(this.renderer.domElement);

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  handleResize() {
    const container = this.renderer.domElement.parentElement;
    if (container) {
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    }
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
  }

  get() {
    return this.renderer;
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
  }
}
