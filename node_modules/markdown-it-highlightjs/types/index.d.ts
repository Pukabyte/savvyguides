import MarkdownIt from 'markdown-it';
import { HighlightOptions } from './core.js';
declare function highlightjs(md: MarkdownIt, opts?: HighlightOptions): void;
declare namespace highlightjs {
    var defaults: {
        auto: boolean;
        code: boolean;
        inline: boolean;
        ignoreIllegals: boolean;
    };
}
export default highlightjs;
