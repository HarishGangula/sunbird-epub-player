import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { epubPlayerConstants } from '../constants/sunbird-epub.constant';

@customElement('player-header')
export class PlayerHeader extends LitElement {
  @property({ type: Number }) totalPages = 0;
  @property({ type: Number }) pageNumber = 1;
  @property({ type: Object }) config: any = {};

  static styles = css`
    :host {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background-color: rgba(255, 255, 255, 0.9);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      position: absolute;
      top: 0;
      width: 100%;
      z-index: 10;
      box-sizing: border-box;
      transition: top 0.3s ease-in-out;
    }
    .nav-buttons button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.5rem;
      padding: 5px 10px;
      color: var(--theme-primary, #333);
    }
    .nav-buttons button:disabled {
      color: #ccc;
      cursor: not-allowed;
    }
    .page-info {
      font-size: 1rem;
      color: var(--theme-secondary, #666);
    }
  `;

  private emitAction(type: string, data?: any) {
    this.dispatchEvent(new CustomEvent('action', {
      detail: { type, data },
      bubbles: true,
      composed: true
    }));
  }

  render() {
    return html`
      <div class="nav-buttons">
        ${this.config.navigation ? html`
          <button
            @click="${() => this.emitAction(epubPlayerConstants.PREVIOUS)}"
            ?disabled="${this.pageNumber <= 1}"
          >
            &#8592;
          </button>
        ` : ''}
      </div>
      <div class="page-info">
        Page ${this.pageNumber} ${this.totalPages ? html`of ${this.totalPages}` : ''}
      </div>
      <div class="nav-buttons">
         ${this.config.navigation ? html`
          <button
            @click="${() => this.emitAction(epubPlayerConstants.NEXT)}"
            ?disabled="${this.totalPages > 0 && this.pageNumber >= this.totalPages}"
          >
            &#8594;
          </button>
        ` : ''}
      </div>
    `;
  }
}
