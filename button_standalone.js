(function () {
    function log(msg) {
        console.log('[UA Online]', msg);
    }

    function addSourceButton() {
        if (!window.Lampa || !window.Lampa.Platform) {
            log('Lampa не готова, чекаємо...');
            setTimeout(addSourceButton, 500);
            return;
        }

        if (!window.Lampa.Module) {
            log('Module ще не доступний, чекаємо...');
            setTimeout(addSourceButton, 500);
            return;
        }

        if (!window.Lampa.Listener) {
            log('Listener ще не доступний, чекаємо...');
            setTimeout(addSourceButton, 500);
            return;
        }

        // Додаємо пустий онлайн-модуль, щоб активувати секцію "Онлайн"
        Lampa.Module.add({
            component: 'online',
            name: 'uaonline',
            type: 'video',
            onSearch: function (query, call) {
                log('onSearch запит, повертаємо пусто');
                call([]);
            },
            onDetails: function (url, call) {
                log('onDetails запит, повертаємо пусто');
                call([]);
            }
        });

        // Тепер додаємо кнопку
        let added = false;
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') {
                if (!added) {
                    added = true;
                    log('Додаємо кнопку UA Online');

                    Lampa.Storage.set('online_mods', Object.assign(
                        Lampa.Storage.get('online_mods', {}), {
                            uaonline: {
                                name: 'UA Online',
                                description: 'uaonline_test'
                            }
                        }
                    ));
                }
            }
        });

        log('Плагін підключено');
    }

    addSourceButton();
})();
