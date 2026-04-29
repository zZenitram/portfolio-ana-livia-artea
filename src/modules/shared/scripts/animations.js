export function initGlobalAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    // Observar elementos que já existem no DOM
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Observar elementos que serão adicionados dinamicamente (ex: Web Components carregando templates)
    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Node.ELEMENT_NODE
                    if (node.classList && node.classList.contains('reveal')) {
                        observer.observe(node);
                    }
                    const reveals = node.querySelectorAll('.reveal');
                    if (reveals) {
                        reveals.forEach(el => observer.observe(el));
                    }
                }
            });
        });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
}
