/*
 * common.js - behaviour shared by every page.
 *
 * Loaded (together with the window.SITE_TEXT strings, see _includes/js-common.html) BEFORE the page script
 * in assets/js/pages-js/. Page scripts only hold what is specific to their page.
 *
 * Conventions
 *   - Templates call the globals exported at the bottom (goBack(), showConfiguration(), scrollToTop(), ...).
 *   - Page scripts are IIFEs and reach shared helpers through window.Site.*.
 *   - A page may replace an exported global by assigning window.<name> afterwards
 *     (archive replaces goBack/scrollToTop, home replaces the config overlay open/close).
 *   - Visible text never lives here: it comes from _data/text.yml via window.SITE_TEXT.
 */
(function () {
    'use strict';

    const LANGS = ['en', 'vi', 'ja'];

    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    // ---------------------------------------------------------------------------------------------
    // Every page starts at the top
    // ---------------------------------------------------------------------------------------------
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    // ---------------------------------------------------------------------------------------------
    // Preferred language (used by the About pages' redirect/switcher)
    // ---------------------------------------------------------------------------------------------
    function rememberPreferredLanguage(lang) {
        if (!LANGS.includes(lang)) return;
        try {
            localStorage.setItem('preferredLang', lang);
        } catch (error) { /* storage unavailable */ }
    }

    function getPreferredLanguage() {
        try {
            const lang = localStorage.getItem('preferredLang');
            return LANGS.includes(lang) ? lang : null;
        } catch (error) {
            return null;
        }
    }

    // ---------------------------------------------------------------------------------------------
    // Navigation
    // ---------------------------------------------------------------------------------------------
    function goBack() {
        const referrer = document.referrer;

        // Go back to the previous same-site page, unless it is only this page with a different hash.
        if (referrer && referrer.startsWith(window.location.origin)) {
            if (new URL(referrer).pathname !== window.location.pathname) {
                window.location.href = referrer;
                return;
            }
        }
        window.location.href = '/';
    }

    function handleLogoClick() {
        window.location.href = '/';
    }

    function scrollToTop() {
        document.body.scrollTop = 0; // Safari
        document.documentElement.scrollTop = 0; // Chrome, Firefox
    }

    // ---------------------------------------------------------------------------------------------
    // Theme
    // ---------------------------------------------------------------------------------------------
    function toggleTheme() {
        const isLight = document.documentElement.classList.toggle('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');

        // Comments widget (posts only)
        const giscusFrame = document.querySelector('iframe.giscus-frame');
        if (giscusFrame) {
            giscusFrame.contentWindow.postMessage(
                { giscus: { setConfig: { theme: isLight ? 'light_protanopia' : 'dark_protanopia' } } },
                'https://giscus.app'
            );
        }

        // Mermaid diagrams (posts that use them)
        if (typeof window.reinitializeMermaidViewer === 'function') {
            window.reinitializeMermaidViewer(!isLight);
        }
    }

    // ---------------------------------------------------------------------------------------------
    // Configuration overlay (gear button): Theme / Background / Close
    // The gear itself opens it through its inline onclick="showConfiguration()".
    // ---------------------------------------------------------------------------------------------
    function showConfiguration() {
        const overlay = document.getElementById('config-overlay');
        const container = document.querySelector('.config-container');
        if (!overlay || !container) return;
        const gear = document.getElementById('config-toggle-desktop');
        if (gear) gear.setAttribute('aria-expanded', 'true');

        overlay.style.display = 'flex';
        setTimeout(() => container.classList.add('show'), 10);
    }

    function closeConfiguration() {
        const overlay = document.getElementById('config-overlay');
        const container = document.querySelector('.config-container');
        if (!overlay || !container) return;
        const gear = document.getElementById('config-toggle-desktop');
        if (gear) gear.setAttribute('aria-expanded', 'false');

        container.classList.remove('show');
        setTimeout(() => { overlay.style.display = 'none'; }, 250);
    }

    ready(function initConfiguration() {
        const overlay = document.getElementById('config-overlay');
        if (!overlay) return;

        // Move to <body> so the fixed overlay is not clipped by a transformed ancestor.
        if (overlay.parentElement !== document.body) document.body.appendChild(overlay);

        // Looked up through window.* at click time so a page can replace open/close.
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) window.closeConfiguration();
        });

        const themeButton = document.getElementById('configThemeButton') || document.getElementById('configPlaceholder1');
        if (themeButton) {
            themeButton.addEventListener('click', () => {
                window.toggleTheme();
                window.closeConfiguration();
            });
        }

        const closeButton = document.getElementById('configCloseButton');
        if (closeButton) closeButton.addEventListener('click', () => window.closeConfiguration());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.querySelector('.config-container.show')) window.closeConfiguration();
        });
    });

    // ---------------------------------------------------------------------------------------------
    // Options overlay (hamburger menu on small screens; home and posts)
    // ---------------------------------------------------------------------------------------------
    function showOptions() {
        const overlay = document.getElementById('overlay');
        const container = document.querySelector('.options-container');
        if (!overlay || !container) {
            console.warn('showOptions: required elements not found');
            return;
        }
        const gear = document.getElementById('config-toggle-desktop');
        if (gear) gear.setAttribute('aria-expanded', 'true');

        overlay.style.display = 'flex';
        let blur = 0;
        overlay.style.transition = 'backdrop-filter 0.5s ease';
        const timer = setInterval(() => {
            blur += 1;
            overlay.style.backdropFilter = `blur(${blur}px)`;
            if (blur >= 5) clearInterval(timer);
        }, 50);

        setTimeout(() => container.classList.add('show'), 10);
    }

    function closeOptions() {
        const overlay = document.getElementById('overlay');
        const container = document.querySelector('.options-container');
        if (!overlay || !container) {
            console.warn('closeOptions: required elements not found');
            return;
        }
        const gear = document.getElementById('config-toggle-desktop');
        if (gear) gear.setAttribute('aria-expanded', 'false');

        container.classList.remove('show');
        let blur = 5;
        const timer = setInterval(() => {
            blur -= 1;
            overlay.style.backdropFilter = `blur(${blur}px)`;
            if (blur <= 0) {
                clearInterval(timer);
                overlay.style.display = 'none';
            }
        }, 50);
    }

    // Wires the parts every options overlay has: hamburger, backdrop, Close button.
    function initOptionsOverlay() {
        const overlay = document.getElementById('overlay');
        if (!overlay) return;
        if (overlay.parentElement !== document.body) document.body.appendChild(overlay);

        const hamburger = document.querySelector('.extra-button');
        if (hamburger) hamburger.addEventListener('click', () => window.showOptions());

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) window.closeOptions();
        });

        const closeButton = document.getElementById('closeButton');
        if (closeButton) closeButton.addEventListener('click', () => window.closeOptions());
    }

    // ---------------------------------------------------------------------------------------------
    // "Coming soon" popup (markup: _includes/notify-coming-soon.html)
    // ---------------------------------------------------------------------------------------------
    function restartAnimation(el, animation) {
        el.style.animation = 'none';
        void el.offsetWidth; // reflow so the animation runs again
        el.style.animation = animation;
    }

    function notifyComingSoon() {
        const overlay = document.getElementById('notify-overlay');
        if (!overlay) return;

        overlay.style.display = 'flex';
        restartAnimation(overlay, 'notify-fade-in 0.3s ease');

        const container = document.getElementById('notify-container');
        if (container) restartAnimation(container, 'notify-slide-in 0.4s ease');
    }

    function dismissNotify() {
        const overlay = document.getElementById('notify-overlay');
        if (!overlay) return;

        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.opacity = '';
            overlay.style.transition = '';
        }, 300);
    }

    ready(function initNotify() {
        const overlay = document.getElementById('notify-overlay');
        if (!overlay) return;
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) window.dismissNotify();
        });
    });

    // ---------------------------------------------------------------------------------------------
    // Header that shrinks after scrolling (+ optional "back to top" button)
    //   options: header / title / nav  - selectors ('title' optional)
    //            titleSize / navSize   - font sizes applied while scrolled
    //            button: { at: <px> }  - show #scrollButton after this scroll position
    // ---------------------------------------------------------------------------------------------
    function initScrollHeader(options) {
        const header = document.querySelector(options.header);
        const title = options.title ? document.querySelector(options.title) : null;
        const nav = document.querySelector(options.nav || '.nav-container');
        const scrolledPast = (px) => document.body.scrollTop > px || document.documentElement.scrollTop > px;

        function update() {
            const scrolled = scrolledPast(10);
            if (header) header.classList.toggle('transformed', scrolled);
            if (title) title.style.fontSize = scrolled ? (options.titleSize || '') : '';
            if (nav) nav.style.fontSize = scrolled ? options.navSize : '';

            if (options.button) {
                const button = document.getElementById('scrollButton');
                if (button) button.classList.toggle('slide-in', scrolledPast(options.button.at));
            }
        }

        window.addEventListener('scroll', update, { passive: true });
    }

    // ---------------------------------------------------------------------------------------------
    // Vietnam local time shown in the profile card (home sidebar, home top card, About page)
    // ---------------------------------------------------------------------------------------------
    ready(function startVietnamClock() {
        const targets = ['vn-time', 'home-vn-time', 'home-vn-time-mobile']
            .map((id) => document.getElementById(id))
            .filter(Boolean);
        if (!targets.length) return;

        const format = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        const tick = () => {
            const text = format.format(new Date()) + ' (UTC +07:00)';
            targets.forEach((el) => { el.textContent = text; });
        };
        tick();
        setInterval(tick, 30000);
    });

    // ---------------------------------------------------------------------------------------------
    // Lazy images fade in: once an <img class="blur-load"> has loaded, add .loaded (the CSS does the fade).
    // 'load' does not bubble, so listen in the capture phase; images that finished before this script ran
    // are picked up once the DOM is ready.
    // ---------------------------------------------------------------------------------------------
    function markLoaded(img) {
        setTimeout(() => img.classList.add('loaded'), 50);
    }

    document.addEventListener('load', (e) => {
        const el = e.target;
        if (el.tagName === 'IMG' && el.classList.contains('blur-load')) markLoaded(el);
    }, true);

    ready(function markCompleteImages() {
        document.querySelectorAll('img.blur-load').forEach((img) => {
            if (img.complete && img.naturalWidth > 0) markLoaded(img);
        });
    });

    // ---------------------------------------------------------------------------------------------
    // Exports
    // ---------------------------------------------------------------------------------------------
    window.Site = {
        langs: LANGS,
        ready,
        rememberPreferredLanguage,
        getPreferredLanguage,
        initOptionsOverlay,
        initScrollHeader
    };

    // Globals used by inline handlers in templates (and overridable by page scripts)
    Object.assign(window, {
        goBack,
        handleLogoClick,
        scrollToTop,
        toggleTheme,
        showConfiguration,
        closeConfiguration,
        showOptions,
        closeOptions,
        notifyComingSoon,
        dismissNotify
    });
})();
