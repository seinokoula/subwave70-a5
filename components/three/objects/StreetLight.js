import * as THREE from 'three';

export default class Streetlight {
  constructor(scene, road) {
    this.scene = scene;
    this.road = road;
    this.streetlights = [];
    this.spacing = 40;
    this.height = 5;
    this.roadWidth = road.roadWidth;
    this.glowIntensity = 0;
    this.maxGlowIntensity = 1.5;
    this.glowFadeInSpeed = 0.005;
    this.glowActive = false;

    this.init();
  }

  init() {

    const totalDistance = this.road.totalSegments * this.road.segmentLength;
    const numLights = Math.ceil(totalDistance / this.spacing) + 1;

    for (let i = 0; i < numLights; i += 2) {

      this.createSynthwaveLight(this.roadWidth / 2 + 1, i * this.spacing, 0xff00ff);
      this.createSynthwaveLight(-this.roadWidth / 2 - 1, i * this.spacing, 0x00ffff);
    }

    setTimeout(() => {
      this.glowActive = true;
    }, 5000);
  }

  createSynthwaveLight(xPosition, zPosition, color) {

    const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, this.height, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      emissive: color,
      emissiveIntensity: 0.2
    });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(xPosition, this.height / 2, zPosition);
    pole.castShadow = true;

    const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const arm = new THREE.Mesh(armGeometry, poleMaterial);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(
      xPosition + (xPosition > 0 ? -0.75 : 0.75),
      this.height,
      zPosition
    );

    const lampGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const lampMaterial = new THREE.MeshBasicMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 1.0
    });
    const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
    lamp.position.set(
      xPosition + (xPosition > 0 ? -1.5 : 1.5),
      this.height,
      zPosition
    );

    const haloGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.position.copy(lamp.position);

    const light = new THREE.PointLight(color, 0, 15);
    light.position.copy(lamp.position);

    this.scene.add(pole, arm, lamp, halo, light);

    this.streetlights.push({
      elements: [pole, arm, lamp, halo, light],
      zPosition: zPosition,
      color: color,
      halo: halo,
      light: light
    });

    return { pole, arm, lamp, halo, light };
  }

  update() {

    if (this.glowActive && this.glowIntensity < this.maxGlowIntensity) {
      this.glowIntensity += this.glowFadeInSpeed;
      if (this.glowIntensity > this.maxGlowIntensity) {
        this.glowIntensity = this.maxGlowIntensity;
      }
    }

    for (let i = 0; i < this.streetlights.length; i++) {
      const streetlight = this.streetlights[i];

      for (const element of streetlight.elements) {
        element.position.z -= this.road.roadSpeed;
      }

      if (streetlight.halo && streetlight.light) {

        const pulseIntensity = this.glowIntensity * (0.7 + Math.sin(Date.now() * 0.005) * 0.3);
        streetlight.halo.material.opacity = 0.3 * pulseIntensity;
        streetlight.light.intensity = pulseIntensity;
      }

      streetlight.zPosition -= this.road.roadSpeed;

      if (streetlight.zPosition < -20) {

        const farthestZ = Math.max(...this.streetlights.map(s => s.zPosition));
        const newZ = farthestZ + this.spacing;

        const offsetZ = newZ - streetlight.zPosition;
        for (const element of streetlight.elements) {
          element.position.z += offsetZ;
        }

        streetlight.zPosition = newZ;
      }
    }
  }
}
