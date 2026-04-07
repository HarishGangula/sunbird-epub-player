import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('player-end-page')
export class PlayerEndPage extends LitElement {
  @property({ type: String }) contentName = '';
  @property({ type: String }) outcomeLabel = '';
  @property({ type: Number }) outcome = 0;
  @property({ type: Boolean }) showExit = false;
  @property({ type: String }) userName = '';
  @property({ type: String }) timeSpentLabel = '';

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
      padding: 20px;
      box-sizing: border-box;
    }
    .content-name {
      font-size: 1.8rem;
      font-weight: bold;
      margin-bottom: 2rem;
      text-align: center;
    }
    .stats {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    .stat-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 1.1rem;
    }
    .actions {
      display: flex;
      gap: 20px;
    }
    button {
      padding: 10px 20px;
      font-size: 1.1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .replay-btn {
      background-color: #007bff;
      color: white;
    }
    .exit-btn {
      background-color: #dc3545;
      color: white;
    }
  `;

  render() {
    return html`
      ${this.userName ? html`<h2>Hi, ${this.userName}</h2>` : ''}
      <div class="content-name">You have successfully completed ${this.contentName}</div>

      <div class="stats">
        <div class="stat-item">
          <span>${this.outcomeLabel}</span>
          <strong>${this.outcome}</strong>
        </div>
        <div class="stat-item">
          <span>Time Spent:</span>
          <strong>${this.timeSpentLabel}</strong>
        </div>
      </div>

      <div class="actions">
        <button class="replay-btn" @click="${() => this.dispatchEvent(new CustomEvent('replayContent'))}">
          &#8634; Replay
        </button>
        ${this.showExit ? html`
          <button class="exit-btn" @click="${() => this.dispatchEvent(new CustomEvent('exitContent'))}">
            &#10006; Exit
          </button>
        ` : ''}
      </div>
    `;
  }
}
