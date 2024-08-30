import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { classMap } from "lit/directives/class-map.js";

declare global {
    interface HTMLElementTagNameMap {
        "json-viewer": JsonViewer;
    }
}

/**
 * @property data - Any javascript value that can stringify to JSON
 */
@customElement("json-viewer")
export class JsonViewer extends LitElement {
    @property({
        converter: {
            fromAttribute: (value) => (value ? JSON.parse(value) : undefined),
            toAttribute: (value) => JSON.stringify(value),
        },
    })
    data: any = undefined;

    @state() private level = 1;

    render() {
        this.style.paddingLeft = `${this.level === 1 ? 0 : 20}px`;

        const data = this.data;
        if (data === null) return this.renderNull();
        if (data === undefined) return this.renderUndefined();
        if (Array.isArray(data)) return this.renderObject(data, true);
        const type = typeof data;
        switch (type) {
            case "object":
                return this.renderObject(data);
            case "string":
                return this.renderString(data);
            case "number":
                return this.renderNumber(data);
            case "boolean":
                return this.renderBoolean(data);
        }
    }

    private renderUndefined() {
        return html`<span class="undefined">undefined</span>`;
    }

    private renderNull() {
        return html`<span class="null">null</span>`;
    }

    private renderString(s: string) {
        const URLCanParse = (u: string) => {
            if (URL.canParse) return URL.canParse(u);
            try {
                new URL(u);
                return true;
            } catch {
                return false;
            }
        };
        return html`
            <span class="string"
                >${when(
                    URLCanParse(s),
                    () => html`<a href="${s}" target="_blank">${s}</a>`,
                    () => html`${s}`
                )}</span
            >
        `;
    }

    private renderNumber(n: number) {
        return html`<span class="number">${n}</span>`;
    }

    private renderBoolean(b: boolean) {
        return html`<span class="boolean">${b}</span>`;
    }

    @state() private expandedPropertyKeys = new Set<PropertyKey>();

    private renderObject(o: object, isArray = false) {
        const inner = Object.entries(o).map(([k, v]) => {
            const isObject = typeof v === "object" && v !== null;
            if (!isObject) {
                return html`<span class="propertyKey">${k}</span>
                    <json-viewer .data=${v} .level=${this.level + 1}></json-viewer>`;
            }

            /** is current key should be expanded */
            const expanded = this.expandedPropertyKeys.has(k);
            return html`<span
                    class=${classMap({ propertyKey: true, expanded, isObject })}
                    @click=${() => {
                        if (expanded) this.expandedPropertyKeys.delete(k);
                        else this.expandedPropertyKeys.add(k);
                        this.requestUpdate();
                    }}
                    >${k}</span
                >

                ${when(
                    expanded,
                    () => html`<json-viewer
                        .data=${v}
                        .level=${this.level + 1}
                        class=${classMap({ isObject })}
                        style=${expanded ? "grid-column: 1 / -1;" : ""}
                    ></json-viewer>`,
                    () =>
                        html`<span
                            class="propertyObject"
                            @click=${() => {
                                this.expandedPropertyKeys.add(k);
                                this.requestUpdate();
                            }}
                        >
                            <span class="propertyObjectLeft">${isArray ? "[" : "{"}</span
                            ><span class="propertyObjectMiddle">…</span
                            ><span class="propertyObjectRight">${isArray ? "]" : "}"}</span>
                        </span>`
                )}`;
        });

        return html`<section class="object">${inner}</section>`;
    }

    static styles = css`
        :host {
            display: flow-root;
            font-family: Consolas, monospace;
            font-size: 12px;
        }
        .string {
            white-space: pre-wrap;
            overflow-x: auto;
            color: #dd00a9;
        }
        .string::before,
        .string::after {
            content: '"';
        }
        .number {
            color: #058b00;
        }
        .boolean {
            color: #058b00;
        }
        .object {
            color: #0074e8;
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 2px;
        }
        .null,
        .undefined {
            color: #737373;
        }
        a {
            color: currentColor;
        }
        .propertyKey {
            user-select: all;
        }
        .propertyKey::before {
            content: "▶";
            visibility: hidden;
            margin-right: 8px;
            font-size: 8px;
        }
        .propertyKey::after {
            content: ": ";
        }
        .propertyObject {
            font-size: 10px;
            padding-left: 20px;
        }
        .propertyObjectMiddle {
            color: #5c5c5f;
        }

        .propertyKey.isObject::before {
            visibility: visible;
        }
        .propertyKey.expanded::before {
            content: "▼";
            font-size: 11px;
        }
        :is(.propertyKey, .propertyKey ~ :not(.isObject)):hover {
            background: #f0f9fe;
        }
    `;
}
