/**
 * tracking.js — Ana Lívia Artea | Rastreamentos Automáticos
 * ──────────────────────────────────────────────────────────
 * Responsabilidade: monitorar comportamentos passivos do usuário.
 * Todos os eventos são disparados via Analytics.track() / Analytics.*().
 *
 * Rastreamentos implementados:
 *   1. Identificação de novo usuário vs. recorrente (localStorage)
 *   2. Profundidade de scroll (25 / 50 / 75 / 100%)
 *   3. Tempo de permanência na página (30s, 60s, 120s, 300s)
 *   4. Visibilidade de seções (IntersectionObserver)
 *      ─ index.html   : home, brands, about-me, services, projects, expertise, article, contact-me
 *      ─ sobre-mim    : about-full (intro, inspirações, certificados, ferramentas), contact-me
 *      ─ adidas.html  : adidas-case, contact-me
 *      ─ cpfl-energia : cpfl-case, contact-me
 *   5. Cliques em CTAs globais (delegação de eventos)
 *      ─ Portfólio, serviços, artigos externos, e-mail, LinkedIn
 *
 * Princípios de performance:
 *   - Scroll throttling com requestAnimationFrame
 *   - IntersectionObserver (sem listener de scroll adicional)
 *   - Cada marco dispara apenas UMA vez por sessão (Set de controle)
 *   - Delegação de eventos no document (listener único)
 *
 * @author  DHAX — Engenharia Frontend
 * @version 2.0.0
 */

import { Analytics } from './analytics.js';

// ─── 1. Identificação: Novo Usuário vs. Recorrente ────────────────────────────

/**
 * Verifica se é a primeira visita do usuário neste navegador/dispositivo.
 *
 * Estratégia:
 *   - Na primeira visita: a chave '_ala_visited' não existe no localStorage
 *     → marca como 'new', grava a chave com a data e hora da visita
 *   - Visitas seguintes: chave existe → marca como 'returning'
 *
 * Limitação esperada (igual ao GA4): limpar localStorage ou trocar de
 * navegador/dispositivo reseta a identificação.
 *
 * @returns {'new'|'returning'}
 */
function resolveUserType() {
  const STORAGE_KEY = '_ala_visited';
  const isNew = !localStorage.getItem(STORAGE_KEY);

  if (isNew) {
    // Primeira visita: grava timestamp para referência futura
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  }

  return isNew ? 'new' : 'returning';
}

// ─── 2. Rastreamento de Scroll ────────────────────────────────────────────────

/**
 * Rastreia profundidade de scroll em marcos percentuais.
 * Throttle com rAF — processa apenas um evento por frame.
 * Cada marco é registrado apenas UMA vez por carregamento.
 *
 * @param {string} userType - 'new' ou 'returning'
 */
function initScrollTracking(userType) {
  const MILESTONES = [25, 50, 75, 100];
  const reached = new Set(); // Guard contra redisparo
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) { ticking = false; return; }

      const pct = Math.round((scrollTop / docHeight) * 100);

      MILESTONES.forEach(milestone => {
        if (pct >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          Analytics.track('scroll_depth', {
            event_category: 'engagement',
            event_label:    `Scroll ${milestone}%`,
            scroll_depth:   milestone,
            page_path:      window.location.pathname,
            user_type:      userType,
          });
        }
      });

      // Remove listener quando todos os marcos forem atingidos
      if (reached.size === MILESTONES.length) {
        window.removeEventListener('scroll', onScroll, { passive: true });
      }

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

// ─── 3. Rastreamento de Tempo na Página ──────────────────────────────────────

/**
 * Rastreia tempo de permanência em marcos pré-definidos.
 * Só dispara enquanto a aba está visível (document.visibilityState).
 *
 * @param {string} userType - 'new' ou 'returning'
 */
function initTimeTracking(userType) {
  const TIME_MILESTONES = [
    { seconds: 30,  label: '30s'  },
    { seconds: 60,  label: '1min' },
    { seconds: 120, label: '2min' },
    { seconds: 300, label: '5min' },
  ];

  const timers = [];

  TIME_MILESTONES.forEach(({ seconds, label }) => {
    const t = setTimeout(() => {
      if (document.visibilityState !== 'visible') return;
      Analytics.track('time_on_page', {
        event_category: 'engagement',
        event_label:    `Tempo: ${label}`,
        time_seconds:   seconds,
        page_path:      window.location.pathname,
        user_type:      userType,
      });
    }, seconds * 1000);
    timers.push(t);
  });

  // Limpa timers ao sair da página
  window.addEventListener('beforeunload', () => timers.forEach(clearTimeout));
}

// ─── 4. Visibilidade de Seções ────────────────────────────────────────────────

/**
 * Mapa completo de todas as seções relevantes de todas as páginas.
 *
 * Cada entrada define:
 *   selector  — seletor CSS único da seção no DOM
 *   event     — nome do evento GA4 a disparar
 *   label     — descrição humana para event_label
 *   category  — 'engagement' ou 'conversion'
 *   pages     — array de pathnames onde essa seção existe
 *              (usa startsWith, então '/' cobre index.html e '/')
 */
const SECTION_MAP = [
  // ── index.html ────────────────────────────────────────────────────────────
  {
    selector: '.ctr-home',
    event:    'section_view_home',
    label:    'Seção: Home (Intro)',
    category: 'engagement',
    pages:    ['/index.html', '/'],
  },
  {
    selector: '.ctr-brands',
    event:    'section_view_brands',
    label:    'Seção: Marcas Parceiras',
    category: 'engagement',
    pages:    ['/index.html', '/'],
  },
  {
    selector: '.ctr-about-me',
    event:    'section_view_about_me',
    label:    'Seção: Sobre Mim (resumo)',
    category: 'engagement',
    pages:    ['/index.html', '/'],
  },
  {
    selector: '#services',
    event:    'section_view_services',
    label:    'Seção: Serviços',
    category: 'engagement',
    pages:    ['/index.html', '/'],
  },
  {
    selector: '#projects',
    event:    'section_view_projects',
    label:    'Seção: Portfólio / Projetos',
    category: 'engagement',
    pages:    ['/index.html', '/'],
  },
  {
    selector: '#expertise',
    event:    'section_view_expertise',
    label:    'Seção: Expertise (temas)',
    category: 'engagement',
    pages:    ['/index.html', '/'],
  },
  {
    selector: '#article',
    event:    'section_view_articles',
    label:    'Seção: Artigos',
    category: 'engagement',
    pages:    ['/index.html', '/'],
  },

  // ── sobre-mim.html ────────────────────────────────────────────────────────
  {
    selector: '.ctr-intro',
    event:    'section_view_about_intro',
    label:    'Seção: Sobre Mim — Intro',
    category: 'engagement',
    pages:    ['/sobre-mim.html'],
  },
  {
    selector: '.ctr-inspirations',
    event:    'section_view_inspirations',
    label:    'Seção: Sobre Mim — Inspirações',
    category: 'engagement',
    pages:    ['/sobre-mim.html'],
  },
  {
    selector: '.ctr-certificates',
    event:    'section_view_certificates',
    label:    'Seção: Sobre Mim — Certificados',
    category: 'engagement',
    pages:    ['/sobre-mim.html'],
  },
  {
    selector: '.ctr-lang-edu',
    event:    'section_view_lang_edu',
    label:    'Seção: Sobre Mim — Idiomas e Formação',
    category: 'engagement',
    pages:    ['/sobre-mim.html'],
  },
  {
    selector: '.ctr-tools',
    event:    'section_view_tools',
    label:    'Seção: Sobre Mim — Ferramentas',
    category: 'engagement',
    pages:    ['/sobre-mim.html'],
  },

  // ── adidas.html ───────────────────────────────────────────────────────────
  {
    selector: '.ctr-adidas',
    event:    'section_view_case_adidas',
    label:    'Seção: Case Adidas Brasil',
    category: 'engagement',
    pages:    ['/adidas.html'],
  },

  // ── cpfl-energia.html ─────────────────────────────────────────────────────
  {
    selector: '.ctr-cpfl',
    event:    'section_view_case_cpfl',
    label:    'Seção: Case CPFL Energia',
    category: 'engagement',
    pages:    ['/cpfl-energia.html'],
  },

  // ── Todas as páginas: seção de contato ────────────────────────────────────
  {
    selector: '#contact-me',
    event:    'contact_page_view',
    label:    'Seção: Contato (visível)',
    category: 'conversion', // Marco de funil — alta relevância
    pages:    ['/index.html', '/', '/sobre-mim.html', '/adidas.html', '/cpfl-energia.html'],
  },
];

/**
 * Configura o IntersectionObserver para todas as seções do SECTION_MAP
 * que existem na página atual.
 * Usa MutationObserver como fallback para Web Components carregados após o DOM.
 *
 * @param {string} userType - 'new' ou 'returning'
 */
function initSectionVisibilityTracking(userType) {
  const currentPath = window.location.pathname;

  // Filtra apenas as seções relevantes para a página atual
  const relevantSections = SECTION_MAP.filter(s =>
    s.pages.some(p => currentPath === p || currentPath.endsWith(p))
  );

  if (relevantSections.length === 0) return;

  // Set para evitar disparar a mesma seção mais de uma vez
  const fired = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        // Encontra a config correspondente ao elemento observado
        const config = relevantSections.find(s =>
          entry.target.matches(s.selector)
        );
        if (!config || fired.has(config.selector)) return;

        fired.add(config.selector);
        observer.unobserve(entry.target);

        Analytics.track(config.event, {
          event_category: config.category,
          event_label:    config.label,
          page_path:      currentPath,
          user_type:      userType,
        });
      });
    },
    { threshold: 0.3 } // 30% da seção visível para disparar
  );

  // Tenta observar imediatamente (seções já no DOM)
  function attachObservers() {
    relevantSections.forEach(({ selector }) => {
      const el = document.querySelector(selector);
      if (el && !el.dataset.analyticsObserved) {
        el.dataset.analyticsObserved = 'true';
        observer.observe(el);
      }
    });
  }

  attachObservers();
  window.addEventListener('load', attachObservers);

  // MutationObserver: captura seções inseridas por Web Components
  const mutObs = new MutationObserver(attachObservers);
  mutObs.observe(document.body, { childList: true, subtree: true });

  // Para de observar mutações após 6s (componentes já devem ter carregado)
  setTimeout(() => mutObs.disconnect(), 6000);
}

// ─── 5. Delegação de Eventos de Clique ───────────────────────────────────────

/**
 * Listener único no document para capturar cliques em elementos interativos.
 * Cobertos: portfólio, serviços, artigos externos, e-mail, LinkedIn.
 *
 * @param {string} userType - 'new' ou 'returning'
 */
function initClickTracking(userType) {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('a, button, [data-track]');
    if (!target) return;

    const href = target.getAttribute('href') || '';
    const text = (target.textContent || '').trim().slice(0, 100);

    // ── Cards de Portfólio (galeria de projetos) ──────────────────────────
    // Cobre os links <a href="adidas.html"> e <a href="cpfl-energia.html">
    // dentro do .ctr-gallery (index.html)
    const galleryLink = target.closest('.ctr-gallery a[href]');
    if (galleryLink) {
      const titleEl  = galleryLink.querySelector('.title');
      const projectTitle = titleEl?.textContent?.trim() || galleryLink.getAttribute('href');
      Analytics.portfolioOpen(projectTitle, galleryLink.getAttribute('href') || '');
      return;
    }

    // ── Cards de Serviços ─────────────────────────────────────────────────
    const serviceCard = target.closest('.ctr-services .card');
    if (serviceCard) {
      const serviceName = serviceCard.querySelector('.title')?.textContent?.trim() || text;
      Analytics.serviceOpen(serviceName);
      return;
    }

    // ── Links de Artigos externos ─────────────────────────────────────────
    // Detecta cliques nos botões "Leia mais" do .ctr-article
    const articleLink = target.closest('.ctr-article a[target="_blank"]');
    if (articleLink) {
      const articleHref  = articleLink.getAttribute('href') || '';
      // Extrai o domínio do portal como identificador do artigo
      let portal = 'externo';
      try { portal = new URL(articleHref).hostname.replace('www.', ''); } catch (_) {}
      Analytics.track('article_click', {
        event_category: 'engagement',
        event_label:    `Artigo: ${portal}`,
        article_url:    articleHref,
        user_type:      userType,
      });
      return;
    }

    // ── Links de E-mail ───────────────────────────────────────────────────
    if (href.startsWith('mailto:')) {
      Analytics.contactEmail(_detectSection(target));
      return;
    }

    // ── Links de LinkedIn ─────────────────────────────────────────────────
    if (href.includes('linkedin.com')) {
      Analytics.contactLinkedIn(_detectSection(target));
      return;
    }

    // ── Atributo genérico data-track para elementos futuros ───────────────
    if (target.dataset.track) {
      Analytics.track(target.dataset.track, {
        event_category: 'engagement',
        element_text:   text,
        element_href:   href,
        user_type:      userType,
      });
    }
  });
}

// ─── 6. Rastreamento de Formulários ──────────────────────────────────────────

/**
 * Captura submissão de qualquer formulário na página.
 */
function initFormTracking() {
  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const formId = form.id || form.name || form.action || 'formulario-sem-id';
    Analytics.formSubmit(formId);
  });
}

// ─── Utilitário ───────────────────────────────────────────────────────────────

/**
 * Retorna o id da seção/elemento pai mais próximo do elemento clicado.
 * @param {Element} el
 * @returns {string}
 */
function _detectSection(el) {
  const section = el.closest('section[id], header, footer, [id]');
  if (!section) return 'unknown';
  return section.id || section.tagName.toLowerCase();
}

// ─── Inicializador Principal ──────────────────────────────────────────────────

/**
 * Ponto de entrada: chamado pelo main.js após componentes carregados.
 *
 * Ordem de execução:
 *   1. Resolve user_type (new / returning) via localStorage
 *   2. Dispara page_view com user_type incluso
 *   3. Ativa scroll depth tracking
 *   4. Ativa time on page tracking
 *   5. Ativa section visibility tracking (todas as páginas)
 *   6. Ativa click delegation
 *   7. Ativa form tracking
 */
export function initTracking() {
  // 1. Identifica o tipo de usuário UMA vez por sessão de execução
  const userType = resolveUserType();

  // 2. Dispara page_view com user_type
  Analytics.pageView(userType);

  // 3–7. Inicializa todos os rastreamentos passando userType
  initScrollTracking(userType);
  initTimeTracking(userType);
  initSectionVisibilityTracking(userType);
  initClickTracking(userType);
  initFormTracking();
}
