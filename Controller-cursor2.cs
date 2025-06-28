using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Web;
using System.Linq;
using System.Net.Http;
using HtmlAgilityPack;
using Shared.Engine.CORE;
using Lampac.Engine;
using Shared.Model.Templates;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using Uaflix.Models.UaFlix;

namespace Uaflix.Controllers
{
    //[ApiController]
    [Route("uaflix")]
    public class UaflixController : BaseController
    {
        ProxyManager proxyManager = new ProxyManager(ModInit.UaFlix);
        static HttpClient httpClient = new HttpClient();

        // --- Допоміжний словник для зберігання AshdiEpisode по сезону та номеру епізоду ---
        static Dictionary<string, AshdiEpisode> ashdiEpisodesDict = new Dictionary<string, AshdiEpisode>();

        static UaflixController()
        {
            httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        }

        // Допоміжні класи для парсингу Ashdi JSON
        public class AshdiEpisode
        {
            public string title { get; set; }
            public string file { get; set; }
            public string id { get; set; }
            public string poster { get; set; }
            public string subtitle { get; set; }
        }
        public class AshdiSeason
        {
            public string title { get; set; }
            public List<AshdiEpisode> folder { get; set; }
        }
        public class AshdiVoice
        {
            public string title { get; set; }
            public List<AshdiSeason> folder { get; set; }
        }

        // --- Lampac API models ---
        public class LampacVoice
        {
            public string id { get; set; }
            public string title { get; set; }
            public List<LampacSeason> seasons { get; set; }
        }
        public class LampacSeason
        {
            public string id { get; set; }
            public string title { get; set; }
            public List<LampacEpisode> episodes { get; set; }
        }
        public class LampacEpisode
        {
            public string id { get; set; }
            public string title { get; set; }
            public string file { get; set; }
        }

        void Log(string msg)
        {
            System.IO.File.AppendAllText("lampac-log.txt", $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {msg}\r\n");
        }

        string DecodeUnicodeEscapes(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;
            input = Regex.Replace(
                input,
                @"\\u([0-9A-Fa-f]{4})",
                m => ((char)Convert.ToInt32(m.Groups[1].Value, 16)).ToString()
            );
            input = input.Replace("\\/", "/");
            return input;
        }

        // Метод для вибору найкращого результату пошуку
        (string href, string text) FindBestMatch(HtmlNodeCollection nodes, string title, string original_title)
        {
            var searchTerms = new List<string>();
            if (!string.IsNullOrEmpty(title))
                searchTerms.Add(title.ToLower().Trim());
            if (!string.IsNullOrEmpty(original_title))
                searchTerms.Add(original_title.ToLower().Trim());

            var bestScore = 0;
            var bestMatch = (href: "", text: "");

            foreach (var node in nodes)
            {
                string href = node.GetAttributeValue("href", "");
                string text = node.InnerText?.Trim() ?? "";
                string textLower = text.ToLower();

                int score = 0;

                // Точний збіг (найвищий пріоритет)
                foreach (var term in searchTerms)
                {
                    if (textLower == term)
                    {
                        score += 1000;
                        Log($"search: ТОЧНИЙ ЗБІГ! '{text}' = '{term}'");
                    }
                    else if (textLower.StartsWith(term))
                    {
                        score += 500;
                        Log($"search: починається з '{term}': '{text}'");
                    }
                    else if (textLower.Contains(term))
                    {
                        score += 100;
                        Log($"search: містить '{term}': '{text}'");
                    }
                }

                // Перевіряємо збіг без урахування регістру та спеціальних символів
                foreach (var term in searchTerms)
                {
                    string cleanTerm = Regex.Replace(term, @"[^\w\s]", "").ToLower();
                    string cleanText = Regex.Replace(textLower, @"[^\w\s]", "");
                    
                    if (cleanText == cleanTerm)
                    {
                        score += 800;
                        Log($"search: чистий точний збіг: '{cleanText}' = '{cleanTerm}'");
                    }
                    else if (cleanText.Contains(cleanTerm))
                    {
                        score += 50;
                    }
                }

                // Додаткові критерії для розрізнення схожих назв
                foreach (var term in searchTerms)
                {
                    // Бонус за точний збіг першого слова
                    string[] textWords = textLower.Split(new[] { ' ', '/', '\\', '-', '_' }, StringSplitOptions.RemoveEmptyEntries);
                    string[] termWords = term.Split(new[] { ' ', '/', '\\', '-', '_' }, StringSplitOptions.RemoveEmptyEntries);
                    
                    if (textWords.Length > 0 && termWords.Length > 0)
                    {
                        if (textWords[0] == termWords[0])
                        {
                            score += 200;
                            Log($"search: точний збіг першого слова '{textWords[0]}': '{text}'");
                        }
                    }
                    
                    // Бонус за коротші назви (більш точні)
                    if (text.Length < 50)
                    {
                        score += 100;
                        Log($"search: коротка назва ({text.Length} символів): '{text}'");
                    }
                    
                    // Штраф за довгі назви з описом
                    if (text.Length > 100)
                    {
                        score -= 50;
                        Log($"search: довга назва з описом ({text.Length} символів): '{text}'");
                    }
                }

                Log($"search: оцінка результату '{text}': {score} балів");

                if (score > bestScore)
                {
                    bestScore = score;
                    bestMatch = (href, text);
                }
            }

            Log($"search: найкращий результат з {bestScore} балами: '{bestMatch.text}'");
            return bestMatch;
        }

        [HttpGet]
        public async Task<IActionResult> Index(
            long id = 0,
            string imdb_id = "",
            long kinopoisk_id = 0,
            string title = "",
            string original_title = "",
            string t = "",
            string s = "",
            string e = "",
            int year = 0,
            string poster = "",
            string director = "",
            string actors = "",
            string country = "",
            string v = "",
            bool? rjson = null)
        {
            if (string.IsNullOrWhiteSpace(title) && string.IsNullOrWhiteSpace(original_title))
                return Content("Потрібно вказати назву для пошуку.", "text/html; charset=utf-8");

            Log($"=== Index START === t={t} s={s} e={e}");

            string host = $"{Request.Scheme}://{Request.Host}";
            string memKey = $"UaFlix:view:{kinopoisk_id}:{imdb_id}";
            Result result = null;

            // --- Кешування ---
            if (hybridCache.TryGetValue(memKey, out Result res))
            {
                Log("search: знайдено у кеші");
                result = res;
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(title))
                    result = await Search(title, original_title, kinopoisk_id, imdb_id, memKey);
                if (result == null && !string.IsNullOrWhiteSpace(original_title))
                    result = await Search(original_title, title, kinopoisk_id, imdb_id, memKey);
            }

            // --- rjson: повертаємо JSON з прямим лінком на відео (Lampac-style) ---
            if (rjson == true && !string.IsNullOrEmpty(e) && !string.IsNullOrEmpty(s))
            {
                Log($"rjson: START - e={e}, s={s}, t={t}, v={v}, title={title}");
                Log($"rjson: ashdiEpisodesDict count: {ashdiEpisodesDict.Count}");
                
                // Використовуємо t якщо він є, інакше v
                string voiceParam = !string.IsNullOrEmpty(t) ? t : v;
                
                // Нормалізуємо e (видаляємо зайві нулі)
                string normE = int.TryParse(e, out var eNum) ? eNum.ToString() : e;
                string dictKey = $"{voiceParam}|{s}|{normE}";
                Log($"rjson: s={s}, e={e}, normE={normE}, dictKey={dictKey}");
                Log($"rjson: available keys: {string.Join(",", ashdiEpisodesDict.Keys)}");
                
                if (!ashdiEpisodesDict.TryGetValue(dictKey, out var episode))
                {
                    Log($"rjson: епізод не знайдено для ключа {dictKey}");
                    return Content(Newtonsoft.Json.JsonConvert.SerializeObject(new { method = "error", message = "Серія не знайдена." }, new Newtonsoft.Json.JsonSerializerSettings { StringEscapeHandling = Newtonsoft.Json.StringEscapeHandling.Default }), "application/json");
                }

                Log($"rjson: знайдено епізод - title: {episode.title}, file: {episode.file}");
                
                var json = Newtonsoft.Json.JsonConvert.SerializeObject(new {
                    method = "play",
                    url = episode.file,
                    title = $"{title ?? original_title} ({e})",
                    poster = episode.poster,
                    subtitle = episode.subtitle
                }, new Newtonsoft.Json.JsonSerializerSettings {
                    StringEscapeHandling = Newtonsoft.Json.StringEscapeHandling.Default
                });
                return Content(json, "application/json");
            }

            // --- Серіали (lite-режим) ---
            if (result != null && result.serial != null && result.serial.Count > 0)
            {
                // Збираємо всі унікальні сезони з усіх озвучок
                var allSeasons = new Dictionary<string, (string voice, string seasonName)>();
                foreach (var voicePair in result.serial)
                {
                    string voiceName = voicePair.Key;
                    var voiceSeasons = voicePair.Value;
                    foreach (var season in voiceSeasons)
                    {
                        if (!allSeasons.ContainsKey(season.id))
                        {
                            allSeasons[season.id] = (voiceName, season.name);
                        }
                    }
                }
                Log($"serial: всі унікальні сезони: {string.Join(", ", allSeasons.Select(kv => $"{kv.Key}({kv.Value.voice})"))}");

                // Визначаємо поточну озвучку та сезон
                string currentVoice = !string.IsNullOrEmpty(t) ? t : v;
                string currentSeason = s;
                
                // Якщо передано сезон, знаходимо озвучку для нього
                if (!string.IsNullOrEmpty(currentSeason) && currentSeason != "0" && currentSeason != "-1")
                {
                    if (allSeasons.TryGetValue(currentSeason, out var seasonInfo))
                    {
                        currentVoice = seasonInfo.voice;
                        Log($"serial: для сезону '{currentSeason}' автоматично вибрана озвучка '{currentVoice}'");
                    }
                }
                
                // Якщо озвучка не знайдена або не валідна, беремо першу доступну
                if (string.IsNullOrEmpty(currentVoice) || !result.serial.ContainsKey(currentVoice))
                {
                    currentVoice = result.serial.Keys.First();
                    Log($"serial: встановлюємо першу доступну озвучку: {currentVoice}");
                }

                // Якщо сезон не вказаний, беремо перший сезон поточної озвучки
                if (string.IsNullOrEmpty(currentSeason) || currentSeason == "0" || currentSeason == "-1")
                {
                    currentSeason = result.serial[currentVoice].First().id;
                    Log($"serial: встановлюємо перший сезон озвучки '{currentVoice}': {currentSeason}");
                }

                Log($"serial: поточна озвучка: '{currentVoice}', поточний сезон: '{currentSeason}'");

                // Формуємо HTML-фільтр озвучок
                var voicesHtml = new System.Text.StringBuilder();
                voicesHtml.Append("<div class=\"videos__line\">");
                foreach (var voice in result.serial.Keys)
                {
                    bool isActive = voice == currentVoice;
                    Log($"serial: озвучка '{voice}', активна: {isActive}");
                    voicesHtml.Append($"<div class=\"videos__button selector{(isActive ? " active" : "")}\" data-json='{{\"method\":\"link\",\"url\":\"{host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(voice)}\"}}'>{HttpUtility.HtmlEncode(voice)}</div>");
                }
                voicesHtml.Append("</div>");

                // Якщо є кілька сезонів і s не задано — повертаємо список сезонів
                Log($"serial: перевіряємо умову для списку сезонів: allSeasons.Count={allSeasons.Count}, s='{s}'");
                if (allSeasons.Count > 1 && (string.IsNullOrEmpty(s) || s == "0" || s == "-1"))
                {
                    Log($"serial: показуємо список всіх сезонів, кількість: {allSeasons.Count}");
                    var stpl = new SeasonTpl();
                    foreach (var seasonPair in allSeasons)
                    {
                        string seasonId = seasonPair.Key;
                        string seasonVoice = seasonPair.Value.voice;
                        string seasonName = seasonPair.Value.seasonName;
                        bool isActive = seasonId == currentSeason;
                        
                        Log($"serial: додаємо сезон '{seasonId}' з назвою '{seasonName}' (озвучка: {seasonVoice}), активний: {isActive}");
                        stpl.Append(
                            seasonId,
                            $"{host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&s={HttpUtility.UrlEncode(seasonId)}",
                            seasonName
                        );
                    }
                    var seasonHtml = stpl.ToHtml();
                    System.IO.File.WriteAllText("result.txt", "HTML SeasonTpl:\n" + voicesHtml + seasonHtml);
                    return Content(voicesHtml.ToString() + seasonHtml, "text/html; charset=utf-8");
                }

                // Якщо вибрано озвучку - перевіряємо це ПЕРШИМ
                if (!string.IsNullOrEmpty(t) && t != "0" && t != "-1")
                {
                    Log($"serial: вибрано озвучку '{t}', перевіряємо чи є сезон s='{s}'");
                    
                    // Якщо також вибрано сезон і ця озвучка має цей сезон - показуємо серії
                    if (!string.IsNullOrEmpty(s) && s != "0" && s != "-1")
                    {
                        Log($"serial: перевіряємо чи озвучка '{t}' має сезон '{s}'");
                        bool hasSeason = result.serial[t].Any(vs => vs.id == s);
                        Log($"serial: озвучка '{t}' має сезон '{s}': {hasSeason}");
                        
                        if (hasSeason)
                        {
                            Log($"serial: озвучка '{t}' має сезон '{s}', показуємо серії");
                            
                            // Показуємо озвучки для цього сезону
                            var voicesForSeasonHtml = new System.Text.StringBuilder();
                            voicesForSeasonHtml.Append("<div class=\"videos__line\">");
                            foreach (var voice in result.serial.Keys)
                            {
                                bool voiceHasSeason = result.serial[voice].Any(vs => vs.id == s);
                                bool isActive = voice == t;
                                Log($"serial: озвучка '{voice}' має сезон '{s}': {voiceHasSeason}, активна: {isActive}");
                                if (voiceHasSeason)
                                {
                                    voicesForSeasonHtml.Append($"<div class=\"videos__button selector{(isActive ? " active" : "")}\" data-json='{{\"method\":\"link\",\"url\":\"{host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(voice)}&s={HttpUtility.UrlEncode(s)}\"}}'>{HttpUtility.HtmlEncode(voice)}</div>");
                                }
                            }
                            voicesForSeasonHtml.Append("</div>");
                            
                            // Показуємо серії
                            var selectedSeasonForVoice = result.serial[t].FirstOrDefault(vs => vs.id == s);
                            int episodeCountForVoice = selectedSeasonForVoice?.episodes?.Count ?? 0;
                            Log($"serial: знайдено сезон '{s}' в озвучці '{t}', кількість серій: {episodeCountForVoice}");
                            
                            if (episodeCountForVoice > 0)
                            {
                                var etpl = new EpisodeTpl();
                                int epNum = 1;
                                foreach (var episode in selectedSeasonForVoice.episodes)
                                {
                                    string dictKey = $"{t}|{s}|{epNum}";
                                    AshdiEpisode ashdiEp = ashdiEpisodesDict.ContainsKey(dictKey) ? ashdiEpisodesDict[dictKey] : null;
                                    string epTitle = !string.IsNullOrEmpty(ashdiEp?.title) ? ashdiEp.title : $"{epNum} серия";
                                    etpl.Append(
                                        epTitle,
                                        title,
                                        s.ToString(),
                                        epNum.ToString(),
                                        $"{host}/uaflix?rjson=True&e={epNum}&s={s}&id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(t)}",
                                        "call",
                                        null, // streamquality
                                        null, // subtitles
                                        null, // streamlink
                                        t // voice_name/details
                                    );
                                    epNum++;
                                }
                                var episodeHtml = etpl.ToHtml();
                                Log($"serial: повертаємо серії для озвучки '{t}' і сезону '{s}'");
                                System.IO.File.WriteAllText("result.txt", "HTML Episodes for voice and season:\n" + voicesForSeasonHtml + episodeHtml);
                                return Content(voicesForSeasonHtml.ToString() + episodeHtml, "text/html; charset=utf-8");
                            }
                            else
                            {
                                Log($"serial: ПРОБЛЕМА! Немає серій для озвучки '{t}' і сезону '{s}'");
                            }
                        }
                        else
                        {
                            Log($"serial: озвучка '{t}' НЕ має сезону '{s}', показуємо сезони цієї озвучки");
                        }
                    }
                    
                    // Якщо сезон не вибрано або ця озвучка не має цього сезону - показуємо сезони цієї озвучки
                    Log($"serial: показуємо сезони для озвучки '{t}'");
                    var seasonsForVoiceHtml = new System.Text.StringBuilder();
                    seasonsForVoiceHtml.Append("<div class=\"videos__line\">");
                    foreach (var voice in result.serial.Keys)
                    {
                        bool isActive = voice == t;
                        seasonsForVoiceHtml.Append($"<div class=\"videos__button selector{(isActive ? " active" : "")}\" data-json='{{\"method\":\"link\",\"url\":\"{host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(voice)}\"}}'>{HttpUtility.HtmlEncode(voice)}</div>");
                    }
                    seasonsForVoiceHtml.Append("</div>");
                    
                    var stplForVoice = new SeasonTpl();
                    foreach (var season in result.serial[t])
                    {
                        bool isActive = season.id == currentSeason;
                        stplForVoice.Append(
                            season.id,
                            $"{host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(t)}&s={HttpUtility.UrlEncode(season.id)}",
                            season.name
                        );
                    }
                    var seasonHtml = stplForVoice.ToHtml();
                    System.IO.File.WriteAllText("result.txt", "HTML Seasons for voice:\n" + seasonsForVoiceHtml + seasonHtml);
                    return Content(seasonsForVoiceHtml.ToString() + seasonHtml, "text/html; charset=utf-8");
                }

                // Якщо вибрано сезон - показуємо серії цього сезону
                if (!string.IsNullOrEmpty(s) && s != "0" && s != "-1")
                {
                    Log($"serial: вибрано сезон '{s}', показуємо серії");
                    
                    // Знаходимо озвучку для цього сезону
                    string seasonVoice = currentVoice;
                    if (allSeasons.TryGetValue(s, out var seasonInfo))
                    {
                        seasonVoice = seasonInfo.voice;
                    }
                    
                    // Показуємо озвучки для цього сезону
                    var voicesForSeasonHtml = new System.Text.StringBuilder();
                    voicesForSeasonHtml.Append("<div class=\"videos__line\">");
                    foreach (var voice in result.serial.Keys)
                    {
                        bool hasSeason = result.serial[voice].Any(vs => vs.id == s);
                        bool isActive = voice == seasonVoice;
                        if (hasSeason)
                        {
                            voicesForSeasonHtml.Append($"<div class=\"videos__button selector{(isActive ? " active" : "")}\" data-json='{{\"method\":\"link\",\"url\":\"{host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(voice)}&s={HttpUtility.UrlEncode(s)}\"}}'>{HttpUtility.HtmlEncode(voice)}</div>");
                        }
                    }
                    voicesForSeasonHtml.Append("</div>");
                    
                    // Показуємо серії
                    var selectedSeasonForS = result.serial[seasonVoice].FirstOrDefault(v => v.id == s);
                    int episodeCountForS = selectedSeasonForS?.episodes?.Count ?? 0;
                    
                    if (episodeCountForS > 0)
                    {
                        var etpl = new EpisodeTpl();
                        int epNum = 1;
                        foreach (var episode in selectedSeasonForS.episodes)
                        {
                            string dictKey = $"{seasonVoice}|{s}|{epNum}";
                            AshdiEpisode ashdiEp = ashdiEpisodesDict.ContainsKey(dictKey) ? ashdiEpisodesDict[dictKey] : null;
                            string epTitle = !string.IsNullOrEmpty(ashdiEp?.title) ? ashdiEp.title : $"{epNum} серия";
                            etpl.Append(
                                epTitle,
                                title,
                                s.ToString(),
                                epNum.ToString(),
                                $"{host}/uaflix?rjson=True&e={epNum}&s={s}&id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(seasonVoice)}",
                                "call",
                                null, // streamquality
                                null, // subtitles
                                null, // streamlink
                                seasonVoice // voice_name/details
                            );
                            epNum++;
                        }
                        var episodeHtml = etpl.ToHtml();
                        System.IO.File.WriteAllText("result.txt", "HTML Episodes for season:\n" + voicesForSeasonHtml + episodeHtml);
                        return Content(voicesForSeasonHtml.ToString() + episodeHtml, "text/html; charset=utf-8");
                    }
                }

                // Якщо є кілька серій і e не задано — повертаємо список серій
                var selectedSeason = result.serial[currentVoice].FirstOrDefault(v => v.id == currentSeason);
                int episodeCount = selectedSeason?.episodes?.Count ?? 0;
                Log($"serial: перевіряємо умову для списку серій: episodeCount={episodeCount}, e='{e}'");
                if (episodeCount > 1 && (string.IsNullOrEmpty(e) || e == "0" || e == "-1"))
                {
                    Log("serial: показуємо список серій (EpisodeTpl)");
                    var etpl = new EpisodeTpl();
                    int epNum = 1;
                    foreach (var episode in selectedSeason.episodes)
                    {
                        string dictKey = $"{currentVoice}|{currentSeason}|{epNum}";
                        AshdiEpisode ashdiEp = ashdiEpisodesDict.ContainsKey(dictKey) ? ashdiEpisodesDict[dictKey] : null;
                        string epTitle = !string.IsNullOrEmpty(ashdiEp?.title) ? ashdiEp.title : $"{epNum} серия";
                        etpl.Append(
                            epTitle,
                            title,
                            currentSeason.ToString(),
                            epNum.ToString(),
                            $"{host}/uaflix?rjson=True&e={epNum}&s={currentSeason}&id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(currentVoice)}",
                            "call",
                            null, // streamquality
                            null, // subtitles
                            null, // streamlink
                            currentVoice // voice_name/details
                        );
                        epNum++;
                    }
                    var episodeHtml = etpl.ToHtml();
                    Log($"serial: EpisodeTpl HTML length={episodeHtml.Length}");
                    System.IO.File.WriteAllText("result.txt", "HTML EpisodeTpl (standard):\n" + voicesHtml + episodeHtml);
                    return Content(voicesHtml.ToString() + episodeHtml, "text/html; charset=utf-8");
                }
                else
                {
                    Log($"serial: умова для списку серій не виконана, переходимо до відтворення");
                }

                // Вибір серії (або автоматично перша)
                var episodeId = e;
                if (episodeCount == 0)
                {
                    System.IO.File.WriteAllText("result.txt", "HTML No episodes");
                    return Content("Пошук не дав результатів.", "text/html; charset=utf-8");
                }
                if (string.IsNullOrEmpty(episodeId) || episodeId == "0" || episodeId == "-1")
                    episodeId = "1"; // Перша серія

                // Перенаправляємо на rjson endpoint для відтворення
                // Тепер episodeId — це номер епізоду, а не id
                var videoUrl = $"/uaflix?rjson=True&e={episodeId}&s={currentSeason}&id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(currentVoice)}";
                return Redirect(videoUrl);
            }

            // --- Фільми ---
            if (result != null && result.movie != null && result.movie.Count > 0)
            {
                var tpl = new MovieTpl(title, original_title, result.movie.Count);
                foreach (var movie in result.movie)
                {
                    var streamquality = new StreamQualityTpl();
                    foreach (var item in movie.links)
                        streamquality.Append(item.link, item.quality);

                    tpl.Append(
                        movie.translation,
                        streamquality.Firts().link,
                        streamquality: streamquality
                    );
                }
                var html = tpl.ToHtml();
                html = DecodeUnicodeEscapes(html);
                System.IO.File.WriteAllText("result.txt", "HTML MovieTpl (movie):\n" + html);
                return Content(html, "text/html; charset=utf-8");
            }

            // Якщо нічого не знайдено
            System.IO.File.WriteAllText("result.txt", "HTML Not found");
            return Content("Пошук не дав результатів.", "text/html; charset=utf-8");
        }

        // --- Пошук і парсинг ---
        async Task<Result> Search(string title, string original_title, long kinopoisk_id, string imdb_id, string memKey)
        {
            Log($"search: START UaFlix:view:{kinopoisk_id}:{imdb_id}");
            Log($"search: шукаємо за назвою: '{title}', оригінальною назвою: '{original_title}'");

            // Формуємо пошуковий запит
            string searchUrl = $"https://uafix.net/index.php?do=search&subaction=search&story={HttpUtility.UrlEncode(title)}";
            Log($"search: searchUrl {searchUrl}");

            var searchHtml = await httpClient.GetStringAsync(searchUrl);
            System.IO.File.WriteAllText("search.html", searchHtml);
            Log($"search: отримано HTML пошуку, довжина = {searchHtml.Length}");

            var doc = new HtmlDocument();
            doc.LoadHtml(searchHtml);

            // Знаходимо перший результат
            var filmNodes = doc.DocumentNode.SelectNodes("//a[contains(@class,'sres-wrap')]");
            Log($"search: filmNodes.Count = {(filmNodes != null ? filmNodes.Count : 0)}");
            if (filmNodes == null || filmNodes.Count == 0)
            {
                Log("search: не знайдено результатів з класом 'sres-wrap'");
                var allLinks = doc.DocumentNode.SelectNodes("//a");
                if (allLinks != null)
                {
                    Log($"search: знайдено {allLinks.Count} посилань на сторінці");
                    foreach (var link in allLinks.Take(10)) // Показуємо перші 10
                    {
                        string linkClass = link.GetAttributeValue("class", "");
                        string linkHref = link.GetAttributeValue("href", "");
                        string linkText = link.InnerText?.Trim();
                        Log($"search: link class='{linkClass}', href='{linkHref}', text='{linkText}'");
                    }
                }
                return null;
            }

            // Показуємо всі знайдені результати
            Log($"search: знайдено {filmNodes.Count} результатів:");
            for (int i = 0; i < Math.Min(filmNodes.Count, 10); i++) // Показуємо перші 10
            {
                var node = filmNodes[i];
                string href = node.GetAttributeValue("href", "");
                string text = node.InnerText?.Trim();
                Log($"search: результат {i + 1}: href='{href}', text='{text}'");
            }

            // Вибираємо найкращий результат замість першого
            var bestMatch = FindBestMatch(filmNodes, title, original_title);
            string filmUrl = bestMatch.href;
            string filmTitle = bestMatch.text;
            Log($"search: вибрано найкращий результат: '{filmTitle}' з URL: {filmUrl}");
            
            if (string.IsNullOrEmpty(filmUrl))
            {
                Log("search: ПРОБЛЕМА! Не знайдено жодного підходящого результату");
                return null;
            }

            var filmHtml = await httpClient.GetStringAsync(filmUrl);
            Log($"search: отримано HTML фільму, довжина = {filmHtml.Length}");
            System.IO.File.WriteAllText("film.html", filmHtml);

            var filmDoc = new HtmlDocument();
            filmDoc.LoadHtml(filmHtml);

            // Перевіряємо заголовок сторінки
            var titleNode = filmDoc.DocumentNode.SelectSingleNode("//title");
            if (titleNode != null)
            {
                Log($"search: заголовок сторінки: '{titleNode.InnerText?.Trim()}'");
            }

            // --- Ashdi iframe (серіали) ---
            var ashdiIframeNode = filmDoc.DocumentNode.SelectSingleNode("//iframe[contains(@src,'ashdi.vip/serial/')]");
            if (ashdiIframeNode != null)
            {
                string ashdiUrl = ashdiIframeNode.GetAttributeValue("src", "");
                Log($"search: знайдено Ashdi iframe: {ashdiUrl}");
                var ashdiHtml = await httpClient.GetStringAsync(ashdiUrl);
                Log($"search: отримано HTML Ashdi, довжина = {ashdiHtml.Length}");
                System.IO.File.WriteAllText("ashdi.html", ashdiHtml);

                var ashdiFileMatch = Regex.Match(ashdiHtml, @"file:'(\[.*?\])'");
                if (ashdiFileMatch.Success)
                {
                    string fileJson = ashdiFileMatch.Groups[1].Value;
                    Log($"search: знайдено file:'[...]' (довжина json: {fileJson.Length})");
                    System.IO.File.WriteAllText("ashdi.json", fileJson);
                    
                    // Парсимо Ashdi JSON
                    var voices = JsonConvert.DeserializeObject<List<AshdiVoice>>(fileJson);
                    Log($"Ashdi: voices.Count = {voices.Count}");
                    foreach (var v in voices)
                        Log($"Ashdi: voice '{v.title}', seasons: {(v.folder != null ? v.folder.Count : 0)}");

                    // Очищаємо словник перед новим парсингом
                    ashdiEpisodesDict.Clear();

                    // Конвертуємо в твої моделі (Lampac-style: Voice -> List<Season> -> List<Episode>)
                    var serialDict = new Dictionary<string, List<Voice>>();
                    foreach (var voice in voices)
                    {
                        var voiceSeasons = new List<Voice>();
                        foreach (var season in voice.folder ?? new List<AshdiSeason>())
                        {
                            // Витягуємо номер сезону як число
                            string seasonNum = System.Text.RegularExpressions.Regex.Match(season.title, "\\d+").Value;
                            var episodesList = new List<Serial>();
                            Log($"Ashdi: season '{season.title}', episodes: {(season.folder != null ? season.folder.Count : 0)}");
                            int epNum = 1;
                            foreach (var episode in season.folder ?? new List<AshdiEpisode>())
                            {
                                Log($"Ashdi: episode '{episode.title}', id: {episode.id}, file: {episode.file}, epNum: {epNum}");
                                episodesList.Add(new Serial
                                {
                                    id = episode.id,
                                    links = new List<(string link, string quality)> { (episode.file, "1080p") }
                                });
                                // Додаємо у словник для подальшого доступу у Index (по номеру епізоду)
                                ashdiEpisodesDict[$"{voice.title.Trim()}|{seasonNum}|{epNum}"] = episode;
                                epNum++;
                            }
                            voiceSeasons.Add(new Voice
                            {
                                id = seasonNum, // тільки число!
                                name = $"{seasonNum} сезон",
                                episodes = episodesList
                            });
                        }
                        serialDict[voice.title.Trim()] = voiceSeasons;
                    }
                    var res = new Result
                    {
                        serial = serialDict,
                        movie = new List<Movie>()
                    };
                    hybridCache.Set(memKey, res, cacheTime(5));
                    proxyManager.Success();
                    Log("search: Ashdi серіал успішно розпарсено");
                    return res;
                }
                else
                {
                    Log("search: Ashdi file:'[...]' не знайдено");
                }
            }
            else
            {
                Log("search: Ashdi iframe не знайдено");
            }

            // --- Zetvideo iframe (фільми) ---
            var zetIframeNode = filmDoc.DocumentNode.SelectSingleNode("//iframe[contains(@src,'zetvideo.net/vod/')]");
            if (zetIframeNode != null)
            {
                string zetUrl = zetIframeNode.GetAttributeValue("src", "");
                Log($"search: знайдено Zetvideo iframe: {zetUrl}");
                var zetHtml = await httpClient.GetStringAsync(zetUrl);
                Log($"search: отримано HTML Zetvideo, довжина = {zetHtml.Length}");

                // Парсимо прямий лінк на m3u8
                var videoMatch = Regex.Match(zetHtml, @"<video[^>]+src=""([^""]+\.m3u8)""");
                if (videoMatch.Success)
                {
                    string m3u8 = videoMatch.Groups[1].Value;
                    Log($"search: знайдено m3u8: {m3u8}");

                    var movie = new Movie
                    {
                        translation = "Оригінал",
                        links = new List<(string link, string quality)> { (m3u8, "1080p") }
                    };

                    var res = new Result
                    {
                        movie = new List<Movie> { movie },
                        serial = new Dictionary<string, List<Voice>>()
                    };
                    hybridCache.Set(memKey, res, cacheTime(5));
                    proxyManager.Success();
                    Log("search: Zetvideo фільм успішно розпарсено");
                    return res;
                }
                else
                {
                    Log("search: Zetvideo m3u8 не знайдено");
                }
            }
            else
            {
                Log("search: Zetvideo iframe не знайдено");
            }

            Log("search: не знайдено жодного підходящого iframe");
            return null;
        }

        // --- Endpoint для відтворення серії ---
        [HttpGet("player")]
        public IActionResult Player(string e, string s, string title = "", string v = "")
        {
            // Нормалізуємо e (видаляємо зайві нулі)
            string normE = int.TryParse(e, out var eNum) ? eNum.ToString() : e;
            string dictKey = $"{v}|{s}|{normE}";
            
            if (!ashdiEpisodesDict.TryGetValue(dictKey, out var episode))
                return Content("Серія не знайдена.", "text/html; charset=utf-8");

            string host = $"{Request.Scheme}://{Request.Host}";
            string backUrl = $"{host}/uaflix?title={HttpUtility.UrlEncode(title)}&v={HttpUtility.UrlEncode(v)}";
            
            string html = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>{HttpUtility.HtmlEncode(title)} - Серія {e}</title>
    <style>
        body {{ margin: 0; padding: 20px; background: #000; color: #fff; font-family: Arial, sans-serif; }}
        .back-link {{ margin-bottom: 20px; }}
        .back-link a {{ color: #fff; text-decoration: none; }}
        .back-link a:hover {{ text-decoration: underline; }}
        video {{ width: 100%; max-width: 1200px; height: auto; }}
    </style>
</head>
<body>
    <div class='back-link'>
        <a href='{backUrl}'>&larr; Назад до серіалу</a>
    </div>
    <video controls autoplay>
        <source src='{episode.file}' type='application/x-mpegURL'>
        Ваш браузер не підтримує відео.
    </video>
</body>
</html>";
            
            return Content(html, "text/html; charset=utf-8");
        }

        [HttpGet("video")]
        public IActionResult Video(string e, string s, long id = 0, string imdb_id = "", long kinopoisk_id = 0, string title = "", string original_title = "")
        {
            // Цей endpoint більше не потрібен, залишено для сумісності
            return Json(new { method = "error", message = "Використовуйте rjson=True" });
        }
    }
}
