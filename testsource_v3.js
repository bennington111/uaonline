console.log('[UAOnline]: testsource_v3.js завантажено');

const observer = new MutationObserver(() => {
    const titles = document.querySelectorAll('.selectbox__title');

    titles.forEach(title => {
        if (title.textContent.trim() === 'Онлайн') {
            console.log('[UAOnline]: знайдено секцію "Онлайн", додаю кнопку');

            const container = title.closest('.selectbox__content')?.querySelector('.scroll__body');

            if (container && !container.querySelector('.uaonline-btn')) {
                const button = document.createElement('div');
                button.className = 'selectbox-item selectbox-item--icon selector uaonline-btn';
                button.style.border = '3px solid green';
                button.style.background = '#ddffdd';
                button.innerHTML = `
                    <div class="selectbox-item__icon">🌐</div>
                    <div>
                        <div class="selectbox-item__title">UA Online (Test)</div>
                        <div class="selectbox-item__subtitle">🎯 Вибір джерела</div>
                    </div>
                `;

                button.addEventListener('hover:enter', function () {
                    console.log('[UAOnline]: Кнопку UA Online натиснуто');
                    Lampa.Noty.show('Натиснуто UA Online!');
                });

                container.appendChild(button);
                console.log('[UAOnline]: кнопка успішно додана в scroll__body');
            }
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });
