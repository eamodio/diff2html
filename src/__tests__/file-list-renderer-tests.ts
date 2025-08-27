import { FileListRenderer } from '../file-list-renderer';
import { ColorSchemeType } from '../types';

describe('FileListRenderer', () => {
  describe('render', () => {
    it('should render a file list with basic functionality', () => {
      const fileListRenderer = new FileListRenderer();
      const files = [
        {
          isCombined: false,
          isGitDiff: false,
          blocks: [],
          addedLines: 12,
          deletedLines: 41,
          language: 'js',
          oldName: 'my/file/name.js',
          newName: 'my/file/name.js',
        },
      ] as any;
      const result = fileListRenderer.render(files);
      expect(result).toContain('my/file/name.js');
      expect(result).toContain('+12');
      expect(result).toContain('-41');
      expect(result).toContain('Files changed (1)');
    });

    it('should work for all kinds of files', () => {
      const fileListRenderer = new FileListRenderer();
      const files = [
        {
          isCombined: false,
          isGitDiff: false,
          blocks: [],
          addedLines: 12,
          deletedLines: 41,
          language: 'js',
          oldName: 'my/file/name.js',
          newName: 'my/file/name.js',
        },
        {
          isCombined: false,
          isGitDiff: false,
          blocks: [],
          addedLines: 12,
          deletedLines: 41,
          language: 'js',
          oldName: 'my/file/name1.js',
          newName: 'my/file/name2.js',
        },
        {
          isCombined: false,
          isGitDiff: false,
          blocks: [],
          addedLines: 12,
          deletedLines: 0,
          language: 'js',
          oldName: 'dev/null',
          newName: 'my/file/name.js',
          isNew: true,
        },
        {
          isCombined: false,
          isGitDiff: false,
          blocks: [],
          addedLines: 0,
          deletedLines: 41,
          language: 'js',
          oldName: 'my/file/name.js',
          newName: 'dev/null',
          isDeleted: true,
        },
      ] as any;
      
      const fileHtml = fileListRenderer.render(files);
      expect(fileHtml).toContain('my/file/name.js');
      expect(fileHtml).toContain('my/file/{name1.js → name2.js}');
      expect(fileHtml).toContain('Files changed (4)');
      expect(fileHtml).toContain('d2h-icon d2h-changed');
      expect(fileHtml).toContain('d2h-icon d2h-moved');
      expect(fileHtml).toContain('d2h-icon d2h-added');
      expect(fileHtml).toContain('d2h-icon d2h-deleted');
    });

    describe('with dark colorScheme', () => {
      it('should include dark colorScheme', () => {
        const fileListRenderer = new FileListRenderer({
          colorScheme: ColorSchemeType.DARK,
        });

        const files = [
          {
            isCombined: false,
            isGitDiff: false,
            blocks: [],
            addedLines: 12,
            deletedLines: 41,
            language: 'js',
            oldName: 'my/file/name.js',
            newName: 'my/file/name.js',
          },
        ] as any;
        
        const fileHtml = fileListRenderer.render(files);
        expect(fileHtml).toContain('d2h-dark-color-scheme');
        expect(fileHtml).toContain('my/file/name.js');
      });
    });

    describe('with auto colorScheme', () => {
      it('should include auto colorScheme', () => {
        const fileListRenderer = new FileListRenderer({
          colorScheme: ColorSchemeType.AUTO,
        });

        const files = [
          {
            isCombined: false,
            isGitDiff: false,
            blocks: [],
            addedLines: 12,
            deletedLines: 41,
            language: 'js',
            oldName: 'my/file/name.js',
            newName: 'my/file/name.js',
          },
        ] as any;
        
        const fileHtml = fileListRenderer.render(files);
        expect(fileHtml).toContain('d2h-auto-color-scheme');
        expect(fileHtml).toContain('my/file/name.js');
      });
    });
  });
});