// Scroll Lock Utilities (Prevents scrollbar width shift when modal opens)
function lockBodyScroll() {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    const nav = document.querySelector('nav');
    if (nav && !nav.classList.contains('scrolled')) {
        nav.style.paddingRight = `${scrollBarWidth}px`;
    }
    document.body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
    document.body.style.paddingRight = '';
    const nav = document.querySelector('nav');
    if (nav) nav.style.paddingRight = '';
    document.body.style.overflow = '';
}

// =========================================================
// 1. ALL ORIGINAL PORTFOLIO DATA & CAROUSEL ENGINE
// =========================================================
const portfolioData = [
    { 
        img: 'assets/portfolio-bw.svg', 
        category: 'Editorial Vector', 
        title: 'Standard Editorial B&W', 
        desc: 'High-contrast vector lineage drafted to RICS standards, ideal for traditional print brochures.' 
    },
    { 
        img: 'assets/portfolio-color.svg', 
        category: 'Marketing Visual', 
        title: 'Color Zoned Marketing Layout', 
        desc: 'Soft color-coded zones to help buyers visualize property flow and room functions instantly.' 
    },
    { 
        img: 'assets/portfolio-furniture.svg', 
        category: 'High-Fidelity CAD', 
        title: 'Premium Furnished Space', 
        desc: 'Includes accurate, modern CAD blocks for furniture to showcase property scale and potential.' 
    },
    { 
        img: 'assets/portfolio-commercial.svg', 
        category: 'Commercial Corporate', 
        title: 'Commercial Property Specification', 
        desc: 'Drafted cleanly to showcase complex corporate layouts and massive square footage.' 
    },
    { 
        img: 'assets/portfolio-complex.svg', 
        category: 'Architectural Blueprint', 
        title: 'Complex Multi-Level Blueprint', 
        desc: 'Absolute geometrical precision for intricate layouts, split-levels, and period properties.' 
    },
    { 
        img: 'assets/portfolio-siteplan.svg', 
        category: 'Site Mapping', 
        title: 'Overall Site & Boundary Layout', 
        desc: 'Clear mapping of external perimeters, gardens, driveways, and outbuildings.' 
    },
    { 
        img: 'assets/portfolio-siteplan-2.svg', 
        category: 'Site Mapping II', 
        title: 'Overall Site & Boundary Layout II', 
        desc: 'Enhanced site boundary layout showing lap pool, pavilion, and landscaped grounds.' 
    },
    { 
        img: 'assets/portfolio-complex-2.svg', 
        category: 'Architectural Blueprint II', 
        title: 'Complex Multi-Level Blueprint II', 
        desc: 'Multi-level duplex layout with high-precision architectural detailing.' 
    },
    { 
        img: 'assets/portfolio-color-2.svg', 
        category: 'Marketing Visual II', 
        title: 'Color Zoned Marketing Layout II', 
        desc: 'Vibrant color-coded zoning for luxury open-plan residential living.' 
    },
    { 
        img: 'assets/portfolio-commercial-2.svg', 
        category: 'Commercial Corporate II', 
        title: 'Commercial Property Specification II', 
        desc: '12,000 sq ft office hub specification with open-plan workstation zones.' 
    },
    { 
        img: 'assets/portfolio-curve.svg', 
        category: 'Curved Architecture', 
        title: 'Standard Editorial B&W Curve', 
        desc: 'Specialized curved wall lineage for bespoke architectural designs.' 
    }
];

function renderPortfolio() {
    const track = document.getElementById('portfolioTrack');
    if (!track) return;
    
    // Duplicate array to create 100% seamless infinite scroll loop
    const duplicatedData = [...portfolioData, ...portfolioData];
    
    let htmlContent = '';
    duplicatedData.forEach((item, index) => {
        const originalIndex = index % portfolioData.length;
        htmlContent += `
        <div class="portfolio-card" data-index="${originalIndex}">
            <div class="portfolio-card-img-wrap">
                <span class="portfolio-card-badge">${item.category}</span>
                <img src="${item.img}" alt="${escapeHtml(item.title)}" loading="lazy">
            </div>
            <div class="portfolio-card-meta">
                <h4>${item.title}</h4>
                <p>${item.desc}</p>
            </div>
        </div>`;
    });
    track.innerHTML = htmlContent;

    initPortfolioInteractivity();
    initPortfolioAutoScrollEngine();
}

let portfolioAutoScrollAnimId = null;
let isMouseOverPortfolio = false;
let isDraggingPortfolio = false;
let portfolioHasDragged = false;

function checkInfiniteScrollBounds() {
    const container = document.getElementById('portfolioTrackContainer');
    if (!container) return;

    const singleSetWidth = container.scrollWidth / 2;
    if (singleSetWidth <= 0) return;

    if (container.scrollLeft <= 0) {
        container.scrollLeft += singleSetWidth;
    } else if (container.scrollLeft >= singleSetWidth) {
        container.scrollLeft -= singleSetWidth;
    }
}

function initPortfolioAutoScrollEngine() {
    const container = document.getElementById('portfolioTrackContainer');
    if (!container) return;

    if (container.scrollLeft === 0) {
        container.scrollLeft = 1;
    }

    function updatePortfolioProgressBar() {
        const indicator = document.getElementById('portfolioProgressIndicator');
        if (!indicator) return;
        const track = indicator.closest('.portfolio-progress-track');
        if (!track) return;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (maxScroll <= 0) return;
        // Use the first half only (duplicated track), so progress resets seamlessly
        const halfScroll = container.scrollWidth / 2;
        const rawScroll = container.scrollLeft % (halfScroll || 1);
        const progress = rawScroll / halfScroll;
        const trackWidth = track.clientWidth;
        const indicatorWidth = indicator.offsetWidth;
        const maxTranslate = trackWidth - indicatorWidth;
        indicator.style.transform = `translateX(${progress * maxTranslate}px)`;
    }

    function step() {
        if (!isMouseOverPortfolio && !isDraggingPortfolio) {
            container.scrollLeft += 0.8;
        }
        checkInfiniteScrollBounds();
        updatePortfolioProgressBar();
        portfolioAutoScrollAnimId = requestAnimationFrame(step);
    }

    if (portfolioAutoScrollAnimId) cancelAnimationFrame(portfolioAutoScrollAnimId);
    portfolioAutoScrollAnimId = requestAnimationFrame(step);

    // Sync progress bar and boundary limits on manual scroll/drag/swipe
    container.addEventListener('scroll', () => {
        checkInfiniteScrollBounds();
        updatePortfolioProgressBar();
    }, { passive: true });

    container.addEventListener('mouseenter', () => { isMouseOverPortfolio = true; });
    container.addEventListener('mouseleave', () => {
        isMouseOverPortfolio = false;
        isDraggingPortfolio = false;
        container.classList.remove('dragging');
    });

    let startX = 0;
    let scrollLeftStart = 0;

    container.addEventListener('mousedown', (e) => {
        isDraggingPortfolio = true;
        portfolioHasDragged = false;
        startX = e.pageX - container.offsetLeft;
        scrollLeftStart = container.scrollLeft;
        container.classList.add('dragging');
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDraggingPortfolio) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 8) {
            portfolioHasDragged = true;
        }
        container.scrollLeft = scrollLeftStart - walk;
        checkInfiniteScrollBounds();
    });

    container.addEventListener('mouseup', () => {
        isDraggingPortfolio = false;
        container.classList.remove('dragging');
        setTimeout(() => { portfolioHasDragged = false; }, 50);
    });

    // Touch Support for Smooth Swipe
    let touchStartX = 0;
    let touchScrollStart = 0;

    container.addEventListener('touchstart', (e) => {
        isDraggingPortfolio = true;
        portfolioHasDragged = false;
        touchStartX = e.touches[0].pageX - container.offsetLeft;
        touchScrollStart = container.scrollLeft;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        if (!isDraggingPortfolio) return;
        const x = e.touches[0].pageX - container.offsetLeft;
        const walk = (x - touchStartX) * 1.5;
        if (Math.abs(walk) > 8) {
            portfolioHasDragged = true;
        }
        container.scrollLeft = touchScrollStart - walk;
        checkInfiniteScrollBounds();
    }, { passive: true });

    container.addEventListener('touchend', () => {
        isDraggingPortfolio = false;
        setTimeout(() => { portfolioHasDragged = false; }, 50);
    });
}

function initPortfolioInteractivity() {
    const cards = document.querySelectorAll('.portfolio-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            if (portfolioHasDragged) {
                return; // Prevent opening lightbox if user was dragging/swiping
            }
            const index = parseInt(card.getAttribute('data-index'));
            openLightbox(index);
        });
    });
}

function escapeHtml(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// =========================================================
// 2. FULL-FEATURED LIGHTBOX MODAL ENGINE WITH ADVANCED GESTURES
// =========================================================
let currentLightboxIndex = 0;
let lightboxScale = 1.0;
let lightboxPanX = 0;
let lightboxPanY = 0;
let lightboxIsZoomed = false;
let lightboxWheelCooldown = false;

function openLightbox(index) {
    currentLightboxIndex = index;
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightbox-img');
    const title = document.getElementById('lightbox-title');
    const desc = document.getElementById('lightbox-desc');
    const wrapper = document.getElementById('lightboxImgWrapper');

    const data = portfolioData[index];
    if (!data || !modal || !img || !title || !desc) return;

    resetLightboxZoom(false);

    img.src = data.img;
    img.style.display = 'block';
    img.style.visibility = 'visible';
    img.style.opacity = '1';

    if (wrapper) {
        wrapper.style.display = 'flex';
        wrapper.style.visibility = 'visible';
        wrapper.style.opacity = '1';
    }

    title.textContent = data.title;
    desc.textContent = data.desc;

    modal.classList.add('active');
    lockBodyScroll();
}

function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) modal.classList.remove('active');
    resetLightboxZoom(false);
    unlockBodyScroll();
}

function resetLightboxZoom(animated = true) {
    lightboxScale = 1.0;
    lightboxPanX = 0;
    lightboxPanY = 0;
    lightboxIsZoomed = false;

    const wrapper = document.getElementById('lightboxImgWrapper');
    const img = document.getElementById('lightbox-img');

    if (wrapper) {
        wrapper.classList.remove('zoomed', 'dragging');
        wrapper.style.opacity = '1';
    }

    if (img) {
        if (!animated) {
            img.style.transition = 'none';
        } else {
            img.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease';
        }
        img.style.transform = 'translate3d(0px, 0px, 0px) scale(1)';
        img.style.opacity = '1';
    }
}

function updateZoomTransform(animated = false) {
    const wrapper = document.getElementById('lightboxImgWrapper');
    const img = document.getElementById('lightbox-img');
    if (!wrapper || !img) return;

    lightboxIsZoomed = lightboxScale > 1.05;

    if (lightboxIsZoomed) {
        wrapper.classList.add('zoomed');
        // Calculate maximum pan bounds based on scaled image dimensions versus wrapper container size
        const imgWidth = img.offsetWidth || (wrapper.clientWidth * 0.9);
        const imgHeight = img.offsetHeight || (wrapper.clientHeight * 0.9);
        const maxPanX = Math.max(0, (imgWidth * lightboxScale - wrapper.clientWidth) / 2);
        const maxPanY = Math.max(0, (imgHeight * lightboxScale - wrapper.clientHeight) / 2);

        lightboxPanX = Math.max(-maxPanX, Math.min(maxPanX, lightboxPanX));
        lightboxPanY = Math.max(-maxPanY, Math.min(maxPanY, lightboxPanY));
    } else {
        wrapper.classList.remove('zoomed', 'dragging');
        lightboxPanX = 0;
        lightboxPanY = 0;
    }

    if (animated) {
        img.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    } else {
        img.style.transition = 'none';
    }

    img.style.transform = `translate3d(${lightboxPanX}px, ${lightboxPanY}px, 0px) scale(${lightboxScale})`;
}

function performMinimalAppleAnimation(newIndex, userDeltaX = 0) {
    const wrapper = document.getElementById('lightboxImgWrapper');
    const img = document.getElementById('lightbox-img');
    const title = document.getElementById('lightbox-title');
    const desc = document.getElementById('lightbox-desc');
    const data = portfolioData[newIndex];

    if (!wrapper || !img || !title || !desc || !data) return;

    const outDirection = userDeltaX < 0 ? -60 : 60;

    img.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';
    img.style.transform = `translate3d(${outDirection}px, 0, 0) scale(0.95)`;
    img.style.opacity = '0';

    setTimeout(() => {
        currentLightboxIndex = newIndex;
        img.src = data.img;
        title.textContent = data.title;
        desc.textContent = data.desc;
        resetLightboxZoom(false);

        const inDirection = userDeltaX < 0 ? 60 : -60;
        img.style.transition = 'none';
        img.style.transform = `translate3d(${inDirection}px, 0, 0) scale(0.95)`;
        img.style.opacity = '0';

        requestAnimationFrame(() => {
            img.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease';
            img.style.transform = 'translate3d(0, 0, 0) scale(1)';
            img.style.opacity = '1';
        });
    }, 220);
}

function navigateLightbox(dir, userDeltaX = 0) {
    if (lightboxIsZoomed) {
        resetLightboxZoom(true);
    }
    let newIndex = currentLightboxIndex;
    if (dir === 'next') {
        newIndex = (currentLightboxIndex + 1) % portfolioData.length;
    } else if (dir === 'prev') {
        newIndex = (currentLightboxIndex - 1 + portfolioData.length) % portfolioData.length;
    }
    performMinimalAppleAnimation(newIndex, userDeltaX !== 0 ? userDeltaX : (dir === 'next' ? -1 : 1));
}

// Double-Tap / Double-Click Zoom centered at click point
function toggleZoomAtPoint(clientX, clientY) {
    const wrapper = document.getElementById('lightboxImgWrapper');
    if (!wrapper) return;

    if (lightboxScale > 1.2) {
        resetLightboxZoom(true);
    } else {
        const rect = wrapper.getBoundingClientRect();
        const offsetX = clientX - (rect.left + rect.width / 2);
        const offsetY = clientY - (rect.top + rect.height / 2);

        lightboxScale = 2.5;
        lightboxPanX = -offsetX * 1.5;
        lightboxPanY = -offsetY * 1.5;
        updateZoomTransform(true);
    }
}

// Global Lightbox Event Listeners Setup
function initLightboxEventListeners() {
    const modal = document.getElementById('lightboxModal');
    const wrapper = document.getElementById('lightboxImgWrapper');
    const img = document.getElementById('lightbox-img');
    if (!modal || !wrapper || !img) return;

    // Backdrop click to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeLightbox();
        }
    });

    // Double-click to zoom
    let lastTapTime = 0;
    wrapper.addEventListener('click', (e) => {
        const now = Date.now();
        if (now - lastTapTime < 300) {
            toggleZoomAtPoint(e.clientX, e.clientY);
        }
        lastTapTime = now;
    });

    // Touch Pinch & Swipe & Pan Events
    let touchStartDist = 0;
    let touchStartScale = 1.0;
    let isTouching = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let initialPanX = 0;
    let initialPanY = 0;
    let swipeDeltaX = 0;

    wrapper.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            touchStartDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            touchStartScale = lightboxScale;
        } else if (e.touches.length === 1) {
            isTouching = true;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            initialPanX = lightboxPanX;
            initialPanY = lightboxPanY;
            swipeDeltaX = 0;
        }
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            const currentDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            if (touchStartDist > 0) {
                lightboxScale = Math.max(1.0, Math.min(4.5, touchStartScale * (currentDist / touchStartDist)));
                updateZoomTransform(false);
            }
        } else if (e.touches.length === 1 && isTouching) {
            const deltaX = e.touches[0].clientX - touchStartX;
            const deltaY = e.touches[0].clientY - touchStartY;

            if (lightboxIsZoomed) {
                lightboxPanX = initialPanX + deltaX;
                lightboxPanY = initialPanY + deltaY;
                updateZoomTransform(false);
            } else {
                swipeDeltaX = deltaX;
                img.style.transition = 'none';
                img.style.transform = `translate3d(${deltaX}px, 0, 0) scale(1)`;
                img.style.opacity = `${Math.max(0.4, 1 - Math.abs(deltaX) / 500)}`;
            }
        }
    }, { passive: true });

    wrapper.addEventListener('touchend', (e) => {
        if (isTouching) {
            isTouching = false;
            if (!lightboxIsZoomed && Math.abs(swipeDeltaX) > 60) {
                navigateLightbox(swipeDeltaX < 0 ? 'next' : 'prev', swipeDeltaX);
            } else if (!lightboxIsZoomed) {
                img.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                img.style.transform = 'translate3d(0, 0, 0) scale(1)';
                img.style.opacity = '1';
            }
        }
    });

    // Mouse Drag Panning when zoomed
    let isMouseDown = false;
    let mouseStartX = 0;
    let mouseStartY = 0;

    wrapper.addEventListener('mousedown', (e) => {
        if (lightboxIsZoomed) {
            isMouseDown = true;
            mouseStartX = e.clientX - lightboxPanX;
            mouseStartY = e.clientY - lightboxPanY;
            wrapper.classList.add('dragging');
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (isMouseDown && lightboxIsZoomed) {
            lightboxPanX = e.clientX - mouseStartX;
            lightboxPanY = e.clientY - mouseStartY;
            updateZoomTransform(false);
        }
    });

    window.addEventListener('mouseup', () => {
        if (isMouseDown) {
            isMouseDown = false;
            wrapper.classList.remove('dragging');
        }
    });
    // ─────────────────────────────────────────────────────────────────────
    // Wheel & Trackpad Engine
    //
    // Signal map (reliable browser behaviour across macOS + Windows):
    //  • Physical mouse wheel  → e.deltaX === 0, integer e.deltaY (≥ 10),
    //                            e.ctrlKey is NEVER true, e.deltaMode may be 1
    //  • Trackpad pinch-zoom   → e.ctrlKey === true  (browser synthesises this)
    //  • Trackpad 2-finger scroll (vertical/horizontal) → e.ctrlKey === false,
    //                            small continuous fractional or integer e.deltaY,
    //                            e.deltaX may be non-zero
    //
    // Rules:
    //  • Physical mouse wheel  → ZOOM only
    //  • Trackpad pinch        → ZOOM only
    //  • Trackpad 2-finger horizontal flick → slide navigation (one slide per gesture)
    //  • Trackpad 2-finger vertical scroll  → IGNORED (no zoom, no navigation)
    // ─────────────────────────────────────────────────────────────────────
    let isNavigatingModal = false;

    modal.addEventListener('wheel', (e) => {
        if (!modal.classList.contains('active')) return;
        e.preventDefault();

        // Guard: lockout while a slide transition is in progress
        if (lightboxWheelCooldown || isNavigatingModal) return;

        // ── A. TRACKPAD PINCH-ZOOM (browser sets e.ctrlKey for pinch gestures) ──
        if (e.ctrlKey) {
            if (Math.abs(e.deltaY) > 0) {
                const zoomStep = e.deltaY < 0 ? 0.18 : -0.18;
                lightboxScale = Math.max(1.0, Math.min(4.5, lightboxScale + zoomStep));
                updateZoomTransform(false);
            }
            return;
        }

        // ── B. PHYSICAL MOUSE WHEEL ZOOM ──────────────────────────────────────
        // Physical mouse wheels produce: deltaX === 0, integer deltaY, deltaMode = 1
        // or large integer pixel deltas (e.g. 120 on Windows, 6–12 on macOS Magic Mouse)
        const isMouseWheel = (e.deltaX === 0) &&
                             (e.deltaMode !== 0 || (Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 10));

        if (isMouseWheel) {
            if (Math.abs(e.deltaY) > 0) {
                const zoomStep = e.deltaY < 0 ? 0.18 : -0.18;
                lightboxScale = Math.max(1.0, Math.min(4.5, lightboxScale + zoomStep));
                updateZoomTransform(false);
            }
            return;
        }

        // ── C. TRACKPAD 2-FINGER HORIZONTAL SWIPE → Slide navigation ─────────
        // Only navigate when image is at 1.0x scale and horizontal momentum is dominant
        if (lightboxScale <= 1.05 &&
            Math.abs(e.deltaX) > 35 &&
            Math.abs(e.deltaX) > Math.abs(e.deltaY)) {

            lightboxWheelCooldown = true;
            isNavigatingModal = true;

            if (e.deltaX > 0) {
                navigateLightbox('next', -1);
            } else {
                navigateLightbox('prev', 1);
            }

            // 700 ms lockout absorbs trackpad inertia so one flick = exactly one slide
            setTimeout(() => {
                lightboxWheelCooldown = false;
                isNavigatingModal = false;
            }, 700);
            return;
        }

        // ── D. TRACKPAD 2-FINGER PAN while zoomed in ─────────────────────────
        if (lightboxScale > 1.05 && !e.ctrlKey) {
            lightboxPanX -= e.deltaX * 0.8;
            lightboxPanY -= e.deltaY * 0.8;
            updateZoomTransform(false);
            return;
        }

        // ── E. TRACKPAD 2-FINGER VERTICAL SCROLL at 1.0x scale ───────────────
        // Deliberately ignored — no zoom, no navigation.

    }, { passive: false });
}

// Keyboard Navigation Handler
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('lightboxModal');
    if (modal && modal.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') navigateLightbox('next');
        if (e.key === 'ArrowLeft') navigateLightbox('prev');
    }
});

// Initialize Lightbox Events on Load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightboxEventListeners);
} else {
    initLightboxEventListeners();
}

// =========================================================
// 3. FLOATING PILL NAVBAR SCROLL LISTENER & MOBILE MENU TOGGLE
// =========================================================
const mainNav = document.querySelector('nav');
if (mainNav) {
    let isScrolled = false;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                if (!isScrolled && scrollY > 50) {
                    isScrolled = true;
                    mainNav.classList.add('scrolled');
                } else if (isScrolled && scrollY < 20) {
                    isScrolled = false;
                    mainNav.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');

if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// =========================================================
// 4. BEFORE / AFTER COMPARISON SLIDER
// =========================================================
const sliderContainer = document.getElementById('sliderContainer');
const afterImg = document.getElementById('afterImg');
const sliderLine = document.getElementById('sliderLine');
const sliderHandleIcon = document.getElementById('sliderHandleIcon');
const sliderRange = document.getElementById('sliderRange');

function updateSlider() {
    if (!sliderRange || !afterImg || !sliderLine || !sliderHandleIcon) return;
    const value = sliderRange.value;
    afterImg.style.width = `${value}%`;
    sliderLine.style.left = `${value}%`;
    sliderHandleIcon.style.left = `${value}%`;

    if (sliderContainer && afterImg) {
        const absoluteImg = afterImg.querySelector('img');
        if (absoluteImg) {
            absoluteImg.style.width = sliderContainer.offsetWidth + 'px';
            absoluteImg.style.height = '100%';
        }
    }
}

if (sliderRange) {
    updateSlider();
    sliderRange.addEventListener('input', updateSlider);
}

window.addEventListener('resize', () => {
    if (!sliderContainer || !afterImg) return;
    const absoluteImg = afterImg.querySelector('img');
    if (absoluteImg) {
        absoluteImg.style.width = sliderContainer.offsetWidth + 'px';
        absoluteImg.style.height = '100%';
    }
});

// =========================================================
// 5. GOOGLE-STYLE FLOATING NUMERIC CAROUSEL ENGINE
// =========================================================
const heroStyles = [
    { img: 'assets/hero-bw.svg', name: 'Editorial B&W' },
    { img: 'assets/hero-plan-color.svg', name: 'Color Zoned' },
    { img: 'assets/hero-plan-3.svg', name: 'Furnished' }
];
let currentHeroIndex = 0;

function updateHeroSlide(newIndex, direction = 'next') {
    const imgEl = document.getElementById('hero-plan-img');
    const counterEl = document.getElementById('current-slide');
    const labelEl = document.getElementById('hero-style-label');

    if (!imgEl) return;

    // Determine direction classes
    const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
    const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';

    // Start slide out
    imgEl.classList.remove('slide-in-right', 'slide-in-left', 'slide-out-left', 'slide-out-right');
    imgEl.classList.add(outClass);

    setTimeout(() => {
        currentHeroIndex = (newIndex + heroStyles.length) % heroStyles.length;
        imgEl.src = heroStyles[currentHeroIndex].img;

        if (counterEl) counterEl.textContent = currentHeroIndex + 1;
        if (labelEl) labelEl.textContent = heroStyles[currentHeroIndex].name;

        // Start slide in
        imgEl.classList.remove(outClass);
        imgEl.classList.add(inClass);
    }, 180);
}

function initHeroCarousel() {
    document.getElementById('hero-next-btn')?.addEventListener('click', () => updateHeroSlide(currentHeroIndex + 1, 'next'));
    document.getElementById('hero-prev-btn')?.addEventListener('click', () => updateHeroSlide(currentHeroIndex - 1, 'prev'));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroCarousel);
} else {
    initHeroCarousel();
}

// =========================================================
// 6. SEQUENTIAL HERO PAGE-LOAD REVEAL ANIMATION
// =========================================================
function initHeroLoadAnimation() {
    const heroElements = document.querySelectorAll('.hero-reveal');
    heroElements.forEach((el) => {
        const delay = parseInt(el.getAttribute('data-delay')) || 150;
        setTimeout(() => {
            el.classList.add('active');
        }, delay);
    });
}

// =========================================================
// 6. SINGLE UNIFIED SCROLL REVEAL ENGINE
// =========================================================
function setupScrollReveals() {
    if (window.globalObserver) window.globalObserver.disconnect();

    // 1. STRICTLY PROTECT INNER CARD ELEMENTS (Prevents double-bouncing)
    const innerElements = document.querySelectorAll(
        '.bento-card *, .bento-hero-card *, .step-card *, .premium-pricing-card *, .portfolio-card *, .about-apple-card *, .standard-card *'
    );
    innerElements.forEach((child) => {
        child.classList.remove('reveal-item', 'reveal-node', 'is-visible', 'active');
        child.style.removeProperty('--stagger-delay');
        child.style.removeProperty('--reveal-delay');
    });

    // 2. STAGGER CORE SERVICES GRID (0.12s sequential wave)
    document.querySelectorAll('.standards-grid .standard-card').forEach((card, index) => {
        card.classList.add('reveal-item');
        card.style.setProperty('--stagger-delay', `${index * 0.12}s`);
    });

    // 3. STAGGER PRECISION STANDARDS BENTO GRID (0.1s sequential wave)
    document.querySelectorAll('.bento-specs-grid .bento-card').forEach((card, index) => {
        card.classList.add('reveal-item');
        card.style.setProperty('--stagger-delay', `${index * 0.1}s`);
    });

    // 4. STAGGER WORKFLOW STEPS (0.15s sequential wave)
    document.querySelectorAll('.workflow-grid .step-card').forEach((card, index) => {
        card.classList.add('reveal-item');
        card.style.setProperty('--stagger-delay', `${index * 0.15}s`);
    });

    // 5. STAGGER ABOUT METRICS & PORTFOLIO TRACK (0.1s sequential wave)
    document.querySelectorAll('.about-bento-grid .bento-metric-item').forEach((item, index) => {
        item.classList.add('reveal-item');
        item.style.setProperty('--stagger-delay', `${index * 0.12}s`);
    });

    document.querySelectorAll('.portfolio-track .portfolio-card').forEach((card, index) => {
        card.classList.add('reveal-item');
        card.style.setProperty('--stagger-delay', `${(index % 6) * 0.1}s`);
    });

    // 6. TARGET ALL STANDALONE ELEMENTS & HEADERS EXPLICITLY
    const standaloneElements = document.querySelectorAll(
        '.section-header, ' +
        '.bento-hero-card, ' +
        '.about-top-row > div, ' +
        '.about-apple-card, ' +
        '.slider-wrapper, ' +
        '.premium-pricing-card, ' +
        '.pricing-toggle-zone, ' +
        '.form-container-box, ' +
        '.billing-banner'
    );
    
    standaloneElements.forEach((el) => {
        el.classList.add('reveal-item');
        if (!el.style.getPropertyValue('--stagger-delay')) {
            el.style.setProperty('--stagger-delay', '0s');
        }
    });

    // 7. SINGLE HIGH-PERFORMANCE INTERSECTION OBSERVER
    const observerOptions = { root: null, threshold: 0.08, rootMargin: '0px 0px -40px 0px' };

    window.globalObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible', 'revealed', 'active');
                window.globalObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-item').forEach((el) => window.globalObserver.observe(el));
}

function initScrollRevealEngine() {
    setupScrollReveals();
}

// =========================================================
// 6. DYNAMIC PRICING ENGINE WITH LOCALSTORAGE CACHING
// =========================================================
const baseUSD = { small: 8.00, mid: 12.00, premium: 18.00, large: 22.00, incremental: 4.00, express: 2.00, color: 2.00, furniture: 4.00 };
let currentMarket = 'usd';
let exchangeRates = { GBP: 0.78, AUD: 1.52, USD: 1.00 };

async function fetchLiveExchangeRates() {
    const CACHE_KEY = 'lavientra_exchange_rates';
    const CACHE_TIME_KEY = 'lavientra_rates_timestamp';
    const ONE_HOUR = 60 * 60 * 1000;

    const cachedRates = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    const now = new Date().getTime();

    if (cachedRates && cachedTime && (now - cachedTime < ONE_HOUR)) {
        try {
            exchangeRates = JSON.parse(cachedRates);
            updatePricingDisplay();
            return;
        } catch (e) {
            console.warn('Error parsing cached rates:', e);
        }
    }

    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (response.ok) {
            const data = await response.json();
            if (data && data.rates) {
                exchangeRates.GBP = data.rates.GBP || 0.78;
                exchangeRates.AUD = data.rates.AUD || 1.52;
                exchangeRates.USD = 1.00;

                localStorage.setItem(CACHE_KEY, JSON.stringify(exchangeRates));
                localStorage.setItem(CACHE_TIME_KEY, now.toString());
            }
        }
    } catch (err) {
        console.log('Using fallback exchange rates:', err);
    }
    updatePricingDisplay();
}

function setMarket(market) {
    currentMarket = market;
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`btn-${market}`);
    if (btn) btn.classList.add('active');

    updatePricingDisplay();
}

function updatePricingDisplay() {
    let symbol = '$';
    let rate = 1.00;

    if (currentMarket === 'uk') {
        symbol = '£';
        rate = exchangeRates.GBP;
    } else if (currentMarket === 'aus') {
        symbol = 'A$';
        rate = exchangeRates.AUD;
    } else {
        symbol = '$';
        rate = 1.00;
    }

    const fmt = (val) => `${symbol}${(val * rate).toFixed(2)}`;

    const elSmall = document.getElementById('price-small');
    const elMid = document.getElementById('price-mid');
    const elPremium = document.getElementById('price-premium');
    const elLarge = document.getElementById('price-large');

    const elExpress = document.getElementById('price-addon-express');
    const elColor = document.getElementById('price-addon-color');
    const elFurniture = document.getElementById('price-addon-furniture');

    const elInc = document.getElementById('pricing-note-incremental');

    if (elSmall) elSmall.textContent = fmt(baseUSD.small);
    if (elMid) elMid.textContent = fmt(baseUSD.mid);
    if (elPremium) elPremium.textContent = fmt(baseUSD.premium);
    if (elLarge) elLarge.textContent = `${fmt(baseUSD.large)}+`;

    if (elExpress) elExpress.textContent = fmt(baseUSD.express);
    if (elColor) elColor.textContent = fmt(baseUSD.color);
    if (elFurniture) elFurniture.textContent = fmt(baseUSD.furniture);

    if (elInc) elInc.textContent = `For properties over 5,000 sq ft, an additional +${fmt(baseUSD.incremental)} is billed per every 2,500 sq ft block.`;
}

function calculatePropertyPrice(sqft) {
    if (sqft <= 1000) return baseUSD.small;
    if (sqft <= 3000) return baseUSD.mid;
    if (sqft <= 5000) return baseUSD.premium;
    const extraBlocks = Math.ceil((sqft - 5000) / 2500);
    return baseUSD.premium + (extraBlocks * baseUSD.incremental);
}

// =========================================================
// 7. INTAKE FORM, FILE DROPZONE & SUCCESS POPUP
// =========================================================
const projectForm = document.getElementById('projectIntakeForm');
const dropzoneArea = document.getElementById('dropzoneArea');
const sketchFilesInput = document.getElementById('sketchFiles');
const dropzoneText = document.getElementById('dropzoneText');
let stagedFilesList = [];

if (dropzoneArea && sketchFilesInput) {
    dropzoneArea.addEventListener('click', () => sketchFilesInput.click());
    dropzoneArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzoneArea.classList.add('dragover');
    });

    ['dragleave', 'dragend'].forEach(type => {
        dropzoneArea.addEventListener(type, () => dropzoneArea.classList.remove('dragover'));
    });

    dropzoneArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzoneArea.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesIntegration(e.dataTransfer.files);
        }
    });

    sketchFilesInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFilesIntegration(e.target.files);
        }
    });
}

function handleFilesIntegration(filesList) {
    stagedFilesList = Array.from(filesList);
    if (!dropzoneText) return;
    if (stagedFilesList.length === 1) {
        dropzoneText.innerHTML = `📄 Staged file: <strong>${stagedFilesList[0].name}</strong>`;
    } else {
        dropzoneText.innerHTML = `📚 Total <strong>${stagedFilesList.length} files staged</strong> for queue processing.`;
    }
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

if (projectForm) {
    projectForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = document.getElementById('submitActionBtn');
        const btnTextEl = submitBtn ? submitBtn.querySelector('.btn-text') : null;

        if (stagedFilesList.length === 0) {
            alert('Please upload or drag a sketch file before submitting.');
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            if (btnTextEl) btnTextEl.textContent = 'Uploading Order...';
        }

        try {
            let encodedFilesArray = [];
            let totalSize = 0;

            for (let i = 0; i < stagedFilesList.length; i++) {
                totalSize += stagedFilesList[i].size;
                if (totalSize > 45 * 1024 * 1024) {
                    throw new Error("Total payload allocation exceeds limit (45MB). Please upload smaller files.");
                }

                let base64String = await toBase64(stagedFilesList[i]);
                encodedFilesArray.push({
                    data: base64String,
                    name: stagedFilesList[i].name,
                    mimeType: stagedFilesList[i].type
                });
            }

            let selectedStyles = [];
            document.querySelectorAll('input[name="style"]:checked').forEach(cb => {
                selectedStyles.push(cb.value);
            });

            const fullName = document.getElementById('fullName')?.value || '';
            const agencyEmail = document.getElementById('agencyEmail')?.value || '';
            const propertyAddress = document.getElementById('propertyAddress')?.value || '';
            const targetCountry = document.getElementById('targetCountry')?.value || '';
            const serviceNeeded = document.getElementById('serviceNeeded')?.value || '';
            const instructions = document.getElementById('instructions')?.value || '';

            const payloadData = {
                name: fullName,
                email: agencyEmail,
                propertyAddress: propertyAddress,
                description: `[Country: ${targetCountry}] [Pipeline: ${serviceNeeded}] [Styles: ${selectedStyles.join(', ')}] Notes: ${instructions}`,
                files: encodedFilesArray
            };

            const APP_URL = "https://script.google.com/macros/s/AKfycbymzH1zVuVz7R5hv4TWh4T8UEwcJHGp_SQ5z3odvd6OSLGHdg0LQX6U46oFSOL4ALR9Ag/exec";

            await fetch(APP_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payloadData)
            });

            showSuccessPopup();
            projectForm.reset();
            if (dropzoneText) dropzoneText.innerHTML = `Drag & Drop your sketches here, or <strong>browse local storage</strong>`;
            stagedFilesList = [];

        } catch (err) {
            console.error(err);
            alert(err.message || 'Network communication error. Please try uploading smaller individual image files.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                if (btnTextEl) btnTextEl.textContent = 'Send to Lavientra Studio';
            }
        }
    });
}

function showSuccessPopup() {
    const popup = document.getElementById('successPopup');
    if (popup) popup.classList.add('active');
}

function closeSuccessPopup() {
    const popup = document.getElementById('successPopup');
    if (popup) popup.classList.remove('active');
}

// =========================================================
// 8. APPLE INTERACTIVE SERVICE MODAL ENGINE
// =========================================================
const serviceModalDetails = [
    {
        title: "100% RICS & PCA Compliant",
        tag: "01 / COMPLIANCE & PRECISION",
        desc: "Every floor plan is drawn strictly according to RICS Code of Measuring Practice (UK) and Property Council of Australia guidelines. We enforce absolute geometrical precision with correct room labels, clear measurement lines, detailed bathroom/kitchen CAD fixtures, standard scale bars, and precise compass north orientation."
    },
    {
        title: "24h Standard / 6h Express",
        tag: "02 / FAST & EXPRESS DELIVERY",
        desc: "Our drafting pipeline operates 24/7 across global timezones. Standard delivery is completed within 24 hours overnight. For urgent listing launches, select our 6-Hour Express Service to receive publication-ready vector assets well before your morning client meetings."
    },
    {
        title: "Adaptive Multi-Format Exports",
        tag: "03 / FLEXIBLE OUTPUTS",
        desc: "Receive your floor plan assets in whichever high-resolution format your real estate marketing workflow demands. We deliver print-ready PDFs, web-ready PNGs/JPGs, uncompressed TIFs, and fully scalable resolution-independent vector SVGs. Raw CAD (.dwg) files available upon request."
    },
    {
        title: "Tailored Agency Replication",
        tag: "04 / YOUR STYLE, OUR PRECISION",
        desc: "Maintain total agency brand consistency without changing your existing workflow. Simply upload a sample of your established floor plan design. We will replicate your exact corporate color palette, font styles, line weights, and logo positioning across every new draft."
    }
];

function openServiceModal(index) {
    const modal = document.getElementById('serviceModal');
    const tag = document.getElementById('serviceModalTag');
    const title = document.getElementById('serviceModalTitle');
    const body = document.getElementById('serviceModalBody');

    const detail = serviceModalDetails[index];
    if (!modal || !detail || !tag || !title || !body) return;

    tag.textContent = detail.tag;
    title.textContent = detail.title;
    body.textContent = detail.desc;

    modal.classList.add('active');
    lockBodyScroll();
}

function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    if (modal) modal.classList.remove('active');
    unlockBodyScroll();
}

document.addEventListener('DOMContentLoaded', () => {
    const serviceModal = document.getElementById('serviceModal');
    if (serviceModal) {
        serviceModal.addEventListener('click', (e) => {
            if (e.target === serviceModal) {
                closeServiceModal();
            }
        });
    }
});

document.addEventListener('keydown', (e) => {
    const serviceModal = document.getElementById('serviceModal');
    if (serviceModal && serviceModal.classList.contains('active')) {
        if (e.key === 'Escape') {
            closeServiceModal();
        }
    }
});

// INITIALIZE SAFELY ON DOM LOAD
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        renderPortfolio();
        fetchLiveExchangeRates();
        initHeroLoadAnimation();
        initScrollRevealEngine();
    });
} else {
    renderPortfolio();
    fetchLiveExchangeRates();
    initHeroLoadAnimation();
    initScrollRevealEngine();
}
