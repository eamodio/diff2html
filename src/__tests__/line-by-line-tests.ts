import LineByLineRenderer from '../line-by-line-renderer';
import { LineType, DiffFile, LineMatchingType } from '../types';

describe('LineByLineRenderer', () => {
  describe('render empty diff', () => {
    it('should return an empty diff', () => {
      const lineByLineRenderer = new LineByLineRenderer({});
      const fileHtml = lineByLineRenderer.render([]);
      expect(fileHtml).toContain('No files to display');
      expect(fileHtml).toContain('d2h-wrapper');
    });
  });

  describe('render with different line types', () => {
    it('should work for insertions', () => {
      const file: DiffFile = {
        addedLines: 1,
        deletedLines: 0,
        language: 'js',
        oldName: 'my/file/name.js',
        newName: 'my/file/name.js',
        isCombined: false,
        isGitDiff: false,
        isNew: false,
        isDeleted: false,
        isCopy: false,
        isRename: false,
        unchangedPercentage: 0,
        changedPercentage: 100,
        blocks: [{
          header: '@@ -1,3 +1,4 @@',
          oldStartLine: 1,
          oldStartLine2: undefined,
          newStartLine: 1,
          lines: [{
            content: '+test',
            type: LineType.INSERT,
            oldNumber: undefined,
            newNumber: 30,
          }]
        }]
      };
      const lineByLineRenderer = new LineByLineRenderer({});
      const fileHtml = lineByLineRenderer.render([file]);
      
      expect(fileHtml).toContain('d2h-ins');
      expect(fileHtml).toContain('30');
      expect(fileHtml).toContain('test');
      expect(fileHtml).toContain('d2h-code-line-prefix');
    });

    it('should work for deletions', () => {
      const file: DiffFile = {
        addedLines: 0,
        deletedLines: 1,
        language: 'js',
        oldName: 'my/file/name.js',
        newName: 'my/file/name.js',
        isCombined: false,
        isGitDiff: false,
        isNew: false,
        isDeleted: false,
        isCopy: false,
        isRename: false,
        unchangedPercentage: 0,
        changedPercentage: 100,
        blocks: [{
          header: '@@ -1,3 +1,2 @@',
          oldStartLine: 1,
          oldStartLine2: undefined,
          newStartLine: 1,
          lines: [{
            content: '-test',
            type: LineType.DELETE,
            oldNumber: 30,
            newNumber: undefined,
          }]
        }]
      };
      const lineByLineRenderer = new LineByLineRenderer({});
      const fileHtml = lineByLineRenderer.render([file]);
      
      expect(fileHtml).toContain('d2h-del');
      expect(fileHtml).toContain('30');
      expect(fileHtml).toContain('test');
      expect(fileHtml).toContain('d2h-code-line-prefix');
    });
    it('should handle whitespace correctly (2 spaces)', () => {
      const file: DiffFile = {
        addedLines: 1,
        deletedLines: 0,
        language: 'js',
        oldName: 'my/file/name.js',
        newName: 'my/file/name.js',
        isCombined: false,
        isGitDiff: false,
        isNew: false,
        isDeleted: false,
        isCopy: false,
        isRename: false,
        unchangedPercentage: 0,
        changedPercentage: 100,
        blocks: [{
          header: '@@ -1,3 +1,4 @@',
          oldStartLine: 1,
          oldStartLine2: undefined,
          newStartLine: 1,
          lines: [{
            content: '+  test',
            type: LineType.INSERT,
            oldNumber: undefined,
            newNumber: 30,
          }]
        }]
      };
      const lineByLineRenderer = new LineByLineRenderer({});
      const fileHtml = lineByLineRenderer.render([file]);
      
      expect(fileHtml).toContain('  test');
      expect(fileHtml).toContain('d2h-ins');
    });

    it('should handle whitespace correctly (4 spaces)', () => {
      const file: DiffFile = {
        addedLines: 1,
        deletedLines: 0,
        language: 'js',
        oldName: 'my/file/name.js',
        newName: 'my/file/name.js',
        isCombined: false,
        isGitDiff: false,
        isNew: false,
        isDeleted: false,
        isCopy: false,
        isRename: false,
        unchangedPercentage: 0,
        changedPercentage: 100,
        blocks: [{
          header: '@@ -1,3 +1,4 @@',
          oldStartLine: 1,
          oldStartLine2: undefined,
          newStartLine: 1,
          lines: [{
            content: '+    test',
            type: LineType.INSERT,
            oldNumber: undefined,
            newNumber: 30,
          }]
        }]
      };
      const lineByLineRenderer = new LineByLineRenderer({});
      const fileHtml = lineByLineRenderer.render([file]);
      
      expect(fileHtml).toContain('    test');
      expect(fileHtml).toContain('d2h-ins');
    });

    it('should preserve tabs', () => {
      const file: DiffFile = {
        addedLines: 1,
        deletedLines: 0,
        language: 'js',
        oldName: 'my/file/name.js',
        newName: 'my/file/name.js',
        isCombined: false,
        isGitDiff: false,
        isNew: false,
        isDeleted: false,
        isCopy: false,
        isRename: false,
        unchangedPercentage: 0,
        changedPercentage: 100,
        blocks: [{
          header: '@@ -1,3 +1,4 @@',
          oldStartLine: 1,
          oldStartLine2: undefined,
          newStartLine: 1,
          lines: [{
            content: '+\ttest',
            type: LineType.INSERT,
            oldNumber: undefined,
            newNumber: 30,
          }]
        }]
      };
      const lineByLineRenderer = new LineByLineRenderer({});
      const fileHtml = lineByLineRenderer.render([file]);
      
      expect(fileHtml).toContain('\ttest');
      expect(fileHtml).toContain('d2h-ins');
    });
  });

  describe('render file with blocks', () => {
    it('should work for simple file', () => {
      const lineByLineRenderer = new LineByLineRenderer({});

      const file: DiffFile = {
        addedLines: 12,
        deletedLines: 41,
        language: 'js',
        oldName: 'my/file/name.js',
        newName: 'my/file/name.js',
        isCombined: false,
        isGitDiff: false,
        isNew: false,
        isDeleted: false,
        isCopy: false,
        isRename: false,
        unchangedPercentage: 0,
        changedPercentage: 100,
        blocks: [{
          header: '@@ -1,3 +1,4 @@',
          oldStartLine: 1,
          oldStartLine2: undefined,
          newStartLine: 1,
          lines: [{
            content: ' context',
            type: LineType.CONTEXT,
            oldNumber: 1,
            newNumber: 1,
          }]
        }]
      };

      const fileHtml = lineByLineRenderer.render([file]);

      expect(fileHtml).toContain('d2h-file-wrapper');
      expect(fileHtml).toContain('my/file/name.js');
      expect(fileHtml).toContain('context');
      expect(fileHtml).toContain('d2h-cxt');
      expect(fileHtml).toContain('d2h-changed-tag');
    });

    it('should work for added file', () => {
      const lineByLineRenderer = new LineByLineRenderer({});

      const file: DiffFile = {
        addedLines: 12,
        deletedLines: 0,
        language: 'js',
        oldName: 'dev/null',
        newName: 'my/file/name.js',
        isNew: true,
        isCombined: false,
        isGitDiff: false,
        isDeleted: false,
        isCopy: false,
        isRename: false,
        unchangedPercentage: 0,
        changedPercentage: 100,
        blocks: [{
          header: '@@ -0,0 +1,1 @@',
          oldStartLine: 0,
          oldStartLine2: undefined,
          newStartLine: 1,
          lines: [{
            content: '+new content',
            type: LineType.INSERT,
            oldNumber: undefined,
            newNumber: 1,
          }]
        }]
      };

      const fileHtml = lineByLineRenderer.render([file]);

      expect(fileHtml).toContain('d2h-file-wrapper');
      expect(fileHtml).toContain('my/file/name.js');
      expect(fileHtml).toContain('new content');
      expect(fileHtml).toContain('d2h-ins');
      expect(fileHtml).toContain('d2h-added-tag');
    });

    it('should work for deleted file', () => {
      const lineByLineRenderer = new LineByLineRenderer({});

      const file: DiffFile = {
        addedLines: 0,
        deletedLines: 41,
        language: 'js',
        oldName: 'my/file/name.js',
        newName: 'dev/null',
        isDeleted: true,
        isCombined: false,
        isGitDiff: false,
        isNew: false,
        isCopy: false,
        isRename: false,
        unchangedPercentage: 0,
        changedPercentage: 100,
        blocks: [{
          header: '@@ -1,1 +0,0 @@',
          oldStartLine: 1,
          oldStartLine2: undefined,
          newStartLine: 0,
          lines: [{
            content: '-deleted content',
            type: LineType.DELETE,
            oldNumber: 1,
            newNumber: undefined,
          }]
        }]
      };

      const fileHtml = lineByLineRenderer.render([file]);

      expect(fileHtml).toContain('d2h-file-wrapper');
      expect(fileHtml).toContain('my/file/name.js');
      expect(fileHtml).toContain('deleted content');
      expect(fileHtml).toContain('d2h-del');
      expect(fileHtml).toContain('d2h-deleted-tag');
    });

    it('should work for renamed file', () => {
      const lineByLineRenderer = new LineByLineRenderer({});

      const file: DiffFile = {
        addedLines: 12,
        deletedLines: 41,
        language: 'js',
        oldName: 'my/file/name1.js',
        newName: 'my/file/name2.js',
        isRename: true,
        isCombined: false,
        isGitDiff: false,
        isNew: false,
        isDeleted: false,
        isCopy: false,
        unchangedPercentage: 0,
        changedPercentage: 100,
        blocks: [{
          header: '@@ -1,1 +1,1 @@',
          oldStartLine: 1,
          oldStartLine2: undefined,
          newStartLine: 1,
          lines: [{
            content: ' context',
            type: LineType.CONTEXT,
            oldNumber: 1,
            newNumber: 1,
          }]
        }]
      };

      const fileHtml = lineByLineRenderer.render([file]);

      expect(fileHtml).toContain('d2h-file-wrapper');
      expect(fileHtml).toContain('name1.js');
      expect(fileHtml).toContain('name2.js');
      expect(fileHtml).toContain('context');
    });

    it('should return empty when renderNothingWhenEmpty is true and no files', () => {
      const lineByLineRenderer = new LineByLineRenderer({
        renderNothingWhenEmpty: true,
      });

      const fileHtml = lineByLineRenderer.render([]);
      expect(fileHtml).toBe('');
    });
  });

  describe('render with matching configuration', () => {
    it('should work for list of files with line matching', () => {
      const exampleJson: DiffFile[] = [
        {
          blocks: [
            {
              lines: [
                {
                  content: '-test',
                  type: LineType.DELETE,
                  oldNumber: 1,
                  newNumber: undefined,
                },
                {
                  content: '+test1r',
                  type: LineType.INSERT,
                  oldNumber: undefined,
                  newNumber: 1,
                },
              ],
              oldStartLine: 1,
              oldStartLine2: undefined,
              newStartLine: 1,
              header: '@@ -1 +1 @@',
            },
          ],
          deletedLines: 1,
          addedLines: 1,
          checksumBefore: '0000001',
          checksumAfter: '0ddf2ba',
          oldName: 'sample',
          newName: 'sample',
          language: 'txt',
          isCombined: false,
          isGitDiff: true,
          isNew: false,
          isDeleted: false,
          isCopy: false,
          isRename: false,
          unchangedPercentage: 0,
          changedPercentage: 100,
        },
      ];

      const lineByLineRenderer = new LineByLineRenderer({
        matching: LineMatchingType.LINES,
      });
      const html = lineByLineRenderer.render(exampleJson);
      
      expect(html).toContain('d2h-wrapper');
      expect(html).toContain('sample');
      expect(html).toContain('test');
      expect(html).toContain('test1r');
    });

    it('should work for empty blocks', () => {
      const exampleJson: DiffFile[] = [
        {
          blocks: [],
          deletedLines: 0,
          addedLines: 0,
          oldName: 'sample',
          language: 'js',
          newName: 'sample',
          isCombined: false,
          isGitDiff: false,
          isNew: false,
          isDeleted: false,
          isCopy: false,
          isRename: false,
          unchangedPercentage: 100,
          changedPercentage: 0,
        },
      ];

      const lineByLineRenderer = new LineByLineRenderer({
        renderNothingWhenEmpty: false,
      });
      const html = lineByLineRenderer.render(exampleJson);
      
      expect(html).toContain('d2h-wrapper');
      expect(html).toContain('sample');
      expect(html).toContain('File without changes');
    });
  });
});
