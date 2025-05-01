// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     3.0
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function () {
    const button_html = `
    <div class="full-start__button selector view--uaflix" data-subtitle="UAFlix">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
            <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
            M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
            M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
        </svg>
        <span>UAFlix</span>
    </div>`;

    let button;

    function waitForElement(selector, callback) {
        const interval = setInterval(() => {
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(interval);
                callback(el);
            }
        }, 500);
    }

    function addButton() {
        waitForElement('.full-start__buttons', (container) => {
            if (!container.querySelector('.view--uaflix')) {
                container.insertAdjacentHTML('beforeend', button_html);
                button = container.querySelector('.view--uaflix');
                bindButtonClick(button);
            }
        });
    }

    function bindButtonClick(btn) {
        btn.addEventListener('click', () => {
            const activity = Lampa.Activity.active();
            const data = activity?.data || {};
            const title = data.title || data.name;
            if (!title) {
                Lampa.Noty.show('Назва не знайдена');
                return;
            }

            Lampa.Noty.show('Пошук на UAFlix...');

            searchUAFlix(title).then(url => {
                if (!url) {
                    Lampa.Noty.show('Не знайдено');
                    return;
                }

                getStream(url).then(link => {
                    if (link) {
                        Lampa.Player.play(link, title);
                    } else {
                        Lampa.Noty.show('Не вдалося отримати відео');
                    }
                });
            });
        });
    }

    async function searchUAFlix(query) {
        const url = 'https://corsproxy.io/?' + encodeURIComponent('https://uafix.net/index.php?do=search');
        const formData = new URLSearchParams();
        formData.append('do', 'search');
        formData.append('subaction', 'search');
        formData.append('story', query);

        const res = await fetch(url, {
            method: 'POST',
            body: formData
        });

        const text = await res.text();
        const html = document.createElement('div');
        html.innerHTML = text;

        const result = html.querySelector('.sres-wrap a');
        if (!result) return null;

        const href = result.getAttribute('href');
        return href.startsWith('http') ? href : 'https://uafix.net' + href;
    }

    async function getStream(filmUrl) {
        const corsUrl = 'https://corsproxy.io/?' + encodeURIComponent(filmUrl);
        const res = await fetch(corsUrl);
        const text = await res.text();

        const match = text.match(/<video[^>]+src="([^"]+\.m3u8)"/);
        if (match) return match[1];

        return null;
    }

    Lampa.Listener.follow('full', (e) => {
        if (e.type === 'complite') {
            addButton();
        }
    });
})();
