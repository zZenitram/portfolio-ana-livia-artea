import { BrandsTemplate } from './about-me-template.js';

class BrandsComponent extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await this.loadTemplate();
        this.initController();
    }

    async render(html) {
        this.innerHTML = html;
        await new Promise(requestAnimationFrame).then(() => window.lucide?.createIcons());
    }

    async loadTemplate() {
        const html = await BrandsTemplate.load().catch(err => {
            this.renderError(err);
            return null;
        });

        if (html) await this.render(html);
    }
}

customElements.define('about-me-component', BrandsComponent);