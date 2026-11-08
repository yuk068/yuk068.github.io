/*
 * home-script.js - home page: highlights slider, projects strip, options/config menus.
 * Shared behaviour (theme, notify, scroll header, options overlay, clock, ...) is in ../common.js.
 */
(function () {
    const myStrings = [
        "Digital Twin",
        "Artificial Intelligence",
        "Simulation",
        "Autonomous Vehicle",
        "Machine Learning",
        "Deep Learning",
        "Mathematics",
        "Local LLM",
        "Data Visualization",
        // "日本語勉強してる",
        "Motion Planning",
        "Geo-locating"
    ];

    Site.rememberPreferredLanguage(document.documentElement.lang);


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

    Site.initScrollHeader({
        header: '#home-header',
        title: '#home-header-title',
        titleSize: '1.7em',
        navSize: '1.125rem',
        button: { at: 350 }
    });

    window.scrollProjects = function scrollProjects(direction) {
        const projectSection = document.querySelector('.project-section');
        
        const screenWidth = window.innerWidth;
        const scrollAmount = screenWidth > 1090 ? 750 : 400;

        // Horizontal scroll
        if (direction === 'left') {
            projectSection.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else if (direction === 'right') {
            projectSection.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }

        // Add vertical offset so section isn't flush to top
        const offsetTop = projectSection.getBoundingClientRect().top + window.scrollY - 100; // 100px space from top
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    };

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

    // Header text cycling disabled; uncomment to re-enable.
    // document.addEventListener('DOMContentLoaded', () => {
    //     initTypingEffect(myStrings);
    // });

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

    // ---------------------------------------------------------------------------------------------
    // Options (hamburger) menu - hamburger, backdrop and Close are wired by common.js
    // ---------------------------------------------------------------------------------------------
    Site.initOptionsOverlay();

    // Configuration overlay: unlike the shared version, the home page fades the backdrop blur in and out.
    // common.js wires its buttons and calls these through window.*.
    const configOverlay = document.getElementById('config-overlay');
    const configContainer = document.querySelector('.config-container');

    window.showConfiguration = function showConfiguration() {
        if (!configOverlay || !configContainer) {
            console.warn('showConfiguration: required elements not found');
            return;
        }

        const desktopToggle = document.getElementById('config-toggle-desktop');
        if (desktopToggle) {
            desktopToggle.setAttribute('aria-expanded', 'true');
        }

        configOverlay.style.display = 'flex';
        let blurAmount = 0;
        configOverlay.style.transition = 'backdrop-filter 0.5s ease';
        const interval = setInterval(() => {
            blurAmount += 1;
            configOverlay.style.backdropFilter = `blur(${blurAmount}px)`;
            if (blurAmount >= 5) {
                clearInterval(interval);
            }
        }, 50);

        setTimeout(() => {
            configContainer.classList.add('show');
        }, 10);
    };

    window.closeConfiguration = function closeConfiguration() {
        if (!configOverlay || !configContainer) {
            console.warn('closeConfiguration: required elements not found');
            return;
        }

        const desktopToggle = document.getElementById('config-toggle-desktop');
        if (desktopToggle) {
            desktopToggle.setAttribute('aria-expanded', 'false');
        }

        configContainer.classList.remove('show');
        let blurAmount = 5;
        const interval = setInterval(() => {
            blurAmount -= 1;
            configOverlay.style.backdropFilter = `blur(${blurAmount}px)`;
            if (blurAmount <= 0) {
                clearInterval(interval);
                configOverlay.style.display = 'none';
            }
        }, 50);
    };

    // Menu entries: close the menu, then go
    function onMenu(id, go) {
        document.getElementById(id).addEventListener('click', (e) => {
            e.preventDefault();
            closeOptions();
            go();
        });
    }

    onMenu('toArchiveButton', () => { window.location.href = '/archive'; });
    onMenu('toProjectsButton', () => { window.location.href = '/projects'; });
    onMenu('toAboutButton', () => {
        const lang = document.documentElement.lang;
        window.location.href = lang === 'vi' ? '/about-yuk-vi' : lang === 'ja' ? '/about-yuk-ja' : '/about-yuk-en';
    });

    // "Config" entry: swap the menu for the configuration overlay
    document.getElementById('themeButton').addEventListener('click', () => {
        closeOptions();
        showConfiguration();
    });
})();
