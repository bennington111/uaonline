(function(){
    var mod_version = 'v0.1';
    var mod_title = 'UAFlix';
    
    // кнопка в UI
    var button = `
    <div class="full-start__button selector view--ua_flix" data-subtitle="UAFlix ${mod_version}">
        <svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm0 4h12v2H3v-2z"/></svg>
        <span>${mod_title}</span>
    </div>`;

    function loadOnline(movie){
        console.log('🔍 UAFlix loadOnline:', movie);

        var title = movie.original_title || movie.name || movie.original_name || movie.title;

        Lampa.Activity.push({
            url: '',
            title: mod_title,
            component: 'online',
            search: title,
            search_one: title,
            movie: movie,
            page: 1,
            ready: function(){
                this.activity.loader(false);

                // тут буде парсинг uafix.net і заповнення списку плеєрів
                Lampa.Player.play({
                    title: title,
                    url: 'https://uafix.net', // placeholder
                    method: 'embed'
                });
            }
        });
    }

    // Додавання кнопки при завантаженні сторінки фільму
    Lampa.Listener.follow('full', function (e) {
        if (e.type == 'complite') {
            var btn = $(button);
            btn.on('hover:enter', function () {
                loadOnline(e.data.movie);
            });

            e.object.activity.render().find('.view--torrent').after(btn);
        }
    });

    console.log('✅ UAFlix plugin loaded');
})();
