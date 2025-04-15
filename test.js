(function () {
    function waitForModuleInit(callback) {
        if (window.Lampa && Lampa.Module && typeof Lampa.Module.add === 'function') {
            callback();
        } else {
            setTimeout(() => waitForModuleInit(callback), 500);
        }
    }

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
    }

    waitForModuleInit(addSourceButton);
})();
