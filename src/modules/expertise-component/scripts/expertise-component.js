import { ExpertiseTemplate } from './expertise-template.js';

class ExpertiseComponent extends HTMLElement {
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
        const html = await ExpertiseTemplate.load().catch(err => {
            this.renderError(err);
            return null;
        });

        if (html) await this.render(html);
    }
}

customElements.define('expertise-component', ExpertiseComponent);