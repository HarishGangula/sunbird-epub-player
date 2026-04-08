import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { epubPlayerConstants, telemetryType, errorCode, errorMessage } from './constants/sunbird-epub.constant';
import { TelemetryService } from './services/telemetry.service';
import { ViewerService } from './services/viewer.service';
import { PlayerConfig } from './interfaces/sunbird-epub-player.interface';

// Import UI components
import './components/player-start-page';
import './components/player-header';
import './components/player-sidebar';
import './components/player-end-page';
import './components/player-error-page';
import './components/epub-viewer';

@customElement('sunbird-epub-player')
export class SunbirdEpubPlayer extends LitElement {
  @property({ type: String, attribute: 'player-config' })
  set playerConfigStr(value: string) {
    if (value) {
      try {
        this.playerConfig = JSON.parse(value);
        this.initializePlayer();
      } catch (e) {
        console.error('Invalid playerConfig: ', e);
      }
    }
  }

  @property({ type: Object }) playerConfig!: PlayerConfig;
  @property({ type: Boolean }) showFullScreen = false;

  @state() private viewState = epubPlayerConstants.LOADING;
  @state() private progress = 0;
  @state() private showEpubViewer = false;
  @state() private showControls = true;
  @state() private showContentError = false;
  @state() private currentPageIndex = 1;

  private sideMenuConfig = {
    showShare: false,
    showDownload: false,
    showReplay: false,
    showExit: false,
    showPrint: false
  };

  private headerConfiguration = {
    rotation: false,
    goto: true,
    navigation: true,
    zoom: false
  };

  private intervalRef: any;
  private traceId: string = '';

  private telemetryService: TelemetryService;
  public viewerService: ViewerService;

  constructor() {
    super();
    this.telemetryService = new TelemetryService();
    this.viewerService = new ViewerService(this.telemetryService, this.emitPlayerEvent.bind(this));
  }

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
      background-color: var(--theme-primary, #ffffff);
      overflow: hidden;
    }
    .epub-container {
      height: 100%;
      position: relative;
    }
    .epub-viewer-wrapper {
      position: absolute;
      top: 48px;
      width: 100%;
      height: calc(100% - 48px);
    }
    .reading-status {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: white;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      z-index: 5;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('beforeunload', this.handleUnload.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('beforeunload', this.handleUnload.bind(this));
    if (this.intervalRef) clearInterval(this.intervalRef);
  }

  handleUnload() {
    const endEvent = {
      type: epubPlayerConstants.END,
      data: { index: this.currentPageIndex }
    };
    this.viewerService.raiseEndEvent(endEvent);
    this.viewerService.isEndEventRaised = false;
  }

  emitPlayerEvent(event: any) {
    this.dispatchEvent(new CustomEvent('playerEvent', {
      detail: event,
      bubbles: true,
      composed: true
    }));
  }

  emitTelemetryEvent(event: any) {
    this.dispatchEvent(new CustomEvent('telemetryEvent', {
      detail: event,
      bubbles: true,
      composed: true
    }));
  }

  async initializePlayer() {
    if (!this.playerConfig) return;

    this.viewerService.initialize(this.playerConfig);
    this.telemetryService.initialize(this.playerConfig);
    this.traceId = this.playerConfig?.config?.traceId;

    if (!navigator.onLine && !this.viewerService.isAvailableLocally) {
      this.viewerService.raiseExceptionLog(errorCode.internetConnectivity, this.currentPageIndex, errorMessage.internetConnectivity, this.traceId, new Error(errorMessage.internetConnectivity));
    }

    this.showEpubViewer = true;
    this.sideMenuConfig = { ...this.sideMenuConfig, ...this.playerConfig.config.sideMenu };
    this.getEpubLoadingProgress();
  }

  getEpubLoadingProgress() {
    this.intervalRef = setInterval(() => {
      if (this.progress < 95) {
        this.progress += 5;
      }
    }, 10);
  }

  handleViewerEvent(e: CustomEvent) {
    const event = e.detail;
    if (event.type === epubPlayerConstants.EPUBLOADED) {
      this.onEpubLoaded(event);
    } else if (event.type === epubPlayerConstants.PAGECHANGE) {
      this.onPageChange(event);
    } else if (event.type === epubPlayerConstants.END) {
      this.onEpubEnded(event);
    } else if (event.type === epubPlayerConstants.ERROR) {
      this.onEpubLoadFailed(event);
    } else if (event.type === epubPlayerConstants.NAVIGATE_TO_PAGE) {
      this.onJumpToPage(event);
    } else if (event.type === epubPlayerConstants.INVALID_PAGE_ERROR) {
      setTimeout(() => {}, 5000);
    }
  }

  onEpubLoaded(event: any) {
    clearInterval(this.intervalRef);
    this.viewState = epubPlayerConstants.START;
    this.viewerService.raiseStartEvent(event.data);

    if (this.playerConfig.config?.pagesVisited?.length && this.playerConfig.config?.currentLocation) {
      this.currentPageIndex = this.playerConfig.config.pagesVisited[this.playerConfig.config.pagesVisited.length - 1];
    }
    this.viewerService.metaData.pagesVisited.push(this.currentPageIndex);
  }

  onPageChange(event: any) {
    if (event?.data?.index) {
      this.currentPageIndex = event.data.index;
    }

    if (event?.interaction === epubPlayerConstants.NEXT) {
      this.currentPageIndex = this.currentPageIndex + 1;
    } else if (event?.interaction === epubPlayerConstants.PREVIOUS) {
      this.currentPageIndex = this.currentPageIndex - 1 === 0 ? 1 : this.currentPageIndex - 1;
    }

    this.viewerService.raiseHeartBeatEvent(event, telemetryType.INTERACT);
    this.viewerService.raiseHeartBeatEvent(event, telemetryType.IMPRESSION);
    this.viewerService.metaData.pagesVisited.push(this.currentPageIndex);
  }

  onJumpToPage(type: any) {
    this.currentPageIndex = type?.event?.data;
    this.viewerService.raiseHeartBeatEvent(type, telemetryType.INTERACT);
    this.viewerService.raiseHeartBeatEvent(type, telemetryType.IMPRESSION);
    this.viewerService.metaData.pagesVisited.push(this.currentPageIndex);
  }

  onEpubEnded(event: any) {
    this.viewState = epubPlayerConstants.END;
    this.showEpubViewer = false;
    event.data.index = this.currentPageIndex;
    this.viewerService.raiseEndEvent(event);
  }

  onEpubLoadFailed(error: any) {
    this.showContentError = true;
    this.viewState = epubPlayerConstants.LOADING;
    this.viewerService.raiseExceptionLog(error.errorCode, this.currentPageIndex, error.errorMessage, this.traceId, new Error(error.errorMessage));
  }

  replayContent() {
    this.currentPageIndex = 1;
    this.viewerService.raiseHeartBeatEvent('REPLAY', telemetryType.INTERACT);
    this.viewState = epubPlayerConstants.START;
    this.viewerService.metaData.pagesVisited.push(this.currentPageIndex);
    this.initializePlayer();
  }

  exitContent() {
    this.viewerService.raiseHeartBeatEvent('EXIT', telemetryType.INTERACT);
    this.emitPlayerEvent({ type: 'EXIT' });
  }

  sideBarEvents(e: CustomEvent) {
    const event = e.detail;
    this.viewerService.raiseHeartBeatEvent(event, telemetryType.INTERACT);
    if (event.type === 'DOWNLOAD') {
      this.downloadEpub();
    } else if (event.type === 'EXIT') {
      this.exitContent();
    } else if (event.type === 'REPLAY') {
      this.replayContent();
    }
  }

  downloadEpub() {
    const a = document.createElement('a');
    a.href = this.viewerService.artifactUrl;
    a.download = this.viewerService.contentName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
    this.viewerService.raiseHeartBeatEvent('DOWNLOAD');
  }

  handleHeaderAction(e: CustomEvent) {
    const epubViewer = this.shadowRoot?.querySelector('epub-viewer') as any;
    if (epubViewer) {
      epubViewer.handleAction(e.detail);
    }
  }

  render() {
    return html`
      <div class="sunbird-epub-container"
           @mouseenter="${() => this.showControls = true}"
           @mouseleave="${() => this.showControls = false}">

        ${this.viewState === epubPlayerConstants.LOADING ? html`
          <player-start-page .title="${this.viewerService.contentName}" .progress="${this.progress}"></player-start-page>
        ` : ''}

        ${this.showEpubViewer ? html`
          <div class="epub-container">
            ${this.viewState === epubPlayerConstants.START ? html`
              ${this.showControls ? html`
                <player-header
                  .totalPages="${this.viewerService.totalNumberOfPages}"
                  .pageNumber="${this.currentPageIndex}"
                  .config="${this.headerConfiguration}"
                  @action="${this.handleHeaderAction}">
                </player-header>
              ` : ''}

              <player-sidebar
                .title="${this.viewerService.contentName}"
                .config="${this.sideMenuConfig}"
                @sidebarEvent="${this.sideBarEvents}">
              </player-sidebar>

              ${this.currentPageIndex && this.viewerService.totalNumberOfPages ? html`
                <div class="reading-status">
                  Page ${this.currentPageIndex} of ${this.viewerService.totalNumberOfPages} - ${((this.currentPageIndex / this.viewerService.totalNumberOfPages) * 100).toFixed(0)}%
                </div>
              ` : ''}
            ` : ''}

            <div class="epub-viewer-wrapper">
              <epub-viewer
                .epubSrc="${this.viewerService.src}"
                .identifier="${this.viewerService.identifier}"
                .config="${this.playerConfig.config}"
                .showFullScreen="${this.showFullScreen}"
                .viwerService="${this.viewerService}"
                @viewerEvent="${this.handleViewerEvent}">
              </epub-viewer>
            </div>
          </div>
        ` : ''}

        ${this.viewState === epubPlayerConstants.END ? html`
          <player-end-page
            .contentName="${this.viewerService.contentName}"
            .outcomeLabel="${'Pages read: '}"
            .outcome="${this.currentPageIndex - 1}"
            .showExit="${this.sideMenuConfig.showExit}"
            .userName="${this.viewerService.userName}"
            .timeSpentLabel="${this.viewerService.timeSpent}"
            @replayContent="${this.replayContent}"
            @exitContent="${this.exitContent}">
          </player-end-page>
        ` : ''}

        ${this.showContentError ? html`<player-error-page></player-error-page>` : ''}
      </div>
    `;
  }
}
