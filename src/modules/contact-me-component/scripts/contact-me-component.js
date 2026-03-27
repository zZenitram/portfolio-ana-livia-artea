import { ContactMeTemplate } from './contact-me-template.js';

class ContactMeComponent extends HTMLElement {
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
        const html = await ContactMeTemplate.load().catch(err => {
            this.renderError(err);
            return null;
        });

        if (html) await this.render(html);
    }
}

customElements.define('contact-me-component', ContactMeComponent);