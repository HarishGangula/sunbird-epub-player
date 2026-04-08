import { describe, it, expect } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../player-error-page';

describe('PlayerErrorPage', () => {
  it('should render correctly', async () => {
    const el = await fixture(html`<player-error-page></player-error-page>`);

    expect(el).toBeDefined();
    expect(el.shadowRoot?.querySelector('.message')?.textContent).toBe('Failed to load content. Please try again later.');
    expect(el.shadowRoot?.querySelector('.icon')?.textContent).toBe('⚠');
  });
});
