import * as THREE from 'three';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  private target: { x: number; y: number; vx: number; vy: number; isWallRunning: boolean; wallSide: 'left' | 'right' | null };
  private shakeAmount: number = 0;
  private currentOffset = new THREE.Vector3(0, 2.5, 18);
  private targetPos = new THREE.Vector3();
  private baseFov: number = 55;

  constructor(width: number, height: number) {
    this.camera = new THREE.PerspectiveCamera(this.baseFov, width / height, 0.1, 1000);
    this.target = { x: 0, y: 0, vx: 0, vy: 0, isWallRunning: false, wallSide: null };
  }

  public setTarget(target: { x: number; y: number; vx: number; vy: number; isWallRunning: boolean; wallSide: 'left' | 'right' | null }): void {
    this.target = target;
  }

  public setAspect(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  public addShake(amount: number): void {
    this.shakeAmount = Math.min(1.5, this.shakeAmount + amount);
  }

  public resetTo(x: number, y: number): void {
    this.camera.position.set(x + 4, y + 2, 18);
    this.camera.lookAt(x + 4, y + 2, 0);
  }

  public update(dt: number, flowRatio: number): void {
    // Dynamic lead-ahead in facing/velocity direction
    const leadX = Math.sign(this.target.vx) * Math.min(6, Math.abs(this.target.vx) * 0.35);
    const leadY = Math.min(3, Math.max(-2, this.target.vy * 0.15));

    this.targetPos.set(
      this.target.x + leadX + 2.5,
      this.target.y + leadY + 1.8,
      17.5 - flowRatio * 2.0 // Pulls back slightly or zooms on high flow
    );

    // Smooth lerp
    this.camera.position.x += (this.targetPos.x - this.camera.position.x) * Math.min(1, dt * 6.5);
    this.camera.position.y += (this.targetPos.y - this.camera.position.y) * Math.min(1, dt * 5.0);
    this.camera.position.z += (this.targetPos.z - this.camera.position.z) * Math.min(1, dt * 4.0);

    // Camera tilt for Wall-Running
    let targetRoll = 0;
    if (this.target.isWallRunning) {
      targetRoll = this.target.wallSide === 'left' ? 0.08 : -0.08;
    }
    this.camera.rotation.z += (targetRoll - this.camera.rotation.z) * Math.min(1, dt * 8);

    // Dynamic FOV adjustment based on speed & flow
    const speed = Math.sqrt(this.target.vx * this.target.vx + this.target.vy * this.target.vy);
    const targetFov = this.baseFov + Math.min(18, (speed / 20) * 12 + flowRatio * 6);
    this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, dt * 5);
    this.camera.updateProjectionMatrix();

    // Screen shake decay
    if (this.shakeAmount > 0.001) {
      const sx = (Math.random() - 0.5) * this.shakeAmount * 0.8;
      const sy = (Math.random() - 0.5) * this.shakeAmount * 0.8;
      this.camera.position.x += sx;
      this.camera.position.y += sy;
      this.shakeAmount = Math.max(0, this.shakeAmount - dt * 3.5);
    }

    this.camera.lookAt(
      this.camera.position.x,
      this.camera.position.y - 0.5,
      0
    );
  }
}
