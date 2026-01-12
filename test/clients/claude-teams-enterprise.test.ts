import { describe, it, expect } from 'vitest';
import { createGleanRegistry } from '../../src/index.js';

/**
 * Claude for Teams/Enterprise: centrally managed by admins
 * createBuilder() should throw an error - no local configuration support
 * MCP servers must be configured at the organization level
 */
describe('Client: claude-teams-enterprise (admin-managed only)', () => {
  const registry = createGleanRegistry();

  describe('createBuilder', () => {
    it('throws error because config is admin-managed', () => {
      expect(() => registry.createBuilder('claude-teams-enterprise')).toThrow(
        /Claude for Teams\/Enterprise/
      );
    });

    it('error message explains admin management requirement', () => {
      expect(() => registry.createBuilder('claude-teams-enterprise')).toThrow(
        /centrally managed by admins/
      );
    });
  });
});
