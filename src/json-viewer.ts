import { LitElement, type TemplateResult, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { when } from "lit/directives/when.js";
import type { JsonCollapse } from "./json-collapse";
import "./json-collapse";

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

    private renderUndefined() {
        return html`<div class="undefined">undefined</div>`;
    }

    private renderNull() {
        return html`<div class="null">null</div>`;
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
        return html`<span class="string"
      >${this.renderQuote(
          when(
              URLCanParse(s),
              () => html`<a href="${s}" target="_blank">${s}</a>`,
              () => html`${s}`,
          ),
      )}</span
    >`;
    }

    private renderQuote(x: string | TemplateResult) {
        return html`<span class="quote"></span>${x}<span class="quote"></span>`;
    }

    private renderNumber(n: number) {
        return html`<span class="number">${n}</span>`;
    }

    private renderBoolean(b: boolean) {
        return html`<span class="boolean">${b}</span>`;
    }

    private _collapseSet = new Set<JsonCollapse>();
    private _subViewer = new Set<JsonViewer>();

    disconnectedCallback() {
        super.disconnectedCallback();
        this._collapseSet.clear();
        this._subViewer.clear();
    }
    public expandAll() {
        for (const el of this._collapseSet) el.expand = true;
        for (const el of this._subViewer) el.expandAll();
    }
    public collapseAll() {
        for (const el of this._collapseSet) el.expand = false;
        for (const el of this._subViewer) el.collapseAll();
    }

    private renderObject(o: object, isArray = false) {
        const isObject = (x: unknown) => x !== null && typeof x === "object";
        const entries = Object.entries(o);
        const openBracket = isArray ? "[" : "{";
        const closeBracket = isArray ? "]" : "}";
        const isEmpty = entries.length === 0;

        if (isEmpty) {
            return html`<span class="object">${openBracket}${closeBracket}</span>`;
        }

        return html`<div class="object">
      <div class="objectContent">
        <span class="bracket">${openBracket}</span>
        <div class="objectBody">
          ${entries.map(([k, v], index) => {
              const isLast = index === entries.length - 1;
              return when(
                  isObject(v),
                  () => html`<json-collapse
                .hideMarker=${false}
                ${ref((e) => {
                    if (e) this._collapseSet.add(e as JsonCollapse);
                })}
              >
                <span slot="open">
                  ${this.renderPropertyKey(k, isArray)}
                  <span class="propertyKeyValuePlaceholder"
                    >${when(
                        Array.isArray(v),
                        () => html`Array(${v.length})`,
                        () => html`Object{…}`,
                    )}</span
                  >${when(!isLast, () => html`<span class="comma">,</span>`)}
                </span>
                <span slot="close"> ${this.renderPropertyKey(k, isArray)} </span>
                <json-viewer
                  .data=${v}
                  style="padding-left: 1rem;"
                  ${ref((e) => {
                      if (e) this._subViewer.add(e as JsonViewer);
                  })}
                ></json-viewer>
              </json-collapse>`,
                  () => {
                      const content = html`<span class="propertyLine">
                  ${this.renderPropertyKey(k, isArray)}
                  <json-viewer .data=${v} style="display: inline;"></json-viewer>${when(
                      !isLast,
                      () => html`<span class="comma">,</span>`,
                  )}
                </span>`;

                      return html`<json-collapse .freeze=${true}>
                  <div slot="open">${content}</div>
                  <div slot="close">${content}</div>
                </json-collapse>`;
                  },
              );
          })}
        </div>
        <span class="bracket">${closeBracket}</span>
      </div>
    </div> `;
    }

    private renderPropertyKey(k: string, isArray = false) {
        if (isArray) {
            return html`<span class="arrayIndex">${k}</span>`;
        }
        return html`<span class="propertyKey">${k}</span>`;
    }

    static styles = css`
    :host {
      display: flow-root;
      font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace;
      font-size: 13px;
      line-height: 1.6;
    }
    a {
      color: currentColor;
    }
    .arrayIndex {
      user-select: all;
    }
    .arrayIndex::after {
      content: ": ";
      user-select: none;
    }
    .boolean {
      color: #058b00;
    }
    .bracket {
      user-select: all;
    }
    .null,
    .undefined {
      color: #737373;
    }
    .number {
      color: #058b00;
    }
    .object {
      color: #0074e8;
    }
    .objectBody {
      margin-left: 1rem;
    }
    .objectContent {
      display: block;
    }
    .propertyKey {
      user-select: all;
    }
    .propertyKey::after {
      content: ": ";
      user-select: none;
    }
    .propertyKeyValuePlaceholder {
      font-size: 12px;
      user-select: none;
    }
    .propertyLine {
      display: block;
      line-height: inherit;
      margin: 0;
    }
    .propertyLine json-viewer {
      display: inline;
    }
    .quote::after {
      content: '"';
      user-select: none;
    }
    .string {
      color: #dd00a9;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    .comma {
      margin-left: 1px;
    }
  `;
}
