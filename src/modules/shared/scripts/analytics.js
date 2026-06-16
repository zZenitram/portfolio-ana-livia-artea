/**
 * analytics.js — Ana Lívia Artea | Núcleo de Analytics GA4
 * ─────────────────────────────────────────────────────────
 * Responsabilidade: centralizar TODA a comunicação com o GA4.
 * Nenhum outro arquivo chama `gtag()` diretamente — sempre via `Analytics.track()`.
 *
 * Estrutura de funil de conversão rastreado:
 *   Visitante → Portfólio → Contato → LinkedIn/E-mail → Proposta
 *
 * @author  DHAX — Engenharia Frontend
 * @version 1.0.0
 */

// ─── Constantes ──────────────────────────────────────────────────────────────

/**
 * ID de medição do GA4.
 * Substitua pelo ID real disponível em Analytics → Fluxos de dados → ID de medição.
 * Formato: G-XXXXXXXXXX
 */
const GA4_MEASUREMENT_ID = 'G-C3XPSWEWBM';

/**
 * Flag de ambiente: em desenvolvimento (localhost / 127.0.0.1) os eventos
 * são exibidos no console em vez de serem enviados, evitando poluição de dados.
 */
const IS_DEV = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);

// ─── Inicialização ───────────────────────────────────────────────────────────

/**
 * Injeta dinamicamente o script do gtag e configura o GA4.
 * Chamado UMA única vez pelo main.js após o carregamento do DOM.
 *
 * Por que dinâmico? Permite controle programático (ex.: consentimento LGPD)
 * antes de inicializar o rastreamento, e evita bloquear o render inicial.
 */
function _injectGtagScript() {
  if (document.getElementById('ga4-script')) return; // Guard: evita duplicata

  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Inicializa a fila de eventos do gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());

  // Configuração principal: desativa page_view automático para controle manual
  window.gtag('config', GA4_MEASUREMENT_ID, {
    send_page_view: false, // Controlamos manualmente via Analytics.pageView()
    debug_mode: IS_DEV,    // Ativa modo debug no GA4 DebugView quando em dev
  });

  if (IS_DEV) {
    console.info('[Analytics] GA4 inicializado em modo DEV. Eventos serão logados no console.');
  }
}

// ─── Dispatcher central ──────────────────────────────────────────────────────

/**
 * Envia um evento para o GA4.
 * Todos os rastreamentos do site passam por aqui.
 *
 * @param {string} eventName  - Nome do evento GA4 (snake_case, máx. 40 chars)
 * @param {Object} [params={}] - Parâmetros adicionais do evento
 *
 * @example
 * Analytics.track('portfolio_open', { project_name: 'Adidas Brasil' });
 */
function track(eventName, params = {}) {
  // Em dev: log visual detalhado no console para facilitar depuração
  if (IS_DEV) {
    console.log(
      `%c[Analytics] %c${eventName}`,
      'color:#a855f7;font-weight:bold',
      'color:#e879f9;font-weight:bold',
      params
    );
    return; // Não envia para GA4 em desenvolvimento
  }

  if (typeof window.gtag !== 'function') {
    console.warn('[Analytics] gtag não disponível. Evento não enviado:', eventName);
    return;
  }

  window.gtag('event', eventName, params);
}

// ─── Page View ───────────────────────────────────────────────────────────────

/**
 * Envia um evento de visualização de página manualmente.
 * Deve ser chamado após cada carregamento de página (ou mudança de rota).
 *
 * @param {'new'|'returning'} [userType='unknown'] - Tipo de usuário resolvido pelo tracking.js
 *
 * Parâmetros automáticos do GA4 capturados: fonte de tráfego, UTM,
 * referenciador, idioma do navegador, tamanho de tela.
 */
function pageView(userType = 'unknown') {
  const params = {
    page_title:    document.title,
    page_location: window.location.href,
    page_path:     window.location.pathname,
    user_type:     userType,
  };

  if (IS_DEV) {
    console.log('%c[Analytics] page_view', 'color:#a855f7;font-weight:bold', params);
    return;
  }

  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', params);
}

// ─── Eventos de Conversão ────────────────────────────────────────────────────
// Cada função abaixo representa uma micro-conversão no funil da Ana Lívia.
// Marque-as como "Conversões" no GA4: Admin → Eventos → marcar como conversão.

/**
 * Disparado ao enviar qualquer formulário de contato.
 *
 * @param {string} [formId='unknown'] - ID ou nome do formulário
 */
function formSubmit(formId = 'unknown') {
  track('form_submit', {
    event_category: 'conversion',
    event_label: 'Formulário Enviado',
    form_id: formId,
  });
}

/**
 * Disparado quando o usuário entra na seção/página de contato.
 * Indica que o visitante chegou ao fundo do funil.
 *
 * @param {string} [method='scroll'] - Como chegou: 'scroll' | 'nav_click' | 'direct'
 */
function contactPageView(method = 'scroll') {
  track('contact_page_view', {
    event_category: 'engagement',
    event_label: 'Visualizou Contato',
    reach_method: method,
  });
}

/**
 * Disparado quando o usuário abre/navega para um projeto do portfólio.
 *
 * @param {string} projectName - Nome do projeto (ex.: 'Adidas Brasil')
 * @param {string} [projectSlug=''] - Slug da URL do projeto
 */
function portfolioOpen(projectName, projectSlug = '') {
  track('portfolio_open', {
    event_category: 'engagement',
    event_label: `Portfólio: ${projectName}`,
    project_name: projectName,
    project_slug: projectSlug,
  });
}

/**
 * Disparado quando o usuário interage com um card de serviço.
 *
 * @param {string} serviceName - Nome do serviço clicado
 */
function serviceOpen(serviceName) {
  track('service_open', {
    event_category: 'engagement',
    event_label: `Serviço: ${serviceName}`,
    service_name: serviceName,
  });
}

/**
 * Disparado quando o usuário clica em qualquer link de e-mail.
 *
 * @param {string} [source='unknown'] - Seção de origem
 */
function contactEmail(source = 'unknown') {
  track('contact_email', {
    event_category: 'conversion',
    event_label: 'Clique E-mail',
    contact_source: source,
  });
}

/**
 * Disparado quando o usuário clica no link do LinkedIn.
 *
 * @param {string} [source='unknown'] - Seção de origem
 */
function contactLinkedIn(source = 'unknown') {
  track('contact_linkedin', {
    event_category: 'engagement',
    event_label: 'Clique LinkedIn',
    contact_source: source,
  });
}

// ─── Exportações ─────────────────────────────────────────────────────────────

/**
 * API pública do módulo de analytics.
 * Use sempre `Analytics.metodo()` nos outros módulos.
 */
export const Analytics = {
  init: _injectGtagScript,
  pageView,
  track,

  // Conversões
  formSubmit,
  contactPageView,
  portfolioOpen,
  serviceOpen,
  contactEmail,
  contactLinkedIn,
};
