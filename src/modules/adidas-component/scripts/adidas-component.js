import { AdidasTemplate } from './adidas-template.js';

class AdidasComponent extends HTMLElement {
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
            "desafio-grid": [
                { name: "Desafio Parceiro Adidas Aquecimento", url: "./public/png/desafio_parceiro_adidas_aquecimento.png" },
                { name: "Desafio Parceiro Adidas Esportes", url: "./public/png/desafio_parceiro_adidas_esportes.png" },
                { name: "Desafio Parceiro Adidas Treino", url: "./public/png/desafio_parceiro_adidas_treino.png" }
            ],
            "solution-grid": [
                { name: "solution 1", url: "./public/gif/linha_optime.gif" },
                { name: "solution 2", url: "./public/png/dicas_parceiro_adidas.png" },
                { name: "solution 3", url: "./public/gif/lancamentos_dropset.gif" },
                { name: "solution 4", url: "./public/png/cupom_de_desconto_adidas.png" }
            ],
            "bf-grid": [
                { name: "Black Friday 1", url: "./public/png/black_friday_adidas.png" },
                { name: "Black Friday 2", url: "./public/gif/parceiro_adidas_black_friday.gif" },
                { name: "Black Friday 3", url: "./public/gif/produtos_adidas.gif" },
                { name: "Black Friday 4", url: "./public/png/media_kit_adidas.png" }
            ],
            "ano1-grid": [
                { name: "Entrevista no Escritório da Adidas ", url: "./public/jpg/visita_adidas_entrevista.jpg" },
                { name: "Foto com a equipe da adidas", url: "./public/mp4/programa_de_pontos_adidas.mp4" },
                { name: "Foto com a equipe da adidas", url: "./public/jpg/visita_adidas_equipe.jpg" },
                { name: "Comemoração de 1 ano de programa", url: "./public/png/aniversario_programa_parceiro_adidas.png" }
            ],
            "dropset-grid": [
                { name: "Dropset 1", url: "./public/jpg/evento_dropset_quatro.jpg" },
                { name: "Dropset 2", url: "./public/jpg/arthur_zanetti.jpg" },
                { name: "Dropset 3", url: "./public/jpg/evento_dropset_quatro_palestra.jpg" },
                { name: "Dropset 4", url: "./public/jpg/evento_dropset_quatro_convidados.jpg" },
                { name: "Dropset 5", url: "./public/jpg/evento_dropset_quatro_cenario.jpg" }
            ],
            "hoje-grid": [
                { name: "Hoje 1", url: "./public/jpeg/adidas_squad.jpeg" },
                { name: "Hoje 2", url: "./public/jpeg/pais_que_treinam.jpeg" },
                { name: "Hoje 3", url: "./public/jpeg/o_club_dos_mvts.jpeg" },
                { name: "Hoje 4", url: "./public/webm/lancamento_adidas_squad.webm" }
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
        const html = await AdidasTemplate.load().catch(err => {
            console.error(err);
            return null;
        });

        if (html) await this.render(html);
    }
}

customElements.define('adidas-component', AdidasComponent);
