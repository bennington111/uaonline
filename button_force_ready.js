(function () {
    if (!window.UAOnlineInitialized) {
        window.UAOnlineInitialized = true;

        function waitForLampa(callback) {
            if (typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.Player && Lampa.Activity) {
                callback();
            } else {
                console.log('[UA Online] Лампа ще не готова, чекаю...');
                setTimeout(() => waitForLampa(callback), 500);
            }
        }

        function ensureOnlineComponent(callback) {
            const active = Lampa.Activity.active();
            if (active && active.component === 'activity') {
                console.log('[UA Online] Форсую оновлення компонента онлайн');
                Lampa.Activity.replace({
                    component: 'full',
                    url: active.object.url,
                    page: 1
                });
                setTimeout(callback, 1000);
            } else {
                console.log('[UA Online] Компонент activity ще не активний');
                setTimeout(() => ensureOnlineComponent(callback), 500);
            }
        }

        function addSourceButton() {
            console.log('[UA Online] Додаю кнопку джерела');

            if (typeof Lampa.Module === 'undefined' || !Lampa.Module.add) {
                console.warn('[UA Online] Module.add не існує');
                return;
            }

            Lampa.Module.add({
                component: 'online',
                name: 'UA Online',
                type: 'video',
                onContextMenu: function (object) {
                    console.log('[UA Online] onContextMenu', object);
                },
                onSearch: function (object, resolve) {
                    console.log('[UA Online] onSearch (ігнор)', object);
                    resolve([]);
                },
                onSources: function (object, resolve) {
                    console.log('[UA Online] onSources', object);

                    resolve([{
                        title: '🎬 Приклад: uakino.me',
                        url: 'https://uakino.me',
                        quality: 'HD',
                        info: 'Ukr',
                        timeline: '',
                        subtitles: [],
                        player: true
                    }]);
                }
            });
        }

        waitForLampa(() => {
            console.log('[UA Online] Плагін підключено ✅');
            ensureOnlineComponent(() => {
                console.log('[UA Online] Компонент online готовий');
                addSourceButton();
            });
        });
    }
})();
