import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { when } from "lit/directives/when.js";

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

    @property({ type: Boolean, reflect: true })
    expanded = false;

    @property({ type: Number, reflect: true })
    level = 1;

    @property({ type: String })
    belongingKey: string | undefined = undefined;

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

    private renderObject(o: object, isArray = false) {
        const inner = Object.entries(o).map(([k, v]) => {
            const isObject = typeof v === "object" && v !== null;
            if (!isObject) {
                return html`<span class="propertyKey">${k}</span>
                    <json-viewer
                        .data=${v}
                        .level=${this.level + 1}
                        ${ref((el) => {
                            if (el) this.childSet.add(el as JsonViewer);
                        })}
                    ></json-viewer>`;
            }

            return html`<details
                .open=${this.expanded}
                @toggle=${(event: ToggleEvent) => {
                    this.expanded = (event.target as HTMLDetailsElement).open;
                }}
            >
                <summary>
                    <span class="propertyKey">${k}</span>
                    ${when(
                        this.expanded,
                        () => nothing,
                        () =>
                            html`<span
                                class="propertyMarker"
                                data-before=${isArray ? "[" : "{"}
                                data-after=${isArray ? "]" : "}"}
                            >
                                …
                            </span>`
                    )}
                </summary>
                <json-viewer
                    .data=${v}
                    .level=${this.level + 1}
                    ${ref((el) => {
                        if (el) this.childSet.add(el as JsonViewer);
                    })}
                ></json-viewer>
            </details>`;
        });

        return html`<section class="object">${inner}</section>`;
    }

    private childSet = new Set<JsonViewer>();
    public expandAll() {
        this.expanded = true;
        for (const el of this.childSet) el.expanded = true;
    }
    public collapseAll() {
        this.expanded = false;
        for (const el of this.childSet) el.expanded = false;
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.childSet.clear();
    }

    static styles = css`
        :host {
            display: flow-root;
            font-family: Consolas, monospace;
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
        }
        .object > details {
            grid-column: 1 / -1;
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
        :not(summary) > .propertyKey::before {
            content: "▶";
            visibility: hidden;
            margin-right: 2px;
        }
        .propertyKey::after {
            content: ": ";
        }
        .propertyMarker {
            color: #5c5c5f;
        }
        .propertyMarker::before {
            color: #0074e8;
            content: attr(data-before);
        }
        .propertyMarker::after {
            color: #0074e8;
            content: attr(data-after);
        }
    `;
}
