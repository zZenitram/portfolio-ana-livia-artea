import { HeaderController } from './header-controller.js';
import { HeaderTemplate } from './header-template.js';

class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        this.controller = null;
    }

    async connectedCallback() {
        await this.loadTemplate();
        this.initController();
    }

    async loadTemplate() {
        const html = await HeaderTemplate.load().catch(err => {
            this.innerHTML = err;
            return null;
        });
        if (html) this.innerHTML = html;
    }

    initController() {
        const header = this.querySelector("#header");
        const button = this.querySelector("#btn-menu");
        const menu = this.querySelector("#menu");

        this.controller = new HeaderController({
            header,
            button,
            menu,
            body: document.body
        });

        this.controller.init();

        const langSelect = this.querySelector("#language-select");
        if (langSelect && window.i18n) {
            langSelect.value = window.i18n.currentLang;
            langSelect.addEventListener("change", (e) => {
                window.i18n.setLanguage(e.target.value);
            });
        }
    }

    disconnectedCallback() {
        this.controller?.destroy();
    }
}

customElements.define('header-component', HeaderComponent);