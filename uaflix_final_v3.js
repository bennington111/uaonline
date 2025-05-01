// ==UserScript==
// @name         Uaflix Plugin
// @namespace    https://github.com/bennington111/
// @version      5.3
// @description  UAFlix plugin for Lampa
// @author       Bennington
// @match        *://lampa.mx/*
// @icon         https://uafix.net/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    
    // Реєстрація плагіна (як у вашому робочому uaflix_final_v4.js)
    if (!window.lampa) {
        let checkLampa = setInterval(() => {
            if (window.lampa) {
                clearInterval(checkLampa);
                registerPlugin();
            }
        }, 500);
    } else {
        registerPlugin();
    }

    function registerPlugin() {
        lampa.plugin.add({
            name: "uaflix",
            init: function() {
                this.addComponent();
            },
            addComponent: function() {
                lampa.menu.add({
                    name: "Uaflix",
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 260" width="24" height="24" fill="currentColor"><path d="M242,88v170H10V88h41l-38,38h37.1l38-38h38.4l-38,38h38.4l38-38h38.3l-38,38H204L242,88L242,88z M228.9,2l8,37.7l0,0L191.2,10L228.9,2z M160.6,56l-45.8-29.7l38-8.1l45.8,29.7L160.6,56z M84.5,72.1L38.8,42.4l38-8.1l45.8,29.7L84.5,72.1z M10,88L2,50.2L47.8,80L10,88z"/></svg>',
                    color: "#ff5722",
                    action: () => {
                        const card = lampa.player.card();
                        const title = card?.title || '';
                        const year = card?.year || '';
                        window.open(`https://uafix.net/index.php?do=search&subaction=search&story=${encodeURIComponent(title + ' ' + year)}`);
                    }
                });
            }
        });
    }
})();
