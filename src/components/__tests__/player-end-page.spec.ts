import { describe, it, expect, vi } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../player-end-page';

describe('PlayerEndPage', () => {
  it('should render correctly with default values', async () => {
    const el = await fixture(html`<player-end-page></player-end-page>`);

    expect(el).toBeDefined();
    expect(el.shadowRoot?.querySelector('.content-name')?.textContent).toContain('You have successfully completed');
  });

  it('should render correctly with props', async () => {
    const el = await fixture(html`
      <player-end-page
        contentName="Test Book"
        userName="John Doe"
        outcomeLabel="Pages Read"
        outcome="15"
        timeSpentLabel="1:30"
        showExit="true"
      ></player-end-page>
    `);

    expect(el).toBeDefined();
    expect(el.shadowRoot?.querySelector('h2')?.textContent).toContain('John Doe');
    expect(el.shadowRoot?.querySelector('.content-name')?.textContent).toContain('Test Book');
    expect(el.shadowRoot?.querySelector('.stats')?.textContent).toContain('Pages Read');
    expect(el.shadowRoot?.querySelector('.stats')?.textContent).toContain('15');
    expect(el.shadowRoot?.querySelector('.stats')?.textContent).toContain('1:30');
    expect(el.shadowRoot?.querySelector('.exit-btn')).toBeDefined();
  });

  it('should not render exit button if showExit is false', async () => {
    const el = await fixture(html`<player-end-page .showExit="${false}"></player-end-page>`);

    expect(el.shadowRoot?.querySelector('.exit-btn')).toBeNull();
  });

  it('should dispatch replayContent event on click', async () => {
    const el: any = await fixture(html`<player-end-page></player-end-page>`);
    const spy = vi.fn();
    el.addEventListener('replayContent', spy);

    const replayBtn: HTMLElement = el.shadowRoot?.querySelector('.replay-btn');
    replayBtn.click();

    expect(spy).toHaveBeenCalled();
  });

  it('should dispatch exitContent event on click', async () => {
    const el: any = await fixture(html`<player-end-page showExit="true"></player-end-page>`);
    const spy = vi.fn();
    el.addEventListener('exitContent', spy);

    const exitBtn: HTMLElement = el.shadowRoot?.querySelector('.exit-btn');
    exitBtn.click();

    expect(spy).toHaveBeenCalled();
  });
});
