import { FooterTemplate } from './footer-template.js';

class FooterComponent extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        await this.loadTemplate();
    }

    async loadTemplate() {
        const html = await FooterTemplate.load().catch(err => {
            this.innerHTML = err;
            return null;
        });
        if (html) this.innerHTML = html;
    }
}

customElements.define('footer-component', FooterComponent);