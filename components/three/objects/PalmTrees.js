
import * as THREE from 'three';

export default class PalmTrees {
  constructor(scene, road, preloadedModel = null) {
    this.scene = scene;
    this.road = road;
    this.palmTrees = [];
    this.preloadedModel = preloadedModel;
    this.roadWidth = road.roadWidth;
    this.spacing = 90;
    this.maxDistance = 200;
    this.treeScale = 0.015;

    this.init();
  }

  init() {
    if (!this.preloadedModel) {
      console.warn("Modèle de palmier non chargé");
      return;
    }

    const treesPerSide = Math.ceil(this.maxDistance / this.spacing);

    for (let i = 0; i < treesPerSide; i++) {

      const leftXPosition = -this.roadWidth / 2 - 2 - Math.random() * 1.5;
      const leftZPosition = i * this.spacing;
      this.createPalmTree(leftXPosition, leftZPosition);

      const rightXPosition = this.roadWidth / 2 + 2 + Math.random() * 1.5;
      const rightZPosition = i * this.spacing + this.spacing / 3;
      this.createPalmTree(rightXPosition, rightZPosition);
    }
  }

  createPalmTree(xPosition, zPosition) {

    const palmTree = this.preloadedModel.clone();

    palmTree.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0x000000,
          roughness: 0.3,
          metalness: 0.5,
          emissive: 0x000000
        });
        const edges = new THREE.EdgesGeometry(child.geometry);
        const neonColor = Math.random() > 0.5 ? 0xff00ff : 0x00ffff;
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({
            color: neonColor,
            linewidth: 2
          })
        );
        child.add(line);
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    palmTree.scale.set(this.treeScale, this.treeScale, this.treeScale);

    palmTree.position.set(xPosition, -0.5, zPosition);

    if (xPosition < 0) {
      palmTree.rotation.y = -Math.PI / 2;
    } else {
      palmTree.rotation.y = Math.PI / 2;
    }
    palmTree.rotation.y += (Math.random() - 0.5) * 0.2;

    this.scene.add(palmTree);
    this.palmTrees.push({
      mesh: palmTree,
      xPosition: xPosition,
      zPosition: zPosition
    });
    return palmTree;
  }

  update() {

    for (let i = 0; i < this.palmTrees.length; i++) {
      const tree = this.palmTrees[i];

      tree.mesh.position.z -= this.road.roadSpeed;
      tree.zPosition -= this.road.roadSpeed;

      tree.mesh.rotation.z = Math.sin(Date.now() * 0.001 + i) * 0.05;

      if (tree.zPosition < -20) {

        const farthestZ = Math.max(...this.palmTrees.map(t => t.zPosition));
        const newZ = farthestZ + this.spacing;

        tree.mesh.position.z = newZ;
        tree.zPosition = newZ;
      }
    }
  }
}
