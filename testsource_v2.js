console.log('[UAOnline]: testsource_v2.js завантажено');

Lampa.Listener.follow('full', function (e) {
    console.log(`[UAOnline: подія full ->] ${e.type}`);

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
        button.style.border = '3px solid red'; // 🟥 Видима рамка
        button.style.background = '#ffdddd'; // 🩷 Фон
        button.innerHTML = `
            <div class="selectbox-item__icon">🧪</div>
            <div>
                <div class="selectbox-item__title">UA Online (Test)</div>
                <div class="selectbox-item__subtitle">🎯 має бути видимим</div>
            </div>
        `;

        button.addEventListener('hover:enter', function () {
            console.log('[UAOnline]: Кнопку натиснуто');
            Lampa.Noty.show('Натиснуто UA Online!');
        });

        container.appendChild(button);
        console.log('[UAOnline]: кнопка реально додана у', container);
    } else if (attempt < 20) {
        setTimeout(() => waitForContainer(attempt + 1), 300);
    } else {
        console.warn('[UAOnline]: контейнер не знайдено після 20 спроб');
    }
}
