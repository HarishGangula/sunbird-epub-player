import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('player-error-page')
export class PlayerErrorPage extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      background-color: #f8d7da;
      color: #721c24;
      padding: 20px;
      box-sizing: border-box;
      text-align: center;
    }
    .icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .message {
      font-size: 1.2rem;
    }
  `;

  render() {
    return html`
      <div class="icon">&#9888;</div>
      <div class="message">Failed to load content. Please try again later.</div>
    `;
  }
}
