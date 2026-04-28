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



const configOverlay = document.getElementById('config-overlay');
const configContainer = document.querySelector('.config-container');
const configToggleDesktop = document.getElementById('config-toggle-desktop');
const themeToggleButton = document.getElementById('configThemeButton') || document.getElementById('configPlaceholder1');

const configCloseButton = document.getElementById('configCloseButton');

if (configOverlay && configOverlay.parentElement !== document.body) {
    document.body.appendChild(configOverlay);
}

document.addEventListener('DOMContentLoaded', function() {
    // Scroll to anchored project card if hash is present
    const hash = window.location.hash;

    if (configToggleDesktop) {
        configToggleDesktop.addEventListener('click', showConfiguration);
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
    const copyCatalogBtn = document.getElementById('copyCatalogBtn');
    const copyCatalogBody = document.getElementById('copyCatalogBody');
    const copyCatalogLabel = document.getElementById('copyCatalogLabel');
    let copyCatalogCooldown = false;

    if (copyCatalogBtn && copyCatalogBody && copyCatalogLabel) {
        copyCatalogBtn.addEventListener('click', () => {
            if (copyCatalogCooldown) return;
            copyCatalogCooldown = true;

            const projectCards = document.querySelectorAll('.project-card');
            let catalog = '';
            
            projectCards.forEach(card => {
                let title = '';
                const h2 = card.querySelector('.project-card-title h2');
                if (h2) {
                    const clonedH2 = h2.cloneNode(true);
                    const span = clonedH2.querySelector('span');
                    if (span) span.remove();
                    title = clonedH2.textContent.trim();
                }
                
                let date = '';
                const dateSpans = card.querySelectorAll('.project-card-date span');
                dateSpans.forEach(span => {
                    const text = span.textContent || span.innerText;
                    if (text && text.trim()) {
                        date = text.trim();
                    }
                });
                
                let description = '';
                const p = card.querySelector('.project-card-preview-text p');
                if (p) {
                    description = p.textContent.trim();
                }
                
                if (title && description) {
                    catalog += `### ${title} (${date})\n\n${description}\n\n`;
                }
            });
            
            catalog = catalog.trim();
            
            if (catalog) {
                navigator.clipboard.writeText(catalog).then(() => {
                    copyCatalogBody.style.opacity = '0';
                    setTimeout(() => {
                        copyCatalogLabel.textContent = 'Copied!';
                        copyCatalogBody.style.opacity = '1';
                        
                        setTimeout(() => {
                            copyCatalogBody.style.opacity = '0';
                            setTimeout(() => {
                                copyCatalogLabel.textContent = 'Copy Catalog';
                                copyCatalogBody.style.opacity = '1';
                                copyCatalogCooldown = false;
                            }, 200);
                        }, 2000);
                    }, 200);
                }).catch(err => {
                    console.error('Failed to copy catalog: ', err);
                    copyCatalogCooldown = false;
                });
            } else {
                copyCatalogCooldown = false;
            }
        });
    }
});



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

function initSiteBackgroundEffect() {}

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

    // Fallback if no valid referrer: navigate to projects page or a default path
    window.location.href = '/';
}

function handleLogoClick() {
    window.location.href = '/';
}

function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}
