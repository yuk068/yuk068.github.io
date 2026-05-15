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

document.addEventListener('DOMContentLoaded', function () {


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
});

function initSiteBackgroundEffect() {}

function initDotRippleEffect(presetName = 'subtle', timeToFirstMs = null, enableIdle = true) {}

function handleLogoClick() {
    window.location.href = '/';
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

function getScroller() {
    return window.innerWidth <= 768
        ? document.querySelector('.main-container')
        : document.documentElement;
}

function onScroll() {
    const header = document.querySelector('#archive-header');
    const headerTitle = document.querySelector('#archive-header-title');
    const navContainer = document.querySelector('.archive-nav-container');
    const isNarrowScreen = window.innerWidth <= 1400;
    const scrolled = getScroller()?.scrollTop ?? 0;

    if (!header || !headerTitle || !navContainer) {
        return;
    }

    if (scrolled > 10) {
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
    if (scrollButton) {
        if (scrolled > 500) {
            scrollButton.classList.add('slide-in');
        } else {
            scrollButton.classList.remove('slide-in');
        }
    }
}

// Reapply the scroll logic on resize to ensure correct classes are applied.
function onResize() {
    onScroll(); // Recheck the current scroll position and update classes accordingly.
}

// Add event listeners for scroll and resize
window.addEventListener('scroll', onScroll, { passive: true });
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.main-container')?.addEventListener('scroll', onScroll, { passive: true });
});
window.addEventListener('resize', onResize);

function scrollToTop() {
    const scroller = getScroller();
    if (scroller) scroller.scrollTop = 0;
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
            const scroller = getScroller();
            if (scroller) scroller.scrollTop = offsetTop;
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
            const scroller = getScroller();
            if (scroller) scroller.scrollTop = offsetTop;
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

        // Insert posts after the top pagination nav and before the tips block.
        postsContainer.insertBefore(fragment, paginationTip || null);

        isFirstLoad = false;

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


        if (sortState.releaseDate === 'default' && sortState.readingTime === 'default') {
            posts.sort((a, b) => {
                const orderA = parseInt(a.querySelector('.post').dataset.order || '0', 10);
                const orderB = parseInt(b.querySelector('.post').dataset.order || '0', 10);
                return orderB - orderA;
            });
        } else if (sortState.releaseDate !== 'default') {
            posts.sort((a, b) => {
                const dateA = convertToDate(a.querySelector('.post').dataset.date);
                const dateB = convertToDate(b.querySelector('.post').dataset.date);
                return sortState.releaseDate === 'newest' ? dateB - dateA : dateA - dateB;
            });
        } else if (sortState.readingTime !== 'default') {
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