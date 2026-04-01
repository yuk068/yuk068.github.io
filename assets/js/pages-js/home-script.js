const myStrings = [
    "Digital Twin",
    "Artificial Intelligence",
    "Simulation",
    "Autonomous Vehicle",
    "Machine Learning",
    "Deep Learning",
    "Mathematics",
    "Local LLM",
    "Data Visualization"
];

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Home header desktop title configuration
const initialWaitMs = 10500;      // Time sitting on original text (no caret)
const postOriginalCaretWaitMs = 2000; // Time caret stays on retyped original text before it disappears
const pauseAfterTypingMs = 2500; // Time sitting on a list item
const typingSpeedMs = 70;
const deletingSpeedMs = 35;

const swiperContainer = document.querySelector('.swiper-container');
const swiperWrapper = document.querySelector('.swiper-wrapper');
const slides = document.querySelectorAll('.swiper-slide');
const dots = document.querySelectorAll('.swiper-nav-dot');
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');
let currentSlide = 0;
const slideCount = slides.length;
const slideIntervalMs = 13500;
const minResumeAutoplayWindowMs = 3000;
let autoplayTimeoutId = 0;
let progressRafId = 0;
let hoverTransitionRafId = 0;
let autoplayDeadlineMs = 0;
let pausedAutoplayRemainingMs = slideIntervalMs;
let pausedAutoplayProgress = 0;
let slideResumeGraceApplied = false;
const hoverCapableSwiperTimerEnabled =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let isSwiperHovered = false;
function initHomeBackgroundEffect() {
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
        root.style.setProperty('--home-bg-mouse-x', `${mouseX}px`);
        root.style.setProperty('--home-bg-mouse-y', `${mouseY}px`);
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

        root.style.setProperty('--home-bg-glow-opacity', '1');
        updatePosition();
    }

    function handleScroll() {
        updatePosition();
    }

    function handleLeave() {
        root.style.setProperty('--home-bg-glow-opacity', '0');
    }

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    document.addEventListener('mouseleave', handleLeave);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            handleLeave();
        }
    });
}

function initDotRippleEffect(presetName = 'subtle', timeToFirstMs = null) {
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

    const container = document.querySelector('.home-bg-effects');
    if (!container) { console.error('[ripple] .home-bg-effects not found'); return; }

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
            .getPropertyValue('--home-bg-glow-dot-color').trim();
        const dotGap = getComputedStyle(document.documentElement)
            .getPropertyValue('--home-bg-dot-gap').trim() || '28px';

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
        if (scheduled) return;
        scheduled = true;

        const delay = nextDelayMs !== null ? nextDelayMs : rand(p.interval);
        nextDelayMs = null;

        setTimeout(() => {
            scheduled = false;
            const x = getSpawnX();
            const y = window.scrollY + window.innerHeight * (0.05 + Math.random() * 0.9);
            spawnRipple(x, y);
            scheduleNext();
        }, delay);
    }

    scheduleNext();

    document.addEventListener('click', (e) => {
        if (e.target.closest('a, button, input, textarea, select')) return;
        spawnRipple(
            e.clientX + window.scrollX,
            e.clientY + window.scrollY
        );
    });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) scheduleNext();
    });
}

initDotRippleEffect('justright', 5500);


// Drag variables
let isDragging = false;
let hasDragged = false;
let startX, startY, startTranslateX;

function goToSlide(index) {
    currentSlide = index;
    swiperWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentSlide].classList.add('active');
}

function setSwiperBorderProgress(progress) {
    if (!hoverCapableSwiperTimerEnabled) return;
    swiperContainer.style.setProperty('--swiper-border-progress', String(Math.min(Math.max(progress, 0), 1)));
}

function setSwiperHoverMix(mix) {
    if (!hoverCapableSwiperTimerEnabled) return;
    swiperContainer.style.setProperty('--swiper-hover-mix', String(Math.min(Math.max(mix, 0), 1)));
}

function readSwiperVar(name, fallback = 0) {
    const value = parseFloat(getComputedStyle(swiperContainer).getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
}

function stopSwiperHoverTransition() {
    if (hoverTransitionRafId) {
        cancelAnimationFrame(hoverTransitionRafId);
        hoverTransitionRafId = 0;
    }
}

function animateSwiperBorderState(targetProgress, targetHoverMix, durationMs, onComplete) {
    if (!hoverCapableSwiperTimerEnabled) {
        if (onComplete) onComplete();
        return;
    }

    stopSwiperHoverTransition();

    const startProgress = readSwiperVar('--swiper-border-progress', 0);
    const startHoverMix = readSwiperVar('--swiper-hover-mix', 0);
    const startedAt = performance.now();

    function tick(now) {
        const elapsed = now - startedAt;
        const t = durationMs <= 0 ? 1 : Math.min(elapsed / durationMs, 1);
        const eased = 1 - Math.pow(1 - t, 3);

        setSwiperBorderProgress(startProgress + (targetProgress - startProgress) * eased);
        setSwiperHoverMix(startHoverMix + (targetHoverMix - startHoverMix) * eased);

        if (t < 1) {
            hoverTransitionRafId = requestAnimationFrame(tick);
            return;
        }

        hoverTransitionRafId = 0;
        if (onComplete) onComplete();
    }

    hoverTransitionRafId = requestAnimationFrame(tick);
}

function stopSwiperProgressLoop() {
    if (progressRafId) {
        cancelAnimationFrame(progressRafId);
        progressRafId = 0;
    }
}

function startSwiperProgressLoop(durationMs, initialProgress = 0) {
    if (!hoverCapableSwiperTimerEnabled) return;

    stopSwiperProgressLoop();
    const safeInitialProgress = Math.min(Math.max(initialProgress, 0), 1);
    setSwiperBorderProgress(safeInitialProgress);
    const startedAt = performance.now();

    function tick(now) {
        const t = durationMs <= 0 ? 1 : (now - startedAt) / durationMs;
        const progress = safeInitialProgress + (1 - safeInitialProgress) * t;
        setSwiperBorderProgress(progress);
        if (progress < 1) {
            progressRafId = requestAnimationFrame(tick);
        } else {
            progressRafId = 0;
        }
    }

    progressRafId = requestAnimationFrame(tick);
}

function clearSwiperAutoplay() {
    if (autoplayTimeoutId) {
        clearTimeout(autoplayTimeoutId);
        autoplayTimeoutId = 0;
    }
    autoplayDeadlineMs = 0;
    stopSwiperProgressLoop();
}

function getSwiperAutoplayRemainingMs() {
    if (!autoplayTimeoutId || !autoplayDeadlineMs) return slideIntervalMs;
    return Math.max(autoplayDeadlineMs - performance.now(), 0);
}

function scheduleSwiperAutoplay(delayMs = slideIntervalMs, initialProgress = 0, preserveSlideGrace = false) {
    if (!preserveSlideGrace) {
        slideResumeGraceApplied = false;
    }

    clearSwiperAutoplay();

    // FIX 2: If the swiper is currently being hovered (e.g., user clicked a dot or arrow),
    // update the paused variables but do not start the actual countdown loop.
    if (isSwiperHovered) {
        pausedAutoplayRemainingMs = delayMs;
        pausedAutoplayProgress = initialProgress;
        return;
    }

    autoplayDeadlineMs = performance.now() + delayMs;
    startSwiperProgressLoop(delayMs, initialProgress);
    autoplayTimeoutId = window.setTimeout(() => {
        autoplayDeadlineMs = 0;
        autoAdvanceSlide();
    }, delayMs);
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slideCount;
    goToSlide(currentSlide);
    scheduleSwiperAutoplay(slideIntervalMs);
}

function autoAdvanceSlide() {
    if (isSwiperHovered) return;
    nextSlide();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slideCount) % slideCount;
    goToSlide(currentSlide);
    scheduleSwiperAutoplay(slideIntervalMs);
}

function resetSwiperAutoplay() {
    scheduleSwiperAutoplay(slideIntervalMs);
}

function dragStart(e) {
    isDragging = true;
    hasDragged = false; // Reset drag detection
    startX = e.pageX || e.touches[0].pageX;
    startY = e.pageY || e.touches[0].pageY;
    startTranslateX = parseFloat(swiperWrapper.style.transform.replace('translateX(', '').replace('%)', '')) || 0;

    // Stop auto-sliding during drag
    clearSwiperAutoplay();
}

function dragMove(e) {
    if (!isDragging) return;

    const x = e.pageX || e.touches[0].pageX;
    const y = e.pageY || e.touches[0].pageY;
    const xDelta = (x - startX);
    const yDelta = (y - startY);

    // If vertical scroll is more significant, allow default behavior
    if (Math.abs(yDelta) > Math.abs(xDelta)) {
        isDragging = false; // Cancel dragging
        return;
    }

    hasDragged = true; // Mark as dragged for horizontal movement

    const dragDelta = xDelta / swiperContainer.offsetWidth * 100;
    const newTranslateX = startTranslateX - dragDelta;
    swiperWrapper.style.transform = `translateX(-${newTranslateX}%)`;

    // Prevent vertical scrolling
    e.preventDefault();
}

function dragEnd(e) {
    if (!isDragging) return;

    isDragging = false;

    // Skip navigation logic if no dragging occurred
    if (!hasDragged) {
        resetSwiperAutoplay();
        return;
    }

    const x = e.pageX || e.changedTouches[0].pageX;
    const dragDelta = (x - startX) / swiperContainer.offsetWidth;

    // Determine slide change based on drag distance
    if (dragDelta > 0.2) {
        prevSlide();
    } else if (dragDelta < -0.2) {
        nextSlide();
    } else {
        // Snap back to current slide
        goToSlide(currentSlide);
    }

    // Restart auto-sliding
    resetSwiperAutoplay();
}

// Event listeners for drag interaction
swiperWrapper.addEventListener('mousedown', dragStart);
swiperWrapper.addEventListener('mousemove', dragMove);
swiperWrapper.addEventListener('mouseup', dragEnd);
swiperWrapper.addEventListener('mouseleave', dragEnd);

// Touch events for mobile
swiperWrapper.addEventListener('touchstart', dragStart);
swiperWrapper.addEventListener('touchmove', dragMove);
swiperWrapper.addEventListener('touchend', dragEnd);

// Existing dot and button event listeners
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        goToSlide(index);
        resetSwiperAutoplay();
    });
});

nextButton.addEventListener('click', nextSlide);
prevButton.addEventListener('click', prevSlide);

if (hoverCapableSwiperTimerEnabled) {
    setSwiperHoverMix(0);

    swiperContainer.addEventListener('mouseenter', () => {
        isSwiperHovered = true;
        
        // FIX 1: Only capture the remaining time and progress if the timer is ACTUALLY running.
        // If we enter during a recent mouseleave animation, we retain our accurate paused values.
        if (autoplayTimeoutId) {
            pausedAutoplayRemainingMs = getSwiperAutoplayRemainingMs();
            pausedAutoplayProgress = readSwiperVar('--swiper-border-progress', 0);
        }
        
        clearSwiperAutoplay();
        animateSwiperBorderState(1, 1, 260);
    });

    swiperContainer.addEventListener('mouseleave', () => {
        isSwiperHovered = false;
        let resumedDelayMs = pausedAutoplayRemainingMs;
        if (!slideResumeGraceApplied && resumedDelayMs < minResumeAutoplayWindowMs) {
            resumedDelayMs = minResumeAutoplayWindowMs;
            slideResumeGraceApplied = true;
        }

        const resumedProgress = Math.min(Math.max(pausedAutoplayProgress, 0), 1);

        animateSwiperBorderState(resumedProgress, 0, 260, () => {
            if (isSwiperHovered) return;
            scheduleSwiperAutoplay(resumedDelayMs, resumedProgress, true);
        });
    });
}

// // Pause the slide interval on hover
// swiperContainer.addEventListener('mouseover', () => clearInterval(interval));
// swiperContainer.addEventListener('mouseout', () => resetInterval());

// Start the initial interval
scheduleSwiperAutoplay(slideIntervalMs);
initHomeBackgroundEffect();

// Function to handle header transformation based on scroll position
function onScroll() {
    // Header elements
    const header = document.querySelector('#home-header');
    const headerTitle = document.querySelector('#home-header-title');
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
    if (document.body.scrollTop > 350 || document.documentElement.scrollTop > 350) { 
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

function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

function scrollProjects(direction) {
    const projectSection = document.querySelector('.project-section');
    
    // Dynamically adjust scroll amount based on screen width
    const screenWidth = window.innerWidth;
    const scrollAmount = screenWidth > 1090 ? 750 : 400; // Larger scroll on wide screens, smaller on small screens

    if (direction === 'left') {
        projectSection.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (direction === 'right') {
        projectSection.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}


function updateButtonVisibility() {
    const projectSection = document.querySelector('.project-section');
    const leftButton = document.querySelector('.scroll-button.left');
    const rightButton = document.querySelector('.scroll-button.right');

    // Add or remove the 'hidden' class based on scroll position
    if (projectSection.scrollLeft <= 0) {
        leftButton.classList.add('hidden');
    } else {
        leftButton.classList.remove('hidden');
    }

    if (
        projectSection.scrollLeft >=
        projectSection.scrollWidth - projectSection.clientWidth - 10
    ) {
        rightButton.classList.add('hidden');
    } else {
        rightButton.classList.remove('hidden');
    }
}

async function initTypingEffect(stringList) {
    const elements = document.querySelectorAll('.home-header-title-desktop h1');
    if (elements.length === 0) return;

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Helper to update all target h1 elements at once
    const updateText = (text) => {
        elements.forEach(el => el.textContent = text);
    };

    // Helper to toggle caret class
    const setCaret = (isActive) => {
        elements.forEach(el => {
            if (isActive) el.classList.add('typing-active');
            else el.classList.remove('typing-active');
        });
    };

    async function runCycle() {
        // Capture the original text from the HTML
        const originalText = elements[0].textContent;

        // Track items not shown in the current pass
        let remainingTexts = [...stringList];

        while (true) {
            // Refill when all entries have been shown
            if (remainingTexts.length === 0) {
                remainingTexts = [...stringList];
            }

            // 1. WAIT: 2 seconds with the original text visible and NO caret
            setCaret(false);
            await sleep(initialWaitMs);

            // 2. INITIALIZE: Show caret and delete original text
            setCaret(true);
            for (let i = originalText.length; i >= 0; i--) {
                updateText(originalText.substring(0, i));
                await sleep(deletingSpeedMs);
            }
            await sleep(300);

            // 3. LIST LOOP: Type and delete up to 3 unique random strings per cycle
            const batchSize = Math.min(3, remainingTexts.length);
            const batch = [];
            for (let i = 0; i < batchSize; i++) {
                const randomIndex = Math.floor(Math.random() * remainingTexts.length);
                batch.push(remainingTexts.splice(randomIndex, 1)[0]);
            }

            for (const text of batch) {
                // Type it out
                for (let i = 0; i <= text.length; i++) {
                    updateText(text.substring(0, i));
                    await sleep(typingSpeedMs);
                }

                // Pause to let them read the list item
                await sleep(pauseAfterTypingMs);

                // Delete it
                for (let i = text.length; i >= 0; i--) {
                    updateText(text.substring(0, i));
                    await sleep(deletingSpeedMs);
                }
                await sleep(300);
            }

            // 4. RETURN: Type the original text back out
            for (let i = 0; i <= originalText.length; i++) {
                updateText(originalText.substring(0, i));
                await sleep(typingSpeedMs);
            }

            // Hold caret on the original text for a while before the cycle reset.
            await sleep(postOriginalCaretWaitMs);

            // The loop now restarts, hitting the top where caret is removed and it waits initialWaitMs
        }
    }

    runCycle();
}

document.addEventListener('DOMContentLoaded', () => {
    initTypingEffect(myStrings);
});

// Attach scroll event listener to update visibility dynamically
document.addEventListener('DOMContentLoaded', () => {
    const projectSection = document.querySelector('.project-section');
    const rightButton = document.querySelector('.scroll-button.right');

    // Ensure right button is visible initially
    rightButton.classList.remove('hidden');

    // Add scroll event listener to update visibility
    projectSection.addEventListener('scroll', updateButtonVisibility);

    // Initial visibility update
    updateButtonVisibility();
});

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

const extraButton = document.querySelector('.extra-button');
const overlay = document.getElementById('overlay');
const optionsContainer = document.querySelector('.options-container');

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
const toArchiveButton = document.getElementById('toArchiveButton');
const toProjectsButton = document.getElementById('toProjectsButton');
const themeButton = document.getElementById('themeButton');
const toAboutButton = document.getElementById('toAboutButton');
const closeButton = document.getElementById('closeButton');

// Add event listeners for functionality (placeholders for now)
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

themeButton.addEventListener('click', () => {
    toggleTheme();
    closeOptions();
});

toAboutButton.addEventListener('click', (e) => {
    e.preventDefault();
    closeOptions();
    window.location.href = "/about-yuk-en";
});

closeButton.addEventListener('click', () => {
    closeOptions();
});
