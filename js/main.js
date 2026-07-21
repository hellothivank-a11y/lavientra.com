// =========================================================
// 1. SMART PORTFOLIO GENERATOR
// =========================================================
const portfolioData = [
    { img: 'assets/portfolio-bw.svg', title: 'Standard Editorial B&W', desc: 'High-contrast vector lineage, ideal for traditional print brochures.' },
    { img: 'assets/portfolio-color.svg', title: 'Color Zoned Marketing Layout', desc: 'Soft color-coded zones to help buyers visualize property flow instantly.' },
    { img: 'assets/portfolio-furniture.svg', title: 'Premium Furnished Space', desc: 'Includes accurate, modern CAD blocks to showcase property scale and potential.' },
    { img: 'assets/portfolio-commercial.svg', title: 'Commercial Property Specification', desc: 'Drafted cleanly to showcase complex corporate layouts and massive square footage.' },
    { img: 'assets/portfolio-complex.svg', title: 'Complex Multi-Level Blueprint', desc: 'Absolute geometrical precision for intricate layouts, split-levels, and period properties.' },
    { img: 'assets/portfolio-siteplan.svg', title: 'Overall Site & Boundary Layout', desc: 'Clear mapping of external perimeters, gardens, and outbuildings.' },
    { img: 'assets/portfolio-siteplan-2.svg', title: 'Overall Site & Boundary Layout', desc: 'Clear mapping of external perimeters, gardens, and outbuildings.' },
    { img: 'assets/portfolio-complex-2.svg', title: 'Complex Multi-Level Blueprint', desc: 'Absolute geometrical precision for intricate layouts, split-levels, and period properties.' },
    { img: 'assets/portfolio-color-2.svg', title: 'Color Zoned Marketing Layout', desc: 'Soft color-coded zones to help buyers visualize property flow instantly.' },
    { img: 'assets/portfolio-commercial-2.svg', title: 'Commercial Property Specification', desc: 'Drafted cleanly to showcase complex corporate layouts and massive square footage.' },
    { img: 'assets/portfolio-curve.svg', title: 'Standard Editorial B&W curve', desc: 'High-contrast vector lineage, ideal for traditional print brochures.' }
];

function renderPortfolio() {
    const track = document.getElementById('portfolioTrack');
    let htmlContent = '';
    // Loaded 3 times to allow smooth infinite loop without visual jumps
    for(let i = 0; i < 3; i++) {
        portfolioData.forEach(item => {
            htmlContent += `
            <div class="gallery-item" onclick="openLightbox('${item.img}')">
                <div class="gallery-img-container">
                    <img src="${item.img}" alt="${item.title}" loading="lazy">
                </div>
                <div class="gallery-meta">
                    <h4>${item.title}</h4>
                    <p>${item.desc}</p>
                </div>
            </div>`;
        });
    }
    track.innerHTML = htmlContent;
}
renderPortfolio();

// =========================================================
// 2. SMOOTH NATIVE AUTO-SCROLL (FIXED BUG)
// =========================================================
const scroller = document.getElementById('portfolioScroller');
let scrollInterval;

function startAutoScroll() {
    scrollInterval = setInterval(() => {
        scroller.scrollLeft += 1.5; // Optimized speed
        
        // Seamless loop resetting
        if (scroller.scrollLeft >= scroller.scrollWidth / 2) {
            scroller.scrollLeft = 0; 
        }
    }, 16); // Butter smooth 60fps
}

function stopAutoScroll() {
    clearInterval(scrollInterval);
}

// Pause on hover, allowing the user to use the bottom scrollbar naturally
scroller.addEventListener('mouseenter', stopAutoScroll);
scroller.addEventListener('mouseleave', startAutoScroll);
scroller.addEventListener('touchstart', stopAutoScroll);
scroller.addEventListener('touchend', startAutoScroll);

// Initiate auto-scroll
startAutoScroll();


// =========================================================
// 3. ADVANCED BUG-FREE ZOOM LIGHTBOX
// =========================================================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxZoomSlider = document.getElementById('lightboxZoomSlider');
const zoomValBadge = document.getElementById('zoomValBadge');

function openLightbox(imgSrc) {
    lightboxImg.src = imgSrc;
    lightboxZoomSlider.value = 0;
    updateZoom(0);
    lightbox.style.display = 'flex';
    setTimeout(() => lightbox.classList.add('active'), 10); 
}

function closeLightbox() {
    lightbox.classList.remove('active');
    setTimeout(() => { 
        lightbox.style.display = 'none'; 
        lightboxImg.src = '';
    }, 300); 
}

function updateZoom(val) {
    zoomValBadge.textContent = `Zoom: ${val}%`;
    const scaleFactor = 1 + (val / 100);
    lightboxImg.style.transform = `scale(${scaleFactor})`;
}

lightboxZoomSlider.addEventListener('input', (e) => {
    updateZoom(e.target.value);
});


// =========================================================
// 4. MOBILE MENU INTERACTION LOGIC
// =========================================================
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

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

// =========================================================
// 5. BEFORE/AFTER SLIDER INTERACTION
// =========================================================
const sliderRange = document.getElementById('sliderRange');
const afterImg = document.getElementById('afterImg');
const sliderLine = document.getElementById('sliderLine');
const sliderHandleIcon = document.getElementById('sliderHandleIcon');
const sliderContainer = document.getElementById('sliderContainer');

function updateSlider() {
    const val = sliderRange.value;
    afterImg.style.width = val + '%';
    sliderLine.style.left = val + '%';
    sliderHandleIcon.style.left = val + '%';
}
updateSlider(); 
sliderRange.addEventListener('input', updateSlider);

window.addEventListener('resize', () => {
    const containerWidth = sliderContainer.offsetWidth;
    const absoluteImg = afterImg.querySelector('img');
    if (absoluteImg) absoluteImg.style.width = containerWidth + 'px';
});

// =========================================================
// 6. SCROLL ANIMATION REVEAL ENGINE
// =========================================================
const observeOptions = { threshold: 0.05, rootMargin: "0px 0px -10px 0px" };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('active'); }
    });
}, observeOptions);
document.querySelectorAll('.reveal-node').forEach(node => observer.observe(node));

// =========================================================
// 7. DYNAMIC PRICING ENGINE WITH LOCALSTORAGE CACHING
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
        if(data && data.rates) {
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
    document.getElementById('btn-uk').classList.toggle('active', market === 'uk');
    document.getElementById('btn-aus').classList.toggle('active', market === 'aus');
    document.getElementById('btn-usd').classList.toggle('active', market === 'usd');
    updatePricingDisplay();
}

function updatePricingDisplay() {
    let symbol = '$';
    let rate = exchangeRates.USD;
    if (currentMarket === 'uk') { symbol = '£'; rate = exchangeRates.GBP; }
    else if (currentMarket === 'aus') { symbol = '$'; rate = exchangeRates.AUD; }
    
    document.getElementById('price-small').textContent = symbol + (baseUSD.small * rate).toFixed(2);
    document.getElementById('price-mid').textContent = symbol + (baseUSD.mid * rate).toFixed(2);
    document.getElementById('price-premium').textContent = symbol + (baseUSD.premium * rate).toFixed(2);
    document.getElementById('price-large').textContent = symbol + (baseUSD.large * rate).toFixed(2);
    document.getElementById('price-addon-express').textContent = symbol + (baseUSD.express * rate).toFixed(2);
    document.getElementById('price-addon-color').textContent = symbol + (baseUSD.color * rate).toFixed(2);
    document.getElementById('price-addon-furniture').textContent = symbol + (baseUSD.furniture * rate).toFixed(2);
    
    const convertedIncremental = symbol + (baseUSD.incremental * rate).toFixed(2);
    document.getElementById('pricing-note-incremental').textContent = `${convertedIncremental} additional charge applies for every incremental 2,500 sq ft beyond the initial 5,000 sq ft.`;
}

// =========================================================
// 8. SECURE ADVANCED UPLOAD PIPELINE
// =========================================================
const dropzoneArea = document.getElementById('dropzoneArea');
const fileInput = document.getElementById('sketchFiles');
const dropzoneText = document.getElementById('dropzoneText');
const intakeForm = document.getElementById('projectIntakeForm');
let stagedFilesList = [];

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

function handleFilesIntegration(filesList) {
    stagedFilesList = Array.from(filesList);
    if(stagedFilesList.length === 1) {
        dropzoneText.innerHTML = `📄 Staged object: <strong>${stagedFilesList[0].name}</strong>`;
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

intakeForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitActionBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    
    if (stagedFilesList.length === 0) {
        alert('Please upload or drag structural sketch objects variant before submission initialization processing.');
        return;
    }

    submitBtn.classList.add('loading');
    btnText.textContent = 'Uploading...';

    try {
        let encodedFilesArray = [];
        let totalSize = 0;

        for (let i = 0; i < stagedFilesList.length; i++) {
            totalSize += stagedFilesList[i].size;
            if (totalSize > 45 * 1024 * 1024) {
                throw new Error("Total payload allocation volume exceeds limit (45MB). Please upload smaller files.");
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

        // WARNING: Replace 'YOUR_WEB_APP_URL_HERE' with your actual Google Apps Script Deployment URL
        const APP_URL = "YOUR_WEB_APP_URL_HERE";

        await fetch(APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payloadData)
        });

        showSuccessPopup();
        intakeForm.reset();
        dropzoneText.innerHTML = `Drag & Drop your sketches here, or <strong>browse local storage</strong>`;
        stagedFilesList = [];
        
    } catch (err) {
        console.error(err);
        alert(err.message || 'Network communication error. Please try uploading smaller individual image files.');
    } finally {
        submitBtn.classList.remove('loading');
        btnText.textContent = 'Send to Lavientra Studio';
    }
});

function showSuccessPopup() {
    const popup = document.getElementById('successPopup');
    popup.style.display = 'flex';
    setTimeout(() => { popup.classList.add('active'); }, 10);
}
function closeSuccessPopup() {
    const popup = document.getElementById('successPopup');
    popup.classList.remove('active');
    setTimeout(() => { 
        popup.style.display = 'none'; 
        window.location.reload(); 
    }, 400);
}

fetchLiveExchangeRates();
setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
