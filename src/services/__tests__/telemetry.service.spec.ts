import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TelemetryService } from '../telemetry.service';
import { UtilService } from '../util.service';
import { $t } from '@project-sunbird/telemetry-sdk';

vi.mock('@project-sunbird/telemetry-sdk', () => {
  return {
    $t: {
      isInitialized: false,
      initialize: vi.fn(),
      start: vi.fn(),
      interact: vi.fn(),
      impression: vi.fn(),
      end: vi.fn(),
      error: vi.fn(),
      config: {}
    }
  };
});

describe('TelemetryService', () => {
  let telemetryService: TelemetryService;

  beforeEach(() => {
    vi.clearAllMocks();
    telemetryService = new TelemetryService();
  });

  it('should initialize correctly when $t is not initialized', () => {
    const config = {
      context: {
        channel: 'test-channel',
        pdata: 'test-pdata',
        sid: 'test-sid',
        uid: 'test-uid',
        rollup: { l1: 'test' },
        did: 'test-did',
        authToken: 'test-auth',
        mode: 'play',
        host: 'localhost',
        endpoint: '/api/telemetry',
        tags: ['tag1'],
        dispatcher: 'test-dispatcher',
        objectRollup: { l1: 'obj' }
      },
      config: { testConfig: true },
      metadata: {
        identifier: 'test-id',
        pkgVersion: 1.5
      }
    };

    $t.isInitialized = false;

    telemetryService.initialize(config as any);

    expect($t.initialize).toHaveBeenCalledWith(expect.objectContaining({
      pdata: 'test-pdata',
      env: 'contentplayer',
      channel: 'test-channel',
      dispatcher: 'test-dispatcher'
    }));

    expect(telemetryService.channel).toBe('test-channel');
    expect(telemetryService.pdata).toBe('test-pdata');
  });

  it('should initialize correctly when $t is not initialized with defaults', () => {
    const config = {
      context: {
        channel: 'test-channel',
        pdata: 'test-pdata',
        sid: 'test-sid',
        mode: 'play',
      },
      config: { testConfig: true },
      metadata: {
        identifier: 'test-id',
      }
    };

    $t.isInitialized = false;

    telemetryService.initialize(config as any);

    expect($t.initialize).toHaveBeenCalledWith(expect.objectContaining({
      pdata: 'test-pdata',
      env: 'contentplayer',
      channel: 'test-channel',
      uid: '',
      host: '',
      endpoint: '/data/v3/telemetry',
    }));

    expect(telemetryService.channel).toBe('test-channel');
    expect(telemetryService.pdata).toBe('test-pdata');
  });

  it('should not initialize $t if already initialized', () => {
    const config = {
      context: { channel: 'test-channel', pdata: 'test-pdata', sid: 'test-sid' },
      config: {},
      metadata: { identifier: 'test-id', pkgVersion: 1 }
    };

    $t.isInitialized = true;

    telemetryService.initialize(config as any);

    expect($t.initialize).not.toHaveBeenCalled();
    expect(telemetryService.channel).toBe('test-channel');
  });

  it('should generate start telemetry event correctly', () => {
    const config = {
      context: { channel: 'test-channel', pdata: 'test-pdata', sid: 'test-sid' },
      config: {},
      metadata: { identifier: 'test-id', pkgVersion: 1 }
    };
    telemetryService.initialize(config as any);

    telemetryService.start(5000);

    expect($t.start).toHaveBeenCalledWith(
      expect.anything(),
      'test-id',
      '1',
      { type: 'content', mode: 'play', pageid: '', duration: 5 },
      expect.objectContaining({
        object: expect.any(Object),
        context: expect.any(Object)
      })
    );
  });

  it('should generate interact telemetry event correctly', () => {
    const config = {
      context: { channel: 'test-channel', pdata: 'test-pdata', sid: 'test-sid' },
      config: {},
      metadata: { identifier: 'test-id', pkgVersion: 1 }
    };
    telemetryService.initialize(config as any);

    telemetryService.interact('ZOOM', 5);

    expect($t.interact).toHaveBeenCalledWith(
      { type: 'TOUCH', subtype: '', id: 'ZOOM', pageid: '5' },
      expect.any(Object)
    );
  });

  it('should generate impression telemetry event correctly', () => {
    const config = {
      context: { channel: 'test-channel', pdata: 'test-pdata', sid: 'test-sid' },
      config: {},
      metadata: { identifier: 'test-id', pkgVersion: 1 }
    };
    telemetryService.initialize(config as any);

    telemetryService.impression(2);

    expect($t.impression).toHaveBeenCalledWith(
      { type: 'workflow', subtype: '', pageid: '2', uri: '' },
      expect.any(Object)
    );
  });

  it('should generate end telemetry event correctly', () => {
    const config = {
      context: { channel: 'test-channel', pdata: 'test-pdata', sid: 'test-sid' },
      config: {},
      metadata: { identifier: 'test-id', pkgVersion: 1 }
    };
    telemetryService.initialize(config as any);

    telemetryService.end(10000, 100, 15, true);

    expect($t.end).toHaveBeenCalledWith(
      {
        type: 'content',
        mode: 'play',
        pageid: 'sunbird-player-Endpage',
        summary: [
          { progress: 100 },
          { totallength: 15 },
          { visitedlength: 15 },
          { visitedcontentend: true },
          { totalseekedlength: 0 },
          { endpageseen: true }
        ],
        duration: 10
      },
      expect.any(Object)
    );
  });

  it('should generate end telemetry event correctly when percentage is not 100', () => {
    const config = {
      context: { channel: 'test-channel', pdata: 'test-pdata', sid: 'test-sid' },
      config: {},
      metadata: { identifier: 'test-id', pkgVersion: 1 }
    };
    telemetryService.initialize(config as any);

    telemetryService.end(10000, 50, 15, false);

    expect($t.end).toHaveBeenCalledWith(
      {
        type: 'content',
        mode: 'play',
        pageid: 'sunbird-player-Endpage',
        summary: [
          { progress: 50 },
          { totallength: 1 },
          { visitedlength: 15 },
          { visitedcontentend: false },
          { totalseekedlength: 0 },
          { endpageseen: false }
        ],
        duration: 10
      },
      expect.any(Object)
    );
  });


  it('should generate error telemetry event correctly', () => {
    const config = {
      context: { channel: 'test-channel', pdata: 'test-pdata', sid: 'test-sid' },
      config: {},
      metadata: { identifier: 'test-id', pkgVersion: 1 }
    };
    telemetryService.initialize(config as any);

    const error = new Error('Test Error');
    telemetryService.error('ERR_CODE', 'TypeError', 3, error);

    expect($t.error).toHaveBeenCalledWith(
      {
        err: 'ERR_CODE',
        errtype: 'TypeError',
        stacktrace: error.toString(),
        pageid: 3
      },
      expect.any(Object)
    );
  });

  it('should generate error telemetry event correctly with no pageid', () => {
    const config = {
      context: { channel: 'test-channel', pdata: 'test-pdata', sid: 'test-sid' },
      config: {},
      metadata: { identifier: 'test-id', pkgVersion: 1 }
    };
    telemetryService.initialize(config as any);

    const error = new Error('Test Error');
    telemetryService.error('ERR_CODE', 'TypeError', null as any, error);

    expect($t.error).toHaveBeenCalledWith(
      {
        err: 'ERR_CODE',
        errtype: 'TypeError',
        stacktrace: error.toString(),
        pageid: ''
      },
      expect.any(Object)
    );
  });

  it('should handle context with no rollup or uid correctly', () => {
    const config = {
      context: { channel: 'test-channel', pdata: 'test-pdata', sid: 'test-sid' },
      config: {},
      metadata: { identifier: 'test-id', pkgVersion: 1 }
    };
    telemetryService.initialize(config as any);

    const options = (telemetryService as any).getEventOptions();

    expect(options.context.rollup).toEqual({});
    expect(options.context.uid).toBeUndefined();
  });
});
