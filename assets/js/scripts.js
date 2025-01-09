let currentFilter = 'all';
let searchActive = false;
let showThumbnails = true;
const emojis = ['😈', '🤕', '🩹', '💢', '🥴', '🐱', '🚶‍♂️', '🏃‍♂️', '😨', '👨‍💻', '⏰', '🔂', '👧', '🎒', '🎲', '🤑', '💸', '💀', '😭', '👅', '🤖', '❓', '🎮', '🎰', '🙋‍♂️', '🗿', '😔', '🤯', '🤝', '😫', '😴', '💯'];
let currentEmoji = '';

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

function goHome() {
    window.location.href = '/';
}

function filterPosts(category = 'all') {
    const searchInput = document.getElementById('search-bar');
    searchInput.value = '';
    searchActive = false;

    if (currentFilter.includes(category.toLowerCase())) {
        currentFilter = 'all';
    } else {
        currentFilter = category.toLowerCase();
    }

    updatePostsVisibility();
}

function searchPosts() {
    const searchInput = document.getElementById('search-bar').value.toLowerCase();
    searchActive = searchInput.length > 0;
    updatePostsVisibility();
}

function updatePostsVisibility() {
    // Check if the search bar exists (i.e., only run the function if it's the right page)
    const searchBar = document.getElementById('search-bar');
    if (!searchBar) {
        return; // Exit the function if there's no search bar on the page
    }

    const posts = document.querySelectorAll('.posts a');
    let visiblePostCount = 0;
    const searchInput = searchBar.value.trim().toLowerCase();

    posts.forEach(post => {
        // Extract data attributes and content
        const categories = (post.getAttribute('data-categories') || '').toLowerCase().split(',');
        const tags = (post.getAttribute('data-tags') || '').toLowerCase().split(',');
        const title = post.querySelector('h2')?.textContent.trim().toLowerCase() || '';
        const description = post.querySelector('div')?.textContent.trim().toLowerCase() || '';
        const writtenBy = post.getAttribute('data-written-by')?.toLowerCase() || '';
        const credits = post.getAttribute('data-credits')?.toLowerCase() || '';

        // Determine if the post matches the current filter
        const matchesFilter = currentFilter === 'all' || categories.some(cat => cat.includes(currentFilter));

        // Determine if the post matches the search input
        const matchesSearch = !searchActive || 
            [title, description, writtenBy, credits, ...categories, ...tags].some(field => field.includes(searchInput));

        // Show or hide the post based on the conditions
        if (matchesFilter && matchesSearch) {
            post.style.display = '';
            visiblePostCount++;
        } else {
            post.style.display = 'none';
        }
    });

    // Update the heading to reflect visible posts (if the heading exists)
    updateHeading(visiblePostCount);
}

function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateHeading(visiblePostCount) {
    const heading = document.querySelector('.posts h1');
    let headingText = '';

    const filterPrefix = currentFilter !== 'all' ? `(${capitalizeFirstLetter(currentFilter)}) ` : '';

    if (searchActive) {
        if (visiblePostCount == 0) {
            headingText = `${filterPrefix}No posts found`;
        } else {
            headingText = `${filterPrefix}Search results: ${visiblePostCount} post${visiblePostCount !== 1 ? 's' : ''} found`;
        }
    } else if (currentFilter === 'all') {
        headingText = 'All posts';
    } else if (visiblePostCount > 0) {
        headingText = `${filterPrefix}Showing ${visiblePostCount} post${visiblePostCount !== 1 ? 's' : ''}`;
    } else {
        headingText = `${filterPrefix}No posts found`;
    }

    heading.textContent = headingText;
}

function notifyComingSoon() {
    alert("Coming soon!");
}

function toggleLightMode() {
    const body = document.querySelector('body');
    const isLightMode = body.classList.contains('light-mode');
    body.classList.toggle('light-mode', !isLightMode);

    const toggleButton = document.getElementById('toggle-mode-button');
    toggleButton.textContent = !isLightMode ? '🌙' : '☀️';
}

document.addEventListener('DOMContentLoaded', () => {
    const isLightMode = localStorage.getItem('light-mode') === 'true';
    const body = document.querySelector('body');
    const html = document.querySelector('html');
    const toggleButton = document.getElementById('toggle-mode-button');

    if (isLightMode) {
        body.classList.add('light-mode');
        html.classList.add('light-mode');
        toggleButton.textContent = '🌙';
    } else {
        body.classList.remove('light-mode');
        html.classList.remove('light-mode');
        toggleButton.textContent = '☀️';
    }
});

function toggleThumbnail() {
    showThumbnails = !showThumbnails;
    const posts = document.querySelectorAll('.post');

    posts.forEach(post => {
        const img = post.querySelector('img');
        const descriptionDiv = post.querySelector('.post-description');

        const existingDivider = post.querySelector('.divider');
        if (existingDivider) {
            post.removeChild(existingDivider);
        }

        if (showThumbnails) {
            img.style.display = 'block';
            descriptionDiv.style.display = 'block';
        } else {
            img.style.display = 'none';

            if (!existingDivider) {
                const divider = document.createElement('div');
                divider.className = 'divider';
                post.insertBefore(divider, post.firstChild);
            }
        }
    });
}

function showRandomEmoji() {
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    document.getElementById('shuffleEmoji').textContent = randomEmoji;
}

function shuffleEmoji() {
    const emojiButton = document.getElementById('shuffleEmoji');
    let shuffleCount = 15;

    const shuffleInterval = setInterval(() => {
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        emojiButton.textContent = randomEmoji;
        shuffleCount--;

        if (shuffleCount <= 0) {
            clearInterval(shuffleInterval);
        }
    }, 80);
}

document.addEventListener('DOMContentLoaded', function () {
    const highlights = document.querySelectorAll('div.highlight');
    const blockquotes = document.querySelectorAll('blockquote');
    const languageCounts = {};
    let allCollapsed = false;

    function setupCollapseExpandAllButton() {
        const collapseExpandAllButton = document.querySelector('.collapse-expand-all-button');
        if (collapseExpandAllButton) {
            collapseExpandAllButton.textContent = '🔼';
            collapseExpandAllButton.addEventListener('click', function () {
                allCollapsed = !allCollapsed;
                [...highlights, ...blockquotes].forEach((element) => {
                    element.classList.toggle('collapsed', allCollapsed);
                    const collapseButton = element.querySelector('.collapse-button');
                    if (collapseButton) {
                        collapseButton.textContent = allCollapsed ? '🔽' : '🔼';
                    }
                });
                this.textContent = allCollapsed ? '🔽' : '🔼';
            });
        }
    }

    setupCollapseExpandAllButton();

    // Handle div.highlight elements
    highlights.forEach((highlight) => {
        const parentDiv = highlight.parentElement;
        const languageClass = Array.from(parentDiv.classList).find(cls => cls.startsWith('language-'));
        const language = languageClass ? languageClass.replace('language-', '') : 'Unknown';

        languageCounts[language] = (languageCounts[language] || 0) + 1;

        if (!highlight.querySelector('.language-label')) {
            const languageLabel = document.createElement('span');
            languageLabel.className = 'language-label';
            languageLabel.textContent = `${language.charAt(0).toUpperCase() + language.slice(1)} #${languageCounts[language]}`;
            highlight.appendChild(languageLabel);
        }

        if (!highlight.querySelector('.copy-button')) {
            const copyButton = document.createElement('button');
            copyButton.textContent = '📄';
            copyButton.className = 'copy-button';
            highlight.appendChild(copyButton);

            copyButton.addEventListener('click', function () {
                const range = document.createRange();
                range.selectNodeContents(highlight.querySelector('code'));
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);

                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        copyButton.textContent = '✅';
                        setTimeout(() => {
                            copyButton.textContent = '📄';
                        }, 2000);
                    }
                } catch (err) {
                    console.error('Error copying text: ', err);
                }

                window.getSelection().removeAllRanges();
            });
        }

        if (!highlight.querySelector('.collapse-button')) {
            const collapseButton = document.createElement('button');
            collapseButton.textContent = '🔼';
            collapseButton.className = 'collapse-button';
            highlight.appendChild(collapseButton);

            collapseButton.addEventListener('click', function () {
                highlight.classList.toggle('collapsed');
                collapseButton.textContent = highlight.classList.contains('collapsed') ? '🔽' : '🔼';
            });
        }
    });

    // Handle blockquote elements
    blockquotes.forEach((blockquote, index) => {
        // Wrap blockquote content in a container
        const content = document.createElement('div');
        content.className = 'content';
        while (blockquote.firstChild) {
            content.appendChild(blockquote.firstChild);
        }
        blockquote.appendChild(content);
    
        const blockNumber = `Block #${index + 1}`;
    
        if (!blockquote.querySelector('.collapse-button')) {
            const collapseButton = document.createElement('button');
            collapseButton.textContent = '🔼';
            collapseButton.className = 'collapse-button';
            blockquote.appendChild(collapseButton);
    
            const languageLabel = document.createElement('span');
            languageLabel.className = 'language-label';
            languageLabel.textContent = blockNumber;
            blockquote.appendChild(languageLabel); // Always appended and visible
    
            collapseButton.addEventListener('click', function () {
                blockquote.classList.toggle('collapsed');
                collapseButton.textContent = blockquote.classList.contains('collapsed') ? '🔽' : '🔼';
            });
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Check if the 'linkage' frontmatter exists and is true
    const linkage = document.querySelector('meta[name="linkage"]') 
                    ? document.querySelector('meta[name="linkage"]').getAttribute('content') === 'true' 
                    : false;
    
    if (linkage) {
        // Handle TOC
        const toc = document.getElementById("table-of-contents");
        const headings = document.querySelectorAll("main h2, main h3, main h4");
        let tocContent = "<ul>";
        
        headings.forEach((heading) => {
            const id = heading.id;
            const text = heading.textContent;
            const tagName = heading.tagName.toLowerCase();
            
            if (id) {
                const fullUrl = `${window.location.origin}${window.location.pathname}#${id}`;
                
                // Add to TOC (for headings inside main content)
                if (heading.closest('.post-content')) {
                    tocContent += `
                        <li class="${tagName}">
                            <div class="toc-entry">
                                <button class="copy-toc" onclick="copyToClipboard(event, '${fullUrl}')">
                                    🔗
                                </button>
                                <a href="#${id}">${text}</a>
                            </div>
                        </li>`;
                }

                // Add copy button next to heading (for headings outside TOC)
                if (heading.closest('.post-content')) {
                    const copyButton = document.createElement('button');
                    copyButton.className = 'copy-toc';
                    copyButton.onclick = (e) => copyToClipboard(e, fullUrl);
                    copyButton.textContent = '🔗';
                    heading.appendChild(copyButton);
                }

                // Center and add padding for h2 and h3 only on larger screens
                if ((heading.tagName === 'H2' || heading.tagName === 'H3') && linkage) {
                    const mediaQuery = window.matchMedia("(min-width: 768px)"); // Define mobile breakpoint

                    function handleScreenChange(event) {
                        if (event.matches) {
                            // Apply styles for larger screens
                            heading.style.paddingLeft = '20px';
                            heading.style.textAlign = 'center';
                        } else {
                            // Remove styles for smaller screens
                            heading.style.paddingLeft = '';
                            heading.style.textAlign = '';
                        }
                    }

                    // Initial check and add event listener
                    handleScreenChange(mediaQuery);
                    mediaQuery.addEventListener('change', handleScreenChange);
                }
            }
        });
        
        tocContent += "</ul>";
        toc.innerHTML = tocContent;
    }
});


function copyToClipboard(event, text) {
    navigator.clipboard.writeText(text).then(() => {
        const button = event.target;
        button.textContent = '✔️';
        setTimeout(() => {
            button.textContent = '🔗';
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Function to smoothly scroll to the top of the page
function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0;
}

window.addEventListener('load', function () {
    // Select all tables on the page
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        // Create a new wrapper div
        const wrapper = document.createElement('div');
        wrapper.classList.add('table-wrapper');  // Add class to the wrapper
        
        // Move the table inside the wrapper
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
});

updatePostsVisibility();