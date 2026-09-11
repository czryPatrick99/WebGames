export interface InputState {
  moveX: number; // -1 to 1
  sprint: boolean;
  jumpPressed: boolean; // triggered this frame
  jumpHeld: boolean;
  slidePressed: boolean;
  slideHeld: boolean;
  dashPressed: boolean;
  grapplePressed: boolean;
  grappleHeld: boolean;
  restartPressed: boolean;
  pausePressed: boolean;
  jumpBuffered: boolean;
  slideBuffered: boolean;
}

export class InputManager {
  private keys: Record<string, boolean> = {};
  private jumpBufferTimer: number = 0;
  private slideBufferTimer: number = 0;
  private readonly BUFFER_DURATION = 0.15; // 150ms buffer

  // Touch controls state
  public touchMoveX: number = 0;
  public touchJumpPressed: boolean = false;
  public touchJumpHeld: boolean = false;
  public touchSlidePressed: boolean = false;
  public touchSlideHeld: boolean = false;
  public touchDashPressed: boolean = false;
  public touchGrapplePressed: boolean = false;
  public touchGrappleHeld: boolean = false;
  public touchRestartPressed: boolean = false;

  private onKeyDownBound: (e: KeyboardEvent) => void;
  private onKeyUpBound: (e: KeyboardEvent) => void;

  constructor() {
    this.onKeyDownBound = this.onKeyDown.bind(this);
    this.onKeyUpBound = this.onKeyUp.bind(this);
    window.addEventListener('keydown', this.onKeyDownBound);
    window.addEventListener('keyup', this.onKeyUpBound);
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('keyup', this.onKeyUpBound);
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    const key = e.code.toLowerCase();
    if (!this.keys[key]) {
      if (key === 'space' || key === 'arrowup' || key === 'keyw') {
        this.jumpBufferTimer = this.BUFFER_DURATION;
      }
      if (key === 'keyc' || key === 'arrowdown' || key === 'keys' || key === 'controlleft' || key === 'controlright') {
        this.slideBufferTimer = this.BUFFER_DURATION;
      }
    }
    this.keys[key] = true;
  }

  private onKeyUp(e: KeyboardEvent): void {
    const key = e.code.toLowerCase();
    this.keys[key] = false;
  }

  public update(dt: number): InputState {
    // Decrement buffers
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;
    if (this.slideBufferTimer > 0) this.slideBufferTimer -= dt;

    let moveX = 0;
    if (this.keys['keya'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['keyd'] || this.keys['arrowright']) moveX += 1;

    // Apply touch movement if active
    if (Math.abs(this.touchMoveX) > 0.05) {
      moveX = this.touchMoveX;
    }

    const sprint = !!(this.keys['shiftleft'] || this.keys['shiftright']);

    const rawJump = !!(this.keys['space'] || this.keys['arrowup'] || this.keys['keyw'] || this.touchJumpHeld);
    const jumpPressed = this.jumpBufferTimer > 0 || this.touchJumpPressed;
    const slidePressed = this.slideBufferTimer > 0 || this.touchSlidePressed;
    const slideHeld = !!(this.keys['keyc'] || this.keys['arrowdown'] || this.keys['keys'] || this.keys['controlleft'] || this.keys['controlright'] || this.touchSlideHeld);

    const dashPressed = !!(this.keys['keyj'] || this.keys['keye'] || this.touchDashPressed);
    const grapplePressed = !!(this.keys['keyk'] || this.keys['keyq'] || this.touchGrapplePressed);
    const grappleHeld = !!(this.keys['keyk'] || this.keys['keyq'] || this.touchGrappleHeld);

    const restartPressed = !!(this.keys['keyr'] || this.touchRestartPressed);
    const pausePressed = !!(this.keys['escape'] || this.keys['keyp']);

    // Consume one-frame touch presses
    const result: InputState = {
      moveX,
      sprint,
      jumpPressed,
      jumpHeld: rawJump,
      slidePressed,
      slideHeld,
      dashPressed,
      grapplePressed,
      grappleHeld,
      restartPressed,
      pausePressed,
      jumpBuffered: this.jumpBufferTimer > 0,
      slideBuffered: this.slideBufferTimer > 0,
    };

    // Reset touch triggers
    this.touchJumpPressed = false;
    this.touchSlidePressed = false;
    this.touchDashPressed = false;
    this.touchGrapplePressed = false;
    this.touchRestartPressed = false;

    return result;
  }

  public consumeJumpBuffer(): void {
    this.jumpBufferTimer = 0;
  }

  public consumeSlideBuffer(): void {
    this.slideBufferTimer = 0;
  }
}
