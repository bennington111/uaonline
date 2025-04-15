(function () {
    console.log('[UAOnline] Плагін завантажено');

    function waitAndAddButton(e, attempt = 0) {
        const container = e.object.activity.render().find('.selectbox');

        console.log(`[UAOnline] Спроба ${attempt} — знайдено .selectbox:`, container.length);

        if (container.length) {
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
        } else if (attempt < 20) {
            setTimeout(() => waitAndAddButton(e, attempt + 1), 100); // Пробуємо ще
        } else {
            console.warn('[UAOnline] .selectbox не зʼявилась після 20 спроб');
        }
    }

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            console.log('[UAOnline] Картка повністю завантажена', e);
            waitAndAddButton(e);
        }
    });

    // Якщо картка вже активна
    try {
        const active = Lampa.Activity.active();
        if (active && active.component === 'full') {
            console.log('[UAOnline] Активна картка є. Пробуємо вставити кнопку одразу.');
            waitAndAddButton({
                object: active.activity,
                data: { movie: active.card }
            });
        }
    } catch (err) {
        console.error('[UAOnline] Помилка під час ранньої вставки кнопки:', err);
    }
})();
