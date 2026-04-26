const API_URL = "https://script.google.com/macros/s/AKfycbxKqTbVSjlPPZcwGi_ygkVihkB5zMr5HfrAd_9n96o578aQRrOUMkGhQREgAdAy5npO/exec";

let allProducts = [];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    initCountdown();
    initNavbarScroll();
    initThemeToggle();
    initMobileMenu();

    // Fetch data from API
    try {
        const response = await fetch(`${API_URL}?action=getAllPublic`);
        const data = await response.json();

        allProducts = data.products || [];
        renderProducts(allProducts);

        if (data.testimonials) {
            renderTestimonials(data.testimonials);
        }

        if (data.landing && data.landing.length > 0) {
            applyLandingConfig(data.landing);
        }

        if (data.settings && data.settings.length > 0) {
            applySettings(data.settings);
        }

    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('product-container').innerHTML = '<div class="text-danger">Gagal memuat produk. Silakan refresh halaman.</div>';
    }
});

function applyLandingConfig(configData) {
    const config = {};
    configData.forEach(item => { config[item.key] = item.value; });

    if (config.headline) {
        const heroH1 = document.querySelector('.hero h1');
        if (heroH1) heroH1.innerHTML = config.headline;
    }
    if (config.subheadline) {
        const heroP = document.querySelector('.hero p');
        if (heroP) heroP.innerText = config.subheadline;
    }
    if (config.cta_text) {
        const ctaBtn = document.querySelector('.hero-cta .btn-primary');
        if (ctaBtn) ctaBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> ${config.cta_text}`;
    }
}

function applySettings(settingsData) {
    const settings = {};
    settingsData.forEach(item => { settings[item.key] = item.value; });

    const storeName = settings.store_name || 'gampangboss';
    let logoUrl = settings.logo_url;

    // 1. WhatsApp Button
    if (settings.whatsapp) {
        const waBtn = document.getElementById('whatsapp-btn');
        if (waBtn) {
            waBtn.href = `https://wa.me/${settings.whatsapp}`;
            waBtn.onclick = () => window.open(`https://wa.me/${settings.whatsapp}`, '_blank');
        }
    }

    // 2. Logo & Store Name (Full Replacement)
    const renderLogo = (elId) => {
        const el = document.getElementById(elId);
        if (!el) return;
        
        el.innerHTML = ''; // Kosongkan total sebelum isi
        
        if (logoUrl) {
            const img = document.createElement('img');
            img.src = logoUrl;
            img.alt = storeName;
            img.style.height = '32px';
            img.style.marginRight = '10px';
            img.onerror = function() {
                // Jika gambar gagal load (broken), balik ke icon default
                this.parentElement.innerHTML = `<i class="fa-solid fa-layer-group text-primary" style="margin-right: 10px;"></i><span>${storeName}</span>`;
            };
            el.appendChild(img);
        } else {
            const icon = document.createElement('i');
            icon.className = 'fa-solid fa-layer-group text-primary';
            icon.style.marginRight = '10px';
            el.appendChild(icon);
        }
        
        const text = document.createElement('span');
        text.textContent = storeName;
        el.appendChild(text);
    };

    renderLogo('main-logo');
    renderLogo('footer-logo');

    // 3. Footer Tagline
    if (settings.tagline) {
        const footerDesc = document.getElementById('footer-tagline');
        if (footerDesc) footerDesc.textContent = settings.tagline;
    }

    // 4. Contact Info (Email & Website)
    if (settings.email || settings.website_url) {
        const contactSection = document.getElementById('footer-contact-section');
        if (contactSection) {
            contactSection.style.display = 'block';
            if (settings.email) {
                document.getElementById('footer-email').textContent = settings.email;
            }
            if (settings.website_url) {
                const webItem = document.getElementById('footer-website-item');
                const webLink = document.getElementById('footer-website-link');
                webItem.style.display = 'block';
                webLink.href = settings.website_url;
                webLink.textContent = settings.website_url.replace(/^https?:\/\//, '');
            }
        }
    }

    // 5. Payment Info (Stored globally for use in buy buttons)
    window.paymentInfo = {
        link: settings.payment_link,
        number: settings.account_number,
        name: settings.account_name
    };

    // 6. Google Analytics (Injection)
    if (settings.ga_id && !window.ga_injected) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${settings.ga_id}`;
        document.head.appendChild(script);

        const configScript = document.createElement('script');
        configScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${settings.ga_id}');
        `;
        document.head.appendChild(configScript);
        window.ga_injected = true;
    }

    // 7. Copyright
    const copyright = document.querySelector('.footer-bottom p');
    if (copyright) copyright.innerHTML = `&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

    // 8. Social Media Links
    if (settings.instagram) {
        document.querySelectorAll('a[href*="instagram"]').forEach(link => link.href = settings.instagram);
    }
    if (settings.youtube) {
        document.querySelectorAll('a[href*="youtube"]').forEach(link => link.href = settings.youtube);
    }
    if (settings.telegram) {
        document.querySelectorAll('a[href*="telegram"], a[href*="t.me"]').forEach(link => link.href = settings.telegram);
    }

    // 9. SEO Meta Tags
    if (settings.meta_title) document.title = settings.meta_title;
    if (settings.meta_desc) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = settings.meta_desc;
    }
}

// --- Product Rendering ---
function renderProducts(products) {
    const container = document.getElementById('product-container');
    container.innerHTML = '';

    products.forEach(product => {
        const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price);

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="p-image">
                <span class="p-badge ${product.badge}">${product.badgeText}</span>
                <img src="${product.image_url}" alt="${product.name}">
            </div>
            <div class="p-content">
                <h4 class="p-title">${product.name}</h4>
                <p class="p-desc">${product.description}</p>
                <div class="p-price-row">
                    <div class="p-price">${formattedPrice}</div>
                </div>
                <div class="p-rating">
                    <i class="fa-solid fa-star"></i>
                    <span>${product.rating} (${product.reviews})</span>
                </div>
                <a href="${product.buy_link}" class="btn btn-outline btn-block btn-sm">Lihat Detail</a>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- Filtering ---
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove active class
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const filter = e.target.getAttribute('data-filter');
        if (filter === 'all') {
            renderProducts(allProducts);
        } else {
            const filtered = allProducts.filter(p => p.category === filter);
            renderProducts(filtered);
        }
    });
});

// Used by category cards
window.filterCategory = function (category) {
    const btn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
    if (btn) btn.click();
}

// --- Testimonial Rendering ---
function renderTestimonials(testimonials) {
    const container = document.getElementById('testimonial-container');
    container.innerHTML = '';

    testimonials.forEach(testi => {
        const stars = Array(testi.rating).fill('<i class="fa-solid fa-star"></i>').join('');

        const card = document.createElement('div');
        card.className = 'testimonial-card';
        card.innerHTML = `
            <div class="t-stars">${stars}</div>
            <p class="t-text">"${testi.message}"</p>
            <div class="t-author">
                <img src="${testi.avatar}" alt="${testi.name}">
                <div>
                    <h4>${testi.name}</h4>
                    <p>${testi.role}</p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- Countdown Timer ---
function initCountdown() {
    // Set 2 days from now for demo purposes
    const countDownDate = new Date().getTime() + (2 * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000) + (45 * 60 * 1000);

    const x = setInterval(function () {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerHTML = days.toString().padStart(2, '0');
        document.getElementById("hours").innerHTML = hours.toString().padStart(2, '0');
        document.getElementById("minutes").innerHTML = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").innerHTML = seconds.toString().padStart(2, '0');

        if (distance < 0) {
            clearInterval(x);
            document.getElementById("countdown").innerHTML = "PROMO BERAKHIR";
        }
    }, 1000);
}

// --- Navbar Scroll Effect ---
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '12px 0';
            navbar.style.backgroundColor = 'rgba(10, 10, 15, 0.95)';
        } else {
            navbar.style.padding = '16px 0';
            navbar.style.backgroundColor = 'rgba(10, 10, 15, 0.8)';
        }
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.getAttribute('href') !== '#') {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// --- Theme Toggle ---
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;

    const icon = themeBtn.querySelector('i');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    themeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.toggle('light-theme');

        if (document.body.classList.contains('light-theme')) {
            localStorage.setItem('theme', 'light');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            localStorage.setItem('theme', 'dark');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
}

// --- Mobile Menu ---
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (btn && navLinks) {
        btn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
}
