import * as THREE from 'three';
import { CameraController } from '../camera/CameraController';
import { InputManager } from './InputManager';
import { Player } from '../player/Player';
import { MovementController } from '../player/Movement';
import { LevelManager } from '../levels/LevelManager';
import { getLevelById, LevelConfig } from '../levels/LevelData';
import { saveManager, GhostFrame } from '../save/SaveManager';
import { audioManager } from '../audio/AudioManager';

export interface GameHUDData {
  time: number;
  speed: number;
  flow: number;
  fragments: [boolean, boolean, boolean];
  currentLevel: number;
  levelTitle: string;
  lesson: string;
  instruction: string;
  ghostDelta: number | null; // delta time vs ghost (+0.2s or -0.5s)
  bronzeTime: number;
  silverTime: number;
  goldTime: number;
}

export class Game {
  public scene: THREE.Scene;
  public cameraController: CameraController;
  public renderer: THREE.WebGLRenderer;
  public inputManager: InputManager;
  public player: Player;
  public movement: MovementController;
  public levelManager: LevelManager;

  private container: HTMLElement;
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  // Level & Ghost Tracking
  public currentLevelId: number = 1;
  private activeGhost: GhostFrame[] | null = null;
  private ghostPlaybackIndex: number = 0;
  private currentRunGhost: GhostFrame[] = [];
  private ghostSampleTimer: number = 0;

  // UI Callbacks
  private onHUDUpdate: ((data: GameHUDData) => void) | null = null;
  private onLevelFinish: ((result: {
    levelId: number;
    time: number;
    bestTime: number;
    stars: number;
    flow: number;
    deaths: number;
    fragments: [boolean, boolean, boolean];
    score: number;
    isNewBest: boolean;
  }) => void) | null = null;

  // Parallax background buildings
  private bgGroup: THREE.Group;

  constructor(container: HTMLElement) {
    this.container = container;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x080811, 0.018);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x080811);
    container.appendChild(this.renderer.domElement);

    // Camera & Input
    this.cameraController = new CameraController(width, height);
    this.inputManager = new InputManager();

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.9);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 30, 20);
    this.scene.add(dirLight);

    // Background Cyberpunk Skyline
    this.bgGroup = new THREE.Group();
    this.buildSkyline();
    this.scene.add(this.bgGroup);

    // Initial Level & Player
    const saveData = saveManager.getData();
    this.currentLevelId = Math.min(saveData.unlockedLevel, 1);
    const initialConfig = getLevelById(this.currentLevelId);

    this.levelManager = new LevelManager(this.scene, initialConfig);
    this.player = new Player(saveData.customization.skin, saveData.customization.trail);
    this.scene.add(this.player.mesh);
    this.scene.add(this.player.ghostMesh);
    this.scene.add(this.player.getTrailMesh());
    this.scene.add(this.player.grappleLine);

    this.movement = new MovementController(initialConfig.startPos.x, initialConfig.startPos.y);
    this.loadGhostForLevel(this.currentLevelId);

    window.addEventListener('resize', this.onResize.bind(this));
  }

  private buildSkyline(): void {
    // Generate 40 stylized background skyscrapers with window light grids
    for (let i = -15; i < 60; i++) {
      const bHeight = 25 + Math.random() * 45;
      const bWidth = 8 + Math.random() * 12;
      const geo = new THREE.BoxGeometry(bWidth, bHeight, 10);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x070913,
        roughness: 0.9,
      });
      const building = new THREE.Mesh(geo, mat);
      building.position.set(i * 12, bHeight * 0.5 - 15, -20 - Math.random() * 30);
      this.bgGroup.add(building);

      // Neon antenna or rooftop light
      if (Math.random() > 0.4) {
        const spireGeo = new THREE.CylinderGeometry(0.1, 0.1, 8, 4);
        const spireMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x06b6d4 : 0xec4899 });
        const spire = new THREE.Mesh(spireGeo, spireMat);
        spire.position.set(0, bHeight * 0.5 + 4, 0);
        building.add(spire);
      }
    }
  }

  private onResize(): void {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.cameraController.setAspect(w, h);
    this.renderer.setSize(w, h);
  }

  public setCallbacks(
    onHUD: (data: GameHUDData) => void,
    onLevelFinish: (result: {
      levelId: number;
      time: number;
      bestTime: number;
      stars: number;
      flow: number;
      deaths: number;
      fragments: [boolean, boolean, boolean];
      score: number;
      isNewBest: boolean;
    }) => void
  ): void {
    this.onHUDUpdate = onHUD;
    this.onLevelFinish = onLevelFinish;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    audioManager.init();
    audioManager.startMusic();
    this.loop(this.lastTime);
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  public loadLevel(levelId: number): void {
    this.currentLevelId = levelId;
    const config = getLevelById(levelId);
    this.levelManager.setLevel(config);
    this.movement.reset(config.startPos.x, config.startPos.y);
    this.player.setPosition(config.startPos.x, config.startPos.y);
    this.cameraController.resetTo(config.startPos.x, config.startPos.y);

    this.currentRunGhost = [];
    this.ghostSampleTimer = 0;
    this.loadGhostForLevel(levelId);
  }

  public restartAtCheckpoint(): void {
    const spawn = this.levelManager.getSpawnPosition();
    this.movement.reset(spawn.x, spawn.y);
    this.player.setPosition(spawn.x, spawn.y);
    this.cameraController.resetTo(spawn.x, spawn.y);
    this.cameraController.addShake(0.4);
    audioManager.playDeath();
    this.levelManager.recordFailure();
  }

  private loadGhostForLevel(levelId: number): void {
    this.activeGhost = saveManager.getGhost(levelId) || null;
    this.ghostPlaybackIndex = 0;
    this.player.updateGhost(undefined);
  }

  public applyCustomization(): void {
    const data = saveManager.getData();
    this.player.applyCustomization(data.customization.skin, data.customization.trail);
  }

  private loop(now: number): void {
    this.animFrameId = requestAnimationFrame(this.loop.bind(this));

    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    if (this.isPaused || !this.isRunning) {
      this.renderer.render(this.scene, this.cameraController.camera);
      return;
    }

    // 1. Process Input
    const input = this.inputManager.update(dt);

    // Quick restart key (R)
    if (input.restartPressed) {
      this.restartAtCheckpoint();
      return;
    }

    // 2. Physics & Movement Update
    const config = this.levelManager.levelConfig;
    this.movement.update(
      dt,
      input,
      this.levelManager.platforms,
      this.levelManager.walls,
      config.grapplePoints,
      this.currentLevelId,
      config.gravityShift
    );

    const mState = this.movement.state;

    // Check boundary fall
    if (mState.y < -15) {
      this.restartAtCheckpoint();
      return;
    }

    // 3. Update 3D Player Mesh
    this.player.setPosition(mState.x, mState.y);
    this.player.setGrappleTarget(
      { x: mState.x, y: mState.y },
      mState.isGrappling ? mState.grappleTarget : null
    );

    const speed = Math.sqrt(mState.vx * mState.vx + mState.vy * mState.vy);
    this.player.updateAnimation(dt, {
      isGrounded: mState.isGrounded,
      isSliding: mState.isSliding,
      isWallRunning: mState.isWallRunning,
      wallSide: mState.wallSide,
      isVaulting: mState.isVaulting,
      isLedgeHanging: mState.isLedgeHanging,
      isDashing: mState.isDashing,
      isGrappling: mState.isGrappling,
      speed,
      facing: mState.facing,
      flow: mState.flow / 100,
    });

    // 4. Sample & Replay Ghost
    this.ghostSampleTimer += dt;
    if (this.ghostSampleTimer >= 0.033) {
      // 30 Hz ghost sampling
      this.ghostSampleTimer = 0;
      this.currentRunGhost.push({
        t: this.levelManager.stats.elapsedTime,
        x: mState.x,
        y: mState.y,
        z: 0,
        action: mState.isSliding ? 'slide' : mState.isWallRunning ? 'wall' : 'run',
        facing: mState.facing,
      });
    }

    // Ghost Playback
    let ghostDelta: number | null = null;
    if (this.activeGhost && this.activeGhost.length > 0) {
      const curTime = this.levelManager.stats.elapsedTime;
      while (
        this.ghostPlaybackIndex < this.activeGhost.length - 1 &&
        this.activeGhost[this.ghostPlaybackIndex + 1].t <= curTime
      ) {
        this.ghostPlaybackIndex++;
      }
      const ghostFrame = this.activeGhost[this.ghostPlaybackIndex];
      if (ghostFrame) {
        this.player.updateGhost(ghostFrame);
        // Estimate delta time: distance delta divided by average speed
        ghostDelta = (ghostFrame.x - mState.x) / 12.0;
      }
    }

    // 5. Update Level World, Hazards, Collectibles, Goals
    const levelResult = this.levelManager.update(dt, now * 0.001, { x: mState.x, y: mState.y });

    if (levelResult.hitHazard) {
      this.restartAtCheckpoint();
      return;
    }

    // 6. Level Finish Check
    if (levelResult.hitGoal) {
      this.handleLevelWin();
      return;
    }

    // 7. Update Camera
    this.cameraController.setTarget({
      x: mState.x,
      y: mState.y,
      vx: mState.vx,
      vy: mState.vy,
      isWallRunning: mState.isWallRunning,
      wallSide: mState.wallSide,
    });
    this.cameraController.update(dt, mState.flow / 100);

    // Parallax background buildings
    this.bgGroup.position.x = this.cameraController.camera.position.x * 0.75;

    // 8. Update HUD Callback
    if (this.onHUDUpdate) {
      this.onHUDUpdate({
        time: this.levelManager.stats.elapsedTime,
        speed: speed * 3.6, // in km/h
        flow: mState.flow,
        fragments: this.levelManager.stats.fragmentsCollected,
        currentLevel: this.currentLevelId,
        levelTitle: config.title,
        lesson: config.lesson,
        instruction: config.instruction,
        ghostDelta,
        bronzeTime: config.bronzeTime,
        silverTime: config.silverTime,
        goldTime: config.goldTime,
      });
    }

    // 9. Render
    this.renderer.render(this.scene, this.cameraController.camera);
  }

  private handleLevelWin(): void {
    const stats = this.levelManager.stats;
    const config = this.levelManager.levelConfig;
    const time = stats.elapsedTime;

    // Calculate Stars (Gold = 3, Silver = 2, Bronze = 1, Completed = 1)
    let stars = 1;
    if (time <= config.goldTime) {
      stars = 3;
    } else if (time <= config.silverTime) {
      stars = 2;
    }

    // Score formula based on flow, speed, time under par, collectibles, and zero deaths
    const parTime = config.bronzeTime;
    const timeBonus = Math.max(0, Math.round((parTime - time) * 1200));
    const flowBonus = Math.round(this.movement.state.flow * 250);
    const fragmentBonus = stats.fragmentsCollected.filter(Boolean).length * 5000;
    const cleanRunBonus = stats.deaths === 0 ? 10000 : Math.max(0, 5000 - stats.deaths * 1000);
    const totalScore = Math.max(1000, 10000 + timeBonus + flowBonus + fragmentBonus + cleanRunBonus);

    audioManager.playVictory();

    const saveResult = saveManager.saveRun(
      this.currentLevelId,
      time,
      stars,
      stats.fragmentsCollected,
      stats.deaths,
      this.movement.state.flow,
      stats.shortcutsDiscovered,
      totalScore,
      this.currentRunGhost
    );

    this.pause();

    if (this.onLevelFinish) {
      const record = saveManager.getRecord(this.currentLevelId);
      this.onLevelFinish({
        levelId: this.currentLevelId,
        time,
        bestTime: record ? record.bestTime : time,
        stars,
        flow: Math.round(this.movement.state.flow),
        deaths: stats.deaths,
        fragments: stats.fragmentsCollected,
        score: totalScore,
        isNewBest: saveResult.isNewBest,
      });
    }
  }

  public destroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    audioManager.stopMusic();
    this.inputManager.destroy();
    window.removeEventListener('resize', this.onResize.bind(this));
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
