(function(){
    var mod_version = 'v0.2';
    var mod_title = 'UAFlix';

    var button = `
    <div class="full-start__button selector view--ua_flix" data-subtitle="UAFlix ${mod_version}">
        <svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z"/></svg>
        <span>${mod_title}</span>
    </div>`;

    function proxyFetch(url){
        return fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    }

    async function searchMovie(title){
        const searchUrl = `https://uafix.net/search?q=${encodeURIComponent(title)}`;
        const searchHtml = await proxyFetch(searchUrl).then(r => r.text());
        
        const dom = new DOMParser().parseFromString(searchHtml, 'text/html');
        const linkEl = dom.querySelector('.ml-mask a');

        if (!linkEl) throw new Error('Не знайдено результатів');

        const href = linkEl.href;
        return href.startsWith('http') ? href : 'https://uafix.net' + href;
    }

    async function extractIframeUrl(pageUrl){
        const html = await proxyFetch(pageUrl).then(r => r.text());
        const dom = new DOMParser().parseFromString(html, 'text/html');
        const iframe = dom.querySelector('iframe');

        if (!iframe) throw new Error('Плеєр не знайдено');

        return iframe.src;
    }

    function loadOnline(movie){
        const title = movie.original_title || movie.name || movie.original_name || movie.title;

        Lampa.Activity.push({
            url: '',
            title: mod_title,
            component: 'online',
            search: title,
            search_one: title,
            movie: movie,
            page: 1,
            ready: async function(){
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

                } catch (err){
                    this.activity.loader(false);
                    Lampa.Noty.show('Не вдалося знайти плеєр');
                    console.error('UAFlix error:', err);
                }
            }
        });
    }

    Lampa.Listener.follow('full', function (e) {
        if (e.type == 'complite') {
            var btn = $(button);
            btn.on('hover:enter', function () {
                loadOnline(e.data.movie);
            });
            e.object.activity.render().find('.view--torrent').after(btn);
        }
    });

    console.log('✅ UAFlix plugin with search loaded');
})();
