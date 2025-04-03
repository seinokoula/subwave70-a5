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


  addSynthwaveGrid() {
    const gridGroup = new THREE.Group();

    const gridSize = 300;
    const gridDivisions = 30;


    const gridMaterialMagenta = new THREE.LineBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.8,
      linewidth: 2
    });


    const gridMaterialCyan = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
      linewidth: 2
    });


    for (let i = -gridSize / 2; i <= gridSize / 2; i += gridSize / gridDivisions) {
      const points = [];
      points.push(new THREE.Vector3(-gridSize / 2, -0.1, i));
      points.push(new THREE.Vector3(gridSize / 2, -0.1, i));

      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = (Math.floor(i + gridSize / 2) % (2 * gridSize / gridDivisions) === 0) ?
        gridMaterialMagenta : gridMaterialCyan;
      const line = new THREE.Line(geometry, material);
      gridGroup.add(line);
    }


    for (let i = -gridSize / 2; i <= gridSize / 2; i += gridSize / gridDivisions) {
      const points = [];
      points.push(new THREE.Vector3(i, -0.1, -gridSize / 2));
      points.push(new THREE.Vector3(i, -0.1, gridSize / 2));

      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = (Math.floor(i + gridSize / 2) % (2 * gridSize / gridDivisions) === 0) ?
        gridMaterialCyan : gridMaterialMagenta;
      const line = new THREE.Line(geometry, material);
      gridGroup.add(line);
    }

    this.addSynthwaveMountains();

    this.scene.add(gridGroup);
  }

  addSynthwaveMountains() {
    const mountainsGroup = new THREE.Group();

    for (let d = 0; d < 3; d++) {
      const distance = 100 + d * 30;
      const width = 300;
      const height = 20 - d * 5;
      const segments = 50;

      const points = [];

      for (let i = 0; i <= segments; i++) {
        const x = (i / segments) * width - width / 2;

        const y = Math.max(0, Math.sin(i * 0.1) * height * 0.5 +
          Math.sin(i * 0.35) * height * 0.3 +
          Math.random() * height * 0.2);

        points.push(new THREE.Vector3(x, y, -distance));
      }

      points.push(new THREE.Vector3(width / 2, -1, -distance));
      points.push(new THREE.Vector3(-width / 2, -1, -distance));


      const mountainGeometry = new THREE.BufferGeometry();
      mountainGeometry.setFromPoints(points);

      const indices = [];
      for (let i = 0; i < segments; i++) {
        indices.push(i, i + 1, segments + 1);
        indices.push(i, segments + 1, segments + 2);
      }
      mountainGeometry.setIndex(indices);

      const color = new THREE.Color(0.5 - d * 0.15, 0, 0.5 - d * 0.1);
      const mountainMaterial = new THREE.MeshBasicMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.8 - d * 0.2
      });

      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      mountainsGroup.add(mountain);


      const edgesGeometry = new THREE.EdgesGeometry(mountainGeometry);
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: new THREE.Color(0.8 - d * 0.2, 0, 0.8 - d * 0.2),
        linewidth: 1.5
      });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      mountainsGroup.add(edges);
    }

    this.scene.add(mountainsGroup);
  }

  animateSun(time) {
    if (this.sun) {
      this.sun.animate(time);
    }
  }

  setupEnvironment() {

    this.addSynthwaveGrid();
  }
}
