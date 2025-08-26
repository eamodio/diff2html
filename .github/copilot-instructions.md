# diff2html

diff2html is a TypeScript library that generates pretty HTML diffs from git diff or unified diff output. The library
includes a comprehensive build system, test suite, and demo website.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected
information that does not match the info here.

## Working Effectively

- **CRITICAL**: Set appropriate timeouts for all build and test commands. NEVER CANCEL builds or tests.
- Bootstrap, build, and test the repository:
  - `npm install` -- takes 60 seconds to complete. NEVER CANCEL. Set timeout to 90+ seconds.
  - `npm run build:templates` -- generates Mustache templates, takes <1 second
  - `npm run build` -- takes 41 seconds to complete. NEVER CANCEL. Set timeout to 90+ seconds.
  - `npm run test:coverage` -- takes 6 seconds. NEVER CANCEL. Set timeout to 30+ seconds.
- **ALWAYS run the complete validation pipeline**:
  - `npm run validate` -- runs templates, format check, lint check, build, and test coverage. Takes 50+ seconds total.
    NEVER CANCEL. Set timeout to 90+ seconds.
- Run the development website:
  - ALWAYS run the bootstrapping steps first
  - `npm run start:website` -- starts Webpack dev server on http://localhost:8081
  - The website includes both main page and demo at /demo.html

## Validation

- **CRITICAL SCENARIO VALIDATION**: Always manually validate any new code via the demo website when changing core
  functionality.
- ALWAYS run through at least one complete end-to-end scenario after making changes:
  1. Start the dev server with `npm run start:website`
  2. Navigate to http://localhost:8081 and verify main page loads
  3. Navigate to http://localhost:8081/demo.html and verify demo functionality
  4. Test library programmatically with Node.js if changing core parsing/rendering
- You can build and run the website successfully - take screenshots to verify changes
- Always run `npm run format:fix && npm run lint:fix` before committing or the CI
  (.github/workflows/test-and-publish.yml) will fail
- **TESTING REQUIREMENT**: Always run `npm run test:coverage` and ensure all tests pass with 95%+ coverage

## Common Tasks

The following are outputs from frequently run commands. Reference them instead of viewing, searching, or running bash
commands to save time.

### Repository Root Structure

```
.github/          # CI workflows and issue templates
.husky/           # Git hooks (pre-commit linting)
bundles/          # Built browser bundles (generated)
lib/              # CommonJS build output (generated)
lib-esm/          # ES modules build output (generated)
src/              # TypeScript source code
website/          # Demo website source
scripts/          # Build scripts (hulk.ts for templates)
docs/             # Built website output (generated)
```

### Key Build Commands Timing

- `npm install`: 60 seconds (includes dependency warnings, succeeds)
- `npm run build:templates`: <1 second
- `npm run lint:check`: <1 second
- `npm run format:check`: <1 second
- `npm run build`: 41 seconds (builds CSS, templates, CommonJS, ESM, bundles, website)
- `npm run test:coverage`: 6 seconds (100 tests, 95% coverage)
- `npm run validate`: 50+ seconds total (complete CI pipeline)

### Package.json Scripts

Key scripts you'll use:

```json
{
  "build": "npm run build:css && npm run build:templates && npm run build:commonjs && npm run build:esm && npm run build:bundles && npm run build:website",
  "test": "is-ci 'test:coverage' 'test:watch'",
  "test:coverage": "jest --coverage",
  "lint:check": "eslint",
  "lint:fix": "eslint --fix",
  "format:check": "npm run prettier --check",
  "format:fix": "npm run prettier --write",
  "validate": "npm run build:templates && npm run format:check && npm run lint:check && npm run build && npm run test:coverage",
  "start:website": "webpack serve --mode development --config webpack.website.ts"
}
```

### Source Code Structure

```
src/
├── __tests__/           # Jest test files
├── templates/           # Mustache templates for HTML generation
├── ui/                  # UI components (CSS and JS)
│   ├── css/            # Stylesheets
│   └── js/             # JavaScript UI components
├── diff-parser.ts       # Core diff parsing logic
├── diff2html.ts        # Main library exports
├── line-by-line-renderer.ts  # Line-by-line HTML renderer
├── side-by-side-renderer.ts  # Side-by-side HTML renderer
├── file-list-renderer.ts     # File list HTML renderer
├── render-utils.ts      # Rendering utilities
├── hoganjs-utils.ts     # Template rendering utilities
├── rematch.ts          # Line matching algorithm
├── types.ts            # TypeScript type definitions
└── utils.ts            # General utilities
```

### Library Usage Example

```javascript
const diff2html = require('./lib/diff2html.js');

const sampleDiff = `diff --git a/sample.js b/sample.js
index 1111111..2222222 100644
--- a/sample.js  
+++ b/sample.js
@@ -1 +1 @@
-console.log("Hello World!")
+console.log("Hello from Diff2Html!")`;

// Parse diff to JSON
const parsedDiff = diff2html.parse(sampleDiff);

// Generate HTML
const html = diff2html.html(sampleDiff, {
  outputFormat: 'side-by-side',
  drawFileList: true,
  matching: 'lines',
});
```

### Technology Stack

- **Language**: TypeScript with strict mode enabled
- **Build**: Webpack 5 for bundling, TypeScript compiler for lib builds
- **Testing**: Jest with ts-jest, 95%+ coverage requirement
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier with specific config
- **CSS**: PostCSS with autoprefixer and cssnano
- **Templates**: Mustache templates compiled via custom hulk script
- **Dependencies**: diff, hogan.js, highlight.js (optional)

### Development Workflow

1. Make changes to TypeScript source in `src/`
2. Run `npm run build:templates` if you modify templates
3. Run `npm run test:coverage` to ensure tests pass
4. Run `npm run validate` before committing (full CI pipeline)
5. Use `npm run start:website` to test changes in the demo
6. Always run format and lint fixes: `npm run format:fix && npm run lint:fix`

### Common Issues and Solutions

- **Build failures**: Always run `npm run build:templates` first if templates were modified
- **Test failures**: Check that coverage stays above 95% for all metrics
- **Linting errors**: Run `npm run lint:fix` to auto-fix most issues
- **Format errors**: Run `npm run format:fix` to auto-format code
- **Website issues**: Restart dev server if hot reload stops working
- **ESLint configuration**: The project uses a specific ESLint config that requires absolute paths. If you encounter
  "parserOptions.tsconfigRootDir must be an absolute path" errors, the config is already fixed.

### CI/CD Information

- **GitHub Actions**: Uses `.github/workflows/test-and-publish.yml` for CI
- **Pre-commit hooks**: Husky runs `npm run lint:staged` on commit
- **Coverage thresholds**: 93% statements, 86% branches, 98% functions, 93% lines
- **Node versions tested**: 16.x, 18.x, 20.x, 22.x
- **Build matrix**: Tests on multiple Node versions in CI

### Library Architecture

- **Modular design**: Separate parsers and renderers for different output formats
- **Template-based**: Uses Mustache templates for HTML generation
- **Configurable**: Extensive configuration options for appearance and behavior
- **Browser support**: Builds UMD bundles for browser use
- **Node.js support**: CommonJS and ES modules for Node.js

This codebase follows modern TypeScript best practices with comprehensive testing, linting, and build automation. Always
validate changes through both automated tests and manual testing in the demo website.
