import * as renderUtils from './render-utils';
import { ColorSchemeType, DiffFile } from './types';

export interface FileListRendererConfig {
  colorScheme?: ColorSchemeType;
}

export const defaultFileListRendererConfig = {
  colorScheme: renderUtils.defaultRenderConfig.colorScheme,
};

export class FileListRenderer {
  private readonly config: typeof defaultFileListRendererConfig;

  constructor(config: FileListRendererConfig = {}) {
    this.config = { ...defaultFileListRendererConfig, ...config };
  }

  render(diffFiles: DiffFile[]): string {
    const files = diffFiles
      .map(file => this.renderFileLine(file))
      .join('\n');

    return this.renderWrapper(diffFiles.length, files);
  }

  private renderFileLine(file: DiffFile): string {
    const fileIcon = this.getFileIconSvg(file);
    const fileName = renderUtils.filenameDiff(file);
    const fileHtmlId = renderUtils.getHtmlId(file);
    const deletedLines = '-' + file.deletedLines;
    const addedLines = '+' + file.addedLines;

    return `<li class="d2h-file-list-line">
    <span class="d2h-file-name-wrapper">
      ${fileIcon}
      <a href="#${fileHtmlId}" class="d2h-file-name">${fileName}</a>
      <span class="d2h-file-stats">
          <span class="d2h-lines-added">${addedLines}</span>
          <span class="d2h-lines-deleted">${deletedLines}</span>
      </span>
    </span>
</li>`;
  }

  private renderWrapper(filesNumber: number, files: string): string {
    const colorScheme = renderUtils.colorSchemeToCss(this.config.colorScheme);
    
    return `<div class="d2h-file-list-wrapper ${colorScheme}">
    <div class="d2h-file-list-header">
        <span class="d2h-file-list-title">Files changed (${filesNumber})</span>
        <a class="d2h-file-switch d2h-hide">hide</a>
        <a class="d2h-file-switch d2h-show">show</a>
    </div>
    <ol class="d2h-file-list">
    ${files}
    </ol>
</div>`;
  }

  private getFileIconSvg(file: DiffFile): string {
    if (file.isRename || file.isCopy || (!file.isNew && !file.isDeleted && file.newName !== file.oldName)) {
      return '<svg aria-hidden="true" class="d2h-icon d2h-moved" height="16" title="renamed" version="1.1" viewBox="0 0 14 16" width="14"><path d="M6 9H3V7h3V4l5 4-5 4V9z m8-7v12c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h12c0.55 0 1 0.45 1 1z m-1 0H1v12h12V2z"></path></svg>';
    } else if (file.isNew) {
      return '<svg aria-hidden="true" class="d2h-icon d2h-added" height="16" title="added" version="1.1" viewBox="0 0 14 16" width="14"><path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM6 9H3V7h3V4h2v3h3v2H8v3H6V9z"></path></svg>';
    } else if (file.isDeleted) {
      return '<svg aria-hidden="true" class="d2h-icon d2h-deleted" height="16" title="removed" version="1.1" viewBox="0 0 14 16" width="14"><path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM11 9H3V7h8v2z"></path></svg>';
    } else {
      return '<svg aria-hidden="true" class="d2h-icon d2h-changed" height="16" title="modified" version="1.1" viewBox="0 0 14 16" width="14"><path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"></path></svg>';
    }
  }
}
