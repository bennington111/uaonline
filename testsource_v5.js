(function () {
    function start() {
        function uaonline(component) {
            component.addSource({
                title: 'Онлайн UA',
                description: 'uaonline test',
                onClick: function () {
                    alert('UA Online Source Clicked!');
                }
            });
        }

        if (window.appready) uaonline(Lampa.Player);
        else Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') uaonline(Lampa.Player);
        });
    }

    if (!window.Plugin) {
        setTimeout(start, 500);
    } else {
        start();
    }
})();
