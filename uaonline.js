(function () {
    console.log('[UAOnline] Плагін завантажено');

    function addButton(e) {
        if (e.render.find('.uaonline--button').length) return;

        const button = $('<div class="selectbox-item selectbox-item--icon selector uaonline--button">\
            <div class="selectbox-item__icon"><svg width="16" height="16" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"/></svg></div>\
            <div class="selectbox-item__title">Онлайн UA Online</div>\
        </div>');

        button.on('hover:enter', function () {
            console.log('[UAOnline] Натиснуто кнопку UA Online');

            Lampa.Activity.push({
                url: '',
                title: 'UA Online',
                component: 'uaonline',
                search: e.movie.title,
                search_one: e.movie.title,
                search_two: e.movie.original_title,
                movie: e.movie,
                page: 1
            });
        });

        e.render.after(button);
        console.log('[UAOnline] Кнопка додана');
    }

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            addButton({
                render: e.object.activity.render().find('.view--torrent'),
                movie: e.data.movie
            });
        }
    });

    try {
        if (Lampa.Activity.active().component === 'full') {
            addButton({
                render: Lampa.Activity.active().activity.render().find('.view--torrent'),
                movie: Lampa.Activity.active().card
            });
        }
    } catch (err) {
        console.warn('[UAOnline] Помилка при додаванні кнопки:', err);
    }
})();
