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
let rippleCooldown = false;

const ABOUT_LANGS = ['en', 'vi', 'ja'];

function isSupportedLang(lang) {
    return ABOUT_LANGS.includes(lang);
}

function rememberPreferredLanguage(lang) {
    if (!isSupportedLang(lang)) return;
    try {
        localStorage.setItem('preferredLang', lang);
    } catch (error) {}
}

function getPreferredLanguage() {
    try {
        const lang = localStorage.getItem('preferredLang');
        return isSupportedLang(lang) ? lang : null;
    } catch (error) {
        return null;
    }
}

function getAboutLangFromPath(pathname) {
    const match = pathname.match(/\/about-yuk-(en|vi|ja)(?:\/)?$/);
    return match ? match[1] : null;
}

function buildAboutUrlForLang(lang) {
    const url = new URL(window.location.href);
    url.pathname = `/about-yuk-${lang}`;
    return url.toString();
}

function hasSameOriginReferrer() {
    if (!document.referrer) return false;
    try {
        return new URL(document.referrer).origin === window.location.origin;
    } catch (error) {
        return false;
    }
}

function maybeRedirectAboutLanguage() {
    const currentLang = getAboutLangFromPath(window.location.pathname);
    if (!currentLang || !hasSameOriginReferrer()) return false;
    const preferredLang = getPreferredLanguage();
    if (!preferredLang || preferredLang === currentLang) return false;
    window.location.replace(buildAboutUrlForLang(preferredLang));
    return true;
}

const didRedirect = maybeRedirectAboutLanguage();
if (!didRedirect) {
    rememberPreferredLanguage(document.documentElement.lang);
}

function bgModeValue(mode) {
    const map = { None: 0, Low: 1, Mid: 2, High: 3 };
    return map[mode] ?? 0;
}

function isBgMode(...modes) {
    return modes.includes(currentBgPerformanceMode);
}

function stopDotRippleEffect() {}

function stopSiteBackgroundEffect() {}

function applyBgPerformanceMode(mode) {
    currentBgPerformanceMode = mode;
}

// Site background effect is initialized through applyBgPerformanceMode() via initBgPerformance()
function initSiteBackgroundEffect() {}

function initDotRippleEffect(presetName = 'subtle', timeToFirstMs = null, enableIdle = true) {}

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

    // Fallback if no valid referrer: navigate to generalpage or a default path
    window.location.href = '/';
}

// Function to handle header transformation based on scroll position
function onScroll() {
    // Header elements
    const header = document.querySelector('#general-header');
    const headerTitle = document.querySelector('#general-header-title');
    const navContainer = document.querySelector('.nav-container');

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

function handleLogoClick() {
    window.location.href = '/';
}

function switchLanguage() {
    const currentLang = getAboutLangFromPath(window.location.pathname) || document.documentElement.lang || 'en';
    const currentIndex = ABOUT_LANGS.indexOf(currentLang);
    const nextLang = ABOUT_LANGS[(currentIndex + 1) % ABOUT_LANGS.length];
    rememberPreferredLanguage(nextLang);
    window.location.href = buildAboutUrlForLang(nextLang);
}

function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    const giscusFrame = document.querySelector('iframe.giscus-frame');
    if (giscusFrame) {
        giscusFrame.contentWindow.postMessage(
            { giscus: { setConfig: { theme: isLight ? 'light_protanopia' : 'dark_protanopia' } } },
            'https://giscus.app'
        );
    }
}



const configOverlay = document.getElementById('config-overlay');
const configContainer = document.querySelector('.config-container');
const configToggleDesktop = document.getElementById('config-toggle-desktop');
const themeToggleButton = document.getElementById('configThemeButton') || document.getElementById('configPlaceholder1');

const configCloseButton = document.getElementById('configCloseButton');

if (configOverlay && configOverlay.parentElement !== document.body) {
    document.body.appendChild(configOverlay);
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
    setTimeout(() => {
        configOverlay.style.display = 'none';
    }, 250);
}

if (configOverlay) {
    configOverlay.addEventListener('click', (e) => {
        if (e.target === configOverlay) closeConfiguration();
    });
}

if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
        toggleTheme();
        closeConfiguration();
    });
}



if (configCloseButton) {
    configCloseButton.addEventListener('click', closeConfiguration);
}

if (configToggleDesktop) {
    configToggleDesktop.addEventListener('click', showConfiguration);
}

