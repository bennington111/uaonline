(function () {
    const mod_version = '14.04.25';
    const mod_title = 'UA Онлайн';

    function loadStream(movie) {
        console.log('UAOnline: запускаємо плеєр для', movie.title);
        Lampa.Player.play({
            title: movie.title,
            url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            method: 'play',
            name: 'UA Онлайн (тестовий)',
            quality: '1080p',
        });
    }

    const buttonHTML = `
        <div class="full-start__button selector view--uaonline" data-subtitle="UA Онлайн ${mod_version}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="20" height="20">
                <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z M228.9,2l8,37.7l0,0 L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88 L2,50.2L47.8,80L10,88z" fill="currentColor"/>
            </svg>
            <span>${mod_title}</span>
        </div>`;

    function observeDOM(callback) {
        const observer = new MutationObserver((mutations, obs) => {
            const container = document.querySelector('.full-start__buttons');
            if (container) {
                console.log('UAOnline: контейнер знайдено через observer');
                obs.disconnect();
                callback($(container));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    function init() {
        console.log('UAOnline: ініціалізація плагіна');
        Lampa.Listener.follow('full', function (e) {
            console.log('[UAOnline: подія full ->]', e.type);
            if (e.type === 'complite') {
                observeDOM(function (container) {
                    const btn = $(Lampa.Lang.translate(buttonHTML));
                    btn.on('hover:enter', function () {
                        console.log('UAOnline: натиснуто кнопку');
                        loadStream(e.data.movie);
                    });
                    container.prepend(btn);
                    console.log('UAOnline: кнопку додано');
                });
            }
        });
    }

    if (window.Lampa) init();
    else window.addEventListener('lampa', init);
})();
