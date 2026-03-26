export class HeaderMenu {
    constructor({ button, menu, body }) {
        this.button = button;
        this.menu = menu;
        this.body = body;
        this.handler = null;
    }

    init() {
        if (!this.button || !this.menu || !this.body) return;

        this.handler = () => {
            this.body.classList.toggle("overflow-hidden");
            this.menu.classList.toggle("hidden");

            const isExpanded = !this.menu.classList.contains("hidden");

            this.button.setAttribute("aria-expanded", isExpanded);
            this.menu.setAttribute("aria-hidden", !isExpanded);
        };

        this.button.addEventListener("click", this.handler);
    }

    destroy() {
        if (this.handler && this.button) {
            this.button.removeEventListener("click", this.handler);
        }
    }
}