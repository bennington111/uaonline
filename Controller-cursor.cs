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
    public class UaflixController : BaseController
    {
        ProxyManager proxyManager = new ProxyManager(ModInit.UaFlix);
        static HttpClient httpClient = new HttpClient();

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
            bool rjson = false)
        {
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
                result = await Search(title, original_title, kinopoisk_id, imdb_id, memKey);
            }

            // --- Серіали ---
            if (result != null && result.serial != null && result.serial.Count > 0)
            {
                // 1. Вибір озвучки
                if (string.IsNullOrEmpty(t) || !result.serial.ContainsKey(t))
                {
                    var vtpl = new VoiceTpl();
                    foreach (var voice in result.serial.Keys)
                        vtpl.Append(voice, false, $"{host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(voice)}");
                    return Content(vtpl.ToHtml(), "text/html; charset=utf-8");
                }

                // 2. Вибір серії
                var voices = result.serial[t];
                var allEpisodes = new List<Serial>();
                foreach (var voice in voices)
                {
                    if (voice.episodes != null)
                        allEpisodes.AddRange(voice.episodes);
                }

                if (string.IsNullOrEmpty(e) || !allEpisodes.Any(ep => ep.id == e))
                {
                    var etpl = new EpisodeTpl();
                    foreach (var episode in allEpisodes)
                    {
                        etpl.Append(
                            episode.id, // використовуємо id як назву
                            $"{title ?? original_title} ({episode.id})",
                            "1", // сезон
                            episode.id,
                            $"{host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(t)}&e={episode.id}"
                        );
                    }
                    return Content(etpl.ToHtml(), "text/html; charset=utf-8");
                }

                // 3. Віддача відео для серії
                var serialEp = allEpisodes.First(ep => ep.id == e);
                var tpl2 = new MovieTpl(title, original_title, 1);
                var streamquality = new StreamQualityTpl();
                foreach (var link in serialEp.links)
                    streamquality.Append(link.link, link.quality);
                tpl2.Append(
                    $"{serialEp.id}",
                    streamquality.Firts().link,
                    streamquality: streamquality
                );
                var html2 = tpl2.ToHtml();
                html2 = DecodeUnicodeEscapes(html2);
                return Content(html2, "text/html; charset=utf-8");
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
                return Content(html, "text/html; charset=utf-8");
            }

            // Якщо нічого не знайдено
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
            Log($"search: отримано HTML пошуку, довжина = {searchHtml.Length}");

            var doc = new HtmlDocument();
            doc.LoadHtml(searchHtml);

            // Знаходимо перший результат
            var filmNodes = doc.DocumentNode.SelectNodes("//a[contains(@class,'sres-wrap')]");
            Log($"search: filmNodes.Count = {(filmNodes != null ? filmNodes.Count : 0)}");
            if (filmNodes == null || filmNodes.Count == 0)
                return null;

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
                    
                    // Парсимо Ashdi JSON
                    var voices = JsonConvert.DeserializeObject<List<AshdiVoice>>(fileJson);
                    
                    // Конвертуємо в твої моделі
                    var serialDict = new Dictionary<string, List<Voice>>();
                    
                    foreach (var voice in voices)
                    {
                        var episodesList = new List<Serial>();
                        
                        // Збираємо всі серії з усіх сезонів
                        foreach (var season in voice.folder ?? new List<AshdiSeason>())
                        {
                            foreach (var episode in season.folder ?? new List<AshdiEpisode>())
                            {
                                episodesList.Add(new Serial
                                {
                                    id = episode.id,
                                    links = new List<(string link, string quality)> { (episode.file, "1080p") }
                                });
                            }
                        }
                        
                        serialDict[voice.title.Trim()] = new List<Voice>
                        {
                            new Voice
                            {
                                id = voice.title.Trim(),
                                name = voice.title.Trim(),
                                episodes = episodesList
                            }
                        };
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
    }
}
