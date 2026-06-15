const LANG_KEY = 'portfolio-lang';
const DEFAULT_LANG = 'pt';

class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
        this.translations = {};
        this.observer = null;
        this.initPromise = null;
    }

    init() {
        if (!this.initPromise) {
            this.initPromise = (async () => {
                try {
                    const response = await fetch(`src/locales/${this.currentLang}.json`);
                    if (!response.ok) throw new Error(`Could not load translations for ${this.currentLang}`);
                    this.translations = await response.json();
                } catch (error) {
                    console.error('Failed to initialize i18n:', error);
                    // Fallback to default language if not already default
                    if (this.currentLang !== DEFAULT_LANG) {
                        this.currentLang = DEFAULT_LANG;
                        this.initPromise = null;
                        await this.init();
                        return;
                    }
                }

                // Translate page metadata (title, meta tags)
                this.translatePageMeta();

                // Translate static page elements currently in the DOM
                this.translateElement(document.documentElement);

                // Start observing for dynamically added elements
                this.startObserver();

                // Remove loading class to reveal page
                document.documentElement.classList.remove('i18n-loading');
            })();
        }
        return this.initPromise;
    }

    translatePageMeta() {
        const titleKey = 'meta.title';
        const titleTranslation = this.t(titleKey);
        if (titleTranslation && titleTranslation !== titleKey) {
            document.title = titleTranslation;
        }

        const descMeta = document.querySelector('meta[name="description"]');
        const descKey = 'meta.description';
        const descTranslation = this.t(descKey);
        if (descMeta && descTranslation && descTranslation !== descKey) {
            descMeta.setAttribute('content', descTranslation);
        }

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle && titleTranslation && titleTranslation !== titleKey) {
            ogTitle.setAttribute('content', titleTranslation);
        }

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc && descTranslation && descTranslation !== descKey) {
            ogDesc.setAttribute('content', descTranslation);
        }
    }

    t(key) {
        const keys = key.split('.');
        let value = this.translations;
        for (const k of keys) {
            if (value && Object.prototype.hasOwnProperty.call(value, k)) {
                value = value[k];
            } else {
                return key; // return key as fallback
            }
        }
        return value;
    }

    translateElement(element) {
        if (!element || !this.translations || Object.keys(this.translations).length === 0) return;

        // Disconnect observer to avoid infinite loops when modifying text content
        if (this.observer) {
            this.observer.disconnect();
        }

        try {
            if (element.hasAttribute && element.hasAttribute('data-i18n')) {
                this.translateSingle(element);
            }

            if (element.querySelectorAll) {
                const elementsToTranslate = element.querySelectorAll('[data-i18n]');
                elementsToTranslate.forEach(el => this.translateSingle(el));
            }
        } finally {
            // Reconnect observer
            if (this.observer) {
                this.observer.observe(document.documentElement, {
                    childList: true,
                    subtree: true
                });
            }
        }
    }

    translateSingle(el) {
        const key = el.getAttribute('data-i18n');
        if (key) {
            const translation = this.t(key);
            if (translation && translation !== key) {
                if (el.hasAttribute('data-i18n-html')) {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }
            }
        }

        const attrConfig = el.getAttribute('data-i18n-attr');
        if (attrConfig) {
            const [attrName, attrKey] = attrConfig.split(':');
            const attrTranslation = this.t(attrKey);
            if (attrTranslation && attrTranslation !== attrKey) {
                el.setAttribute(attrName, attrTranslation);
            }
        }
    }

    startObserver() {
        if (this.observer) return;

        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.translateElement(node);
                    }
                }
            }
        });

        this.observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    setLanguage(lang) {
        localStorage.setItem(LANG_KEY, lang);
        window.location.reload();
    }
}

// Instantiate globally
window.i18n = new I18nManager();
export const i18n = window.i18n;
