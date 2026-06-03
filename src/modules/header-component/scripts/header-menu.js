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
        if (!link) return;
        
        this.close();

        // Verificar se o link aponta para uma seção na página atual
        const url = new URL(link.href);

        if (url.hash) {
            const target = document.querySelector(url.hash);
            if (target) {
                event.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, url.hash);
            }
        }
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

    setActiveLink() {
        const links = this.menu.querySelectorAll("a.nav-link");
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;

        links.forEach(link => {
            const url = new URL(link.href);
            // Verificar se o link corresponde à página atual
            const linkPath = url.pathname;
            const isSamePath = currentPath.endsWith(linkPath) || (currentPath === '/' && linkPath.endsWith('index.html'));
            
            if (isSamePath) {
                // Se houver hash, verificar se corresponde
                if (url.hash) {
                    link.classList.toggle("active", currentHash === url.hash);
                } else if (!currentHash) {
                    // Se não houver hash no link nem na URL atual, é a página base
                    link.classList.add("active");
                }
            } else {
                link.classList.remove("active");
            }
        });
    }

    init() {
        if (!this.button || !this.menu || !this.body) return;
        this.createBackdrop();
        this.close();
        this.handler = () => this.toggle();
        this.button.addEventListener("click", this.handler);
        this.handleLinkClick = this.handleLinkClick.bind(this);
        this.menu.addEventListener("click", this.handleLinkClick);
        
        this.setActiveLink();
        window.addEventListener("hashchange", () => this.setActiveLink());
    }

    destroy() {
        if (this.handler && this.button) this.button.removeEventListener("click", this.handler);
        if (this.backdrop) this.backdrop.remove();
        window.removeEventListener("hashchange", () => this.setActiveLink());
    }
}