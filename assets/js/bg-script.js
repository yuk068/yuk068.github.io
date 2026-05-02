(function() {
    const BG_STATE_KEY = 'site_bg_state';
    let isBgOn = localStorage.getItem(BG_STATE_KEY) !== 'off';

    const canvas = document.getElementById("starfield");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");

    let stars = [];
    let shootingStars = [];
    const numStars = 360;
    let animationId;
    let isAnimating = false;
    const centerFalloffWeight = 0.75;

    const isPostPage = !!document.getElementById('post-header') || !!document.querySelector('.post-article');

    let lastWidth = window.innerWidth;

    function resizeCanvas() {
        const isMobile = window.innerWidth <= 790;
        const widthChanged = window.innerWidth !== lastWidth;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (widthChanged || !isMobile || stars.length === 0) {
            initStars();
            lastWidth = window.innerWidth;
        }
    }

    function initStars() {
        stars = Array.from({ length: numStars }, () => ({
            angle: Math.random() * Math.PI * 2,
            radius: Math.pow(Math.random(), 0.5 / centerFalloffWeight) * Math.sqrt(canvas.width ** 2 + canvas.height ** 2),
            speed: Math.random() * 0.0003 + 0.00015,
            size: Math.random() * 1.2 + 0.5,
        }));
    }

    function spawnShootingStar() {
        if (shootingStars.length === 0 && Math.random() < 0.01) {
            shootingStars.push({
                x: Math.random() * canvas.width * 0.5,
                y: Math.random() * canvas.height * 0.5,
                vx: 3 + Math.random() * 2,
                vy: 1 + Math.random() * 1.5,
                life: 80,
                initialLife: 80,
            });
        }
    }

    function animate() {
        if (!isBgOn || isForceDisabled()) {
            isAnimating = false;
            return;
        }

        const isMobile = window.innerWidth <= 790;
        const centerX = canvas.width;
        const centerY = isMobile ? window.screen.height : canvas.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const isLightMode = document.documentElement.classList.contains('light-mode');
        const colorBase = isLightMode ? '80, 80, 80' : '255, 255, 255';

        // Stars orbiting
        stars.forEach((star, i) => {
            star.angle += star.speed;
            const x = centerX + star.radius * Math.cos(star.angle);
            const y = centerY + star.radius * Math.sin(star.angle);

            const flicker = 0.25 + Math.abs(Math.sin(Date.now() * 0.0015 + i)) * 0.15;

            ctx.beginPath();
            ctx.fillStyle = `rgba(${colorBase}, ${flicker})`;
            ctx.arc(x, y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Shooting stars
        if (!isPostPage) {
            spawnShootingStar();
            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const s = shootingStars[i];
                const opacity = s.life / s.initialLife;

                const grad = ctx.createLinearGradient(
                    s.x,
                    s.y,
                    s.x - s.vx * 35,
                    s.y - s.vy * 35
                );
                grad.addColorStop(0, `rgba(${colorBase}, ${opacity * 0.75})`);
                grad.addColorStop(1, `rgba(${colorBase}, 0)`);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x - s.vx * 18, s.y - s.vy * 18);
                ctx.stroke();

                s.x += s.vx;
                s.y += s.vy;
                s.life -= 1;

                if (s.life <= 0) {
                    shootingStars.splice(i, 1);
                }
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    function isForceDisabled() {
        const isMobile = window.innerWidth <= 790;
        return isPostPage && isMobile;
    }

    function startAnimation() {
        if (isForceDisabled()) {
            canvas.style.display = 'none';
            return;
        }
        if (!isAnimating && isBgOn) {
            isAnimating = true;
            canvas.style.display = 'block';
            resizeCanvas();
            animate();
        }
    }

    function stopAnimation(mutateState = true) {
        if (mutateState) isBgOn = false;
        isAnimating = false;
        canvas.style.display = 'none';
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener("resize", () => {
        if (isForceDisabled()) {
            stopAnimation(false);
            updateLabelWithDataset();
        } else if (isBgOn) {
            startAnimation();
            updateLabelWithDataset();
            resizeCanvas();
        }
    });

    const bgPerformanceBtn = document.getElementById('configPlaceholder2');
    const bgPerformanceLabel = document.getElementById('bgPerformanceLabel');
    const bgPerformanceBody = document.getElementById('bgPerformanceBody');
    let bgPerformanceCooldown = false;

    function updateLabelWithDataset() {
        if (!bgPerformanceLabel) return;
        const lang = bgPerformanceLabel.dataset.lang || 'en';
        
        let displayState = isBgOn;
        if (isForceDisabled()) {
            displayState = false;
        }

        if (lang === 'vi') {
            bgPerformanceLabel.textContent = displayState ? 'BG: Bật' : 'BG: Tắt';
        } else {
            bgPerformanceLabel.textContent = displayState ? 'BG: On' : 'BG: Off';
        }

        if (bgPerformanceBtn) {
            if (isForceDisabled()) {
                bgPerformanceBtn.style.opacity = '0.5';
                bgPerformanceBtn.style.cursor = 'not-allowed';
            } else {
                bgPerformanceBtn.style.opacity = '1';
                bgPerformanceBtn.style.cursor = 'pointer';
            }
        }
    }

    if (bgPerformanceBtn) {
        bgPerformanceBtn.addEventListener('click', () => {
            if (bgPerformanceCooldown || isForceDisabled()) return;
            
            bgPerformanceCooldown = true;
            setTimeout(() => {
                bgPerformanceCooldown = false;
            }, 300);

            isBgOn = !isBgOn;
            localStorage.setItem(BG_STATE_KEY, isBgOn ? 'on' : 'off');
            
            if (bgPerformanceBody) {
                bgPerformanceBody.classList.add('fade');
                setTimeout(() => {
                    updateLabelWithDataset();
                    if (isBgOn) {
                        startAnimation();
                    } else {
                        stopAnimation();
                    }
                    bgPerformanceBody.classList.remove('fade');
                }, 220);
            } else {
                updateLabelWithDataset();
                if (isBgOn) {
                    startAnimation();
                } else {
                    stopAnimation();
                }
            }
        });
    }

    // Initialize
    if (isBgOn) {
        startAnimation();
    } else {
        stopAnimation();
    }
    
    // Setup label on load
    updateLabelWithDataset();
})();
