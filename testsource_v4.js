(function () {
    function start() {
        function uaonline(component) {
            component.addSource({
                title: 'Онлайн UA',
                description: 'uaonline test',
                onClick: function () {
                    let html = `
                        <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
                            <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                                    frameborder="0" allowfullscreen 
                                    style="position:absolute;top:0;left:0;width:100%;height:100%;">
                            </iframe>
                        </div>
                    `;

                    Modal.open({
                        title: 'Онлайн UA',
                        html: html,
                        onBack: function () {
                            Modal.close();
                            Controller.toggle('content');
                        }
                    });
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
