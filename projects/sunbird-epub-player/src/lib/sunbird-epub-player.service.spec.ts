import { TestBed } from '@angular/core/testing';
import { CsTelemetryModule } from '@project-sunbird/client-services/telemetry';
import { mockData } from './services/viewerService/viwer-service.spec.data';
import { EpubPlayerService } from './sunbird-epub-player.service';

describe('SunbirdPdfPlayerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EpubPlayerService = TestBed.inject(EpubPlayerService);
    expect(service).toBeTruthy();
  });

  it('should initialize player config', () => {
    const service = TestBed.inject(EpubPlayerService);
    service.initialize(mockData.playerConfig);
    expect(service['playSessionId']).toBeDefined();
    expect(CsTelemetryModule.instance.isInitialised).toBeTruthy();
    expect(service['telemetryObject']).toBeDefined();
  });

  it('should raise start telemetry event', () => {
    const service = TestBed.inject(EpubPlayerService);
    service.initialize(mockData.playerConfig);
    spyOn(CsTelemetryModule.instance.telemetryService, 'raiseStartTelemetry');
    service.start(12);
    expect(CsTelemetryModule.instance.telemetryService.raiseStartTelemetry).toHaveBeenCalled();
  });

  it('should raise end telemetry event', () => {
    const service = TestBed.inject(EpubPlayerService);
    service.initialize(mockData.playerConfig);
    spyOn(CsTelemetryModule.instance.telemetryService, 'raiseEndTelemetry');
    service.end(10, 5, 10, 5);
    expect(CsTelemetryModule.instance.telemetryService.raiseEndTelemetry).toHaveBeenCalled();
  });

  it('should raise interact telemetry event', () => {
    const service = TestBed.inject(EpubPlayerService);
    service.initialize(mockData.playerConfig);
    spyOn(CsTelemetryModule.instance.telemetryService, 'raiseInteractTelemetry');
    service.interact('pageId', 1);
    expect(CsTelemetryModule.instance.telemetryService.raiseInteractTelemetry).toHaveBeenCalled();
  });

  it('should raise impression telemetry event', () => {
    const service = TestBed.inject(EpubPlayerService);
    service.initialize(mockData.playerConfig);
    spyOn(CsTelemetryModule.instance.telemetryService, 'raiseImpressionTelemetry');
    service.impression(1);
    expect(CsTelemetryModule.instance.telemetryService.raiseImpressionTelemetry).toHaveBeenCalled();
  });

  xit('should raise error telemetry event', () => {
    const service = TestBed.inject(EpubPlayerService);
    service.initialize(mockData.playerConfig);
    spyOn(CsTelemetryModule.instance.telemetryService, 'raiseErrorTelemetry');
    service.error('', '', '', '');
    expect(CsTelemetryModule.instance.telemetryService.raiseErrorTelemetry).toHaveBeenCalled();
  });

});
