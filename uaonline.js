Lampa.Component.add('full', {
    onCreate: function (component) {
        const container = component.render().find('.selectbox');

        if (!container.length) {
            console.warn('[UAOnline] Не знайдено selectbox');
            return;
        }

        const btn = $(`
            <div class="selectbox-item selectbox-item--icon selector">
                <div class="selectbox-item__icon">
                    <i class="fa fa-globe"></i>
                </div>
                <div class="selectbox-item__title">Онлайн UA Online</div>
            </div>
        `);

        btn.on('hover:enter', function () {
            console.log('[UAOnline] Клік по кнопці');
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
        console.log('[UAOnline] Кнопка додана через Component.add');
    }
});
