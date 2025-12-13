(function(){
    'use strict';
    
    function startPlugin(){
        window.logoplugin = !0;
        
        Lampa.Listener.follow('full', function(e){
            if(e.type == 'complite' && Lampa.Storage.get('logo_glav') != '1'){
                var data = e.data.movie;
                var type = data.name ? 'tv' : 'movie';
                
                if(data.id != ''){
                    var userLanguage = Lampa.Storage.get('language');
                    
                    // Спочатку запит з поточною мовою користувача
                    var currentLangUrl = Lampa.TMDB.api(type + '/' + data.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + userLanguage);
                    
                    $.get(currentLangUrl, function(currentLangData){
                        var logo = null;
                        
                        // Якщо є логотип з поточною мовою
                        if(currentLangData.logos && currentLangData.logos.length > 0 && currentLangData.logos[0].file_path){
                            logo = currentLangData.logos[0].file_path;
                            displayLogo(e, logo);
                        } 
                        // Якщо немає логотипу з поточною мовою, шукаємо англійську версію
                        else {
                            var englishUrl = Lampa.TMDB.api(type + '/' + data.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=en');
                            
                            $.get(englishUrl, function(englishData){
                                if(englishData.logos && englishData.logos.length > 0 && englishData.logos[0].file_path){
                                    logo = englishData.logos[0].file_path;
                                    displayLogo(e, logo);
                                }
                                // Якщо немає і англійської, беремо оригінальну версію
                                else {
                                    var originalUrl = Lampa.TMDB.api(type + '/' + data.id + '/images?api_key=' + Lampa.TMDB.key());
                                    
                                    $.get(originalUrl, function(originalData){
                                        if(originalData.logos && originalData.logos.length > 0 && originalData.logos[0].file_path){
                                            logo = originalData.logos[0].file_path;
                                            displayLogo(e, logo);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    }
    
    function displayLogo(e, logoPath){
        if(logoPath != ''){
            e.object.activity.render().find('.full-start-new__title').html('<img style="margin-top:5px;max-height:125px;" src="' + Lampa.TMDB.image('/t/p/w300' + logoPath.replace('.svg','.png')) + '"/>');
        }
    }
    
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'logo_glav',
            type: 'select',
            values: {
                1: 'Вимкнути',
                0: 'Увімкнути',
            },
            default: '0',
        },
        field: {
            name: 'Логотипи замість назв',
            description: 'Показує логотипи фільмів замість тексту',
        }
    });
    
    if(!window.logoplugin) startPlugin();
})();