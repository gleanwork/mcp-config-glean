import { describe, it, expect } from 'vitest';
import {
  createGleanRegistry,
  createGleanEnv,
  createGleanHeaders,
  buildGleanServerUrl,
} from '../../src/index.js';

/**
 * Gemini: commandBuilder client
 *
 * NOTE: Gemini has a native `gemini mcp add` command, but mcp-config-schema
 * currently uses GenericConfigBuilder which doesn't support native CLI.
 * This is tracked as a mcp-config-schema issue.
 *
 * For now, Gemini uses GLEAN_REGISTRY_OPTIONS.commandBuilder for CLI commands.
 * Gemini uses httpUrl instead of url for HTTP transport.
 */
describe('Client: gemini', () => {
  const registry = createGleanRegistry();
  const builder = registry.createBuilder('gemini');

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
      });

      it('with OAuth (instance only, no token)', () => {
        const config = builder.buildConfiguration({
          transport: 'stdio',
          env: createGleanEnv('my-company'),
        });

        expect(config).toHaveProperty('mcpServers');
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
        // Gemini uses 'httpUrl' instead of 'url'
        expect(serverConfig.httpUrl).toBe('https://my-company-be.glean.com/mcp/default');
        expect(serverConfig.headers).toEqual({ Authorization: 'Bearer my-api-token' });
      });

      it('with OAuth (URL only, no token)', () => {
        const config = builder.buildConfiguration({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
        });

        expect(config).toHaveProperty('mcpServers');
        const servers = config.mcpServers;
        const serverConfig = servers[Object.keys(servers)[0]] as Record<string, unknown>;
        expect(serverConfig.httpUrl).toBe('https://my-company-be.glean.com/mcp/default');
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
        expect(command).toContain('--client gemini');
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
