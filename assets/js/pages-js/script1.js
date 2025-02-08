document.addEventListener('DOMContentLoaded', function() {
    // Your JavaScript functions here
    document.body.style.display = "block";  // Show the page after JS execution
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

    // Fallback if no valid referrer: navigate to generalpage or a default path
    window.location.href = '/';
}

// Function to handle header transformation based on scroll position
function onScroll() {
    // Header elements
    const header = document.querySelector('#general-header');
    const headerTitle = document.querySelector('#general-header-title');
    const navContainer = document.querySelector('.nav-container');

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
}

// Add the scroll event listener
document.body.addEventListener('scroll', onScroll);

// Function to scroll to the top when the button is clicked
function scrollToTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE
}

function notifyComingSoon() {
    alert("Coming soon!");
}

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

function switchLanguage() {
    let currentUrl = window.location.href;
    if (currentUrl.includes("about-yuk-en")) {
        window.location.href = currentUrl.replace("about-yuk-en", "about-yuk-vi");
    } else if (currentUrl.includes("about-yuk-vi")) {
        window.location.href = currentUrl.replace("about-yuk-vi", "about-yuk-en");
    }
}