(function () {
    if (!window.UAOnlineInitialized) {
        window.UAOnlineInitialized = true;

        function waitForLampa(callback) {
            if (typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.Player) {
                callback();
            } else {
                console.log('[UA Online] Лампа ще не готова, чекаю...');
                setTimeout(() => waitForLampa(callback), 500);
            }
        }

        function addSourceButton() {
            console.log('[UA Online] Додаю кнопку джерела');
            if (!Lampa.Player || !Lampa.Playerjs) {
                console.warn('[UA Online] Lampa.Player або Playerjs не готові');
                return;
            }

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

                    const tmdb_id = object.movie.id;
                    const title = object.movie.title || object.movie.name;

                    // Тимчасово для перевірки — одне фейкове джерело
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
            addSourceButton();
        });
    }
})();
