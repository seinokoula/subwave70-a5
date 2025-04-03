import * as THREE from 'three';

export default class LightsManager {
  constructor(scene) {
    this.scene = scene;
    this.lights = [];

    this.setupLights();
  }

  setupLights() {

    const ambientLight = new THREE.AmbientLight(0x330066, 0.7);
    this.scene.add(ambientLight);
    this.lights.push(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xff3366, 1.0);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;


    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;

    this.scene.add(directionalLight);
    this.lights.push(directionalLight);

    const roadLight = new THREE.DirectionalLight(0xffffff, 0.5);
    roadLight.position.set(0, 10, -10);
    roadLight.target.position.set(0, 0, 100);
    this.scene.add(roadLight);
    this.scene.add(roadLight.target);
    this.lights.push(roadLight);


    this.addNeonSpots();
  }

  addNeonSpots() {

    const cyanSpot = new THREE.SpotLight(0x00ffff, 1.5, 50, Math.PI / 6, 0.5, 1);
    cyanSpot.position.set(-15, 10, 0);
    cyanSpot.target.position.set(-5, 0, 0);
    this.scene.add(cyanSpot);
    this.scene.add(cyanSpot.target);
    this.lights.push(cyanSpot);

    const magentaSpot = new THREE.SpotLight(0xff00ff, 1.5, 50, Math.PI / 6, 0.5, 1);
    magentaSpot.position.set(15, 10, 0);
    magentaSpot.target.position.set(5, 0, 0);
    this.scene.add(magentaSpot);
    this.scene.add(magentaSpot.target);
    this.lights.push(magentaSpot);
  }

  addCarHeadlights(carPosition, carDirection) {
    const leftHeadlight = new THREE.SpotLight(0xff00ff, 1.5, 10, Math.PI / 6);
    leftHeadlight.position.set(
      carPosition.x - 0.5,
      carPosition.y + 0.5,
      carPosition.z
    );
    leftHeadlight.target.position.set(
      carPosition.x - 0.5 + carDirection.x,
      carPosition.y,
      carPosition.z + carDirection.z
    );

    const rightHeadlight = new THREE.SpotLight(0x00ffff, 1.5, 10, Math.PI / 6);
    rightHeadlight.position.set(
      carPosition.x + 0.5,
      carPosition.y + 0.5,
      carPosition.z
    );
    rightHeadlight.target.position.set(
      carPosition.x + 0.5 + carDirection.x,
      carPosition.y,
      carPosition.z + carDirection.z
    );

    this.scene.add(leftHeadlight);
    this.scene.add(leftHeadlight.target);
    this.scene.add(rightHeadlight);
    this.scene.add(rightHeadlight.target);

    this.lights.push(leftHeadlight, rightHeadlight);

    return { leftHeadlight, rightHeadlight };
  }

  updateHeadlights(headlights, carPosition, carDirection) {
    const { leftHeadlight, rightHeadlight } = headlights;

    leftHeadlight.position.set(
      carPosition.x - 0.5,
      carPosition.y + 0.5,
      carPosition.z
    );
    leftHeadlight.target.position.set(
      carPosition.x - 0.5 + carDirection.x,
      carPosition.y,
      carPosition.z + carDirection.z
    );

    rightHeadlight.position.set(
      carPosition.x + 0.5,
      carPosition.y + 0.5,
      carPosition.z
    );
    rightHeadlight.target.position.set(
      carPosition.x + 0.5 + carDirection.x,
      carPosition.y,
      carPosition.z + carDirection.z
    );
  }
}
