import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { getDevicePerformanceLevel } from '../../utils/deviceDetection';

export default class ObstacleManager {
  constructor(scene, road, preloadedModels = {}) {
    this.scene = scene;
    this.road = road;
    this.obstacles = [];
    this.preloadedModels = preloadedModels;
    this.performanceLevel = getDevicePerformanceLevel();

    this.obstacleTypes = [
      { type: 'police_officer', modelPath: '/assets/police_officer.obj', scale: [1.5, 1.5, 1.5], color: 0x3366FF },
      { type: 'barrier', scale: [1.4, 0.7, 0.4], color: 0xFF0000 },
      { type: 'rock', modelPath: '/assets/rock.OBJ', scale: [0.08, 0.08, 0.08], color: 0x00FF00 },
    ];

    this.models = {};
    this.lanePositions = road.getLanePositions();
    this.spawnDistance = 150;

    if (this.performanceLevel === 'low') {
      this.minSpawnInterval = 1500;
      this.maxSpawnInterval = 4000;
      this.maxObstacles = 3;
    } else if (this.performanceLevel === 'medium') {
      this.minSpawnInterval = 1200;
      this.maxSpawnInterval = 3500;
      this.maxObstacles = 5;
    } else {
      this.minSpawnInterval = 1000;
      this.maxSpawnInterval = 3000;
      this.maxObstacles = 8;
    }

    this.lastSpawnTime = 0;

    this.init();
  }

  async init() {

    if (this.preloadedModels && Object.keys(this.preloadedModels).length > 0) {
      for (const type of this.obstacleTypes) {
        if (type.modelPath && this.preloadedModels[type.type]) {
          this.models[type.type] = this.preloadedModels[type.type];
        }
      }

      this.scheduleNextObstacle();
      return;
    }

    await this.loadModels();

    this.scheduleNextObstacle();
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

              obj.traverse((child) => {
                if (child instanceof THREE.Mesh) {

                  child.material = new THREE.MeshStandardMaterial({
                    color: type.color,
                    roughness: 0.3,
                    metalness: 0.5,
                    emissive: type.color,
                    emissiveIntensity: 0.8
                  });

                  const edges = new THREE.EdgesGeometry(child.geometry);
                  const line = new THREE.LineSegments(
                    edges,
                    new THREE.LineBasicMaterial({
                      color: 0xFFFFFF,
                      linewidth: 2
                    })
                  );
                  child.add(line);

                  child.castShadow = true;
                  child.receiveShadow = true;
                }
              });

              this.models[type.type] = obj;
              resolve();
            },
            undefined,
            (error) => {
              if (process.env.NODE_ENV === 'development') {
                console.error(`Error loading model ${type.type}:`, error);
              }
              reject(error);
            }
          );
        });
      });

    try {
      await Promise.all(modelPromises);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error loading models:", error);
      }
    }
  }

  scheduleNextObstacle() {
    const now = Date.now();
    const timeSinceLastSpawn = now - this.lastSpawnTime;

    if (timeSinceLastSpawn >= this.minSpawnInterval) {
      const randomDelay = Math.random() * (this.maxSpawnInterval - this.minSpawnInterval);
      setTimeout(() => {
        this.spawnObstacle();
        this.scheduleNextObstacle();
      }, randomDelay);

      this.lastSpawnTime = now;
    } else {
      setTimeout(() => this.scheduleNextObstacle(), 100);
    }
  }

  spawnObstacle() {
    if (this.obstacles.length >= this.maxObstacles) {
      return;
    }

    const obstacleType = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)];

    const lane = Math.floor(Math.random() * 3);
    const xPosition = this.lanePositions[lane];

    let obstacle;

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

    const edgeLines = [];
    obstacle.traverse((child) => {
      if (child instanceof THREE.LineSegments) {
        edgeLines.push(child);
      }
    });

    this.scene.add(obstacle);
    this.obstacles.push({
      mesh: obstacle,
      type: obstacleType.type,
      lane: lane,
      active: true,
      pulseTime: Date.now(),
      edgeLines: edgeLines,
      baseColor: new THREE.Color(obstacleType.color)
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

        if (obstacle.edgeLines && obstacle.edgeLines.length > 0) {
          const time = Date.now() * 0.001;
          const t = (Math.sin(time * 5) + 1) * 0.5;

          for (let j = 0; j < obstacle.edgeLines.length; j++) {
            const edgeLine = obstacle.edgeLines[j];
            edgeLine.material.color.setRGB(
              1.0 * (1 - t) + obstacle.baseColor.r * t,
              1.0 * (1 - t) + obstacle.baseColor.g * t,
              1.0 * (1 - t) + obstacle.baseColor.b * t
            );
          }
        }

        if (obstacle.mesh.position.z < -10) {
          this.scene.remove(obstacle.mesh);
          this.obstacles.splice(i, 1);
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
      this.obstacles.splice(index, 1);
    }
  }

  updateLanePositions(positions) {
    this.lanePositions = positions;
  }
}
