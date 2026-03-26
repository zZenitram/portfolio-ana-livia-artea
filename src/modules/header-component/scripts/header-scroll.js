export class HeaderScroll {
    constructor(header) {
        this.header = header;
        this.handler = null;
    }

    init() {
        if (!this.header) return;

        this.handler = () => {
            this.header.classList.toggle("shadow", window.scrollY > 1);
        };

        window.addEventListener("scroll", this.handler);
    }

    destroy() {
        if (this.handler) {
            window.removeEventListener("scroll", this.handler);
        }
    }
}