import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { type JsonCollapse } from "./json-collapse";
import "./json-collapse";
import { ref } from "lit/directives/ref.js";

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

    render() {
        const data = this.data;
        if (Array.isArray(data)) return this.renderObject(data, true);
        if (data === null) return this.renderNull();
        switch (typeof data) {
            case "object":
                return this.renderObject(data);
            case "string":
                return this.renderString(data);
            case "number":
                return this.renderNumber(data);
            case "boolean":
                return this.renderBoolean(data);
            default:
                return this.renderUndefined();
        }
    }

    renderUndefined() {
        return html`<div class="undefined">undefined</div> `;
    }

    renderNull() {
        return html` <div class="null">null</div> `;
    }

    renderString(s: string) {
        const URLCanParse = (u: string) => {
            if (!!URL.canParse) return URL.canParse(u);
            try {
                new URL(u);
                return true;
            } catch {
                return false;
            }
        };
        return html`
            <span class="string"
                >"${when(
                    URLCanParse(s),
                    () => html`<a href="${s}" target="_blank">${s}</a>`,
                    () => html`${s}`
                )}"</span
            >
        `;
    }

    renderNumber(n: number) {
        return html` <span class="number">${n}</span> `;
    }

    renderBoolean(b: boolean) {
        return html` <span class="boolean">${b}</span> `;
    }

    private _collapseSet = new Set<JsonCollapse>();
    private _subViewer = new Set<JsonViewer>();

    disconnectedCallback() {
        super.disconnectedCallback();
        this._collapseSet.clear();
        this._subViewer.clear();
    }
    public expandAll() {
        this._collapseSet.forEach((e) => (e.expand = true));
        this._subViewer.forEach((e) => e.expandAll());
    }
    public collpaseAll() {
        this._collapseSet.forEach((e) => (e.expand = false));
        this._subViewer.forEach((e) => e.collpaseAll());
    }

    private renderObject(o: object, isArray = false) {
        const isObject = (x: unknown) => x !== null && typeof x === "object";

        return html`<div class="object">
            ${Object.entries(o).map(([k, v]) =>
                when(
                    isObject(v),
                    () => html`
                        <json-collapse
                            .hideMarkder=${false}
                            ${ref((e) => {
                                if (e) this._collapseSet.add(e as JsonCollapse);
                            })}
                        >
                            <span slot="open">
                                <span>${k}</span><span style="user-select: none">:&nbsp;</span>
                                <span style="user-select: none">
                                    ${when(
                                        isArray,
                                        () => html`[...]`,
                                        () => html`{...}`
                                    )}
                                </span>
                            </span>
                            <span slot="close">
                                <span>${k}</span><span style="user-select: none">:&nbsp;</span>
                            </span>
                            <json-viewer
                                .data=${v}
                                style="padding-left: 1rem"
                                ${ref((e) => {
                                    if (e) this._subViewer.add(e as JsonViewer);
                                })}
                            ></json-viewer>
                        </json-collapse>
                    `,
                    () => {
                        const content = html`${k}:
                            <json-viewer .data=${v} style="display: inline-block; vertical-align: top"></json-viewer> `;
                        return html` <json-collapse .freeze=${true}>
                            <div slot="open">${content}</div>
                            <div slot="close">${content}</div>
                        </json-collapse>`;
                    }
                )
            )}
        </div> `;
    }

    renderArray(a: Array<any>) {
        return html`<div class="array">${a}</div> `;
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
        .number {
            color: #058b00;
        }
        .boolean {
            color: #058b00;
        }
        .object {
            color: #0074e8;
        }
        a {
            color: currentColor;
        }
    `;
}
