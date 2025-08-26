import * as renderUtils from '../render-utils';
import { DiffFile, ColorSchemeType } from '../types';
import './diff-container-component';
import './diff-file-side-by-side-component';

export interface LitSideBySideRendererConfig extends renderUtils.RenderConfig {
  renderNothingWhenEmpty?: boolean;
  matchingMaxComparisons?: number;
  maxLineSizeInBlockForComparison?: number;
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
}

export const defaultLitSideBySideRendererConfig = {
  ...renderUtils.defaultRenderConfig,
  renderNothingWhenEmpty: false,
  matchingMaxComparisons: 2500,
  maxLineSizeInBlockForComparison: 200,
  enableVirtualization: true,
  virtualizationThreshold: 100,
};

/**
 * Lit-based side-by-side renderer that creates web components instead of HTML strings
 */
export default class LitSideBySideRenderer {
  private readonly config: typeof defaultLitSideBySideRendererConfig;

  constructor(config: LitSideBySideRendererConfig = {}) {
    this.config = { ...defaultLitSideBySideRendererConfig, ...config };
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
      targetElement.innerHTML = '<div class="d2h-wrapper">No files to display</div>';
      return;
    }

    // Create a custom container for side-by-side rendering
    const containerElement = document.createElement('div');
    containerElement.className = `d2h-wrapper ${renderUtils.colorSchemeToCss(this.config.colorScheme || ColorSchemeType.AUTO)}`;

    // Render each file as a side-by-side component
    diffFiles.forEach(file => {
      const fileElement = document.createElement('d2h-diff-file-side-by-side');
      (fileElement as { file: DiffFile }).file = file;
      (fileElement as { enableVirtualization: boolean }).enableVirtualization =
        this.config.enableVirtualization || true;
      (fileElement as { virtualizationThreshold: number }).virtualizationThreshold =
        this.config.virtualizationThreshold || 100;
      containerElement.appendChild(fileElement);
    });

    // Clear target and append container
    targetElement.innerHTML = '';
    targetElement.appendChild(containerElement);
  }

  /**
   * Traditional render method that returns HTML string for compatibility
   */
  render(diffFiles: DiffFile[]): string {
    if (diffFiles.length === 0) {
      if (this.config.renderNothingWhenEmpty) {
        return '';
      }
      return this.generateEmptyDiff();
    }

    // Create a temporary container in memory
    const tempContainer = document.createElement('div');
    this.renderToElement(diffFiles, tempContainer);

    // Return the innerHTML
    return tempContainer.innerHTML;
  }

  generateEmptyDiff(): string {
    return `
      <div class="d2h-wrapper ${renderUtils.colorSchemeToCss(this.config.colorScheme || ColorSchemeType.AUTO)}">
        <div class="d2h-file-wrapper">
          <div class="d2h-files-diff">
            <div class="d2h-file-side-diff">
              <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                  <tbody class="d2h-diff-tbody">
                    <tr>
                      <td class="${renderUtils.CSSLineClass.INFO}">
                        <div class="d2h-code-side-line">
                          File without changes
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="d2h-file-side-diff">
              <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                  <tbody class="d2h-diff-tbody">
                    <tr>
                      <td class="${renderUtils.CSSLineClass.INFO}">
                        <div class="d2h-code-side-line">
                          &nbsp;
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
