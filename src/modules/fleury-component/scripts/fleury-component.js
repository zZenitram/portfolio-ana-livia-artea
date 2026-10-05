import { FleuryTemplate } from './fleury-template.js';

class FleuryComponent extends HTMLElement {
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
            this.initImages();
            this.initAnimations();
            this.initLoaders();
        });
    }

    initImages() {
        const sectionsData = {
            "atuacao-grid": [
                { name: "Faça seus exames de sangue em casa (LAFE)", url: "public/webp/lafe_exames_em_casa.webp" },
                { name: "Atendimento domiciliar para crianças (Labs A+)", url: "public/webp/labsA_atendimento_domiciliar.webp" },
                { name: "Como evitar as viroses de verão", url: "public/webp/clinica_felippe_mattoso_cuidados_no_verao.webp" },
                { name: "Tomografia e Ressonância Magnética (Centro de Medicina)", url: "public/webp/centro_de_medicina_tomografia_ressonancia.webp" }
            ],
            "vacinacao-grid": [
                { name: "A vacina da gripe chegou!", url: "public/webp/clinica_felippe_mattoso_vacinacao_gripe.webp" },
                { name: "Imunizante Beyfortus® (Nirsevimabe)", url: "public/webp/lafe_vacinacao_beyfortus.webp" },
                { name: "Vaccine-se com a Abrysvo", url: "public/webp/labsA_vacinacao_abrysvo.webp" },
                { name: "A vacina Pneumo 20", url: "public/webp/centro_de_medicina_vacinacao_pneumo_20.webp" }
            ],
            "mattoso-grid": [
                { name: "60 anos Clínica Felippe Mattoso", url: "public/webp/clinica_felippe_mattoso_campanha_60_anos_equipe.webp" },

                { name: "Vídeo Fachada Clínica Felippe Mattoso", url: "public/webm/clinica_felippe_mattoso_campanha_60_anos_video_case.webm", type: "video" },

                { name: "Vídeo Vista Aérea Clínica Felippe Mattoso", url: "public/webm/clinica_felippe_mattoso_campanha_60_anos_video_equipe.webm", type: "video" },

                { name: "Cuidado que atravessa gerações", url: "public/webp/clinica_felippe_mattoso_campanha_60_anos.webp" }
            ]
        };

        const images = [];

        Object.keys(sectionsData).forEach(key => {
            const grid = this.querySelector(`#${key}`);
            if (!grid) return;

            grid.innerHTML = sectionsData[key].map(data => {
                if (data.url) {
                    const isVideo = data.url.endsWith('.mp4') || data.url.endsWith('.webm') || data.url.endsWith('.mov') || data.type === 'video';

                    if (isVideo) {
                        return `
                            <div class="image-card video-card media-card skeleton-loading" style="cursor: pointer;" data-media-url="${data.url}" data-media-type="video">
                                <div class="video-container">
                                    <video src="${data.url}" class="video-bg" autoplay loop muted playsinline></video>
                                    <video src="${data.url}" class="video-fg" autoplay loop muted playsinline></video>
                                </div>
                                <span class="media-badge video-badge">
                                    <i data-lucide="play" width="12" height="12"></i>
                                </span>
                            </div>
                        `;
                    }

                    return `
                        <div class="image-card media-card skeleton-loading" style="cursor: pointer;" data-media-url="${data.url}" data-media-type="image">
                            <img src="${data.url}" alt="${data.name}" class="grid-image" />
                        </div>
                    `;
                } else {
                    return `
                        <div class="image-placeholder">
                            <i data-lucide="image" width="32" height="32"></i>
                            ${data.name ? `<span class="image-name">${data.name}</span>` : ''}
                        </div>
                    `;
                }
            }).join('');

            if (window.lucide) {
                window.lucide.createIcons({
                    attrs: {
                        class: 'lucide'
                    },
                    nameAttr: 'data-lucide',
                    node: grid
                });
            }

            const cards = grid.querySelectorAll('.image-card, .image-placeholder');
            sectionsData[key].forEach((data, index) => {
                images.push({
                    ...data,
                    element: cards[index]
                });
            });
        });

        this.images = images;
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

    initLoaders() {
        const mediaElements = Array.from(this.querySelectorAll('img.grid-image, video.video-bg'));
        const cards = this.querySelectorAll('.skeleton-loading');

        if (mediaElements.length === 0) {
            cards.forEach(card => card.classList.remove('skeleton-loading'));
            return;
        }

        const promises = mediaElements.map(media => {
            return new Promise((resolve) => {
                if (media.tagName.toLowerCase() === 'img') {
                    if (media.complete) {
                        resolve();
                    } else {
                        media.addEventListener('load', resolve, { once: true });
                        media.addEventListener('error', resolve, { once: true });
                    }
                } else if (media.tagName.toLowerCase() === 'video') {
                    if (media.readyState >= 3) {
                        resolve();
                    } else {
                        media.addEventListener('canplay', resolve, { once: true });
                        media.addEventListener('error', resolve, { once: true });
                    }
                }
            });
        });

        Promise.all(promises).then(() => {
            cards.forEach(card => card.classList.remove('skeleton-loading'));
        });
    }

    async loadTemplate() {
        const html = await FleuryTemplate.load().catch(err => {
            console.error(err);
            return null;
        });

        if (html) await this.render(html);
    }
}

customElements.define('fleury-component', FleuryComponent);
