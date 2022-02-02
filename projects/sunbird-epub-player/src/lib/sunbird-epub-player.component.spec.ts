import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ViwerService } from './services/viewerService/viwer-service';
import { mockData } from './services/viewerService/viwer-service.spec.data';

import { EpubPlayerComponent } from './sunbird-epub-player.component';
import { EpubPlayerService } from './sunbird-epub-player.service';
import { epubPlayerConstants, telemetryType } from './sunbird-epub.constant';




describe('EpubPlayerComponent', () => {
  let component: EpubPlayerComponent;
  let fixture: ComponentFixture<EpubPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EpubPlayerComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [ViwerService, EpubPlayerService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EpubPlayerComponent);
    component = fixture.componentInstance;
    component.playerConfig = mockData.playerConfig;
    jasmine.clock().uninstall();
    jasmine.clock().install();
    fixture.detectChanges();
  });

  afterEach( () => {
    jasmine.clock().uninstall();
  });

  xit('should create', () => {
    expect(component).toBeTruthy();
  });

  xit('should call ngOnInit', () => {
    const viewrservice = TestBed.get(ViwerService);
    const sunbirdEpubPlayerService = TestBed.get(EpubPlayerService);
    component.traceId = mockData.playerConfig.config.traceId;
    // epub player initialize
    spyOn(sunbirdEpubPlayerService, 'initialize').and.callThrough();
    sunbirdEpubPlayerService.initialize(mockData.playerConfig);
    // viewer service initialize
    spyOn(viewrservice, 'initialize').and.callThrough();
    viewrservice.initialize(mockData.playerConfig);
    component.ngOnInit();
    expect(component.traceId).toBe('123456');
    expect(sunbirdEpubPlayerService.initialize).toHaveBeenCalled();
    expect(viewrservice.initialize).toHaveBeenCalled();
  });

  xit('should call header actions', () => {
    const viewerService = TestBed.get(ViwerService);
    spyOn(component.headerActionsEvent, 'emit');
    component.headerActions({ type: 'NEXT', data: '' });
    expect(component.headerActionsEvent.emit).toHaveBeenCalled();
  });

  xit('should call viewerEvent for epubLoaded', () => {
    spyOn(component, 'onEpubLoaded');
    component.viewerEvent({ type: 'epubLoaded', data: mockData.spineEvent });
    expect(component.onEpubLoaded).toHaveBeenCalledWith({ type: 'epubLoaded', data: mockData.spineEvent });
  });

  xit('should call viewerEvent for pageChange', () => {
    spyOn(component, 'onPageChange');
    component.viewerEvent({ type: 'pageChange', data: '' });
    expect(component.onPageChange).toHaveBeenCalledWith({ type: 'pageChange', data: '' });
  });

  xit('should call viewerEvent for onEpubEnded', () => {
    spyOn(component, 'onEpubEnded');
    component.viewerEvent({ type: 'END', data: '' });
    expect(component.onEpubEnded).toHaveBeenCalledWith({ type: 'END', data: '' });
  });

  xit('should call viewerEvent for onEpubLoadFailed', () => {
    spyOn(component, 'onEpubLoadFailed');
    component.viewerEvent({ type: 'error', data: '' });
    expect(component.onEpubLoadFailed).toHaveBeenCalled();
  });


  xit('should call onEpubLoadFailed' , () => {
    const viewerService = TestBed.get(ViwerService);
    component.viewState = epubPlayerConstants.LOADING;
    spyOn(viewerService , 'raiseErrorEvent');
    component.onEpubLoadFailed(new Error());
    expect(component.viewState).toBe(epubPlayerConstants.LOADING);
    expect(viewerService.raiseErrorEvent).toHaveBeenCalled();
  });

  xit('should call replay', () => {
    const viewerService = TestBed.get(ViwerService);
    component.viewState = epubPlayerConstants.START;
    spyOn(component , 'ngOnInit');
    spyOn(viewerService , 'raiseHeartBeatEvent');
    component.replayContent({type: 'replay', data: ''});
    expect(component.ngOnInit).toHaveBeenCalled();
    expect(viewerService.raiseHeartBeatEvent).toHaveBeenCalled();
  }),

  xit('should call the side bar events', () => {
    const viewerService = TestBed.get(ViwerService);
    spyOn(viewerService , 'raiseHeartBeatEvent');
    component.sideBarEvents({type: 'SHARE' , data: ''});
    expect(viewerService.raiseHeartBeatEvent).toHaveBeenCalled();
  });

  xit('should call the side bar menu events', () => {
    const viewerService = TestBed.get(ViwerService);
    spyOn(viewerService , 'raiseHeartBeatEvent');
    component.sidebarMenuEvent({type: 'SHARE' , data: ''});
    expect(viewerService.raiseHeartBeatEvent).toHaveBeenCalled();
  });

  xit('should call ngOnDestroy', () => {
    const endEvent = {
      type: 'END',
      data: {
        index: 0
      }
    };
    const viewerService = TestBed.get(ViwerService);
    spyOn(viewerService , 'raiseEndEvent');
    component.ngOnDestroy();
    expect(viewerService.raiseEndEvent).toHaveBeenCalled();
  });

  xit('should get progress for loading screen', () => {
    component.progress = 20;
    component.getEpubLoadingProgress();
    jasmine.clock().tick(11);
    expect(component.progress).toEqual(30);
  });
});
