import { AboutFullTemplate } from './about-full-template.js';

class AboutFullComponent extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await this.loadTemplate();
    }

    async render(html) {
        this.innerHTML = html;
        await new Promise(requestAnimationFrame).then(() => {
            if (window.lucide) {
                window.lucide.createIcons();
            }
            this.initAnimations();
            this.initCarousel();
            this.initCertificates();
        });
    }

    initCertificates() {
        const grid = this.querySelector('.cert-grid');
        if (!grid) return;

        const certificateData = [
            {
                name: window.i18n ? window.i18n.t("aboutFull.certificates.items.seoAI") : "SEO na Era da Inteligência Artificial",
                description: "Conversion",
                url: "https://drive.google.com/file/d/1gIXLAWonFXzfwrrX_WnlcwPr41rU7yH5/view",
                icon: "search"
            },
            {
                name: window.i18n ? window.i18n.t("aboutFull.certificates.items.nextSEO") : "Next SEO",
                description: "Conversion",
                url: "https://drive.google.com/file/d/1q9H7CE7aYcOwK2JoH0-Hp0r2nJVjP5lf/view",
                icon: "trending-up"
            },
            {
                name: window.i18n ? window.i18n.t("aboutFull.certificates.items.userDesign") : "Design Centrado no Usuário",
                description: "PUCRS",
                url: "https://drive.google.com/file/d/1PiJSqJ_KuNI4zkxgid89ddHI7vdY-lt7/view",
                icon: "mouse-pointer-2"
            },
            {
                name: window.i18n ? window.i18n.t("aboutFull.certificates.items.creative") : "Escrita Criativa",
                description: "PUCRS",
                url: "https://drive.google.com/file/d/1lsNeip3Il-8uh6aSXYM4Sw5pbEYFLGpQ/view",
                icon: "feather"
            },
            {
                name: window.i18n ? window.i18n.t("aboutFull.certificates.items.brandingRev") : "(R)evolução do Branding",
                description: "Ana Couto/Laje",
                url: "https://drive.google.com/file/d/1K0rdw2-Zhzn7gL-fssZx_DlMDIFudRan/view",
                icon: "award"
            },
            {
                name: window.i18n ? window.i18n.t("aboutFull.certificates.items.brandingEss") : "Branding Essencial",
                description: "Ana Couto/Laje",
                url: "https://drive.google.com/file/d/1_mBA2Q3xEFBaa1UIx06yTz5FLYMgxOGN/view?usp=sharing",
                icon: "sparkles"
            },
            {
                name: window.i18n ? window.i18n.t("aboutFull.certificates.items.leadership") : "Formação em Liderança",
                description: "Escola Conquer",
                url: "https://drive.google.com/file/d/1EvVW3P4jLAWyIUpNpENygURoJ1rYc9Mg/view",
                icon: "users-2"
            },
            {
                name: window.i18n ? window.i18n.t("aboutFull.certificates.items.productivity") : "Produtividade e Performance",
                description: "Escola Conquer",
                url: "https://drive.google.com/file/d/1dqWWyioIfBXnZfod1zggy9Im_DfuatZ1/view?usp=sharing",
                icon: "zap"
            },
            {
                name: window.i18n ? window.i18n.t("aboutFull.certificates.items.seoFound") : "Fundamentos de SEO",
                description: "LinkedIn Learning",
                url: "https://drive.google.com/file/d/15B31VPLxROwY7t9DIVaexhCGM0msUhee/view?usp=sharing",
                icon: "search"
            }
        ];

        grid.innerHTML = certificateData.map(data => `
            <a class="cert-card" href="${data.url}" target="_blank">
                <div class="cert-icon">
                    <i data-lucide="${data.icon}" width="24" height="24"></i>
                </div>
                <div class="cert-info">
                    <strong>${data.name}</strong>
                    <span>${data.description}</span>
                </div>
            </a>
        `).join('');

        if (window.lucide) {
            window.lucide.createIcons({
                attrs: {
                    class: 'lucide'
                },
                nameAttr: 'data-lucide',
                node: grid
            });
        }

        const certCards = grid.querySelectorAll('.cert-card');
        this.certificates = certificateData.map((data, index) => ({
            ...data,
            element: certCards[index]
        }));
    }

    initAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        this.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    initCarousel() {
        const container = this.querySelector('.carousel-container');
        const gallery = this.querySelector('.ctr-gallery');
        const wrapper = this.querySelector('.polaroid-wrapper');
        const prevBtn = this.querySelector('.carousel-btn.prev');
        const nextBtn = this.querySelector('.carousel-btn.next');
        const indicators = this.querySelector('.carousel-indicators');

        if (!gallery || !wrapper || !indicators) return;

        const originalPolaroids = Array.from(this.querySelectorAll('.polaroid:not(.clone)'));
        const scrollAmount = 272; // Largura do polaroid (240px) + gap (32px)

        // Limpar bolinhas antigas
        indicators.innerHTML = '';

        let dots = [];

        const updateActiveDot = () => {
            if (dots.length === 0) return;

            let index = 0;
            // Se chegou no final (com tolerância de 10px), ativa o último dot
            if (gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 10) {
                index = dots.length - 1;
            } else {
                index = Math.round(gallery.scrollLeft / scrollAmount);
            }

            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[index]) dots[index].classList.add('active');
        };

        const createDots = () => {
            indicators.innerHTML = '';
            dots = [];
            const maxScroll = gallery.scrollWidth - gallery.clientWidth;

            // Se não houver scroll, não cria dots
            if (maxScroll <= 0) return;

            // Calcula o número de paradas possíveis
            const numDots = Math.ceil(maxScroll / scrollAmount) + 1;

            for (let i = 0; i < numDots; i++) {
                const dot = document.createElement('div');
                dot.classList.add('carousel-dot');

                dot.addEventListener('click', () => {
                    gallery.style.scrollBehavior = 'smooth';
                    let targetScroll = i * scrollAmount;
                    if (i === numDots - 1) targetScroll = maxScroll;
                    gallery.scrollTo({ left: targetScroll });
                });

                indicators.appendChild(dot);
                dots.push(dot);
            }
            updateActiveDot();
        };

        gallery.addEventListener('scroll', updateActiveDot);

        const scrollNext = () => {
            if (gallery.scrollLeft + gallery.clientWidth >= gallery.scrollWidth - 10) {
                gallery.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                gallery.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        };

        const scrollPrev = () => {
            if (gallery.scrollLeft <= 0) {
                gallery.scrollTo({ left: gallery.scrollWidth, behavior: 'smooth' });
            } else {
                gallery.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        };

        prevBtn?.addEventListener('click', () => {
            scrollPrev();
        });

        nextBtn?.addEventListener('click', () => {
            scrollNext();
        });

        // Ocultar controles se não houver scroll e recalcular dots
        const checkControlsVisibility = () => {
            requestAnimationFrame(() => {
                createDots(); // Recria os dots com a largura correta

                // A tolerância de 10px ajuda a evitar que borders ou paddings pequenos ativem os botões
                if (gallery.scrollWidth <= gallery.clientWidth + 10) {
                    if (prevBtn) prevBtn.style.display = 'none';
                    if (nextBtn) nextBtn.style.display = 'none';
                    if (indicators) indicators.style.display = 'none';
                } else {
                    if (prevBtn) prevBtn.style.display = 'flex';
                    if (nextBtn) nextBtn.style.display = 'flex';
                    if (indicators) indicators.style.display = 'flex';
                }
            });
        };

        checkControlsVisibility();
        window.addEventListener('resize', checkControlsVisibility);
    }

    async loadTemplate() {
        const html = await AboutFullTemplate.load().catch(err => {
            console.error(err);
            return null;
        });

        if (html) await this.render(html);
    }
}

customElements.define('about-full-component', AboutFullComponent);
