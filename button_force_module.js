(function(){
    alert('Плагін підключено');

    function addModule() {
        if (!window.Module || !window.Component) {
            alert('Модулі ще не завантажені');
            return;
        }

        // Створюємо секцію "online", якщо вона ще не створена
        if (!Component.has('online')) {
            Component.add('online', {});
        }

        Module.add({
            name: 'UA Online',
            type: 'video',
            component: 'online',
            on: function (movie, show) {
                alert('UA Online обрано');
                // Тут буде логіка відтворення
            }
        });

        alert('Модуль UA Online зареєстровано');
    }

    // Чекаємо, поки завантажаться всі модулі
    if (window.Lampa) {
        if (Lampa.Listener) {
            addModule();
        } else {
            document.addEventListener('DOMContentLoaded', addModule);
        }
    } else {
        const interval = setInterval(() => {
            if (window.Lampa && window.Module && window.Component) {
                clearInterval(interval);
                addModule();
            }
        }, 500);
    }
})();
