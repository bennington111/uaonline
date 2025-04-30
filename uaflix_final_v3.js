// ==UserScript==
// @name        Uaflix
// @namespace   uaflix
// @version     3.9.1
// @description Плагін для перегляду фільмів з Uaflix
// @author      YourName
// @match       *://*/*
// @grant       none
// @icon        https://uafix.net/favicon.ico
// ==/UserScript==

(function () {
    if (!window.Lampa || !Lampa.Listener || !Lampa.Storage) return;

    const plugin_name = 'uaflix';

    function proxyFetch(url) {
        return fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    }

    async function searchMovie(title) {
        const searchUrl = `https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title)}`;
        console.log('🔍 UAFlix search URL:', searchUrl);

        const searchHtml = await proxyFetch(searchUrl).then(r => r.text());
        const dom = new DOMParser().parseFromString(searchHtml, 'text/html');
        const linkEl = dom.querySelector('.ml-mask a');

        if (!linkEl) throw new Error('Не знайдено результатів');

        const href = linkEl.href;
        return href.startsWith('http') ? href : 'https://uafix.net' + href;
    }

    async function extractIframeUrl(pageUrl) {
        console.log('🔍 UAFlix film page URL:', pageUrl);

        const html = await proxyFetch(pageUrl).then(r => r.text());
        const dom = new DOMParser().parseFromString(html, 'text/html');
        const iframe = dom.querySelector('iframe');

        if (!iframe) throw new Error('Плеєр не знайдено');

        console.log('🎬 UAFlix iframe URL:', iframe.src);
        return iframe.src;
    }

    function loadOnline(movie) {
        const title = movie.original_title || movie.name || movie.original_name || movie.title;

        Lampa.Activity.push({
            url: '',
            title: 'UAFlix',
            component: 'online',
            search: title,
            search_one: title,
            movie: movie,
            page: 1,
            ready: async function () {
                this.activity.loader(true);

                try {
                    const pageUrl = await searchMovie(title);
                    const iframeUrl = await extractIframeUrl(pageUrl);

                    this.activity.loader(false);

                    Lampa.Player.play({
                        title: title,
                        url: iframeUrl,
                        method: 'embed'
                    });

                } catch (err) {
                    this.activity.loader(false);
                    Lampa.Noty.show('Не вдалося знайти плеєр');
                    console.error('UAFlix error:', err);
                }
            }
        });
    }

    function addButton() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite' || !e.data || !e.data.movie) return;

            // Перевірка, чи кнопка вже додана
            if (e.object.activity.render().find('.view--ua_flix').length) return;

            const button = $(`
                <div class="full-start__button selector view--ua_flix" data-subtitle="UAFlix">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z"/>
                    </svg>
                    <span>UAFlix</span>
                </div>
            `);

            button.on('hover:enter', function () {
                loadOnline(e.data.movie);
            });

            // Вставляємо кнопку після блоку "Торренти"
            const target = e.object.activity.render().find('.view--torrent');
            if (target.length) target.after(button);
        });
    }

    function init() {
        if (window.Plugin && typeof window.Plugin.register === 'function') {
            window.Plugin.register(plugin_name, {
                init: () => {},
                run: () => {},
                stop: () => {}
            });
        }

        addButton();
    }

    init();
})();
