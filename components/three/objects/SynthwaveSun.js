
import * as THREE from 'three';

export default class SynthwaveSun {
  constructor(scene) {
    this.scene = scene;
    this.sunGroup = new THREE.Group();
    this.scene.add(this.sunGroup);
    this.createSynthwaveSun();
    this.rippleTime = 0;
    this.lastRippleTime = 0;
    this.ripples = [];
  }

  createSynthwaveSun() {

    this.sunMesh = new THREE.Group();

    const sunGeometry = new THREE.CircleGeometry(25, 64);
    const sunTexture = this.createSunTexture();
    const sunMaterial = new THREE.MeshBasicMaterial({
      map: sunTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      fog: false
    });

    const sun = new THREE.Mesh(sunGeometry, sunMaterial);

    sun.position.set(0, 10, 180);
    sun.lookAt(0, 10, 0);

    const haloGeometry = new THREE.CircleGeometry(35, 64);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      fog: false
    });

    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.position.set(0, 10, 179.9);
    halo.lookAt(0, 10, 0);

    this.sunMesh.add(sun);
    this.sunMesh.add(halo);
    this.addBloomLayers(sun.position);
    this.sunGroup.add(this.sunMesh);
    this.addSynthwaveLines(sun);
    this.setupRippleEffect(sun.position);
  }

  /**
   * Ajoute des couches supplémentaires pour l'effet de bloom (réduit)
   * @param {THREE.Vector3} position - Position du soleil
   */
  addBloomLayers(position) {

    const bloom1Geometry = new THREE.CircleGeometry(30, 64);
    const bloom1Material = new THREE.MeshBasicMaterial({
      color: 0xffdd44,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      fog: false
    });

    const bloom1 = new THREE.Mesh(bloom1Geometry, bloom1Material);
    bloom1.position.set(position.x, position.y, position.z - 0.2);
    bloom1.lookAt(0, 10, 0);
    this.sunMesh.add(bloom1);

    const bloom2Geometry = new THREE.CircleGeometry(40, 64);
    const bloom2Material = new THREE.MeshBasicMaterial({
      color: 0xff9900,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      fog: false
    });

    const bloom2 = new THREE.Mesh(bloom2Geometry, bloom2Material);
    bloom2.position.set(position.x, position.y, position.z - 0.3);
    bloom2.lookAt(0, 10, 0);
    this.sunMesh.add(bloom2);

    const bloom3Geometry = new THREE.CircleGeometry(55, 64);
    const bloom3Material = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      fog: false
    });

    const bloom3 = new THREE.Mesh(bloom3Geometry, bloom3Material);
    bloom3.position.set(position.x, position.y, position.z - 0.4);
    bloom3.lookAt(0, 10, 0);
    this.sunMesh.add(bloom3);

    const sunLight = new THREE.PointLight(0xffcc00, 1.2, 300);
    sunLight.position.set(position.x, position.y, position.z - 50);
    this.sunMesh.add(sunLight);


    this.bloomLayers = [bloom1, bloom2, bloom3];
  }

  /**
   * Configure l'effet de ripple amélioré
   * @param {THREE.Vector3} position - Position du soleil
   */
  setupRippleEffect(position) {

    this.rippleGroup = new THREE.Group();
    this.rippleGroup.position.set(position.x, position.y, position.z - 0.1);
    this.rippleGroup.lookAt(0, 10, 0);
    this.sunMesh.add(this.rippleGroup);
    this.rippleConfig = {
      maxRipples: 5,
      interval: 1.5,
      minLifetime: 3,
      maxLifetime: 5,
      startRadius: 25,
      endRadiusMin: 45,
      endRadiusMax: 70,
      startThickness: 0.5,
      endThickness: 3,
      startOpacity: 0.6,
      colors: [
        0xffcc00,
        0xffaa00,
        0xff8800,
        0xff6600
      ]
    };

    this.ripples = [];

    this.lastRippleTime = -Math.random() * this.rippleConfig.interval;
  }

  /**
   * Crée un nouvel anneau de ripple avec des paramètres améliorés
   */
  createRipple() {

    const colorIndex = Math.floor(Math.random() * this.rippleConfig.colors.length);
    const color = this.rippleConfig.colors[colorIndex];

    const lifetime = this.rippleConfig.minLifetime +
      Math.random() * (this.rippleConfig.maxLifetime - this.rippleConfig.minLifetime);

    const endRadius = this.rippleConfig.endRadiusMin +
      Math.random() * (this.rippleConfig.endRadiusMax - this.rippleConfig.endRadiusMin);

    const ringGeometry = new THREE.RingGeometry(
      this.rippleConfig.startRadius,
      this.rippleConfig.startRadius + this.rippleConfig.startThickness,
      64
    );

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: this.rippleConfig.startOpacity,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      fog: false,
      side: THREE.DoubleSide
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);

    ring.userData = {
      startTime: this.rippleTime,
      lifetime: lifetime,
      startRadius: this.rippleConfig.startRadius,
      endRadius: endRadius,
      startThickness: this.rippleConfig.startThickness,
      endThickness: this.rippleConfig.endThickness,
      startOpacity: this.rippleConfig.startOpacity,
      color: color
    };

    this.rippleGroup.add(ring);

    this.ripples.push(ring);
  }


  createSunTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2;

    const gradient = context.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );

    gradient.addColorStop(0.0, '#ffffff');
    gradient.addColorStop(0.15, '#ffffcc');
    gradient.addColorStop(0.4, '#ffd300');
    gradient.addColorStop(1, '#ff7f00');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    this.addSunRays(context, centerX, centerY, radius);

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Ajoute des rayons solaires à la texture du soleil
   * @param {CanvasRenderingContext2D} context - Contexte du canvas
   * @param {number} centerX - Centre X du soleil
   * @param {number} centerY - Centre Y du soleil
   * @param {number} radius - Rayon du soleil
   */
  addSunRays(context, centerX, centerY, radius) {
    const rayCount = 12;
    const rayLength = radius * 0.3;

    context.save();
    context.translate(centerX, centerY);

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const rayGradient = context.createLinearGradient(
        0, 0,
        Math.cos(angle) * rayLength, Math.sin(angle) * rayLength
      );

      rayGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      rayGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(
        Math.cos(angle) * rayLength,
        Math.sin(angle) * rayLength
      );
      context.lineWidth = radius * 0.1;
      context.strokeStyle = rayGradient;
      context.stroke();
    }

    context.restore();
  }

  addSynthwaveLines(sun) {

    const linesGeometry = new THREE.PlaneGeometry(60, 10);

    const linesTexture = this.createLinesTexture();

    const linesMaterial = new THREE.MeshBasicMaterial({
      map: linesTexture,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      fog: false
    });

    const lines = new THREE.Mesh(linesGeometry, linesMaterial);

    lines.position.set(0, -25, 0);
    lines.rotation.x = 0;

    sun.add(lines);
  }

  createLinesTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    const lineCount = 6;
    const lineHeight = 4;
    const spacing = (canvas.height - lineCount * lineHeight) / (lineCount + 1);

    for (let i = 0; i < lineCount; i++) {
      const y = spacing + i * (lineHeight + spacing);
      const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, 'rgba(255, 220, 0, 0)');
      gradient.addColorStop(0.3, 'rgba(255, 220, 0, 0.8)');
      gradient.addColorStop(0.7, 'rgba(255, 220, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 220, 0, 0)');
      context.fillStyle = gradient;
      context.fillRect(0, y, canvas.width, lineHeight);
    }

    return new THREE.CanvasTexture(canvas);
  }

  animate(time) {
    if (this.sunGroup) {

      this.rippleTime = time;
      this.sunGroup.position.y = 10 + Math.sin(time * 0.1) * 0.5;

      if (this.bloomLayers) {

        this.bloomLayers.forEach((layer, index) => {

          const pulseFactor = 0.05 + (Math.sin(time * (0.05 + index * 0.02)) + 1) * 0.03;
          const rippleFactor = Math.sin(time * 0.2 - index * 0.5) * 0.02;
          layer.scale.set(1 + pulseFactor + rippleFactor, 1 + pulseFactor + rippleFactor, 1);

          if (layer.material) {
            const baseOpacity = (0.25 - index * 0.08) * 0.8;
            const rippleOpacity = Math.sin(time * 0.3 - index * 0.4) * 0.05;
            layer.material.opacity = baseOpacity * (0.8 + Math.sin(time * 0.1) * 0.2) + rippleOpacity;
          }
        });
      }

      this.updateRipples();
    }
  }

  /**
   * Met à jour et anime les ripples
   */
  updateRipples() {

    const timeSinceLastRipple = this.rippleTime - this.lastRippleTime;

    if (timeSinceLastRipple >= this.rippleConfig.interval && this.ripples.length < this.rippleConfig.maxRipples) {
      this.createRipple();
      this.lastRippleTime = this.rippleTime;
    }

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const ripple = this.ripples[i];
      const elapsedTime = this.rippleTime - ripple.userData.startTime;
      const progress = Math.min(elapsedTime / ripple.userData.lifetime, 1);

      if (progress >= 1) {

        this.rippleGroup.remove(ripple);
        ripple.geometry.dispose();
        ripple.material.dispose();
        this.ripples.splice(i, 1);
      } else {

        const currentRadius = ripple.userData.startRadius +
          (ripple.userData.endRadius - ripple.userData.startRadius) * progress;

        const currentThickness = ripple.userData.startThickness +
          (ripple.userData.endThickness - ripple.userData.startThickness) *
          this.easeInOutQuad(progress);


        ripple.geometry.dispose();
        ripple.geometry = new THREE.RingGeometry(
          currentRadius,
          currentRadius + currentThickness,
          64
        );

        let opacityFactor;
        if (progress < 0.2) {

          opacityFactor = progress / 0.2;
        } else {

          opacityFactor = 1 - ((progress - 0.2) / 0.8);
        }

        ripple.material.opacity = ripple.userData.startOpacity * this.easeOutQuad(opacityFactor);
      }
    }
  }

  /**
   * Fonction d'atténuation quadratique entrée/sortie
   * @param {number} t - Progression (0-1)
   * @returns {number} Valeur atténuée
   */
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /**
   * Fonction d'atténuation quadratique sortie
   * @param {number} t - Progression (0-1)
   * @returns {number} Valeur atténuée
   */
  easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }
}
