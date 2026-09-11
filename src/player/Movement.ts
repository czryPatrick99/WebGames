import { InputState } from '../core/InputManager';
import { audioManager } from '../audio/AudioManager';
import { PlatformDef, WallDef, GrapplePointDef } from '../levels/LevelData';

export interface MovementPhysicsState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: number; // 1 (right) or -1 (left)
  isGrounded: boolean;
  isSliding: boolean;
  isWallRunning: boolean;
  wallSide: 'left' | 'right' | null;
  isVaulting: boolean;
  isLedgeHanging: boolean;
  isDashing: boolean;
  isGrappling: boolean;
  grappleTarget: { x: number; y: number } | null;
  flow: number; // 0 to 100
  coyoteTimer: number;
  dashCooldown: number;
  wallRunTimer: number;
  slideTimer: number;
}

export class MovementController {
  // Movement Constants
  private readonly GRAVITY = -28.0;
  private readonly LOW_GRAVITY = -14.0;
  private readonly RUN_SPEED = 9.5;
  private readonly SPRINT_SPEED = 14.5;
  private readonly ACCEL_GROUND = 65.0;
  private readonly ACCEL_AIR = 35.0;
  private readonly FRICTION_GROUND = 18.0;
  private readonly FRICTION_AIR = 2.5;

  private readonly JUMP_VELOCITY = 13.2;
  private readonly COYOTE_MAX = 0.13; // 130ms coyote time
  private readonly WALL_RUN_MAX = 1.4; // 1.4s max wall run
  private readonly WALL_JUMP_UP = 12.0;
  private readonly WALL_JUMP_OUT = 11.5;
  private readonly DASH_SPEED = 21.0;
  private readonly DASH_DURATION = 0.18;
  private readonly DASH_COOLDOWN = 1.1;

  public state: MovementPhysicsState;
  private dashTimer: number = 0;
  private vaultTimer: number = 0;
  private rollBuffered: boolean = false;
  private preRollTimer: number = 0;

  constructor(startX: number, startY: number) {
    this.state = {
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      width: 0.7,
      height: 1.8,
      facing: 1,
      isGrounded: false,
      isSliding: false,
      isWallRunning: false,
      wallSide: null,
      isVaulting: false,
      isLedgeHanging: false,
      isDashing: false,
      isGrappling: false,
      grappleTarget: null,
      flow: 0,
      coyoteTimer: 0,
      dashCooldown: 0,
      wallRunTimer: 0,
      slideTimer: 0,
    };
  }

  public reset(x: number, y: number): void {
    this.state.x = x;
    this.state.y = y;
    this.state.vx = 0;
    this.state.vy = 0;
    this.state.facing = 1;
    this.state.isGrounded = false;
    this.state.isSliding = false;
    this.state.isWallRunning = false;
    this.state.wallSide = null;
    this.state.isVaulting = false;
    this.state.isLedgeHanging = false;
    this.state.isDashing = false;
    this.state.isGrappling = false;
    this.state.grappleTarget = null;
    this.state.coyoteTimer = 0;
    this.state.dashCooldown = 0;
    this.state.wallRunTimer = 0;
    this.state.slideTimer = 0;
    this.dashTimer = 0;
    this.vaultTimer = 0;
    this.state.height = 1.8;
  }

  public update(
    dt: number,
    input: InputState,
    platforms: PlatformDef[],
    walls: WallDef[],
    grapplePoints: GrapplePointDef[],
    levelId: number,
    gravityShift: boolean = false
  ): void {
    const s = this.state;
    const effectiveGravity = gravityShift ? this.LOW_GRAVITY : this.GRAVITY;

    // Cooldown timers
    if (s.dashCooldown > 0) s.dashCooldown -= dt;
    if (s.coyoteTimer > 0) s.coyoteTimer -= dt;

    // Buffer roll on landing if slide pressed right before impact
    if (input.slidePressed && !s.isGrounded) {
      this.preRollTimer = 0.2;
      this.rollBuffered = true;
    }
    if (this.preRollTimer > 0) {
      this.preRollTimer -= dt;
      if (this.preRollTimer <= 0) this.rollBuffered = false;
    }

    // Facing direction
    if (input.moveX !== 0 && !s.isWallRunning && !s.isGrappling) {
      s.facing = input.moveX > 0 ? 1 : -1;
    }

    // 1. DASH (Unlocked Level 19+)
    const canDash = levelId >= 19;
    if (canDash && input.dashPressed && s.dashCooldown <= 0 && !s.isDashing) {
      s.isDashing = true;
      this.dashTimer = this.DASH_DURATION;
      s.dashCooldown = this.DASH_COOLDOWN;
      s.vy = 0;
      s.vx = s.facing * this.DASH_SPEED;
      audioManager.playDash();
      this.addFlow(15);
    }

    if (s.isDashing) {
      this.dashTimer -= dt;
      s.vy = 0; // suspend gravity during air dash
      if (this.dashTimer <= 0) {
        s.isDashing = false;
        s.vx = s.facing * this.SPRINT_SPEED * 1.1; // Exit dash with momentum
      }
      s.x += s.vx * dt;
      return; // Skip normal movement updates during active dash impulse
    }

    // 2. GRAPPLE SWING (Unlocked Level 20+)
    const canGrapple = levelId >= 20;
    if (canGrapple && (input.grapplePressed || (input.grappleHeld && !s.isGrappling))) {
      // Find closest anchor within 15 meters
      let closest: GrapplePointDef | null = null;
      let minDist = 15.0;
      for (const pt of grapplePoints) {
        const dx = pt.x - s.x;
        const dy = pt.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist && pt.y > s.y + 1.0) {
          minDist = dist;
          closest = pt;
        }
      }

      if (closest && !s.isGrappling) {
        s.isGrappling = true;
        s.grappleTarget = { x: closest.x, y: closest.y };
        audioManager.playGrapple();
        this.addFlow(12);
      }
    }

    if (!input.grappleHeld && s.isGrappling) {
      // Release grapple with catapult momentum
      s.isGrappling = false;
      s.grappleTarget = null;
      s.vy = Math.max(s.vy, 8.0);
      s.vx *= 1.25;
      this.addFlow(15);
    }

    if (s.isGrappling && s.grappleTarget) {
      const gx = s.grappleTarget.x;
      const gy = s.grappleTarget.y;
      const dx = s.x - gx;
      const dy = s.y - gy;
      const length = Math.sqrt(dx * dx + dy * dy);

      // Pendulum acceleration
      const angle = Math.atan2(dy, dx);
      const pendulumForce = -Math.cos(angle) * 35.0;

      s.vx += Math.sin(angle) * pendulumForce * dt;
      s.vy += -Math.cos(angle) * pendulumForce * dt;

      // Restrain distance to rope radius
      const targetLen = 11.0;
      if (length > targetLen) {
        s.x = gx + (dx / length) * targetLen;
        s.y = gy + (dy / length) * targetLen;
      }

      s.x += s.vx * dt;
      s.y += s.vy * dt;

      if (input.jumpPressed) {
        // Grapple jump slingshot
        s.isGrappling = false;
        s.grappleTarget = null;
        s.vy = this.JUMP_VELOCITY * 1.15;
        s.vx = s.facing * (this.SPRINT_SPEED * 1.2);
        audioManager.playJump();
        this.addFlow(18);
      }
      return;
    }

    // 3. LEDGE GRAB & CLIMB
    if (s.isLedgeHanging) {
      s.vx = 0;
      s.vy = 0;
      if (input.jumpPressed || input.moveX !== 0) {
        // Pull up
        s.isLedgeHanging = false;
        s.y += 1.3;
        s.x += s.facing * 0.7;
        s.vy = 5.0;
        s.vx = s.facing * 4.0;
        audioManager.playVault();
        this.addFlow(10);
      }
      return;
    }

    // 4. VAULTING
    if (s.isVaulting) {
      this.vaultTimer -= dt;
      s.vx = s.facing * 8.5;
      s.vy = 3.5;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (this.vaultTimer <= 0) {
        s.isVaulting = false;
      }
      return;
    }

    // 5. SLIDE & ROLL
    const wantsSlide = input.slideHeld || input.slidePressed;
    if (wantsSlide && s.isGrounded && !s.isSliding) {
      s.isSliding = true;
      s.slideTimer = 0.75;
      s.height = 0.85; // Low profile collider
      // Boost initial slide speed
      const baseBoost = Math.max(Math.abs(s.vx) * 1.1, 10.5);
      s.vx = s.facing * baseBoost;
      audioManager.playSlide();
      this.addFlow(8);
    }

    if (s.isSliding) {
      s.slideTimer -= dt;
      // Decay slide velocity gradually
      s.vx -= s.vx * 1.8 * dt;
      if (s.slideTimer <= 0 || !wantsSlide || Math.abs(s.vx) < 3.0) {
        s.isSliding = false;
        s.height = 1.8;
      }
    }

    // 6. WALL RUN & WALL JUMP
    let nearWall: WallDef | null = null;
    if (!s.isGrounded && s.vy < 3.0) {
      for (const w of walls) {
        const xDist = Math.abs(s.x - w.x);
        const withinY = s.y >= w.y - 1.0 && s.y <= w.y + w.height + 1.0;
        if (xDist < 0.8 && withinY) {
          nearWall = w;
          break;
        }
      }
    }

    if (nearWall && !s.isWallRunning && s.wallRunTimer < this.WALL_RUN_MAX) {
      const pushingTowardsWall = (nearWall.side === 'left' && input.moveX >= 0) || (nearWall.side === 'right' && input.moveX <= 0);
      if (pushingTowardsWall || Math.abs(s.vx) > 3.0) {
        s.isWallRunning = true;
        s.wallSide = nearWall.side;
        s.wallRunTimer = 0;
        s.vy = Math.max(-1.5, s.vy * 0.4); // Greatly reduce vertical drop
        audioManager.playWallRun();
        this.addFlow(10);
      }
    }

    if (s.isWallRunning) {
      s.wallRunTimer += dt;
      // Slow gravity on wall
      s.vy -= 4.0 * dt;
      s.vx = s.facing * (input.sprint ? this.SPRINT_SPEED * 0.85 : this.RUN_SPEED * 0.85);

      // Check wall-jump
      if (input.jumpPressed) {
        s.isWallRunning = false;
        const kickDir = s.wallSide === 'left' ? -1 : 1;
        s.facing = kickDir;
        s.vx = kickDir * this.WALL_JUMP_OUT;
        s.vy = this.WALL_JUMP_UP;
        audioManager.playWallJump();
        this.addFlow(16);
      } else if (s.wallRunTimer >= this.WALL_RUN_MAX || !nearWall) {
        s.isWallRunning = false;
        s.wallSide = null;
      }
    }

    // 7. GROUND / AIR KINEMATICS
    if (!s.isWallRunning && !s.isSliding) {
      const flowBonus = (s.flow / 100) * 0.25; // +25% top speed at 100 Flow
      const targetMax = (input.sprint ? this.SPRINT_SPEED : this.RUN_SPEED) * (1 + flowBonus);
      const targetVx = input.moveX * targetMax;

      const accel = s.isGrounded ? this.ACCEL_GROUND : this.ACCEL_AIR;
      const friction = s.isGrounded ? this.FRICTION_GROUND : this.FRICTION_AIR;

      if (input.moveX !== 0) {
        s.vx += (targetVx - s.vx) * Math.min(1, accel * dt);
      } else {
        s.vx -= s.vx * Math.min(1, friction * dt);
      }

      // Apply Gravity
      s.vy += effectiveGravity * dt;
    }

    // 8. JUMP (Variable Jump Height + Coyote Time)
    const canJump = s.isGrounded || s.coyoteTimer > 0;
    if (input.jumpPressed && canJump && !s.isSliding && !s.isWallRunning) {
      s.isGrounded = false;
      s.coyoteTimer = 0;
      s.vy = this.JUMP_VELOCITY;
      audioManager.playJump();
      this.addFlow(6);
    }

    // Variable jump height: release early cuts upward momentum
    if (!input.jumpHeld && s.vy > 5.0) {
      s.vy *= 0.65;
    }

    // Integrate Position
    s.x += s.vx * dt;
    s.y += s.vy * dt;

    // 9. PLATFORM COLLISIONS
    this.resolvePlatformCollisions(platforms);

    // 10. FLOW ACCUMULATION & DECAY
    const speed = Math.abs(s.vx);
    if (speed > 8.0) {
      this.addFlow(dt * 12.0);
    } else if (speed < 2.0 && s.isGrounded) {
      // Decay when stationary
      s.flow = Math.max(0, s.flow - dt * 25.0);
    }
  }

  private resolvePlatformCollisions(platforms: PlatformDef[]): void {
    const s = this.state;
    let wasGrounded = s.isGrounded;
    s.isGrounded = false;

    const halfW = s.width * 0.5;
    const feetY = s.y;
    const headY = s.y + s.height;

    for (const p of platforms) {
      const pLeft = p.x - p.width * 0.5;
      const pRight = p.x + p.width * 0.5;
      const pTop = p.y + p.height * 0.5;
      const pBottom = p.y - p.height * 0.5;

      // Check horizontal overlap
      if (s.x + halfW > pLeft && s.x - halfW < pRight) {
        // Waist barrier vault detection
        if (p.type === 'barrier_waist' && Math.abs(s.vx) > 4.0 && s.y >= pBottom && s.y <= pTop + 0.3) {
          s.isVaulting = true;
          this.vaultTimer = 0.28;
          audioManager.playVault();
          this.addFlow(12);
          continue;
        }

        // Low barrier check (slide under)
        if (p.type === 'barrier_low') {
          if (s.isSliding && s.height <= 0.9) {
            // Player slides under safely!
            continue;
          } else {
            // Player hits barrier head-on
            s.vx *= -0.2;
            s.flow = Math.max(0, s.flow - 25);
            continue;
          }
        }

        // Landing on top of platform
        if (feetY <= pTop + 0.35 && feetY >= pTop - 0.6 && s.vy <= 0) {
          s.y = pTop;
          s.vy = 0;
          s.isGrounded = true;
          s.coyoteTimer = this.COYOTE_MAX;
          s.wallRunTimer = 0;

          // Conveyor belt momentum
          if (p.type === 'conveyor' && p.conveyorSpeed) {
            s.vx += p.conveyorSpeed * 0.15;
          }

          if (!wasGrounded) {
            if (this.rollBuffered) {
              // Roll recovery: preserve all momentum
              audioManager.playSlide();
              this.addFlow(10);
              this.rollBuffered = false;
            } else {
              audioManager.playLand(false);
            }
          }
        }
        // Hitting ceiling from underneath
        else if (headY >= pBottom && headY <= pBottom + 0.5 && s.vy > 0) {
          s.y = pBottom - s.height;
          s.vy = -1.0;
        }
      }
    }
  }

  public addFlow(amount: number): void {
    this.state.flow = Math.min(100, this.state.flow + amount);
    audioManager.setFlow(this.state.flow);
  }
}
