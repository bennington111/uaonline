(function(){
    if (!window.app) return;

    function waitForElement(selector, callback, timeout = 10000) {
        const interval = 100;
        const maxTries = timeout / interval;
        let tries = 0;
        const timer = setInterval(() => {
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(timer);
                callback(el);
            } else if (++tries > maxTries) {
                clearInterval(timer);
            }
        }, interval);
    }

    function addSourceButton() {
        waitForElement('.selectbox__content', (container) => {
            const titleEl = container.querySelector('.selectbox__title');
            if (!titleEl || titleEl.textContent.trim() !== 'Джерело') return;

            const scrollBody = container.querySelector('.scroll__body');
            if (!scrollBody) return;

            if (scrollBody.querySelector('[data-uaonline]')) return; // запобігти дублю

            const item = document.createElement('div');
            item.className = 'selectbox-item selectbox-item--icon selector';
            item.setAttribute('data-uaonline', 'true');

            item.innerHTML = `
                <div class="selectbox-item__icon">🌐</div>
                <div>
                    <div class="selectbox-item__title">Онлайн UA</div>
                    <div class="selectbox-item__subtitle">uaonline test</div>
                </div>
            `;

            item.addEventListener('click', () => {
                Lampa.Player.play({
                    title: 'UA Online Example',
                    url: 'https://example.com/stream.m3u8',
                    method: 'play'
                });
            });

            scrollBody.appendChild(item);
            console.log('[UAOnline] Кнопка додана');
        });
    }

    // Очікуємо появу контенту
    const observer = new MutationObserver(() => {
        addSourceButton();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[UAOnline] Ініціалізовано');
})();
