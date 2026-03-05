document.addEventListener('DOMContentLoaded', function() {
    // Your JavaScript functions here
    document.body.style.display = "block";  // Show the page after JS execution
});

const swiperContainer = document.querySelector('.swiper-container');
const swiperWrapper = document.querySelector('.swiper-wrapper');
const slides = document.querySelectorAll('.swiper-slide');
const dots = document.querySelectorAll('.swiper-nav-dot');
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');
let currentSlide = 0;
const slideCount = slides.length;
let intervalTime = 5000;
let slideDelay = 2500;
let interval;

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

function nextSlide() {
    currentSlide = (currentSlide + 1) % slideCount;
    goToSlide(currentSlide);
    resetInterval();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slideCount) % slideCount;
    goToSlide(currentSlide);
    resetInterval();
}

function resetInterval() {
    clearInterval(interval);
    intervalTime = Math.min(intervalTime + slideDelay, intervalTime );
    interval = setInterval(nextSlide, intervalTime);
}

function dragStart(e) {
    isDragging = true;
    hasDragged = false; // Reset drag detection
    startX = e.pageX || e.touches[0].pageX;
    startY = e.pageY || e.touches[0].pageY;
    startTranslateX = parseFloat(swiperWrapper.style.transform.replace('translateX(', '').replace('%)', '')) || 0;

    // Stop auto-sliding during drag
    clearInterval(interval);
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
        resetInterval();
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
    resetInterval();
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
        resetInterval();
    });
});

nextButton.addEventListener('click', nextSlide);
prevButton.addEventListener('click', prevSlide);

// // Pause the slide interval on hover
// swiperContainer.addEventListener('mouseover', () => clearInterval(interval));
// swiperContainer.addEventListener('mouseout', () => resetInterval());

// Start the initial interval
interval = setInterval(nextSlide, intervalTime);

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
toArchiveButton.addEventListener('click', () => {
    closeOptions();
    window.location.href = "/archive";
});

toProjectsButton.addEventListener('click', () => {
    closeOptions();
    window.location.href = "/projects";
});

themeButton.addEventListener('click', () => {
    toggleTheme();
    closeOptions();
});

toAboutButton.addEventListener('click', () => {
    closeOptions();
    window.location.href = "/about-yuk-en";
});

closeButton.addEventListener('click', () => {
    closeOptions();
});
