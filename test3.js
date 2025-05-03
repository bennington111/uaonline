(function () {
    const mod_version = '1.0.2';
    const mod_id = 'uaflix';

    const manifest = {
        version: mod_version,
        id: mod_id,
        name: 'UAFlix',
        description: 'Перегляд з сайту UAFlix (uafix.net)',
        type: 'video',
        component: 'online',
        proxy: true
    };

    // Реєстрація плагіна в Lampa
    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push(manifest);

    // Додаємо кнопку після повного завантаження сторінки
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite') {
            console.log('UAFlix: Сторінка завантажена, додаємо кнопку');

            // HTML кнопки плагіна
            const button_html = `
            <div class="full-start__button selector view--uaflix">
                <span>UAFlix</span>
            </div>`;
            const btn = $(button_html);
            $('.full-start__button').last().after(btn);

            // Обробка натискання кнопки
            btn.on('click', function(event) {
                event.preventDefault();
                event.stopPropagation();

                console.log('UAFlix: Кнопка натиснута!');
                // Тестова дія: відкриваємо нову вкладку з фільмом
                window.open('https://uafix.net/films/spustoshennja/', '_blank');
            });
        }
    });
})();
