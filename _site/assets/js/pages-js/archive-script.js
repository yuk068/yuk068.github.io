document.addEventListener('DOMContentLoaded', function () {
    // Your JavaScript functions here
    document.body.style.display = "block";  // Show the page after JS execution
});


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

function formatDate(dateString, language = 'en') {
    const [day, month, year] = dateString.split('/').map(Number);

    if (language === 'vi') {
        // For Vietnamese, return in dd/mm/yyyy format
        return `${day}/${month}/${year}`;
    }

    // English month names
    const months = [
        "Jan.", "Feb.", "Mar.", "Apr.", "May", "June",
        "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."
    ];

    const monthName = months[month - 1];

    let dayWithSuffix = day;
    if (day === 1 || day === 21 || day === 31) {
        dayWithSuffix += "st";
    } else if (day === 2 || day === 22) {
        dayWithSuffix += "nd";
    } else if (day === 3 || day === 23) {
        dayWithSuffix += "rd";
    } else {
        dayWithSuffix += "th";
    }

    return `${monthName} ${dayWithSuffix} ${year}`;
}

function formatDates() {
    const dateElements = document.querySelectorAll(".posts-date, .date-span");

    for (const element of dateElements) {
        const dateString = element.textContent.trim();
        const language = document.documentElement.lang || 'en'; // Default to English if no lang attribute

        if (dateString) {
            const formattedDate = formatDate(dateString, language);
            element.textContent = formattedDate;
        }
    }
}

document.addEventListener("DOMContentLoaded", formatDates);

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
document.body.addEventListener('scroll', onScroll);
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

function toggleLeftPanel() {
    const sidePanel = document.querySelector('.archive-side-panel-left');

    if (window.innerWidth <= 1400) {
        const filterSortContainer = document.getElementById('filterSortContainer');
        if (filterSortContainer) {
            const body = document.body;
            const html = document.documentElement;

            const offsetTop = getOffsetTop(filterSortContainer) - 100;

            console.log("Niggers", offsetTop);
            console.log("Faggots", window.scrollY);

            body.scrollTop = offsetTop;
            html.scrollTop = offsetTop;
        }
    } else {
        sidePanel.classList.toggle('active');
        localStorage.setItem('leftPanelState', sidePanel.classList.contains('active') ? 'open' : 'closed');
    }
}


function toggleRightPanel() {
    const sidePanel = document.querySelector('.archive-side-panel-right');

    if (window.innerWidth <= 1400) {
        const tagsContainer = document.getElementById('tagsContainer');
        if (tagsContainer) {
            const body = document.body;
            const html = document.documentElement;

            const offsetTop = getOffsetTop(tagsContainer) - 100;

            body.scrollTop = offsetTop;
            html.scrollTop = offsetTop;
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

    function updatePanelState() {
        if (window.innerWidth <= 1400) {
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

    updatePanelState(); // Initial check on load
    window.addEventListener('resize', updatePanelState); // Listen for resize events
}

document.addEventListener('DOMContentLoaded', initializePanelState);

// IMPORTANT: Master function to handle all filtering and pagination
document.addEventListener('DOMContentLoaded', () => {
    // Add empty state element to selections
    const tagButtons = document.querySelectorAll('.tag-filter-button');
    const categoryButtons = document.querySelectorAll('.filter-tools-container button');
    const searchBar = document.getElementById('search-bar');
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
        if (visiblePosts.length === 0) {
            paginationNav.style.display = 'none';
            nothingHere.classList.add('active');
        } else {
            paginationNav.style.display = 'flex';
            nothingHere.classList.remove('active');
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

            // Function to remove accents from Vietnamese characters
            function removeAccents(str) {
                const map = {
                    'Ã ': 'a', 'Ã¡': 'a', 'áº£': 'a', 'Ã£': 'a', 'áº¡': 'a', 'Äƒ': 'a', 'áº±': 'a', 'áº¯': 'a', 'áº³': 'a', 'áºµ': 'a', 'áº·': 'a',
                    'Ã¢': 'a', 'áº§': 'a', 'áº¥': 'a', 'áº©': 'a', 'áº«': 'a', 'áº­': 'a', 'Ã¨': 'e', 'Ã©': 'e', 'áº»': 'e', 'áº½': 'e', 'áº¹': 'e',
                    'Ãª': 'e', 'á»': 'e', 'áº¿': 'e', 'á»ƒ': 'e', 'á»…': 'e', 'á»‡': 'e', 'Ã¬': 'i', 'Ã­': 'i', 'á»‰': 'i', 'Ä©': 'i', 'á»‹': 'i',
                    'Ã²': 'o', 'Ã³': 'o', 'á»': 'o', 'Ãµ': 'o', 'á»': 'o', 'Ã´': 'o', 'á»“': 'o', 'á»‘': 'o', 'á»•': 'o', 'á»—': 'o', 'á»™': 'o',
                    'Æ¡': 'o', 'á»': 'o', 'á»›': 'o', 'á»Ÿ': 'o', 'á»¡': 'o', 'á»£': 'o', 'Ã¹': 'u', 'Ãº': 'u', 'á»§': 'u', 'Å©': 'u', 'á»¥': 'u',
                    'Æ°': 'u', 'á»«': 'u', 'á»©': 'u', 'á»­': 'u', 'á»¯': 'u', 'á»±': 'u', 'á»³': 'y', 'Ã½': 'y', 'á»·': 'y', 'á»¹': 'y', 'á»µ': 'y',
                    'Ä‘': 'd', 'áº ': 'A', 'áº¢': 'A', 'áº®': 'A', 'áº°': 'A', 'áº´': 'A', 'áº¢': 'A', 'Ã': 'A', 'ÃŠ': 'E', 'Ã”': 'O', 'Æ ': 'O',
                    'Æ¯': 'U', 'Ä': 'D'
                };
                return str.replace(/[\u00C0-\u1EF9]/g, match => map[match] || match).toLowerCase();
            }

            const normalizedSearchText = removeAccents(searchText.toLowerCase());
            const normalizedPostTitle = removeAccents(postTitle.toLowerCase());
            const normalizedPostExcerpt = removeAccents(postExcerpt.toLowerCase());
            const normalizedPostTags = postTags.map(tag => removeAccents(tag.toLowerCase()));

            const matchesSearch = normalizedSearchText === '' ||
                normalizedPostTitle.includes(normalizedSearchText) ||
                normalizedPostExcerpt.includes(normalizedSearchText) ||
                normalizedPostTags.some(tag => tag.includes(normalizedSearchText));


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
        // Sort the visible posts
        const sortedVisiblePosts = updateSorting(visiblePosts);

        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;

        // Select posts container and pagination-nav
        const postsContainer = document.querySelector('.posts');
        const paginationNav = postsContainer.querySelector('.pagination-nav'); // Get the pagination-nav

        // Hide all posts (excluding pagination-nav)
        const postElements = postsContainer.querySelectorAll('.post-card');
        postElements.forEach(post => {
            post.style.display = 'none';
            post.classList.remove('pulse');
        });

        // Append posts for the current page in the correct order
        sortedVisiblePosts.slice(startIndex, endIndex).forEach(post => {
            post.style.display = 'block';
            postsContainer.appendChild(post); // Reorder posts in the DOM

            // Add the pulse effect after the first load
            if (!isFirstLoad) {
                requestAnimationFrame(() => {
                    post.classList.add('pulse');
                });
            }
        });

        // After the first load, set isFirstLoad to false
        isFirstLoad = false;

        // Add pagination-nav back to the container
        postsContainer.appendChild(paginationNav);

        // Update empty state
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

    searchBar.addEventListener('input', (e) => {
        searchText = e.target.value.toLowerCase().trim();
        updatePostsVisibility();
    });

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
    const searchBar = document.getElementById("search-bar");

    function updateSearchBar() {
        if (window.innerWidth <= 1400) {
            if (searchBarContainer.contains(searchBar)) {
                mobileSearchBarContainer.appendChild(searchBar);
            }
        } else {
            if (mobileSearchBarContainer.contains(searchBar)) {
                searchBarContainer.appendChild(searchBar);
            }
        }

        // Change placeholder text for smaller screens
        if (window.innerWidth <= 790) {
            searchBar.placeholder = "Search posts...";
        } else {
            searchBar.placeholder = 'Press " / " to search posts...';
        }
    }

    // Run on page load and window resize
    updateSearchBar();
    window.addEventListener("resize", updateSearchBar);

    // Keyboard event for focusing search bar
    document.addEventListener("keydown", function (event) {
        if (event.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
            event.preventDefault();
            searchBar.focus();
        } else if (event.key === "Escape" && document.activeElement === searchBar) {
            searchBar.blur();
        }
    });
});

function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}
