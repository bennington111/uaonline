(function () {
    console.log('[UAOnline] Плагін завантажено');

    function addButton(e) {
        const container = e.object.activity.render().find('.selectbox');

        console.log('[UAOnline] Вставка кнопки в .selectbox, знайдено:', container.length);

        if (!container.length) {
            console.warn('[UAOnline] .selectbox не знайдено');
            return;
        }

        if (container.find('.uaonline--button').length) {
            console.log('[UAOnline] Кнопка вже існує');
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

        container.append(btn);
        console.log('[UAOnline] Кнопку додано в selectbox');
    }

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            console.log('[UAOnline] Картка повністю завантажена', e);
            addButton(e);
        }
    });

    try {
        const active = Lampa.Activity.active();
        if (active && active.component === 'full') {
            console.log('[UAOnline] Активний компонент — full. Пробуємо вставити кнопку одразу.');
            addButton({
                object: active.activity,
                data: { movie: active.card }
            });
        }
    } catch (err) {
        console.error('[UAOnline] Помилка при вставці кнопки одразу:', err);
    }
})();
