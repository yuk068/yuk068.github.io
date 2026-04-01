if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', function () {
    initSiteBackgroundEffect();
});

function initSiteBackgroundEffect() {
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

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    document.addEventListener('mouseleave', handleLeave);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            handleLeave();
        }
    });
}

function initDotRippleEffect(presetName = 'subtle', timeToFirstMs = null, enableIdle = true) {
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
        const rootInfo = { pSideWidth: p.sideWidth, pCenterChance: p.centerChance, innerWidth: window.innerWidth, scrollX: window.scrollX };
        let x;
        if (Math.random() < p.centerChance) {
            x = window.scrollX + window.innerWidth * (0.3 + Math.random() * 0.4);
            console.log('[archive ripple] getSpawnX center choice', rootInfo, 'x=', x);
            return x;
        }
        const sideWidthPx = window.innerWidth * p.sideWidth;
        const onLeft = Math.random() < 0.5;
        x = window.scrollX + (onLeft
            ? Math.random() * sideWidthPx
            : window.innerWidth - Math.random() * sideWidthPx);
        console.log('[archive ripple] getSpawnX edge choice', rootInfo, 'sideWidthPx=', sideWidthPx, 'onLeft=', onLeft, 'x=', x);
        return x;
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
        if (!enableIdle) {
            return;
        }
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

    if (enableIdle) scheduleNext();


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

initDotRippleEffect('subtle', 500, true);

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

function onScroll() {
    const header = document.querySelector('#archive-header');
    const headerTitle = document.querySelector('#archive-header-title');
    const navContainer = document.querySelector('.archive-nav-container');
    const isNarrowScreen = window.innerWidth <= 1400;

    if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10) {
        if (isNarrowScreen) {
            header.classList.add('transformed-tight');
            header.classList.remove('transformed');
        } else {
            header.classList.add('transformed');
            header.classList.remove('transformed-tight');
        }
        headerTitle.style.fontSize = '1.7em';
        navContainer.style.fontSize = '18px';
    } else {
        header.classList.remove('transformed', 'transformed-tight');
        headerTitle.style.fontSize = '';
        navContainer.style.fontSize = '';
    }

    const scrollButton = document.getElementById('scrollButton');
    if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
        scrollButton.classList.add('slide-in');
    } else {
        scrollButton.classList.remove('slide-in');
    }
}

// Reapply the scroll logic on resize to ensure correct classes are applied.
function onResize() {
    onScroll(); // Recheck the current scroll position and update classes accordingly.
}

// Add event listeners for scroll and resize
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onResize);

function scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function goBack() {
    const referrer = document.referrer;
    const currentDomain = window.location.origin;

    if (referrer && referrer.startsWith(currentDomain)) {
        window.history.back();
    } else {
        window.location.href = '/';
    }
}

const isSingleColumn = window.matchMedia('(max-width: 1400px)').matches;

function toggleLeftPanel() {
    const sidePanel = document.querySelector('.archive-side-panel-left');
    const isSingleColumn = window.matchMedia('(max-width: 1400px)').matches;

    if (isSingleColumn) {
        const container = document.querySelector('.archive-side-panel-left-container');
        if (container) {
            const offsetTop = getOffsetTop(container) - 100;
            document.body.scrollTop = offsetTop;
            document.documentElement.scrollTop = offsetTop;
        }
    } else {
        sidePanel.classList.toggle('active');
        localStorage.setItem('leftPanelState', sidePanel.classList.contains('active') ? 'open' : 'closed');
    }
}

function toggleRightPanel() {
    const sidePanel = document.querySelector('.archive-side-panel-right');
    const isSingleColumn = window.matchMedia('(max-width: 1400px)').matches;

    if (isSingleColumn) {
        const container = document.querySelector('.archive-side-panel-right-container');
        if (container) {
            const offsetTop = getOffsetTop(container) - 100;
            document.body.scrollTop = offsetTop;
            document.documentElement.scrollTop = offsetTop;
        }
    } else {
        sidePanel.classList.toggle('active');
        localStorage.setItem('rightPanelState', sidePanel.classList.contains('active') ? 'open' : 'closed');
    }
}

function getOffsetTop(element) {
    let offsetTop = 0;
    while (element) {
        offsetTop += element.offsetTop;
        element = element.offsetParent;
    }
    return offsetTop;
}

function initializePanelState() {
    const leftPanel = document.querySelector('.archive-side-panel-left');
    const rightPanel = document.querySelector('.archive-side-panel-right');
    const mq = window.matchMedia('(max-width: 1400px)');

    function updatePanelState() {
        if (mq.matches) {
            leftPanel.classList.remove('active');
            rightPanel.classList.remove('active');
            localStorage.removeItem('leftPanelState');
            localStorage.removeItem('rightPanelState');
        } else {
            const leftPanelState = localStorage.getItem('leftPanelState');
            const rightPanelState = localStorage.getItem('rightPanelState');

            if (leftPanelState === 'open') {
                leftPanel.classList.add('active');
            } else {
                leftPanel.classList.remove('active');
            }

            if (rightPanelState === 'open') {
                rightPanel.classList.add('active');
            } else {
                rightPanel.classList.remove('active');
            }
        }
    }

    mq.addEventListener('change', updatePanelState);
    updatePanelState();
}

document.addEventListener('DOMContentLoaded', initializePanelState);

// IMPORTANT: Master function to handle all filtering and pagination
document.addEventListener('DOMContentLoaded', () => {
    // Add empty state element to selections
    const tagButtons = document.querySelectorAll('.tag-filter-button');
    const categoryButtons = document.querySelectorAll('.filter-tools-container button');
    const searchBar = document.getElementById('search-bar');
    const mobileSearchBar = document.getElementById('search-bar-mobile');
    const posts = document.querySelectorAll('.post-card');
    const paginationNav = document.querySelector('.pagination-nav');
    const prevButton = document.querySelector('.pagination-prev');
    const nextButton = document.querySelector('.pagination-next');
    const paginationNumbers = document.querySelector('.pagination-numbers');
    const nothingHere = document.querySelector('.nothing-here');
    const sortReadingTimeBtn = document.getElementById('sort-reading-time-button');
    const sortReleaseDateBtn = document.getElementById('sort-release-date-button');

    // State
    let activeTags = new Set();
    let activeCategories = new Set();
    let searchText = '';
    let currentPage = 1;
    const postsPerPage = 6;
    let visiblePosts = [];

    // Pagination functions
    const updatePaginationButtons = () => {
        const pageCount = Math.ceil(visiblePosts.length / postsPerPage);
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === pageCount;

        paginationNumbers.innerHTML = '';

        // Helper function to create page button
        const createPageButton = (pageNum) => {
            const pageButton = document.createElement('button');
            pageButton.textContent = pageNum;
            pageButton.classList.toggle('active', pageNum === currentPage);
            pageButton.addEventListener('click', () => {
                currentPage = pageNum;
                updatePostsDisplay();
                updatePaginationButtons();
            });
            return pageButton;
        };

        // Helper function to create ellipsis
        const createEllipsis = () => {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.classList.add('pagination-ellipsis');
            return ellipsis;
        };

        // Always show first two pages
        paginationNumbers.appendChild(createPageButton(1));
        if (pageCount > 1) {
            paginationNumbers.appendChild(createPageButton(2));
        }

        // Handle ellipsis and last pages for more than 6 pages
        if (pageCount > 6) {
            // Show ellipsis if current page is not near the middle
            if (currentPage > 3) {
                paginationNumbers.appendChild(createEllipsis());
            }

            // Show current page if it's not in first 2 or last 2 pages
            if (currentPage > 2 && currentPage < pageCount - 1) {
                paginationNumbers.appendChild(createPageButton(currentPage));
            }

            // Show ellipsis if current page is not near the end
            if (currentPage < pageCount - 2) {
                paginationNumbers.appendChild(createEllipsis());
            }

            // Show last two pages
            paginationNumbers.appendChild(createPageButton(pageCount - 1));
            paginationNumbers.appendChild(createPageButton(pageCount));
        } else {
            // For 6 or fewer pages, show all page numbers
            for (let i = 3; i <= pageCount; i++) {
                paginationNumbers.appendChild(createPageButton(i));
            }
        }
    };

    const updateEmptyState = () => {
        const paginationTip = document.querySelector('.pagination-nav-tips');

        if (visiblePosts.length === 0) {
            paginationNav.style.display = 'none';
            nothingHere.classList.add('active');
            if (paginationTip) {
                paginationTip.style.display = 'none';
            }
        } else {
            paginationNav.style.display = 'flex';
            nothingHere.classList.remove('active');
            if (paginationTip) {
                paginationTip.style.display = 'block';
            }
        }
    };

    // Tag filtering functions
    const toggleTag = (button) => {
        const tag = button.getAttribute('data-tags').trim();  // Get the tag from the data-tags attribute

        button.classList.toggle('active');

        if (button.classList.contains('active')) {
            activeTags.add(tag);
        } else {
            activeTags.delete(tag);
        }

        updatePostsVisibility();
    };

    // Update active tags within posts
    const updateActivePostTags = () => {
        posts.forEach(postCard => {
            const tagElements = postCard.querySelectorAll('.post-tags .tag');
            tagElements.forEach(tagElement => {
                if (activeTags.has(tagElement.textContent.trim())) {
                    tagElement.classList.add('active');
                } else {
                    tagElement.classList.remove('active');
                }
            });
        });
    };

    // Category filtering functions
    const toggleCategory = (button) => {
        const category = button.id.replace('category-', '').replace('-filter-button', '');
        button.classList.toggle('active');

        if (button.classList.contains('active')) {
            activeCategories.add(category);
        } else {
            activeCategories.delete(category);
        }

        updatePostsVisibility();
    };

    // Combined post visibility update function
    const updatePostsVisibility = () => {
        // Reset current page when filters change
        currentPage = 1;

        // Create array of visible posts based on filters
        const allSortedPosts = updateSorting(Array.from(posts));

        // Then apply filters to the sorted posts
        visiblePosts = allSortedPosts.filter(postCard => {
            const post = postCard.querySelector('.post');
            const postTags = post.dataset.tags.split(',').map(tag => tag.trim().toLowerCase());
            const postCategories = post.dataset.categories.split(' ').map(cat => cat.trim().toLowerCase());
            const postTitle = postCard.querySelector('h2').textContent.toLowerCase();
            const postExcerpt = postCard.querySelector('.post-excerpt').textContent.toLowerCase();

            const lowerCaseActiveTags = new Set(Array.from(activeTags).map(tag => tag.toLowerCase()));
            const lowerCaseActiveCategories = new Set(Array.from(activeCategories).map(category => category.toLowerCase()));

            const hasAllTags = lowerCaseActiveTags.size === 0 ||
                Array.from(lowerCaseActiveTags).every(tag => postTags.includes(tag));

            const hasCategory = lowerCaseActiveCategories.size === 0 ||
                Array.from(lowerCaseActiveCategories).some(category => postCategories.includes(category));

            function normalizeSearchText(str) {
                return str
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/đ/g, 'd')
                    .replace(/Đ/g, 'D')
                    .toLowerCase()
                    .trim();
            }

            const normalizedSearchText = normalizeSearchText(searchText);
            const searchTerms = normalizedSearchText.split(/\s+/).filter(Boolean);

            const searchableContent = [
                normalizeSearchText(postTitle),
                normalizeSearchText(postExcerpt),
                ...postTags.map(tag => normalizeSearchText(tag))
            ].join(' ');

            const matchesSearch = searchTerms.length === 0 ||
                searchTerms.every(term => searchableContent.includes(term));


            return hasAllTags && hasCategory && matchesSearch;
        });

        // Clean up any existing animations
        allSortedPosts.forEach(post => {
            post.classList.remove('pulse');
        });

        // Update pagination and display
        updatePaginationButtons();
        updatePostsDisplay();

        updateActivePostTags();
    };

    let isFirstLoad = true;  // Flag to track the first load

    const updatePostsDisplay = () => {
        const sortedVisiblePosts = updateSorting(visiblePosts);
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;

        const postsContainer = document.querySelector('.posts');
        const paginationNav = postsContainer.querySelector('.pagination-nav');
        const paginationTip = postsContainer.querySelector('.pagination-nav-tips');

        // Hide all posts
        const postElements = postsContainer.querySelectorAll('.post-card');
        postElements.forEach(post => {
            post.style.display = 'none';
            post.classList.remove('pulse');
        });

        // Use a DocumentFragment to prevent multiple DOM repaints
        const fragment = document.createDocumentFragment();

        sortedVisiblePosts.slice(startIndex, endIndex).forEach(post => {
            post.style.display = 'block';
            fragment.appendChild(post); // Add to the invisible box

            if (!isFirstLoad) {
                requestAnimationFrame(() => {
                    post.classList.add('pulse');
                });
            }
        });

        // Append everything to the actual DOM in ONE single action
        postsContainer.insertBefore(fragment, paginationNav);

        isFirstLoad = false;
        
        // Ensure nav elements stay at the bottom
        postsContainer.appendChild(paginationNav);
        if (paginationTip) postsContainer.appendChild(paginationTip);

        updateEmptyState();
    };



    // Add event listener for animation end to remove pulse class
    posts.forEach(post => {
        post.addEventListener('animationend', () => {
            post.classList.remove('pulse');
        });
    });

    // Event listeners
    tagButtons.forEach(button => {
        button.addEventListener('click', () => toggleTag(button));
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => toggleCategory(button));
    });

    // Debounced Search
    let searchTimeout;
    const handleSearchInput = (e) => {
        const value = e.target.value;

        if (searchBar && e.target !== searchBar) searchBar.value = value;
        if (mobileSearchBar && e.target !== mobileSearchBar) mobileSearchBar.value = value;

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchText = value.toLowerCase().trim();
            updatePostsVisibility();
        }, 150); // Waits 150ms after they stop typing before calculating
    };

    if (searchBar) searchBar.addEventListener('input', handleSearchInput);
    if (mobileSearchBar) mobileSearchBar.addEventListener('input', handleSearchInput);

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePostsDisplay();
            updatePaginationButtons();
        }
    });

    nextButton.addEventListener('click', () => {
        const pageCount = Math.ceil(visiblePosts.length / postsPerPage);
        if (currentPage < pageCount) {
            currentPage++;
            updatePostsDisplay();
            updatePaginationButtons();
        }
    });

    // Sorting
    const sortState = {
        readingTime: 'default',
        releaseDate: 'default'
    };

    function updateSorting(posts) {
        const convertToDate = (dateStr) => {
            const [day, month, year] = dateStr.split('/');
            return new Date(`${year}-${month}-${day}`);
        };

        // console.log("Current sort state:", sortState); // Log the sort state

        if (sortState.releaseDate === 'default' && sortState.readingTime === 'default') {
            // console.log("Sorting by order (default)");
            posts.sort((a, b) => {
                const orderA = parseInt(a.querySelector('.post').dataset.order || '0', 10);
                const orderB = parseInt(b.querySelector('.post').dataset.order || '0', 10);
                return orderB - orderA;
            });
        } else if (sortState.releaseDate !== 'default') {
            // console.log(`Sorting by release date: ${sortState.releaseDate}`);
            posts.sort((a, b) => {
                const dateA = convertToDate(a.querySelector('.post').dataset.date);
                const dateB = convertToDate(b.querySelector('.post').dataset.date);
                return sortState.releaseDate === 'newest' ? dateB - dateA : dateA - dateB;
            });
        } else if (sortState.readingTime !== 'default') {
            // console.log(`Sorting by reading time: ${sortState.readingTime}`);
            posts.sort((a, b) => {
                const readingTimeA = parseInt(a.querySelector('.post').dataset.readingTime, 10);
                const readingTimeB = parseInt(b.querySelector('.post').dataset.readingTime, 10);
                return sortState.readingTime === 'longest' ? readingTimeB - readingTimeA : readingTimeA - readingTimeB;
            });
        }

        return posts;
    }



    function fadeText(button, newText, skipFade = false) {
        const span = button.querySelector('span');

        if (skipFade) {
            span.textContent = newText;
            return;
        }

        span.style.transition = 'opacity 0.5s';
        span.style.opacity = '0';

        setTimeout(() => {
            span.textContent = newText;
            span.style.opacity = '1';
        }, 300);
    }

    function toggleSortReleaseDate() {
        const btn = sortReleaseDateBtn;
        const states = {
            'default': 'newest',
            'newest': 'oldest',
            'oldest': 'default'
        };

        sortState.releaseDate = states[sortState.releaseDate] || 'default';

        const skipFade = sortState.readingTime === 'default';
        if (!skipFade) {
            sortState.readingTime = 'default';
            fadeText(sortReadingTimeBtn, 'Reading time');
            sortReadingTimeBtn.classList.remove('active');
        }

        if (sortState.releaseDate === 'default') {
            fadeText(btn, 'Release date');
            btn.classList.remove('active');
        } else {
            fadeText(btn, sortState.releaseDate.charAt(0).toUpperCase() + sortState.releaseDate.slice(1));
            btn.classList.add('active');
        }

        updatePostsVisibility();
    }

    function toggleSortReadingTime() {
        const btn = sortReadingTimeBtn;
        const states = {
            'default': 'longest',
            'longest': 'shortest',
            'shortest': 'default'
        };

        sortState.readingTime = states[sortState.readingTime] || 'default';

        const skipFade = sortState.releaseDate === 'default';
        if (!skipFade) {
            sortState.releaseDate = 'default';
            fadeText(sortReleaseDateBtn, 'Release date');
            sortReleaseDateBtn.classList.remove('active');
        }

        if (sortState.readingTime === 'default') {
            fadeText(btn, 'Reading time');
            btn.classList.remove('active');
        } else {
            fadeText(btn, sortState.readingTime.charAt(0).toUpperCase() + sortState.readingTime.slice(1));
            btn.classList.add('active');
        }

        updatePostsVisibility();
    }

    sortReleaseDateBtn.addEventListener('click', () => toggleSortReleaseDate());
    sortReadingTimeBtn.addEventListener('click', () => toggleSortReadingTime());

    updatePostsVisibility();
});

document.addEventListener("DOMContentLoaded", function () {
    const searchBarContainer = document.querySelector(".archive-search-bar");
    const mobileSearchBarContainer = document.querySelector(".archive-search-bar-mobile");
    const desktopSearchBar = document.getElementById("search-bar");
    const mobileSearchBar = document.getElementById("search-bar-mobile");

    const activeSearchBar = () => (window.innerWidth <= 1400 ? mobileSearchBar || desktopSearchBar : desktopSearchBar || mobileSearchBar);

    function setPlaceholder() {
        const text = 'Press " / " to search posts...';

        if (desktopSearchBar) desktopSearchBar.placeholder = text;
        if (mobileSearchBar) mobileSearchBar.placeholder = text;
    }

    function syncSearchBarValues(sourceBar) {
        const value = sourceBar?.value || '';
        if (desktopSearchBar && desktopSearchBar !== sourceBar) desktopSearchBar.value = value;
        if (mobileSearchBar && mobileSearchBar !== sourceBar) mobileSearchBar.value = value;
    }

    function updateSearchBar() {
        setPlaceholder();
        const sourceBar = activeSearchBar();
        if (sourceBar) {
            syncSearchBarValues(sourceBar);
        }
    }

    const searchInputHandler = (e) => {
        const text = e.target.value || '';
        if (desktopSearchBar) desktopSearchBar.value = text;
        if (mobileSearchBar) mobileSearchBar.value = text;

        const searchEvent = new Event('input', { bubbles: true });
        if (desktopSearchBar && e.target !== desktopSearchBar) desktopSearchBar.dispatchEvent(searchEvent);
        if (mobileSearchBar && e.target !== mobileSearchBar) mobileSearchBar.dispatchEvent(searchEvent);
    };

    if (desktopSearchBar) {
        desktopSearchBar.addEventListener('input', (e) => {
            syncSearchBarValues(e.target);
        });
    }

    if (mobileSearchBar) {
        mobileSearchBar.addEventListener('input', (e) => {
            syncSearchBarValues(e.target);
        });
    }

    updateSearchBar();
    window.addEventListener("resize", updateSearchBar);

    document.addEventListener("keydown", function (event) {
        const isTextInput = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
        const active = activeSearchBar();

        if (event.key === "/" && !isTextInput) {
            event.preventDefault();
            active?.focus();
        } else if (event.key === "Escape" && (document.activeElement === desktopSearchBar || document.activeElement === mobileSearchBar)) {
            document.activeElement.blur();
        } else if (event.key === "PageUp" && !isTextInput) {
            const prevButton = document.querySelector('.pagination-prev');
            if (prevButton && !prevButton.disabled) {
                event.preventDefault();
                prevButton.click();
            }
        } else if (event.key === "PageDown" && !isTextInput) {
            const nextButton = document.querySelector('.pagination-next');
            if (nextButton && !nextButton.disabled) {
                event.preventDefault();
                nextButton.click();
            }
        }
    });
});

function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}