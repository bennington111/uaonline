(function () {
    if (!window.Lampa || !Lampa.Listener) return;

    console.log('[UAOnline] Плагін завантажено');

    function observeSelectbox(callback) {
        const observer = new MutationObserver(() => {
            const el = document.querySelector('.selectbox');
            if (el) {
                observer.disconnect();
                console.log('[UAOnline] Знайдено .selectbox');
                callback(el);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => observer.disconnect(), 10000);
    }

    function addSourceButton(container) {
        const btn = document.createElement('div');
        btn.className = 'selectbox-item selectbox-item--icon selector';
        btn.innerHTML = `
            <div class="selectbox-item__icon">
                <i class="fa fa-globe"></i>
            </div>
            <div class="selectbox-item__title">Онлайн UA Online</div>
        `;

        btn.addEventListener('click', () => {
            console.log('[UAOnline] Клік по кнопці');
            Lampa.Activity.push({
                url: '',
                title: 'UA Online',
                component: 'online',
                search: '',
                search_one: '',
                name: 'UA Online'
            });
        });

        container.appendChild(btn);
    }

    Lampa.Listener.follow('activity', function (e) {
        console.log('[UAOnline] Activity event:', e);

        if (e.component === 'full' && e.type === 'start') {
            console.log('[UAOnline] Повноекранна картка запущена');
            observeSelectbox(addSourceButton);
        }
    });

})();
