(function () {
    function addSourceButton() {
        // Ініціалізація online-модуля
        Lampa.Module.add({
            component: 'online',
            name: 'Онлайн UA Online',
            condition: () => true,
            onSearch: function (query, callback) {
                // Lampa потребує виклику callback хоча б раз
                callback([]);
            },
            onCancel: function () {},
            onItem: function (element, data, callback) {
                // Порожнє джерело — але це активує кнопку
                callback([]);
            }
        });
    }

    // Додаємо із затримкою, щоб всі залежності точно були ініціалізовані
    setTimeout(addSourceButton, 2000);
})();
