import * as Diff2Html from '../diff2html';
import { OutputFormatType } from '../types';

// Mock DOM environment for testing
global.document = {
  createElement: jest.fn(() => ({
    innerHTML: '',
    appendChild: jest.fn(),
  })),
} as unknown as Document;

global.window = {} as unknown as Window & typeof globalThis;

describe('Lit Renderers', () => {
  const sampleDiffString = `diff --git a/sample.js b/sample.js
index 1234567..abcdefg 100644
--- a/sample.js
+++ b/sample.js
@@ -1,3 +1,4 @@
 var a = 1;
-var b = 2;
+var b = 3;
+var c = 4;
 var d = 5;`;

  describe('parse', () => {
    it('should parse diff string correctly', () => {
      const result = Diff2Html.parse(sampleDiffString);
      expect(result).toHaveLength(1);
      expect(result[0].oldName).toBe('sample.js');
      expect(result[0].newName).toBe('sample.js');
    });
  });

  describe('html with Lit renderers', () => {
    it('should render with line-by-line-lit format', () => {
      const result = Diff2Html.html(sampleDiffString, {
        outputFormat: 'line-by-line-lit' as OutputFormatType,
      });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should render with side-by-side-lit format', () => {
      const result = Diff2Html.html(sampleDiffString, {
        outputFormat: 'side-by-side-lit' as OutputFormatType,
      });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('renderToElement', () => {
    it('should render to element with line-by-line-lit format (fallback to traditional)', () => {
      const mockElement = {
        innerHTML: '',
        appendChild: jest.fn(),
      };

      Diff2Html.renderToElement(sampleDiffString, mockElement as unknown as Element, {
        outputFormat: 'line-by-line-lit' as OutputFormatType,
      });

      // In test environment, Lit components are not available, so it should fall back to innerHTML
      expect(mockElement.innerHTML).toBeTruthy();
    });

    it('should render to element with side-by-side-lit format (fallback to traditional)', () => {
      const mockElement = {
        innerHTML: '',
        appendChild: jest.fn(),
      };

      Diff2Html.renderToElement(sampleDiffString, mockElement as unknown as Element, {
        outputFormat: 'side-by-side-lit' as OutputFormatType,
      });

      // In test environment, Lit components are not available, so it should fall back to innerHTML
      expect(mockElement.innerHTML).toBeTruthy();
    });

    it('should fall back to HTML string for traditional formats', () => {
      const mockElement = {
        innerHTML: '',
        appendChild: jest.fn(),
      };

      Diff2Html.renderToElement(sampleDiffString, mockElement as unknown as Element, {
        outputFormat: 'line-by-line' as OutputFormatType,
      });

      expect(mockElement.innerHTML).toBeTruthy();
      expect(mockElement.appendChild).not.toHaveBeenCalled();
    });
  });
});
