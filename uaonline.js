console.log('UAOnline plugin loaded');

(function () {
    function addSourceButton() {
        const sourceMenu = document.querySelector('.selectbox__content .selectbox__title');
        if (!sourceMenu || sourceMenu.textContent.trim() !== 'Джерело') return;

        // Уникаємо дублювання кнопки
        if (document.querySelector('.selectbox-item.uaonline-button')) return;

        const button = document.createElement('div');
        button.className = 'selectbox-item selectbox-item--icon selector uaonline-button';
        button.innerHTML = `
            <div class="selectbox-item__icon">
                <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z"
                        fill="currentColor" />
                </svg>
            </div>
            <div>
                <div class="selectbox-item__title">UA Online</div>
                <div class="selectbox-item__subtitle">uaserials + uakino</div>
            </div>
        `;

        button.addEventListener('click', () => {
            Lampa.Activity.push({
                url: '',
                title: 'UA Online',
                component: 'online',
                search: '',
                search_one: '',
                filter: {},
                source: 'uaonline'
            });
        });

        const container = document.querySelector('.selectbox__content .scroll__body');
        if (container) container.appendChild(button);
    }

    Lampa.Listener.follow('selectbox', function (event) {
        if (event.type === 'open') {
            setTimeout(addSourceButton, 100); // Трохи зачекати, щоб DOM точно завантажився
        }
    });
})();
