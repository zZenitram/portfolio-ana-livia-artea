import { initGlobalAnimations } from './animations.js';
import { checkAndScrollToHash } from './scroll.js';
import { initThemeChange } from './theme.js';
import { i18n } from './i18n.js';
import { Analytics } from './analytics.js';
import { initTracking } from './tracking.js';

// ── Analytics: inicializa o GA4 o mais cedo possível ──────────────────────
// O script do gtag é injetado de forma assíncrona para não bloquear o render.
Analytics.init();

await i18n.init();

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

initThemeChange();
initGlobalAnimations();
window.addEventListener('load', checkAndScrollToHash);
window.addEventListener('hashchange', checkAndScrollToHash);

// ── Analytics: inicia rastreamentos após componentes carregados ────────────
// initTracking() dispara page_view e configura todos os observers/listeners.
initTracking();