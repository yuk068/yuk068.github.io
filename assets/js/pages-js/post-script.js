document.addEventListener('DOMContentLoaded', function () {
    // Your JavaScript functions here
    document.body.style.display = "block";  // Show the page after JS execution
});

// const checkBigSVG = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" width="40" height="40" color="#fff"><defs><style>.cls-6374f8d9b67f094e4896c627-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style></defs><circle class="cls-6374f8d9b67f094e4896c627-1" cx="12" cy="12" r="10.5"></circle><polyline class="cls-6374f8d9b67f094e4896c627-1" points="6.27 12 10.09 15.82 17.73 8.18"></polyline></svg>`;
const linkChainSVG = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" width="20" height="20" color="#fff"><defs><style>.cls-6374f8d9b67f094e4896c645-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style></defs><path class="cls-6374f8d9b67f094e4896c645-1" d="M10.57,5.8l2.71-2.72a5.4,5.4,0,0,1,7.64,7.64L18.2,13.43"></path><path class="cls-6374f8d9b67f094e4896c645-1" d="M5.8,10.57,3.08,13.28a5.4,5.4,0,0,0,7.64,7.64l2.71-2.72"></path><line class="cls-6374f8d9b67f094e4896c645-1" x1="16.77" y1="7.23" x2="7.23" y2="16.77"></line></svg>`;

function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE
}

function scrollToBottom() {
    const body = document.body; // For Safari
    const html = document.documentElement; // For Chrome, Firefox, IE
    const bottom = Math.max(body.scrollHeight, html.scrollHeight); // Calculate the bottom position

    body.scrollTop = bottom; // For Safari
    html.scrollTop = bottom; // For Chrome, Firefox, IE
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

    // Fallback if no valid referrer: navigate to homepage or a default path
    window.location.href = '/';
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

document.addEventListener('DOMContentLoaded', function () {
    const highlights = document.querySelectorAll('div.highlight');
    const blockquotes = document.querySelectorAll('blockquote');
    const languageCounts = {};
    // Define the SVGs as strings
    const upArrowSVG = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.1" width="14" height="14" color="#fff">
                    <defs><style>.cls-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style></defs>
                    <line class="cls-1" x1="17.75" y1="2.44" x2="17.75" y2="19.69"></line>
                    <polyline class="cls-1" points="22.54 7.23 17.75 2.44 12.96 7.23"></polyline>
                    <line class="cls-1" x1="6.25" y1="2.44" x2="6.25" y2="19.69"></line>
                    <polyline class="cls-1" points="11.04 7.23 6.25 2.44 1.46 7.23"></polyline>
                    <line class="cls-1" x1="0.5" y1="22.56" x2="23.5" y2="22.56"></line>
                </svg>`;

    const downArrowSVG = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.1" width="14" height="14" color="#fff">
                    <defs><style>.cls-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style></defs>
                    <line class="cls-1" x1="6.25" y1="17.73" x2="6.25" y2="0.48"></line>
                    <polyline class="cls-1" points="1.46 12.94 6.25 17.73 11.04 12.94"></polyline>
                    <line class="cls-1" x1="17.75" y1="17.73" x2="17.75" y2="0.48"></line>
                    <polyline class="cls-1" points="12.96 12.94 17.75 17.73 22.54 12.94"></polyline>
                    <line class="cls-1" x1="0.5" y1="22.52" x2="23.5" y2="22.52"></line>
                </svg>`;

    const checkSVG = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.1" width="14" height="14" color="#fff"><defs><style>.cls-6374f8d9b67f094e4896c627-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style></defs><circle class="cls-6374f8d9b67f094e4896c627-1" cx="12" cy="12" r="10.5"></circle><polyline class="cls-6374f8d9b67f094e4896c627-1" points="6.27 12 10.09 15.82 17.73 8.18"></polyline></svg>`;

    const documentSVG = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.1" width="14" height="14" color="#fff"><defs><style>.cls-637647fac3a86d32eae6f20e-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style></defs><line class="cls-637647fac3a86d32eae6f20e-1" x1="6.27" y1="14.86" x2="13.91" y2="14.86"></line><line class="cls-637647fac3a86d32eae6f20e-1" x1="6.27" y1="11.05" x2="13.91" y2="11.05"></line><line class="cls-637647fac3a86d32eae6f20e-1" x1="6.27" y1="18.68" x2="13.91" y2="18.68"></line><polygon class="cls-637647fac3a86d32eae6f20e-1" points="16.77 8.18 16.77 22.5 3.41 22.5 3.41 5.32 13.91 5.32 16.77 8.18"></polygon><polyline class="cls-637647fac3a86d32eae6f20e-1" points="16.77 18.68 20.59 18.68 20.59 4.36 17.73 1.5 7.23 1.5 7.23 5.32"></polyline></svg>`;

    let allCollapsed = false;

    function setupCollapseExpandAllButton() {
        const collapseExpandAllButton = document.getElementById('collapseExpandAllButton'); // Use the new button by ID
        if (collapseExpandAllButton) {
            let allCollapsed = false; // Track collapsed state

            collapseExpandAllButton.addEventListener('click', function () {
                allCollapsed = !allCollapsed; // Toggle the collapsed state

                // Collapse or expand all highlights and blockquotes
                [...highlights, ...blockquotes].forEach((element) => {
                    element.classList.toggle('collapsed', allCollapsed);

                    // Find the corresponding collapse button inside the element
                    const collapseButton = element.querySelector('.collapse-button');
                    if (collapseButton) {
                        collapseButton.innerHTML = allCollapsed ? downArrowSVG : upArrowSVG;
                    }
                });
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
            languageLabel.textContent = `${language.charAt(0).toUpperCase() + language.slice(1)}`; //  #${languageCounts[language]
            highlight.appendChild(languageLabel);
        }

        if (!highlight.querySelector('.copy-button')) {
            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.innerHTML = documentSVG; // Use the documentSVG as the initial icon
            highlight.appendChild(copyButton);

            copyButton.addEventListener('click', function () {
                const range = document.createRange();
                range.selectNodeContents(highlight.querySelector('code'));
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);

                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        copyButton.innerHTML = checkSVG; // Use the checkSVG on successful copy
                        setTimeout(() => {
                            copyButton.innerHTML = documentSVG; // Revert to documentSVG after 2 seconds
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
            collapseButton.className = 'collapse-button';

            // Set the initial content to the up arrow SVG
            collapseButton.innerHTML = upArrowSVG;
            highlight.appendChild(collapseButton);

            collapseButton.addEventListener('click', function () {
                highlight.classList.toggle('collapsed');
                collapseButton.innerHTML = highlight.classList.contains('collapsed') ? downArrowSVG : upArrowSVG;
            });
        }


        const codeElement = highlight.querySelector('code');
        if (codeElement && !highlight.querySelector('.line-numbers')) {
            const codeText = codeElement.textContent;  // Use textContent instead of innerHTML
            const codeLines = codeText.split('\n');

            // Create line numbers container
            const lineNumbersDiv = document.createElement('div');
            lineNumbersDiv.className = 'line-numbers';

            // Create line numbers, excluding the final one
            const lineNumbers = codeLines.slice(0, -1)
                .map((_, index) => `<div class="line-number">${index + 1}</div>`)
                .join('');
            lineNumbersDiv.innerHTML = lineNumbers;

            // Insert line numbers before the code
            highlight.insertBefore(lineNumbersDiv, highlight.firstChild);
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

        const blockNumber = `Block`; //  #${index + 1}

        if (!blockquote.querySelector('.collapse-button')) {
            const collapseButton = document.createElement('button');
            collapseButton.className = 'collapse-button';
            collapseButton.innerHTML = upArrowSVG; // Use the saved upArrowSVG constant
            blockquote.appendChild(collapseButton);

            const languageLabel = document.createElement('span');
            languageLabel.className = 'language-label';
            languageLabel.textContent = blockNumber;
            blockquote.appendChild(languageLabel); // Always appended and visible

            collapseButton.addEventListener('click', function () {
                blockquote.classList.toggle('collapsed');
                collapseButton.innerHTML = blockquote.classList.contains('collapsed') ? downArrowSVG : upArrowSVG; // Use SVGs instead of emojis
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
                    const customColor = ["mục-lục", "tài-liệu-tham-khảo", "table-of-content", "references", "problem-list", "exercise-list"].includes(id)
                        ? " style=\"color:#434e64;\""
                        : "";

                    tocContent += `
                        <li class="${tagName}">
                            <div class="toc-entry">
                                <button class="copy-toc" onclick="copyToClipboard(event, '${fullUrl}')">
                                    <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" width="20" height="20" color="#fff"><defs><style>.cls-6374f8d9b67f094e4896c645-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style></defs><path class="cls-6374f8d9b67f094e4896c645-1" d="M10.57,5.8l2.71-2.72a5.4,5.4,0,0,1,7.64,7.64L18.2,13.43"></path><path class="cls-6374f8d9b67f094e4896c645-1" d="M5.8,10.57,3.08,13.28a5.4,5.4,0,0,0,7.64,7.64l2.71-2.72"></path><line class="cls-6374f8d9b67f094e4896c645-1" x1="16.77" y1="7.23" x2="7.23" y2="16.77"></line></svg>
                                </button>
                                <a href="#${id}"${customColor}>${text}</a>
                            </div>
                        </li>`;
                }

                // Add copy button next to heading (for headings outside TOC)
                if (heading.closest('.post-content')) {
                    const copyButton = document.createElement('button');
                    copyButton.className = 'copy-toc';
                    copyButton.onclick = (e) => copyToClipboard(e, fullUrl);
                    copyButton.innerHTML = linkChainSVG;
                    heading.appendChild(copyButton);
                }

            }
        });

        tocContent += "</ul>";
        toc.innerHTML = tocContent;
    }
});


function copyToClipboard(event, text) {
    navigator.clipboard.writeText(text).then(() => {
        const button = event.target.closest('button'); // Ensure button is the target
        button.classList.add('pulse-color'); // Add the color pulse effect
        setTimeout(() => {
            button.classList.remove('pulse-color'); // Remove the effect after animation
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}


function notifyComingSoon() {
    alert("Coming soon!");
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
    const header = document.querySelector('#post-header');
    const navContainer = document.querySelector('.nav-container');

    if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
        header.classList.add('transformed');
        navContainer.style.fontSize = '19px';
    } else {
        header.classList.remove('transformed');
        navContainer.style.fontSize = '';
    }
    const scrollButton = document.getElementById('scrollButton');
    if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
        scrollButton.classList.add('slide-in');
    } else {
        scrollButton.classList.remove('slide-in');
    }
}

document.body.addEventListener('scroll', onScroll);

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
const toTopButton = document.getElementById('toTopButton');
const themeButton = document.getElementById('themeButton');
const commentsButton = document.getElementById('commentsButton');
const closeButton = document.getElementById('closeButton');

// Add event listeners for functionality (placeholders for now)
toTopButton.addEventListener('click', () => {
    scrollToTop();
    closeOptions();
});

themeButton.addEventListener('click', () => {
    notifyComingSoon();
    closeOptions();
});

commentsButton.addEventListener('click', () => {
    scrollToBottom();
    closeOptions();
});

closeButton.addEventListener('click', () => {
    closeOptions();
});

const toBackButton = document.getElementById('toBackButton');
const toHomeButton = document.getElementById('toHomeButton');
const toArchiveButton = document.getElementById('toArchiveButton');
const toProjectsButton = document.getElementById('toProjectsButton');
const toExploreButton = document.getElementById('toExploreButton');
const toAboutButton = document.getElementById('toAboutButton');

// Add event listeners for functionality (placeholders for now)
toBackButton.addEventListener('click', () => {
    closeOptions();
    goBack();
});

toHomeButton.addEventListener('click', () => {
    closeOptions();
    window.location.href = "/";
});

toArchiveButton.addEventListener('click', () => {
    closeOptions();
    window.location.href = "/archive";
});

toProjectsButton.addEventListener('click', () => {
    closeOptions();
    window.location.href = "/projects";
});

toExploreButton.addEventListener('click', () => {
    notifyComingSoon();
    closeOptions();
});

toAboutButton.addEventListener('click', () => {
    closeOptions();
    const currentLang = document.documentElement.lang;

    if (currentLang === "vi") {
        window.location.href = "/about-yuk-vi";
    } else {
        window.location.href = "/about-yuk-en";
    }
});

window.addEventListener('hashchange', function (e) {
    // Prevent default scroll
    e.preventDefault();

    // Get the target element
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
        // Add a small delay to ensure DOM is ready
        setTimeout(() => {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    }
});