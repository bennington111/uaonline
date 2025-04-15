(function(){
    alert('Плагін підключено');

    if (!window.App || !window.Module) {
        alert('Lampa не готова або Module не знайдено');
        return;
    }

    Module.add({
        name: 'uaonline',
        type: 'video',
        component: 'uaonline_component',
        condition: function(object){
            return true; // показувати для всіх фільмів/серіалів
        },
        onCreate: function(){
            alert('UA Online модуль створено');
        }
    });

    Lampa.Component.add('uaonline_component', {
        create: function(){
            this.activity.render();
        },
        render: function(){
            var html = $('<div class="selectbox__content"><div class="selectbox__title">UA Online</div></div>');
            return html;
        },
        destroy: function(){}
    });
})();
