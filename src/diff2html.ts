import * as DiffParser from './diff-parser';
import { FileListRenderer } from './file-list-renderer';
import LineByLineRenderer, { LineByLineRendererConfig, defaultLineByLineRendererConfig } from './line-by-line-renderer';
import SideBySideRenderer, { SideBySideRendererConfig, defaultSideBySideRendererConfig } from './side-by-side-renderer';
import LitLineByLineRenderer, {
  LitLineByLineRendererConfig,
  defaultLitLineByLineRendererConfig,
} from './lit/lit-line-by-line-renderer';
import LitSideBySideRenderer, {
  LitSideBySideRendererConfig,
  defaultLitSideBySideRendererConfig,
} from './lit/lit-side-by-side-renderer';
import { DiffFile, OutputFormatType } from './types';
import HoganJsUtils, { HoganJsUtilsConfig } from './hoganjs-utils';

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
      diffOutput = new LitLineByLineRenderer(config).render(diffJson);
      break;
    case 'side-by-side-lit':
      diffOutput = new LitSideBySideRenderer(config).render(diffJson);
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
      new LitLineByLineRenderer(config).renderToElement(diffJson, targetElement);
      break;
    case 'side-by-side-lit':
      new LitSideBySideRenderer(config).renderToElement(diffJson, targetElement);
      break;
    default:
      // Fall back to HTML string rendering for traditional formats
      targetElement.innerHTML = html(diffInput, configuration);
      break;
  }
}
