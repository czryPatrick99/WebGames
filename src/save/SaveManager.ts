export interface LevelRecord {
  completed: boolean;
  bestTime: number; // in seconds
  stars: number; // 0 to 3 (Bronze = 1, Silver = 2, Gold = 3)
  fragmentsCollected: [boolean, boolean, boolean];
  deaths: number;
  bestFlow: number; // 0 to 100
  shortcutsDiscovered: number;
}

export interface GhostFrame {
  t: number;
  x: number;
  y: number;
  z: number;
  action: string;
  facing: number;
}

export interface PlayerCustomization {
  skin: string;
  trail: string;
  visorColor: string;
}

export interface GameSaveData {
  records: Record<number, LevelRecord>;
  ghosts: Record<number, GhostFrame[]>;
  unlockedLevel: number;
  totalScore: number;
  customization: PlayerCustomization;
  unlockedSkins: string[];
  unlockedTrails: string[];
  prestigeBadges: string[];
  settings: {
    soundVolume: number;
    musicVolume: number;
    showGhost: boolean;
    autoSprint: boolean;
    screenShake: boolean;
  };
}

const STORAGE_KEY = 'neon_ascent_save_v1';

export const SKINS = [
  { id: 'neon-cyan', name: 'Cyber Blue', color: '#06b6d4', glow: '#22d3ee', req: 'Default' },
  { id: 'cyber-pink', name: 'Synthwave Magenta', color: '#ec4899', glow: '#f472b6', req: 'Collect 10 Data Fragments' },
  { id: 'solar-gold', name: 'Solaris Gold', color: '#eab308', glow: '#fde047', req: 'Earn 25 Gold Stars' },
  { id: 'toxic-emerald', name: 'Toxic Emerald', color: '#10b981', glow: '#34d399', req: 'Complete World 2' },
  { id: 'stealth-carbon', name: 'Stealth Carbon', color: '#475569', glow: '#94a3b8', req: 'Complete World 4' },
  { id: 'ghost-monochrome', name: 'Phantom Mirage', color: '#e0e7ff', glow: '#ffffff', req: 'Finish Level 30' },
];

export const TRAILS = [
  { id: 'electric', name: 'Volt Arc', color: '#06b6d4', req: 'Default' },
  { id: 'fire', name: 'Neon Flame', color: '#f97316', req: 'Earn 15 Stars' },
  { id: 'void', name: 'Void Pulse', color: '#a855f7', req: 'Complete World 3' },
  { id: 'matrix', name: 'Digital Grid', color: '#22c55e', req: 'Collect 30 Data Fragments' },
  { id: 'stardust', name: 'Prismatic Flux', color: '#f43f5e', req: 'Master Level 30' },
];

class SaveManager {
  private data: GameSaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): GameSaveData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          records: parsed.records || {},
          ghosts: parsed.ghosts || {},
          unlockedLevel: parsed.unlockedLevel || 1,
          totalScore: parsed.totalScore || 0,
          customization: parsed.customization || {
            skin: 'neon-cyan',
            trail: 'electric',
            visorColor: '#00f0ff',
          },
          unlockedSkins: parsed.unlockedSkins || ['neon-cyan'],
          unlockedTrails: parsed.unlockedTrails || ['electric'],
          prestigeBadges: parsed.prestigeBadges || [],
          settings: {
            soundVolume: 0.8,
            musicVolume: 0.6,
            showGhost: true,
            autoSprint: false,
            screenShake: true,
            ...(parsed.settings || {}),
          },
        };
      }
    } catch {
      // Fallback
    }

    return {
      records: {},
      ghosts: {},
      unlockedLevel: 1,
      totalScore: 0,
      customization: {
        skin: 'neon-cyan',
        trail: 'electric',
        visorColor: '#00f0ff',
      },
      unlockedSkins: ['neon-cyan'],
      unlockedTrails: ['electric'],
      prestigeBadges: [],
      settings: {
        soundVolume: 0.8,
        musicVolume: 0.6,
        showGhost: true,
        autoSprint: false,
        screenShake: true,
      },
    };
  }

  public save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Ignore quota errors
    }
  }

  public getData(): GameSaveData {
    return this.data;
  }

  public getRecord(levelId: number): LevelRecord | undefined {
    return this.data.records[levelId];
  }

  public saveRun(
    levelId: number,
    time: number,
    stars: number,
    fragments: [boolean, boolean, boolean],
    deaths: number,
    flow: number,
    shortcuts: number,
    score: number,
    ghost?: GhostFrame[]
  ): { isNewBest: boolean; starsEarned: number } {
    const existing = this.data.records[levelId];
    const isNewBest = !existing || time < existing.bestTime;

    const combinedFragments: [boolean, boolean, boolean] = existing
      ? [
          existing.fragmentsCollected[0] || fragments[0],
          existing.fragmentsCollected[1] || fragments[1],
          existing.fragmentsCollected[2] || fragments[2],
        ]
      : fragments;

    const finalStars = existing ? Math.max(existing.stars, stars) : stars;

    this.data.records[levelId] = {
      completed: true,
      bestTime: isNewBest ? time : existing.bestTime,
      stars: finalStars,
      fragmentsCollected: combinedFragments,
      deaths: existing ? Math.min(existing.deaths, deaths) : deaths,
      bestFlow: existing ? Math.max(existing.bestFlow, flow) : flow,
      shortcutsDiscovered: existing
        ? Math.max(existing.shortcutsDiscovered, shortcuts)
        : shortcuts,
    };

    if (ghost && isNewBest) {
      this.data.ghosts[levelId] = ghost;
    }

    this.data.totalScore += score;
    if (levelId >= this.data.unlockedLevel && levelId < 30) {
      this.data.unlockedLevel = levelId + 1;
    }

    this.checkUnlockables();
    this.save();

    return { isNewBest, starsEarned: finalStars };
  }

  public getGhost(levelId: number): GhostFrame[] | undefined {
    return this.data.ghosts[levelId];
  }

  public getTotalStars(): number {
    return Object.values(this.data.records).reduce((acc, r) => acc + (r.stars || 0), 0);
  }

  public getTotalFragments(): number {
    return Object.values(this.data.records).reduce(
      (acc, r) => acc + r.fragmentsCollected.filter(Boolean).length,
      0
    );
  }

  public isLevelUnlocked(levelId: number): boolean {
    return levelId <= this.data.unlockedLevel;
  }

  public unlockAllDev(): void {
    this.data.unlockedLevel = 30;
    this.data.unlockedSkins = SKINS.map((s) => s.id);
    this.data.unlockedTrails = TRAILS.map((t) => t.id);
    this.save();
  }

  public setCustomization(custom: Partial<PlayerCustomization>): void {
    this.data.customization = { ...this.data.customization, ...custom };
    this.save();
  }

  public setSettings(settings: Partial<GameSaveData['settings']>): void {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
  }

  private checkUnlockables(): void {
    const totalFragments = this.getTotalFragments();
    const goldStars = Object.values(this.data.records).filter((r) => r.stars === 3).length;
    const completedLvs = Object.keys(this.data.records).map(Number);

    if (totalFragments >= 10 && !this.data.unlockedSkins.includes('cyber-pink')) {
      this.data.unlockedSkins.push('cyber-pink');
    }
    if (goldStars >= 25 && !this.data.unlockedSkins.includes('solar-gold')) {
      this.data.unlockedSkins.push('solar-gold');
    }
    if (completedLvs.includes(12) && !this.data.unlockedSkins.includes('toxic-emerald')) {
      this.data.unlockedSkins.push('toxic-emerald');
    }
    if (completedLvs.includes(24) && !this.data.unlockedSkins.includes('stealth-carbon')) {
      this.data.unlockedSkins.push('stealth-carbon');
    }
    if (completedLvs.includes(30) && !this.data.unlockedSkins.includes('ghost-monochrome')) {
      this.data.unlockedSkins.push('ghost-monochrome');
    }

    if (this.getTotalStars() >= 15 && !this.data.unlockedTrails.includes('fire')) {
      this.data.unlockedTrails.push('fire');
    }
    if (completedLvs.includes(18) && !this.data.unlockedTrails.includes('void')) {
      this.data.unlockedTrails.push('void');
    }
    if (totalFragments >= 30 && !this.data.unlockedTrails.includes('matrix')) {
      this.data.unlockedTrails.push('matrix');
    }
    if (completedLvs.includes(30) && !this.data.unlockedTrails.includes('stardust')) {
      this.data.unlockedTrails.push('stardust');
    }

    // Prestige Badges
    if (completedLvs.includes(30) && !this.data.prestigeBadges.includes('Ascended')) {
      this.data.prestigeBadges.push('Ascended');
    }
    if (goldStars === 30 && !this.data.prestigeBadges.includes('Golden Runner')) {
      this.data.prestigeBadges.push('Golden Runner');
    }
  }
}

export const saveManager = new SaveManager();
