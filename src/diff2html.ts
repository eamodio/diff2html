import * as DiffParser from './diff-parser';
import { FileListRenderer } from './file-list-renderer';
import LineByLineRenderer, { LineByLineRendererConfig, defaultLineByLineRendererConfig } from './line-by-line-renderer';
import SideBySideRenderer, { SideBySideRendererConfig, defaultSideBySideRendererConfig } from './side-by-side-renderer';
import { DiffFile, OutputFormatType } from './types';
import HoganJsUtils, { HoganJsUtilsConfig } from './hoganjs-utils';

// Conditional import for Lit renderers to avoid Jest module loading issues
let LitLineByLineRenderer: typeof import('./lit/lit-line-by-line-renderer').default | null = null;
let LitSideBySideRenderer: typeof import('./lit/lit-side-by-side-renderer').default | null = null;
let defaultLitLineByLineRendererConfig: Partial<LitLineByLineRendererConfig> = {};
let defaultLitSideBySideRendererConfig: Partial<LitSideBySideRendererConfig> = {};

// Only import Lit components in browser/non-test environments
if (typeof window !== 'undefined' || typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const litModule = require('./lit/lit-line-by-line-renderer');
    LitLineByLineRenderer = litModule.default;
    defaultLitLineByLineRendererConfig = litModule.defaultLitLineByLineRendererConfig;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const litSideBySideModule = require('./lit/lit-side-by-side-renderer');
    LitSideBySideRenderer = litSideBySideModule.default;
    defaultLitSideBySideRendererConfig = litSideBySideModule.defaultLitSideBySideRendererConfig;
  } catch (error: unknown) {
    // Fallback for environments where Lit is not available
    console.warn('Lit Web Components not available:', (error as Error).message);
  }
}

// Types for Lit renderer configs
export interface LitLineByLineRendererConfig extends LineByLineRendererConfig {
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
}

export interface LitSideBySideRendererConfig extends SideBySideRendererConfig {
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
}

export interface Diff2HtmlConfig
  extends DiffParser.DiffParserConfig,
    LineByLineRendererConfig,
    SideBySideRendererConfig,
    LitLineByLineRendererConfig,
    LitSideBySideRendererConfig,
    HoganJsUtilsConfig {
  outputFormat?: OutputFormatType;
  drawFileList?: boolean;
}

export const defaultDiff2HtmlConfig = {
  ...defaultLineByLineRendererConfig,
  ...defaultSideBySideRendererConfig,
  ...defaultLitLineByLineRendererConfig,
  ...defaultLitSideBySideRendererConfig,
  outputFormat: OutputFormatType.LINE_BY_LINE,
  drawFileList: true,
};

export function parse(diffInput: string, configuration: Diff2HtmlConfig = {}): DiffFile[] {
  return DiffParser.parse(diffInput, { ...defaultDiff2HtmlConfig, ...configuration });
}

export function html(diffInput: string | DiffFile[], configuration: Diff2HtmlConfig = {}): string {
  const config = { ...defaultDiff2HtmlConfig, ...configuration };

  const diffJson = typeof diffInput === 'string' ? DiffParser.parse(diffInput, config) : diffInput;

  const hoganUtils = new HoganJsUtils(config);

  const { colorScheme } = config;
  const fileListRendererConfig = { colorScheme };

  const fileList = config.drawFileList ? new FileListRenderer(hoganUtils, fileListRendererConfig).render(diffJson) : '';

  let diffOutput: string;

  switch (config.outputFormat) {
    case 'line-by-line-lit':
      if (LitLineByLineRenderer) {
        diffOutput = new LitLineByLineRenderer(config).render(diffJson);
      } else {
        console.warn('Lit Line-by-Line renderer not available, falling back to traditional renderer');
        diffOutput = new LineByLineRenderer(hoganUtils, config).render(diffJson);
      }
      break;
    case 'side-by-side-lit':
      if (LitSideBySideRenderer) {
        diffOutput = new LitSideBySideRenderer(config).render(diffJson);
      } else {
        console.warn('Lit Side-by-Side renderer not available, falling back to traditional renderer');
        diffOutput = new SideBySideRenderer(hoganUtils, config).render(diffJson);
      }
      break;
    case 'side-by-side':
      diffOutput = new SideBySideRenderer(hoganUtils, config).render(diffJson);
      break;
    case 'line-by-line':
    default:
      diffOutput = new LineByLineRenderer(hoganUtils, config).render(diffJson);
      break;
  }

  return fileList + diffOutput;
}

/**
 * Render diff directly to a DOM element using Lit Web Components (for enhanced performance with virtualization)
 * This method is preferred for large diffs as it enables virtualization and avoids HTML string manipulation
 */
export function renderToElement(
  diffInput: string | DiffFile[],
  targetElement: Element,
  configuration: Diff2HtmlConfig = {},
): void {
  const config = { ...defaultDiff2HtmlConfig, ...configuration };
  const diffJson = typeof diffInput === 'string' ? DiffParser.parse(diffInput, config) : diffInput;

  // For Lit renderers, use direct DOM rendering for better performance
  switch (config.outputFormat) {
    case 'line-by-line-lit':
      if (LitLineByLineRenderer) {
        new LitLineByLineRenderer(config).renderToElement(diffJson, targetElement);
      } else {
        console.warn('Lit Line-by-Line renderer not available, falling back to HTML string rendering');
        targetElement.innerHTML = html(diffInput, configuration);
      }
      break;
    case 'side-by-side-lit':
      if (LitSideBySideRenderer) {
        new LitSideBySideRenderer(config).renderToElement(diffJson, targetElement);
      } else {
        console.warn('Lit Side-by-Side renderer not available, falling back to HTML string rendering');
        targetElement.innerHTML = html(diffInput, configuration);
      }
      break;
    default:
      // Fall back to HTML string rendering for traditional formats
      targetElement.innerHTML = html(diffInput, configuration);
      break;
  }
}
