import * as THREE from 'three';

export default class SynthwaveMountains {
  constructor(scene, road) {
    this.scene = scene;
    this.road = road || { roadWidth: 8, roadSpeed: 0.3 };
    this.mountainDepth = 300;
    this.mountainHeight = 30;
    this.mountainExtent = 250;
    this.gridDensityX = 40;
    this.gridDensityZ = 40;
    this.colors = {
      left: 0xff00ff,
      right: 0x00ffff
    };
    this.leftMountain = null;
    this.rightMountain = null;

    this.init();
  }

  init() {

    this.createMountainSide('left');
    this.createMountainSide('right');
  }

  /**
   * Crée une montagne continue sur un côté
   * @param {string} side - 'left' ou 'right'
   */
  createMountainSide(side) {
    const sideMultiplier = side === 'left' ? -1 : 1;
    const color = side === 'left' ? this.colors.left : this.colors.right;
    const gridTexture = this.createGridTexture(side);
    const roadEdge = (this.road.roadWidth / 2 + 0.5) * sideMultiplier;

    const geometry = new THREE.PlaneGeometry(
      this.mountainExtent,
      this.mountainDepth,
      this.gridDensityX,
      this.gridDensityZ
    );

    geometry.rotateX(-Math.PI / 2);

    if (side === 'left') {
      geometry.translate(roadEdge - this.mountainExtent / 2, 0, this.mountainDepth / 2);
    } else {
      geometry.translate(roadEdge + this.mountainExtent / 2, 0, this.mountainDepth / 2);
    }

    const positions = geometry.attributes.position.array;
    const mountainProfile = this.generateMountainProfile(20);

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];

      let distanceFromRoad;
      if (side === 'left') {
        distanceFromRoad = Math.abs((x - roadEdge) / this.mountainExtent);
      } else {
        distanceFromRoad = Math.abs((x - roadEdge) / this.mountainExtent);
      }

      const depthFactor = z / this.mountainDepth;

      const profileIndex = Math.min(Math.floor(distanceFromRoad * mountainProfile.length), mountainProfile.length - 1);
      let height = mountainProfile[profileIndex] * this.mountainHeight;

      const zVariation = Math.sin(depthFactor * Math.PI * 8) * 0.2 +
        Math.sin(depthFactor * Math.PI * 15) * 0.1;

      let distanceFade;
      if (depthFactor < 0.3) {

        distanceFade = 1.0;
      } else {

        distanceFade = 1.0 - ((depthFactor - 0.3) / 0.7) * 0.3;
      }

      height = height * (1 + zVariation) * distanceFade;

      if (depthFactor < 0.2 && distanceFromRoad > 0.7) {

        height *= 1.5 + (1.0 - depthFactor) * 1.5;
      }

      if (distanceFromRoad < 0.05) {
        height *= distanceFromRoad / 0.05;
      }

      positions[i + 1] = height;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
      map: gridTexture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });

    const mountain = new THREE.Mesh(geometry, material);

    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 2
    });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);

    const mountainGroup = new THREE.Group();
    mountainGroup.add(mountain);
    mountainGroup.add(edges);

    this.scene.add(mountainGroup);

    if (side === 'left') {
      this.leftMountain = mountainGroup;
    } else {
      this.rightMountain = mountainGroup;
    }

    return mountainGroup;
  }

  /**
   * Génère un profil de montagne
   * @param {number} points - Nombre de points dans le profil
   * @returns {Array} - Tableau de hauteurs
   */
  generateMountainProfile(points) {
    const profile = [];

    profile.push(0);

    for (let i = 1; i < points - 1; i++) {
      const x = i / (points - 1);

      let height;
      if (x < 0.3) {

        height = x / 0.3;
      } else if (x < 0.7) {

        height = 1.0;
      } else {

        height = 1.0 - ((x - 0.7) / 0.3) * 0.3;
      }

      height *= 0.7 + 0.3 * Math.sin(x * Math.PI * 3);

      const seed = Math.sin(i * 12345.6789) * 0.5 + 0.5;
      height *= 0.85 + seed * 0.3;

      if (i > points * 0.7) {
        height *= 1.2;
      }

      profile.push(height);
    }

    profile.push(0.8);

    return profile;
  }

  /**
   * Crée une texture de grille avec fond noir
   * @param {string} side - 'left' ou 'right' pour déterminer la couleur
   * @returns {THREE.Texture} - La texture de grille
   */
  createGridTexture(side) {
    const color = side === 'left' ? '#ff00ff' : '#00ffff';
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gridSize = 64;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 8);

    return texture;
  }

  /**
   * Déplace les montagnes pour simuler le mouvement
   */
  update() {

    const speed = this.road ? this.road.roadSpeed : 0.3;

    if (this.leftMountain) {
      this.updateMountainTexture(this.leftMountain, speed);
    }

    if (this.rightMountain) {
      this.updateMountainTexture(this.rightMountain, speed);
    }
  }

  /**
   * Met à jour la texture d'une montagne pour simuler le mouvement
   * @param {THREE.Group} mountainGroup - Le groupe contenant la montagne
   * @param {number} speed - La vitesse de déplacement
   */
  updateMountainTexture(mountainGroup, speed) {

    if (mountainGroup.children.length > 0) {
      const mountain = mountainGroup.children[0];

      if (mountain && mountain.material && mountain.material.map) {

        mountain.material.map.offset.y += speed * 0.05;
        mountain.material.map.needsUpdate = true;
      }
    }
  }
}
