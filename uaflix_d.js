// ==UserScript==
 // @name        Uaflix
 // @namespace   uaflix
 // @version     1.0
 // @description Плагін для перегляду фільмів з Uaflix
 // @author      YourName
 // @match       *://*/*
 // @grant       none
 // @icon        https://uafix.net/favicon.ico
 // ==/UserScript==

// Плагін для Lampa (uafix.net) з правильною реалізацією кнопки
class UAFixPlugin {
    constructor() {
        this.name = "UAFix";
        this.version = "1.0";
        this.icon = "https://uafix.net/favicon.ico";
        this.domains = ["uafix.net"];
        this.ready = false;
    }

    async init() {
        // Чекаємо, доки Lampa повністю завантажиться
        await new Promise(resolve => {
            const check = () => {
                if (window.lampa && lampa.plugins) resolve();
                else setTimeout(check, 100);
            };
            check();
        });

        // Реєстрація плагіна
        lampa.plugins.register(this.name, {
            name: this.name,
            version: this.version,
            icon: this.icon,
            online: {
                search: (query) => this.search(query),
                parse: (url) => this.parsePage(url)
            }
        });

        this.ready = true;
        console.log("UAFix plugin loaded!");
    }

    // Створення кнопки (ТОЧНО як у online_mod.js)
    createButton() {
        const button = document.createElement('div');
        button.className = 'full-start__button selector selector--light view--uaflix';
        button.innerHTML = `
            <div class="selector__ico">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
            </div>
            <div class="selector__name">UAFix</div>
        `;
        button.onclick = (e) => {
            e.stopPropagation();
            this.openPlayer();
        };
        return button;
    }

    // Додавання кнопки до інтерфейсу
    addButton() {
        const container = document.querySelector('.full-start__buttons');
        if (container && !container.querySelector('.view--uaflix')) {
            container.appendChild(this.createButton());
        }
    }

    // Інші методи (search, parsePage...) залишаються як у попередньому коді
    async search(query) { /* ... */ }
    async parsePage(url) { /* ... */ }
    openPlayer() { /* ... */ }
}

// Автоматичне додавання кнопки при змінах DOM
const plugin = new UAFixPlugin();
plugin.init();

// Спостереження за змінами інтерфейсу
const observer = new MutationObserver(() => {
    if (plugin.ready) plugin.addButton();
});
observer.observe(document.body, { childList: true, subtree: true });
