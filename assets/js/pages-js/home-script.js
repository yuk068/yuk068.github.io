const swiperContainer = document.querySelector('.swiper-container');
const swiperWrapper = document.querySelector('.swiper-wrapper');
const slides = document.querySelectorAll('.swiper-slide');
const dots = document.querySelectorAll('.swiper-nav-dot');
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');
let currentSlide = 0;
const slideCount = slides.length;
const slideIntervalMs = 13500;
let autoplayTimeoutId = 0;
let progressRafId = 0;
let hoverTransitionRafId = 0;
const desktopSwiperTimerEnabled =
    window.matchMedia('(min-width: 791px)').matches &&
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

    function flushMousePosition() {
        root.style.setProperty('--home-bg-mouse-x', `${mouseX}px`);
        root.style.setProperty('--home-bg-mouse-y', `${mouseY}px`);
        rafId = 0;
    }

    window.addEventListener('mousemove', (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        root.style.setProperty('--home-bg-glow-opacity', '1');

        if (!rafId) {
            rafId = window.requestAnimationFrame(flushMousePosition);
        }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
        root.style.setProperty('--home-bg-glow-opacity', '0');
    });
}

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
    if (!desktopSwiperTimerEnabled) return;
    swiperContainer.style.setProperty('--swiper-border-progress', String(Math.min(Math.max(progress, 0), 1)));
}

function setSwiperHoverMix(mix) {
    if (!desktopSwiperTimerEnabled) return;
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
    if (!desktopSwiperTimerEnabled) {
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

function startSwiperProgressLoop(durationMs) {
    if (!desktopSwiperTimerEnabled) return;

    stopSwiperProgressLoop();
    setSwiperBorderProgress(0);
    const startedAt = performance.now();

    function tick(now) {
        const progress = durationMs <= 0 ? 1 : (now - startedAt) / durationMs;
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
    stopSwiperProgressLoop();
}

function scheduleSwiperAutoplay(delayMs = slideIntervalMs) {
    clearSwiperAutoplay();
    startSwiperProgressLoop(delayMs);
    autoplayTimeoutId = window.setTimeout(() => {
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

if (desktopSwiperTimerEnabled) {
    setSwiperHoverMix(0);

    swiperContainer.addEventListener('mouseenter', () => {
        isSwiperHovered = true;
        clearSwiperAutoplay();
        animateSwiperBorderState(1, 1, 260);
    });

    swiperContainer.addEventListener('mouseleave', () => {
        isSwiperHovered = false;
        animateSwiperBorderState(0, 0, 260, () => {
            if (isSwiperHovered) return;
            setSwiperBorderProgress(0);
            setSwiperHoverMix(0);
            resetSwiperAutoplay();
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
document.body.addEventListener('scroll', onScroll);

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
