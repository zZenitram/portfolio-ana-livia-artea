import { ArticleTemplate } from './article-template.js';

class ArticleComponent extends HTMLElement {
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
        const html = await ArticleTemplate.load().catch(err => {
            this.renderError(err);
            return null;
        });

        if (html) await this.render(html);
    }
}

customElements.define('article-component', ArticleComponent);