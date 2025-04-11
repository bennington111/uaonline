(function () {
    const uaonline = {
        type: 'video',
        name: 'UA Online',
        version: '1.0.0',
        icon: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
        description: 'Пошук фільмів та серіалів з українських джерел (uakino, uaserials)',

        search: async function (query, onSearchResult) {
            const results = [];

            // uakino
            try {
                const html = await fetch(`https://uakino.me/index.php?do=search&subaction=search&story=${encodeURIComponent(query)}`).then(r => r.text());
                const doc = new DOMParser().parseFromString(html, 'text/html');
                doc.querySelectorAll('.short .title a').forEach(el => {
                    results.push({
                        title: el.textContent.trim() + ' (uakino)',
                        url: el.href,
                        poster: '',
                        description: '',
                        quality: '',
                        type: 'video'
                    });
                });
            } catch (e) {
                console.error('[UA Online] uakino error:', e);
            }

            // uaserials
            try {
                const html = await fetch(`https://uaserials.pro/search?query=${encodeURIComponent(query)}`).then(r => r.text());
                const doc = new DOMParser().parseFromString(html, 'text/html');
                doc.querySelectorAll('.ser-thumbnail').forEach(el => {
                    const link = el.querySelector('a');
                    const img = el.querySelector('img');
                    results.push({
                        title: img?.alt?.trim() + ' (uaserials)',
                        url: link?.href,
                        poster: img?.src || '',
                        description: '',
                        quality: '',
                        type: 'video'
                    });
                });
            } catch (e) {
                console.error('[UA Online] uaserials error:', e);
            }

            onSearchResult(results);
        },

        item: async function (item, onItemReady) {
            try {
                const html = await fetch(item.url).then(r => r.text());
                const iframe = html.match(/<iframe[^>]+src=["']([^"']+)["']/);
                if (iframe && iframe[1]) {
                    onItemReady([{
                        file: iframe[1],
                        title: 'UA Online',
                        url: iframe[1],
                        type: 'video'
                    }]);
                } else {
                    onItemReady([]);
                }
            } catch (e) {
                console.error('[UA Online] item error:', e);
                onItemReady([]);
            }
        }
    };

    if (window.plugin) window.plugin(uaonline);
    else window.addEventListener('plugin', () => window.plugin(uaonline));
})();
