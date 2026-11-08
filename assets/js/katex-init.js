/*
 * katex-init.js - renders $..$, $$..$$, \(..\) and \[..\] with KaTeX auto-render.
 * KaTeX itself (katex.min.js + auto-render) is loaded from the CDN in the page <head>, before this file.
 */
document.addEventListener('DOMContentLoaded', function () {
    if (typeof renderMathInElement === 'function') {
        renderMathInElement(document.body, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true }
            ]
        });
    }
});