(function () {
    console.log('[UAOnline] Старт плагіна');

    function waitForModuleReady(callback) {
        if (typeof Lampa === 'undefined' || typeof Lampa.Module === 'undefined') {
            console.log('[UAOnline] Lampa або Lampa.Module ще не готовий, чекаємо...');
            setTimeout(() => waitForModuleReady(callback), 500);
        } else {
            console.log('[UAOnline] Lampa.Module готовий');
            callback();
        }
    }

    function addSourceModule() {
        console.log('[UAOnline] Додаємо пустий модуль для активації секції "Онлайн"');
        Lampa.Module.add({
            component: 'online',
            name: 'Онлайн UA Online',
            condition: () => true,
            onSearch: function (query, callback) {
                callback([]); // нічого не повертаємо — лише для активації блоку
            },
            onCancel: function () {}
        });
    }

    function addSourceButton() {
        console.log('[UAOnline] Додаємо кнопку джерела');
        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') {
                console.log('[UAOnline] Вставляємо кнопку джерела після завантаження сторінки');
                e.object.appendSource({
                    title: 'UA Online',
                    url: '',
                    component: 'uaonline',
                    onClick: () => {
                        console.log('[UAOnline] Натиснуто кнопку джерела');
                        // Тут можна викликати перегляд або інше
                    }
                });
            }
        });
    }

    waitForModuleReady(() => {
        addSourceModule();
        addSourceButton();
    });
})();
