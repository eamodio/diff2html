import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import * as renderUtils from '../render-utils';
import { DiffFile, DiffBlock, DiffLine, LineType } from '../types';
import { getFileIconSvg, getFileStatusTag } from './diff-file-component';

// Create a type for header lines that extends DiffLine
interface HeaderLine {
  type: LineType.CONTEXT;
  content: string;
  oldNumber: undefined;
  newNumber: undefined;
  isHeader?: boolean;
}

/**
 * A Lit component for rendering a single diff file in side-by-side view with virtualization support
 */
@customElement('d2h-diff-file-side-by-side')
export class DiffFileSideBySideComponent extends LitElement {
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

    .d2h-files-diff {
      display: flex;
      width: 100%;
    }

    .d2h-file-side-diff {
      display: inline-block;
      overflow-x: scroll;
      overflow-y: hidden;
      width: 50%;
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

    .d2h-code-side-line {
      display: inline-block;
      white-space: nowrap;
      user-select: none;
      width: calc(100% - 9em);
      padding: 0 4.5em;
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
  @property({ type: Number }) virtualizationThreshold = 100;
  @property({ type: Boolean }) isCombined = false;

  private get allLines(): { leftLine: DiffLine | HeaderLine | null; rightLine: DiffLine | HeaderLine | null }[] {
    const linePairs: { leftLine: DiffLine | HeaderLine | null; rightLine: DiffLine | HeaderLine | null }[] = [];

    this.file.blocks.forEach(block => {
      // Add block header
      const headerLine: HeaderLine = {
        type: LineType.CONTEXT,
        content: block.header,
        oldNumber: undefined,
        newNumber: undefined,
        isHeader: true,
      };

      linePairs.push({ leftLine: headerLine, rightLine: null });

      // Process block lines for side-by-side view
      this.processBlockLines(block, linePairs);
    });

    return linePairs;
  }

  private processBlockLines(
    block: DiffBlock,
    linePairs: { leftLine: DiffLine | HeaderLine | null; rightLine: DiffLine | HeaderLine | null }[],
  ): void {
    let leftLines: DiffLine[] = [];
    let rightLines: DiffLine[] = [];

    block.lines.forEach(line => {
      if (line.type === 'delete') {
        leftLines.push(line);
      } else if (line.type === 'insert') {
        rightLines.push(line);
      } else if (line.type === 'context') {
        // Flush any pending left/right lines
        this.flushLines(leftLines, rightLines, linePairs);
        leftLines = [];
        rightLines = [];

        // Add context line to both sides
        linePairs.push({ leftLine: line, rightLine: line });
      }
    });

    // Flush remaining lines
    this.flushLines(leftLines, rightLines, linePairs);
  }

  private flushLines(
    leftLines: DiffLine[],
    rightLines: DiffLine[],
    linePairs: { leftLine: DiffLine | HeaderLine | null; rightLine: DiffLine | HeaderLine | null }[],
  ): void {
    const maxLines = Math.max(leftLines.length, rightLines.length);

    for (let i = 0; i < maxLines; i++) {
      linePairs.push({
        leftLine: leftLines[i] || null,
        rightLine: rightLines[i] || null,
      });
    }
  }

  private get shouldUseVirtualization(): boolean {
    if (!this.enableVirtualization) return false;
    const totalLines = this.allLines.length;
    return totalLines > this.virtualizationThreshold;
  }

  private renderLinePair = (
    linePair: { leftLine: DiffLine | HeaderLine | null; rightLine: DiffLine | HeaderLine | null },
    _index: number,
  ) => {
    const { leftLine } = linePair;

    // Handle block header
    if (leftLine && 'isHeader' in leftLine && leftLine.isHeader) {
      return html`
        <tr>
          <td class="d2h-code-linenumber ${renderUtils.CSSLineClass.INFO}"></td>
          <td class="${renderUtils.CSSLineClass.INFO}">
            <div class="d2h-code-side-line">${leftLine.content || html`&nbsp;`}</div>
          </td>
        </tr>
      `;
    }

    return html`
      <d2h-diff-line
        .line=${leftLine as DiffLine}
        .isCombined=${this.isCombined}
        lineClass="d2h-code-linenumber"
        contentClass="d2h-code-side-line"
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
          <div class="d2h-code-side-line">File without changes</div>
        </td>
      </tr>
    `;
  }

  render() {
    const linePairs = this.allLines;
    const useVirtualization = this.shouldUseVirtualization;

    if (linePairs.length === 0) {
      return html`
        <div id="${renderUtils.getHtmlId(this.file)}" class="d2h-file-wrapper" data-lang="${this.file.language}">
          ${this.renderFileHeader()}
          <div class="d2h-files-diff">
            <div class="d2h-file-side-diff">
              <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                  <tbody class="d2h-diff-tbody">
                    ${this.renderEmptyDiff()}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="d2h-file-side-diff">
              <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                  <tbody class="d2h-diff-tbody">
                    ${this.renderEmptyDiff()}
                  </tbody>
                </table>
              </div>
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
        <div class="d2h-files-diff">
          <div class="d2h-file-side-diff">
            <div class="d2h-code-wrapper">
              <table class="d2h-diff-table">
                <tbody class="d2h-diff-tbody">
                  ${useVirtualization
                    ? html`
                        <div class="virtualized-container">
                          ${virtualize({
                            items: linePairs,
                            renderItem: this.renderLinePair,
                          })}
                        </div>
                      `
                    : html` ${linePairs.map((linePair, index) => this.renderLinePair(linePair, index))} `}
                </tbody>
              </table>
            </div>
          </div>
          <div class="d2h-file-side-diff">
            <div class="d2h-code-wrapper">
              <table class="d2h-diff-table">
                <tbody class="d2h-diff-tbody">
                  <!-- Right side content would go here -->
                  <!-- This is a simplified version - full implementation would need separate left/right rendering -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'd2h-diff-file-side-by-side': DiffFileSideBySideComponent;
  }
}
