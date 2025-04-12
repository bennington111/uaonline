(function () {
    function uaonline_component() {
        return {
            component: 'uaonline',
            name: 'UA Online',
            type: 'video',
            version: '1.0.0',
            icon: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
            description: 'Перегляд з uakino та uaserials',

            onContextMenu(object) {
                return null; // Нічого особливого тут не потрібно
            },

            onItem(object, callback) {
                // Тут — приклад. Замінити логікою парсингу із uakino/uaserials
                callback([
                    {
                        title: 'UA Online — 1080p',
                        file: 'https://example.com/stream.m3u8',
                        quality: '1080p',
                        url: 'https://example.com/stream.m3u8'
                    }
                ]);
            }
        }
    }

    if (window.plugin) window.plugin(uaonline_component());
    else window.addEventListener('plugin', () => window.plugin(uaonline_component()));
})();
