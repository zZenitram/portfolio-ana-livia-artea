import { HeaderScroll } from './header-scroll.js';
import { HeaderMenu } from './header-menu.js';

export class HeaderController {
    constructor({ header, button, menu, body }) {
        this.scroll = new HeaderScroll(header);
        this.menu = new HeaderMenu({ button, menu, body });
    }

    init() {
        this.scroll.init();
        this.menu.init();
    }

    destroy() {
        this.scroll.destroy();
        this.menu.destroy();
    }
}