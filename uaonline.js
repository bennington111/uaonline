(function () {
    console.log('[UAOnline] Плагін завантажено');

    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            console.log('[UAOnline] Картка повністю завантажена', e);

            // Пробуємо знайти потрібний блок
            let render = e.object.activity.render().find('.view--torrent');
            console.log('[UAOnline] Пошук .view--torrent:', render.length);

            if (!render.length) {
                console.warn('[UAOnline] .view--torrent не знайдено, шукаємо .full-start__buttons');
                render = e.object.activity.render().find('.full-start__buttons');
                console.log('[UAOnline] Пошук .full-start__buttons:', render.length);
            }

            if (!render.length) {
                console.warn('[UAOnline] Жоден з контейнерів не знайдено — кнопка не буде додана');
                return;
            }

            // Перевірка чи вже існує кнопка
            if (render.find('.uaonline--button').length) {
                console.log('[UAOnline] Кнопка вже існує, пропускаємо вставку');
                return;
            }

            const btn = $(`
                <div class="selectbox-item selectbox-item--icon selector uaonline--button" data-static="UAOnline">
                    <div class="selectbox-item__icon">
                        <svg><use xlink:href="#icon-folder"></use></svg>
                    </div>
                    <div class="selectbox-item__title">UA Online</div>
                </div>
            `);

            btn.on('hover:enter', function () {
                console.log('[UAOnline] Натиснуто кнопку');
                Lampa.Noty.show('UAOnline: натиснуто кнопку');
            });

            render.after(btn);
            console.log('[UAOnline] Кнопку додано');
        }
    });
})();
