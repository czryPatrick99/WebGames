import * as THREE from 'three';
import { audioManager } from '../audio/AudioManager';

export class Collectible {
  public mesh: THREE.Group;
  public x: number;
  public y: number;
  public index: number;
  public collected: boolean = false;
  private coreMesh: THREE.Mesh;
  private ringMesh: THREE.Mesh;

  constructor(x: number, y: number, index: number) {
    this.x = x;
    this.y = y;
    this.index = index;

    this.mesh = new THREE.Group();
    this.mesh.position.set(x, y, 0);

    // Glowing core
    const coreGeo = new THREE.OctahedronGeometry(0.55, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.9,
    });
    this.coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.mesh.add(this.coreMesh);

    // Orbiting neon ring
    const ringGeo = new THREE.TorusGeometry(0.85, 0.05, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      wireframe: true,
    });
    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringMesh.rotation.x = Math.PI / 3;
    this.mesh.add(this.ringMesh);
  }

  public update(dt: number, time: number): void {
    if (this.collected) return;
    this.coreMesh.rotation.y += 2.5 * dt;
    this.coreMesh.rotation.x += 1.2 * dt;
    this.ringMesh.rotation.z -= 3.0 * dt;
    this.mesh.position.y = this.y + Math.sin(time * 3 + this.index) * 0.2;
  }

  public collect(): void {
    if (this.collected) return;
    this.collected = true;
    this.mesh.visible = false;
    audioManager.playCollectCore(this.index);
  }

  public reset(): void {
    this.collected = false;
    this.mesh.visible = true;
  }
}
