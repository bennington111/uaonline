(function () {
    var mod_version = '1.0.0';
    var mod_title = 'UAfix';

    var button = `
        <div class="full-start__button selector view--uafix" data-subtitle="uafix ${mod_version}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="22" height="22" fill="currentColor">
                <path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z M228.9,2l8,37.7l0,0 L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88 L2,50.2L47.8,80L10,88z"/>
            </svg>
            <span>${mod_title}</span>
        </div>
    `;

    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite') {
            var btn = $(button);
            btn.on('hover:enter', function () {
                // Дія при натисканні — поки що тестова
                Lampa.Noty.show('UAfix натиснуто');
                // Тут буде loadOnline(e.data.movie)
            });
            e.object.activity.render().find('.view--torrent').after(btn);
        }
    });
})();
