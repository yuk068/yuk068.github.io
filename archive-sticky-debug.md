# Archive sticky issue context

## Problem description
- Archive page side panels are expected to stay sticky under the fixed header in 3-column layout.
- Both side panels scroll with the middle column instead of sticking.
- Portrait 1-column layout is fine; the issue is visible in 3-column landscape layout.
- Do not modify html/body rules; work around them.

## Relevant HTML
Source: _pages/archive.html

```html
<body>
    <canvas id="starfield"></canvas>

    <div class="main-container">
        <div class="archive-header-container">
            <header id="archive-header">
                ...
            </header>
        </div>
        <main>
            <div class="archive-outside-container">
                <div class="archive-inside-container">
                    <div class="archive-side-panel-left-container">
                        <div class="posts-horizontal-divider-line"></div>
                        <div class="archive-side-panel-left active">
                            ...
                        </div>
                    </div>
                    <div class="posts">
                        ...
                    </div>
                    <div class="archive-side-panel-right-container">
                        <div class="archive-side-panel-right active">
                            ...
                        </div>
                    </div>
                </div>
            </div>
        </main>
        ...
    </div>
</body>
```

## Relevant CSS (layout + sticky)
Source: assets/css/pages-css/archive-styles.css

```css
html,
body {
    min-height: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Nunito', sans-serif;
    color: var(--neon-aqua-accent);
    overflow-x: hidden;
    background-color: var(--bg-secondary-color);
    background-size: cover;
    scroll-behavior: smooth;
}

body {
    overflow-x: hidden;
    position: relative;
}

.main-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
    z-index: 1;
}

.archive-header-container header {
    position: fixed;
    width: 100%;
    height: 100px;
    padding: 0px 30px;
    box-shadow: var(--box-shadow-part-1), var(--box-shadow-part-2);
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    background-color: var(--header-bg-color);
    background-size: 100px 50px;
    border-bottom: var(--border-width) solid var(--header-footer-shadeLight);
    z-index: 5000;
    transition: all 0.3s ease;
}

.archive-side-panel-left-container {
    position: sticky;
    top: 100px;
    align-self: start;
    height: max-content;
    padding: 15px 1em 25px 10px;
    display: flex;
    flex-direction: column;
    grid-area: archive-side-panel-left-container;
}

.archive-side-panel-right-container {
    position: sticky;
    top: 100px;
    align-self: start;
    height: max-content;
    padding: 15px 10px 25px 1em;
    display: flex;
    flex-direction: column;
    grid-area: archive-side-panel-right-container;
}

.archive-outside-container {
    padding: 0px 3vw 100px 3vw;
    margin-top: 130px;
    overflow-x: clip;
}

.archive-inside-container {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    gap: 10px;
    width: 100%;
    height: 100%;
    grid-template-areas: "archive-side-panel-left-container posts archive-side-panel-right-container";
}
```

## Responsive rules that touch the panels
Source: assets/css/pages-css/archive-styles.css

```css
@media (max-width: 1400px) {
    .archive-inside-container {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto;
        gap: 10px;
        width: 100%;
        height: 100%;
        grid-template-areas:
            "posts"
            "archive-side-panel-left-container"
            "archive-side-panel-right-container";
    }

    .archive-side-panel-left-container {
        position: relative;
        padding: 0 15px 30px 15px;
        top: 0;
    }

    .archive-side-panel-right-container {
        position: relative;
        padding: 0 15px;
        top: 0;
    }

    .archive-side-panel-right {
        height: auto;
    }
}
```

## Relevant JS (header + panel toggles)
Source: assets/js/pages-js/archive-script.js

```js
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
}

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
```

## Observed behavior
- In 3-column layout, both side panels scroll with the posts instead of sticking beneath the header.
- The sticky behavior is expected to keep panels pinned under the fixed header while the posts scroll.

## Notes
- The fixed header height changes via the transformed/transformed-tight classes.
- The panels are sticky on the container element, not the inner panel card.
