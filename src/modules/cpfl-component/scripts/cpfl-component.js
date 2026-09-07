import { CpflTemplate } from './cpfl-template.js';

class CpflComponent extends HTMLElement {
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
            "solucao-grid-1": [
                { name: "Geração de Energia 100% Renovável", url: "public/jpg/geracao_renovavel.jpg" },
                { name: "Dicas de Economia de Energia no Outono", url: "public/jpg/dicas_energia_outono.jpg" },
                { name: "Vídeo Curto-Circuito com Gatinhos", url: "public/webm/curto_circuito_gatinhos_foto_vídeo.webm", type: "video" },
                { name: "Equipes de Campo da CPFL", url: "public/jpg/equipes_em_campo.jpg" }
            ],
            "solucao-grid-2": [
                { name: "Post A Vida de Eletricista", url: "public/jpg/a_vida_do_eletricista.jpg" },
                { name: "Post Engajamento Dia a Dia do Time", url: "public/jpg/ha_quantos_meses.jpg" },
                { name: "Miniaturas Escola de Eletricistas CPFL", url: "public/jpg/energia_eletricistas.jpg" },
                { name: "Post Temático Stranger Things", url: "public/webm/stranger_things_video.webm", type: "video" }
            ],
            "employer-branding-grid": [
                { name: "Divulgação de Vagas CPFL Energia", url: "public/png/vagas.png" },
                { name: "Vídeo Depoimento Histórias de Energia", url: "public/webm/historias_de_energia.webm", type: "video" },
                { name: "Vídeo Conheça a Área", url: "public/webm/conheca_a_area.webm", type: "video" },
                { name: "Vídeo Depoimento Memória Mais Feliz", url: "public/webm/memoria_mais_feliz.webm", type: "video" }
            ],
            "pinterest-grid": [
                { name: "Pin Consumo Consciente Organização de Cabos", url: "public/jpeg/organizacao_de_cabos.jpeg" },
                { name: "Pin A Energia da Sua Casa", url: "public/jpg/sua_energia.jpg" },
                { name: "Pin Decoração com Plantas que Amam Sol", url: "public/jpg/plantas_que_amam_sol.jpg" },
                { name: "Pin Home Office Sustentável", url: "public/jpg/home_office_sustentavel.jpg" }
            ],
            "influenciadores-grid": [
                { name: "Campanha com Influenciador Pedro Leonardo (@pedroleonardocosta)", url: "public/webm/pedro_leonardo.webm", type: "video" },
                { name: "Campanha com Influenciadora Fernanda Fabris (@mae_poramor)", url: "public/webm/fernanda_fabris.webm", type: "video" }
            ]
        };

        const images = [];

        Object.keys(sectionsData).forEach(key => {
            const grid = this.querySelector(`#${key}`);
            if (!grid) return;

            grid.innerHTML = sectionsData[key].map(data => {
                if (data.url) {
                    const isVideo = data.url.endsWith('.mp4') || data.url.endsWith('.webm') || data.url.endsWith('.mov') || data.type === 'video';
                    const isGif = data.url.endsWith('.gif') || data.type === 'gif';

                    if (isVideo) {
                        const isInfluencer = key === 'influenciadores-grid';
                        const handle = isInfluencer ? (data.name.includes('@pedroleonardocosta') ? '@pedroleonardocosta' : '@mae_poramor') : null;
                        const instaUrl = isInfluencer ? (data.name.includes('@pedroleonardocosta') ? 'https://www.instagram.com/pedroleonardocosta/' : 'https://www.instagram.com/mae_poramor/') : null;

                        const videoHtml = `
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

                        if (isInfluencer) {
                            return `
                                <div class="influencer-card-wrapper">
                                    ${videoHtml}
                                    <a href="${instaUrl}" target="_blank" rel="noopener noreferrer" class="influencer-link">
                                        <i data-lucide="instagram" width="14" height="14"></i>
                                        ${handle}
                                    </a>
                                </div>
                            `;
                        }

                        return videoHtml;
                    } else if (isGif) {
                        return `
                            <div class="image-card gif-card media-card skeleton-loading" style="cursor: pointer;" data-media-url="${data.url}" data-media-type="image">
                                <img src="${data.url}" alt="${data.name}" class="grid-image" />
                                <span class="media-badge gif-badge">GIF</span>
                            </div>
                        `;
                    } else {
                        return `
                            <div class="image-card media-card skeleton-loading" style="cursor: pointer;" data-media-url="${data.url}" data-media-type="image">
                                <img src="${data.url}" alt="${data.name}" class="grid-image" />
                            </div>
                        `;
                    }
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
        const html = await CpflTemplate.load().catch(err => {
            console.error(err);
            return null;
        });

        if (html) await this.render(html);
    }
}

customElements.define('cpfl-component', CpflComponent);
