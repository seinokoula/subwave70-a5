import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export default class ObstacleManager {
  constructor(scene, road, preloadedModels = {}) {
    this.scene = scene;
    this.road = road;
    this.obstacles = [];
    this.preloadedModels = preloadedModels;

    this.obstacleTypes = [
      { type: 'police_officer', modelPath: '/assets/police_officer.obj', scale: [1.5, 1.5, 1.5], color: 0x3366FF },
      { type: 'barrier', scale: [1.4, 0.7, 0.4], color: 0xFF0000 },
      { type: 'rock', modelPath: '/assets/rock.OBJ', scale: [0.08, 0.08, 0.08], color: 0x00FF00 },
    ];

    this.models = {};
    this.lanePositions = road.getLanePositions();
    this.spawnDistance = 150;
    this.minSpawnInterval = 1000;
    this.maxSpawnInterval = 3000;
    this.spawnTimer = null;

    this.init();
  }

  async init() {
    if (this.preloadedModels && Object.keys(this.preloadedModels).length > 0) {
      for (const type of this.obstacleTypes) {
        if (type.modelPath && this.preloadedModels[type.type]) {
          this.models[type.type] = this.preloadedModels[type.type];
        }
      }
      return;
    }

    await this.loadModels();
  }

  async loadModels() {
    const loader = new OBJLoader();

    const modelPromises = this.obstacleTypes
      .filter(type => type.modelPath)
      .map(type => {
        return new Promise((resolve, reject) => {
          loader.load(
            type.modelPath,
            (obj) => {
              this.models[type.type] = obj;
              resolve();
            },
            undefined,
            (error) => {
              console.error(`Failed to load obstacle model "${type.type}":`, error);
              reject(error);
            }
          );
        });
      });

    try {
      await Promise.all(modelPromises);
    } catch (error) {
      console.error('Some obstacle models failed to load, falling back to boxes:', error);
    }
  }

  startSpawning() {
    this.stopSpawning();
    this.scheduleNextObstacle();
  }

  stopSpawning() {
    if (this.spawnTimer) {
      clearTimeout(this.spawnTimer);
      this.spawnTimer = null;
    }
  }

  scheduleNextObstacle() {
    const delay = this.minSpawnInterval +
      Math.random() * (this.maxSpawnInterval - this.minSpawnInterval);

    this.spawnTimer = setTimeout(() => {
      this.spawnObstacle();
      this.scheduleNextObstacle();
    }, delay);
  }

  spawnObstacle() {
    const obstacleType = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];

    const lane = Math.floor(Math.random() * 3);
    const xPosition = this.lanePositions[lane];

    let obstacle;
    let ownsGeometry = false;

    if (obstacleType.modelPath && this.models[obstacleType.type]) {
      obstacle = this.models[obstacleType.type].clone();

      obstacle.scale.set(...obstacleType.scale);

      obstacle.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: obstacleType.color,
            roughness: 0.3,
            metalness: 0.5,
            emissive: 0x000000,
            emissiveIntensity: 0
          });

          const edges = new THREE.EdgesGeometry(child.geometry);
          const edgesMaterial = new THREE.LineBasicMaterial({
            color: 0xFFFFFF,
            linewidth: 2
          });
          const edgeLines = new THREE.LineSegments(edges, edgesMaterial);
          child.add(edgeLines);
        }
      });
    } else {
      ownsGeometry = true;

      const geometry = new THREE.BoxGeometry(0.8, 0.5, 0.25);
      const material = new THREE.MeshStandardMaterial({
        color: obstacleType.color,
        roughness: 0.3,
        metalness: 0.5,
        emissive: 0x000000,
        emissiveIntensity: 0
      });

      obstacle = new THREE.Mesh(geometry, material);

      const edgesGeometry = new THREE.EdgesGeometry(geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: 0xFFFFFF,
        linewidth: 2
      });
      const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      obstacle.add(edges);

      obstacle.scale.set(...obstacleType.scale);
    }

    obstacle.position.set(
      xPosition,
      0.25,
      this.spawnDistance
    );

    obstacle.castShadow = true;
    obstacle.receiveShadow = true;

    this.scene.add(obstacle);
    this.obstacles.push({
      mesh: obstacle,
      type: obstacleType.type,
      lane: lane,
      active: true,
      ownsGeometry: ownsGeometry,
      pulseTime: Date.now()
    });
  }

  update() {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];

      if (obstacle.active) {
        obstacle.mesh.position.z -= this.road.roadSpeed;

        if (obstacle.type === 'police_officer') {
          obstacle.mesh.rotation.y = Math.sin(Date.now() * 0.003) * 0.2;
        } else if (obstacle.type === 'barrier') {
          obstacle.mesh.rotation.x = Math.sin(Date.now() * 0.005) * 0.1;
        } else if (obstacle.type === 'rock') {
          obstacle.mesh.rotation.y += 0.01;
        }

        obstacle.mesh.position.y = 0.25 + Math.sin(Date.now() * 0.005) * 0.1;

        obstacle.mesh.traverse((child) => {
          if (child instanceof THREE.LineSegments) {
            const time = Date.now() * 0.001;
            const color = new THREE.Color();

            const obstacleColor = new THREE.Color(obstacle.mesh.material ? obstacle.mesh.material.color : 0xFFFFFF);
            const t = (Math.sin(time * 5) + 1) / 2;

            color.setRGB(
              1.0 * (1 - t) + obstacleColor.r * t,
              1.0 * (1 - t) + obstacleColor.g * t,
              1.0 * (1 - t) + obstacleColor.b * t
            );

            child.material.color = color;
          }
        });

        if (obstacle.mesh.position.z < -10) {
          this.removeObstacle(i);
        }
      }
    }
  }

  getActiveObstacles() {
    return this.obstacles.filter(obstacle => obstacle.active);
  }

  removeObstacle(index) {
    const obstacle = this.obstacles[index];
    if (obstacle) {
      this.scene.remove(obstacle.mesh);
      this.disposeObstacle(obstacle);
      this.obstacles.splice(index, 1);
    }
  }

  // Geometries cloned from a shared template must NOT be disposed; only the
  // per-spawn materials, edge lines, and fallback-box geometry are owned here.
  disposeObstacle(obstacle) {
    obstacle.mesh.traverse((child) => {
      if (child.isLineSegments) {
        child.geometry.dispose();
        child.material.dispose();
      } else if (child.isMesh) {
        if (obstacle.ownsGeometry) {
          child.geometry.dispose();
        }
        child.material.dispose();
      }
    });
  }

  clearObstacles() {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      this.removeObstacle(i);
    }
  }

  updateLanePositions(positions) {
    this.lanePositions = positions;
  }

  dispose() {
    this.stopSpawning();
    this.clearObstacles();
  }
}
