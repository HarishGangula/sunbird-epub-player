import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('player-start-page')
export class PlayerStartPage extends LitElement {
  @property({ type: String }) title = '';
  @property({ type: Number }) progress = 0;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      background-color: var(--theme-primary, #ffffff);
      color: var(--theme-secondary, #333333);
    }
    .title {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 2rem;
      text-align: center;
    }
    .progress-container {
      width: 50%;
      background-color: #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      height: 10px;
    }
    .progress-bar {
      height: 100%;
      background-color: #007bff;
      transition: width 0.3s ease;
    }
  `;

  render() {
    return html`
      <div class="title">${this.title}</div>
      <div class="progress-container">
        <div class="progress-bar" style="width: ${this.progress}%"></div>
      </div>
    `;
  }
}
