// ==UserScript==
// @name        KinoUkr Multi-source Player with Custom Modal
// @namespace   kinoukr
// @version     1.1
// @description Пошук і вибір джерела відео з kinoukr.com для Lampa з власним модальним вікном пошуку
// @author      YourName
// @icon        https://kinoukr.com/favicon.ico
// ==/UserScript==

(function () {
    const mod_version = '1.1';
    const mod_id = 'kinoukr_multi_source_custom_modal';

    const manifest = {
        version: mod_version,
        id: mod_id,
        name: 'KinoUkr Multi-source Custom Modal',
        description: 'Пошук і вибір джерела відео з kinoukr.com з власним модальним вікном',
        type: 'video',
        component: 'online',
        proxy: true
    };

    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push(manifest);

    const proxy = 'https://cors.apn.monster/';

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            const movie = e.data.movie;
            console.log('[KinoUkr] movie:', movie);

            const button_html = `
                <div class="full-start__button selector view--kinoukr" data-subtitle="KinoUkr Multi-source ${mod_version}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                        <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                        M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                        M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                    </svg>
                    <span>KinoUkr Multi-source</span>
                </div>`;

            const btn = $(button_html);
            $('.full-start__button').last().after(btn);

            btn.on('hover:enter', () => {
                console.log('KinoUkr Multi-source: Кнопка натиснута');
                openSearchPrompt(movie.title || movie.name);
            });
        }
    });

    function openSearchPrompt(initialValue, onSubmit) {
        const html = `
            <div style="padding:15px;">
                <input id="search_input" type="text" style="width:100%; padding:10px; font-size:16px;" value="${initialValue || ''}" placeholder="Введіть назву фільму">
                <button id="search_btn" style="margin-top:10px; width:100%; padding:10px; font-size:16px;">Пошук</button>
            </div>
        `;

        Lampa.Modal.open({
            title: 'Пошук фільму',
            html,
            onOpen: () => {
                const input = document.getElementById('search_input');
                const btn = document.getElementById('search_btn');

                btn.addEventListener('click', () => {
                    const val = input.value.trim();
                    if (val) {
                        Lampa.Modal.close();
                        onSubmit(val);
                    }
                });

                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        btn.click();
                    }
                });

                input.focus();
            }
        });
    }

    async function searchFilms(query) {
        const searchUrl = `https://kinoukr.com/index.php?do=search&subaction=search&story=${encodeURIComponent(query)}`;
        console.log('[KinoUkr] Пошук:', searchUrl);

        const resp = await fetch(proxy + searchUrl);
        const html = await resp.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const items = Array.from(doc.querySelectorAll('.post-title a'));

        return items.map(a => ({
            title: a.textContent.trim(),
            url: a.href || a.getAttribute('href')
        }));
    }

    function showResults(results) {
        const html = results.map((r, i) => `<div class="search-item" data-index="${i}" style="padding:8px;cursor:pointer;border-bottom:1px solid #555;">${r.title}</div>`).join('');
        Lampa.Modal.open({
            title: 'Виберіть фільм',
            html,
            onClick: async (e) => {
                const el = e.target.closest('.search-item');
                if (!el) return;
                const idx = Number(el.dataset.index);
                if (idx >= 0 && results[idx]) {
                    Lampa.Modal.close();
                    try {
                        await playSources(results[idx].url, results[idx].title);
                    } catch (err) {
                        Lampa.Noty.show('Помилка відтворення відео');
                        console.error(err);
                    }
                }
            }
        });
    }

    async function playSources(filmPageUrl, title) {
        if (!filmPageUrl.startsWith('http')) {
            filmPageUrl = 'https://kinoukr.com' + (filmPageUrl.startsWith('/') ? '' : '/') + filmPageUrl;
        }
        console.log('[KinoUkr] Отримуємо сторінку фільму:', filmPageUrl);

        const resp = await fetch(proxy + filmPageUrl);
        const html = await resp.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const links = [];

        doc.querySelectorAll('a[href]').forEach(a => {
            const href = a.href || a.getAttribute('href');
            if (/^(https?:)?\/\/(ashdi\.vip|tortuga\.tw|.+)$/i.test(href)) {
                links.push(href.startsWith('http') ? href : 'https:' + href);
            }
        });

        if (!links.length) {
            throw new Error('Джерела відео не знайдено');
        }

        showVideoSources(links, title);
    }

    function showVideoSources(sources, title) {
        const html = sources.map((url, i) => `<div class="source-item" data-index="${i}" style="padding:8px;cursor:pointer;border-bottom:1px solid #555;">Джерело ${i + 1}: ${url}</div>`).join('');
        Lampa.Modal.open({
            title: `Виберіть джерело відео: ${title}`,
            html,
            onClick: (e) => {
                const el = e.target.closest('.source-item');
                if (!el) return;
                const idx = Number(el.dataset.index);
                if (idx >= 0 && sources[idx]) {
                    Lampa.Modal.close();
                    Lampa.Player.play({
                        url: sources[idx],
                        title: title,
                        type: 'embed'
                    });
                }
            }
        });
    }

})();
