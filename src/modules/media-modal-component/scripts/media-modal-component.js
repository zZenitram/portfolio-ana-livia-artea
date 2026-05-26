import { MediaModalTemplate } from './media-modal-template.js';

class MediaModalComponent extends HTMLElement {
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
            this.initModal();
        });
    }

    initModal() {
        const modal = this.querySelector('#media-modal');
        const overlay = this.querySelector('#media-modal-overlay');
        const closeBtn = this.querySelector('#media-modal-close');
        const videoPlayer = this.querySelector('#media-modal-video');
        const imgPlayer = this.querySelector('#media-modal-img');
        
        if (!modal || !overlay || !closeBtn || !videoPlayer || !imgPlayer) return;

        const openModal = (url, type) => {
            const backgroundVideos = document.querySelectorAll('video.video-bg, video.video-fg');
            backgroundVideos.forEach(v => v.pause());

            if (type === 'video') {
                imgPlayer.style.display = 'none';
                videoPlayer.style.display = 'block';
                videoPlayer.src = url;
                videoPlayer.play().catch(e => console.log("Video play error:", e));
            } else {
                videoPlayer.style.display = 'none';
                videoPlayer.pause();
                imgPlayer.style.display = 'block';
                imgPlayer.src = url;
            }

            modal.classList.add('active');
        };

        const closeModal = () => {
            modal.classList.remove('active');
            videoPlayer.pause();
            videoPlayer.src = '';
            imgPlayer.src = '';
            
            const backgroundVideos = document.querySelectorAll('video.video-bg, video.video-fg');
            backgroundVideos.forEach(v => {
                v.play().catch(e => console.log("Video play error:", e));
            });
        };

        // Use event delegation on document so it works for cards in any other component
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.media-card');
            if (card) {
                const url = card.getAttribute('data-media-url');
                const type = card.getAttribute('data-media-type');
                if (url) {
                    openModal(url, type);
                }
            }
        });

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
    }

    async loadTemplate() {
        const html = await MediaModalTemplate.load().catch(err => {
            console.error(err);
            return null;
        });

        if (html) await this.render(html);
    }
}

customElements.define('media-modal-component', MediaModalComponent);
