

import * as THREE from 'three';

export default class Road {
  constructor(scene) {
    this.scene = scene;
    this.segments = [];
    this.segmentLength = 50;
    this.totalSegments = 6;
    this.roadWidth = 8;
    this.roadSpeed = 0.3;
    this.baseSpeed = 0.3;
    this.maxSpeed = 1.2;
    this.speedIncrement = 0.00005;
    this.spawnDistance = 150;
    this.fullVisibleDistance = 50;
    this.laneCount = 3;
    this.laneWidth = this.roadWidth / this.laneCount;
    this.lastUpdateTime = 0;
    this.gameTime = 0;
    this.gameStarted = false;
    this.gridSize = 1.5;
    this.horizonDistance = 200;
    this.roadGroup = new THREE.Group();

    this.init();
  }

  async init() {
    try {

      this.scene.add(this.roadGroup);

      this.createSynthwaveRoad();

      this.createLaneLines();

      this.adjustRoadPosition();
    } catch (error) {
      console.error("Erreur lors de l'initialisation de la route synthwave:", error);
    }
  }


  adjustRoadPosition() {

    this.roadGroup.position.z = -15;

    if (this.mainRoad) {

      this.mainRoad.scale.y = 1.5;

      this.mainRoad.position.z *= 1.5;
    }
  }

  createSynthwaveRoad() {

    const texture = this.createGridTexture();

    const roadMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: false
    });

    const roadGeometry = new THREE.PlaneGeometry(
      this.roadWidth * 1.85,
      this.horizonDistance
    );

    const road = new THREE.Mesh(roadGeometry, roadMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, this.horizonDistance / 2);

    this.roadGroup.add(road);

    this.mainRoad = road;

    this.segments.push({
      mesh: road,
      zPosition: 0
    });
  }

  createGridTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gridSize = canvas.width / 20;

    ctx.strokeStyle = '#ff00ff';
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

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 10);

    return texture;
  }

  createLaneLines() {

    const leftLineX = -this.roadWidth / 3;
    const middleLineX = 0;
    const rightLineX = this.roadWidth / 3;

    const laneMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.9
    });

    this.laneLines = new THREE.Group();
    this.roadGroup.add(this.laneLines);

    const leftLineGeometry = new THREE.PlaneGeometry(0.15, this.horizonDistance * 1.2);
    const leftLine = new THREE.Mesh(leftLineGeometry, laneMaterial);
    leftLine.rotation.x = -Math.PI / 2;
    leftLine.position.set(leftLineX, 0.03, this.horizonDistance / 2);
    this.laneLines.add(leftLine);

    const middleLineGeometry = new THREE.PlaneGeometry(0.15, this.horizonDistance * 1.2);
    const middleLine = new THREE.Mesh(middleLineGeometry, laneMaterial);
    middleLine.rotation.x = -Math.PI / 2;
    middleLine.position.set(middleLineX, 0.03, this.horizonDistance / 2);
    this.laneLines.add(middleLine);

    const rightLineGeometry = new THREE.PlaneGeometry(0.15, this.horizonDistance * 1.2);
    const rightLine = new THREE.Mesh(rightLineGeometry, laneMaterial);
    rightLine.rotation.x = -Math.PI / 2;
    rightLine.position.set(rightLineX, 0.03, this.horizonDistance / 2);
    this.laneLines.add(rightLine);
  }

  startGame() {
    this.gameStarted = true;
    this.gameTime = 0;
    this.roadSpeed = this.baseSpeed;
  }

  resetGame() {
    this.gameStarted = false;
    this.gameTime = 0;
    this.roadSpeed = this.baseSpeed;
  }

  update() {
    const now = Date.now();
    const elapsed = now - this.lastUpdateTime;

    if (elapsed < 16) return;

    this.lastUpdateTime = now;

    if (this.gameStarted) {
      this.gameTime += elapsed;

      if (this.roadSpeed < this.maxSpeed) {
        this.roadSpeed += this.speedIncrement * elapsed;

        if (this.roadSpeed > this.maxSpeed) {
          this.roadSpeed = this.maxSpeed;
        }
      }
    }

    if (this.mainRoad && this.mainRoad.material.map) {

      this.mainRoad.material.map.offset.y += this.roadSpeed * 0.05;
      this.mainRoad.material.map.needsUpdate = true;
    }

    if (this.laneLines) {
      this.laneLines.children.forEach(line => {

        if (line.material) {

          if (!line.material._isCustomized) {

            line.material = line.material.clone();

            const vertexShader = `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `;

            const fragmentShader = `
            uniform sampler2D map;
            uniform float fadeStart;
            uniform float fadeEnd;
            varying vec2 vUv;
            
            void main() {
              vec4 color = vec4(0.0, 1.0, 1.0, 1.0); 
              
              
              float fadeFactor = smoothstep(fadeStart, fadeEnd, vUv.y);
              
              
              gl_FragColor = vec4(color.rgb, color.a * fadeFactor);
            }
          `;

            line.material = new THREE.ShaderMaterial({
              uniforms: {
                fadeStart: { value: 0.7 },
                fadeEnd: { value: 1.0 }
              },
              vertexShader: vertexShader,
              fragmentShader: fragmentShader,
              transparent: true,
              blending: THREE.AdditiveBlending
            });

            line.material._isCustomized = true;
          }
        }
      });
    }
  }

  getLanePositions() {
    const halfWidth = this.roadWidth / 2;
    const laneWidth = this.roadWidth / this.laneCount;

    const positions = [];
    for (let i = 0; i < this.laneCount; i++) {
      const x = -halfWidth + laneWidth / 2 + i * laneWidth;
      positions.push(x);
    }

    return positions;
  }
}
