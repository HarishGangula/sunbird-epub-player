import { PlayerConfig } from '../interfaces/sunbird-epub-player.interface';
import { UtilService } from './util.service';
import { telemetryType } from '../constants/sunbird-epub.constant';
import { TelemetryService } from './telemetry.service';

export class ViewerService {
  public currentIndex = 0;
  public totalNumberOfPages = 0;
  public epubPlayerStartTime: number = 0;
  public epubLastPageTime: number = 0;
  public endPageSeen = false;
  public timeSpent = '0:0';
  private version = '1.0';
  public contentName: string = '';
  public loadingProgress: number = 0;
  public showDownloadPopup: boolean = false;
  public src: string = '';
  public userName: string = '';
  public metaData: any;
  public identifier: any;
  public artifactUrl: any;
  public isAvailableLocally = false;
  public isEndEventRaised = false;

  private telemetryService: TelemetryService;
  private onPlayerEvent: (event: any) => void;

  constructor(telemetryService: TelemetryService, onPlayerEvent: (event: any) => void) {
    this.telemetryService = telemetryService;
    this.onPlayerEvent = onPlayerEvent;
  }

  initialize({ context, metadata }: PlayerConfig) {
    this.epubPlayerStartTime = this.epubLastPageTime = new Date().getTime();
    this.totalNumberOfPages = 0;
    this.currentIndex = 0;
    this.contentName = metadata.name;
    this.identifier = metadata.identifier;
    this.artifactUrl = metadata.artifactUrl;
    this.isAvailableLocally = metadata.isAvailableLocally;
    if (this.isAvailableLocally) {
      const basePath = (metadata.streamingUrl) ? (metadata.streamingUrl) : (metadata.basePath || metadata.baseDir);
      this.src = `${basePath}/${metadata.artifactUrl}`;
    } else {
      this.src = metadata.streamingUrl || metadata.artifactUrl;
    }
    if (context.userData) {
      const { userData: { firstName, lastName } } = context;
      this.userName = firstName === lastName ? firstName : `${firstName} ${lastName}`;
    }
    this.metaData = {
      pagesVisited: [],
      totalPages: 0,
      duration: [],
      zoom: [],
      rotation: []
    };
    this.showDownloadPopup = false;
    this.endPageSeen = false;
  }

  raiseStartEvent(event: any) {
    this.currentIndex = event.items && event.items[0] ? event.items[0].index : 1;
    const duration = new Date().getTime() - this.epubPlayerStartTime;
    const startEvent = {
      eid: 'START',
      ver: this.version,
      edata: {
        type: 'START',
        currentPage: this.currentIndex,
        duration
      },
      metaData: this.metaData
    };
    this.onPlayerEvent(startEvent);
    this.epubLastPageTime = this.epubPlayerStartTime = new Date().getTime();
    this.telemetryService.start(duration);
  }

  raiseHeartBeatEvent(event: any, teleType?: string) {
    if (event.data && event.data.index) {
      this.currentIndex = event.data.index;
    }
    const eventType = event.type ? event.type : event;
    const heartBeatEvent = {
      eid: 'HEARTBEAT',
      ver: this.version,
      edata: {
        type: eventType,
        currentPage: this.currentIndex
      },
      metaData: this.metaData
    };
    this.onPlayerEvent(heartBeatEvent);
    if (telemetryType.IMPRESSION === teleType) {
      this.telemetryService.impression(this.currentIndex);
    }
    if (telemetryType.INTERACT === teleType) {
      this.telemetryService.interact(eventType.toLowerCase(), this.currentIndex);
    }
  }

  raiseEndEvent(event: any) {
    if (!this.isEndEventRaised) {
      this.currentIndex = event.data.index;
      const percentage = event.data.percentage || 0;
      if (event.data.percentage) {
        this.endPageSeen = true;
      }
      const duration = new Date().getTime() - this.epubPlayerStartTime;
      this.metaData.duration = duration;
      this.metaData.totalPages = this.totalNumberOfPages;
      const endEvent = {
        eid: 'END',
        ver: this.version,
        edata: {
          type: 'END',
          currentPage: event.data.index,
          totalPages: this.totalNumberOfPages,
          duration
        },
        metaData: this.metaData
      };
      this.onPlayerEvent(endEvent);
      this.timeSpent = UtilService.getTimeSpentText(this.epubPlayerStartTime);
      this.telemetryService.end(duration, percentage, this.currentIndex, this.endPageSeen);
      this.isEndEventRaised = true;
    }
  }

  raiseExceptionLog(errorCode: string, pageIndex: number, errorType: string, traceId: string, stacktrace: Error) {
    const exceptionLogEvent = {
      eid: 'ERROR',
      edata: {
        err: errorCode,
        errtype: errorType,
        requestid: traceId || '',
        stacktrace
      }
    };
    this.onPlayerEvent(exceptionLogEvent);
    this.telemetryService.error(errorCode, errorType, pageIndex, stacktrace);
  }

  async isValidEpubSrc(src: string): Promise<Blob> {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.blob();
  }
}
