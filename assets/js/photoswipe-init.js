/*
 * photoswipe-init.js - click-to-zoom lightbox for images inside posts (loaded as <script type="module">).
 * PhotoSwipe is imported from the CDN.
 */
import PhotoSwipeLightbox from 'https://unpkg.com/photoswipe@5/dist/photoswipe-lightbox.esm.js';

const lightbox = new PhotoSwipeLightbox({
    gallery: '.post-article',
    children: 'img',
    pswpModule: () => import('https://unpkg.com/photoswipe@5/dist/photoswipe.esm.js'),

    // --- Animation Settings ---
    showHideAnimationType: 'fade',

    // --- Zoom Enhancements ---
    wheelToZoom: true,
    imageClickAction: 'zoom',
    secondaryZoomLevel: 2,
    maxZoomLevel: 4,

    // --- Loading Behavior ---
    preload: [1, 5],
});

// Read the real image size from the element
lightbox.addFilter('itemData', (itemData) => {
    const img = itemData.element;

    return {
        src: img.src,
        msrc: img.src,
        width: img.naturalWidth || img.width || 1200,
        height: img.naturalHeight || img.height || 800,
        element: img
    };
});

// Correct the dimensions once the image has decoded
lightbox.on('contentLoadImage', (e) => {
    const { content } = e;

    content.element.decode().then(() => {
        content.width = content.element.naturalWidth;
        content.height = content.element.naturalHeight;

        if (lightbox.pswp) {
            lightbox.pswp.refreshSize(true);
        }
    }).catch(() => {});
});

lightbox.init();