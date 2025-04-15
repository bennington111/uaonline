alert('Плагін UA Online підключено успішно!');

function waitUntilModuleReady(callback, tries = 0) {
    if (typeof Module !== 'undefined') {
        callback();
    } else if (tries < 20) {
        setTimeout(() => waitUntilModuleReady(callback, tries + 1), 500);
    } else {
        alert('Module не зʼявився після очікування');
    }
}

waitUntilModuleReady(function() {
    Module.add({
        component: 'online',
        name: 'UA Online',
        onCreate: function() {
            alert('Онлайн UA Online створено!');
        }
    });
});
