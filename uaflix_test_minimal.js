(function () {
    const mod_id = 'uaflix_test';

    const manifest = {
        version: '0.0.1',
        id: mod_id,
        name: 'UAFlix Test',
        description: 'Тестова кнопка для перевірки роботи плагіна',
        type: 'video',
        component: 'online',
        proxy: false
    };

    Lampa.Manifest.plugins = Lampa.Manifest.plugins || [];
    Lampa.Manifest.plugins.push(manifest);

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            const button = $(`<div class="full-start__button selector view--uaflix" data-subtitle="test">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor">
                    <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z
                    M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z
                    M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/>
                </svg>
                <span>UAFlix</span>
            </div>`);

            button.on('hover:enter', function () {
                Lampa.Noty.show('Натиснуто UAFlix');
            });

            const interval = setInterval(() => {
                const container = $('.full-start__buttons');
                if (container.length && container.find('.view--uaflix').length === 0) {
                    clearInterval(interval);
                    container.append(button);
                }
            }, 500);
        }
    });
})();
