import SideBySideRenderer from '../side-by-side-renderer';
import { LineType, DiffLine, DiffFile, LineMatchingType } from '../types';

describe('SideBySideRenderer', () => {
  describe('render empty diff', () => {
    it('should return an empty diff', () => {
      const sideBySideRenderer = new SideBySideRenderer({});
      const fileHtml = sideBySideRenderer.render([]);
      expect(fileHtml).toContain('No files to display');
      expect(fileHtml).toContain('d2h-wrapper');
    });
  });

  describe('render side-by-side diff', () => {
    it('should generate lines with the right prefixes', () => {
      const sideBySideRenderer = new SideBySideRenderer({});

      const file: DiffFile = {
        isGitDiff: true,
        addedLines: 1,
        deletedLines: 1,
        language: 'js',
        oldName: 'test.js',
        newName: 'test.js',
        isCombined: false,
        isNew: false,
        isDeleted: false,
        isCopy: false,
        isRename: false,
        unchangedPercentage: 50,
        changedPercentage: 50,
        blocks: [
          {
            header: '@@ -19,3 +19,3 @@',
            oldStartLine: 19,
            oldStartLine2: undefined,
            newStartLine: 19,
            lines: [
              {
                content: ' context',
                type: LineType.CONTEXT,
                oldNumber: 19,
                newNumber: 19,
              },
              {
                content: '-removed',
                type: LineType.DELETE,
                oldNumber: 20,
                newNumber: undefined,
              },
              {
                content: '+added',
                type: LineType.INSERT,
                oldNumber: undefined,
                newNumber: 20,
              },
            ],
          },
        ],
      };

      const fileHtml = sideBySideRenderer.render([file]);
      
      expect(fileHtml).toContain('d2h-wrapper');
      expect(fileHtml).toContain('test.js');
      expect(fileHtml).toContain('context');
      expect(fileHtml).toContain('removed');
      expect(fileHtml).toContain('added');
      expect(fileHtml).toContain('d2h-del');
      expect(fileHtml).toContain('d2h-ins');
      expect(fileHtml).toContain('d2h-cxt');
    });

    it('should handle files without changes', () => {
      const sideBySideRenderer = new SideBySideRenderer({});

      const file: DiffFile = {
        isGitDiff: false,
        addedLines: 0,
        deletedLines: 0,
        language: 'js',
        oldName: 'test.js',
        newName: 'test.js',
        isCombined: false,
        isNew: false,
        isDeleted: false,
        isCopy: false,
        isRename: false,
        unchangedPercentage: 100,
        changedPercentage: 0,
        blocks: [],
      };

      const fileHtml = sideBySideRenderer.render([file]);
      
      expect(fileHtml).toContain('d2h-wrapper');
      expect(fileHtml).toContain('test.js');
      expect(fileHtml).toContain('File without changes');
    });

    it('should work with line matching configuration', () => {
      const sideBySideRenderer = new SideBySideRenderer({
        matching: LineMatchingType.LINES,
      });

      const file: DiffFile = {
        isGitDiff: true,
        addedLines: 1,
        deletedLines: 1,
        language: 'js',
        oldName: 'test.js',
        newName: 'test.js',
        isCombined: false,
        isNew: false,
        isDeleted: false,
        isCopy: false,
        isRename: false,
        unchangedPercentage: 50,
        changedPercentage: 50,
        blocks: [
          {
            header: '@@ -1,1 +1,1 @@',
            oldStartLine: 1,
            oldStartLine2: undefined,
            newStartLine: 1,
            lines: [
              {
                content: '-old line',
                type: LineType.DELETE,
                oldNumber: 1,
                newNumber: undefined,
              },
              {
                content: '+new line',
                type: LineType.INSERT,
                oldNumber: undefined,
                newNumber: 1,
              },
            ],
          },
        ],
      };

      const fileHtml = sideBySideRenderer.render([file]);
      
      expect(fileHtml).toContain('d2h-wrapper');
      expect(fileHtml).toContain('test.js');
      expect(fileHtml).toContain('old line');
      expect(fileHtml).toContain('new line');
    });
  });
});