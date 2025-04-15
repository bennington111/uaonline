(function () {
    const button_html = `<div class="selectbox-item selectbox-item--icon selector uaonline--button">
        <div class="selectbox-item__icon">
            <img src="https://raw.githubusercontent.com/bennington111/uaonline/main/icon.png" />
        </div>
        <div class="selectbox-item__name">Онлайн UA Online</div>
    </div>`;

    const component = {
        create: function () {
            this.component = $('<div class="uaonline-component">Завантаження джерел UA Online...</div>');
            this.start();
        },
        start: function () {
            this.component.append('<div style="padding:2em;color:white;">(Тут буде логіка підвантаження джерел з uakino / uaserials)</div>');
        },
        pause: function () {},
        stop: function () {},
        render: function () {
            return this.component;
        }
    };

    function addButton(e) {
        try {
            if (!e || !e.render || !e.movie) return;
            if (e.render.find('.uaonline--button').length) return;

            const btn = $(Lampa.Lang.translate(button_html));
            btn.on('hover:enter', function () {
                Lampa.Component.add('uaonline', component);

                const id = Lampa.Utils.hash(e.movie.number_of_seasons ? e.movie.original_name : e.movie.original_title);
                const all = Lampa.Storage.get('clarification_search', '{}');

                Lampa.Activity.push({
                    url: '',
                    title: 'UA Online',
                    component: 'uaonline',
                    search: all[id] ? all[id] : e.movie.title,
                    search_one: e.movie.title,
                    search_two: e.movie.original_title,
                    movie: e.movie,
                    page: 1,
                    clarification: all[id] ? true : false
                });
            });

            e.render.after(btn);
        } catch (err) {
            console.error('[UAOnline] Помилка при додаванні кнопки:', err);
        }
    }

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            try {
                const renderBox = e.object?.activity?.render()?.find('.view--torrent');
                if (renderBox && renderBox.length) {
                    addButton({
                        render: renderBox,
                        movie: e.data.movie
                    });
                }
            } catch (err) {
                console.error('[UAOnline] Помилка в Listener full:', err);
            }
        }
    });

    try {
        const active = Lampa.Activity.active();
        const renderBox = active?.activity?.render()?.find('.view--torrent');
        if (active && active.component === 'full' && renderBox?.length && active.card) {
            addButton({
                render: renderBox,
                movie: active.card
            });
        }
    } catch (err) {
        console.error('[UAOnline] Помилка при ініціалізації:', err);
    }

    console.log('[UAOnline] Плагін завантажено');
})();
