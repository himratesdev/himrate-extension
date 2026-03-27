import { describe, it, expect } from 'vitest';
import manifest from '../../public/manifest.json';

describe('manifest.json', () => {
  it('manifest_version is 3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  it('name is HimRate', () => {
    expect(manifest.name).toBe('HimRate');
  });

  it('has exactly the required permissions', () => {
    const expected = ['sidePanel', 'activeTab', 'storage', 'alarms', 'webNavigation'];
    expect([...manifest.permissions].sort()).toEqual([...expected].sort());
  });

  it('has popup configured', () => {
    expect(manifest.action.default_popup).toBe('popup.html');
  });

  it('has side panel configured', () => {
    expect(manifest.side_panel.default_path).toBe('sidepanel.html');
  });

  it('has background service worker', () => {
    expect(manifest.background.service_worker).toBe('background.js');
    expect(manifest.background.type).toBe('module');
  });

  it('content scripts match only twitch.tv', () => {
    expect(manifest.content_scripts).toHaveLength(1);
    expect(manifest.content_scripts[0].matches).toEqual(['*://*.twitch.tv/*']);
  });

  it('has all icon sizes', () => {
    expect(manifest.icons).toHaveProperty('16');
    expect(manifest.icons).toHaveProperty('48');
    expect(manifest.icons).toHaveProperty('128');
  });
});
