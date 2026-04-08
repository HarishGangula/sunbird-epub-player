import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import Epub from 'epubjs';
import { epubPlayerConstants } from '../constants/sunbird-epub.constant';
import { errorCode, errorMessage } from '../constants/sunbird-epub.constant';

const MAX_TIME_TO_LOAD_SPINE = 5 * 60 * 1000; // 5 minutes

@customElement('epub-viewer')
export class EpubViewer extends LitElement {
  @property({ type: String }) epubSrc = '';
  @property({ type: Object }) config: any = {};
  @property({ type: String }) identifier = '';
  @property({ type: Boolean }) showFullScreen = false;
  @property({ type: Object }) viwerService: any;

  @query('#epub-viewer-container') epubViewerContainer!: HTMLElement;

  private eBook: any;
  private rendition: any;
  private lastSection: any;
  private scrolled = false;
  private idForRendition = '';
  private resizeObserver: ResizeObserver | null = null;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative;
    }
    #epub-viewer-container {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    }
  `;

  async firstUpdated() {
    this.idForRendition = `${this.identifier}-content`;
    if (this.epubViewerContainer) {
      this.epubViewerContainer.id = this.idForRendition;
    }
    await this.initEpub();

    if (typeof ResizeObserver !== 'undefined' && this.epubViewerContainer) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.rendition) {
          this.rendition.resize();
        }
      });
      this.resizeObserver.observe(this.epubViewerContainer);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.eBook && typeof this.eBook.destroy === 'function') {
      this.eBook.destroy();
    }
    if (this.resizeObserver && typeof this.resizeObserver.disconnect === 'function') {
      this.resizeObserver.disconnect();
    }
  }

  async initEpub() {
    try {
      if (!this.viwerService.isAvailableLocally) {
        const epubBlob = await this.viwerService.isValidEpubSrc(this.epubSrc);
        this.eBook = Epub(epubBlob);
      } else {
        this.eBook = Epub(this.epubSrc);
      }

      this.rendition = this.eBook.renderTo(this.epubViewerContainer, {
        flow: 'paginated',
        width: '100%',
        height: '100%'
      });

      this.rendition.on('layout', () => {
        this.viwerService.totalNumberOfPages = this.eBook?.navigation?.length;
        if (this.eBook.navigation.length > 2) {
          this.rendition.spread('none');
          this.rendition.flow('scrolled');
          this.scrolled = true;
        } else {
          this.rendition.spread('auto');
          this.scrolled = false;
        }
      });

      this.rendition.on('displayError', () => {
        this.emitErrorEvent();
      });

      const spinePromise = this.eBook.loaded.spine;
      const spine = await this.fulfillWithTimeLimit(MAX_TIME_TO_LOAD_SPINE, spinePromise, null);

      if (spine) {
        this.displayEpub();
        this.lastSection = spine.last();
        this.emitViewerEvent({
          type: epubPlayerConstants.EPUBLOADED,
          data: spine
        });
      } else {
        this.emitErrorEvent();
      }
    } catch (error) {
      this.emitErrorEvent();
    }
  }

  displayEpub() {
    const currentLocation = this.config?.currentLocation;
    if (!currentLocation) {
      this.rendition.display();
    }
    this.eBook.ready.then(() => {
      return this.eBook.locations.generate(1000);
    }).then(() => {
      const totalPages = this.eBook?.spine?.length;
      this.viwerService.totalNumberOfPages = totalPages ? (totalPages - 1) : 0;
      if (currentLocation) {
        const cfi = this.eBook.locations.cfiFromPercentage(Number(currentLocation));
        this.rendition.display(cfi);
      }
    }).catch((e: any) => {
      // Handle the error silently or emit error event based on original logic, adding catch block to prevent unhandled rejection
    });
  }

  public handleAction(event: any) {
    const type = event.type;
    const spine = this.eBook.spine;
    if (this.rendition?.location?.start) {
      const data = this.rendition.location.start;
      if (this.scrolled && data.href === this.lastSection.href) {
        this.viwerService.metaData.currentLocation = 0;
        this.emitEndEvent();
      } else {
        if (this.rendition.location.atEnd || (spine.length === 1 &&
          (this.rendition.location.end.displayed.page + 1 >= this.rendition.location.end.displayed.total))) {
          this.viwerService.metaData.currentLocation = 0;
          this.emitEndEvent();
        }
      }
      if (type === epubPlayerConstants.NEXT) {
        this.rendition.next().then(() => {
          this.saveCurrentLocation();
          this.emitViewerEvent({
            type: epubPlayerConstants.PAGECHANGE,
            data,
            interaction: epubPlayerConstants.NEXT
          });
        });
      } else if (type === epubPlayerConstants.PREVIOUS) {
        this.rendition.prev().then(() => {
          this.saveCurrentLocation();
          this.emitViewerEvent({
            type: epubPlayerConstants.PAGECHANGE,
            data,
            interaction: epubPlayerConstants.PREVIOUS
          });
        });
      }
      if (type === epubPlayerConstants.NAVIGATE_TO_PAGE) {
        this.rendition.display(event.data);
        this.emitViewerEvent({
          type: epubPlayerConstants.NAVIGATE_TO_PAGE,
          event,
          interaction: epubPlayerConstants.NAVIGATE_TO_PAGE
        });
      }

      if (type === epubPlayerConstants.INVALID_PAGE_ERROR) {
        this.emitViewerEvent({
          type: epubPlayerConstants.INVALID_PAGE_ERROR,
          event,
          interaction: epubPlayerConstants.INVALID_PAGE_ERROR
        });
      }
    }
  }

  saveCurrentLocation() {
    const currentLocation = this.rendition.currentLocation();
    if (currentLocation?.start?.cfi) {
      const currentPageLocation = this.eBook.locations.percentageFromCfi(currentLocation.start.cfi);
      this.viwerService.metaData.currentLocation = currentPageLocation;
    }
  }

  emitEndEvent() {
    this.emitViewerEvent({
      type: epubPlayerConstants.END,
      data: {
        percentage: 100
      }
    });
  }

  emitErrorEvent() {
    this.emitViewerEvent({
      type: epubPlayerConstants.ERROR,
      errorCode: errorCode.contentLoadFails,
      errorMessage: errorMessage.contentLoadFails
    });
  }

  emitViewerEvent(detail: any) {
    this.dispatchEvent(new CustomEvent('viewerEvent', {
      detail,
      bubbles: true,
      composed: true
    }));
  }

  async fulfillWithTimeLimit(timeLimit: number, task: Promise<any>, failureValue: any): Promise<any> {
    let timeout: any;
    const timeoutPromise = new Promise((resolve) => {
      timeout = setTimeout(() => {
        resolve(failureValue);
      }, timeLimit);
    });
    const response = await Promise.race([task, timeoutPromise]);
    if (timeout) {
      clearTimeout(timeout);
    }
    return response;
  }

  render() {
    return html`<div id="epub-viewer-container"></div>`;
  }
}
