export class HeaderMenu {
    constructor({ button, menu, body }) {
        this.button = button;
        this.menu = menu;
        this.body = body;

        this.handler = null;
        this.backdrop = null;
    }

    createBackdrop() {
        this.backdrop = document.createElement("div");
        this.backdrop.className = "menu-backdrop hidden";
        document.body.appendChild(this.backdrop);
        this.backdrop.addEventListener("click", () => this.close());
    }

    handleLinkClick(event) {
        const link = event.target.closest("a.nav-link");
        if (link) this.close();
    }

    open() {
        this.body.classList.add("overflow-hidden");
        this.menu.classList.remove("hidden");
        this.backdrop.classList.remove("hidden");
        this.button.setAttribute("aria-expanded", true);
        this.menu.setAttribute("aria-hidden", false);
        this.button.innerHTML = '<i data-lucide="x"></i>';
        if (window.lucide) window.lucide.createIcons();
    }

    close() {
        this.body.classList.remove("overflow-hidden");
        this.menu.classList.add("hidden");
        this.backdrop.classList.add("hidden");
        this.button.setAttribute("aria-expanded", false);
        this.menu.setAttribute("aria-hidden", true);
        this.button.innerHTML = '<i data-lucide="menu"></i>';
        if (window.lucide) window.lucide.createIcons();
    }

    toggle() {
        const isHidden = this.menu.classList.contains("hidden");
        isHidden ? this.open() : this.close();
    }

    init() {
        if (!this.button || !this.menu || !this.body) return;
        this.createBackdrop();
        this.close();
        this.handler = () => this.toggle();
        this.button.addEventListener("click", this.handler);
        this.handleLinkClick = this.handleLinkClick.bind(this);
        this.menu.addEventListener("click", this.handleLinkClick);
    }

    destroy() {
        if (this.handler && this.button) this.button.removeEventListener("click", this.handler);
        if (this.backdrop) this.backdrop.remove();
    }
}