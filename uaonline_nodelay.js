(function () {
    console.log('[UAOnline] Плагін завантажено');

    // Реєструємо пустий компонент uaonline, щоб уникнути script error
    Lampa.Module.add({
        component: 'uaonline',
        name: 'Онлайн UA Online',
        condition: () => true,
        onSearch: function (query, callback) {
            console.log('[UAOnline] Пошук (порожній)');
            callback([]); // повертає порожній список
        },
        onCancel: function () {
            console.log('[UAOnline] Скасування пошуку');
        }
    });

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            console.log('[UAOnline] Вставляємо кнопку');
            e.object.appendSource({
                title: 'UA Online',
                url: '',
                component: 'uaonline',
                onClick: function () {
                    console.log('[UAOnline] Натиснуто кнопку джерела');
                }
            });
        }
    });
})();
