const THEME_KEY = 'portfolio-theme';
const DEFAULT_THEME = 'light-mode';

function getSavedTheme() {
    return localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
}

function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}

function applyTheme(theme) {
    const body = document.body;
    body.classList.remove('light-mode', 'dark-mode');
    body.classList.add(theme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme i');
    if (icon && window.lucide) {
        const iconName = theme === 'dark-mode' ? 'moon' : 'sun';
        icon.setAttribute('data-lucide', iconName);
        window.lucide.createIcons();
    }
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    const isDark = body.classList.toggle('dark-mode');
    const newTheme = isDark ? 'dark-mode' : 'light-mode';

    saveTheme(newTheme);
    updateThemeIcon(newTheme);
    return newTheme;
}

function initThemeIcon(theme) {
    const themeButton = document.querySelector('#theme');
    if (themeButton) {
        updateThemeIcon(theme);
    } else {
        setTimeout(() => initThemeIcon(theme), 50);
    }
}

export function initThemeChange() {
    const savedTheme = getSavedTheme();

    applyTheme(savedTheme);
    initThemeIcon(savedTheme);

    document.addEventListener('click', (event) => {
        if (event.target.closest('#theme')) toggleTheme();
    });
}
