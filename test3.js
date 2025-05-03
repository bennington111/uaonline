(function () {
    const mod_version = '1.0.3';
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

            // HTML кнопки плагіна з класами для стилів
            const button_html = `
            <div class="full-start__button selector view--uaflix" data-subtitle="UAFlix ${mod_version}">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
                <span>UAFlix</span>
            </div>`;
            const btn = $(button_html);
            $('.full-start__button').last().after(btn);

            // Додаємо стилі для кнопки
            const style = document.createElement('style');
            style.innerHTML = `
                .view--uaflix {
                    background-color: #2e87f1;
                    color: #fff;
                    padding: 10px 20px;
                    border-radius: 5px;
                    display: inline-block;
                    cursor: pointer;
                }
                .view--uaflix svg {
                    vertical-align: middle;
                    margin-right: 5px;
                }
            `;
            document.head.appendChild(style);

            // Обробка натискання кнопки
            btn.on('click', function(event) {
                event.preventDefault();
                event.stopPropagation();

                console.log('UAFlix: Кнопка натиснута!');

                // Додаткові дії після натискання
                // Відкриваємо нову вкладку з фільмом
                window.open('https://uafix.net/films/spustoshennja/', '_blank');
            });
        }
    });
})();
