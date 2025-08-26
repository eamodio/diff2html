// Export Lit Web Components
export { DiffLineComponent } from './diff-line-component';
export { DiffFileComponent } from './diff-file-component';
export { DiffFileSideBySideComponent } from './diff-file-side-by-side-component';
export { DiffContainerComponent } from './diff-container-component';

// Export Lit-based renderers
export { default as LitLineByLineRenderer } from './lit-line-by-line-renderer';
export { default as LitSideBySideRenderer } from './lit-side-by-side-renderer';

// Export renderer configs
export type { LitLineByLineRendererConfig } from './lit-line-by-line-renderer';
export type { LitSideBySideRendererConfig } from './lit-side-by-side-renderer';
export { defaultLitLineByLineRendererConfig } from './lit-line-by-line-renderer';
export { defaultLitSideBySideRendererConfig } from './lit-side-by-side-renderer';

// Import all components to ensure they are registered
import './diff-line-component';
import './diff-file-component';
import './diff-file-side-by-side-component';
import './diff-container-component';
