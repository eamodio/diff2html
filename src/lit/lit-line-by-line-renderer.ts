import * as renderUtils from '../render-utils';
import { DiffFile, ColorSchemeType } from '../types';
import './diff-container-component';

export interface LitLineByLineRendererConfig extends renderUtils.RenderConfig {
  renderNothingWhenEmpty?: boolean;
  matchingMaxComparisons?: number;
  maxLineSizeInBlockForComparison?: number;
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
}

export const defaultLitLineByLineRendererConfig = {
  ...renderUtils.defaultRenderConfig,
  renderNothingWhenEmpty: false,
  matchingMaxComparisons: 2500,
  maxLineSizeInBlockForComparison: 200,
  enableVirtualization: true,
  virtualizationThreshold: 100, // Enable virtualization for files with > 100 lines
};

/**
 * Lit-based line-by-line renderer that creates web components instead of HTML strings
 */
export default class LitLineByLineRenderer {
  private readonly config: typeof defaultLitLineByLineRendererConfig;

  constructor(config: LitLineByLineRendererConfig = {}) {
    this.config = { ...defaultLitLineByLineRendererConfig, ...config };
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

    // Create the diff container component
    const containerElement = document.createElement('d2h-diff-container');
    (containerElement as { files: DiffFile[] }).files = diffFiles;
    (containerElement as { colorScheme: ColorSchemeType }).colorScheme =
      this.config.colorScheme || ColorSchemeType.AUTO;
    (containerElement as { enableVirtualization: boolean }).enableVirtualization =
      this.config.enableVirtualization || true;
    (containerElement as { virtualizationThreshold: number }).virtualizationThreshold =
      this.config.virtualizationThreshold || 100;

    // Clear target and append container
    targetElement.innerHTML = '';
    targetElement.appendChild(containerElement);
  }

  /**
   * Traditional render method that returns HTML string for compatibility
   * This method creates components in a temporary container and extracts HTML
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
          <div class="d2h-file-diff">
            <div class="d2h-code-wrapper">
              <table class="d2h-diff-table">
                <tbody class="d2h-diff-tbody">
                  <tr>
                    <td class="${renderUtils.CSSLineClass.INFO}">
                      <div class="d2h-code-line">
                        File without changes
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
