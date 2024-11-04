import MarkdownIt from 'markdown-it';
import { HLJSApi, LanguageFn } from 'highlight.js';
export interface HighlightOptions {
    /**
     * Whether to automatically detect language if not specified.
     */
    auto?: boolean;
    /**
     * Whether to add the `hljs` class to raw code blocks (not fenced blocks).
     */
    code?: boolean;
    /**
     * Register other languages which are not included in the standard pack.
     */
    register?: {
        [lang: string]: LanguageFn;
    };
    /**
     * Whether to highlight inline code.
     */
    inline?: boolean;
    /**
     * Provide the instance of highlight.js to use for highlighting
     */
    hljs?: HLJSApi;
    /**
     * Forces highlighting to finish even in case of detecting illegal syntax for
     * the language instead of throwing an exception.
     */
    ignoreIllegals?: boolean;
}
declare function core(md: MarkdownIt, opts?: HighlightOptions): void;
declare namespace core {
    var defaults: {
        auto: boolean;
        code: boolean;
        inline: boolean;
        ignoreIllegals: boolean;
    };
}
export default core;
