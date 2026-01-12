import { describe, it, expect } from 'vitest';
import { createGleanRegistry } from '../../src/index.js';

/**
 * ChatGPT: web-based client with no local config support
 * createBuilder() should throw an error - configuration must be done via web UI
 */
describe('Client: chatgpt (web-based only)', () => {
  const registry = createGleanRegistry();

  describe('createBuilder', () => {
    it('throws error because ChatGPT requires web UI configuration', () => {
      expect(() => registry.createBuilder('chatgpt')).toThrow(
        /ChatGPT is web-based/
      );
    });

    it('error message explains web UI requirement', () => {
      expect(() => registry.createBuilder('chatgpt')).toThrow(
        /configuring MCP servers through their web UI/
      );
    });
  });
});
