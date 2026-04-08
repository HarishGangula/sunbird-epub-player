import { describe, it, expect } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../player-start-page';

describe('PlayerStartPage', () => {
  it('should render correctly with title and progress', async () => {
    const el = await fixture(html`
      <player-start-page title="Test Book" progress="50"></player-start-page>
    `);

    expect(el).toBeDefined();
    expect(el.shadowRoot?.querySelector('.title')?.textContent).toBe('Test Book');
    expect(el.shadowRoot?.querySelector('.progress-bar')?.getAttribute('style')).toContain('width: 50%');
  });

  it('should render correctly with default values', async () => {
    const el = await fixture(html`<player-start-page></player-start-page>`);

    expect(el).toBeDefined();
    expect(el.shadowRoot?.querySelector('.title')?.textContent).toBe('');
    expect(el.shadowRoot?.querySelector('.progress-bar')?.getAttribute('style')).toContain('width: 0%');
  });
});
