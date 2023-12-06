import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { classMap } from "lit/directives/class-map.js";

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
                font-family: Consolas, monospace;
            }
            .toggle {
                display: flex;
                gap: 1rem;
                padding: 2px;
                cursor: pointer;
            }
            .toggle:hover {
                background-color: #f0f9fe;
            }
            .toggleActive {
                background-color: #0074e8;
                color: white;
            }
            .toggleActive::selection {
                background-color: white;
            }
            .toggleActive:hover {
                background-color: #0074e8;
            }
            .toggleFreeze {
                cursor: auto;
            }
            .marker {
                user-select: none;
                font-size: small;
                cursor: pointer;
            }
            .hideMarkder {
                opacity: 0;
                pointer-events: none;
            }
            .summary {
                cursor: auto;
            }
            .body {
                cursor: auto;
            }
        `,
    ];

    render() {
        return html`
            <div
                class="${classMap({ toggle: true, toggleActive: this.expand, toggleFreeze: this.freeze })}"
                .tabIndex=${-1}
                @click=${() => this._handleClick()}
            >
                <div
                    class="${classMap({
                        marker: true,
                        hideMarkder: this.freeze,
                    })}"
                >
                    ${when(
                        this.expand,
                        () => html`<div style="rotate: 90deg">▶</div>`,
                        () => html`<div>▶</div>`
                    )}
                </div>
                <div class="summary">
                    ${when(
                        this.expand,
                        () => html`<slot name="close"></slot>`,
                        () => html`<slot name="open"></slot>`
                    )}
                </div>
            </div>

            <div class="body">${this.expand ? html` <slot></slot> ` : html``}</div>
        `;
    }

    private _handleClick() {
        if (this.freeze) return;
        this.expand = !this.expand;
        this.dispatchEvent(new CustomEvent<{ expand: boolean }>("change", { detail: { expand: this.expand } }));
    }
}
