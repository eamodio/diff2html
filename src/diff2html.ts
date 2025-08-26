import * as DiffParser from './diff-parser';
import { FileListRenderer } from './file-list-renderer';
import LineByLineRenderer, { LineByLineRendererConfig, defaultLineByLineRendererConfig } from './line-by-line-renderer';
import SideBySideRenderer, { SideBySideRendererConfig, defaultSideBySideRendererConfig } from './side-by-side-renderer';
import { DiffFile, OutputFormatType } from './types';

export interface Diff2HtmlConfig
  extends DiffParser.DiffParserConfig,
    LineByLineRendererConfig,
    SideBySideRendererConfig {
  outputFormat?: OutputFormatType;
  drawFileList?: boolean;
}

export const defaultDiff2HtmlConfig = {
  ...defaultLineByLineRendererConfig,
  ...defaultSideBySideRendererConfig,
  outputFormat: OutputFormatType.LINE_BY_LINE,
  drawFileList: true,
};

export function parse(diffInput: string, configuration: Diff2HtmlConfig = {}): DiffFile[] {
  return DiffParser.parse(diffInput, { ...defaultDiff2HtmlConfig, ...configuration });
}

export function html(diffInput: string | DiffFile[], configuration: Diff2HtmlConfig = {}): string {
  const config = { ...defaultDiff2HtmlConfig, ...configuration };

  const diffJson = typeof diffInput === 'string' ? DiffParser.parse(diffInput, config) : diffInput;

  const { colorScheme } = config;
  const fileListRendererConfig = { colorScheme };

  const fileList = config.drawFileList ? new FileListRenderer(fileListRendererConfig).render(diffJson) : '';

  let diffOutput: string;

  switch (config.outputFormat) {
    case 'side-by-side':
      diffOutput = new SideBySideRenderer(config).render(diffJson);
      break;
    case 'line-by-line':
    default:
      diffOutput = new LineByLineRenderer(config).render(diffJson);
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

  // Use Lit renderers for direct DOM rendering for better performance
  switch (config.outputFormat) {
    case 'side-by-side':
      new SideBySideRenderer(config).renderToElement(diffJson, targetElement);
      break;
    case 'line-by-line':
    default:
      new LineByLineRenderer(config).renderToElement(diffJson, targetElement);
      break;
  }
}
