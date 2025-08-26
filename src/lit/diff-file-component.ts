import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import * as renderUtils from '../render-utils';
import { DiffFile, DiffLine, LineType } from '../types';
import './diff-line-component';

// Create a type for header lines that extends DiffLine
interface HeaderLine {
  type: LineType.CONTEXT;
  content: string;
  oldNumber: undefined;
  newNumber: undefined;
  isHeader?: boolean;
}

/**
 * Helper function to get file icon SVG based on file status
 */
export function getFileIconSvg(file: DiffFile): string {
  if (file.isRename || file.isCopy) {
    return '<svg aria-hidden="true" class="d2h-icon d2h-moved" height="16" title="renamed" version="1.1" viewBox="0 0 14 16" width="14"><path d="M6 9H3V7h3V4l5 4-5 4V9z m8-7v12c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h12c0.55 0 1 0.45 1 1z m-1 0H1v12h12V2z"></path></svg>';
  } else if (file.isNew) {
    return '<svg aria-hidden="true" class="d2h-icon d2h-added" height="16" title="added" version="1.1" viewBox="0 0 14 16" width="14"><path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM6 9H3V7h3V4h2v3h3v2H8v3H6V9z"></path></svg>';
  } else if (file.isDeleted) {
    return '<svg aria-hidden="true" class="d2h-icon d2h-deleted" height="16" title="removed" version="1.1" viewBox="0 0 14 16" width="14"><path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM11 9H3V7h8v2z"></path></svg>';
  } else {
    return '<svg aria-hidden="true" class="d2h-icon d2h-changed" height="16" title="modified" version="1.1" viewBox="0 0 14 16" width="14"><path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"></path></svg>';
  }
}

/**
 * Helper function to get file status tag based on file status
 */
export function getFileStatusTag(file: DiffFile): string {
  if (file.isRename || file.isCopy) {
    return '<span class="d2h-tag d2h-moved d2h-moved-tag">RENAMED</span>';
  } else if (file.isNew) {
    return '<span class="d2h-tag d2h-added d2h-added-tag">ADDED</span>';
  } else if (file.isDeleted) {
    return '<span class="d2h-tag d2h-deleted d2h-deleted-tag">DELETED</span>';
  } else {
    return '<span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span>';
  }
}

/**
 * A Lit component for rendering a single diff file with virtualization support
 */
@customElement('d2h-diff-file')
export class DiffFileComponent extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: 1px solid var(--d2h-border-color);
      border-radius: 3px;
      margin-bottom: 1em;
    }

    .d2h-file-header {
      background-color: var(--d2h-file-header-bg);
      border-bottom: 1px solid var(--d2h-border-color);
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
      padding: 5px 10px;
      font-family: 'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }

    .d2h-file-diff {
      overflow-y: hidden;
    }

    .d2h-code-wrapper {
      overflow-x: scroll;
      overflow-y: hidden;
    }

    .d2h-diff-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'Menlo', 'Consolas', monospace;
      font-size: 13px;
    }

    .d2h-diff-tbody {
      display: table-row-group;
    }

    .d2h-file-name-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5em;
    }

    .d2h-file-name {
      font-weight: 600;
    }

    .d2h-file-collapse {
      justify-content: flex-end;
      display: none;
      cursor: pointer;
      font-size: 12px;
      align-items: center;
      border-radius: 3px;
      border: 1px solid var(--d2h-border-color);
      padding: 4px 8px;
      margin-left: auto;
    }

    .d2h-file-collapse.d2h-selected {
      background-color: var(--d2h-selected-color);
    }

    .d2h-file-collapse-input {
      margin: 0 4px 0 0;
    }

    /* Virtual scroller container */
    .virtualized-container {
      height: 400px; /* Fixed height for virtualization */
      overflow: auto;
    }

    /* Show/hide virtualization based on file size */
    .small-file .virtualized-container {
      height: auto;
      overflow: visible;
    }

    .large-file .d2h-diff-table {
      display: block;
    }

    .large-file .d2h-diff-tbody {
      display: block;
    }
  `;

  @property({ type: Object }) file!: DiffFile;
  @property({ type: String }) filePath = '';
  @property({ type: Boolean }) enableVirtualization = true;
  @property({ type: Number }) virtualizationThreshold = 100; // Lines threshold for enabling virtualization
  @property({ type: Boolean }) isCombined = false;

  private get allLines(): (DiffLine | HeaderLine)[] {
    const lines: (DiffLine | HeaderLine)[] = [];

    this.file.blocks.forEach(block => {
      // Add block header as a special line
      lines.push({
        type: LineType.CONTEXT,
        content: block.header,
        oldNumber: undefined,
        newNumber: undefined,
        isHeader: true,
      } as HeaderLine);

      // Add all block lines
      lines.push(...block.lines);
    });

    return lines;
  }

  private get shouldUseVirtualization(): boolean {
    if (!this.enableVirtualization) return false;
    const totalLines = this.allLines.length;
    return totalLines > this.virtualizationThreshold;
  }

  private renderLine = (line: DiffLine | HeaderLine, _index: number) => {
    const isBlockHeader = 'isHeader' in line && line.isHeader;

    if (isBlockHeader) {
      return html`
        <tr>
          <td class="d2h-code-linenumber ${renderUtils.CSSLineClass.INFO}"></td>
          <td class="${renderUtils.CSSLineClass.INFO}">
            <div class="d2h-code-line">${line.content || html`&nbsp;`}</div>
          </td>
        </tr>
      `;
    }

    return html`
      <d2h-diff-line
        .line=${line as DiffLine}
        .isCombined=${this.isCombined}
        lineClass="d2h-code-linenumber"
        contentClass="d2h-code-line"
      >
      </d2h-diff-line>
    `;
  };

  private renderFileHeader() {
    return html`
      <div class="d2h-file-header">
        ${this.filePath
          ? unsafeHTML(this.filePath)
          : html`
              <span class="d2h-file-name-wrapper">
                ${unsafeHTML(getFileIconSvg(this.file))}
                <span class="d2h-file-name">${renderUtils.filenameDiff(this.file)}</span>
                ${unsafeHTML(getFileStatusTag(this.file))}
              </span>
              <label class="d2h-file-collapse">
                <input class="d2h-file-collapse-input" type="checkbox" name="viewed" value="viewed" />
                Viewed
              </label>
            `}
      </div>
    `;
  }

  private renderEmptyDiff() {
    return html`
      <tr>
        <td class="${renderUtils.CSSLineClass.INFO}">
          <div class="d2h-code-line">File without changes</div>
        </td>
      </tr>
    `;
  }

  render() {
    const lines = this.allLines;
    const useVirtualization = this.shouldUseVirtualization;

    if (lines.length === 0) {
      return html`
        <div id="${renderUtils.getHtmlId(this.file)}" class="d2h-file-wrapper" data-lang="${this.file.language}">
          ${this.renderFileHeader()}
          <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
              <table class="d2h-diff-table">
                <tbody class="d2h-diff-tbody">
                  ${this.renderEmptyDiff()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div
        id="${renderUtils.getHtmlId(this.file)}"
        class="d2h-file-wrapper ${classMap({
          'small-file': !useVirtualization,
          'large-file': useVirtualization,
        })}"
        data-lang="${this.file.language}"
      >
        ${this.renderFileHeader()}
        <div class="d2h-file-diff">
          <div class="d2h-code-wrapper">
            <table class="d2h-diff-table">
              <tbody class="d2h-diff-tbody">
                ${useVirtualization
                  ? html`
                      <div class="virtualized-container">
                        ${virtualize({
                          items: lines,
                          renderItem: this.renderLine,
                        })}
                      </div>
                    `
                  : html` ${lines.map((line, index) => this.renderLine(line, index))} `}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'd2h-diff-file': DiffFileComponent;
  }
}
