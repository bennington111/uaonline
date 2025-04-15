(function () {
    console.log('[UAOnline] Плагін завантажено');

    Lampa.Module.add({
        component: 'online',
        name: 'Онлайн UA Online',
        condition: () => true,
        onSearch: function (query, callback) {
            callback([]); // порожній список
        },
        onCancel: function () {}
    });

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            console.log('[UAOnline] Вставляємо кнопку');
            e.object.appendSource({
                title: 'UA Online',
                url: '',
                component: 'online', // ← тут змінив
                onClick: function () {
                    console.log('[UAOnline] Натиснуто кнопку джерела');
                }
            });
        }
    });
})();
