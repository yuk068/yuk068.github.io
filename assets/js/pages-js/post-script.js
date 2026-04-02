if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
const isHoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const disableDotBackgroundEffects = false;

let currentBgPerformanceMode = 'High';
let siteBgEffectInitialized = false;
let dotRippleInitialized = false;
let dotRippleTimeoutId = null;
let siteBgHandlers = { move: null, scroll: null, leave: null, visibility: null };
let dotRippleHandlers = { click: null, visibility: null };

function isBgMode(...modes) {
    return modes.includes(currentBgPerformanceMode);
}

function stopDotRippleEffect() {
    dotRippleInitialized = false;
    if (dotRippleTimeoutId) {
        clearTimeout(dotRippleTimeoutId);
        dotRippleTimeoutId = null;
    }
    if (dotRippleHandlers.click) {
        document.removeEventListener('click', dotRippleHandlers.click);
        dotRippleHandlers.click = null;
    }
    if (dotRippleHandlers.visibility) {
        document.removeEventListener('visibilitychange', dotRippleHandlers.visibility);
        dotRippleHandlers.visibility = null;
    }
}

function stopSiteBackgroundEffect() {
    if (!siteBgEffectInitialized) return;

    const siteBgEffects = document.querySelector('.site-bg-effects');
    const siteBgGlow = document.querySelector('.site-bg-glow');
    if (siteBgEffects) siteBgEffects.style.display = 'none';
    if (siteBgGlow) siteBgGlow.style.opacity = '0';

    if (siteBgHandlers.move) {
        window.removeEventListener('mousemove', siteBgHandlers.move, { passive: true });
        siteBgHandlers.move = null;
    }
    if (siteBgHandlers.scroll) {
        window.removeEventListener('scroll', siteBgHandlers.scroll, { passive: true });
        siteBgHandlers.scroll = null;
    }
    if (siteBgHandlers.leave) {
        document.removeEventListener('mouseleave', siteBgHandlers.leave);
        siteBgHandlers.leave = null;
    }
    if (siteBgHandlers.visibility) {
        document.removeEventListener('visibilitychange', siteBgHandlers.visibility);
        siteBgHandlers.visibility = null;
    }
    siteBgEffectInitialized = false;
}

function applyBgPerformanceMode(mode) {
    currentBgPerformanceMode = mode;
    const renderMode = isHoverCapable ? mode : 'None';

    const siteBgEffects = document.querySelector('.site-bg-effects');
    const siteBgGlow = document.querySelector('.site-bg-glow');

    if (renderMode === 'None') {
        stopDotRippleEffect();
        stopSiteBackgroundEffect();
        if (siteBgEffects) siteBgEffects.style.display = 'none';
        if (siteBgGlow) siteBgGlow.style.opacity = '0';
        return;
    }

    if (mode === 'Low') {
        stopDotRippleEffect();
        stopSiteBackgroundEffect();
        if (siteBgEffects) siteBgEffects.style.display = 'block';
        if (siteBgGlow) siteBgGlow.style.opacity = '0';
        return;
    }

    // Post behavior: Mid and High are identical (hover + click only, no idle ripple).
    if (siteBgEffects) siteBgEffects.style.display = 'block';
    if (siteBgGlow) siteBgGlow.style.opacity = '1';
    initSiteBackgroundEffect();
    initDotRippleEffect('justright', 500, false);
}

function initSiteBackgroundEffect() {
    if (siteBgEffectInitialized) return;
    if (!isBgMode('Mid', 'High')) return;

    if (disableDotBackgroundEffects) return;
    siteBgEffectInitialized = true;
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hasFinePointer || prefersReducedMotion) return;

    const root = document.documentElement;
    let rafId = 0;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let lastClientX = mouseX;
    let lastClientY = mouseY;

    function flushMousePosition() {
        root.style.setProperty('--site-bg-mouse-x', `${mouseX}px`);
        root.style.setProperty('--site-bg-mouse-y', `${mouseY}px`);
        rafId = 0;
    }

    function updatePosition() {
        mouseX = lastClientX + window.scrollX;
        mouseY = lastClientY + window.scrollY;

        if (!rafId) {
            rafId = window.requestAnimationFrame(flushMousePosition);
        }
    }

    function handleMove(event) {
        lastClientX = event.clientX;
        lastClientY = event.clientY;

        root.style.setProperty('--site-bg-glow-opacity', '1');
        updatePosition();
    }

    function handleScroll() {
        updatePosition();
    }

    function handleLeave() {
        root.style.setProperty('--site-bg-glow-opacity', '0');
    }

    function handleVisibility() {
        if (document.hidden) {
            handleLeave();
        }
    }

    siteBgHandlers.move = handleMove;
    siteBgHandlers.scroll = handleScroll;
    siteBgHandlers.leave = handleLeave;
    siteBgHandlers.visibility = handleVisibility;

    window.addEventListener('mousemove', siteBgHandlers.move, { passive: true });
    window.addEventListener('scroll', siteBgHandlers.scroll, { passive: true });
    document.addEventListener('mouseleave', siteBgHandlers.leave);
    document.addEventListener('visibilitychange', siteBgHandlers.visibility);
}

function initDotRippleEffect(presetName = 'subtle', timeToFirstMs = null, enableIdle = true) {
    if (!isBgMode('Mid', 'High')) return;

    stopDotRippleEffect();
    dotRippleInitialized = true;
    const disableIdleDotRipple = disableDotBackgroundEffects || !enableIdle;
    const RIPPLE_PRESETS = {
        subtle: {
            alpha:        0.55,
            radius:       { min: 80,  max: 160 },
            ringWidth:    { min: 20,  max: 45  },
            duration:     { min: 1800, max: 2600 },
            interval:     { min: 900, max: 1100 },
            sideWidth:    0.28,
            centerChance: 0.15,
        },
        mild: {
            alpha:        0.75,
            radius:       { min: 100, max: 210 },
            ringWidth:    { min: 30,  max: 60  },
            duration:     { min: 1600, max: 2200 },
            interval:     { min: 700, max: 900 },
            sideWidth:    0.25,
            centerChance: 0.12,
        },
        justright: {
            alpha:        0.8,
            radius:       { min: 130, max: 250 },
            ringWidth:    { min: 50,  max: 100 },
            duration:     { min: 1200, max: 1800 },
            interval:     { min: 275, max: 425 },
            sideWidth:    0.21,
            centerChance: 0.12,
        },
        aggressive: {
            alpha:        1.2,
            radius:       { min: 160, max: 300 },
            ringWidth:    { min: 50,  max: 90  },
            duration:     { min: 1200, max: 1800 },
            interval:     { min: 300, max: 500 },
            sideWidth:    0.22,
            centerChance: 0.08,
        },
    };

    const p = RIPPLE_PRESETS[presetName];
    if (!p) { console.error('[ripple] unknown preset:', presetName, '| valid:', Object.keys(RIPPLE_PRESETS)); return; }

    const container = document.querySelector('.site-bg-effects');
    if (!container) { console.error('[ripple] .site-bg-effects not found'); return; }

    const rand = (range) => typeof range === 'number'
        ? range
        : range.min + Math.random() * (range.max - range.min);

    function getSpawnX() {
        if (Math.random() < p.centerChance) {
            return window.scrollX + window.innerWidth * (0.3 + Math.random() * 0.4);
        }
        const sideWidthPx = window.innerWidth * p.sideWidth;
        const onLeft = Math.random() < 0.5;
        return window.scrollX + (onLeft
            ? Math.random() * sideWidthPx
            : window.innerWidth - Math.random() * sideWidthPx);
    }

    function spawnRipple(pageX, pageY) {
        const dotColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--site-bg-glow-dot-color').trim();
        const dotGap = getComputedStyle(document.documentElement)
            .getPropertyValue('--site-bg-dot-gap').trim() || '28px';

        const peakAlpha = p.alpha;
        const maxRadius = rand(p.radius);
        const ringWidth = rand(p.ringWidth);
        const duration  = rand(p.duration);

        const el = document.createElement('div');
        el.style.cssText = `
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            z-index: 1;
            background-image: radial-gradient(circle, ${dotColor} 0.8px, transparent 1px);
            background-size: ${dotGap} ${dotGap};
            background-position: top left;
            mask-repeat: no-repeat;
            -webkit-mask-repeat: no-repeat;
        `;
        container.appendChild(el);

        const start = performance.now();

        function frame(now) {
            const t = Math.min((now - start) / duration, 1);
            const r = (1 - Math.pow(1 - t, 2)) * maxRadius;
            const alpha = peakAlpha * Math.sin(t * Math.PI);
            const innerEdge = Math.max(0, r - ringWidth * 0.5);

            const mask = `radial-gradient(circle at ${pageX}px ${pageY}px, transparent ${innerEdge}px, rgba(0,0,0,${alpha}) ${r}px, transparent ${r + ringWidth}px)`;
            el.style.maskImage = mask;
            el.style.webkitMaskImage = mask;

            if (t < 1) requestAnimationFrame(frame);
            else el.remove();
        }

        requestAnimationFrame(frame);
    }

    let scheduled = false;
    let nextDelayMs = Number.isFinite(Number(timeToFirstMs)) && timeToFirstMs >= 0
        ? Number(timeToFirstMs)
        : null;

    function scheduleNext() {
        if (!enableIdle || disableIdleDotRipple) return;
        if (scheduled) return;
        scheduled = true;
        const delay = nextDelayMs !== null ? nextDelayMs : rand(p.interval);
        nextDelayMs = null;

        dotRippleTimeoutId = setTimeout(() => {
            scheduled = false;
            dotRippleTimeoutId = null;
            const x = getSpawnX();
            const y = window.scrollY + window.innerHeight * (0.05 + Math.random() * 0.9);
            spawnRipple(x, y);
            scheduleNext();
        }, delay);
    }

    if (!disableIdleDotRipple) {
        scheduleNext();
        const x = getSpawnX();
        const y = window.scrollY + window.innerHeight * (0.05 + Math.random() * 0.9);
        spawnRipple(x, y);
    }

    dotRippleHandlers.click = (e) => {
        if (!isBgMode('Mid', 'High')) return;
        if (e.target.closest('a, button, input, textarea, select')) return;
        spawnRipple(
            e.clientX + window.scrollX,
            e.clientY + window.scrollY
        );
    };
    document.addEventListener('click', dotRippleHandlers.click);

    dotRippleHandlers.visibility = () => {
        if (!document.hidden && !disableIdleDotRipple) scheduleNext();
    };
    document.addEventListener('visibilitychange', dotRippleHandlers.visibility);
}

function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE
}

function scrollToBottom() {
    const body = document.body; // For Safari
    const html = document.documentElement; // For Chrome, Firefox, IE
    const bottom = Math.max(body.scrollHeight, html.scrollHeight); // Calculate the bottom position

    body.scrollTop = bottom; // For Safari
    html.scrollTop = bottom; // For Chrome, Firefox, IE
}

function goBack() {
    const referrer = document.referrer; // Get the previous page's URL
    const currentDomain = window.location.origin; // Get the current domain (e.g., https://example.com)

    if (referrer && referrer.startsWith(currentDomain)) {
        const referrerURL = new URL(referrer);

        // Check if the referrer is a proper page without just a hash fragment
        if (referrerURL.pathname !== window.location.pathname) {
            window.location.href = referrer; // Go back to the previous page
            return;
        }
    }

    // Fallback if no valid referrer: navigate to homepage or a default path
    window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', function () {
    const highlights = document.querySelectorAll('div.highlight');
    const blockquotes = document.querySelectorAll('blockquote');

    const upArrowSVG = document.getElementById('svg-up-arrow').innerHTML;
    const downArrowSVG = document.getElementById('svg-down-arrow').innerHTML;
    const checkSVG = document.getElementById('svg-check').innerHTML;
    const documentSVG = document.getElementById('svg-document').innerHTML;

    const BG_PERFORMANCE_KEY = 'BGPerformancePreference';
    const BG_LEVELS = ['None', 'Low', 'Mid', 'High'];
    const BG_LABELS = {
        en: ['BG Detail: None', 'BG Detail: Low', 'BG Detail: Mid', 'BG Detail: High'],
        vi: ['BG: Không', 'BG: Thấp', 'BG: Vừa', 'BG: Cao']
    };

    let bgPerformanceCooldown = false;

    const bgPerformanceLabel = document.getElementById('bgPerformanceLabel');
    const bgPerformanceBody = document.getElementById('collapseExpandAllButton');

    function getSavedBgPerformance() {
        const value = localStorage.getItem(BG_PERFORMANCE_KEY);
        if (value && BG_LEVELS.includes(value)) {
            return value;
        }

        if (!isHoverCapable) {
            return 'Low';
        }

        const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        return hasHover ? 'Mid' : 'Low';
    }

    function setBgPerformance(value) {
        if (!BG_LEVELS.includes(value)) return;
        const current = localStorage.getItem(BG_PERFORMANCE_KEY);
        if (current === value) return;
        localStorage.setItem(BG_PERFORMANCE_KEY, value);
    }

    function updateBgLabel(value) {
        if (!bgPerformanceLabel) return;
        const lang = document.documentElement.lang === 'vi' ? 'vi' : 'en';
        const index = BG_LEVELS.indexOf(value);
        const text = index >= 0 ? BG_LABELS[lang][index] : BG_LABELS[lang][0];
        bgPerformanceLabel.textContent = text;
    }

    function initBgPerformance() {
        const saved = getSavedBgPerformance();
        setBgPerformance(saved);
        updateBgLabel(saved);
        applyBgPerformanceMode(saved);
    }

    function cycleBgPerformance() {
        if (bgPerformanceCooldown) return;
        bgPerformanceCooldown = true;
        setTimeout(() => { bgPerformanceCooldown = false; }, 400);

        const current = getSavedBgPerformance();
        const nextValue = BG_LEVELS[(BG_LEVELS.indexOf(current) + 1) % BG_LEVELS.length];

        if (bgPerformanceBody) {
            bgPerformanceBody.classList.add('fade');
        }

        setTimeout(() => {
            setBgPerformance(nextValue);
            updateBgLabel(nextValue);
            applyBgPerformanceMode(nextValue);
            if (bgPerformanceBody) {
                bgPerformanceBody.classList.remove('fade');
            }
        }, 220);
    }

    initBgPerformance();

    function setupCollapseExpandAllButton() {
        const collapseExpandAllButton = document.getElementById('collapseExpandAllButton');
        if (collapseExpandAllButton) {
            collapseExpandAllButton.addEventListener('click', function () {
                cycleBgPerformance();
            });
        }
    }

    setupCollapseExpandAllButton();

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

function copyToClipboard(event, text) {
    navigator.clipboard.writeText(text).then(() => {
        const button = event.target.closest('button'); // Ensure button is the target
        button.classList.add('pulse-color'); // Add the color pulse effect
        setTimeout(() => {
            button.classList.remove('pulse-color'); // Remove the effect after animation
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function notifyComingSoon() {
    const overlay = document.getElementById('notify-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.animation = 'none';
        void overlay.offsetWidth;
        overlay.style.animation = 'notify-fade-in 0.3s ease';
        
        const container = document.getElementById('notify-container');
        if (container) {
            container.style.animation = 'none';
            void container.offsetWidth;
            container.style.animation = 'notify-slide-in 0.4s ease';
        }
    }
}

function dismissNotify() {
    const overlay = document.getElementById('notify-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.opacity = '';
            overlay.style.transition = '';
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('notify-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) dismissNotify();
        });
    }
});

function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');

    // Update Giscus theme
    const giscusTheme = isLight ? 'light_protanopia' : 'dark_protanopia';
    const iframe = document.querySelector('iframe.giscus-frame');
    if (iframe) {
        iframe.contentWindow.postMessage(
            { giscus: { setConfig: { theme: giscusTheme } } },
            'https://giscus.app'
        );
    }

    // Update Mermaid theme if the library is loaded
    if (typeof window.reinitializeMermaidViewer === 'function') {
        window.reinitializeMermaidViewer(!isLight);
    }
}

function onScroll() {
    const header = document.querySelector('#post-header');
    const navContainer = document.querySelector('.nav-container');

    if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10) {
        header.classList.add('transformed');
        navContainer.style.fontSize = '19px';
    } else {
        header.classList.remove('transformed');
        navContainer.style.fontSize = '';
    }
    const scrollButton = document.getElementById('scrollButton');
    if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
        scrollButton.classList.add('slide-in');
    } else {
        scrollButton.classList.remove('slide-in');
    }
}

window.addEventListener('scroll', onScroll, { passive: true });

function handleLogoClick() {
    // Check the scroll position
    if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
        // If the page is not at the top, scroll to the top
        scrollToTop();
    } else {
        // If the page is at the top, navigate to the home page
        window.location.href = '/';  // or simply use window.location.assign('/')
    }
}

const extraButton = document.querySelector('.extra-button');
const overlay = document.getElementById('overlay');
const optionsContainer = document.querySelector('.options-container');

if (overlay && overlay.parentElement !== document.body) {
    document.body.appendChild(overlay);
}

// Function to show the options container with the overlay
function showOptions() {
    overlay.style.display = 'flex'; // Show the overlay
    // Gradually apply the blur effect
    let blurAmount = 0;
    overlay.style.transition = 'backdrop-filter 0.5s ease';
    const interval = setInterval(() => {
        blurAmount += 1;
        overlay.style.backdropFilter = `blur(${blurAmount}px)`;
        if (blurAmount >= 5) {
            clearInterval(interval); // Stop once the blur reaches 5px
        }
    }, 50);

    setTimeout(() => {
        optionsContainer.classList.add('show'); // Add the 'show' class to animate the options container
    }, 10); // Short delay to trigger the transition
}

// Function to close the options container
function closeOptions() {
    optionsContainer.classList.remove('show'); // Remove the 'show' class to trigger the slide-up
    let blurAmount = 5;
    const interval = setInterval(() => {
        blurAmount -= 1;
        overlay.style.backdropFilter = `blur(${blurAmount}px)`;
        if (blurAmount <= 0) {
            clearInterval(interval); // Stop once the blur reaches 0
            overlay.style.display = 'none'; // Hide the overlay after the animation
        }
    }, 50); // Reduce the blur gradually

}

// Show options when the extra button is clicked
extraButton.addEventListener('click', showOptions);

// Close the options when clicking the overlay area
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        closeOptions();
    }
});

// Hook up the buttons by their IDs
const toTopButton = document.getElementById('toTopButton');
const themeButton = document.getElementById('themeButton');
const commentsButton = document.getElementById('commentsButton');
const closeButton = document.getElementById('closeButton');

// Add event listeners for functionality (placeholders for now)
toTopButton.addEventListener('click', () => {
    scrollToTop();
    closeOptions();
});

themeButton.addEventListener('click', () => {
    toggleTheme();
    closeOptions();
});

commentsButton.addEventListener('click', () => {
    scrollToBottom();
    closeOptions();
});

closeButton.addEventListener('click', () => {
    closeOptions();
});

const toBackButton = document.getElementById('toBackButton');
const toHomeButton = document.getElementById('toHomeButton');
const toArchiveButton = document.getElementById('toArchiveButton');
const toProjectsButton = document.getElementById('toProjectsButton');
const toAboutButton = document.getElementById('toAboutButton');

// Add event listeners for functionality (placeholders for now)
toBackButton.addEventListener('click', (e) => {
    e.preventDefault();
    closeOptions();
    goBack();
});

toHomeButton.addEventListener('click', (e) => {
    e.preventDefault();
    closeOptions();
    window.location.href = "/";
});

toArchiveButton.addEventListener('click', (e) => {
    e.preventDefault();
    closeOptions();
    window.location.href = "/archive";
});

toProjectsButton.addEventListener('click', (e) => {
    e.preventDefault();
    closeOptions();
    window.location.href = "/projects";
});

toAboutButton.addEventListener('click', (e) => {
    e.preventDefault();
    closeOptions();
    const currentLang = document.documentElement.lang;

    if (currentLang === "vi") {
        window.location.href = "/about-yuk-vi";
    } else {
        window.location.href = "/about-yuk-en";
    }
});

window.addEventListener('hashchange', function (e) {
    // Prevent default scroll
    e.preventDefault();

    // Get the target element
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }
});