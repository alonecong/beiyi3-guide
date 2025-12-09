console.log('App.js loaded!');

document.addEventListener('DOMContentLoaded', () => {
    // 0. Render Content from beiyi3GuideData (defined in data.js)
    renderContent();

    // 1. Highlight active navigation link on scroll
    initScrollSpy();
});

function renderContent() {
    console.log('renderContent called');

    // Check if data is loaded
    if (typeof guideData === 'undefined') {
        console.error("guideData is not defined. Make sure data.js is loaded.");
        return;
    }

    const data = guideData;

    // Update Meta
    document.title = data.meta.title;
    document.querySelector('meta[name="description"]').setAttribute('content', data.meta.description);

    // Update Hero
    document.getElementById('hero-title').textContent = data.hero.title;
    document.getElementById('hero-subtitle').textContent = data.hero.subtitle;
    document.getElementById('hero-btn').textContent = data.hero.buttonText;

    // Update Footer
    document.getElementById('footer-text').textContent = data.footer.text;
    document.getElementById('footer-copyright').textContent = data.footer.copyright;

    // Render Navigation & Sections
    const navContainer = document.getElementById('nav-container');
    const mainContent = document.getElementById('main-content');

    // Clear
    navContainer.innerHTML = '';
    mainContent.innerHTML = '';

    data.sections.forEach((section, index) => {
        // Create Nav Link
        const navLink = document.createElement('a');
        navLink.href = `#${section.id}`;
        navLink.className = 'nav-link';
        if (index === 0) navLink.classList.add('active');
        navLink.textContent = section.title.replace(/\s*&.*$/, '');
        navContainer.appendChild(navLink);

        // Create Section
        const sectionEl = document.createElement('section');
        sectionEl.id = section.id;
        sectionEl.className = 'card';

        // Build Blocks HTML
        let blocksHTML = '';
        if (section.blocks && Array.isArray(section.blocks)) {
            blocksHTML = section.blocks.map(block => renderBlock(block)).join('');
        } else if (section.contentHTML) {
            // Fallback for old schema
            blocksHTML = section.contentHTML;
        }

        sectionEl.innerHTML = `
            <div class="icon-header">
                <span class="icon">${section.icon}</span>
                <h2>${section.title}</h2>
            </div>
            <div class="content">
                ${blocksHTML}
            </div>
        `;
        mainContent.appendChild(sectionEl);
    });
}

function renderBlock(block) {
    if (!block || !block.type) return '';

    switch (block.type) {
        case 'subtitle':
            return `<h3>${escapeHtml(block.content)}</h3>`;

        case 'text':
            return `<p>${escapeHtml(block.content)}</p>`;

        case 'list':
            const tag = block.ordered ? 'ol' : 'ul';
            const items = block.items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
            return `<${tag}>${items}</${tag}>`;

        case 'alert':
            return `<div class="alert-box">${escapeHtml(block.content)}</div>`;

        case 'tips': // Specialized block for "Ambulance" section
            const listItems = block.items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
            return `
                <div class="contact-card">
                    <p><strong>${escapeHtml(block.content)}</strong></p>
                    <ul>${listItems}</ul>
                </div>
            `;

        default:
            return '';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));

                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                    // activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); 
                    // removed scrollIntoView to avoid jumping during debug
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.scrollMarginTop = '80px';
        observer.observe(section);
    });
}
