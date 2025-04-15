(function () {
    if (!window.Lampa || !Lampa.Module || !Lampa.Module.add) {
        alert('Lampa ще не готова');
        return;
    }

    // Назва плагіна для повідомлень
    const pluginName = 'UA Online';

    console.log(`${pluginName}: Плагін підключено`);

    function addSource() {
        let online = Lampa.Module.get('online');
        if (!online) {
            console.log(`${pluginName}: Модуль online ще не готовий`);
            return;
        }

        // Уникаємо повторного додавання
        if (online.list.some(src => src.component === 'uaonline')) {
            console.log(`${pluginName}: Джерело вже існує`);
            return;
        }

        // Додаємо джерело
        Lampa.Module.add('online', {
            component: 'uaonline',
            name: pluginName,
            version: '1.0',
            type: 'video',
            on: function (params, call) {
                console.log(`${pluginName}: Виклик on`, params);

                call([
                    {
                        title: 'UAKINO Test',
                        url: 'https://uakino.club/sample-video.mp4',
                        quality: 'HD',
                        info: '🔵 uakino.club',
                    },
                    {
                        title: 'UASERIALS Test',
                        url: 'https://uaserials.pro/sample-video.mp4',
                        quality: 'SD',
                        info: '🟢 uaserials.pro',
                    }
                ]);
            }
        });

        console.log(`${pluginName}: Джерело додано`);
    }

    // Очікуємо появу модуля online
    function waitForOnlineModule() {
        if (window.Lampa?.Module?.get('online')) {
            addSource();
        } else {
            console.log(`${pluginName}: Чекаємо на модуль online...`);
            setTimeout(waitForOnlineModule, 500);
        }
    }

    waitForOnlineModule();
})();
