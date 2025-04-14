console.log('[UAOnline]: testsource_v2.js завантажено');

Lampa.Listener.follow('full', function (e) {
    console.log('[UAOnline: подія full ->]', e.type);

    if (e.type === 'complite') {
        waitForContainer();
    }
});

function waitForContainer(attempt = 0) {
    const container = document.querySelector('.selectbox__content');

    if (container) {
        console.log('[UAOnline]: контейнер знайдено, додаю кнопку');

        const button = document.createElement('div');
        button.className = 'selectbox-item selectbox-item--icon selector';
        button.innerHTML = `
            <div class="selectbox-item__icon">🎬</div>
            <div>
                <div class="selectbox-item__title">UA Online</div>
                <div class="selectbox-item__subtitle">testsource_v2</div>
            </div>
        `;

        button.addEventListener('hover:enter', function () {
            console.log('[UAOnline]: натиснуто кнопку UA Online');
            Lampa.Noty.show('Натиснуто UA Online!');
        });

        container.appendChild(button);
    } else if (attempt < 20) {
        setTimeout(() => waitForContainer(attempt + 1), 200);
    } else {
        console.warn('[UAOnline]: контейнер кнопок не знайдено після очікування');
    }
}
