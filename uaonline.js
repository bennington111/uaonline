(function () {
    if (!window.Lampa || !Lampa.Listener || !Lampa.Activity) return;

    Lampa.Listener.follow('selectbox', function (e) {
        // Спрацьовує тільки на відкриття меню "Джерело"
        if (e.type === 'open' && e.data && e.data.title === 'Джерело') {
            setTimeout(() => {
                const body = document.querySelector('.selectbox__body .scroll__body');
                if (!body || body.querySelector('[data-uaonline]')) return; // Уникаємо дубля

                const button = document.createElement('div');
                button.className = 'selectbox-item selectbox-item--icon selector';
                button.setAttribute('data-uaonline', 'true');
                button.innerHTML = `
                    <div class="selectbox-item__icon">
                        <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <div>
                        <div class="selectbox-item__title">Онлайн UA Online</div>
                        <div class="selectbox-item__subtitle">uaonline</div>
                    </div>
                `;

                button.addEventListener('click', () => {
                    Lampa.Activity.push({
                        url: '',
                        title: 'UA Online',
                        component: 'uaonline',
                        search: e.data.search,
                        id: e.data.id,
                        method: 'movie',
                        card: e.data.card
                    });
                });

                body.appendChild(button);
            }, 10); // Невелика затримка щоб DOM встиг зʼявитись
        }
    });

    // Реєструємо пустий компонент uaonline, щоб Lampa не видала помилку
    Lampa.Component.add('uaonline', {
        create: function () {
            this.render = function () {
                let div = document.createElement('div');
                div.innerHTML = '<div class="empty"><div class="empty__title">UA Online</div><div class="empty__text">Тут буде плеєр 😉</div></div>';
                return div;
            };
        },
        pause: function () {},
        stop: function () {},
        destroy: function () {}
    });

    console.log('UAOnline plugin loaded');
})();
