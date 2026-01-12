import { describe, it, expect } from 'vitest';
import {
  createGleanRegistry,
  createGleanEnv,
  createGleanHeaders,
  buildGleanServerUrl,
  GLEAN_ENV,
} from '../../src/index.js';

/**
 * Claude Desktop: commandBuilder client (no native CLI)
 * Uses GLEAN_REGISTRY_OPTIONS.commandBuilder for CLI commands
 */
describe('Client: claude-desktop', () => {
  const registry = createGleanRegistry();
  const builder = registry.createBuilder('claude-desktop');

  describe('buildConfiguration', () => {
    describe('stdio transport', () => {
      it('with token auth', () => {
        const config = builder.buildConfiguration({
          transport: 'stdio',
          env: createGleanEnv('my-company', 'my-api-token'),
        });

        expect(config).toHaveProperty('mcpServers');
        const servers = config.mcpServers;
        const serverName = Object.keys(servers)[0];
        expect(serverName).toBe('glean_local');

        const serverConfig = servers[serverName] as Record<string, unknown>;
        expect(serverConfig.command).toBe('npx');
        expect(serverConfig.args).toContain('@gleanwork/local-mcp-server');
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

    describe('http transport (uses mcp-remote bridge)', () => {
      // Claude Desktop doesn't support HTTP natively - uses mcp-remote as a bridge
      it('with token auth', () => {
        const config = builder.buildConfiguration({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
          headers: createGleanHeaders('my-api-token'),
        });

        expect(config).toHaveProperty('mcpServers');
        const servers = config.mcpServers;
        const serverConfig = servers[Object.keys(servers)[0]] as Record<string, unknown>;
        // Uses mcp-remote bridge - generates stdio config wrapping HTTP URL
        expect(serverConfig.type).toBe('stdio');
        expect(serverConfig.command).toBe('npx');
        expect(serverConfig.args).toContain('mcp-remote');
        expect(serverConfig.args).toContain('https://my-company-be.glean.com/mcp/default');
      });

      it('with OAuth (URL only, no token)', () => {
        const config = builder.buildConfiguration({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
        });

        expect(config).toHaveProperty('mcpServers');
        const servers = config.mcpServers;
        const serverConfig = servers[Object.keys(servers)[0]] as Record<string, unknown>;
        // Uses mcp-remote bridge
        expect(serverConfig.command).toBe('npx');
        expect(serverConfig.args).toContain('mcp-remote');
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
        expect(command).toContain('--client claude-desktop');
        expect(command).toContain('--env GLEAN_INSTANCE=my-company');
        expect(command).toContain('--env GLEAN_API_TOKEN=my-api-token');
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
        expect(command).toContain('npx -y @gleanwork/configure-mcp-server remote');
        expect(command).toContain('--client claude-desktop');
        expect(command).toContain('--token my-api-token');
      });

      it('with OAuth (no token) returns command without --token flag', () => {
        const command = builder.buildCommand({
          transport: 'http',
          serverUrl: buildGleanServerUrl('my-company'),
        });

        expect(command).not.toBeNull();
        expect(command).toContain('npx -y @gleanwork/configure-mcp-server remote');
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
