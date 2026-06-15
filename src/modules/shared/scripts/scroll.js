export function checkAndScrollToHash() {
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