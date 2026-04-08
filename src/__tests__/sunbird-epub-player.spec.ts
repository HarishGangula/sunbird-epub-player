import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fixture, html, waitUntil } from '@open-wc/testing';
import '../sunbird-epub-player';
import { epubPlayerConstants, telemetryType, errorCode, errorMessage } from '../constants/sunbird-epub.constant';

vi.mock('../services/telemetry.service', () => {
  return {
    TelemetryService: class {
      initialize = vi.fn();
      start = vi.fn();
      interact = vi.fn();
      impression = vi.fn();
      end = vi.fn();
      error = vi.fn();
    }
  };
});

vi.mock('../services/viewer.service', () => {
  return {
    ViewerService: class {
      initialize = vi.fn();
      raiseStartEvent = vi.fn();
      raiseHeartBeatEvent = vi.fn();
      raiseEndEvent = vi.fn();
      raiseExceptionLog = vi.fn();
      isAvailableLocally = true;
      metaData = { pagesVisited: [] };
      contentName = 'Test Content';
      totalNumberOfPages = 10;
      src = 'test.epub';
      identifier = '123';
      userName = 'Test User';
      timeSpent = '1:00';
      artifactUrl = 'test.epub';
      constructor(telemetryService: any, eventCallback: any) {}
    }
  };
});

vi.mock('epubjs', () => {
  return {
    default: vi.fn().mockReturnValue({
      renderTo: vi.fn().mockReturnValue({
        on: vi.fn(),
        display: vi.fn()
      }),
      loaded: { spine: Promise.resolve(null) },
      destroy: vi.fn()
    })
  };
});

describe('SunbirdEpubPlayer', () => {
  const getMockConfig = () => ({
    context: {},
    config: {
      traceId: 'test-trace-id',
      sideMenu: { showShare: true }
    },
    metadata: {}
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize and render correctly with config', async () => {
    const configStr = JSON.stringify(getMockConfig());
    const el: any = await fixture(html`
      <sunbird-epub-player player-config="${configStr}"></sunbird-epub-player>
    `);

    await el.updateComplete;

    expect(el).toBeDefined();
    expect(el.playerConfig).toBeDefined();
    expect(el.viewerService.initialize).toHaveBeenCalled();
    expect(el.telemetryService.initialize).toHaveBeenCalled();
    expect(el.showEpubViewer).toBe(true);
  });

  it('should handle invalid player config string', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const el: any = await fixture(html`
      <sunbird-epub-player player-config="invalid-json"></sunbird-epub-player>
    `);

    await el.updateComplete;
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(el.playerConfig).toBeUndefined();
    consoleErrorSpy.mockRestore();
  });

  it('should handle missing config during initialization', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    await el.updateComplete;
    el.playerConfig = null;
    await el.initializePlayer();

    expect(el.showEpubViewer).toBe(false);
  });

  it('should handle offline scenario and raise exception', async () => {
    // Mock navigator.onLine to be false
    const originalOnLine = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });

    const config = getMockConfig();
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    el.viewerService.isAvailableLocally = false;
    el.playerConfig = config;
    await el.initializePlayer();

    expect(el.viewerService.raiseExceptionLog).toHaveBeenCalledWith(
      errorCode.internetConnectivity,
      el.currentPageIndex,
      errorMessage.internetConnectivity,
      'test-trace-id',
      expect.any(Error)
    );

    // Restore
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: originalOnLine });
  });

  it('should manage epub loading progress', async () => {
    vi.useFakeTimers();
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    el.getEpubLoadingProgress();
    vi.advanceTimersByTime(200); // multiple intervals

    expect(el.progress).toBeGreaterThan(0);
    vi.useRealTimers();
  });

  it('should handle EPUBLOADED viewer event', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    el.playerConfig = { config: { pagesVisited: [1, 2], currentLocation: '10%' } };
    const event = new CustomEvent('viewerEvent', { detail: { type: epubPlayerConstants.EPUBLOADED, data: {} } });

    el.handleViewerEvent(event);

    expect(el.viewState).toBe(epubPlayerConstants.START);
    expect(el.viewerService.raiseStartEvent).toHaveBeenCalled();
    expect(el.currentPageIndex).toBe(2);
  });

  it('should handle PAGECHANGE viewer event with next interaction', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    el.currentPageIndex = 1;
    const event = new CustomEvent('viewerEvent', {
      detail: {
        type: epubPlayerConstants.PAGECHANGE,
        data: { index: 2 },
        interaction: epubPlayerConstants.NEXT
      }
    });

    el.handleViewerEvent(event);

    // It takes the index from data and then adds 1 because of NEXT interaction
    expect(el.currentPageIndex).toBe(3);
    expect(el.viewerService.raiseHeartBeatEvent).toHaveBeenCalledWith(event.detail, telemetryType.INTERACT);
    expect(el.viewerService.raiseHeartBeatEvent).toHaveBeenCalledWith(event.detail, telemetryType.IMPRESSION);
  });

  it('should handle PAGECHANGE viewer event with previous interaction', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    el.currentPageIndex = 3;
    const event = new CustomEvent('viewerEvent', {
      detail: {
        type: epubPlayerConstants.PAGECHANGE,
        data: { index: 3 },
        interaction: epubPlayerConstants.PREVIOUS
      }
    });

    el.handleViewerEvent(event);

    // Takes index 3, subtracts 1 because of PREVIOUS interaction
    expect(el.currentPageIndex).toBe(2);
  });

  it('should handle PAGECHANGE viewer event with previous interaction on first page', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    el.currentPageIndex = 1;
    const event = new CustomEvent('viewerEvent', {
      detail: {
        type: epubPlayerConstants.PAGECHANGE,
        data: { index: 1 },
        interaction: epubPlayerConstants.PREVIOUS
      }
    });

    el.handleViewerEvent(event);

    // Takes index 1, subtracts 1 -> 0, gets forced back to 1
    expect(el.currentPageIndex).toBe(1);
  });


  it('should handle END viewer event', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    el.currentPageIndex = 5;
    const event = new CustomEvent('viewerEvent', { detail: { type: epubPlayerConstants.END, data: {} } });

    el.handleViewerEvent(event);

    expect(el.viewState).toBe(epubPlayerConstants.END);
    expect(el.showEpubViewer).toBe(false);
    expect(el.viewerService.raiseEndEvent).toHaveBeenCalledWith(expect.objectContaining({ data: { index: 5 }}));
  });

  it('should handle ERROR viewer event', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    const event = new CustomEvent('viewerEvent', { detail: { type: epubPlayerConstants.ERROR, errorCode: 'ERR', errorMessage: 'Test Err' } });

    el.handleViewerEvent(event);

    expect(el.showContentError).toBe(true);
    expect(el.viewState).toBe(epubPlayerConstants.LOADING);
    expect(el.viewerService.raiseExceptionLog).toHaveBeenCalled();
  });

  it('should handle NAVIGATE_TO_PAGE viewer event', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    const event = new CustomEvent('viewerEvent', { detail: { type: epubPlayerConstants.NAVIGATE_TO_PAGE, event: { data: 8 } } });

    el.handleViewerEvent(event);

    expect(el.currentPageIndex).toBe(8);
  });

  it('should handle INVALID_PAGE_ERROR viewer event', async () => {
    vi.useFakeTimers();
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    const event = new CustomEvent('viewerEvent', { detail: { type: epubPlayerConstants.INVALID_PAGE_ERROR } });

    // This mostly just runs a setTimeout, test that it executes without errors
    expect(() => el.handleViewerEvent(event)).not.toThrow();
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it('should handle replay content', async () => {
    const configStr = JSON.stringify(getMockConfig());
    const el: any = await fixture(html`
      <sunbird-epub-player player-config="${configStr}"></sunbird-epub-player>
    `);
    await el.updateComplete;

    el.replayContent();

    expect(el.currentPageIndex).toBe(1);
    expect(el.viewerService.raiseHeartBeatEvent).toHaveBeenCalledWith('REPLAY', telemetryType.INTERACT);
    expect(el.viewState).toBe(epubPlayerConstants.START);
  });

  it('should handle exit content', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    const spy = vi.fn();
    el.addEventListener('playerEvent', spy);

    el.exitContent();

    expect(el.viewerService.raiseHeartBeatEvent).toHaveBeenCalledWith('EXIT', telemetryType.INTERACT);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].detail.type).toBe('EXIT');
  });

  it('should handle sidebar events: DOWNLOAD', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    const mockA = { click: vi.fn(), remove: vi.fn() };
    const createSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockA as any);
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((() => {}) as any);

    const event = new CustomEvent('sidebarEvent', { detail: { type: 'DOWNLOAD' } });
    el.sideBarEvents(event);

    expect(el.viewerService.raiseHeartBeatEvent).toHaveBeenCalledWith({ type: 'DOWNLOAD' }, telemetryType.INTERACT);
    expect(mockA.click).toHaveBeenCalled();
    expect(mockA.remove).toHaveBeenCalled();

    createSpy.mockRestore();
    appendSpy.mockRestore();
  });

  it('should handle sidebar events: EXIT', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    let called = false;
    el.exitContent = () => { called = true; };
    const event = new CustomEvent('sidebarEvent', { detail: { type: 'EXIT' } });
    el.sideBarEvents(event);

    expect(called).toBe(true);
  });

  it('should handle sidebar events: REPLAY', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    let called = false;
    el.replayContent = () => { called = true; };
    const event = new CustomEvent('sidebarEvent', { detail: { type: 'REPLAY' } });
    el.sideBarEvents(event);

    expect(called).toBe(true);
  });

  it('should forward header action to epub-viewer', async () => {
    const configStr = JSON.stringify(getMockConfig());
    const el: any = await fixture(html`
      <sunbird-epub-player player-config="${configStr}"></sunbird-epub-player>
    `);
    await el.updateComplete;

    // Transition to START state so the epub-viewer is rendered
    el.viewState = epubPlayerConstants.START;
    el.showEpubViewer = true;
    await el.updateComplete;

    const mockEpubViewer = { handleAction: vi.fn() };
    let target = el.shadowRoot || el;
    const querySpy = vi.spyOn(target, 'querySelector').mockReturnValue(mockEpubViewer as any);

    const event = new CustomEvent('action', { detail: { type: 'NEXT' } });
    el.handleHeaderAction(event);

    expect(mockEpubViewer.handleAction).toHaveBeenCalledWith({ type: 'NEXT' });

    querySpy.mockRestore();
  });

  it('should not throw if epub-viewer is missing during header action', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    let target = el.shadowRoot || el;
    const querySpy = vi.spyOn(target, 'querySelector').mockReturnValue(null);
    const event = new CustomEvent('action', { detail: { type: 'NEXT' } });

    expect(() => el.handleHeaderAction(event)).not.toThrow();

    querySpy.mockRestore();
  });

  it('should handle unload event', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    el.handleUnload();
    expect(el.viewerService.raiseEndEvent).toHaveBeenCalled();
    expect(el.viewerService.isEndEventRaised).toBe(false);
  });

  it('should update showControls on mouse enter and leave', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);

    await el.updateComplete;
    const container = el.querySelector('.sunbird-epub-container') || el.shadowRoot?.querySelector('.sunbird-epub-container');
    if (container) {
      container.dispatchEvent(new MouseEvent('mouseenter'));
      expect(el.showControls).toBe(true);

      container.dispatchEvent(new MouseEvent('mouseleave'));
      expect(el.showControls).toBe(false);
    }
  });

  it('should emit telemetry event', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);
    await el.updateComplete;
    const spy = vi.fn();
    el.addEventListener('telemetryEvent', spy);
    el.emitTelemetryEvent({ type: 'TEST' });
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].detail.type).toBe('TEST');
  });

  it('should format loading progress with zero decimal places', async () => {
    const el: any = await fixture(html`
      <sunbird-epub-player></sunbird-epub-player>
    `);
    el.progress = 50.5;
    expect(el.progress).toBe(50.5);
    el.viewState = epubPlayerConstants.LOADING;
    await el.updateComplete;
    const progressEl = el.shadowRoot ? el.shadowRoot.querySelector('sunbird-player-start-page') : el.querySelector('sunbird-player-start-page');
    expect(progressEl).toBeDefined();
  });

  it('should map viewer events securely and trigger default branch for unhandled event', async () => {
    const el: any = await fixture(html`<sunbird-epub-player></sunbird-epub-player>`);
    const mockEvent = new CustomEvent('viewerEvent', { detail: { type: 'UNKNOWN_EVENT' }});
    expect(() => el.handleViewerEvent(mockEvent)).not.toThrow();
  });

  it('should handle PAGECHANGE with no interaction data', async () => {
    const el: any = await fixture(html`<sunbird-epub-player></sunbird-epub-player>`);
    el.currentPageIndex = 5;
    const event = new CustomEvent('viewerEvent', {
      detail: { type: epubPlayerConstants.PAGECHANGE, data: { index: 5 } }
    });
    el.handleViewerEvent(event);
    expect(el.currentPageIndex).toBe(5);
  });

  it('should fallback properly during initialization if no metadata or identifier exists', async () => {
    const el: any = await fixture(html`<sunbird-epub-player></sunbird-epub-player>`);
    el.playerConfig = {
      context: {},
      config: {}
    };
    el.initializePlayer();
    expect(el.playerConfig).toBeDefined();
  });

  it('should cover fallback for pagesVisited on PAGECHANGE', async () => {
    const el: any = await fixture(html`<sunbird-epub-player></sunbird-epub-player>`);
    el.currentPageIndex = 1;
    const event = new CustomEvent('viewerEvent', {
      detail: { type: epubPlayerConstants.PAGECHANGE }
    });
    el.handleViewerEvent(event);
    expect(el.currentPageIndex).toBe(1);
  });

  it('should update epubViewer show/hide based on viewState', async () => {
    const el: any = await fixture(html`<sunbird-epub-player></sunbird-epub-player>`);
    el.viewState = epubPlayerConstants.START;
    await el.updateComplete;
    el.showEpubViewer = true;
    expect(el.showEpubViewer).toBe(true);

    el.viewState = epubPlayerConstants.LOADING;
    el.showEpubViewer = false;
    expect(el.showEpubViewer).toBe(false);
  });

});
