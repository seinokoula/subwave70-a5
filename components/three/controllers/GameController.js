import * as THREE from 'three';

export default class GameController {
  constructor(car, road, obstacles, camera) {
    this.car = car;
    this.road = road;
    this.obstacles = obstacles;
    this.camera = camera;

    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.collisionDetected = false;

    this.onGameOver = null;
    this.onScoreUpdate = null;

    this.obstacleSizes = {
      rock: 1.1,
      police_officer: 1.2,
      barrier: 0.4
    };
    this.defaultObstacleSize = 0.2;
    this.carZSize = 1.2;

    setTimeout(() => {
      if (!this.gameStarted) {
        this.startGame();
      }
    }, 1000);

    this.obstacleSpawnRateMin = 3000;
    this.obstacleSpawnRateMax = 5000;
    this.minSpawnRateLimit = 800;
  }

  startGame() {
    this.gameStarted = true;
    this.score = 0;
    this.gameOver = false;

    if (this.road) {
      this.road.startGame();
    }

    if (this.obstacles) {
      this.obstacles.minSpawnInterval = this.obstacleSpawnRateMin;
      this.obstacles.maxSpawnInterval = this.obstacleSpawnRateMax;
    }

    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }
  }

  endGame() {
    this.gameOver = true;

    if (this.onGameOver) {
      this.onGameOver(this.score);
    }
  }


  checkCollisions() {
    if (!this.gameStarted || this.gameOver) return false;

    const carLane = this.car.currentLane;
    const carZ = this.car.position.z;
    const carHalfSize = this.carZSize * 0.5;

    for (const obstacle of this.obstacles.getActiveObstacles()) {
      if (carLane !== obstacle.lane) continue;

      const zDistance = Math.abs(carZ - obstacle.mesh.position.z);
      const obstacleZSize = this.obstacleSizes[obstacle.type] || this.defaultObstacleSize;
      const collisionThreshold = carHalfSize + obstacleZSize * 0.5;

      if (zDistance < collisionThreshold) {
        this.collisionDetected = true;
        this.endGame();
        return true;
      }
    }

    return false;
  }

  update(deltaTime) {
    if (!this.gameStarted || this.gameOver) return;

    this.score += deltaTime * 10;

    this.updateDifficulty();

    if (this.onScoreUpdate) {
      this.onScoreUpdate(Math.floor(this.score));
    }

    this.checkCollisions();
  }

  updateDifficulty() {

    if (this.obstacles) {

      const difficultyFactor = Math.min(this.score / 1000, 1);

      const newMinSpawnRate = this.obstacleSpawnRateMin -
        (this.obstacleSpawnRateMin - this.minSpawnRateLimit) * difficultyFactor;

      const newMaxSpawnRate = this.obstacleSpawnRateMax -
        (this.obstacleSpawnRateMax - this.minSpawnRateLimit * 1.5) * difficultyFactor;

      this.obstacles.minSpawnInterval = Math.max(newMinSpawnRate, this.minSpawnRateLimit);
      this.obstacles.maxSpawnInterval = Math.max(newMaxSpawnRate, this.minSpawnRateLimit * 1.5);
    }
  }

  reset() {
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.collisionDetected = false;

    this.car.currentLane = 1;
    if (this.car.car) {
      this.car.car.position.x = this.car.lanePositions[1];
    }

    const obstacles = this.obstacles.getActiveObstacles();
    for (let i = obstacles.length - 1; i >= 0; i--) {
      this.obstacles.removeObstacle(i);
    }

    if (this.road) {
      this.road.resetGame();
    }

    if (this.obstacles) {
      this.obstacles.minSpawnInterval = this.obstacleSpawnRateMin;
      this.obstacles.maxSpawnInterval = this.obstacleSpawnRateMax;
    }

    setTimeout(() => {
      if (!this.gameStarted) {
        this.startGame();
      }
    }, 500);
  }
}
