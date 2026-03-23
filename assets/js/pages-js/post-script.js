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

document.addEventListener('DOMContentLoaded', function () {
    const highlights = document.querySelectorAll('div.highlight');
    const blockquotes = document.querySelectorAll('blockquote');

    const upArrowSVG = document.getElementById('svg-up-arrow').innerHTML;
    const downArrowSVG = document.getElementById('svg-down-arrow').innerHTML;
    const checkSVG = document.getElementById('svg-check').innerHTML;
    const documentSVG = document.getElementById('svg-document').innerHTML;

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

function notifyComingSoon() {
    const overlay = document.getElementById('notify-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.animation = 'none';
        void overlay.offsetWidth;
        overlay.style.animation = 'notify-fade-in 0.3s ease';
        
        const container = document.getElementById('notify-container');
        if (container) {
            container.style.animation = 'none';
            void container.offsetWidth;
            container.style.animation = 'notify-slide-in 0.4s ease';
        }
    }
}

function dismissNotify() {
    const overlay = document.getElementById('notify-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.style.opacity = '';
            overlay.style.transition = '';
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('notify-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) dismissNotify();
        });
    }
});

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
    if (typeof window.reinitializeMermaidViewer === 'function') {
        window.reinitializeMermaidViewer(!isLight);
    }
}

function onScroll() {
    const header = document.querySelector('#post-header');
    const navContainer = document.querySelector('.nav-container');

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
toBackButton.addEventListener('click', (e) => {
    e.preventDefault();
    closeOptions();
    goBack();
});

toHomeButton.addEventListener('click', (e) => {
    e.preventDefault();
    closeOptions();
    window.location.href = "/";
});

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

toAboutButton.addEventListener('click', (e) => {
    e.preventDefault();
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