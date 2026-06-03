import { initGlobalAnimations } from './animations.js';
initGlobalAnimations();

import '../../header-component/scripts/header-component.js';
import '../../home-component/scripts/home-component.js';
import '../../brands-component/scripts/brands-component.js';
import '../../about-me-component/scripts/about-me-component.js';
import '../../about-full-component/scripts/about-full-component.js';
import '../../contact-me-component/scripts/contact-me-component.js';
import '../../services-component/scripts/services-component.js';
import '../../gallery-component/scripts/gallery-component.js';
import '../../article-component/scripts/article-component.js';
import '../../expertise-component/scripts/expertise-component.js';
import '../../footer-component/scripts/footer-component.js';
import '../../adidas-component/scripts/adidas-component.js';
import '../../cpfl-component/scripts/cpfl-component.js';
import '../../media-modal-component/scripts/media-modal-component.js';

// Assistente para rolar até a seção com base no hash da URL (útil ao carregar a página)
function checkAndScrollToHash() {
    const hash = window.location.hash;
    if (!hash) return;

    let attempts = 0;
    const maxAttempts = 40; // 40 tentativas (cerca de 2 segundos)
    const checkInterval = setInterval(() => {
        const target = document.querySelector(hash);
        attempts++;
        if (target && target.getBoundingClientRect().height > 0) {
            clearInterval(checkInterval);
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150); // Pequeno atraso para o layout estabilizar
        }
        if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
        }
    }, 50);
}

window.addEventListener('load', checkAndScrollToHash);
window.addEventListener('hashchange', checkAndScrollToHash);