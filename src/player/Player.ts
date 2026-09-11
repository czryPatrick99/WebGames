import * as THREE from 'three';
import { SKINS, TRAILS, GhostFrame } from '../save/SaveManager';

export class Player {
  public mesh: THREE.Group;
  public ghostMesh: THREE.Group;
  public grappleLine: THREE.Line;

  private bodyGroup: THREE.Group;
  private torsoMesh: THREE.Mesh;
  private headMesh: THREE.Mesh;
  private visorMesh: THREE.Mesh;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;

  // Materials
  private suitMat: THREE.MeshStandardMaterial;
  private glowMat: THREE.MeshBasicMaterial;
  private ghostMat: THREE.MeshBasicMaterial;

  // Trail
  private trailPositions: THREE.Vector3[] = [];
  private trailMesh: THREE.Line;
  private readonly MAX_TRAIL = 20;

  // Animation cycle
  private animTimer: number = 0;

  constructor(skinId: string, trailId: string) {
    this.mesh = new THREE.Group();
    this.ghostMesh = new THREE.Group();
    this.ghostMesh.visible = false;

    const skinConfig = SKINS.find((s) => s.id === skinId) || SKINS[0];
    const trailConfig = TRAILS.find((t) => t.id === trailId) || TRAILS[0];

    this.suitMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
    });

    this.glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(skinConfig.color),
    });

    this.ghostMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });

    this.bodyGroup = new THREE.Group();
    this.mesh.add(this.bodyGroup);

    // Build Player Rig
    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.75, 0.35);
    this.torsoMesh = new THREE.Mesh(torsoGeo, this.suitMat);
    this.torsoMesh.position.y = 0.95;
    this.bodyGroup.add(this.torsoMesh);

    // Spinal neon accent
    const spineGeo = new THREE.BoxGeometry(0.12, 0.65, 0.38);
    const spineMesh = new THREE.Mesh(spineGeo, this.glowMat);
    this.torsoMesh.add(spineMesh);

    // Head
    const headGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    this.headMesh = new THREE.Mesh(headGeo, this.suitMat);
    this.headMesh.position.y = 1.55;
    this.bodyGroup.add(this.headMesh);

    // Visor
    const visorGeo = new THREE.BoxGeometry(0.32, 0.14, 0.38);
    this.visorMesh = new THREE.Mesh(visorGeo, this.glowMat);
    this.visorMesh.position.set(0, 0.02, 0.08);
    this.headMesh.add(this.visorMesh);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.18, 0.65, 0.2);
    this.leftLeg = new THREE.Mesh(legGeo, this.suitMat);
    this.leftLeg.position.set(-0.16, 0.45, 0);
    this.bodyGroup.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, this.suitMat);
    this.rightLeg.position.set(0.16, 0.45, 0);
    this.bodyGroup.add(this.rightLeg);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.14, 0.6, 0.16);
    this.leftArm = new THREE.Mesh(armGeo, this.suitMat);
    this.leftArm.position.set(-0.35, 0.95, 0);
    this.bodyGroup.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, this.suitMat);
    this.rightArm.position.set(0.35, 0.95, 0);
    this.bodyGroup.add(this.rightArm);

    // Build Ghost Rig (simple wireframe replica)
    const ghostTorso = new THREE.Mesh(torsoGeo, this.ghostMat);
    ghostTorso.position.y = 0.95;
    this.ghostMesh.add(ghostTorso);

    const ghostHead = new THREE.Mesh(headGeo, this.ghostMat);
    ghostHead.position.y = 1.55;
    this.ghostMesh.add(ghostHead);

    // Trail Line
    const trailGeo = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(this.MAX_TRAIL * 3);
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(trailConfig.color),
      transparent: true,
      opacity: 0.65,
      linewidth: 2,
    });
    this.trailMesh = new THREE.Line(trailGeo, trailMat);
    this.trailMesh.frustumCulled = false;

    // Grapple Hook Line
    const grappleGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const grappleMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      linewidth: 2.5,
      transparent: true,
      opacity: 0.8,
    });
    this.grappleLine = new THREE.Line(grappleGeo, grappleMat);
    this.grappleLine.visible = false;
    this.grappleLine.frustumCulled = false;
  }

  public getTrailMesh(): THREE.Line {
    return this.trailMesh;
  }

  public applyCustomization(skinId: string, trailId: string): void {
    const skinConfig = SKINS.find((s) => s.id === skinId) || SKINS[0];
    const trailConfig = TRAILS.find((t) => t.id === trailId) || TRAILS[0];

    this.glowMat.color.set(skinConfig.color);
    (this.trailMesh.material as THREE.LineBasicMaterial).color.set(trailConfig.color);
  }

  public setPosition(x: number, y: number, z: number = 0): void {
    this.mesh.position.set(x, y, z);
  }

  public setGrappleTarget(startPos: { x: number; y: number }, targetPos: { x: number; y: number } | null): void {
    if (!targetPos) {
      this.grappleLine.visible = false;
      return;
    }
    this.grappleLine.visible = true;
    const positions = this.grappleLine.geometry.attributes.position as THREE.BufferAttribute;
    positions.setXYZ(0, startPos.x, startPos.y + 1.1, 0);
    positions.setXYZ(1, targetPos.x, targetPos.y, 0);
    positions.needsUpdate = true;
  }

  public updateAnimation(
    dt: number,
    state: {
      isGrounded: boolean;
      isSliding: boolean;
      isWallRunning: boolean;
      wallSide: 'left' | 'right' | null;
      isVaulting: boolean;
      isLedgeHanging: boolean;
      isDashing: boolean;
      isGrappling: boolean;
      speed: number;
      facing: number; // 1 (right) or -1 (left)
      flow: number; // 0 to 1
    }
  ): void {
    this.animTimer += dt * (state.speed > 0.5 ? state.speed * 0.9 : 3.0);

    // Orient body facing
    this.bodyGroup.rotation.y = state.facing > 0 ? 0 : Math.PI;

    // Reset default transforms
    this.torsoMesh.rotation.set(0, 0, 0);
    this.bodyGroup.position.y = 0;

    if (state.isSliding) {
      // Sliding posture: low to ground, legs out front, body leaned back
      this.bodyGroup.position.y = -0.4;
      this.torsoMesh.rotation.z = state.facing * 0.45;
      this.leftLeg.rotation.x = -1.2;
      this.rightLeg.rotation.x = -1.3;
      this.leftArm.rotation.x = 0.8;
      this.rightArm.rotation.x = 0.8;
    } else if (state.isWallRunning) {
      // Wall-run posture: tilted toward wall, horizontal tread
      const tilt = state.wallSide === 'left' ? 0.35 : -0.35;
      this.bodyGroup.rotation.z = tilt;
      this.leftLeg.rotation.x = Math.sin(this.animTimer * 12) * 0.9;
      this.rightLeg.rotation.x = -Math.sin(this.animTimer * 12) * 0.9;
      this.leftArm.rotation.x = -Math.sin(this.animTimer * 12) * 0.8;
      this.rightArm.rotation.x = Math.sin(this.animTimer * 12) * 0.8;
    } else if (state.isLedgeHanging) {
      // Hanging from arms
      this.bodyGroup.position.y = -0.6;
      this.leftArm.rotation.x = Math.PI;
      this.rightArm.rotation.x = Math.PI;
      this.leftLeg.rotation.x = 0.2;
      this.rightLeg.rotation.x = 0.1;
    } else if (state.isVaulting) {
      // Vault posture: tucked knees, one hand plant
      this.leftLeg.rotation.x = -1.1;
      this.rightLeg.rotation.x = -1.0;
      this.leftArm.rotation.x = -0.8;
      this.rightArm.rotation.x = 0.8;
    } else if (!state.isGrounded) {
      // Airborne Jump
      this.leftLeg.rotation.x = -0.6;
      this.rightLeg.rotation.x = 0.4;
      this.leftArm.rotation.x = -0.8;
      this.rightArm.rotation.x = -0.7;
    } else {
      // Grounded Running / Sprinting
      const runCycle = Math.sin(this.animTimer * (state.speed > 10 ? 14 : 10));
      const forwardLean = Math.min(0.35, state.speed * 0.02);
      this.torsoMesh.rotation.z = -state.facing * forwardLean;

      this.leftLeg.rotation.x = runCycle * 0.85;
      this.rightLeg.rotation.x = -runCycle * 0.85;
      this.leftArm.rotation.x = -runCycle * 0.75;
      this.rightArm.rotation.x = runCycle * 0.75;
    }

    // Update Kinetic Trail
    this.updateTrail();
  }

  private updateTrail(): void {
    const p = this.mesh.position;
    this.trailPositions.unshift(new THREE.Vector3(p.x, p.y + 0.8, p.z));
    if (this.trailPositions.length > this.MAX_TRAIL) {
      this.trailPositions.pop();
    }

    const posAttr = this.trailMesh.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < this.MAX_TRAIL; i++) {
      const pt = this.trailPositions[i] || p;
      posAttr.setXYZ(i, pt.x, pt.y, pt.z);
    }
    posAttr.needsUpdate = true;
  }

  public updateGhost(frame?: GhostFrame): void {
    if (!frame) {
      this.ghostMesh.visible = false;
      return;
    }
    this.ghostMesh.visible = true;
    this.ghostMesh.position.set(frame.x, frame.y, frame.z || 0);
    this.ghostMesh.rotation.y = frame.facing > 0 ? 0 : Math.PI;
  }
}
