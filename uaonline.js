(function () {
    if (!window.Lampa || !Lampa.Listener) return;

    console.log('[UAOnline] Плагін завантажено');

    const buttonHTML = `
        <div class="selectbox-item selectbox-item--icon selector uaonline--button">
            <div class="selectbox-item__icon">
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M10 15l5.19-3L10 9v6zm-8 4V5a2 2 0 012-2h16a2 2 0 012 2v14a2 2 0 01-2 2H4a2 2 0 01-2-2z"/></svg>
            </div>
            <div class="selectbox-item__title">Онлайн UA Online</div>
        </div>`;

    function addButton({ render, movie }) {
        if (render.find('.uaonline--button').length) return;

        const btn = $(buttonHTML);

        btn.on('hover:enter', () => {
            console.log('[UAOnline] Натискання кнопки, фільм:', movie);

            const id = Lampa.Utils.hash(movie.number_of_seasons ? movie.original_name : movie.original_title);
            const all = Lampa.Storage.get('clarification_search', '{}');

            Lampa.Activity.push({
                url: '',
                title: Lampa.Lang.translate('title_online'),
                component: 'uaonline',
                search: all[id] ? all[id] : movie.title,
                search_one: movie.title,
                search_two: movie.original_title,
                movie: movie,
                page: 1,
                clarification: !!all[id]
            });
        });

        render.after(btn);
    }

    Lampa.Listener.follow('full', (e) => {
        if (e.type === 'complite') {
            addButton({
                render: e.object.activity.render().find('.view--torrent'),
                movie: e.data.movie
            });
        }
    });

    // Безпечна перевірка, якщо вже відкритий фільм
    try {
        const active = Lampa.Activity.active();
        if (active && active.component === 'full' && active.activity && active.card) {
            addButton({
                render: active.activity.render().find('.view--torrent'),
                movie: active.card
            });
        }
    } catch (err) {
        console.warn('[UAOnline] Помилка при перевірці активності:', err);
    }

})();
