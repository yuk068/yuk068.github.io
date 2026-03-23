(function () {
    'use strict';

    function getSvg(repoId, fallback) {
        const el = document.getElementById(repoId);
        if (el && el.innerHTML) {
            return el.innerHTML;
        }

        return fallback || '';
    }

    function getViewerIcons() {
        return {
            copyCode: getSvg('svg-document'),
            copied: getSvg('svg-check'),
            resetView: getSvg('svg-reset'),
            fullscreenEnter: getSvg('svg-fullscreen'),
            fullscreenExit: getSvg('svg-back'),
            lock: getSvg('svg-lock'),
            unlock: getSvg('svg-unlock')
        };
    }

    function syncFullscreenDiagramHeight(wrapper) {
        if (!wrapper || !wrapper.classList.contains('site-fullscreen')) {
            return;
        }

        const stage = wrapper.querySelector('.mermaid-viewer-stage');
        const diagram = wrapper.querySelector('.mermaid-viewer-stage .mermaid');
        if (!stage || !diagram) {
            return;
        }

        // In fullscreen, if a fixed aspect-ratio was set on the diagram element,
        // honour it: derive the diagram height from the stage's available width.
        const arStyle = diagram.style.aspectRatio || diagram.style['aspect-ratio'] || '';
        if (arStyle) {
            const parts = arStyle.split('/');
            const arW = parseFloat(parts[0]) || 1;
            const arH = parts[1] ? (parseFloat(parts[1]) || 1) : 1;
            const stageStyle = window.getComputedStyle(stage);
            const padL = parseFloat(stageStyle.paddingLeft || 0);
            const padR = parseFloat(stageStyle.paddingRight || 0);
            const contentWidth = Math.max(60, stage.clientWidth - padL - padR);
            const aspectHeight = Math.round(contentWidth * (arH / arW));
            const stageHeight = Math.max(120, stage.clientHeight);
            diagram.style.height = Math.min(aspectHeight, stageHeight) + 'px';
            return;
        }

        const stageHeight = Math.max(120, stage.clientHeight);
        diagram.style.height = stageHeight + 'px';
    }

    function refitPanZoom(wrapper) {
        if (!wrapper || !wrapper._panZoomInstance) {
            return;
        }

        wrapper._panZoomInstance.resize();
        wrapper._panZoomInstance.fit();
        wrapper._panZoomInstance.center();
        // adjust sensible min/max zoom ranges based on the fitted zoom
        if (typeof wrapper._panZoomInstance.getZoom === 'function') {
            try {
                const cur = wrapper._panZoomInstance.getZoom();
                const min = Math.max(0.05, cur * 0.25);
                const max = Math.max(1.5, cur * 12);
                if (typeof wrapper._panZoomInstance.setMinZoom === 'function') {
                    wrapper._panZoomInstance.setMinZoom(min);
                }
                if (typeof wrapper._panZoomInstance.setMaxZoom === 'function') {
                    wrapper._panZoomInstance.setMaxZoom(max);
                }
            } catch (e) {
                // ignore failures from pan/zoom impl
            }
        }
    }

    function setInteractionLocked(wrapper, locked) {
        if (!wrapper) {
            return;
        }

        wrapper.classList.toggle('interaction-locked', !!locked);

        const lockButton = wrapper.querySelector('.js-mermaid-lock');
        if (lockButton) {
            lockButton.innerHTML = locked ? wrapper._lockIcon : wrapper._unlockIcon;
            lockButton.setAttribute('aria-label', locked ? 'Unlock interactions' : 'Lock interactions');
            lockButton.title = locked ? 'Unlock interactions' : 'Lock interactions';
        }

        if (wrapper._panZoomInstance) {
            try {
                if (locked) {
                    if (typeof wrapper._panZoomInstance.disablePan === 'function') wrapper._panZoomInstance.disablePan();
                    if (typeof wrapper._panZoomInstance.disableZoom === 'function') wrapper._panZoomInstance.disableZoom();
                } else {
                    if (typeof wrapper._panZoomInstance.enablePan === 'function') wrapper._panZoomInstance.enablePan();
                    if (typeof wrapper._panZoomInstance.enableZoom === 'function') wrapper._panZoomInstance.enableZoom();
                }
            } catch (e) {
                // ignore if svgPanZoom implementation does not support these
            }
        }
    }

    function setSiteFullscreen(wrapper, isFullscreen) {
        if (!wrapper) {
            return;
        }

        wrapper.classList.toggle('site-fullscreen', isFullscreen);
        document.body.classList.toggle('mermaid-site-fullscreen-open', isFullscreen);

        const fullscreenButton = wrapper.querySelector('.js-mermaid-fullscreen');
        if (fullscreenButton) {
            fullscreenButton.innerHTML = isFullscreen ? wrapper._fullscreenExitIcon : wrapper._fullscreenEnterIcon;
            fullscreenButton.setAttribute('aria-label', isFullscreen ? 'Back to post' : 'Fullscreen');
            fullscreenButton.title = isFullscreen ? 'Back to post' : 'Fullscreen';
        }

        // Entering fullscreen should let users pan/zoom immediately.
        // Exiting fullscreen restores the default locked interaction mode.
        setInteractionLocked(wrapper, !isFullscreen);

        const diagram = wrapper.querySelector('.mermaid-viewer-stage .mermaid');
        if (diagram) {
            if (isFullscreen) {
                syncFullscreenDiagramHeight(wrapper);

                if (wrapper._panZoomInstance) {
                    requestAnimationFrame(function () {
                        requestAnimationFrame(function () {
                            syncFullscreenDiagramHeight(wrapper);
                            refitPanZoom(wrapper);
                            // ensure limits are updated after refit in fullscreen
                            if (wrapper._panZoomInstance && typeof wrapper._panZoomInstance.getZoom === 'function') {
                                try {
                                    const cur = wrapper._panZoomInstance.getZoom();
                                    const min = Math.max(0.05, cur * 0.25);
                                    const max = Math.max(1.5, cur * 12);
                                    if (typeof wrapper._panZoomInstance.setMinZoom === 'function') {
                                        wrapper._panZoomInstance.setMinZoom(min);
                                    }
                                    if (typeof wrapper._panZoomInstance.setMaxZoom === 'function') {
                                        wrapper._panZoomInstance.setMaxZoom(max);
                                    }
                                } catch (e) {
                                    // ignore
                                }
                            }
                            setTimeout(function () {
                                syncFullscreenDiagramHeight(wrapper);
                                refitPanZoom(wrapper);
                                // update limits again after the delayed refit
                                if (wrapper._panZoomInstance && typeof wrapper._panZoomInstance.getZoom === 'function') {
                                    try {
                                        const cur = wrapper._panZoomInstance.getZoom();
                                        const min = Math.max(0.05, cur * 0.25);
                                        const max = Math.max(1.5, cur * 12);
                                        if (typeof wrapper._panZoomInstance.setMinZoom === 'function') {
                                            wrapper._panZoomInstance.setMinZoom(min);
                                        }
                                        if (typeof wrapper._panZoomInstance.setMaxZoom === 'function') {
                                            wrapper._panZoomInstance.setMaxZoom(max);
                                        }
                                    } catch (e) {}
                                }
                            }, 80);
                        });
                    });
                }
            } else {
                diagram.style.height = '';
                refitPanZoom(wrapper);
            }
        }
    }

    function copyText(text, button, copiedIcon, defaultIcon) {
        if (!navigator.clipboard || !text) {
            return;
        }

        navigator.clipboard.writeText(text).then(function () {
            if (!button) {
                return;
            }

            if (copiedIcon) {
                button.innerHTML = copiedIcon;
            }
            setTimeout(function () {
                if (defaultIcon) {
                    button.innerHTML = defaultIcon;
                }
            }, 1500);
        }).catch(function (err) {
            console.error('Failed to copy Mermaid source:', err);
        });
    }

    function configureMermaidTheme(isDark) {
        if (typeof mermaid === 'undefined') {
            return;
        }

        mermaid.initialize({
            startOnLoad: false,
            theme: isDark ? 'dark' : 'default',
            themeVariables: isDark ? {
                primaryColor: '#1e1e1e',
                edgeLabelBackground: '#444444',
                tertiaryColor: '#555555'
            } : {}
        });
    }

    function ensureMermaidSources() {
        document.querySelectorAll('.post-article .mermaid').forEach(function (el) {
            if (!el.getAttribute('data-mermaid-source')) {
                el.setAttribute('data-mermaid-source', (el.textContent || '').trim());
            }
        });
    }

    function setupPanZoom(wrapper, diagram) {
        const svgElement = diagram.querySelector('svg');
        const stage = wrapper.querySelector('.mermaid-viewer-stage');

        if (!svgElement || typeof svgPanZoom === 'undefined') {
            return;
        }

        if (wrapper._panZoomInstance && typeof wrapper._panZoomInstance.destroy === 'function') {
            wrapper._panZoomInstance.destroy();
        }

        wrapper._panZoomInstance = svgPanZoom(svgElement, {
            zoomEnabled: true,
            controlIconsEnabled: false,
            fit: false,
            center: false,
            // disable svg-pan-zoom's internal wheel handling so we can control
            // wheel/pinch behavior and respect the interaction-locked state
            mouseWheelZoomEnabled: false,
            // disable double-click/double-tap zoom — we'll manage zoom gestures ourselves
            dblClickZoomEnabled: false,
            zoomScaleSensitivity: 0.45,
            preventMouseEventsDefault: false,
            minZoom: 0.5,
            maxZoom: 20
        });

        // If the wrapper starts locked, disable pan/zoom on the instance so
        // it does not intercept gestures. We will toggle these on lock/unlock.
        try {
            if (wrapper.classList && wrapper.classList.contains('interaction-locked')) {
                if (typeof wrapper._panZoomInstance.disablePan === 'function') wrapper._panZoomInstance.disablePan();
                if (typeof wrapper._panZoomInstance.disableZoom === 'function') wrapper._panZoomInstance.disableZoom();
            } else {
                if (typeof wrapper._panZoomInstance.enablePan === 'function') wrapper._panZoomInstance.enablePan();
                if (typeof wrapper._panZoomInstance.enableZoom === 'function') wrapper._panZoomInstance.enableZoom();
            }
        } catch (e) {
            // ignore if svgPanZoom implementation does not support these
        }

        if (stage && !stage.getAttribute('data-fast-zoom-ready')) {
            // Prevent double-click or simple click from being handled by
            // svgPanZoom when interactions are locked. This blocks taps
            // from causing unexpected zoom on mobile.
            stage.addEventListener('dblclick', function (ev) {
                if (wrapper.classList && wrapper.classList.contains('interaction-locked')) {
                    ev.preventDefault();
                    ev.stopImmediatePropagation();
                }
            }, { passive: false, capture: true });

            stage.addEventListener('click', function (ev) {
                if (wrapper.classList && wrapper.classList.contains('interaction-locked')) {
                    // swallow clicks when locked to avoid accidental focus/zoom
                    ev.preventDefault();
                    ev.stopImmediatePropagation();
                }
            }, { passive: false, capture: true });

            stage.addEventListener('wheel', function (event) {
                if (!wrapper._panZoomInstance) {
                    return;
                }

                // if interactions are locked, do not intercept scroll — allow page to scroll
                if (wrapper.classList && wrapper.classList.contains('interaction-locked')) {
                    return;
                }

                event.preventDefault();
                const rect = stage.getBoundingClientRect();
                const point = {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top
                };
                const direction = event.deltaY < 0 ? 1.32 : 0.76;

                if (typeof wrapper._panZoomInstance.zoomAtPointBy === 'function') {
                    wrapper._panZoomInstance.zoomAtPointBy(direction, point);
                } else if (direction > 1 && typeof wrapper._panZoomInstance.zoomIn === 'function') {
                    wrapper._panZoomInstance.zoomIn();
                } else if (direction < 1 && typeof wrapper._panZoomInstance.zoomOut === 'function') {
                    wrapper._panZoomInstance.zoomOut();
                }
            }, { passive: false });

            let previousPinchDistance = null;

            stage.addEventListener('touchstart', function (event) {
                if (event.touches.length === 2) {
                    const dx = event.touches[0].clientX - event.touches[1].clientX;
                    const dy = event.touches[0].clientY - event.touches[1].clientY;
                    previousPinchDistance = Math.hypot(dx, dy);
                }
            }, { passive: true });

            stage.addEventListener('touchmove', function (event) {
                if (!wrapper._panZoomInstance || event.touches.length !== 2) {
                    return;
                }

                // if interactions are locked, do not intercept pinch gestures
                if (wrapper.classList && wrapper.classList.contains('interaction-locked')) {
                    return;
                }

                const dx = event.touches[0].clientX - event.touches[1].clientX;
                const dy = event.touches[0].clientY - event.touches[1].clientY;
                const distance = Math.hypot(dx, dy);

                if (!previousPinchDistance || previousPinchDistance <= 0) {
                    previousPinchDistance = distance;
                    return;
                }

                const rawFactor = distance / previousPinchDistance;
                const boostedFactor = 1 + ((rawFactor - 1) * 1.7);

                const rect = stage.getBoundingClientRect();
                const point = {
                    x: ((event.touches[0].clientX + event.touches[1].clientX) / 2) - rect.left,
                    y: ((event.touches[0].clientY + event.touches[1].clientY) / 2) - rect.top
                };

                if (typeof wrapper._panZoomInstance.zoomAtPointBy === 'function') {
                    wrapper._panZoomInstance.zoomAtPointBy(boostedFactor, point);
                }

                previousPinchDistance = distance;
                event.preventDefault();
            }, { passive: false });

            stage.addEventListener('touchend', function () {
                previousPinchDistance = null;
            }, { passive: true });

            stage.setAttribute('data-fast-zoom-ready', 'true');
        }
    }

    function setupViewer(wrapper) {
        if (!wrapper) {
            return;
        }

        const diagram = wrapper.querySelector('.mermaid');
        if (!diagram) {
            return;
        }

        const source = (diagram.getAttribute('data-mermaid-source') || diagram.textContent || '').trim();
        wrapper._mermaidSource = source;

        const icons = getViewerIcons();

        // removed code-panel handling (view-source feature disabled)

        if (wrapper.getAttribute('data-viewer-bound') !== 'true') {
            const copyCodeButton = wrapper.querySelector('.js-mermaid-copy-code');
            const resetButton = wrapper.querySelector('.js-mermaid-reset');
            const lockButton = wrapper.querySelector('.js-mermaid-lock');
            const fullscreenButton = wrapper.querySelector('.js-mermaid-fullscreen');

            if (copyCodeButton) {
                copyCodeButton.addEventListener('click', function () {
                    copyText(wrapper._mermaidSource, copyCodeButton, wrapper._copiedIcon, wrapper._copyIcon);
                });
            }

            if (resetButton) {
                resetButton.addEventListener('click', function () {
                    if (!wrapper._panZoomInstance) {
                        return;
                    }

                    wrapper._panZoomInstance.resetZoom();
                    wrapper._panZoomInstance.fit();
                    wrapper._panZoomInstance.center();
                    // update min/max after manual reset
                    if (typeof wrapper._panZoomInstance.getZoom === 'function') {
                        try {
                            const cur = wrapper._panZoomInstance.getZoom();
                            const min = Math.max(0.05, cur * 0.25);
                            const max = Math.max(1.5, cur * 12);
                            if (typeof wrapper._panZoomInstance.setMinZoom === 'function') {
                                wrapper._panZoomInstance.setMinZoom(min);
                            }
                            if (typeof wrapper._panZoomInstance.setMaxZoom === 'function') {
                                wrapper._panZoomInstance.setMaxZoom(max);
                            }
                        } catch (e) {}
                    }
                });
            }

            if (lockButton) {
                // initialize lock button UI
                setInteractionLocked(wrapper, wrapper.classList.contains('interaction-locked'));

                lockButton.addEventListener('click', function () {
                    setInteractionLocked(wrapper, !wrapper.classList.contains('interaction-locked'));
                    refitPanZoom(wrapper);
                });
            }

            if (fullscreenButton) {
                fullscreenButton.addEventListener('click', function () {
                    const willBeFullscreen = !wrapper.classList.contains('site-fullscreen');
                    setSiteFullscreen(wrapper, willBeFullscreen);
                });
            }

            if (!wrapper.getAttribute('data-fullscreen-resize-bound')) {
                window.addEventListener('resize', function () {
                    syncFullscreenDiagramHeight(wrapper);
                    refitPanZoom(wrapper);
                });
                wrapper.setAttribute('data-fullscreen-resize-bound', 'true');
            }

            wrapper.setAttribute('data-viewer-bound', 'true');
        }

        setupPanZoom(wrapper, diagram);
    }

    function ensureSkeleton(wrapper) {
        if (!wrapper) {
            return;
        }

        const stage = wrapper.querySelector('.mermaid-viewer-stage');
        if (!stage) {
            return;
        }

        let skeleton = stage.querySelector('.mermaid-skeleton');
        if (!skeleton) {
            skeleton = document.createElement('div');
            skeleton.className = 'mermaid-skeleton';
            stage.appendChild(skeleton);
        }

        wrapper.classList.remove('ready');
        wrapper.classList.add('loading');
    }

    function revealWhenReady(wrapper, timeoutMs) {
        timeoutMs = typeof timeoutMs === 'number' ? timeoutMs : 2000;
        const start = Date.now();

        function check() {
            if (!wrapper) return;
            const svg = wrapper.querySelector('.mermaid svg');
            if (svg) {
                // perform a morph from the skeleton shell to the rendered SVG size
                const stage = wrapper.querySelector('.mermaid-viewer-stage');
                if (!stage) {
                    wrapper.classList.remove('loading');
                    wrapper.classList.add('ready');
                    const skx = wrapper.querySelector('.mermaid-skeleton');
                    if (skx && skx.parentNode) skx.parentNode.removeChild(skx);
                    refitPanZoom(wrapper);
                    return;
                }

                const sk = wrapper.querySelector('.mermaid-skeleton');

                // measure start and target heights
                const startHeight = stage.getBoundingClientRect().height;

                // force svg sizing to natural size then measure
                // ensure layout has applied
                requestAnimationFrame(function () {
                    // Check if the .mermaid element has an aspect-ratio style; if so,
                    // derive target height from the stage width and the ratio instead
                    // of relying on the SVG's bounding rect (which may not honour it).
                    const diagramEl = wrapper.querySelector('.mermaid-viewer-stage .mermaid');
                    let targetHeight = 0;

                    if (diagramEl) {
                        const arStyle = diagramEl.style.aspectRatio || diagramEl.style['aspect-ratio'] || '';
                        if (arStyle) {
                            // parse "w/h" or "w" forms
                            const parts = arStyle.split('/');
                            const arW = parseFloat(parts[0]) || 1;
                            const arH = parts[1] ? (parseFloat(parts[1]) || 1) : 1;
                            const stageWidth = stage.getBoundingClientRect().width || stage.clientWidth || 300;
                            // subtract horizontal padding so the ratio applies to the content area
                            const stageStyle = window.getComputedStyle(stage);
                            const padL = parseFloat(stageStyle.paddingLeft || 0);
                            const padR = parseFloat(stageStyle.paddingRight || 0);
                            const contentWidth = Math.max(60, stageWidth - padL - padR);
                            targetHeight = Math.round(contentWidth * (arH / arW));
                        }
                    }

                    if (!targetHeight) {
                        // fallback: use the SVG's natural bounding rect
                        const targetRect = svg.getBoundingClientRect();
                        targetHeight = Math.max(40, targetRect.height);

                        // if target height looks too small, try measuring the svg's viewBox or bbox
                        if (targetHeight <= 1) {
                            try {
                                const vb = svg.viewBox.baseVal;
                                if (vb && vb.height) targetHeight = vb.height;
                            } catch (e) {}
                        }

                        // if still small, fallback to contentHeight of SVG's parent
                        if (targetHeight <= 1) {
                            if (diagramEl) targetHeight = Math.max(80, diagramEl.clientHeight || 80);
                        }
                    }

                    // set explicit height to start value to prepare for transition
                    stage.style.height = startHeight + 'px';
                    // add morphing class to enable CSS transitions
                    wrapper.classList.add('morphing');

                    // give the browser a tick
                    requestAnimationFrame(function () {
                        // target height should include padding; measure stage's paddings
                        const style = window.getComputedStyle(stage);
                        const padTop = parseFloat(style.paddingTop || 0);
                        const padBottom = parseFloat(style.paddingBottom || 0);

                        // When aspect-ratio drove targetHeight we measured content area only,
                        // so we must add padding back. When the SVG bbox drove it the raw
                        // bounding rect already includes padding, so we avoid double-adding.
                        const diagramElCheck = wrapper.querySelector('.mermaid-viewer-stage .mermaid');
                        const usedAspectRatio = !!(diagramElCheck &&
                            (diagramElCheck.style.aspectRatio || diagramElCheck.style['aspect-ratio']));
                        const finalHeight = usedAspectRatio
                            ? Math.max(40, targetHeight + padTop + padBottom)
                            : Math.max(40, targetHeight);

                        // set target height to animate to
                        stage.style.height = finalHeight + 'px';

                        // If start and target are the same (e.g. aspect-ratio diagram
                        // already set the stage to exactly the right height), no CSS
                        // transition will fire and transitionend will never come.
                        // Detect this and resolve immediately.
                        if (Math.abs(finalHeight - startHeight) < 2) {
                            if (sk && sk.parentNode) sk.parentNode.removeChild(sk);
                            wrapper.classList.remove('loading');
                            wrapper.classList.add('ready');
                            stage.style.height = '';
                            wrapper.classList.remove('morphing');
                            refitPanZoom(wrapper);
                            return;
                        }

                        // slightly fade the skeleton while morphing
                        if (sk) sk.style.opacity = '0.9';

                        // cleanup after transition
                        const onTransitionEnd = function (ev) {
                            if (ev && ev.propertyName && ev.propertyName !== 'height') return;
                            stage.removeEventListener('transitionend', onTransitionEnd);
                            // remove skeleton, toggle classes
                            if (sk && sk.parentNode) sk.parentNode.removeChild(sk);
                            wrapper.classList.remove('loading');
                            wrapper.classList.add('ready');
                            // clear inline height so layout can be natural afterwards
                            stage.style.height = '';
                            wrapper.classList.remove('morphing');
                            // ensure pan/zoom gets a proper refit now that svg exists
                            refitPanZoom(wrapper);
                        };

                        // safety: if transitionend doesn't fire, fallback after timeout
                        const fallbackTimeout = setTimeout(function () {
                            stage.removeEventListener('transitionend', onTransitionEnd);
                            if (sk && sk.parentNode) sk.parentNode.removeChild(sk);
                            wrapper.classList.remove('loading');
                            wrapper.classList.add('ready');
                            stage.style.height = '';
                            wrapper.classList.remove('morphing');
                            refitPanZoom(wrapper);
                        }, 1000);

                        stage.addEventListener('transitionend', function internal(ev) {
                            clearTimeout(fallbackTimeout);
                            onTransitionEnd(ev);
                        });
                    });
                });
                return;
            }

            if (Date.now() - start < timeoutMs) {
                requestAnimationFrame(check);
            } else {
                // give up after timeout — still remove skeleton so user can interact
                wrapper.classList.remove('loading');
                wrapper.classList.add('ready');
                const sk = wrapper.querySelector('.mermaid-skeleton');
                if (sk && sk.parentNode) sk.parentNode.removeChild(sk);
                refitPanZoom(wrapper);
            }
        }

        requestAnimationFrame(check);
    }

    function initializeMermaidViewers(options) {
        options = options || {};
        const prepareOnly = !!options.prepareOnly;
        const reveal = !!options.reveal;

        const diagrams = document.querySelectorAll('.post-article .mermaid');
        if (!diagrams.length) {
            return;
        }

        const icons = getViewerIcons();

        diagrams.forEach(function (diagram) {
            if (diagram.parentElement && diagram.parentElement.classList.contains('mermaid-viewer-stage')) {
                diagram.classList.add('mermaid-in-viewer');
                const existingWrapper = diagram.closest('.mermaid-viewer');
                    // ensure existing wrappers default to interaction-locked
                    if (existingWrapper && !existingWrapper.classList.contains('interaction-locked')) {
                        existingWrapper.classList.add('interaction-locked');
                    }
                    ensureSkeleton(existingWrapper);
                if (!prepareOnly) {
                    setupViewer(existingWrapper);
                    if (reveal) {
                        revealWhenReady(existingWrapper, 2500);
                    }
                }
                return;
            }

            const wrapper = document.createElement('div');
            wrapper.className = 'mermaid-viewer';

            wrapper._copyIcon = icons.copyCode;
            wrapper._copiedIcon = icons.copied;
            wrapper._fullscreenEnterIcon = icons.fullscreenEnter;
            wrapper._fullscreenExitIcon = icons.fullscreenExit;
            wrapper._lockIcon = icons.lock;
            wrapper._unlockIcon = icons.unlock;

            const label = document.createElement('span');
            label.className = 'language-label mermaid-label';
            label.textContent = 'Mermaid';
            label.style.userSelect = 'none';

            const toolbar = document.createElement('div');
            toolbar.className = 'mermaid-viewer-toolbar';
            toolbar.innerHTML = [
                '<button type="button" class="mermaid-action-button js-mermaid-copy-code" aria-label="Copy source" title="Copy source">' + icons.copyCode + '</button>',
                '<button type="button" class="mermaid-action-button js-mermaid-reset" aria-label="Reset view" title="Reset view">' + icons.resetView + '</button>',
                '<button type="button" class="mermaid-action-button js-mermaid-lock" aria-label="Unlock interactions" title="Unlock interactions">' + icons.lock + '</button>',
                '<button type="button" class="mermaid-action-button js-mermaid-fullscreen" aria-label="Fullscreen" title="Fullscreen">' + icons.fullscreenEnter + '</button>'
            ].join('');

            const stage = document.createElement('div');
            stage.className = 'mermaid-viewer-stage';

            // code panel removed per request

            const originalParent = diagram.parentNode;
            diagram.classList.add('mermaid-in-viewer');
            // lock interactions by default so diagrams don't intercept scrolling
            wrapper.classList.add('interaction-locked');
            originalParent.insertBefore(wrapper, diagram);
            stage.appendChild(diagram);
            wrapper.appendChild(label);
            wrapper.appendChild(toolbar);
            wrapper.appendChild(stage);
            // code panel removed per request
            ensureSkeleton(wrapper);

            if (!prepareOnly) {
                setupViewer(wrapper);
                if (reveal) {
                    // reveal when mermaid has finished rendering the SVG
                    revealWhenReady(wrapper, 2500);
                }
            }
        });
    }

    function rerenderMermaidDiagrams(isDark) {
        if (typeof mermaid === 'undefined') {
            return;
        }

        configureMermaidTheme(isDark);

        // prepare wrappers/skeletons first so raw mermaid text does not flash
        initializeMermaidViewers({ prepareOnly: true, reveal: false });

        document.querySelectorAll('.post-article .mermaid').forEach(function (el) {
            const source = (el.getAttribute('data-mermaid-source') || el.textContent || '').trim();
            el.setAttribute('data-mermaid-source', source);
            el.removeAttribute('data-processed');
            el.textContent = source;
        });

        Promise.resolve(mermaid.run({ querySelector: '.post-article .mermaid' })).then(function () {
            initializeMermaidViewers({ prepareOnly: false, reveal: true });
        }).catch(function (err) {
            console.error('Mermaid rendering failed:', err);
        });
    }

    window.reinitializeMermaidViewer = function (isDark) {
        const darkMode = typeof isDark === 'boolean'
            ? isDark
            : !document.documentElement.classList.contains('light-mode');

        rerenderMermaidDiagrams(darkMode);
    };

    document.addEventListener('DOMContentLoaded', function () {
        if (typeof mermaid === 'undefined') {
            return;
        }

        ensureMermaidSources();

        const isDark = !document.documentElement.classList.contains('light-mode');
        rerenderMermaidDiagrams(isDark);

        document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape') {
                return;
            }

            const fullscreenViewer = document.querySelector('.mermaid-viewer.site-fullscreen');
            if (fullscreenViewer) {
                setSiteFullscreen(fullscreenViewer, false);
            }
        });
    });
})();
