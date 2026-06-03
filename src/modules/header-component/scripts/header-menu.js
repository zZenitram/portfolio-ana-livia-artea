export class HeaderMenu {
    constructor({ button, menu, body }) {
        this.button = button;
        this.menu = menu;
        this.body = body;

        this.handler = null;
        this.backdrop = null;
        this.observer = null;
        this.scrollSpyInterval = null;
        this.scrollSpyHandler = null;
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

        this.initScrollSpy();
    }

    initScrollSpy() {
        const links = this.menu.querySelectorAll("a.nav-link");
        const hashes = [];
        links.forEach(link => {
            const url = new URL(link.href);
            if (url.hash) {
                hashes.push(url.hash);
            }
        });

        if (hashes.length === 0) return;

        let attempts = 0;
        const maxAttempts = 40;
        this.scrollSpyInterval = setInterval(() => {
            const sections = [];
            hashes.forEach(hash => {
                const target = document.querySelector(hash);
                if (target && target.getBoundingClientRect().height > 0) {
                    sections.push({ hash, element: target });
                }
            });

            const expectedCount = hashes.filter(hash => document.querySelector(hash)).length;
            if ((sections.length > 0 && sections.length === expectedCount) || attempts >= maxAttempts) {
                clearInterval(this.scrollSpyInterval);
                this.setupScrollSpy(sections);
            }
            attempts++;
        }, 100);
    }

    setupScrollSpy(sections) {
        if (sections.length === 0) return;

        this.scrollSpyHandler = () => {
            const scrollPos = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            
            // Detecta se atingiu o fim da página (com margem de 50px de segurança)
            const isAtBottom = scrollPos + windowHeight >= docHeight - 50;

            let activeHash = null;

            if (isAtBottom) {
                activeHash = sections[sections.length - 1].hash;
            } else {
                // Linha de ativação a 35% do topo do viewport
                const activationLine = scrollPos + (windowHeight * 0.35);

                for (let i = 0; i < sections.length; i++) {
                    const section = sections[i].element;
                    const top = section.offsetTop;
                    const height = section.offsetHeight;

                    if (activationLine >= top && activationLine < top + height) {
                        activeHash = sections[i].hash;
                        break;
                    }
                }
            }

            // Atualiza a classe active para cada link correspondente ao hash ativo
            this.menu.querySelectorAll("a.nav-link").forEach(link => {
                const url = new URL(link.href);
                if (url.hash) {
                    if (url.hash === activeHash) {
                        link.classList.add("active");
                    } else {
                        link.classList.remove("active");
                    }
                }
            });
        };

        window.addEventListener("scroll", this.scrollSpyHandler);
        // Roda uma vez para definir o estado inicial correto
        this.scrollSpyHandler();
    }

    destroy() {
        if (this.handler && this.button) this.button.removeEventListener("click", this.handler);
        if (this.backdrop) this.backdrop.remove();
        window.removeEventListener("hashchange", () => this.setActiveLink());
        if (this.scrollSpyInterval) clearInterval(this.scrollSpyInterval);
        if (this.scrollSpyHandler) window.removeEventListener("scroll", this.scrollSpyHandler);
    }
}