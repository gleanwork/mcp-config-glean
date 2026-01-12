import { describe, it, expect } from 'vitest';
import {
  createGleanRegistry,
  createGleanEnv,
  createGleanHeaders,
  buildGleanServerUrl,
  GLEAN_ENV,
} from '../../src/index.js';

/**
 * Claude Code: native CLI client
 * Has native `claude mcp add` command - uses schema's native command generation
 * Our commandBuilder is NOT used for this client
 */
describe('Client: claude-code', () => {
  const registry = createGleanRegistry();
  const builder = registry.createBuilder('claude-code');

  describe('buildConfiguration', () => {
    describe('stdio transport', () => {
      it('with token auth', () => {
        const config = builder.buildConfiguration({
          transport: 'stdio',
          env: createGleanEnv('my-company', 'my-api-token'),
        });

        expect(config).toHaveProperty('mcpServers');
        const servers = config.mcpServers;
        const serverConfig = servers[Object.keys(servers)[0]] as Record<string, unknown>;
        expect(serverConfig.command).toBe('npx');
        expect(serverConfig.env).toEqual({
          [GLEAN_ENV.INSTANCE]: 'my-company',
          [GLEAN_ENV.API_TOKEN]: 'my-api-token',
        });
      });

      it('with OAuth (instance only, no token)', () => {
        const config = builder.buildConfiguration({
          transport: 'stdio',
          env: createGleanEnv('my-company'),
        });

        expect(config).toHaveProperty('mcpServers');
        const servers = config.mcpServers;
        const serverConfig = servers[Object.keys(servers)[0]] as Record<string, unknown>;
        expect(serverConfig.env).toEqual({
          [GLEAN_ENV.INSTANCE]: 'my-company',
        });
      });
    });

    describe('http transport', () => {
      it('with token auth', () => {
        const config = builder.buildConfiguration({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
          headers: createGleanHeaders('my-api-token'),
        });

        expect(config).toHaveProperty('mcpServers');
        const servers = config.mcpServers;
        const serverConfig = servers[Object.keys(servers)[0]] as Record<string, unknown>;
        expect(serverConfig.url).toBe('https://my-company-be.glean.com/mcp/default');
      });

      it('with OAuth (URL only, no token)', () => {
        const config = builder.buildConfiguration({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
        });

        expect(config).toHaveProperty('mcpServers');
      });
    });
  });

  describe('buildCommand (native CLI)', () => {
    describe('stdio transport', () => {
      it('returns native claude mcp add command', () => {
        const command = builder.buildCommand({
          transport: 'stdio',
          env: createGleanEnv('my-company', 'my-api-token'),
        });

        expect(command).not.toBeNull();
        // Native CLI uses 'claude mcp add' command
        expect(command).toContain('claude mcp add');
        expect(command).toContain('glean_local');
      });
    });

    describe('http transport', () => {
      it('returns native claude mcp add command with URL', () => {
        const command = builder.buildCommand({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
          headers: createGleanHeaders('my-api-token'),
        });

        expect(command).not.toBeNull();
        expect(command).toContain('claude mcp add');
        expect(command).toContain('https://my-company-be.glean.com/mcp/default');
      });
    });
  });

  describe('supportsCliInstallation', () => {
    it('returns supported with native_cli reason', () => {
      const status = builder.supportsCliInstallation();
      expect(status.supported).toBe(true);
      expect(status.reason).toBe('native_cli');
    });
  });
});
