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
        });
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
