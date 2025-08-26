import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import * as renderUtils from '../render-utils';
import { DiffFile, ColorSchemeType } from '../types';
import './diff-file-component';

/**
 * A Lit component for rendering multiple diff files in a container with virtualization support
 */
@customElement('d2h-diff-container')
export class DiffContainerComponent extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .d2h-wrapper {
      text-align: left;
      color: var(--d2h-text-color);
      font-family: var(--d2h-font-family);
      font-size: var(--d2h-font-size);
      line-height: var(--d2h-line-height);
    }

    .d2h-wrapper.d2h-light-color-scheme {
      --d2h-text-color: #333;
      --d2h-bg-color: #fff;
      --d2h-border-color: #d1d5da;
      --d2h-ins-color: #e6ffed;
      --d2h-ins-border-color: #34d058;
      --d2h-del-color: #ffeef0;
      --d2h-del-border-color: #f85149;
      --d2h-cxt-color: inherit;
      --d2h-cxt-border-color: #e1e4e8;
      --d2h-info-color: #f1f8ff;
      --d2h-info-border-color: #c8e1ff;
      --d2h-file-header-bg: #fafbfc;
      --d2h-code-linenumber-bg: #fafbfc;
      --d2h-code-linenumber-color: #666;
      --d2h-selected-color: #0366d6;
      --d2h-ins-highlight-bg-color: rgba(52, 208, 88, 0.3);
      --d2h-del-highlight-bg-color: rgba(248, 81, 73, 0.3);
      --d2h-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      --d2h-font-size: 13px;
      --d2h-line-height: 1.4;
    }

    .d2h-wrapper.d2h-dark-color-scheme {
      --d2h-text-color: #e1e4e8;
      --d2h-bg-color: #0d1117;
      --d2h-border-color: #30363d;
      --d2h-ins-color: #0d4429;
      --d2h-ins-border-color: #238636;
      --d2h-del-color: #67060c;
      --d2h-del-border-color: #f85149;
      --d2h-cxt-color: inherit;
      --d2h-cxt-border-color: #21262d;
      --d2h-info-color: #0c2d6b;
      --d2h-info-border-color: #1f6feb;
      --d2h-file-header-bg: #161b22;
      --d2h-code-linenumber-bg: #161b22;
      --d2h-code-linenumber-color: #8b949e;
      --d2h-selected-color: #58a6ff;
      --d2h-ins-highlight-bg-color: rgba(35, 134, 54, 0.5);
      --d2h-del-highlight-bg-color: rgba(248, 81, 73, 0.5);
      --d2h-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      --d2h-font-size: 13px;
      --d2h-line-height: 1.4;
    }

    .d2h-wrapper.d2h-auto-color-scheme {
      color-scheme: light dark;
    }

    @media (prefers-color-scheme: light) {
      .d2h-wrapper.d2h-auto-color-scheme {
        --d2h-text-color: #333;
        --d2h-bg-color: #fff;
        --d2h-border-color: #d1d5da;
        --d2h-ins-color: #e6ffed;
        --d2h-ins-border-color: #34d058;
        --d2h-del-color: #ffeef0;
        --d2h-del-border-color: #f85149;
        --d2h-cxt-color: inherit;
        --d2h-cxt-border-color: #e1e4e8;
        --d2h-info-color: #f1f8ff;
        --d2h-info-border-color: #c8e1ff;
        --d2h-file-header-bg: #fafbfc;
        --d2h-code-linenumber-bg: #fafbfc;
        --d2h-code-linenumber-color: #666;
        --d2h-selected-color: #0366d6;
        --d2h-ins-highlight-bg-color: rgba(52, 208, 88, 0.3);
        --d2h-del-highlight-bg-color: rgba(248, 81, 73, 0.3);
      }
    }

    @media (prefers-color-scheme: dark) {
      .d2h-wrapper.d2h-auto-color-scheme {
        --d2h-text-color: #e1e4e8;
        --d2h-bg-color: #0d1117;
        --d2h-border-color: #30363d;
        --d2h-ins-color: #0d4429;
        --d2h-ins-border-color: #238636;
        --d2h-del-color: #67060c;
        --d2h-del-border-color: #f85149;
        --d2h-cxt-color: inherit;
        --d2h-cxt-border-color: #21262d;
        --d2h-info-color: #0c2d6b;
        --d2h-info-border-color: #1f6feb;
        --d2h-file-header-bg: #161b22;
        --d2h-code-linenumber-bg: #161b22;
        --d2h-code-linenumber-color: #8b949e;
        --d2h-selected-color: #58a6ff;
        --d2h-ins-highlight-bg-color: rgba(35, 134, 54, 0.5);
        --d2h-del-highlight-bg-color: rgba(248, 81, 73, 0.5);
      }
    }

    /* Virtual scroller container */
    .virtualized-container {
      height: 80vh; /* Use viewport height for better UX */
      overflow: auto;
    }

    /* Show/hide virtualization based on file count */
    .small-container .virtualized-container {
      height: auto;
      overflow: visible;
    }
  `;

  @property({ type: Array }) files: DiffFile[] = [];
  @property({ type: String }) colorScheme: ColorSchemeType = ColorSchemeType.AUTO;
  @property({ type: Boolean }) enableVirtualization = true;
  @property({ type: Number }) virtualizationThreshold = 10; // Files threshold for enabling virtualization

  private get shouldUseVirtualization(): boolean {
    if (!this.enableVirtualization) return false;
    return this.files.length > this.virtualizationThreshold;
  }

  private get colorSchemeClass(): string {
    return renderUtils.colorSchemeToCss(this.colorScheme);
  }

  private renderFile = (file: DiffFile, _index: number) => {
    return html` <d2h-diff-file .file=${file} .enableVirtualization=${this.enableVirtualization}> </d2h-diff-file> `;
  };

  render() {
    if (this.files.length === 0) {
      return html`
        <div class="d2h-wrapper ${this.colorSchemeClass}">
          <p>No files to display</p>
        </div>
      `;
    }

    const useVirtualization = this.shouldUseVirtualization;

    return html`
      <div
        class="d2h-wrapper ${classMap({
          [this.colorSchemeClass]: true,
          'small-container': !useVirtualization,
          'large-container': useVirtualization,
        })}"
      >
        ${useVirtualization
          ? html`
              <div class="virtualized-container">
                ${virtualize({
                  items: this.files,
                  renderItem: this.renderFile,
                })}
              </div>
            `
          : html` ${this.files.map((file, index) => this.renderFile(file, index))} `}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'd2h-diff-container': DiffContainerComponent;
  }
}
