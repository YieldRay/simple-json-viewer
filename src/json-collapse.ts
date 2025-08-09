import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";

declare global {
    interface HTMLElementTagNameMap {
        "json-collapse": JsonCollapse;
    }
}

/**
 * Generally speaking, this element needs to be wrapped before it can be used.
 *
 * @slot open
 * @slot close
 * @fires change - {{expand: Boolean}}
 */
@customElement("json-collapse")
export class JsonCollapse extends LitElement {
    /** Expand or not */
    @property({ type: Boolean, reflect: true }) expand = false;

    @property({ type: Boolean }) freeze = false;

    static styles = [
        css`
      :host {
        display: flow-root;
        font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
        line-height: 1.6;
      }
      .toggle {
        align-items: center;
        cursor: pointer;
        display: flex;
        border-radius: 3px;
        line-height: inherit;
        padding: 0 3px;
        margin: 0 -3px;
        transition: background-color 0.15s ease;
      }
      .toggle:hover {
        background-color: rgba(0, 116, 232, 0.08);
      }
      .toggleActive {
        background-color: rgba(0, 116, 232, 0.12);
      }
      .toggleActive::selection {
        background-color: rgba(255, 255, 255, 0.8);
      }
      .toggleActive:hover {
        background-color: rgba(0, 116, 232, 0.16);
      }
      .toggleFreeze {
        cursor: auto;
        padding: 0;
        margin: 0;
      }
      .toggleFreeze:hover {
        background-color: transparent;
      }
      .marker {
        translate: -2px 0;
        color: #666;
        display: flex;
        font-size: 10px;
        height: 1lh;
        align-items: center;
        justify-content: center;
        margin-top: 0px;
        transition: all 0.15s ease;
        border-radius: 2px;
        flex-shrink: 0;
        user-select: none;
        width: 1lh;
      }

      .hideMarker {
        opacity: 0;
        pointer-events: none;
        width: 1lh;
      }
      .marker > div {
        transition: transform 0.15s ease;
        font-size: 9px;
        line-height: 1;
      }
      .summary {
        flex: 1;
        min-width: 0;
      }
      .body {
        margin-top: 0;
        cursor: auto;
        overflow: hidden;
        padding-left: 0;
        margin-left: 0;
        transition: all 0.2s ease;
      }
    `,
    ];

    render() {
        return html`
      <div
        class="${classMap({
            toggle: true,
            toggleActive: this.expand,
            toggleFreeze: this.freeze,
        })}"
        .tabIndex=${-1}
        @click=${() => this._handleClick()}
      >
        <div
          class="${classMap({
              marker: true,
              hideMarker: this.freeze,
          })}"
          role="button"
          aria-expanded=${String(this.expand)}
          tabindex="0"
          @keydown=${(e: KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  this._handleClick();
              }
          }}
        >
          ${when(
              this.expand,
              () => html`<div style="rotate: 90deg">▶</div>`,
              () => html`<div>▶</div>`,
          )}
        </div>
        <div class="summary">
          ${when(
              this.expand,
              () => html`<slot name="close"></slot>`,
              () => html`<slot name="open"></slot>`,
          )}
        </div>
      </div>

      <div class="body">${when(this.expand, () => html`<slot></slot>`)}</div>
    `;
    }

    private _handleClick() {
        if (this.freeze) return;
        this.expand = !this.expand;
        this.dispatchEvent(
            new CustomEvent<{ expand: boolean }>("change", {
                detail: { expand: this.expand },
            }),
        );
    }
}
