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
                // Нормалізуємо e (видаляємо зайві нулі)
                string normE = int.TryParse(e, out var eNum) ? eNum.ToString() : e;
                string dictKey = $"{s}|{normE}";
                Log($"rjson: s={s}, e={e}, normE={normE}, dictKey={dictKey}, keys={string.Join(",", ashdiEpisodesDict.Keys)}");
                if (!ashdiEpisodesDict.TryGetValue(dictKey, out var episode))
                    return Content(Newtonsoft.Json.JsonConvert.SerializeObject(new { method = "error", message = "Серія не знайдена." }, new Newtonsoft.Json.JsonSerializerSettings { StringEscapeHandling = Newtonsoft.Json.StringEscapeHandling.Default }), "application/json");

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
                // Вибір озвучки
                var voiceKey = v;
                if (string.IsNullOrEmpty(voiceKey) || !result.serial.ContainsKey(voiceKey))
                    voiceKey = result.serial.Keys.First();
                var voices = result.serial[voiceKey];

                // Вибір сезону (або автоматично перший)
                var seasonKey = s;
                if (string.IsNullOrEmpty(seasonKey) || seasonKey == "0" || seasonKey == "-1" || !voices.Any(vv => vv.id == seasonKey))
                    seasonKey = voices.First().id;

                // Формуємо HTML-фільтр озвучок
                var voicesHtml = new System.Text.StringBuilder();
                voicesHtml.Append("<div class=\"videos__line\">");
                foreach (var voice in result.serial.Keys)
                {
                    bool isActive = voice == voiceKey;
                    voicesHtml.Append($"<div class=\"videos__button selector{(isActive ? " active" : "")}\" data-json='{{\"method\":\"link\",\"url\":\"{host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={System.Web.HttpUtility.UrlEncode(title)}&original_title={System.Web.HttpUtility.UrlEncode(original_title)}&v={System.Web.HttpUtility.UrlEncode(voice)}&s={seasonKey}\"}}'>{System.Web.HttpUtility.HtmlEncode(voice)}</div>");
                }
                voicesHtml.Append("</div>");

                // Якщо є кілька сезонів і s не задано — повертаємо список сезонів
                if (voices.Count > 1 && (string.IsNullOrEmpty(s) || s == "0" || s == "-1"))
                {
                    var stpl = new SeasonTpl();
                    foreach (var seasonItem in voices)
                        stpl.Append(
                            seasonItem.id,
                            $"{host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={System.Web.HttpUtility.UrlEncode(title)}&original_title={System.Web.HttpUtility.UrlEncode(original_title)}&v={System.Web.HttpUtility.UrlEncode(voiceKey)}&s={System.Web.HttpUtility.UrlEncode(seasonItem.id)}",
                            seasonItem.id
                        );
                    var seasonHtml = stpl.ToHtml();
                    System.IO.File.WriteAllText("result.txt", "HTML SeasonTpl:\n" + voicesHtml + seasonHtml);
                    return Content(voicesHtml.ToString() + seasonHtml, "text/html; charset=utf-8");
                }

                // Якщо є кілька серій і e не задано — повертаємо список серій
                Log($"serial: перевіряємо умову для списку серій: season.episodes.Count={voices.Count}, e='{e}'");
                if (voices.Count > 1 && (string.IsNullOrEmpty(e) || e == "0" || e == "-1"))
                {
                    Log("serial: показуємо список серій (EpisodeTpl)");
                    var etpl = new EpisodeTpl();
                    int epNum = 1;
                    foreach (var episode in voices)
                    {
                        string dictKey = $"{seasonKey}|{epNum}";
                        AshdiEpisode ashdiEp = ashdiEpisodesDict.ContainsKey(dictKey) ? ashdiEpisodesDict[dictKey] : null;
                        string epTitle = !string.IsNullOrEmpty(ashdiEp?.title) ? ashdiEp.title : $"{epNum} серия";
                        etpl.Append(
                            epTitle,
                            title,
                            seasonKey.ToString(),
                            epNum.ToString(),
                            $"{host}/uaflix?rjson=True&e={epNum}&s={seasonKey}&id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={System.Web.HttpUtility.UrlEncode(title)}&original_title={System.Web.HttpUtility.UrlEncode(original_title)}&v={System.Web.HttpUtility.UrlEncode(voiceKey)}",
                            "call",
                            null, // streamquality
                            null, // subtitles
                            null, // streamlink
                            voiceKey // voice_name/details
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
                if (voices.Count == 0)
                {
                    System.IO.File.WriteAllText("result.txt", "HTML No episodes");
                    return Content("Пошук не дав результатів.", "text/html; charset=utf-8");
                }
                if (string.IsNullOrEmpty(episodeId) || episodeId == "0" || episodeId == "-1" || !voices.Any(ep => ep.id == episodeId))
                    episodeId = voices.First().id;

                // Перенаправляємо на rjson endpoint для відтворення
                // Тепер episodeId — це номер епізоду, а не id
                var videoUrl = $"/uaflix?rjson=True&e={episodeId}&s={seasonKey}&id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={System.Web.HttpUtility.UrlEncode(title)}&original_title={System.Web.HttpUtility.UrlEncode(original_title)}&v={System.Web.HttpUtility.UrlEncode(voiceKey)}";
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
                var allLinks = doc.DocumentNode.SelectNodes("//a");
                if (allLinks != null)
                {
                    foreach (var link in allLinks)
                    {
                        Log("a class: " + link.GetAttributeValue("class", "") + ", href: " + link.GetAttributeValue("href", ""));
                    }
                }
                return null;
            }

            string filmUrl = filmNodes[0].GetAttributeValue("href", "");
            Log($"search: filmUrl = {filmUrl}");

            var filmHtml = await httpClient.GetStringAsync(filmUrl);
            Log($"search: отримано HTML фільму, довжина = {filmHtml.Length}");

            var filmDoc = new HtmlDocument();
            filmDoc.LoadHtml(filmHtml);

            // --- Ashdi iframe (серіали) ---
            var ashdiIframeNode = filmDoc.DocumentNode.SelectSingleNode("//iframe[contains(@src,'ashdi.vip/serial/')]");
            if (ashdiIframeNode != null)
            {
                string ashdiUrl = ashdiIframeNode.GetAttributeValue("src", "");
                Log($"search: знайдено Ashdi iframe: {ashdiUrl}");
                var ashdiHtml = await httpClient.GetStringAsync(ashdiUrl);
                Log($"search: отримано HTML Ashdi, довжина = {ashdiHtml.Length}");

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
                                ashdiEpisodesDict[$"{seasonNum}|{epNum}"] = episode;
                                epNum++;
                            }
                            voiceSeasons.Add(new Voice
                            {
                                id = seasonNum, // тільки число!
                                name = season.title.Trim(),
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

            return null;
        }

        // --- Endpoint для відтворення серії ---
        [HttpGet("video")]
        public IActionResult Video(string e, string s, long id = 0, string imdb_id = "", long kinopoisk_id = 0, string title = "", string original_title = "")
        {
            // Цей endpoint більше не потрібен, залишено для сумісності
            return Json(new { method = "error", message = "Використовуйте rjson=True" });
        }
    }
}
