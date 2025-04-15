(function () {
    function startPlugin() {
        const source_id = 'uaonline';
        const source_title = 'UA Online';

        // 1. Реєструємо модуль, щоб Lampa знала про джерело
        Module.add({
            component: 'online',
            name: source_id,
            type: 'video',
            onSearch: function (query, call) {
                call([]);
            },
            onCollect: function (object, call) {
                call([]);
            }
        });

        // 2. Додаємо джерело
        Lampa.Source.add(source_id, {
            name: source_title,
            type: 'video',
            active: false,
            proxy: true,
            collections: true,
            component: 'online',
            onItem: function (elem) {
                return true;
            },
            onMore: function (elem, result) {
                result([]);
            },
            onFetch: function (item, result) {
                result({
                    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
                    title: 'Тестовий UA Online',
                    subtitles: []
                });
            }
        });

        // 3. Додаємо кнопку вручну (після запуску плеєра)
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'ready') {
                setTimeout(() => {
                    const buttons = document.querySelectorAll('.selectbox-item--icon');

                    // Якщо кнопка ще не існує
                    if (![...buttons].some(b => b.innerText.includes(source_title))) {
                        const container = document.querySelector('.selectbox--sources');

                        if (container) {
                            const btn = document.createElement('div');
                            btn.className = 'selectbox-item selectbox-item--icon selector';
                            btn.innerHTML = `<span>${source_title}</span>`;
                            btn.addEventListener('click', () => {
                                Lampa.Activity.push({
                                    url: '',
                                    title: source_title,
                                    component: 'online',
                                    id: source_id,
                                    source: source_id,
                                    search: '',
                                    search_one: false
                                });
                            });

                            container.appendChild(btn);
                        }
                    }
                }, 500); // невелика затримка, щоб DOM встиг відрендеритись
            }
        });
    }

    if (window.Lampa) startPlugin();
    else document.addEventListener("DOMContentLoaded", startPlugin);
})();
