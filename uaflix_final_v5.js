// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     2.1
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

(function () {
    function addSourceButton() {
        const btn = $('<div class="full-start__button selector view--uaflix"><div class="full-start__button-icon"><i class="fab fa-uaf"></i></div><div class="full-start__button-name">Онлайн UAFlix</div></div>');

        btn.on('click', function () {
            let title = Lampa.Activity.active().data.title;
            if (!title) return;

            Lampa.Noty.show('Пошук на UAFlix...');

            searchOnUAFlix(title).then(url => {
                if (!url) {
                    Lampa.Noty.show('Нічого не знайдено на UAFlix');
                    return;
                }

                getPlayerLink(url).then(m3u8 => {
                    if (m3u8) {
                        Lampa.Player.play(m3u8, title);
                    } else {
                        Lampa.Noty.show('Не вдалося отримати посилання на плеєр');
                    }
                });
            }).catch(err => {
                console.error('[uaflix] Error:', err);
                Lampa.Noty.show('Помилка при пошуку на UAFlix');
            });
        });

        const interval = setInterval(() => {
            const container = $('.full-start__buttons');
            if (container.length) {
                clearInterval(interval);
                container.append(btn);
            }
        }, 500);
    }

    async function searchOnUAFlix(query) {
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

        const result = html.querySelector('.sres-wrap');
        if (!result) return null;

        const href = result.getAttribute('href');
        return href.startsWith('http') ? href : 'https://uafix.net' + href;
    }

    async function getPlayerLink(filmUrl) {
        const corsUrl = 'https://corsproxy.io/?' + encodeURIComponent(filmUrl);
        const res = await fetch(corsUrl);
        const text = await res.text();

        const match = text.match(/<video[^>]+src="([^"]+\.m3u8)"/);
        if (match) return match[1];

        return null;
    }

    addSourceButton();
})();
