import * as THREE from 'three';
import { LevelConfig, PlatformDef, MovingPlatformDef, HazardDef, WallDef } from './LevelData';
import { Collectible } from '../world/Collectible';
import { audioManager } from '../audio/AudioManager';

export interface LevelStats {
  elapsedTime: number;
  deaths: number;
  fragmentsCollected: [boolean, boolean, boolean];
  shortcutsDiscovered: number;
  maxFlow: number;
  checkpointsPassed: number;
}

export class LevelManager {
  public scene: THREE.Scene;
  public levelConfig: LevelConfig;
  public platforms: PlatformDef[] = [];
  public walls: WallDef[] = [];
  public collectibles: Collectible[] = [];
  public activeCheckpoint: { x: number; y: number } | null = null;
  public stats: LevelStats;

  // 3D Visual Objects
  private platformMeshes: THREE.Mesh[] = [];
  private wallMeshes: THREE.Mesh[] = [];
  private movingMeshes: { mesh: THREE.Mesh; def: MovingPlatformDef; basePos: THREE.Vector3 }[] = [];
  private hazardMeshes: { mesh: THREE.Mesh; def: HazardDef; basePos: THREE.Vector3 }[] = [];
  private fallingStates: Map<PlatformDef, { timer: number; triggered: boolean; fallen: boolean; mesh: THREE.Mesh }> = new Map();
  private goalMesh: THREE.Group;
  private checkpointMeshes: { mesh: THREE.Group; pos: { x: number; y: number }; activated: boolean }[] = [];
  private droneMesh: THREE.Group | null = null;
  private droneX: number = -20;

  // Dynamic Difficulty tracking
  private failureCount: number = 0;

  constructor(scene: THREE.Scene, config: LevelConfig) {
    this.scene = scene;
    this.levelConfig = config;
    this.stats = {
      elapsedTime: 0,
      deaths: 0,
      fragmentsCollected: [false, false, false],
      shortcutsDiscovered: 0,
      maxFlow: 0,
      checkpointsPassed: 0,
    };
    this.goalMesh = new THREE.Group();
    this.buildLevel();
  }

  public recordFailure(): void {
    this.failureCount++;
    this.stats.deaths++;
  }

  public getFailureCount(): number {
    return this.failureCount;
  }

  public setLevel(config: LevelConfig): void {
    this.clearLevel();
    this.levelConfig = config;
    this.failureCount = 0;
    this.stats = {
      elapsedTime: 0,
      deaths: 0,
      fragmentsCollected: [false, false, false],
      shortcutsDiscovered: 0,
      maxFlow: 0,
      checkpointsPassed: 0,
    };
    this.activeCheckpoint = null;
    this.buildLevel();
  }

  private clearLevel(): void {
    this.platformMeshes.forEach((m) => this.scene.remove(m));
    this.wallMeshes.forEach((m) => this.scene.remove(m));
    this.movingMeshes.forEach((m) => this.scene.remove(m.mesh));
    this.hazardMeshes.forEach((m) => this.scene.remove(m.mesh));
    this.collectibles.forEach((c) => this.scene.remove(c.mesh));
    this.checkpointMeshes.forEach((cp) => this.scene.remove(cp.mesh));
    this.scene.remove(this.goalMesh);
    if (this.droneMesh) {
      this.scene.remove(this.droneMesh);
      this.droneMesh = null;
    }

    this.platformMeshes = [];
    this.wallMeshes = [];
    this.movingMeshes = [];
    this.hazardMeshes = [];
    this.collectibles = [];
    this.checkpointMeshes = [];
    this.fallingStates.clear();
    this.platforms = [];
    this.walls = [];
  }

  private buildLevel(): void {
    const theme = this.levelConfig.theme;

    // Theme palette
    let primaryColor = 0x0f172a; // Dark slate
    let edgeGlowColor = 0x06b6d4; // Cyan
    if (theme === 'concrete') {
      primaryColor = 0x1e293b;
      edgeGlowColor = 0x3b82f6;
    } else if (theme === 'industrial') {
      primaryColor = 0x271e16;
      edgeGlowColor = 0xf59e0b;
    } else if (theme === 'neon') {
      primaryColor = 0x180d2b;
      edgeGlowColor = 0xec4899;
    } else if (theme === 'ascension') {
      primaryColor = 0x13112c;
      edgeGlowColor = 0xa855f7;
    }

    // 1. Static Platforms
    this.platforms = this.levelConfig.platforms.map((p) => ({ ...p }));
    this.walls = this.levelConfig.walls.map((w) => ({ ...w }));

    // Apply subtle dynamic difficulty if player struggled previously (silent widening)
    const widenBonus = this.failureCount >= 3 ? 0.3 : 0;

    for (const p of this.platforms) {
      const geo = new THREE.BoxGeometry(p.width + widenBonus, p.height, 4);
      let mat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        roughness: 0.3,
        metalness: 0.6,
      });

      if (p.type === 'conveyor') {
        mat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          emissive: edgeGlowColor,
          emissiveIntensity: 0.25,
        });
      } else if (p.type === 'falling') {
        mat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0x991b1b,
          emissiveIntensity: 0.4,
          wireframe: true,
        });
      } else if (p.type === 'barrier_low' || p.type === 'barrier_waist') {
        mat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          emissive: 0xe11d48,
          emissiveIntensity: 0.5,
        });
      }

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.x, p.y, 0);
      this.scene.add(mesh);
      this.platformMeshes.push(mesh);

      // Add neon edge trim on top surface
      const trimGeo = new THREE.BoxGeometry(p.width + widenBonus, 0.12, 4.05);
      const trimMat = new THREE.MeshBasicMaterial({ color: edgeGlowColor });
      const trimMesh = new THREE.Mesh(trimGeo, trimMat);
      trimMesh.position.set(0, p.height * 0.5, 0);
      mesh.add(trimMesh);

      if (p.type === 'falling') {
        this.fallingStates.set(p, {
          timer: p.fallDelay || 0.7,
          triggered: false,
          fallen: false,
          mesh,
        });
      }
    }

    // 2. Wall-run surfaces
    for (const w of this.walls) {
      const geo = new THREE.BoxGeometry(1.2, w.height, 4);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x090d16,
        roughness: 0.2,
      });
      const wallMesh = new THREE.Mesh(geo, mat);
      wallMesh.position.set(w.x, w.y + w.height * 0.5, 0);

      // Neon vertical stripes indicating runnable surface
      const stripeGeo = new THREE.BoxGeometry(0.1, w.height, 4.1);
      const stripeMat = new THREE.MeshBasicMaterial({ color: edgeGlowColor });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      wallMesh.add(stripe);

      this.scene.add(wallMesh);
      this.wallMeshes.push(wallMesh);
    }

    // 3. Moving Platforms
    for (const mp of this.levelConfig.movingPlatforms) {
      const geo = new THREE.BoxGeometry(mp.width, mp.height, 4);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: edgeGlowColor,
        emissiveIntensity: 0.35,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(mp.x, mp.y, 0);
      this.scene.add(mesh);

      // Dynamic platform object added to collision list
      const dynamicPlat: PlatformDef = {
        x: mp.x,
        y: mp.y,
        width: mp.width,
        height: mp.height,
        type: 'moving',
      };
      this.platforms.push(dynamicPlat);

      this.movingMeshes.push({
        mesh,
        def: mp,
        basePos: new THREE.Vector3(mp.x, mp.y, 0),
      });
    }

    // 4. Hazards (Pistons / Lasers)
    for (const h of this.levelConfig.hazards) {
      const geo = new THREE.BoxGeometry(h.width, h.height, 3.5);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        emissive: 0xef4444,
        emissiveIntensity: 0.8,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(h.x, h.y, 0);
      this.scene.add(mesh);

      this.hazardMeshes.push({
        mesh,
        def: h,
        basePos: new THREE.Vector3(h.x, h.y, 0),
      });
    }

    // 5. Grapple Anchors Visuals
    for (const gp of this.levelConfig.grapplePoints) {
      const anchorGeo = new THREE.SphereGeometry(0.6, 16, 16);
      const anchorMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const anchorMesh = new THREE.Mesh(anchorGeo, anchorMat);
      anchorMesh.position.set(gp.x, gp.y, 0);

      // Outer ring
      const ringGeo = new THREE.TorusGeometry(0.95, 0.08, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      anchorMesh.add(ring);

      this.scene.add(anchorMesh);
      this.platformMeshes.push(anchorMesh);
    }

    // 6. Data Fragments
    this.collectibles = this.levelConfig.dataFragments.map((df, idx) => {
      const col = new Collectible(df.x, df.y, idx);
      this.scene.add(col.mesh);
      return col;
    });

    // 7. Checkpoints
    this.checkpointMeshes = this.levelConfig.checkpoints.map((cp) => {
      const group = new THREE.Group();
      group.position.set(cp.x, cp.y + 1.2, 0);

      const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.4, 8);
      const pillarMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
      const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
      leftPillar.position.x = -1.2;
      group.add(leftPillar);

      const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
      rightPillar.position.x = 1.2;
      group.add(rightPillar);

      // Beacon beam
      const beamGeo = new THREE.PlaneGeometry(2.2, 2.2);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      group.add(beam);

      this.scene.add(group);
      return { mesh: group, pos: cp, activated: false };
    });

    // 8. Goal Portal Beacon
    const g = this.levelConfig.goalPos;
    this.goalMesh = new THREE.Group();
    this.goalMesh.position.set(g.x, g.y, 0);

    const archGeo = new THREE.TorusGeometry(2.4, 0.25, 12, 32, Math.PI);
    const archMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.9,
    });
    const arch = new THREE.Mesh(archGeo, archMat);
    arch.rotation.z = -Math.PI * 0.5;
    this.goalMesh.add(arch);

    const goalLight = new THREE.PointLight(0xfbbf24, 2, 10);
    this.goalMesh.add(goalLight);
    this.scene.add(this.goalMesh);

    // 9. Drone Pursuer in Lv 22
    if (this.levelConfig.droneChase) {
      this.droneMesh = new THREE.Group();
      this.droneX = this.levelConfig.startPos.x - 12;
      this.droneMesh.position.set(this.droneX, this.levelConfig.startPos.y + 2, 0);

      const droneBody = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.2),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 1.0 })
      );
      this.droneMesh.add(droneBody);
      this.scene.add(this.droneMesh);
    }
  }

  public update(dt: number, time: number, playerPos: { x: number; y: number }): {
    hitGoal: boolean;
    hitHazard: boolean;
    activeCheckpointPos: { x: number; y: number } | null;
  } {
    this.stats.elapsedTime += dt;

    // Animate Data Fragments
    this.collectibles.forEach((c, idx) => {
      c.update(dt, time);
      if (!c.collected) {
        const dx = playerPos.x - c.x;
        const dy = playerPos.y - c.y;
        if (Math.sqrt(dx * dx + dy * dy) < 1.4) {
          c.collect();
          this.stats.fragmentsCollected[idx as 0 | 1 | 2] = true;
        }
      }
    });

    // Update Moving Platforms
    this.movingMeshes.forEach((item, index) => {
      const def = item.def;
      const offset = Math.sin(time * def.speed + (def.phase || 0));
      const nx = item.basePos.x + offset * def.rangeX;
      const ny = item.basePos.y + offset * def.rangeY;
      item.mesh.position.set(nx, ny, 0);

      // Synchronize collision box with visual position
      // The moving platforms start after static platforms in this.platforms
      const pIndex = this.levelConfig.platforms.length + index;
      if (this.platforms[pIndex]) {
        this.platforms[pIndex].x = nx;
        this.platforms[pIndex].y = ny;
      }
    });

    // Update Hazards & Check Collisions
    let hitHazard = false;
    this.hazardMeshes.forEach((item) => {
      const def = item.def;
      if (def.type === 'piston') {
        const pCycle = (time % (def.period || 2)) / (def.period || 2);
        const extend = pCycle < 0.35 ? pCycle / 0.35 : Math.max(0, 1 - (pCycle - 0.35) / 0.2);
        item.mesh.position.y = item.basePos.y - extend * 3.5;

        // Collision check
        const halfW = def.width * 0.5;
        const halfH = def.height * 0.5;
        if (
          playerPos.x > item.mesh.position.x - halfW &&
          playerPos.x < item.mesh.position.x + halfW &&
          playerPos.y > item.mesh.position.y - halfH &&
          playerPos.y < item.mesh.position.y + halfH
        ) {
          hitHazard = true;
        }
      }
    });

    // Update Falling Platforms
    this.fallingStates.forEach((state, plat) => {
      if (!state.triggered) {
        // Trigger if player stands on it
        const onTop =
          playerPos.x > plat.x - plat.width * 0.5 &&
          playerPos.x < plat.x + plat.width * 0.5 &&
          Math.abs(playerPos.y - (plat.y + plat.height * 0.5)) < 0.4;
        if (onTop) {
          state.triggered = true;
        }
      } else if (!state.fallen) {
        state.timer -= dt;
        // Jitter mesh before falling
        state.mesh.position.x = plat.x + (Math.random() - 0.5) * 0.15;
        if (state.timer <= 0) {
          state.fallen = true;
          // Drop platform out of collision
          plat.y = -999;
          state.mesh.position.y = -999;
        }
      }
    });

    // Update Checkpoints
    this.checkpointMeshes.forEach((cp) => {
      if (!cp.activated) {
        const dist = Math.abs(playerPos.x - cp.pos.x);
        if (dist < 1.5 && Math.abs(playerPos.y - cp.pos.y) < 3.0) {
          cp.activated = true;
          this.activeCheckpoint = cp.pos;
          this.stats.checkpointsPassed++;
          // Flare green
          cp.mesh.children.forEach((c) => {
            if (c instanceof THREE.Mesh && c.material instanceof THREE.MeshBasicMaterial) {
              c.material.color.set(0x22c55e);
            }
          });
          audioManager.playCheckpoint();
        }
      }
    });

    // Update Drone Pursuer in Lv 22
    if (this.droneMesh) {
      // Moves steadily forward, accelerating if player is far ahead
      const targetX = playerPos.x;
      const droneSpeed = 7.5 + (targetX - this.droneX > 15 ? 3.0 : 0);
      this.droneX += droneSpeed * dt;
      this.droneMesh.position.set(this.droneX, playerPos.y + Math.sin(time * 6) * 0.5, 0);

      // Check drone catch
      if (playerPos.x < this.droneX + 1.2) {
        hitHazard = true;
      }
    }

    // Check Goal Portal
    const g = this.levelConfig.goalPos;
    const hitGoal =
      playerPos.x >= g.x - g.width * 0.5 &&
      playerPos.x <= g.x + g.width * 0.5 &&
      playerPos.y >= g.y - g.height * 0.5 &&
      playerPos.y <= g.y + g.height * 0.5;

    // Rotate Goal Portal
    this.goalMesh.rotation.y += 1.5 * dt;

    return {
      hitGoal,
      hitHazard,
      activeCheckpointPos: this.activeCheckpoint,
    };
  }

  public getSpawnPosition(): { x: number; y: number } {
    if (this.activeCheckpoint) {
      return { x: this.activeCheckpoint.x, y: this.activeCheckpoint.y + 0.5 };
    }
    return { ...this.levelConfig.startPos };
  }
}
