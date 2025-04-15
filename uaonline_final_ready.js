(function () {
    console.log('[UAOnline] Старт плагіна');

    function waitForLampaReady(callback) {
        if (typeof Lampa === 'undefined' || typeof Lampa.isReady !== 'function' || !Lampa.isReady()) {
            console.log('[UAOnline] Lampa ще не готова (через isReady), чекаємо...');
            setTimeout(() => waitForLampaReady(callback), 500);
        } else {
            console.log('[UAOnline] Lampa повністю готова');
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
                callback([]);
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
                    }
                });
            }
        });
    }

    waitForLampaReady(() => {
        addSourceModule();
        addSourceButton();
    });
})();
