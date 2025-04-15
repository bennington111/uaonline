(function () {
    function addSourceButton() {
        // Ініціалізуємо модуль, щоб зʼявився блок "Онлайн"
        Lampa.Module.add({
            component: 'online',
            name: 'Онлайн UA Online',
            condition: () => true,
            onSearch: function (query, callback) {
                callback([]);
            },
            onCancel: function () {}
        });

        // Додаємо кнопку джерела
        Lampa.Source.add('uaonline', {
            name: 'UA Online',
            type: 'video',
            active: true,
            where: ['movie', 'tv'],
            translate: 'ua',
            on: function (params, callback) {
                // Просто тест — повертає одне джерело
                callback([{
                    title: 'Тестовий стрім',
                    file: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    quality: 'HD',
                    timeline: '',
                    info: 'Demo source',
                }]);
            }
        });
    }

    function startPlugin() {
        // Слухаємо момент відкриття картки — і додаємо кнопку
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') addSourceButton();
        });

        console.log('UA Online Plugin active');
    }

    // Чекаємо на Lampa
    if (window.Lampa) startPlugin();
    else document.addEventListener('DOMContentLoaded', startPlugin);
})();
