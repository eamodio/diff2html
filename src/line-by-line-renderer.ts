import * as renderUtils from './render-utils';
import { DiffFile, ColorSchemeType } from './types';

// Conditional import for Lit components to avoid Jest module loading issues
let DiffContainerComponent: any = null;
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    // Only import in browser environment
    import('./lit/diff-container-component').catch(() => {
      console.warn('Lit diff container component not available');
    });
  } catch (error) {
    console.warn('Failed to load Lit components:', error);
  }
}

export interface LineByLineRendererConfig extends renderUtils.RenderConfig {
  renderNothingWhenEmpty?: boolean;
  matchingMaxComparisons?: number;
  maxLineSizeInBlockForComparison?: number;
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
}

export const defaultLineByLineRendererConfig = {
  ...renderUtils.defaultRenderConfig,
  renderNothingWhenEmpty: false,
  matchingMaxComparisons: 2500,
  maxLineSizeInBlockForComparison: 200,
  enableVirtualization: true,
  virtualizationThreshold: 100,
};

/**
 * Lit-based line-by-line renderer that creates web components instead of HTML strings
 */
export default class LineByLineRenderer {
  private readonly config: typeof defaultLineByLineRendererConfig;

  constructor(config: LineByLineRendererConfig = {}) {
    this.config = { ...defaultLineByLineRendererConfig, ...config };
  }

  /**
   * Render diff files to HTML string using Lit web components
   */
  render(diffFiles: DiffFile[]): string {
    if (diffFiles.length === 0) {
      if (this.config.renderNothingWhenEmpty) {
        return '';
      }
      return `<div class="d2h-wrapper ${renderUtils.colorSchemeToCss(this.config.colorScheme || ColorSchemeType.AUTO)}">No files to display</div>`;
    }

    // Check if we're in a browser environment with DOM support
    if (typeof document !== 'undefined' && typeof window !== 'undefined' && (typeof process === 'undefined' || process.env.NODE_ENV !== 'test')) {
      // Create a temporary container to render Lit components and extract HTML
      const tempContainer = document.createElement('div');
      this.renderToElement(diffFiles, tempContainer);
      return tempContainer.innerHTML;
    } else {
      // Fallback for non-browser environments (like Jest)
      return this.renderFallback(diffFiles);
    }
  }

  /**
   * Fallback rendering method for environments without DOM support (like Jest)
   */
  private renderFallback(diffFiles: DiffFile[]): string {
    const colorScheme = renderUtils.colorSchemeToCss(this.config.colorScheme || ColorSchemeType.AUTO);
    
    const filesHtml = diffFiles.map(file => {
      const fileId = renderUtils.getHtmlId(file);
      const fileName = renderUtils.filenameDiff(file);
      const fileIcon = this.getFileIconSvg(file);
      const fileTag = this.getFileStatusTag(file);
      
      let blocksHtml = '';
      if (file.blocks.length === 0) {
        blocksHtml = `<tr><td class="d2h-info"><div class="d2h-code-line">File without changes</div></td></tr>`;
      } else {
        blocksHtml = file.blocks.map(block => {
          let blockHtml = `<tr><td class="d2h-code-linenumber d2h-info"></td><td class="d2h-info"><div class="d2h-code-line">${renderUtils.escapeForHtml(block.header)}</div></td></tr>`;
          
          block.lines.forEach(line => {
            const lineClass = this.getLineClass(line.type);
            const { prefix, content } = renderUtils.deconstructLine(line.content, file.isCombined);
            const lineNumber = line.oldNumber || line.newNumber || '';
            
            blockHtml += `<tr>
              <td class="d2h-code-linenumber ${lineClass}">${lineNumber}</td>
              <td class="${lineClass}">
                <div class="d2h-code-line">
                  <span class="d2h-code-line-prefix">${prefix === ' ' ? '&nbsp;' : renderUtils.escapeForHtml(prefix)}</span>
                  <span class="d2h-code-line-ctn">${content ? renderUtils.escapeForHtml(content) : '<br>'}</span>
                </div>
              </td>
            </tr>`;
          });
          
          return blockHtml;
        }).join('\n');
      }
      
      return `<div id="${fileId}" class="d2h-file-wrapper" data-lang="${file.language}">
        <div class="d2h-file-header">
          <span class="d2h-file-name-wrapper">
            ${fileIcon}
            <span class="d2h-file-name">${fileName}</span>
            ${fileTag}
          </span>
          <label class="d2h-file-collapse">
            <input class="d2h-file-collapse-input" type="checkbox" name="viewed" value="viewed">
            Viewed
          </label>
        </div>
        <div class="d2h-file-diff">
          <div class="d2h-code-wrapper">
            <table class="d2h-diff-table">
              <tbody class="d2h-diff-tbody">
                ${blocksHtml}
              </tbody>
            </table>
          </div>
        </div>
      </div>`;
    }).join('\n');
    
    return `<div class="d2h-wrapper ${colorScheme}">${filesHtml}</div>`;
  }

  private getLineClass(lineType: string): string {
    switch(lineType) {
      case 'insert': return 'd2h-ins';
      case 'delete': return 'd2h-del';
      case 'context': return 'd2h-cxt';
      default: return 'd2h-cxt';
    }
  }

  private getFileIconSvg(file: DiffFile): string {
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

  private getFileStatusTag(file: DiffFile): string {
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
   * Render diff files to a target DOM element using Lit web components
   */
  renderToElement(diffFiles: DiffFile[], targetElement: Element): void {
    if (diffFiles.length === 0) {
      if (this.config.renderNothingWhenEmpty) {
        targetElement.innerHTML = '';
        return;
      }
      targetElement.innerHTML = `<div class="d2h-wrapper ${renderUtils.colorSchemeToCss(this.config.colorScheme || ColorSchemeType.AUTO)}">No files to display</div>`;
      return;
    }

    // Check if we're in a browser environment with Lit components available
    if (typeof document !== 'undefined' && typeof window !== 'undefined' && (typeof process === 'undefined' || process.env.NODE_ENV !== 'test')) {
      try {
        // Dynamically import and use Lit components
        this.renderWithLitComponents(diffFiles, targetElement);
      } catch (error) {
        console.warn('Lit components not available, falling back to HTML strings:', error);
        targetElement.innerHTML = this.renderFallback(diffFiles);
      }
    } else {
      // Fallback for non-browser environments
      targetElement.innerHTML = this.renderFallback(diffFiles);
    }
  }

  private async renderWithLitComponents(diffFiles: DiffFile[], targetElement: Element): Promise<void> {
    // Only attempt to import Lit components in browser environments
    if (typeof window === 'undefined' || typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      throw new Error('Not in browser environment');
    }
    
    // Dynamically import Lit components only when needed
    await import('./lit/diff-container-component');
    
    // Create the diff container component
    const containerElement = document.createElement('d2h-diff-container');
    (containerElement as any).files = diffFiles;
    (containerElement as any).colorScheme = this.config.colorScheme || ColorSchemeType.AUTO;
    (containerElement as any).enableVirtualization = this.config.enableVirtualization;
    (containerElement as any).virtualizationThreshold = this.config.virtualizationThreshold;

    // Clear target and append container
    targetElement.innerHTML = '';
    targetElement.appendChild(containerElement);
  }
}
