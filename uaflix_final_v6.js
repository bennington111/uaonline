(function () {
    if (!window.Lampa || !Lampa.Listener || !Lampa.Activity) return;

    let network = new Lampa.Reguest();

    // Додаємо кнопку UAFlix після відкриття фільму або серіалу
    Lampa.Listener.follow('full', function (e) {
        if (e.type !== 'activity') return;

        let data = e.data;
        let card = data.movie;

        // Уникаємо дублювання кнопки
        if (document.querySelector('.uaflix-button')) return;

        let button = document.createElement('div');
        button.className = 'selectbox-item selectbox-item--icon selector uaflix-button';
        button.innerHTML = `
            <div class="selectbox-item__icon">
                <img src="https://www.svgrepo.com/show/532277/play-circle.svg" style="width: 2em;">
            </div>
            <div class="selectbox-item__text">Онлайн UAFlix</div>
        `;

        button.addEventListener('hover:enter', () => {
            Lampa.Noty.show('Шукаємо UAFlix...');

            let search_query = card.name || card.original_name || card.title || card.original_title;

            // TMDB ID також можна використати, якщо uafix підтримує
            let url = `https://uafix.net/?s=${encodeURIComponent(search_query)}`;

            network.silent(url, (html) => {
                let doc = new DOMParser().parseFromString(html, 'text/html');
                let links = doc.querySelectorAll('.ml-mask a');

                if (!links.length) {
                    Lampa.Noty.show('Нічого не знайдено на UAFlix');
                    return;
                }

                // Переходимо за першим посиланням
                let href = links[0].href;

                network.silent(href, (moviePage) => {
                    let mdoc = new DOMParser().parseFromString(moviePage, 'text/html');
                    let iframe = mdoc.querySelector('iframe');

                    if (!iframe || !iframe.src) {
                        Lampa.Noty.show('Посилання не знайдено');
                        return;
                    }

                    // Запускаємо плеєр напряму
                    Lampa.Activity.push({
                        url: '',
                        component: 'player',
                        id: 'uaflix-player',
                        name: 'UAFlix',
                        player: true,
                        file: iframe.src
                    });
                }, () => {
                    Lampa.Noty.show('Помилка при завантаженні сторінки фільму');
                });

            }, () => {
                Lampa.Noty.show('Помилка при пошуку на UAFlix');
            });
        });

        // Додаємо кнопку в DOM
        let container = document.querySelector('.full-start__buttons') || document.querySelector('.view--full .selectbox');
        if (container) container.appendChild(button);
    });
})();
