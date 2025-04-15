(function () {
    function addSourceButton() {
        if (typeof Lampa === 'undefined' || typeof Lampa.Module === 'undefined') {
            console.log('UAOnline: Lampa.Module не визначено, чекаємо ще раз...');
            setTimeout(addSourceButton, 1000);
            return;
        }

        console.log('UAOnline: Додаємо модуль');

        Lampa.Module.add({
            component: 'online',
            name: 'Онлайн UA Online',
            condition: () => true,
            onSearch: function (query, callback) {
                callback([]);
            },
            onCancel: function () {},
            onItem: function (element, data, callback) {
                callback([]);
            }
        });
    }

    // Перша спроба додати після невеликої затримки
    setTimeout(addSourceButton, 1000);
})();
