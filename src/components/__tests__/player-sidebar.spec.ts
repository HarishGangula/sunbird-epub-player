import { describe, it, expect, vi } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../player-sidebar';

describe('PlayerSidebar', () => {
  it('should render correctly with title', async () => {
    const el = await fixture(html`<player-sidebar title="Test Book"></player-sidebar>`);

    expect(el).toBeDefined();
    expect(el.shadowRoot?.querySelector('.sidebar-header span')?.textContent).toBe('Test Book');
  });

  it('should toggle sidebar and emit open/close events', async () => {
    const el: any = await fixture(html`<player-sidebar></player-sidebar>`);
    const spy = vi.fn();
    el.addEventListener('sidebarEvent', spy);

    const icon: HTMLElement = el.shadowRoot?.querySelector('.sidebar-icon');

    icon.click();
    expect(el.isOpen).toBe(true);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].detail.type).toBe('SIDEBAR_OPEN');

    const overlay: HTMLElement = el.shadowRoot?.querySelector('.sidebar-overlay');
    overlay.click();
    expect(el.isOpen).toBe(false);
    expect(spy.mock.calls[1][0].detail.type).toBe('SIDEBAR_CLOSE');
  });

  it('should toggle sidebar with close button', async () => {
    const el: any = await fixture(html`<player-sidebar></player-sidebar>`);
    const spy = vi.fn();
    el.addEventListener('sidebarEvent', spy);

    el.toggleSidebar(); // Open
    expect(spy.mock.calls[0][0].detail.type).toBe('SIDEBAR_OPEN');

    const closeBtn: HTMLElement = el.shadowRoot?.querySelector('.close-btn');
    closeBtn.click(); // Close
    expect(el.isOpen).toBe(false);
    expect(spy.mock.calls[1][0].detail.type).toBe('SIDEBAR_CLOSE');
  });

  it('should correctly handle missing config', async () => {
    const el: any = await fixture(html`<player-sidebar></player-sidebar>`);
    el.config = null;
    await el.updateComplete;
    const menuItems = el.shadowRoot?.querySelectorAll('.menu-item');
    expect(menuItems?.length).toBe(0);
  });

  it('should render menu items based on config and handle actions', async () => {
    const config = {
      showShare: true,
      showDownload: true,
      showReplay: true,
      showExit: true,
      showPrint: true
    };
    const el: any = await fixture(html`<player-sidebar .config="${config}"></player-sidebar>`);
    const spy = vi.fn();
    el.addEventListener('sidebarEvent', spy);

    const menuItems = el.shadowRoot?.querySelectorAll('.menu-item');
    expect(menuItems?.length).toBe(5);

    // Click SHARE
    (menuItems?.[0] as HTMLElement).click();
    expect(spy.mock.calls[0][0].detail.type).toBe('SHARE');

    // Click DOWNLOAD
    el.isOpen = true; // reset so it can close
    (menuItems?.[1] as HTMLElement).click();
    expect(spy.mock.calls[2][0].detail.type).toBe('DOWNLOAD');

    // Click REPLAY
    el.isOpen = true; // reset
    (menuItems?.[2] as HTMLElement).click();
    expect(spy.mock.calls[4][0].detail.type).toBe('REPLAY');

    // Click EXIT
    el.isOpen = true; // reset
    (menuItems?.[3] as HTMLElement).click();
    expect(spy.mock.calls[6][0].detail.type).toBe('EXIT');

    // Click PRINT
    el.isOpen = true; // reset
    (menuItems?.[4] as HTMLElement).click();
    expect(spy.mock.calls[8][0].detail.type).toBe('PRINT');
  });

  it('should toggle sidebar with close button, setting isOpen to false when click event triggered without having isOpen be true originally', async () => {
    const el: any = await fixture(html`<player-sidebar></player-sidebar>`);
    el.toggleSidebar();
    expect(el.isOpen).toBe(true);
    el.toggleSidebar();
    expect(el.isOpen).toBe(false);
  });

  it('should not render menu items if config properties are false', async () => {
    const config = {
      showShare: false,
      showDownload: false,
      showReplay: false,
      showExit: false,
      showPrint: false
    };
    const el: any = await fixture(html`<player-sidebar .config="${config}"></player-sidebar>`);
    const menuItems = el.shadowRoot?.querySelectorAll('.menu-item');
    expect(menuItems?.length).toBe(0);
  });

  it('should handle toggleSidebar when isOpen is initially true', async () => {
    const el: any = await fixture(html`<player-sidebar></player-sidebar>`);
    const spy = vi.fn();
    el.addEventListener('sidebarEvent', spy);
    el.isOpen = true;
    el.toggleSidebar();
    expect(el.isOpen).toBe(false);
    expect(spy.mock.calls[0][0].detail.type).toBe('SIDEBAR_CLOSE');
  });

  it('should toggle sidebar opening when clicking icon when already open', async () => {
    const el: any = await fixture(html`<player-sidebar></player-sidebar>`);
    el.isOpen = true;
    el.toggleSidebar();
    expect(el.isOpen).toBe(false);
  });
});
