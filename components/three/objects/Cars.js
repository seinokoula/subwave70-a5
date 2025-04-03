import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export default class Car {
  constructor(scene, preloadedModel = null) {
    this.scene = scene;
    this.car = null;
    this.position = { x: 0, y: 0, z: 0 };
    this.currentLane = 1;
    this.lanePositions = [-2.67, 0, 2.67];
    this.speed = 0.2;
    this.isMoving = false;
    this.carModel = null;
    this.lastMoveTime = 0;
    this.moveDelay = 200;
    this.animationId = null;
    this.preloadedModel = preloadedModel;

    this.init();
  }

  async init() {

    this.createDefaultCar();

    if (this.preloadedModel) {
      this.usePreloadedModel();
    } else {
      this.loadCarModel();
    }
  }

  createDefaultCar() {

    this.car = new THREE.Group();

    const bodyGeometry = new THREE.BoxGeometry(0.5, 0.3, 1.0);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x9900ff,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x6600cc,
      emissiveIntensity: 0.2
    });

    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.2;
    body.castShadow = true;
    body.receiveShadow = true;

    const bodyEdges = new THREE.EdgesGeometry(bodyGeometry);
    const bodyLine = new THREE.LineSegments(
      bodyEdges,
      new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 })
    );
    bodyLine.position.y = 0.2;
    body.add(bodyLine);

    const roofGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.5);
    const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
    roof.position.set(0, 0.45, -0.1);
    roof.castShadow = true;

    const roofEdges = new THREE.EdgesGeometry(roofGeometry);
    const roofLine = new THREE.LineSegments(
      roofEdges,
      new THREE.LineBasicMaterial({ color: 0x00ffff })
    );
    roof.add(roofLine);

    const wheelGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.5,
      roughness: 0.7
    });

    const wheelPositions = [
      { x: -0.3, y: 0.12, z: 0.3 },
      { x: 0.3, y: 0.12, z: 0.3 },
      { x: -0.3, y: 0.12, z: -0.3 },
      { x: 0.3, y: 0.12, z: -0.3 }
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(pos.x, pos.y, pos.z);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      this.car.add(wheel);

      const rimGeometry = new THREE.RingGeometry(0.08, 0.11, 16);
      const rimMaterial = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        side: THREE.DoubleSide
      });
      const rim = new THREE.Mesh(rimGeometry, rimMaterial);
      rim.position.set(0, 0, 0);
      rim.rotation.y = Math.PI / 2;
      wheel.add(rim);
    });

    const headlightGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    const headlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffcc00,
      emissive: 0xffcc00,
      emissiveIntensity: 1.0
    });

    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-0.2, 0.25, 0.5);

    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(0.2, 0.25, 0.5);

    const taillightGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    const taillightMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 1.0
    });

    const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
    leftTaillight.position.set(-0.2, 0.25, -0.5);

    const rightTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
    rightTaillight.position.set(0.2, 0.25, -0.5);


    const leftHeadlightLight = new THREE.PointLight(0xffcc00, 0.5, 2);
    leftHeadlightLight.position.copy(leftHeadlight.position);

    const rightHeadlightLight = new THREE.PointLight(0xffcc00, 0.5, 2);
    rightHeadlightLight.position.copy(rightHeadlight.position);

    const leftTaillightLight = new THREE.PointLight(0xff00ff, 0.5, 2);
    leftTaillightLight.position.copy(leftTaillight.position);

    const rightTaillightLight = new THREE.PointLight(0xff00ff, 0.5, 2);
    rightTaillightLight.position.copy(rightTaillight.position);

    this.car.add(
      body,
      roof,
      leftHeadlight,
      rightHeadlight,
      leftTaillight,
      rightTaillight,
      leftHeadlightLight,
      rightHeadlightLight,
      leftTaillightLight,
      rightTaillightLight
    );

    this.car.position.set(
      this.lanePositions[this.currentLane],
      0,
      0
    );

    this.scene.add(this.car);
    this.position = this.car.position;
  }

  usePreloadedModel() {
    const obj = this.preloadedModel.clone();

    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x9900ff,
          metalness: 0.7,
          roughness: 0.3,
          emissive: 0x6600cc,
          emissiveIntensity: 0.2
        });

        const edges = new THREE.EdgesGeometry(child.geometry);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0x00ffff })
        );
        child.add(line);

        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    obj.scale.set(0.01, 0.01, 0.01);
    obj.rotation.y = Math.PI;

    if (this.car) {
      const currentPosition = this.car.position.clone();
      this.scene.remove(this.car);
      this.car = obj;
      this.car.position.copy(currentPosition);
      this.scene.add(this.car);
      this.position = this.car.position;
    }
  }

  loadCarModel() {
    const loader = new OBJLoader();

    loader.load(
      '/assets/car.obj',
      (obj) => {

        obj.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x9900ff,
              metalness: 0.7,
              roughness: 0.3,
              emissive: 0x6600cc,
              emissiveIntensity: 0.2
            });

            const edges = new THREE.EdgesGeometry(child.geometry);
            const line = new THREE.LineSegments(
              edges,
              new THREE.LineBasicMaterial({ color: 0x00ffff })
            );
            child.add(line);

            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        obj.scale.set(0.01, 0.01, 0.01);
        obj.rotation.y = Math.PI;

        if (this.car) {
          const currentPosition = this.car.position.clone();
          this.scene.remove(this.car);
          this.car = obj;
          this.car.position.copy(currentPosition);
          this.scene.add(this.car);
          this.position = this.car.position;
        }
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% chargé');
      },
      (error) => {
        console.error('Erreur lors du chargement du modèle de voiture:', error);
      }
    );
  }

  setLanePositions(positions) {
    this.lanePositions = positions;

    if (this.car) {
      this.car.position.x = this.lanePositions[this.currentLane];
    }
  }

  moveLeft() {

    const now = Date.now();
    if (now - this.lastMoveTime < this.moveDelay) {
      return;
    }

    if (this.currentLane > 0 && !this.isMoving) {
      this.isMoving = true;
      this.currentLane--;

      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }

      const startX = this.car.position.x;
      const targetX = this.lanePositions[this.currentLane];
      const duration = 300;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeProgress = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        if (this.car) {
          this.car.position.x = startX + (targetX - startX) * easeProgress;
        }

        if (progress < 1) {
          this.animationId = requestAnimationFrame(animate);
        } else {

          if (this.car) {
            this.car.position.x = targetX;
            console.log("Car position updated to", this.car.position.x);
          }
          this.isMoving = false;
          this.animationId = null;
        }
      };

      this.animationId = requestAnimationFrame(animate);
      this.lastMoveTime = now;
    } else {
      console.log("Cannot move left: currentLane =", this.currentLane, "isMoving =", this.isMoving);
    }
  }

  moveRight() {
    console.log("moveRight called, current lane:", this.currentLane);

    const now = Date.now();
    if (now - this.lastMoveTime < this.moveDelay) {
      console.log("Move rejected: too soon");
      return;
    }

    if (this.currentLane < 2 && !this.isMoving) {
      console.log("Moving right to lane", this.currentLane + 1);
      this.isMoving = true;
      this.currentLane++;

      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }

      const startX = this.car.position.x;
      const targetX = this.lanePositions[this.currentLane];
      const duration = 300;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeProgress = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        if (this.car) {
          this.car.position.x = startX + (targetX - startX) * easeProgress;
        }

        if (progress < 1) {
          this.animationId = requestAnimationFrame(animate);
        } else {

          if (this.car) {
            this.car.position.x = targetX;
            console.log("Car position updated to", this.car.position.x);
          }
          this.isMoving = false;
          this.animationId = null;
        }
      };

      this.animationId = requestAnimationFrame(animate);
      this.lastMoveTime = now;
    } else {
      console.log("Cannot move right: currentLane =", this.currentLane, "isMoving =", this.isMoving);
    }
  }

  getBoundingBox() {
    if (!this.car) return new THREE.Box3();
    return new THREE.Box3().setFromObject(this.car);
  }

  update() {
    if (this.car) {
      this.position = this.car.position;

      this.car.rotation.z = Math.sin(Date.now() * 0.003) * 0.02;
    }
  }
}
