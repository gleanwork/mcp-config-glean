import { describe, it, expect } from 'vitest';
import {
  createGleanRegistry,
  createGleanEnv,
  createGleanHeaders,
  buildGleanServerUrl,
} from '../../src/index.js';

/**
 * Goose: commandBuilder client (no native CLI)
 * Uses GLEAN_REGISTRY_OPTIONS.commandBuilder for CLI commands
 * Uses { extensions: {...} } format instead of { mcpServers: {...} }
 */
describe('Client: goose', () => {
  const registry = createGleanRegistry();
  const builder = registry.createBuilder('goose');

  describe('buildConfiguration', () => {
    describe('stdio transport', () => {
      it('with token auth', () => {
        const config = builder.buildConfiguration({
          transport: 'stdio',
          env: createGleanEnv('my-company', 'my-api-token'),
        });

        // Goose uses 'extensions' instead of 'mcpServers'
        expect(config).toHaveProperty('extensions');
        const extensions = config.extensions;
        const serverConfig = extensions[Object.keys(extensions)[0]] as Record<string, unknown>;
        expect(serverConfig.cmd).toBe('npx');
        expect(serverConfig.type).toBe('stdio');
      });

      it('with OAuth (instance only, no token)', () => {
        const config = builder.buildConfiguration({
          transport: 'stdio',
          env: createGleanEnv('my-company'),
        });

        expect(config).toHaveProperty('extensions');
      });
    });

    describe('http transport', () => {
      it('with token auth', () => {
        const config = builder.buildConfiguration({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
          headers: createGleanHeaders('my-api-token'),
        });

        expect(config).toHaveProperty('extensions');
        const extensions = config.extensions;
        const serverConfig = extensions[Object.keys(extensions)[0]] as Record<string, unknown>;
        expect(serverConfig.uri).toBe('https://my-company-be.glean.com/mcp/default');
        expect(serverConfig.type).toBe('streamable_http');
      });

      it('with OAuth (URL only, no token)', () => {
        const config = builder.buildConfiguration({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
        });

        expect(config).toHaveProperty('extensions');
      });
    });
  });

  describe('buildCommand (via commandBuilder)', () => {
    describe('stdio transport', () => {
      it('returns command with env flags', () => {
        const command = builder.buildCommand({
          transport: 'stdio',
          env: createGleanEnv('my-company', 'my-api-token'),
        });

        expect(command).not.toBeNull();
        expect(command).toContain('npx -y @gleanwork/configure-mcp-server local');
        expect(command).toContain('--client goose');
      });
    });

    describe('http transport', () => {
      it('with token includes --token flag', () => {
        const command = builder.buildCommand({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
          headers: createGleanHeaders('my-api-token'),
        });

        expect(command).not.toBeNull();
        expect(command).toContain('--token my-api-token');
      });

      it('with OAuth (no token) returns command without --token flag', () => {
        const command = builder.buildCommand({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
        });

        expect(command).not.toBeNull();
        expect(command).not.toContain('--token');
      });
    });
  });

  describe('supportsCliInstallation', () => {
    it('returns supported with command_builder reason', () => {
      const status = builder.supportsCliInstallation();
      expect(status.supported).toBe(true);
      expect(status.reason).toBe('command_builder');
    });
  });
});
