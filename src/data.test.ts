import { describe, it, expect } from 'vitest';
import { CHARACTERS, ACTS, MISSIONS, CHEATS, SCENES_CONFIG, GANGS } from './data';

describe('Vice City Vibe static data integrity', () => {
  it('should validate scene configs', () => {
    expect(SCENES_CONFIG.length).toBeGreaterThan(0);
    SCENES_CONFIG.forEach(scene => {
      expect(scene.id).toBeDefined();
      expect(scene.label).toBeDefined();
      expect(scene.icon).toBeDefined();
      expect(scene.bgImage).toBeDefined();
    });
  });

  it('should validate character dossiers', () => {
    expect(CHARACTERS.length).toBeGreaterThan(0);
    const charIds = new Set<string>();

    CHARACTERS.forEach(char => {
      expect(char.id).toBeDefined();
      expect(charIds.has(char.id)).toBe(false);
      charIds.add(char.id);

      expect(char.name).toBeDefined();
      expect(char.role).toBeDefined();
      expect(char.description).toBeDefined();
      expect(char.type).toBeDefined();

      if (char.relationships) {
        char.relationships.forEach(rel => {
          expect(rel.targetId).toBeDefined();
          expect(rel.type).toBeDefined();
          expect(rel.label).toBeDefined();

          // Validate targetId references an existing character
          const targetExists = CHARACTERS.some(c => c.id === rel.targetId);
          expect(targetExists).toBe(true);
        });
      }
    });
  });

  it('should validate storyline acts', () => {
    expect(ACTS.length).toBeGreaterThan(0);
    ACTS.forEach((act, idx) => {
      expect(act.id).toBe(idx + 1); // Sequential IDs starting at 1
      expect(act.title).toBeDefined();
      expect(act.description).toBeDefined();
    });
  });

  it('should validate mission guides', () => {
    expect(MISSIONS.length).toBeGreaterThan(0);
    MISSIONS.forEach(mission => {
      expect(mission.id).toBeDefined();
      expect(mission.number).toBeDefined();
      expect(mission.title).toBeDefined();
      expect(mission.giver).toBeDefined();
      expect(mission.description).toBeDefined();
      expect(mission.strategy).toBeDefined();
      expect(mission.tip).toBeDefined();
    });
  });

  it('should validate cheat sheets', () => {
    const categories = Object.keys(CHEATS);
    expect(categories.length).toBeGreaterThan(0);

    categories.forEach(category => {
      const cheats = CHEATS[category];
      expect(cheats.length).toBeGreaterThan(0);

      cheats.forEach(cheat => {
        expect(cheat.effect).toBeDefined();
        expect(cheat.pc).toBeDefined();
        expect(cheat.ps2).toBeDefined();
      });
    });
  });

  it('should validate gang territories', () => {
    expect(GANGS.length).toBeGreaterThan(0);
    GANGS.forEach(gang => {
      expect(gang.id).toBeDefined();
      expect(gang.name).toBeDefined();
      expect(gang.leader).toBeDefined();
      expect(gang.territory).toBeDefined();
      expect(gang.hexColor).toMatch(/^#[0-9a-fA-F]{6}$/); // hex color format
      expect(gang.territoryPath).toBeDefined();
    });
  });
});
