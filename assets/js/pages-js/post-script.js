/*
 * post-script.js - post pages: code block / blockquote buttons, heading-link copy, options (hamburger) menu.
 * Shared behaviour (theme, back, notify, options overlay, scroll header) is in ../common.js.
 */
(function () {
    Site.rememberPreferredLanguage(document.documentElement.lang);

    function scrollToBottom() {
        const body = document.body; // Safari
        const html = document.documentElement; // Chrome, Firefox
        const bottom = Math.max(body.scrollHeight, html.scrollHeight);

        body.scrollTop = bottom;
        html.scrollTop = bottom;
    }

    // ---------------------------------------------------------------------------------------------
    // Code blocks and blockquotes: copy + collapse buttons (added at build time by _plugins/code_blocks.rb)
    // ---------------------------------------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', function () {
        const highlights = document.querySelectorAll('div.highlight');
        const blockquotes = document.querySelectorAll('blockquote');

        const upArrowSVG = document.getElementById('svg-up-arrow').innerHTML;
        const downArrowSVG = document.getElementById('svg-down-arrow').innerHTML;
        const checkSVG = document.getElementById('svg-check').innerHTML;
        const documentSVG = document.getElementById('svg-document').innerHTML;

        highlights.forEach((highlight) => {
            const copyButton = highlight.querySelector('.copy-button');
            if (copyButton) {
                copyButton.addEventListener('click', function () {
                    const range = document.createRange();
                    range.selectNodeContents(highlight.querySelector('code'));
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);

                    try {
                        const successful = document.execCommand('copy');
                        if (successful) {
                            copyButton.innerHTML = checkSVG;
                            setTimeout(() => {
                                copyButton.innerHTML = documentSVG;
                            }, 2000);
                        }
                    } catch (err) {
                        console.error('Error copying text: ', err);
                    }

                    window.getSelection().removeAllRanges();
                });
            }

            const collapseButton = highlight.querySelector('.collapse-button');
            if (collapseButton) {
                collapseButton.addEventListener('click', function () {
                    highlight.classList.toggle('collapsed');
                    collapseButton.innerHTML = highlight.classList.contains('collapsed') ? downArrowSVG : upArrowSVG;
                });
            }
        });

        blockquotes.forEach((blockquote) => {
            const collapseButton = blockquote.querySelector('.collapse-button');
            if (collapseButton) {
                collapseButton.addEventListener('click', function () {
                    blockquote.classList.toggle('collapsed');
                    collapseButton.innerHTML = blockquote.classList.contains('collapsed') ? downArrowSVG : upArrowSVG;
                });
            }
        });
    });

    // Heading link buttons call this from an inline onclick (added by _plugins/heading_links.rb)
    window.copyToClipboard = function copyToClipboard(event, text) {
        navigator.clipboard.writeText(text).then(() => {
            const button = event.target.closest('button');
            button.classList.add('pulse-color');
            setTimeout(() => {
                button.classList.remove('pulse-color');
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    };

    Site.initScrollHeader({
        header: '#post-header',
        navSize: '1.1875rem',
        button: { at: 500 }
    });

    // ---------------------------------------------------------------------------------------------
    // Options (hamburger) menu
    // ---------------------------------------------------------------------------------------------
    Site.initOptionsOverlay();

    document.getElementById('toTopButton').addEventListener('click', () => {
        scrollToTop();
        closeOptions();
    });

    document.getElementById('themeButton').addEventListener('click', () => {
        toggleTheme();
        closeOptions();
    });

    document.getElementById('commentsButton').addEventListener('click', () => {
        scrollToBottom();
        closeOptions();
    });

    // Navigation entries: close the menu, then go
    function onNavigate(id, go) {
        document.getElementById(id).addEventListener('click', (e) => {
            e.preventDefault();
            closeOptions();
            go();
        });
    }

    onNavigate('toBackButton', () => goBack());
    onNavigate('toHomeButton', () => { window.location.href = '/'; });
    onNavigate('toArchiveButton', () => { window.location.href = '/archive'; });
    onNavigate('toProjectsButton', () => { window.location.href = '/projects'; });
    onNavigate('toAboutButton', () => {
        const lang = document.documentElement.lang;
        window.location.href = lang === 'vi' ? '/about-yuk-vi' : lang === 'ja' ? '/about-yuk-ja' : '/about-yuk-en';
    });

    // Plotly charts are laid out before the page settles; resize them once everything has loaded
    window.addEventListener('load', function () {
        if (!window.Plotly) return;
        setTimeout(function () {
            document.querySelectorAll('.js-plotly-plot').forEach(function (el) {
                Plotly.Plots.resize(el);
            });
        }, 250);
    });

    // Focus the article so keyboard scrolling (space, arrows, Page Up/Down) works straight away
    window.addEventListener('load', () => {
        const target = document.querySelector('div.post-content');
        if (target) {
            target.style.outline = 'none';
            target.setAttribute('tabindex', '-1');
            target.focus();
        }
    });

    // Smooth, offset scroll to a heading when the hash changes
    window.addEventListener('hashchange', function (e) {
        e.preventDefault();

        const targetElement = document.getElementById(window.location.hash.substring(1));
        if (targetElement) {
            // Small delay to ensure the DOM is ready
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    });
})();
