import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ViewerService } from '../viewer.service';
import { TelemetryService } from '../telemetry.service';
import { telemetryType } from '../../constants/sunbird-epub.constant';

describe('ViewerService', () => {
  let viewerService: ViewerService;
  let telemetryService: TelemetryService;
  let mockOnPlayerEvent: any;

  beforeEach(() => {
    telemetryService = new TelemetryService();
    vi.spyOn(telemetryService, 'start').mockImplementation(() => {});
    vi.spyOn(telemetryService, 'impression').mockImplementation(() => {});
    vi.spyOn(telemetryService, 'interact').mockImplementation(() => {});
    vi.spyOn(telemetryService, 'end').mockImplementation(() => {});
    vi.spyOn(telemetryService, 'error').mockImplementation(() => {});

    mockOnPlayerEvent = vi.fn();
    viewerService = new ViewerService(telemetryService, mockOnPlayerEvent);
  });

  it('should initialize with remote playerConfig correctly', () => {
    const config = {
      context: {
        userData: { firstName: 'John', lastName: 'Doe' }
      },
      metadata: {
        name: 'Test EPUB',
        identifier: '123',
        artifactUrl: 'https://example.com/book.epub',
        isAvailableLocally: false
      }
    };

    viewerService.initialize(config as any);

    expect(viewerService.contentName).toBe('Test EPUB');
    expect(viewerService.identifier).toBe('123');
    expect(viewerService.artifactUrl).toBe('https://example.com/book.epub');
    expect(viewerService.isAvailableLocally).toBe(false);
    expect(viewerService.src).toBe('https://example.com/book.epub');
    expect(viewerService.userName).toBe('John Doe');
    expect(viewerService.metaData.pagesVisited).toEqual([]);
  });

  it('should initialize with remote playerConfig having streamingUrl correctly', () => {
    const config = {
      context: {
        userData: { firstName: 'John', lastName: 'John' }
      },
      metadata: {
        name: 'Test EPUB',
        identifier: '123',
        artifactUrl: 'https://example.com/book.epub',
        streamingUrl: 'https://example.com/stream/book.epub',
        isAvailableLocally: false
      }
    };

    viewerService.initialize(config as any);
    expect(viewerService.src).toBe('https://example.com/stream/book.epub');
    expect(viewerService.userName).toBe('John');
  });

  it('should initialize with local playerConfig having streamingUrl correctly', () => {
    const config = {
      context: {},
      metadata: {
        name: 'Test EPUB',
        identifier: '123',
        artifactUrl: 'book.epub',
        streamingUrl: 'http://localhost/stream',
        isAvailableLocally: true
      }
    };

    viewerService.initialize(config as any);
    expect(viewerService.src).toBe('http://localhost/stream/book.epub');
    expect(viewerService.userName).toBe('');
  });

  it('should initialize with local playerConfig having basePath correctly', () => {
    const config = {
      context: {},
      metadata: {
        name: 'Test EPUB',
        identifier: '123',
        artifactUrl: 'book.epub',
        basePath: '/local/path',
        isAvailableLocally: true
      }
    };

    viewerService.initialize(config as any);
    expect(viewerService.src).toBe('/local/path/book.epub');
  });

  it('should initialize with local playerConfig having baseDir correctly', () => {
    const config = {
      context: {},
      metadata: {
        name: 'Test EPUB',
        identifier: '123',
        artifactUrl: 'book.epub',
        baseDir: '/local/dir',
        isAvailableLocally: true
      }
    };

    viewerService.initialize(config as any);
    expect(viewerService.src).toBe('/local/dir/book.epub');
  });


  it('should raise start event correctly', () => {
    viewerService.initialize({
      context: {},
      metadata: {}
    } as any);

    const event = { items: [{ index: 5 }] };
    viewerService.raiseStartEvent(event);

    expect(viewerService.currentIndex).toBe(5);
    expect(mockOnPlayerEvent).toHaveBeenCalledWith(expect.objectContaining({
      eid: 'START',
      edata: expect.objectContaining({ type: 'START', currentPage: 5 })
    }));
    expect(telemetryService.start).toHaveBeenCalled();
  });

  it('should raise start event with default index if items missing', () => {
    viewerService.initialize({
      context: {},
      metadata: {}
    } as any);

    const event = {};
    viewerService.raiseStartEvent(event);

    expect(viewerService.currentIndex).toBe(1);
    expect(mockOnPlayerEvent).toHaveBeenCalledWith(expect.objectContaining({
      eid: 'START',
      edata: expect.objectContaining({ type: 'START', currentPage: 1 })
    }));
    expect(telemetryService.start).toHaveBeenCalled();
  });

  it('should raise heartbeat event and trigger impression telemetry', () => {
    viewerService.initialize({
      context: {},
      metadata: {}
    } as any);
    const event = { type: 'PAGECHANGE', data: { index: 10 } };

    viewerService.raiseHeartBeatEvent(event, telemetryType.IMPRESSION);

    expect(viewerService.currentIndex).toBe(10);
    expect(mockOnPlayerEvent).toHaveBeenCalledWith(expect.objectContaining({
      eid: 'HEARTBEAT',
      edata: expect.objectContaining({ type: 'PAGECHANGE', currentPage: 10 })
    }));
    expect(telemetryService.impression).toHaveBeenCalledWith(10);
  });

  it('should raise heartbeat event and without index', () => {
    viewerService.initialize({
      context: {},
      metadata: {}
    } as any);
    const event = { type: 'PAGECHANGE' };

    viewerService.raiseHeartBeatEvent(event, telemetryType.IMPRESSION);

    expect(viewerService.currentIndex).toBe(0);
    expect(mockOnPlayerEvent).toHaveBeenCalledWith(expect.objectContaining({
      eid: 'HEARTBEAT',
      edata: expect.objectContaining({ type: 'PAGECHANGE', currentPage: 0 })
    }));
    expect(telemetryService.impression).toHaveBeenCalledWith(0);
  });

  it('should raise heartbeat event and trigger interact telemetry', () => {
    viewerService.initialize({
      context: {},
      metadata: {}
    } as any);
    const event = 'ZOOM_IN';

    viewerService.raiseHeartBeatEvent(event, telemetryType.INTERACT);

    expect(mockOnPlayerEvent).toHaveBeenCalledWith(expect.objectContaining({
      eid: 'HEARTBEAT',
      edata: expect.objectContaining({ type: 'ZOOM_IN' })
    }));
    expect(telemetryService.interact).toHaveBeenCalledWith('zoom_in', viewerService.currentIndex);
  });

  it('should raise end event correctly', () => {
    viewerService.initialize({
      context: {},
      metadata: {}
    } as any);

    const event = { data: { index: 15, percentage: 100 } };
    viewerService.raiseEndEvent(event);

    expect(viewerService.currentIndex).toBe(15);
    expect(viewerService.endPageSeen).toBe(true);
    expect(mockOnPlayerEvent).toHaveBeenCalledWith(expect.objectContaining({
      eid: 'END',
      edata: expect.objectContaining({ type: 'END', currentPage: 15 })
    }));
    expect(telemetryService.end).toHaveBeenCalled();
    expect(viewerService.isEndEventRaised).toBe(true);

    // Call again to test if it prevents multiple triggers
    viewerService.raiseEndEvent(event);
    expect(mockOnPlayerEvent).toHaveBeenCalledTimes(1);
  });

  it('should raise end event correctly without percentage', () => {
    viewerService.initialize({
      context: {},
      metadata: {}
    } as any);

    const event = { data: { index: 15 } };
    viewerService.raiseEndEvent(event);

    expect(viewerService.currentIndex).toBe(15);
    expect(viewerService.endPageSeen).toBe(false);
  });

  it('should raise exception log correctly', () => {
    const error = new Error('Test error');
    viewerService.raiseExceptionLog('ERR_01', 5, 'NetworkError', 'trace-123', error);

    expect(mockOnPlayerEvent).toHaveBeenCalledWith(expect.objectContaining({
      eid: 'ERROR',
      edata: expect.objectContaining({ err: 'ERR_01', errtype: 'NetworkError', requestid: 'trace-123' })
    }));
    expect(telemetryService.error).toHaveBeenCalledWith('ERR_01', 'NetworkError', 5, error);
  });

  it('should raise exception log correctly without traceid', () => {
    const error = new Error('Test error');
    viewerService.raiseExceptionLog('ERR_01', 5, 'NetworkError', '', error);

    expect(mockOnPlayerEvent).toHaveBeenCalledWith(expect.objectContaining({
      eid: 'ERROR',
      edata: expect.objectContaining({ err: 'ERR_01', errtype: 'NetworkError', requestid: '' })
    }));
    expect(telemetryService.error).toHaveBeenCalledWith('ERR_01', 'NetworkError', 5, error);
  });

  it('should fetch and return a blob for a valid EPUB src', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['test']))
    });

    const blob = await viewerService.isValidEpubSrc('valid-url');
    expect(blob).toBeInstanceOf(Blob);
  });

  it('should throw an error for an invalid EPUB src network response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false
    });

    await expect(viewerService.isValidEpubSrc('invalid-url')).rejects.toThrow('Network response was not ok');
  });

});
