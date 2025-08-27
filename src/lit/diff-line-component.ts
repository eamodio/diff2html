import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import * as renderUtils from '../render-utils';
import type { DiffLine as DiffLineType } from '../types';

/**
 * A Lit component for rendering a single diff line
 */
@customElement('d2h-diff-line')
export class DiffLineComponent extends LitElement {
  static styles = css`
    :host {
      display: table-row;
    }

    .d2h-code-linenumber {
      box-sizing: border-box;
      position: relative;
      min-width: 3.5em;
      padding-right: 0.5em;
      padding-left: 0.5em;
      text-align: right;
      vertical-align: top;
      white-space: nowrap;
      background-color: var(--d2h-code-linenumber-bg);
      border-color: var(--d2h-border-color);
      border-right-width: 1px;
      border-right-style: solid;
      color: var(--d2h-code-linenumber-color);
      cursor: pointer;
      user-select: none;
    }

    .d2h-code-line {
      display: inline-block;
      white-space: nowrap;
      user-select: none;
      width: calc(100% - 16em);
      padding: 0 8em;
    }

    .d2h-code-line-ctn {
      display: inline-block;
      background: none;
      padding: 0;
      word-wrap: normal;
      white-space: pre;
      user-select: text;
      width: 100%;
      vertical-align: middle;
    }

    .d2h-code-line-prefix {
      display: inline;
      background: none;
      padding: 0;
      word-wrap: normal;
      white-space: pre;
    }

    /* Line type styles */
    .d2h-ins {
      background-color: var(--d2h-ins-color);
      border-color: var(--d2h-ins-border-color);
    }

    .d2h-del {
      background-color: var(--d2h-del-color);
      border-color: var(--d2h-del-border-color);
    }

    .d2h-cxt {
      background-color: var(--d2h-cxt-color);
      border-color: var(--d2h-cxt-border-color);
    }

    .d2h-info {
      background-color: var(--d2h-info-color);
      border-color: var(--d2h-info-border-color);
    }

    /* Highlight styles */
    .d2h-code-line del,
    .d2h-code-line ins {
      display: inline-block;
      margin-top: -1px;
      text-decoration: none;
      border-radius: 0.2em;
    }

    .d2h-code-line del {
      background-color: var(--d2h-del-highlight-bg-color);
    }

    .d2h-code-line ins {
      background-color: var(--d2h-ins-highlight-bg-color);
    }
  `;

  @property({ type: Object }) line?: DiffLineType;
  @property({ type: String }) lineClass = 'd2h-code-linenumber';
  @property({ type: String }) contentClass = 'd2h-code-line';
  @property({ type: String }) prefix = '';
  @property({ type: String }) content = '';
  @property({ type: String }) lineNumber = '';
  @property({ type: String }) cssLineClass = '';
  @property({ type: Boolean }) isCombined = false;

  private get lineTypeClass(): string {
    if (this.line) {
      return renderUtils.toCSSClass(this.line.type);
    }
    return this.cssLineClass || renderUtils.CSSLineClass.CONTEXT;
  }

  private get lineNumberDisplay(): string {
    if (this.lineNumber) {
      return this.lineNumber;
    }
    if (this.line) {
      // For line-by-line view, show both old and new line numbers
      const oldNum = this.line.oldNumber || '';
      const newNum = this.line.newNumber || '';
      return `<div class="line-num1">${oldNum}</div><div class="line-num2">${newNum}</div>`;
    }
    return '';
  }

  private get prefixContent(): string {
    if (this.prefix) {
      return this.prefix;
    }
    if (this.line) {
      const { prefix } = renderUtils.deconstructLine(this.line.content, this.isCombined);
      return prefix;
    }
    return '';
  }

  private get lineContent(): string {
    if (this.content) {
      return this.content;
    }
    if (this.line) {
      const { content } = renderUtils.deconstructLine(this.line.content, this.isCombined);
      return content;
    }
    return '';
  }

  render() {
    const lineTypeClass = this.lineTypeClass;
    const prefixContent = this.prefixContent;
    const lineContent = this.lineContent;

    return html`
      <td
        class="${classMap({
          [this.lineClass]: true,
          [lineTypeClass]: true,
        })}"
      >
        ${this.lineNumber ? html`${this.lineNumber}` : html`${unsafeHTML(this.lineNumberDisplay)}`}
      </td>
      <td class="${lineTypeClass}">
        <div class="${this.contentClass}">
          <span class="d2h-code-line-prefix"> ${prefixContent || html`&nbsp;`} </span>
          <span class="d2h-code-line-ctn"> ${lineContent ? unsafeHTML(lineContent) : html`<br />`} </span>
        </div>
      </td>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'd2h-diff-line': DiffLineComponent;
  }
}
