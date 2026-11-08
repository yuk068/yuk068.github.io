/*
 * projects-script.js - Projects page: jump to / highlight a card from the URL hash, "Copy Catalog" button,
 * and the Access links. Shared behaviour is in ../common.js.
 */
(function () {
    Site.ready(function () {
        // Scroll to (and briefly highlight) the project card named in the URL hash
        const hash = window.location.hash;

        if (hash) {
            const target = document.getElementById(decodeURIComponent(hash.slice(1)));
            if (target) {
                // Use a short delay to let layout settle
                setTimeout(function() {
                    const header = document.querySelector('#projects-header');
                    const headerHeight = header ? header.offsetHeight : 100;
                    const offsetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });

                    // Glow effect for card border + image
                    const clearGlow = () => {
                        target.style.borderColor = '';
                        const cardImage = target.querySelector('.project-card-image-container');
                        if (cardImage) cardImage.style.borderColor = '';
                        const projectImg = target.querySelector('.project-card-image-container img');
                        if (projectImg) projectImg.style.boxShadow = '';
                    };

                    target.style.transition = 'border-color 0.4s ease';
                    target.style.borderColor = 'var(--neon-aqua-accent)';

                    const cardImage = target.querySelector('.project-card-image-container');
                    if (cardImage) {
                        cardImage.style.transition = 'border-color 0.4s ease';
                        cardImage.style.borderColor = 'var(--neon-aqua-accent)';
                    }

                    const projectImg = target.querySelector('.project-card-image-container img');
                    if (projectImg) {
                        projectImg.style.transition = 'box-shadow 0.4s ease';
                        projectImg.style.boxShadow = '0 0 0 0.1875rem rgba(155, 232, 255, 0.75)';
                    }

                    setTimeout(clearGlow, 2000);
                }, 100);
            }
        }
        const copyCatalogBtn = document.getElementById('copyCatalogBtn');
        const copyCatalogBody = document.getElementById('copyCatalogBody');
        const copyCatalogLabel = document.getElementById('copyCatalogLabel');
        let copyCatalogCooldown = false;

        if (copyCatalogBtn && copyCatalogBody && copyCatalogLabel) {
            copyCatalogBtn.addEventListener('click', () => {
                if (copyCatalogCooldown) return;
                copyCatalogCooldown = true;

                const projectCards = document.querySelectorAll('.project-card');
                let catalog = '';
                
                projectCards.forEach(card => {
                    let title = '';
                    const h2 = card.querySelector('.project-card-title h2');
                    if (h2) {
                        const clonedH2 = h2.cloneNode(true);
                        const span = clonedH2.querySelector('span');
                        if (span) span.remove();
                        title = clonedH2.textContent.trim();
                    }
                    
                    let date = '';
                    const dateSpans = card.querySelectorAll('.project-card-date span');
                    dateSpans.forEach(span => {
                        const text = span.textContent || span.innerText;
                        if (text && text.trim()) {
                            date = text.trim();
                        }
                    });
                    
                    let description = '';
                    const p = card.querySelector('.project-card-preview-text p');
                    if (p) {
                        description = p.textContent.trim();
                    }
                    
                    if (title && description) {
                        catalog += `### ${title} (${date})\n\n${description}\n\n`;
                    }
                });
                
                catalog = catalog.trim();
                
                if (catalog) {
                    navigator.clipboard.writeText(catalog).then(() => {
                        copyCatalogBody.style.opacity = '0';
                        setTimeout(() => {
                            copyCatalogLabel.textContent = SITE_TEXT.projects.copied;
                            copyCatalogBody.style.opacity = '1';
                            
                            setTimeout(() => {
                                copyCatalogBody.style.opacity = '0';
                                setTimeout(() => {
                                    copyCatalogLabel.textContent = SITE_TEXT.projects.copy_catalog;
                                    copyCatalogBody.style.opacity = '1';
                                    copyCatalogCooldown = false;
                                }, 200);
                            }, 2000);
                        }, 200);
                    }).catch(err => {
                        console.error('Failed to copy catalog: ', err);
                        copyCatalogCooldown = false;
                    });
                } else {
                    copyCatalogCooldown = false;
                }
            });
        }
    });

    // "Access" button on a card: forward the click to that card's access link (inline onclick in projects.html)
    window.openProjectAccess = function openProjectAccess(element) {
        const card = element.closest('.project-card');
        if (!card) return;
        const accessLink = card.querySelector('.access-button a');
        if (accessLink) accessLink.click();
    };

    Site.initScrollHeader({
        header: '#projects-header',
        title: '#projects-header-title',
        titleSize: '1.7em',
        navSize: '1.125rem',
        button: { at: 600 }
    });
})();
