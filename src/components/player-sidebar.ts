import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('player-sidebar')
export class PlayerSidebar extends LitElement {
  @property({ type: String }) title = '';
  @property({ type: Object }) config: any = {};
  @state() private isOpen = false;

  static styles = css`
    :host {
      display: block;
    }
    .sidebar-icon {
      position: absolute;
      top: 15px;
      left: 15px;
      z-index: 20;
      cursor: pointer;
      font-size: 1.5rem;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 30;
      display: none;
    }
    .sidebar-overlay.open {
      display: block;
    }
    .sidebar-menu {
      position: fixed;
      top: 0;
      left: -300px;
      width: 250px;
      height: 100%;
      background: white;
      z-index: 40;
      transition: left 0.3s ease;
      box-shadow: 2px 0 5px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
    }
    .sidebar-menu.open {
      left: 0;
    }
    .sidebar-header {
      padding: 20px;
      font-size: 1.2rem;
      font-weight: bold;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .close-btn {
      cursor: pointer;
      font-size: 1.5rem;
      background: none;
      border: none;
    }
    .menu-item {
      padding: 15px 20px;
      cursor: pointer;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: center;
    }
    .menu-item:hover {
      background: #f9f9f9;
    }
  `;

  toggleSidebar() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.emitEvent('SIDEBAR_OPEN');
    } else {
      this.emitEvent('SIDEBAR_CLOSE');
    }
  }

  private emitEvent(type: string) {
    this.dispatchEvent(new CustomEvent('sidebarEvent', {
      detail: { type },
      bubbles: true,
      composed: true
    }));
  }

  handleAction(type: string) {
    this.emitEvent(type);
    this.toggleSidebar();
  }

  render() {
    return html`
      <div class="sidebar-icon" @click="${this.toggleSidebar}">
        &#9776;
      </div>

      <div class="sidebar-overlay ${this.isOpen ? 'open' : ''}" @click="${this.toggleSidebar}"></div>

      <div class="sidebar-menu ${this.isOpen ? 'open' : ''}">
        <div class="sidebar-header">
          <span>${this.title}</span>
          <button class="close-btn" @click="${this.toggleSidebar}">&times;</button>
        </div>

        ${this.config?.showShare ? html`<div class="menu-item" @click="${() => this.handleAction('SHARE')}">Share</div>` : ''}
        ${this.config?.showDownload ? html`<div class="menu-item" @click="${() => this.handleAction('DOWNLOAD')}">Download</div>` : ''}
        ${this.config?.showReplay ? html`<div class="menu-item" @click="${() => this.handleAction('REPLAY')}">Replay</div>` : ''}
        ${this.config?.showExit ? html`<div class="menu-item" @click="${() => this.handleAction('EXIT')}">Exit</div>` : ''}
        ${this.config?.showPrint ? html`<div class="menu-item" @click="${() => this.handleAction('PRINT')}">Print</div>` : ''}
      </div>
    `;
  }
}
