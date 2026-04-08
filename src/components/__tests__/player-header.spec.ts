import { describe, it, expect, vi } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../player-header';
import { epubPlayerConstants } from '../../constants/sunbird-epub.constant';

describe('PlayerHeader', () => {
  it('should render correctly with default values', async () => {
    const el = await fixture(html`<player-header></player-header>`);

    expect(el).toBeDefined();
    expect(el.shadowRoot?.querySelector('.page-info')?.textContent?.trim()).toBe('Page 1');
  });

  it('should render correctly with totalPages and pageNumber', async () => {
    const el = await fixture(html`<player-header .totalPages="${10}" .pageNumber="${5}"></player-header>`);

    expect(el).toBeDefined();
    expect(el.shadowRoot?.querySelector('.page-info')?.textContent?.trim()).toContain('Page 5');
    expect(el.shadowRoot?.querySelector('.page-info')?.textContent?.trim()).toContain('of 10');
  });

  it('should render navigation buttons when config.navigation is true', async () => {
    const config = { navigation: true };
    const el: any = await fixture(html`<player-header .config="${config}" .totalPages="${10}" .pageNumber="${5}"></player-header>`);

    const buttons = el.shadowRoot?.querySelectorAll('button');
    expect(buttons?.length).toBe(2);
  });

  it('should emit NEXT action on next button click', async () => {
    const config = { navigation: true };
    const el: any = await fixture(html`<player-header .config="${config}" .totalPages="${10}" .pageNumber="${5}"></player-header>`);

    const spy = vi.fn();
    el.addEventListener('action', spy);

    const buttons = el.shadowRoot?.querySelectorAll('button');
    buttons?.[1].click();

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].detail.type).toBe(epubPlayerConstants.NEXT);
  });

  it('should emit PREVIOUS action on previous button click', async () => {
    const config = { navigation: true };
    const el: any = await fixture(html`<player-header .config="${config}" .totalPages="${10}" .pageNumber="${5}"></player-header>`);

    const spy = vi.fn();
    el.addEventListener('action', spy);

    const buttons = el.shadowRoot?.querySelectorAll('button');
    buttons?.[0].click();

    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].detail.type).toBe(epubPlayerConstants.PREVIOUS);
  });

  it('should disable previous button on first page', async () => {
    const config = { navigation: true };
    const el: any = await fixture(html`<player-header .config="${config}" .totalPages="${10}" .pageNumber="${1}"></player-header>`);

    const buttons = el.shadowRoot?.querySelectorAll('button');
    expect(buttons?.[0].disabled).toBe(true);
    expect(buttons?.[1].disabled).toBe(false);
  });

  it('should disable next button on last page', async () => {
    const config = { navigation: true };
    const el: any = await fixture(html`<player-header .config="${config}" .totalPages="${10}" .pageNumber="${10}"></player-header>`);

    const buttons = el.shadowRoot?.querySelectorAll('button');
    expect(buttons?.[0].disabled).toBe(false);
    expect(buttons?.[1].disabled).toBe(true);
  });
});
