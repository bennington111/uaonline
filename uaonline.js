Lampa.Component.add('full', {
    onCreate: function (component) {
        setTimeout(() => {
            try {
                const container = component.render().find('.selectbox');

                if (!container || !container.length) {
                    console.warn('[UAOnline] selectbox не знайдено');
                    return;
                }

                const btn = $(`
                    <div class="selectbox-item selectbox-item--icon selector">
                        <div class="selectbox-item__icon"><i class="fa fa-globe"></i></div>
                        <div class="selectbox-item__title">Онлайн UA Online</div>
                    </div>
                `);

                btn.on('hover:enter', () => {
                    console.log('[UAOnline] Клік на кнопку');
                    Lampa.Activity.push({
                        url: '',
                        title: 'UA Online',
                        component: 'online',
                        search: '',
                        search_one: '',
                        name: 'UA Online'
                    });
                });

                container.append(btn);
                console.log('[UAOnline] Кнопка успішно додана');
            } catch (e) {
                console.error('[UAOnline] Помилка при вставці кнопки:', e);
            }
        }, 1000); // даємо 1 секунду на рендер
    }
});
