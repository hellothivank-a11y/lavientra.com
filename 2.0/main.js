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
    
    let htmlContent = '';
    portfolioData.forEach((item, index) => {
        htmlContent += `
        <div class="portfolio-card" data-index="${index}">
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
}

function escapeHtml(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// =========================================================
// 2. FULL-WIDTH CONTINUOUS AUTO-SCROLL & DRAG INTERACTIVITY
// =========================================================
let isMouseOverContainer = false;
let isMouseDown = false;
let isDragging = false;
let startX = 0;
let scrollLeftStart = 0;
let autoScrollAnimId = null;

function initPortfolioInteractivity() {
    const container = document.getElementById('portfolioTrackContainer');
    if (!container) return;

    // Mouse Pointer Auto-Pause
    container.addEventListener('mouseenter', () => { isMouseOverContainer = true; });
    container.addEventListener('mouseleave', () => { 
        isMouseOverContainer = false; 
        isMouseDown = false; 
        isDragging = false;
        container.classList.remove('dragging');
    });

    // Click and Drag to Scroll
    container.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        isDragging = false;
        startX = e.pageX - container.offsetLeft;
        scrollLeftStart = container.scrollLeft;
        container.classList.add('dragging');
    });

    container.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.6;
        if (Math.abs(x - startX) > 6) {
            isDragging = true;
        }
        container.scrollLeft = scrollLeftStart - walk;
    });

    container.addEventListener('mouseup', () => {
        isMouseDown = false;
        container.classList.remove('dragging');
        setTimeout(() => { isDragging = false; }, 50);
    });

    // Touch events for mobile
    container.addEventListener('touchstart', () => { isMouseOverContainer = true; }, { passive: true });
    container.addEventListener('touchend', () => { isMouseOverContainer = false; }, { passive: true });

    // Lightbox trigger on card click (prevented if user was dragging)
    const cards = container.querySelectorAll('.portfolio-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (isDragging) {
                e.preventDefault();
                return;
            }
            const idx = parseInt(card.getAttribute('data-index'), 10);
            if (!isNaN(idx) && portfolioData[idx]) {
                const item = portfolioData[idx];
                openLightbox(item.img, item.title, item.desc, idx);
            }
        });
    });

    startContinuousAutoScroll();
}

function startContinuousAutoScroll() {
    const container = document.getElementById('portfolioTrackContainer');
    if (!container) return;

    function step() {
        if (!isMouseOverContainer && !isMouseDown && !isDragging) {
            container.scrollLeft += 0.8;
            
            if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 5) {
                container.scrollLeft = 0;
            }
        }
        autoScrollAnimId = requestAnimationFrame(step);
    }

    if (autoScrollAnimId) cancelAnimationFrame(autoScrollAnimId);
    autoScrollAnimId = requestAnimationFrame(step);
}

// =========================================================
// 3. FULL-SCREEN LIGHTBOX MODAL ENGINE WITH ZOOM & PAN
// =========================================================
let currentLightboxIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchCurrentX = 0;
let touchCurrentY = 0;
let isTouchingModal = false;
let isNavigatingModal = false;

// Zoom & Pan State Variables
let zoomScale = 1.0;
let panX = 0;
let panY = 0;
let panStartX = 0;
let panStartY = 0;
let initialPinchDistance = 0;
let initialPinchScale = 1.0;
let lastTapTime = 0;
let isWheelCooldown = false;
let wheelTimer = null;

function resetLightboxZoom(animated = false) {
    zoomScale = 1.0;
    panX = 0;
    panY = 0;
    const modalImg = document.getElementById('lightbox-img');
    const imgWrapper = document.getElementById('lightboxImgWrapper');

    if (imgWrapper) imgWrapper.classList.remove('zoomed');

    if (modalImg) {
        if (animated) {
            modalImg.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
        } else {
            modalImg.style.transition = 'none';
        }
        modalImg.style.transform = 'translate3d(0, 0, 0) scale(1)';
    }
}

function updateZoomTransform(animated = false) {
    const modalImg = document.getElementById('lightbox-img');
    const imgWrapper = document.getElementById('lightboxImgWrapper');
    if (!modalImg) return;

    // Limit Panning Bounds based on scale
    if (zoomScale > 1.05) {
        if (imgWrapper) imgWrapper.classList.add('zoomed');
        const maxPanX = (modalImg.offsetWidth * (zoomScale - 1)) / 2;
        const maxPanY = (modalImg.offsetHeight * (zoomScale - 1)) / 2;
        panX = Math.max(-maxPanX, Math.min(maxPanX, panX));
        panY = Math.max(-maxPanY, Math.min(maxPanY, panY));
    } else {
        if (imgWrapper) imgWrapper.classList.remove('zoomed');
        zoomScale = 1.0;
        panX = 0;
        panY = 0;
    }

    if (animated) {
        modalImg.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
    } else {
        modalImg.style.transition = 'none';
    }

    modalImg.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoomScale})`;
}

function openLightbox(imgSrc, title, desc, index) {
    const modal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('lightbox-img');
    const modalTitle = document.getElementById('lightbox-title');
    const modalDesc = document.getElementById('lightbox-desc');

    if (!modal || !modalImg) return;

    resetLightboxZoom(false);

    currentLightboxIndex = typeof index === 'number' ? index : 0;
    const item = portfolioData[currentLightboxIndex] || { img: imgSrc, title: title, desc: desc };

    modalImg.style.transition = 'transform 0.52s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
    modalImg.style.transform = 'translate3d(0, 0, 0) scale(1)';
    modalImg.style.opacity = '1';
    modalImg.src = item.img;

    if (modalTitle) modalTitle.textContent = item.title || 'Floor Plan View';
    if (modalDesc) modalDesc.textContent = item.desc || '';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleLightboxKeyDown);
    setupLightboxDragEvents();
    setupLightboxWheelEvents();
    setupDoubleTapZoomEvents();
}

function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (!modal) return;
    
    resetLightboxZoom(false);
    modal.classList.remove('active');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleLightboxKeyDown);
}

function navigateLightbox(direction, userDeltaX = 0) {
    if (portfolioData.length === 0 || isNavigatingModal) return;
    
    // Disable image swipe switching while zoomed in!
    if (zoomScale > 1.05) return;

    isNavigatingModal = true;

    if (direction === 'next') {
        currentLightboxIndex = (currentLightboxIndex + 1) % portfolioData.length;
    } else if (direction === 'prev') {
        currentLightboxIndex = (currentLightboxIndex - 1 + portfolioData.length) % portfolioData.length;
    }

    performMinimalAppleAnimation(direction, userDeltaX);
}

function performMinimalAppleAnimation(direction, userDeltaX) {
    const modalImg = document.getElementById('lightbox-img');
    const modalTitle = document.getElementById('lightbox-title');
    const modalDesc = document.getElementById('lightbox-desc');
    const caption = document.querySelector('.lightbox-caption');

    resetLightboxZoom(false);
    const newItem = portfolioData[currentLightboxIndex];

    if (modalImg) {
        const slideOutOffset = direction === 'next' ? '-28px' : '28px';
        const slideInOffset = direction === 'next' ? '28px' : '-28px';

        modalImg.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
        modalImg.style.transform = `translate3d(${slideOutOffset}, 0, 0) scale(0.985)`;
        modalImg.style.opacity = '0.15';
        if (caption) caption.style.opacity = '0.3';

        setTimeout(() => {
            modalImg.src = newItem.img;
            if (modalTitle) modalTitle.textContent = newItem.title;
            if (modalDesc) modalDesc.textContent = newItem.desc;

            modalImg.style.transition = 'none';
            modalImg.style.transform = `translate3d(${slideInOffset}, 0, 0) scale(0.985)`;
            modalImg.style.opacity = '0.15';

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    modalImg.style.transition = 'transform 0.52s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
                    modalImg.style.transform = 'translate3d(0, 0, 0) scale(1)';
                    modalImg.style.opacity = '1';
                    if (caption) caption.style.opacity = '1';

                    setTimeout(() => {
                        isNavigatingModal = false;
                    }, 280);
                });
            });
        }, 150);
    } else {
        isNavigatingModal = false;
    }
}

// =========================================================
// 4. DOUBLE-CLICK & DOUBLE-TAP TO TOGGLE ZOOM (2.5x)
// =========================================================
function setupDoubleTapZoomEvents() {
    const imgWrapper = document.getElementById('lightboxImgWrapper');
    if (!imgWrapper || imgWrapper.dataset.doubleTapInit) return;
    imgWrapper.dataset.doubleTapInit = "true";

    // Double-click for desktop mouse
    imgWrapper.addEventListener('dblclick', (e) => {
        e.preventDefault();
        toggleZoomAtPoint(e.clientX, e.clientY);
    });

    // Double-tap for mobile touch
    imgWrapper.addEventListener('touchend', (e) => {
        if (e.touches.length > 0) return;
        const now = Date.now();
        if (now - lastTapTime < 300) {
            e.preventDefault();
            const touch = e.changedTouches[0];
            toggleZoomAtPoint(touch.clientX, touch.clientY);
        }
        lastTapTime = now;
    });
}

function toggleZoomAtPoint(clientX, clientY) {
    const modalImg = document.getElementById('lightbox-img');
    if (!modalImg) return;

    if (zoomScale > 1.05) {
        // Reset Zoom back to 1.0
        resetLightboxZoom(true);
    } else {
        // Zoom in to 2.5x
        zoomScale = 2.5;
        const rect = modalImg.getBoundingClientRect();
        const offsetX = clientX - (rect.left + rect.width / 2);
        const offsetY = clientY - (rect.top + rect.height / 2);

        panX = -offsetX * 1.5;
        panY = -offsetY * 1.5;

        updateZoomTransform(true);
    }
}

// =========================================================
// 5. REAL-TIME TOUCH / MOUSE SWIPE & PAN ENGINE
// =========================================================
function setupLightboxDragEvents() {
    const imgWrapper = document.getElementById('lightboxImgWrapper');
    const modalImg = document.getElementById('lightbox-img');
    if (!imgWrapper || !modalImg || imgWrapper.dataset.dragInit) return;

    imgWrapper.dataset.dragInit = "true";

    // --- NATIVE TOUCH EVENTS (Swipe when 1x, Pan when Zoomed, Pinch to Zoom) ---
    imgWrapper.addEventListener('touchstart', (e) => {
        if (isNavigatingModal) return;

        if (e.touches.length === 2) {
            // Pinch to Zoom start
            isTouchingModal = false;
            initialPinchDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialPinchScale = zoomScale;
            return;
        }

        if (e.touches.length === 1) {
            isTouchingModal = true;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchCurrentX = touchStartX;
            touchCurrentY = touchStartY;
            panStartX = panX;
            panStartY = panY;

            if (zoomScale <= 1.05) {
                modalImg.style.transition = 'none';
            }
        }
    }, { passive: false });

    imgWrapper.addEventListener('touchmove', (e) => {
        if (isNavigatingModal) return;

        // Two-Finger Pinch to Zoom Tracking
        if (e.touches.length === 2 && initialPinchDistance > 0) {
            e.preventDefault();
            const currentDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            zoomScale = Math.max(1.0, Math.min(4.0, initialPinchScale * (currentDist / initialPinchDistance)));
            updateZoomTransform(false);
            return;
        }

        // Single Finger Drag / Pan / Swipe
        if (isTouchingModal && e.touches.length === 1) {
            touchCurrentX = e.touches[0].clientX;
            touchCurrentY = e.touches[0].clientY;
            const deltaX = touchCurrentX - touchStartX;
            const deltaY = touchCurrentY - touchStartY;

            if (zoomScale > 1.05) {
                // Pan around zoomed floor plan image
                e.preventDefault();
                panX = panStartX + deltaX;
                panY = panStartY + deltaY;
                updateZoomTransform(false);
            } else {
                // Horizontal 1:1 Swipe tracking
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (e.cancelable) e.preventDefault();
                    modalImg.style.transform = `translate3d(${deltaX}px, 0, 0) scale(1)`;
                    const opacityVal = Math.max(0.4, 1 - Math.abs(deltaX) / 700);
                    modalImg.style.opacity = opacityVal.toString();
                }
            }
        }
    }, { passive: false });

    imgWrapper.addEventListener('touchend', (e) => {
        initialPinchDistance = 0;
        if (!isTouchingModal || isNavigatingModal) return;
        isTouchingModal = false;

        if (zoomScale <= 1.05) {
            handleSwipeEnd();
        } else {
            updateZoomTransform(true);
        }
    });

    // --- MOUSE DRAG EVENTS (Pan when Zoomed, Swipe when 1x) ---
    imgWrapper.addEventListener('mousedown', (e) => {
        if (isNavigatingModal) return;
        isTouchingModal = true;
        touchStartX = e.clientX;
        touchStartY = e.clientY;
        touchCurrentX = touchStartX;
        touchCurrentY = touchStartY;
        panStartX = panX;
        panStartY = panY;

        if (zoomScale <= 1.05) {
            modalImg.style.transition = 'none';
        }
        imgWrapper.classList.add('dragging');
    });

    window.addEventListener('mousemove', (e) => {
        if (!isTouchingModal || isNavigatingModal) return;
        touchCurrentX = e.clientX;
        touchCurrentY = e.clientY;
        const deltaX = touchCurrentX - touchStartX;
        const deltaY = touchCurrentY - touchStartY;

        if (zoomScale > 1.05) {
            panX = panStartX + deltaX;
            panY = panStartY + deltaY;
            updateZoomTransform(false);
        } else {
            modalImg.style.transform = `translate3d(${deltaX}px, 0, 0) scale(1)`;
            const opacityVal = Math.max(0.4, 1 - Math.abs(deltaX) / 700);
            modalImg.style.opacity = opacityVal.toString();
        }
    });

    window.addEventListener('mouseup', () => {
        if (!isTouchingModal) return;
        isTouchingModal = false;
        imgWrapper.classList.remove('dragging');

        if (zoomScale <= 1.05) {
            handleSwipeEnd();
        } else {
            updateZoomTransform(true);
        }
    });
}

function handleSwipeEnd() {
    const modalImg = document.getElementById('lightbox-img');
    if (!modalImg) return;

    const deltaX = touchCurrentX - touchStartX;
    const threshold = 50;

    if (deltaX < -threshold) {
        navigateLightbox('next', deltaX);
    } else if (deltaX > threshold) {
        navigateLightbox('prev', deltaX);
    } else {
        resetLightboxZoom(true);
    }
}

// =========================================================
// 6. TRACKPAD WHEEL (PINCH TO ZOOM & 2-FINGER SCROLL)
// =========================================================
function setupLightboxWheelEvents() {
    const modal = document.getElementById('lightboxModal');
    if (!modal || modal.dataset.wheelInit) return;
    modal.dataset.wheelInit = "true";

    modal.addEventListener('wheel', (e) => {
        if (!modal.classList.contains('active')) return;

        // Trackpad Pinch-to-Zoom (Ctrl key pressed during wheel gesture)
        if (e.ctrlKey) {
            e.preventDefault();
            const zoomDelta = -e.deltaY * 0.015;
            zoomScale = Math.max(1.0, Math.min(4.0, zoomScale + zoomDelta));
            updateZoomTransform(false);
            return;
        }

        // If currently zoomed in, trackpad wheel pans the image vertically/horizontally
        if (zoomScale > 1.05) {
            e.preventDefault();
            panX -= e.deltaX * 1.2;
            panY -= e.deltaY * 1.2;
            updateZoomTransform(false);
            return;
        }

        // If 1x scale, trackpad wheel performs 2-finger image swipe navigation
        const deltaX = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);

        if (Math.abs(deltaX) > 5) {
            e.preventDefault();
        }

        if (Math.abs(deltaX) > 20 && !isWheelCooldown && !isNavigatingModal) {
            isWheelCooldown = true;

            if (deltaX > 0) {
                navigateLightbox('next');
            } else {
                navigateLightbox('prev');
            }

            clearTimeout(wheelTimer);
            wheelTimer = setTimeout(() => {
                isWheelCooldown = false;
            }, 450);
        }
    }, { passive: false });
}

function handleLightboxKeyDown(e) {
    if (e.key === 'Escape') {
        closeLightbox();
    } else if (e.key === 'ArrowRight' && zoomScale <= 1.05) {
        navigateLightbox('next');
    } else if (e.key === 'ArrowLeft' && zoomScale <= 1.05) {
        navigateLightbox('prev');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderPortfolio();

    const modal = document.getElementById('lightboxModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeLightbox();
            }
        });
    }
});

// =========================================================
// 7. MOBILE MENU INTERACTION LOGIC
// =========================================================
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileToggle.innerHTML = navMenu.classList.contains('active') ? '✕' : '☰';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggle.innerHTML = '☰';
        });
    });
}

// =========================================================
// 8. BEFORE/AFTER SLIDER INTERACTION
// =========================================================
const sliderRange = document.getElementById('sliderRange');
const afterImg = document.getElementById('afterImg');
const sliderLine = document.getElementById('sliderLine');
const sliderHandleIcon = document.getElementById('sliderHandleIcon');
const sliderContainer = document.getElementById('sliderContainer');

function updateSlider() {
    if (!sliderRange || !afterImg || !sliderLine || !sliderHandleIcon) return;
    const val = sliderRange.value;
    afterImg.style.width = val + '%';
    sliderLine.style.left = val + '%';
    sliderHandleIcon.style.left = val + '%';
}

if (sliderRange) {
    updateSlider();
    sliderRange.addEventListener('input', updateSlider);
}

window.addEventListener('resize', () => {
    if (!sliderContainer || !afterImg) return;
    const containerWidth = sliderContainer.offsetWidth;
    const absoluteImg = afterImg.querySelector('img');
    if (absoluteImg) absoluteImg.style.width = containerWidth + 'px';
});

// =========================================================
// 9. SCROLL ANIMATION REVEAL ENGINE
// =========================================================
const observeOptions = { threshold: 0.08, rootMargin: "0px 0px -20px 0px" };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('active'); }
    });
}, observeOptions);
document.querySelectorAll('.reveal-node').forEach(node => observer.observe(node));

// =========================================================
// 10. DYNAMIC PRICING ENGINE WITH LOCALSTORAGE CACHING
// =========================================================
const baseUSD = { small: 8.00, mid: 12.00, premium: 18.00, large: 24.00, incremental: 4.00, express: 2.00, color: 2.00, furniture: 4.00 };
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
        exchangeRates = JSON.parse(cachedRates);
        updatePricingDisplay();
        return;
    }

    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data && data.rates) {
            exchangeRates.GBP = data.rates.GBP || exchangeRates.GBP;
            exchangeRates.AUD = data.rates.AUD || exchangeRates.AUD;

            localStorage.setItem(CACHE_KEY, JSON.stringify(exchangeRates));
            localStorage.setItem(CACHE_TIME_KEY, now.toString());
            updatePricingDisplay();
        }
    } catch (e) {
        console.warn("Exchange rate API fallback triggered.");
        updatePricingDisplay();
    }
}

function setMarket(market) {
    currentMarket = market;
    const btnUk = document.getElementById('btn-uk');
    const btnAus = document.getElementById('btn-aus');
    const btnUsd = document.getElementById('btn-usd');

    if (btnUk) btnUk.classList.toggle('active', market === 'uk');
    if (btnAus) btnAus.classList.toggle('active', market === 'aus');
    if (btnUsd) btnUsd.classList.toggle('active', market === 'usd');
    
    updatePricingDisplay();
}

function updatePricingDisplay() {
    let symbol = '$';
    let rate = exchangeRates.USD;
    if (currentMarket === 'uk') { symbol = '£'; rate = exchangeRates.GBP; }
    else if (currentMarket === 'aus') { symbol = '$'; rate = exchangeRates.AUD; }

    const smallEl = document.getElementById('price-small');
    const midEl = document.getElementById('price-mid');
    const premEl = document.getElementById('price-premium');
    const largeEl = document.getElementById('price-large');
    const expressEl = document.getElementById('price-addon-express');
    const colorEl = document.getElementById('price-addon-color');
    const furnEl = document.getElementById('price-addon-furniture');

    if (smallEl) smallEl.textContent = symbol + (baseUSD.small * rate).toFixed(2);
    if (midEl) midEl.textContent = symbol + (baseUSD.mid * rate).toFixed(2);
    if (premEl) premEl.textContent = symbol + (baseUSD.premium * rate).toFixed(2);
    if (largeEl) largeEl.textContent = symbol + (baseUSD.large * rate).toFixed(2);
    if (expressEl) expressEl.textContent = symbol + (baseUSD.express * rate).toFixed(2);
    if (colorEl) colorEl.textContent = symbol + (baseUSD.color * rate).toFixed(2);
    if (furnEl) furnEl.textContent = symbol + (baseUSD.furniture * rate).toFixed(2);

    const noteEl = document.getElementById('pricing-note-incremental');
    if (noteEl) {
        const convertedIncremental = symbol + (baseUSD.incremental * rate).toFixed(2);
        noteEl.textContent = `${convertedIncremental} additional charge applies for every incremental 2,500 sq ft beyond the initial 5,000 sq ft.`;
    }
}

// =========================================================
// 11. SECURE UPLOAD PIPELINE FORM
// =========================================================
const dropzoneArea = document.getElementById('dropzoneArea');
const fileInput = document.getElementById('sketchFiles');
const dropzoneText = document.getElementById('dropzoneText');
const intakeForm = document.getElementById('projectIntakeForm');
let stagedFilesList = [];

if (dropzoneArea && fileInput) {
    dropzoneArea.addEventListener('click', () => fileInput.click());
    dropzoneArea.addEventListener('dragover', (e) => { e.preventDefault(); dropzoneArea.classList.add('dragover'); });
    ['dragleave', 'dragend'].forEach(type => { dropzoneArea.addEventListener(type, () => dropzoneArea.classList.remove('dragover')); });

    dropzoneArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzoneArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) { handleFilesIntegration(e.dataTransfer.files); }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) { handleFilesIntegration(e.target.files); }
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

if (intakeForm) {
    intakeForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const submitBtn = document.getElementById('submitActionBtn');
        const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;

        if (stagedFilesList.length === 0) {
            alert('Please upload or drag a sketch file before submitting.');
            return;
        }

        if (submitBtn) submitBtn.classList.add('loading');
        if (btnText) btnText.textContent = 'Uploading...';

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
            document.querySelectorAll('input[name="style"]:checked').forEach(cb => { selectedStyles.push(cb.value); });

            const payloadData = {
                name: document.getElementById('fullName').value,
                email: document.getElementById('agencyEmail').value,
                propertyAddress: document.getElementById('propertyAddress').value,
                description: `[Country: ${document.getElementById('targetCountry').value}] [Pipeline: ${document.getElementById('serviceNeeded').value}] [Styles: ${selectedStyles.join(', ')}] Notes: ${document.getElementById('instructions').value}`,
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
            intakeForm.reset();
            if (dropzoneText) dropzoneText.innerHTML = `Drag & Drop your sketches here, or <strong>browse local storage</strong>`;
            stagedFilesList = [];

        } catch (err) {
            console.error(err);
            alert(err.message || 'Network communication error. Please try uploading smaller individual image files.');
        } finally {
            if (submitBtn) submitBtn.classList.remove('loading');
            if (btnText) btnText.textContent = 'Send to Lavientra Studio';
        }
    });
}

function showSuccessPopup() {
    const popup = document.getElementById('successPopup');
    if (popup) {
        popup.classList.add('active');
    }
}
function closeSuccessPopup() {
    const popup = document.getElementById('successPopup');
    if (popup) {
        popup.classList.remove('active');
    }
}

fetchLiveExchangeRates();
setTimeout(() => window.dispatchEvent(new Event('resize')), 100);