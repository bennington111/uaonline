// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     1.4
// @description Плагін для перегляду фільмів з Ua джерел
// @author      You
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function () {
    const mod_id = 'uaflix';
    const mod_version = '1.0.1';

    const manifest = {
        version: mod_version,
        id: mod_id,
        name: 'UAFlix',
        description: 'Перегляд з сайту UAFlix (uafix.net)',
        type: 'video',
        component: 'online',
        proxy: true
    };

    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push(manifest);

    console.log('[Uaflix] Плагін завантажено');

    function addSourceButton() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                const button_html = `
                <div class="full-start__button selector view--uaflix" data-subtitle="uaflix ${mod_version}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                        <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                        M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                        M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                    </svg>
                    <span>UAFlix</span>
                </div>`;

                const btn = $(button_html);

                btn.on('hover:enter', function () {
                    Lampa.Activity.push({
                        url: '',
                        title: 'UAFlix',
                        component: 'uaflix',
                        id: 'uaflix_view',
                        page: 1
                    });
                });

                $('.full-start__buttons').append(btn);
            }
        });
    }

    function startUaflixComponent() {
        Lampa.Component.add('uaflix', {
            create: function () {
                const activity = this;
                const card = Lampa.Activity.active().data;
                const title = encodeURIComponent(card.original_title || card.name || card.title);

                const searchUrl = `https://uafix.net/index.php?do=search&subaction=search&story=${title}`;

                Lampa.Utils.request(searchUrl).then(html => {
                    const doc = new DOMParser().parseFromString(html, 'text/html');
                    const linkElem = doc.querySelector('.th-item > a');

                    if (!linkElem) {
                        Lampa.Noty.show('Не знайдено на UAFlix');
                        activity.destroy();
                        return;
                    }

                    const filmUrl = linkElem.href;

                    Lampa.Utils.request(filmUrl).then(filmHtml => {
                        const filmDoc = new DOMParser().parseFromString(filmHtml, 'text/html');
                        const iframe = filmDoc.querySelector('iframe');

                        if (!iframe) {
                            Lampa.Noty.show('Не знайдено iframe');
                            activity.destroy();
                            return;
                        }

                        const iframeSrc = iframe.src;

                        Lampa.Utils.request(iframeSrc).then(playerHtml => {
                            const m3u8Match = playerHtml.match(/(https?:\/\/[^\s'"<>]+\.m3u8)/);

                            if (!m3u8Match) {
                                Lampa.Noty.show('Посилання на потік не знайдено');
                                activity.destroy();
                                return;
                            }

                            const playlist = [
                                {
                                    title: 'UAFlix',
                                    url: m3u8Match[1]
                                }
                            ];

                            const object = {
                                title: card.title,
                                playlist: playlist
                            };

                            const component = new Lampa.Video(object);
                            component.create();

                        }).catch(err => {
                            console.error('[Uaflix] Не вдалося завантажити iframe:', err);
                            Lampa.Noty.show('Помилка iframe');
                            activity.destroy();
                        });
                    }).catch(err => {
                        console.error('[Uaflix] Помилка при відкритті фільму:', err);
                        Lampa.Noty.show('Помилка фільму');
                        activity.destroy();
                    });
                }).catch(err => {
                    console.error('[Uaflix] Помилка пошуку:', err);
                    Lampa.Noty.show('Помилка пошуку');
                    activity.destroy();
                });
            }
        });
    }

    addSourceButton();
    startUaflixComponent();
})();
