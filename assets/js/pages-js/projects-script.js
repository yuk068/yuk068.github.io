if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
const disableDotBackgroundEffects = false; // now controlled by BG mode

let currentBgPerformanceMode = 'High';
let siteBgEffectInitialized = false;
let dotRippleInitialized = false;
let dotRippleTimeoutId = null;
let dotRippleScheduled = false;
let siteBgHandlers = { move: null, scroll: null, leave: null, visibility: null };
let dotRippleHandlers = { click: null, visibility: null };

function bgModeValue(mode) {
    const map = { None: 0, Low: 1, Mid: 2, High: 3 };
    return map[mode] ?? 0;
}

function isBgMode(...modes) {
    return modes.includes(currentBgPerformanceMode);
}

function stopDotRippleEffect() {
    dotRippleInitialized = false;
    dotRippleScheduled = false;
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
    if (siteBgHandlers.move) { window.removeEventListener('mousemove', siteBgHandlers.move, { passive: true }); siteBgHandlers.move = null; }
    if (siteBgHandlers.scroll) { window.removeEventListener('scroll', siteBgHandlers.scroll, { passive: true }); siteBgHandlers.scroll = null; }
    if (siteBgHandlers.leave) { document.removeEventListener('mouseleave', siteBgHandlers.leave); siteBgHandlers.leave = null; }
    if (siteBgHandlers.visibility) { document.removeEventListener('visibilitychange', siteBgHandlers.visibility); siteBgHandlers.visibility = null; }
    siteBgEffectInitialized = false;
}

function applyBgPerformanceMode(mode) {
    currentBgPerformanceMode = mode;
    const siteBgEffects = document.querySelector('.site-bg-effects');
    const siteBgGlow = document.querySelector('.site-bg-glow');

    if (mode === 'None') {
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

    if (siteBgEffects) siteBgEffects.style.display = 'block';
    if (siteBgGlow) siteBgGlow.style.opacity = '1';
    initSiteBackgroundEffect();
    initDotRippleEffect('justright', 500, mode === 'High');
}

const BG_PERFORMANCE_KEY = 'BGPerformancePreference';
const BG_LEVELS = ['None', 'Low', 'Mid', 'High'];
const BG_LABELS = {
    en: ['BG Detail: None', 'BG Detail: Low', 'BG Detail: Mid', 'BG Detail: High'],
    vi: ['BG: Không', 'BG: Thấp', 'BG: Vừa', 'BG: Cao']
};
let bgPerformanceCooldown = false;

const configOverlay = document.getElementById('config-overlay');
const configContainer = document.querySelector('.config-container');
const configToggleDesktop = document.getElementById('config-toggle-desktop');
const themeToggleButton = document.getElementById('configThemeButton') || document.getElementById('configPlaceholder1');
const bgPerformanceCycleButton = document.getElementById('configBgButton') || document.getElementById('configPlaceholder2');
const bgPerformanceBody = document.getElementById('bgPerformanceBody');
const configBgLabel = document.getElementById('configBgLabel') || document.getElementById('bgPerformanceLabel');
const configCloseButton = document.getElementById('configCloseButton');

if (configOverlay && configOverlay.parentElement !== document.body) {
    document.body.appendChild(configOverlay);
}

document.addEventListener('DOMContentLoaded', function() {
    // Scroll to anchored project card if hash is present
    const hash = window.location.hash;
    initBgPerformance();

    if (configToggleDesktop) {
        configToggleDesktop.addEventListener('click', showConfiguration);
    }
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            toggleTheme();
            closeConfiguration();
        });
    }
    if (bgPerformanceCycleButton) {
        bgPerformanceCycleButton.addEventListener('click', () => {
            cycleBgPerformance();
        });
    }
    if (configCloseButton) {
        configCloseButton.addEventListener('click', closeConfiguration);
    }
    if (configOverlay) {
        configOverlay.addEventListener('click', (event) => {
            if (event.target === configOverlay) closeConfiguration();
        });
    }
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeConfiguration();
    });

    if (hash) {
        const target = document.querySelector(hash);
        if (target) {
            // Use a short delay to let layout settle
            setTimeout(function() {
                const header = document.querySelector('#projects-header');
                const headerHeight = header ? header.offsetHeight : 100;
                const offsetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });

                // Glow effect for card border + image
                const clearGlow = () => {
                    target.style.borderColor = '';
                    const cardImage = target.querySelector('.project-card-image-container');
                    if (cardImage) cardImage.style.borderColor = '';
                    const projectImg = target.querySelector('.project-card-image-container img');
                    if (projectImg) projectImg.style.boxShadow = '';
                };

                target.style.transition = 'border-color 0.4s ease';
                target.style.borderColor = 'var(--neon-aqua-accent)';

                const cardImage = target.querySelector('.project-card-image-container');
                if (cardImage) {
                    cardImage.style.transition = 'border-color 0.4s ease';
                    cardImage.style.borderColor = 'var(--neon-aqua-accent)';
                }

                const projectImg = target.querySelector('.project-card-image-container img');
                if (projectImg) {
                    projectImg.style.transition = 'box-shadow 0.4s ease';
                    projectImg.style.boxShadow = '0 0 0 3px rgba(155, 232, 255, 0.75)';
                }

                setTimeout(clearGlow, 2000);
            }, 100);
        }
    }
});

function getSavedBgPerformance() {
    const value = localStorage.getItem(BG_PERFORMANCE_KEY);
    if (value && BG_LEVELS.includes(value)) {
        return value;
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
    if (!configBgLabel) return;
    const lang = document.documentElement.lang === 'vi' ? 'vi' : 'en';
    const index = BG_LEVELS.indexOf(value);
    configBgLabel.textContent = BG_LABELS[lang][index >= 0 ? index : 0];
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
    const next = BG_LEVELS[(BG_LEVELS.indexOf(current) + 1) % BG_LEVELS.length];

    if (bgPerformanceBody) {
        bgPerformanceBody.classList.add('fade');
    }

    setTimeout(() => {
        setBgPerformance(next);
        updateBgLabel(next);
        applyBgPerformanceMode(next);
        if (bgPerformanceBody) {
            bgPerformanceBody.classList.remove('fade');
        }
    }, 220);
}

function showConfiguration() {
    if (!configOverlay || !configContainer) return;
    if (configToggleDesktop) configToggleDesktop.setAttribute('aria-expanded', 'true');
    configOverlay.style.display = 'flex';
    setTimeout(() => configContainer.classList.add('show'), 10);
}

function closeConfiguration() {
    if (!configOverlay || !configContainer) return;
    if (configToggleDesktop) configToggleDesktop.setAttribute('aria-expanded', 'false');
    configContainer.classList.remove('show');
    setTimeout(() => { configOverlay.style.display = 'none'; }, 250);
}

function initSiteBackgroundEffect() {
    if (siteBgEffectInitialized) return;
    if (!isBgMode('Mid', 'High')) return;

    if (disableDotBackgroundEffects) return;
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

function onScroll() {
    // Header elements
    const header = document.querySelector('#projects-header');
    const headerTitle = document.querySelector('#projects-header-title');
    const navContainer = document.querySelector('.nav-container');
    
    // Scroll button element
    const scrollButton = document.getElementById('scrollButton');

    // Header transformation based on scroll
    if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10) { 
        header.classList.add('transformed');
        headerTitle.style.fontSize = '1.7em';
        navContainer.style.fontSize = '18px';
    } else {
        header.classList.remove('transformed');
        headerTitle.style.fontSize = '';
        navContainer.style.fontSize = '';
    }

    // Scroll button visibility based on scroll position
    if (document.body.scrollTop > 600 || document.documentElement.scrollTop > 600) { 
        scrollButton.classList.add('slide-in');
    } else {
        scrollButton.classList.remove('slide-in');
    }
}

// Add the scroll event listener
window.addEventListener('scroll', onScroll, { passive: true });

// Function to scroll to the top when the button is clicked
function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE
}

function notifyComingSoon() {
    const overlay = document.getElementById('notify-overlay');
    if (!overlay) return;

    overlay.style.display = 'flex';
    overlay.style.animation = 'notify-fade-in 0.3s ease';

    const container = document.getElementById('notify-container');
    if (container) {
        container.style.animation = 'notify-slide-in 0.4s ease';
    }

    const closeBtn = document.getElementById('notify-close-btn');
    
    function dismiss() {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.opacity = '1';
        }, 300);
        
        if (closeBtn) closeBtn.removeEventListener('click', dismiss);
        overlay.removeEventListener('click', overlayClick);
    }
    
    function overlayClick(e) {
        if (e.target === overlay) dismiss();
    }

    if (closeBtn) closeBtn.addEventListener('click', dismiss);
    overlay.addEventListener('click', overlayClick);
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
            ringWidth:    { min: 50,  max: 100  },
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
        if (!enableIdle || disableIdleDotRipple) {
            return;
        }
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

    // Fallback if no valid referrer: navigate to projects page or a default path
    window.location.href = '/';
}

function handleLogoClick() {
    // Check the scroll position
    if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
        // If the page is not at the top, scroll to the top
        scrollToTop();
    } else {
        // If the page is at the top, navigate to the projects page
        window.location.href = '/';  // or simply use window.location.assign('/')
    }
}

function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}
