import { AboutMeTemplate } from './about-me-template.js';

class AboutMeComponent extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await this.loadTemplate();
    }

    async render(html) {
        this.innerHTML = html;
        await new Promise(requestAnimationFrame).then(() => window.lucide?.createIcons());
    }

    async loadTemplate() {
        const html = await AboutMeTemplate.load().catch(err => {
            this.renderError(err);
            return null;
        });

        if (html) await this.render(html);
    }
}

customElements.define('about-me-component', AboutMeComponent);