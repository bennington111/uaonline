(function () {
    if (typeof Lampa === 'undefined') {
        alert('Lampa ще не готова');
        return;
    }

    console.log('✅ Плагін UA Online підключено');

    // Додаємо пустий онлайн-модуль для активації секції "Онлайн"
    Lampa.Module.add({
        component: 'online',
        name: 'uaonline_init',
        type: 'video',
        onSearch: function (query, call) {
            console.log('🔍 onSearch запит, повертаємо пусто');
            call([]);
        },
        onDetails: function (url, call) {
            console.log('📄 onDetails запит, повертаємо пусто');
            call([]);
        }
    });

    function addSourceButton() {
        const source = {
            title: 'Онлайн UA Online',
            url: '',
            module: 'uaonline',
            name: 'UA Online',
            supported: ['movie', 'tv'],
            onClick: function (item, data) {
                alert('Натиснуто кнопку UA Online для: ' + item.name);
                // Тут можна викликати завантаження джерел
            }
        };

        // Додаємо джерело
        if (Lampa.Player && typeof Lampa.Player.addSource === 'function') {
            Lampa.Player.addSource(source);
            console.log('🎯 Джерело UA Online додано');
        } else {
            console.warn('⚠️ Lampa.Player.addSource не знайдено');
        }
    }

    // Коли все готово
    Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') {
            addSourceButton();
        }
    });
})();
