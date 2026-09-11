export interface PlatformDef {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'solid' | 'narrow' | 'conveyor' | 'falling' | 'barrier_low' | 'barrier_waist' | 'glass' | 'moving';
  conveyorSpeed?: number;
  fallDelay?: number;
}

export interface WallDef {
  x: number;
  y: number;
  height: number;
  side: 'left' | 'right'; // left means runner runs on left face moving right/up
}

export interface MovingPlatformDef {
  x: number;
  y: number;
  width: number;
  height: number;
  rangeX: number;
  rangeY: number;
  speed: number;
  phase?: number;
}

export interface HazardDef {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'laser' | 'piston' | 'drone' | 'shock';
  speed?: number;
  period?: number;
}

export interface GrapplePointDef {
  x: number;
  y: number;
  id: string;
}

export interface LevelConfig {
  id: number;
  world: number;
  title: string;
  lesson: string;
  instruction: string;
  storyLog: string;
  bronzeTime: number;
  silverTime: number;
  goldTime: number;
  theme: 'rooftops' | 'concrete' | 'industrial' | 'neon' | 'ascension';
  startPos: { x: number; y: number };
  goalPos: { x: number; y: number; width: number; height: number };
  platforms: PlatformDef[];
  walls: WallDef[];
  movingPlatforms: MovingPlatformDef[];
  hazards: HazardDef[];
  grapplePoints: GrapplePointDef[];
  dataFragments: { x: number; y: number }[]; // 3 per level
  checkpoints: { x: number; y: number }[];
  droneChase?: boolean;
  gravityShift?: boolean;
}

export const WORLDS = [
  {
    id: 1,
    name: 'THE ROOFTOPS',
    subtitle: 'Levels 1–6',
    desc: 'Master fundamentals: run momentum, coyote jump timing, and kinetic slides beneath rooftop conduits.',
    color: '#06b6d4',
  },
  {
    id: 2,
    name: 'THE CONCRETE MAZE',
    subtitle: 'Levels 7–12',
    desc: 'Harness verticality: waist vaults, wall-running grip, rapid wall-kicks, and high-altitude climbs.',
    color: '#3b82f6',
  },
  {
    id: 3,
    name: 'THE INDUSTRIAL ZONE',
    subtitle: 'Levels 13–18',
    desc: 'High velocity navigation: conveyor belts, oscillating sky cranes, collapsing floors, and crushing pistons.',
    color: '#f59e0b',
  },
  {
    id: 4,
    name: 'THE NEON CITY',
    subtitle: 'Levels 19–24',
    desc: 'Advanced cyber kineticism: mid-air dashes, grapple tether swings, moving mag-lev traffic, and drone chases.',
    color: '#ec4899',
  },
  {
    id: 5,
    name: 'THE ASCENSION',
    subtitle: 'Levels 25–30',
    desc: 'The pinnacle skyscraper climb: gravity shifts, catastrophic collapses, and the sunrise horizon.',
    color: '#a855f7',
  },
];

// Helper to generate levels 1 through 30 cleanly
function createLevels(): LevelConfig[] {
  const list: LevelConfig[] = [];

  // World 1: The Rooftops (Levels 1 to 6)
  list.push({
    id: 1,
    world: 1,
    title: 'First Step',
    lesson: 'Run + Jump + Landing',
    instruction: 'Use A/D to run, Space to Jump. Time your landings for smooth momentum.',
    storyLog: 'SYS_LOG_01: Neural runner link initialized. Uplink beacon detected atop Sector 7.',
    bronzeTime: 22,
    silverTime: 16,
    goldTime: 11.5,
    theme: 'rooftops',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 75, y: 7, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 22, height: 4, type: 'solid' },
      { x: 26, y: 1.5, width: 14, height: 4, type: 'solid' },
      { x: 44, y: 3, width: 15, height: 4, type: 'solid' },
      { x: 64, y: 5, width: 18, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 14, y: 4.5 },
      { x: 38, y: 4.5 },
      { x: 58, y: 7.5 },
    ],
    checkpoints: [{ x: 28, y: 3.5 }, { x: 46, y: 5 }],
  });

  list.push({
    id: 2,
    world: 1,
    title: 'The Gap',
    lesson: 'Sprint + Long Jumps',
    instruction: 'Hold Shift to Sprint and leap wide rooftop chasms. Coyote time gives you extra jump buffer.',
    storyLog: 'SYS_LOG_02: Atmospheric sensors indicate heavy smog below. Stay on the rooftop line.',
    bronzeTime: 25,
    silverTime: 18,
    goldTime: 13.2,
    theme: 'rooftops',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 92, y: 8, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 20, height: 4, type: 'solid' },
      { x: 28, y: 1, width: 12, height: 4, type: 'solid' },
      { x: 48, y: 2, width: 12, height: 4, type: 'solid' },
      { x: 68, y: 4, width: 12, height: 4, type: 'solid' },
      { x: 86, y: 6, width: 16, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 24, y: 5 },
      { x: 44, y: 6 },
      { x: 78, y: 8 },
    ],
    checkpoints: [{ x: 30, y: 3 }, { x: 70, y: 6 }],
  });

  list.push({
    id: 3,
    world: 1,
    title: 'Low Road',
    lesson: 'Slide Under Barriers',
    instruction: 'Press C or Down to Slide under low pipes and ductwork without scrubbing your speed.',
    storyLog: 'SYS_LOG_03: HVAC security exhaust grids live. Low clearance clearance bypass required.',
    bronzeTime: 26,
    silverTime: 19,
    goldTime: 14.1,
    theme: 'rooftops',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 95, y: 6, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 30, height: 4, type: 'solid' },
      { x: 18, y: 2.2, width: 4, height: 1.2, type: 'barrier_low' },
      { x: 34, y: 0, width: 28, height: 4, type: 'solid' },
      { x: 48, y: 2.2, width: 5, height: 1.2, type: 'barrier_low' },
      { x: 66, y: 2, width: 18, height: 4, type: 'solid' },
      { x: 88, y: 4, width: 16, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 20, y: 1.2 }, // slide under
      { x: 50, y: 1.2 },
      { x: 80, y: 7 },
    ],
    checkpoints: [{ x: 36, y: 2 }, { x: 68, y: 4 }],
  });

  list.push({
    id: 4,
    world: 1,
    title: 'Rooftop Runner',
    lesson: 'Run - Jump - Slide - Jump Combo',
    instruction: 'Chain your actions seamlessly. High Flow increases your top speed and acceleration.',
    storyLog: 'SYS_LOG_04: Kinetic flow generator synchronizing with runner rhythm. Maintain velocity.',
    bronzeTime: 28,
    silverTime: 21,
    goldTime: 15.5,
    theme: 'rooftops',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 110, y: 9, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 22, height: 4, type: 'solid' },
      { x: 28, y: 1, width: 20, height: 4, type: 'solid' },
      { x: 38, y: 3.2, width: 4, height: 1.2, type: 'barrier_low' },
      { x: 54, y: 3, width: 18, height: 4, type: 'solid' },
      { x: 78, y: 5, width: 18, height: 4, type: 'solid' },
      { x: 88, y: 7.2, width: 4, height: 1.2, type: 'barrier_low' },
      { x: 102, y: 7, width: 16, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 40, y: 2.2 },
      { x: 74, y: 7.5 },
      { x: 96, y: 10 },
    ],
    checkpoints: [{ x: 30, y: 3 }, { x: 80, y: 7 }],
  });

  list.push({
    id: 5,
    world: 1,
    title: 'Broken Buildings',
    lesson: 'Timing Dynamic Drops',
    instruction: 'Navigate crumbling spans and steep rooftop drop-offs. Slide on landing to roll and keep momentum.',
    storyLog: 'SYS_LOG_05: Structural decay detected in outer sector. Cross quickly before collapse.',
    bronzeTime: 30,
    silverTime: 22,
    goldTime: 16.8,
    theme: 'rooftops',
    startPos: { x: 0, y: 8 },
    goalPos: { x: 115, y: 5, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 5, width: 18, height: 4, type: 'solid' },
      { x: 24, y: 3, width: 14, height: 4, type: 'solid' },
      { x: 44, y: 1, width: 14, height: 4, type: 'solid' },
      { x: 64, y: 2, width: 12, height: 4, type: 'solid' },
      { x: 82, y: 4, width: 14, height: 4, type: 'solid' },
      { x: 104, y: 3, width: 20, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 21, y: 6 },
      { x: 55, y: 4 },
      { x: 94, y: 6.5 },
    ],
    checkpoints: [{ x: 46, y: 3 }, { x: 84, y: 6 }],
  });

  list.push({
    id: 6,
    world: 1,
    title: 'Rooftop Trial',
    lesson: 'World 1 Speedrun Master Trial',
    instruction: 'Chain every skill: sprint, precision hops, and slide recoveries under pressure. Beat the Gold target!',
    storyLog: 'SYS_LOG_06: Rooftop sector clearance exam initiated. Uploading ghost telemetry to central archive.',
    bronzeTime: 36,
    silverTime: 27,
    goldTime: 19.8,
    theme: 'rooftops',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 135, y: 11, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 20, height: 4, type: 'solid' },
      { x: 26, y: 1, width: 14, height: 4, type: 'solid' },
      { x: 33, y: 3.2, width: 4, height: 1.2, type: 'barrier_low' },
      { x: 46, y: 3, width: 12, height: 4, type: 'solid' },
      { x: 64, y: 5, width: 14, height: 4, type: 'solid' },
      { x: 84, y: 7, width: 16, height: 4, type: 'solid' },
      { x: 92, y: 9.2, width: 4, height: 1.2, type: 'barrier_low' },
      { x: 106, y: 9, width: 14, height: 4, type: 'solid' },
      { x: 126, y: 9, width: 18, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 35, y: 2.2 },
      { x: 74, y: 8.5 },
      { x: 116, y: 12 },
    ],
    checkpoints: [{ x: 48, y: 5 }, { x: 86, y: 9 }],
  });

  // World 2: The Concrete Maze (Levels 7 to 12)
  list.push({
    id: 7,
    world: 2,
    title: 'The Vault',
    lesson: 'Vaulting Waist-High Barriers',
    instruction: 'Run toward waist-high obstacles; tap Jump or maintain momentum to vault smoothly over.',
    storyLog: 'SYS_LOG_07: Concrete sector defenses ahead. Low perimeter barricades active.',
    bronzeTime: 26,
    silverTime: 19,
    goldTime: 13.8,
    theme: 'concrete',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 85, y: 6, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 24, height: 4, type: 'solid' },
      { x: 14, y: 2.5, width: 2, height: 2, type: 'barrier_waist' },
      { x: 30, y: 1, width: 20, height: 4, type: 'solid' },
      { x: 42, y: 3.5, width: 2, height: 2, type: 'barrier_waist' },
      { x: 56, y: 2, width: 18, height: 4, type: 'solid' },
      { x: 78, y: 4, width: 18, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 14, y: 5.5 },
      { x: 42, y: 6.5 },
      { x: 68, y: 6 },
    ],
    checkpoints: [{ x: 32, y: 3 }, { x: 58, y: 4 }],
  });

  list.push({
    id: 8,
    world: 2,
    title: 'Narrow Escape',
    lesson: 'Precision on Narrow Beams',
    instruction: 'Land cleanly on narrow beams. Tapping opposite direction instantly halts momentum.',
    storyLog: 'SYS_LOG_08: Heavy crosswinds along girder line. Narrow footprint required.',
    bronzeTime: 28,
    silverTime: 21,
    goldTime: 15.2,
    theme: 'concrete',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 90, y: 8, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 16, height: 4, type: 'solid' },
      { x: 22, y: 1, width: 4, height: 4, type: 'narrow' },
      { x: 32, y: 2, width: 4, height: 4, type: 'narrow' },
      { x: 44, y: 3, width: 5, height: 4, type: 'narrow' },
      { x: 56, y: 4, width: 5, height: 4, type: 'narrow' },
      { x: 70, y: 5, width: 6, height: 4, type: 'narrow' },
      { x: 84, y: 6, width: 16, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 22, y: 4 },
      { x: 44, y: 6 },
      { x: 70, y: 8 },
    ],
    checkpoints: [{ x: 32, y: 4 }, { x: 56, y: 6 }],
  });

  list.push({
    id: 9,
    world: 2,
    title: 'Wall Contact',
    lesson: 'First Wall-Run',
    instruction: 'Jump toward a tall neon wall while holding forward. You will stick and run horizontally along it!',
    storyLog: 'SYS_LOG_09: Kinetic magnetic grip unlocked in neural boot soles. Wall traversal enabled.',
    bronzeTime: 30,
    silverTime: 22,
    goldTime: 15.8,
    theme: 'concrete',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 92, y: 9, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 18, height: 4, type: 'solid' },
      { x: 50, y: 3, width: 16, height: 4, type: 'solid' },
      { x: 80, y: 7, width: 20, height: 4, type: 'solid' },
    ],
    walls: [
      { x: 24, y: 2, height: 10, side: 'left' },
      { x: 68, y: 5, height: 10, side: 'left' },
    ],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 28, y: 7 }, // along wall run
      { x: 56, y: 6 },
      { x: 72, y: 10 },
    ],
    checkpoints: [{ x: 52, y: 5 }],
  });

  list.push({
    id: 10,
    world: 2,
    title: 'Two Walls',
    lesson: 'Wall-Jumping',
    instruction: 'While wall-running or sliding down a wall, press Jump to kick off toward the opposite wall!',
    storyLog: 'SYS_LOG_10: Concrete compression chasm ahead. Zig-zag wall impulses required for ascent.',
    bronzeTime: 32,
    silverTime: 23,
    goldTime: 16.4,
    theme: 'concrete',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 60, y: 20, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 16, height: 4, type: 'solid' },
      { x: 54, y: 18, width: 18, height: 4, type: 'solid' },
    ],
    walls: [
      { x: 20, y: 2, height: 18, side: 'left' },
      { x: 30, y: 4, height: 18, side: 'right' },
      { x: 42, y: 8, height: 18, side: 'left' },
    ],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 25, y: 7 },
      { x: 36, y: 12 },
      { x: 46, y: 18 },
    ],
    checkpoints: [{ x: 30, y: 10 }],
  });

  list.push({
    id: 11,
    world: 2,
    title: 'Vertical Alley',
    lesson: 'Wall-Run + Wall-Jump + Ledge Grab',
    instruction: 'Scale the deep alleyway. Catch the ledge at the top to pull yourself over.',
    storyLog: 'SYS_LOG_11: Alley maintenance shaft sealed. Ascend to roof level to bypass security gate.',
    bronzeTime: 34,
    silverTime: 24,
    goldTime: 17.5,
    theme: 'concrete',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 75, y: 24, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 14, height: 4, type: 'solid' },
      { x: 32, y: 12, width: 10, height: 3, type: 'solid' },
      { x: 68, y: 22, width: 16, height: 4, type: 'solid' },
    ],
    walls: [
      { x: 18, y: 2, height: 14, side: 'left' },
      { x: 26, y: 4, height: 14, side: 'right' },
      { x: 48, y: 14, height: 14, side: 'left' },
      { x: 58, y: 16, height: 14, side: 'right' },
    ],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 22, y: 8 },
      { x: 35, y: 15 },
      { x: 53, y: 20 },
    ],
    checkpoints: [{ x: 34, y: 14 }],
  });

  list.push({
    id: 12,
    world: 2,
    title: 'The Climb',
    lesson: 'World 2 Timed Vertical Challenge',
    instruction: 'Pure verticality under the clock. Rapid wall-kick rhythms are essential.',
    storyLog: 'SYS_LOG_12: Perimeter security scan inbound. Clear the concrete maze before lockdown.',
    bronzeTime: 40,
    silverTime: 29,
    goldTime: 20.8,
    theme: 'concrete',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 65, y: 34, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 16, height: 4, type: 'solid' },
      { x: 20, y: 10, width: 8, height: 2, type: 'solid' },
      { x: 40, y: 20, width: 8, height: 2, type: 'solid' },
      { x: 58, y: 32, width: 18, height: 4, type: 'solid' },
    ],
    walls: [
      { x: 12, y: 2, height: 12, side: 'left' },
      { x: 22, y: 12, height: 12, side: 'right' },
      { x: 34, y: 12, height: 12, side: 'left' },
      { x: 46, y: 22, height: 14, side: 'right' },
      { x: 54, y: 22, height: 14, side: 'left' },
    ],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 16, y: 6 },
      { x: 28, y: 16 },
      { x: 50, y: 27 },
    ],
    checkpoints: [{ x: 22, y: 12 }, { x: 42, y: 22 }],
  });

  // World 3: The Industrial Zone (Levels 13 to 18)
  list.push({
    id: 13,
    world: 3,
    title: 'Factory Floor',
    lesson: 'Moving Platforms',
    instruction: 'Time your jumps onto moving hydraulic platforms. Carry platform momentum when leaping off!',
    storyLog: 'SYS_LOG_13: Industrial foundry detected. Heavy molten iron vats operating below.',
    bronzeTime: 32,
    silverTime: 24,
    goldTime: 17.0,
    theme: 'industrial',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 100, y: 8, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 18, height: 4, type: 'solid' },
      { x: 92, y: 6, width: 18, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [
      { x: 26, y: 2, width: 8, height: 2, rangeX: 6, rangeY: 0, speed: 2 },
      { x: 48, y: 4, width: 8, height: 2, rangeX: 0, rangeY: 4, speed: 2.2 },
      { x: 70, y: 5, width: 8, height: 2, rangeX: 8, rangeY: 0, speed: 2.5 },
    ],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 28, y: 5 },
      { x: 48, y: 9 },
      { x: 74, y: 8 },
    ],
    checkpoints: [{ x: 48, y: 5 }],
  });

  list.push({
    id: 14,
    world: 3,
    title: 'Conveyor Chaos',
    lesson: 'Momentum on Conveyor Belts',
    instruction: 'Running with the conveyor supercharges your speed! Running against it requires sprint power.',
    storyLog: 'SYS_LOG_14: High-speed assembly line active. Speed sensors reporting record throughput.',
    bronzeTime: 30,
    silverTime: 22,
    goldTime: 15.5,
    theme: 'industrial',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 110, y: 6, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 18, height: 4, type: 'solid' },
      { x: 24, y: 0, width: 24, height: 3, type: 'conveyor', conveyorSpeed: 7 },
      { x: 54, y: 2, width: 22, height: 3, type: 'conveyor', conveyorSpeed: -6 },
      { x: 82, y: 3, width: 20, height: 3, type: 'conveyor', conveyorSpeed: 9 },
      { x: 104, y: 4, width: 16, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 36, y: 5 },
      { x: 65, y: 6 },
      { x: 92, y: 7 },
    ],
    checkpoints: [{ x: 50, y: 4 }, { x: 80, y: 5 }],
  });

  list.push({
    id: 15,
    world: 3,
    title: 'Crane Runner',
    lesson: 'Jumping Between Huge Cranes',
    instruction: 'Long leaps between swinging construction cranes high above the smelter.',
    storyLog: 'SYS_LOG_15: Automated crane network hauling cargo pods. Beware the gaps.',
    bronzeTime: 35,
    silverTime: 26,
    goldTime: 18.2,
    theme: 'industrial',
    startPos: { x: 0, y: 8 },
    goalPos: { x: 115, y: 12, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 6, width: 16, height: 4, type: 'solid' },
      { x: 108, y: 10, width: 18, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [
      { x: 26, y: 7, width: 12, height: 2, rangeX: 5, rangeY: 3, speed: 1.8 },
      { x: 52, y: 8, width: 12, height: 2, rangeX: -6, rangeY: 2, speed: 2.1 },
      { x: 80, y: 9, width: 12, height: 2, rangeX: 6, rangeY: -3, speed: 2.4 },
    ],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 30, y: 12 },
      { x: 58, y: 13 },
      { x: 86, y: 14 },
    ],
    checkpoints: [{ x: 54, y: 10 }],
  });

  list.push({
    id: 16,
    world: 3,
    title: 'Falling Floor',
    lesson: 'Route Planning on Collapsing Tiles',
    instruction: 'Red grating platforms collapse 0.7s after contact! Never hesitate—keep moving forward.',
    storyLog: 'SYS_LOG_16: Emergency thermal purge active. Floor support struts melting away.',
    bronzeTime: 32,
    silverTime: 23,
    goldTime: 16.2,
    theme: 'industrial',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 105, y: 7, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 16, height: 4, type: 'solid' },
      { x: 20, y: 1, width: 8, height: 2, type: 'falling', fallDelay: 0.7 },
      { x: 32, y: 2, width: 8, height: 2, type: 'falling', fallDelay: 0.7 },
      { x: 44, y: 3, width: 8, height: 2, type: 'falling', fallDelay: 0.7 },
      { x: 58, y: 3, width: 10, height: 3, type: 'solid' },
      { x: 72, y: 4, width: 8, height: 2, type: 'falling', fallDelay: 0.7 },
      { x: 84, y: 5, width: 8, height: 2, type: 'falling', fallDelay: 0.7 },
      { x: 98, y: 5, width: 16, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 24, y: 4 },
      { x: 46, y: 6 },
      { x: 86, y: 8 },
    ],
    checkpoints: [{ x: 60, y: 5 }],
  });

  list.push({
    id: 17,
    world: 3,
    title: 'The Machine',
    lesson: 'Timed Obstacles & Crushing Pistons',
    instruction: 'Observe the piston rhythms. Slide or sprint during the opening phase.',
    storyLog: 'SYS_LOG_17: Main reactor piston chamber. Hydraulic pressure at 120,000 PSI.',
    bronzeTime: 36,
    silverTime: 26,
    goldTime: 18.5,
    theme: 'industrial',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 110, y: 7, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 20, height: 4, type: 'solid' },
      { x: 26, y: 0, width: 20, height: 4, type: 'solid' },
      { x: 52, y: 1, width: 22, height: 4, type: 'solid' },
      { x: 80, y: 3, width: 20, height: 4, type: 'solid' },
      { x: 104, y: 5, width: 16, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [],
    hazards: [
      { x: 36, y: 4, width: 4, height: 6, type: 'piston', period: 2.2 },
      { x: 62, y: 5, width: 4, height: 6, type: 'piston', period: 1.8 },
      { x: 90, y: 7, width: 4, height: 6, type: 'piston', period: 2.0 },
    ],
    grapplePoints: [],
    dataFragments: [
      { x: 36, y: 2.5 },
      { x: 62, y: 3.5 },
      { x: 90, y: 5.5 },
    ],
    checkpoints: [{ x: 48, y: 2 }, { x: 76, y: 3 }],
  });

  list.push({
    id: 18,
    world: 3,
    title: 'Industrial Gauntlet',
    lesson: 'World 3 Combined Industrial Mastery',
    instruction: 'Conveyors, moving cranes, falling floors, and pistons all tested in unison.',
    storyLog: 'SYS_LOG_18: Industrial sector core override complete. Transit tram to Neon City ready.',
    bronzeTime: 46,
    silverTime: 34,
    goldTime: 24.5,
    theme: 'industrial',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 135, y: 14, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 16, height: 4, type: 'solid' },
      { x: 20, y: 0, width: 20, height: 3, type: 'conveyor', conveyorSpeed: 8 },
      { x: 58, y: 5, width: 8, height: 2, type: 'falling', fallDelay: 0.7 },
      { x: 70, y: 7, width: 14, height: 4, type: 'solid' },
      { x: 126, y: 12, width: 20, height: 4, type: 'solid' },
    ],
    walls: [
      { x: 74, y: 9, height: 10, side: 'left' },
    ],
    movingPlatforms: [
      { x: 44, y: 3, width: 8, height: 2, rangeX: 4, rangeY: 2, speed: 2 },
      { x: 94, y: 9, width: 8, height: 2, rangeX: 6, rangeY: 3, speed: 2.3 },
      { x: 110, y: 11, width: 8, height: 2, rangeX: 0, rangeY: 4, speed: 2.5 },
    ],
    hazards: [
      { x: 72, y: 9, width: 3, height: 5, type: 'piston', period: 2.0 },
    ],
    grapplePoints: [],
    dataFragments: [
      { x: 30, y: 4 },
      { x: 62, y: 8 },
      { x: 110, y: 15 },
    ],
    checkpoints: [{ x: 40, y: 2 }, { x: 72, y: 9 }],
  });

  // World 4: The Neon City (Levels 19 to 24)
  list.push({
    id: 19,
    world: 4,
    title: 'Neon Rush',
    lesson: 'Mid-Air Dash (NEW ABILITY)',
    instruction: 'Press E / J / Dash in mid-air to blast forward with an impulse of kinetic thrust!',
    storyLog: 'SYS_LOG_19: Neural Dash module calibrated. Air-burst thrusters online.',
    bronzeTime: 28,
    silverTime: 20,
    goldTime: 14.5,
    theme: 'neon',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 105, y: 6, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 16, height: 4, type: 'solid' },
      { x: 30, y: 1, width: 10, height: 4, type: 'solid' }, // gap of 14 requires dash
      { x: 55, y: 2, width: 10, height: 4, type: 'solid' },
      { x: 80, y: 3, width: 10, height: 4, type: 'solid' },
      { x: 98, y: 4, width: 18, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [],
    dataFragments: [
      { x: 22, y: 4 }, // in middle of dash gap
      { x: 47, y: 5 },
      { x: 72, y: 6 },
    ],
    checkpoints: [{ x: 32, y: 3 }, { x: 57, y: 4 }],
  });

  list.push({
    id: 20,
    world: 4,
    title: 'Grapple Point',
    lesson: 'Grapple Swing & Release (NEW ABILITY)',
    instruction: 'Hold Q / K / Grapple when near glowing anchor points to tether, swing, and release with massive momentum!',
    storyLog: 'SYS_LOG_20: Hard-light grapple filament bonded to exoskeleton. Neon anchors mapped.',
    bronzeTime: 32,
    silverTime: 23,
    goldTime: 16.0,
    theme: 'neon',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 110, y: 8, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 16, height: 4, type: 'solid' },
      { x: 50, y: 2, width: 14, height: 4, type: 'solid' },
      { x: 100, y: 6, width: 18, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [
      { x: 32, y: 12, id: 'g1' },
      { x: 78, y: 14, id: 'g2' },
    ],
    dataFragments: [
      { x: 32, y: 6 }, // under grapple swing arc
      { x: 56, y: 5 },
      { x: 78, y: 8 },
    ],
    checkpoints: [{ x: 52, y: 4 }],
  });

  list.push({
    id: 21,
    world: 4,
    title: 'Traffic',
    lesson: 'Parkour Across Moving Vehicles',
    instruction: 'Leap across hover-trucks and mag-lev freight pods moving at high speeds through traffic lanes.',
    storyLog: 'SYS_LOG_21: Skyway 99 automated freight corridor. Warning: Unregulated transit speeds.',
    bronzeTime: 35,
    silverTime: 25,
    goldTime: 17.5,
    theme: 'neon',
    startPos: { x: 0, y: 5 },
    goalPos: { x: 120, y: 8, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 2, width: 16, height: 4, type: 'solid' },
      { x: 112, y: 6, width: 18, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [
      { x: 24, y: 3, width: 10, height: 2, rangeX: 12, rangeY: 0, speed: 3.5 },
      { x: 52, y: 4, width: 10, height: 2, rangeX: -12, rangeY: 0, speed: 4.0 },
      { x: 80, y: 5, width: 10, height: 2, rangeX: 14, rangeY: 0, speed: 3.8 },
    ],
    hazards: [],
    grapplePoints: [{ x: 68, y: 14, id: 'g3' }],
    dataFragments: [
      { x: 30, y: 7 },
      { x: 68, y: 8 },
      { x: 92, y: 8.5 },
    ],
    checkpoints: [{ x: 50, y: 6 }],
  });

  list.push({
    id: 22,
    world: 4,
    title: 'The Chase',
    lesson: 'Autonomous Drone Pursuit',
    instruction: 'An automated security drone pursues you from behind! You cannot stop—maintain flow or get captured.',
    storyLog: 'SYS_LOG_22: APEX HUNTER DRONE DEPLOYED. LETHAL OVERRIDE GRANTED. RUN.',
    bronzeTime: 30,
    silverTime: 23,
    goldTime: 16.8,
    theme: 'neon',
    droneChase: true,
    startPos: { x: 0, y: 3 },
    goalPos: { x: 125, y: 8, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 20, height: 4, type: 'solid' },
      { x: 26, y: 1, width: 16, height: 4, type: 'solid' },
      { x: 34, y: 3.2, width: 4, height: 1.2, type: 'barrier_low' },
      { x: 48, y: 2, width: 14, height: 4, type: 'solid' },
      { x: 68, y: 4, width: 16, height: 4, type: 'solid' },
      { x: 90, y: 5, width: 18, height: 4, type: 'solid' },
      { x: 114, y: 6, width: 18, height: 4, type: 'solid' },
    ],
    walls: [
      { x: 50, y: 4, height: 8, side: 'left' },
      { x: 92, y: 7, height: 8, side: 'left' },
    ],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [{ x: 80, y: 14, id: 'g4' }],
    dataFragments: [
      { x: 36, y: 2.2 },
      { x: 80, y: 8 },
      { x: 104, y: 8 },
    ],
    checkpoints: [{ x: 48, y: 4 }, { x: 90, y: 7 }],
  });

  list.push({
    id: 23,
    world: 4,
    title: 'No Ground',
    lesson: 'Entire Airborne Section',
    instruction: 'No platforms underneath! Combine wall-runs, dashes, and grapple chains to fly across the skyline.',
    storyLog: 'SYS_LOG_23: Complete street level lockdown. High-voltage power conduits open in gap.',
    bronzeTime: 34,
    silverTime: 25,
    goldTime: 17.8,
    theme: 'neon',
    startPos: { x: 0, y: 5 },
    goalPos: { x: 120, y: 8, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 2, width: 14, height: 4, type: 'solid' },
      { x: 112, y: 6, width: 16, height: 4, type: 'solid' },
    ],
    walls: [
      { x: 26, y: 3, height: 12, side: 'left' },
      { x: 74, y: 4, height: 12, side: 'left' },
    ],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [
      { x: 50, y: 14, id: 'g5' },
      { x: 96, y: 15, id: 'g6' },
    ],
    dataFragments: [
      { x: 30, y: 8 },
      { x: 50, y: 7 },
      { x: 96, y: 8 },
    ],
    checkpoints: [{ x: 30, y: 7 }],
  });

  list.push({
    id: 24,
    world: 4,
    title: 'Neon Nightmare',
    lesson: 'World 4 Advanced Combo Mastery',
    instruction: 'Wall-run + Dash + Grapple + Slide + Moving vehicles in one seamless sequence.',
    storyLog: 'SYS_LOG_24: You have cleared the neon underbelly. The Ascension Spire stands directly ahead.',
    bronzeTime: 44,
    silverTime: 33,
    goldTime: 23.2,
    theme: 'neon',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 145, y: 16, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 16, height: 4, type: 'solid' },
      { x: 44, y: 4, width: 14, height: 4, type: 'solid' },
      { x: 50, y: 6.2, width: 4, height: 1.2, type: 'barrier_low' },
      { x: 135, y: 14, width: 18, height: 4, type: 'solid' },
    ],
    walls: [
      { x: 22, y: 2, height: 10, side: 'left' },
      { x: 88, y: 8, height: 12, side: 'left' },
    ],
    movingPlatforms: [
      { x: 66, y: 6, width: 8, height: 2, rangeX: 8, rangeY: 0, speed: 3 },
      { x: 116, y: 11, width: 8, height: 2, rangeX: 0, rangeY: 4, speed: 2.8 },
    ],
    hazards: [],
    grapplePoints: [
      { x: 36, y: 13, id: 'g7' },
      { x: 104, y: 18, id: 'g8' },
    ],
    dataFragments: [
      { x: 26, y: 6 },
      { x: 70, y: 9 },
      { x: 104, y: 11 },
    ],
    checkpoints: [{ x: 46, y: 6 }, { x: 92, y: 10 }],
  });

  // World 5: The Ascension (Levels 25 to 30)
  list.push({
    id: 25,
    world: 5,
    title: 'The Tower',
    lesson: 'Pure Vertical Skyscraper Climb',
    instruction: 'Scale the exterior of the titan spire. Extreme altitude—one slip means a long drop.',
    storyLog: 'SYS_LOG_25: Base altitude 800m. Ascension Spire exterior maintenance protocols engaged.',
    bronzeTime: 42,
    silverTime: 31,
    goldTime: 22.0,
    theme: 'ascension',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 55, y: 48, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 16, height: 4, type: 'solid' },
      { x: 20, y: 14, width: 8, height: 2, type: 'solid' },
      { x: 40, y: 28, width: 8, height: 2, type: 'solid' },
      { x: 48, y: 46, width: 16, height: 4, type: 'solid' },
    ],
    walls: [
      { x: 10, y: 2, height: 16, side: 'left' },
      { x: 18, y: 16, height: 16, side: 'right' },
      { x: 32, y: 16, height: 16, side: 'left' },
      { x: 38, y: 30, height: 18, side: 'right' },
      { x: 46, y: 30, height: 18, side: 'left' },
    ],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [
      { x: 25, y: 24, id: 'g9' },
      { x: 44, y: 42, id: 'g10' },
    ],
    dataFragments: [
      { x: 14, y: 8 },
      { x: 25, y: 18 },
      { x: 42, y: 36 },
    ],
    checkpoints: [{ x: 22, y: 16 }, { x: 42, y: 30 }],
  });

  list.push({
    id: 26,
    world: 5,
    title: 'Gravity Shift',
    lesson: 'Anti-Gravity Kinetic Chambers',
    instruction: 'Sections feature altered gravity coils. High jumps float higher and fall speeds are tempered.',
    storyLog: 'SYS_LOG_26: Spire graviton reactor oscillating. Mass dampers experiencing phase inversion.',
    bronzeTime: 38,
    silverTime: 28,
    goldTime: 19.5,
    theme: 'ascension',
    gravityShift: true,
    startPos: { x: 0, y: 3 },
    goalPos: { x: 110, y: 18, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 16, height: 4, type: 'solid' },
      { x: 26, y: 5, width: 8, height: 2, type: 'solid' },
      { x: 48, y: 10, width: 8, height: 2, type: 'solid' },
      { x: 72, y: 14, width: 10, height: 2, type: 'solid' },
      { x: 102, y: 16, width: 18, height: 4, type: 'solid' },
    ],
    walls: [
      { x: 36, y: 6, height: 10, side: 'left' },
      { x: 60, y: 11, height: 10, side: 'left' },
    ],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [{ x: 88, y: 22, id: 'g11' }],
    dataFragments: [
      { x: 30, y: 9 },
      { x: 55, y: 14 },
      { x: 88, y: 16 },
    ],
    checkpoints: [{ x: 50, y: 12 }],
  });

  list.push({
    id: 27,
    world: 5,
    title: 'The Falling City',
    lesson: 'Catastrophic Structural Collapse',
    instruction: 'Platforms crumble right behind you. Maintain maximum sprint and roll cleanly off high falls.',
    storyLog: 'SYS_LOG_27: Outer framework disintegrating. Ascend to sky deck immediately!',
    bronzeTime: 36,
    silverTime: 27,
    goldTime: 18.8,
    theme: 'ascension',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 125, y: 12, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 14, height: 4, type: 'solid' },
      { x: 18, y: 1, width: 6, height: 2, type: 'falling', fallDelay: 0.5 },
      { x: 28, y: 3, width: 6, height: 2, type: 'falling', fallDelay: 0.5 },
      { x: 38, y: 5, width: 6, height: 2, type: 'falling', fallDelay: 0.5 },
      { x: 50, y: 6, width: 10, height: 3, type: 'solid' },
      { x: 64, y: 7, width: 6, height: 2, type: 'falling', fallDelay: 0.5 },
      { x: 74, y: 9, width: 6, height: 2, type: 'falling', fallDelay: 0.5 },
      { x: 86, y: 10, width: 6, height: 2, type: 'falling', fallDelay: 0.5 },
      { x: 98, y: 11, width: 8, height: 2, type: 'falling', fallDelay: 0.5 },
      { x: 114, y: 10, width: 18, height: 4, type: 'solid' },
    ],
    walls: [],
    movingPlatforms: [],
    hazards: [],
    grapplePoints: [{ x: 106, y: 19, id: 'g12' }],
    dataFragments: [
      { x: 30, y: 6 },
      { x: 76, y: 12 },
      { x: 106, y: 13 },
    ],
    checkpoints: [{ x: 52, y: 8 }],
  });

  list.push({
    id: 28,
    world: 5,
    title: 'The Impossible Route',
    lesson: 'Multiple Branching Paths',
    instruction: 'Choose your line: Lower safe path, mid technical route, or high-risk sky shortcut for Gold!',
    storyLog: 'SYS_LOG_28: Multiple structural corridors mapped. Risk-to-reward optimization calculated.',
    bronzeTime: 40,
    silverTime: 29,
    goldTime: 20.2,
    theme: 'ascension',
    startPos: { x: 0, y: 5 },
    goalPos: { x: 130, y: 10, width: 3.5, height: 4.5 },
    platforms: [
      // Starting hub
      { x: 0, y: 2, width: 16, height: 4, type: 'solid' },
      // Lower route (longer, safe)
      { x: 22, y: 0, width: 22, height: 3, type: 'solid' },
      { x: 50, y: 1, width: 22, height: 3, type: 'solid' },
      { x: 78, y: 2, width: 22, height: 3, type: 'solid' },
      // Mid technical route
      { x: 24, y: 6, width: 8, height: 2, type: 'solid' },
      { x: 42, y: 7, width: 8, height: 2, type: 'solid' },
      { x: 62, y: 8, width: 8, height: 2, type: 'solid' },
      // Final platform
      { x: 118, y: 8, width: 20, height: 4, type: 'solid' },
    ],
    walls: [
      // High shortcut walls
      { x: 34, y: 9, height: 10, side: 'left' },
      { x: 76, y: 11, height: 10, side: 'left' },
    ],
    movingPlatforms: [
      { x: 92, y: 9, width: 8, height: 2, rangeX: 6, rangeY: 0, speed: 2.5 },
    ],
    hazards: [],
    grapplePoints: [
      // High sky shortcut anchor
      { x: 55, y: 18, id: 'g13' },
      { x: 104, y: 18, id: 'g14' },
    ],
    dataFragments: [
      { x: 50, y: 3 }, // low path
      { x: 55, y: 11 }, // mid path
      { x: 55, y: 14 }, // high sky route
    ],
    checkpoints: [{ x: 50, y: 3 }, { x: 64, y: 9 }],
  });

  list.push({
    id: 29,
    world: 5,
    title: 'Master Trial',
    lesson: 'Brutal But Fair Parkour Synthesis',
    instruction: 'No new mechanics. Every single lesson tested back to back. Prove your mastery.',
    storyLog: 'SYS_LOG_29: Final safety protocols decommissioned. You stand before the apex sky gate.',
    bronzeTime: 50,
    silverTime: 38,
    goldTime: 26.5,
    theme: 'ascension',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 155, y: 22, width: 3.5, height: 4.5 },
    platforms: [
      { x: 0, y: 0, width: 16, height: 4, type: 'solid' },
      { x: 22, y: 1, width: 14, height: 3, type: 'conveyor', conveyorSpeed: 7 },
      { x: 42, y: 3, width: 4, height: 1.2, type: 'barrier_low' },
      { x: 54, y: 5, width: 6, height: 2, type: 'falling', fallDelay: 0.6 },
      { x: 92, y: 12, width: 12, height: 3, type: 'solid' },
      { x: 144, y: 20, width: 20, height: 4, type: 'solid' },
    ],
    walls: [
      { x: 68, y: 6, height: 12, side: 'left' },
      { x: 108, y: 14, height: 12, side: 'left' },
    ],
    movingPlatforms: [
      { x: 78, y: 9, width: 8, height: 2, rangeX: 0, rangeY: 4, speed: 2.8 },
      { x: 126, y: 17, width: 8, height: 2, rangeX: 6, rangeY: 2, speed: 3.0 },
    ],
    hazards: [
      { x: 96, y: 14, width: 3, height: 5, type: 'piston', period: 1.9 },
    ],
    grapplePoints: [
      { x: 86, y: 20, id: 'g15' },
      { x: 138, y: 26, id: 'g16' },
    ],
    dataFragments: [
      { x: 42, y: 2.2 },
      { x: 86, y: 13 },
      { x: 138, y: 19 },
    ],
    checkpoints: [{ x: 46, y: 5 }, { x: 94, y: 14 }],
  });

  list.push({
    id: 30,
    world: 5,
    title: 'THE ASCENSION',
    lesson: 'Sunrise Beyond The Storm',
    instruction: 'Sunrise to Nightstorm to Sky. The full horizon of the city below. Reach the summit.',
    storyLog: 'SYS_LOG_30: "The city was never a cage. It was a training ground. Look out at the sky. YOU MADE IT."',
    bronzeTime: 55,
    silverTime: 42,
    goldTime: 29.8,
    theme: 'ascension',
    startPos: { x: 0, y: 3 },
    goalPos: { x: 170, y: 32, width: 4.5, height: 5.5 },
    platforms: [
      { x: 0, y: 0, width: 18, height: 4, type: 'solid' },
      { x: 26, y: 2, width: 12, height: 3, type: 'conveyor', conveyorSpeed: 8 },
      { x: 44, y: 5, width: 8, height: 2, type: 'solid' },
      { x: 74, y: 12, width: 12, height: 3, type: 'solid' },
      { x: 114, y: 20, width: 14, height: 3, type: 'solid' },
      { x: 160, y: 30, width: 26, height: 4, type: 'solid' },
    ],
    walls: [
      { x: 56, y: 6, height: 14, side: 'left' },
      { x: 92, y: 14, height: 14, side: 'left' },
      { x: 134, y: 22, height: 14, side: 'left' },
    ],
    movingPlatforms: [
      { x: 62, y: 8, width: 8, height: 2, rangeX: 5, rangeY: 2, speed: 2.5 },
      { x: 102, y: 16, width: 8, height: 2, rangeX: 0, rangeY: 4, speed: 2.8 },
      { x: 146, y: 25, width: 8, height: 2, rangeX: 6, rangeY: 3, speed: 3.2 },
    ],
    hazards: [],
    grapplePoints: [
      { x: 68, y: 18, id: 'g17' },
      { x: 108, y: 26, id: 'g18' },
      { x: 152, y: 35, id: 'g19' },
    ],
    dataFragments: [
      { x: 50, y: 7 },
      { x: 108, y: 19 },
      { x: 152, y: 28 },
    ],
    checkpoints: [{ x: 46, y: 7 }, { x: 76, y: 14 }, { x: 116, y: 22 }],
  });

  return list;
}

export const ALL_LEVELS = createLevels();

export function getLevelById(id: number): LevelConfig {
  return ALL_LEVELS.find((l) => l.id === id) || ALL_LEVELS[0];
}
