// document.addEventListener('DOMContentLoaded', function () {
//     // Your JavaScript functions here
//     document.body.style.display = "block";  // Show the page after JS execution
// });

// const checkBigSVG = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" width="40" height="40" color="#fff"><defs><style>.cls-6374f8d9b67f094e4896c627-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style></defs><circle class="cls-6374f8d9b67f094e4896c627-1" cx="12" cy="12" r="10.5"></circle><polyline class="cls-6374f8d9b67f094e4896c627-1" points="6.27 12 10.09 15.82 17.73 8.18"></polyline></svg>`;
// (function () {
//     var loader = document.getElementById('page-loader');
//     if (loader) {
//         setTimeout(function () {
//             loader.classList.add('fade-out');
//             setTimeout(function () { loader.remove(); }, 200);
//         }, 15);
//     }
// })();

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

    function setupCollapseExpandAllButton() {
        const collapseExpandAllButton = document.getElementById('collapseExpandAllButton');
        if (collapseExpandAllButton) {
            let allCollapsed = false;

            collapseExpandAllButton.addEventListener('click', function () {
                allCollapsed = !allCollapsed;

                [...highlights, ...blockquotes].forEach((element) => {
                    element.classList.toggle('collapsed', allCollapsed);

                    const collapseButton = element.querySelector('.collapse-button');
                    if (collapseButton) {
                        collapseButton.innerHTML = allCollapsed ? downArrowSVG : upArrowSVG;
                    }
                });
            });
        }
    }

    setupCollapseExpandAllButton();

    highlights.forEach((highlight) => {
        const copyButton = highlight.querySelector('.copy-button');
        if (copyButton) {
            copyButton.addEventListener('click', function () {
                const range = document.createRange();
                range.selectNodeContents(highlight.querySelector('code'));
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);

                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        copyButton.innerHTML = checkSVG;
                        setTimeout(() => {
                            copyButton.innerHTML = documentSVG;
                        }, 2000);
                    }
                } catch (err) {
                    console.error('Error copying text: ', err);
                }

                window.getSelection().removeAllRanges();
            });
        }

        const collapseButton = highlight.querySelector('.collapse-button');
        if (collapseButton) {
            collapseButton.addEventListener('click', function () {
                highlight.classList.toggle('collapsed');
                collapseButton.innerHTML = highlight.classList.contains('collapsed') ? downArrowSVG : upArrowSVG;
            });
        }
    });

    blockquotes.forEach((blockquote) => {
        const collapseButton = blockquote.querySelector('.collapse-button');
        if (collapseButton) {
            collapseButton.addEventListener('click', function () {
                blockquote.classList.toggle('collapsed');
                collapseButton.innerHTML = blockquote.classList.contains('collapsed') ? downArrowSVG : upArrowSVG;
            });
        }
    });
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

// Replace table token markers (!tick, !cross) with inline SVG icons
document.addEventListener('DOMContentLoaded', function () {
    const tickSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" style="color:var(--paragraph-color); vertical-align:middle;" aria-hidden="true">
            <defs><style>.s{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}</style></defs>
            <polyline class="s" points="20 6 9 17 4 12" />
        </svg>`;

    const crossSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" style="color:var(--paragraph-color); vertical-align:middle;" aria-hidden="true">
            <defs><style>.s{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}</style></defs>
            <line class="s" x1="18" y1="6" x2="6" y2="18" />
            <line class="s" x1="6" y1="6" x2="18" y2="18" />
        </svg>`;

    // Replace tokens in table header and body cells. We replace occurrences in the HTML so tokens inside markup are handled.
    const cells = document.querySelectorAll('table td, table th');
    cells.forEach(cell => {
        // Use a simple replace for the token strings
        let html = cell.innerHTML;
        let replaced = false;

        if (html.indexOf('!tick') !== -1) {
            html = html.split('!tick').join(tickSVG);
            replaced = true;
        }
        if (html.indexOf('!cross') !== -1) {
            html = html.split('!cross').join(crossSVG);
            replaced = true;
        }

        if (replaced) cell.innerHTML = html;
    });
});


function notifyComingSoon() {
    if (!document.getElementById('notify-coming-soon-styles')) {
        const style = document.createElement('style');
        style.id = 'notify-coming-soon-styles';
        style.textContent = `
            #notify-overlay {
                display: flex;
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 99999;
                justify-content: center;
                align-items: center;
                backdrop-filter: blur(5px);
                animation: notify-fade-in 0.3s ease;
            }
            @keyframes notify-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            #notify-container {
                padding: 24px;
                border: var(--border-width, 1px) solid var(--header-footer-shadeLight, #343c4d);
                background-color: var(--header-bg-color, #1b2130);
                border-radius: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 14px;
                width: 320px;
                max-width: 90vw;
                box-shadow: var(--box-shadow-part-1, 0 0 10px rgba(0,0,0,0.2)), var(--box-shadow-part-2, 0 0 25px rgba(0,0,0,0.4));
                animation: notify-slide-in 0.4s ease;
                box-sizing: border-box;
                font-family: 'Nunito', sans-serif;
            }
            @keyframes notify-slide-in {
                from { opacity: 0; transform: translateY(-40px); }
                to { opacity: 1; transform: translateY(0); }
            }
            #notify-container p.notify-title {
                color: var(--neon-aqua-accent, #6bd9fa);
                margin: 0;
                font-size: 20px;
                font-family: 'Quicksand', sans-serif;
            }
            #notify-container span.notify-desc {
                color: var(--paragraph-color, #e7e6e6);
                font-size: 15px;
                text-align: center;
                font-family: 'Nunito', sans-serif;
            }
            #notify-divider {
                width: 100%;
                height: 2px;
                border-radius: 2px;
                background-color: var(--header-footer-shadeLight, #343c4d);
                flex-shrink: 0;
            }
            #notify-close-btn {
                all: unset;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                cursor: pointer;
                color: var(--paragraph-color, #e7e6e6);
                border: var(--border-width, 1px) solid var(--header-footer-shadeLight, #343c4d);
                background-color: var(--header-bg-color, #1b2130);
                border-radius: 8px;
                width: 100%;
                padding: 12px;
                text-align: center;
                box-shadow: var(--box-shadow-part-1, 0 0 10px rgba(0,0,0,0.2));
                box-sizing: border-box;
                transition: border-color 0.3s ease;
                font-size: 15px;
                font-family: 'Nunito', sans-serif;
            }
            @media (hover: hover) {
                #notify-close-btn:hover {
                    border-color: var(--neon-aqua-accent, #6bd9fa);
                }
            }
        `;
        document.head.appendChild(style);
    }

    const overlay = document.createElement('div');
    overlay.id = 'notify-overlay';

    const container = document.createElement('div');
    container.id = 'notify-container';

    const svgWrapper = document.createElement('div');
    svgWrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" width="40" height="40" fill="none" stroke="var(--neon-aqua-accent, #6bd9fa)" stroke-miterlimit="10"><circle cx="12" cy="12" r="10.5"/><polyline points="12 6.5 12 12 16 14.5"/></svg>`;

    const title = document.createElement('p');
    title.className = 'notify-title';
    title.textContent = 'Coming Soon!';

    const divider = document.createElement('div');
    divider.id = 'notify-divider';

    const descTop = document.createElement('span');
    descTop.className = 'notify-desc';
    descTop.textContent = "This is not available yet...";

    const descBottom = document.createElement('span');
    descBottom.className = 'notify-desc';
    descBottom.textContent = "Check back later!";

    const closeBtn = document.createElement('button');
    closeBtn.id = 'notify-close-btn';
    closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" width="16" height="16" fill="none" stroke="currentColor" stroke-miterlimit="10"><circle cx="12" cy="12" r="10.5"/><line x1="8.18" y1="8.18" x2="15.82" y2="15.82"/><line x1="15.82" y1="8.18" x2="8.18" y2="15.82"/></svg> Dismiss`;

    container.appendChild(svgWrapper);
    container.appendChild(title);
    container.appendChild(divider);
    container.appendChild(descTop);
    container.appendChild(descBottom);
    container.appendChild(closeBtn);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    function dismiss() {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
    }

    closeBtn.addEventListener('click', dismiss);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) dismiss(); });
}

function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');

    // Update Giscus theme
    const giscusTheme = isLight ? 'light_protanopia' : 'dark_protanopia';
    const iframe = document.querySelector('iframe.giscus-frame');
    if (iframe) {
        iframe.contentWindow.postMessage(
            { giscus: { setConfig: { theme: giscusTheme } } },
            'https://giscus.app'
        );
    }

    // Update Mermaid theme if the library is loaded
    if (typeof mermaid !== 'undefined') {
        const isDark = !isLight;
        mermaid.initialize({
            startOnLoad: false,
            theme: isDark ? 'dark' : 'default',
            themeVariables: isDark ? {
                'primaryColor': '#1e1e1e',
                'edgeLabelBackground': '#444444',
                'tertiaryColor': '#555555',
            } : {}
        });

        // Restore original source and re-render each diagram
        document.querySelectorAll('.mermaid').forEach(function (el) {
            const source = el.getAttribute('data-mermaid-source');
            if (source) {
                el.removeAttribute('data-processed');
                el.textContent = source;
            }
        });

        mermaid.run({ querySelector: '.mermaid' });
    }
}

function onScroll() {
    const header = document.querySelector('#post-header');
    const navContainer = document.querySelector('.nav-container');

    const progressBar = document.getElementById('reading-progress-bar');
    const scrollTop = document.body.scrollTop;
    const docHeight = document.body.scrollHeight - document.body.clientHeight;
    progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';

    if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10) {
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
    toggleTheme();
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