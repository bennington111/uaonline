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
using Uaflix.Models.UaFlix;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Uaflix.Controllers
{
    public class Controller : BaseController
    {
        ProxyManager proxyManager = new ProxyManager(ModInit.UaFlix);
        static HttpClient httpClient = new HttpClient();

        [HttpGet]
        [Route("subtitles")]
        async public Task<ActionResult> Subtitles(string url)
        {
            if (string.IsNullOrEmpty(url))
                return BadRequest("URL parameter is required");

            try
            {
                Console.WriteLine($"UaFlix: Proxying subtitle from: {url}");
                Console.WriteLine($"UaFlix: Request headers: User-Agent=Mozilla/5.0, Referer=https://uafix.net/");
                
                var request = new HttpRequestMessage(HttpMethod.Get, url);
                request.Headers.Add("User-Agent", "Mozilla/5.0");
                request.Headers.Add("Referer", "https://uafix.net/");
                
                var response = await httpClient.SendAsync(request);
                var content = await response.Content.ReadAsStringAsync();
                
                Console.WriteLine($"UaFlix: Subtitle proxy response status: {response.StatusCode}, length: {content.Length}");
                Console.WriteLine($"UaFlix: Response headers: {string.Join(", ", response.Headers.Select(h => $"{h.Key}={string.Join(";", h.Value)}"))}");
                Console.WriteLine($"UaFlix: Content preview: {content.Substring(0, Math.Min(200, content.Length))}");
                
                // Перевіряємо чи відповідь успішна
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"UaFlix: Subtitle proxy failed with status: {response.StatusCode}");
                    return StatusCode((int)response.StatusCode, $"Failed to fetch subtitle: {response.StatusCode}");
                }
                
                // Перевіряємо чи контент не порожній
                if (string.IsNullOrEmpty(content))
                {
                    Console.WriteLine($"UaFlix: Subtitle proxy returned empty content");
                    return StatusCode(404, "Subtitle content is empty");
                }
                
                // Визначаємо правильний Content-Type на основі розширення файлу
                string contentType = "text/vtt; charset=utf-8";
                if (url.Contains(".srt"))
                    contentType = "text/plain; charset=utf-8";
                else if (url.Contains(".vtt"))
                    contentType = "text/vtt; charset=utf-8";
                else if (url.Contains(".ass") || url.Contains(".ssa"))
                    contentType = "text/plain; charset=utf-8";
                
                Console.WriteLine($"UaFlix: Using content type: {contentType}");
                
                // Повертаємо субтитри з правильними заголовками
                var result = new ContentResult
                {
                    Content = content,
                    ContentType = contentType
                };
                
                // Додаємо повний набір CORS заголовків
                Response.Headers.Add("Access-Control-Allow-Origin", "*");
                Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Accept, Origin, X-Requested-With");
                Response.Headers.Add("Access-Control-Max-Age", "86400");
                
                // Додаємо додаткові заголовки для кешування
                Response.Headers.Add("Cache-Control", "public, max-age=3600");
                Response.Headers.Add("Vary", "Accept-Encoding");
                
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"UaFlix: Subtitle proxy error: {ex.Message}");
                return StatusCode(500, "Failed to proxy subtitle");
            }
        }

        [HttpOptions]
        [Route("subtitles")]
        public ActionResult SubtitlesOptions()
        {
            Response.Headers.Add("Access-Control-Allow-Origin", "*");
            Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Accept, Origin, X-Requested-With");
            Response.Headers.Add("Access-Control-Max-Age", "86400");
            return Ok();
        }

        [HttpGet]
        [Route("uaflix")]
        async public Task<ActionResult> Index(long id, string imdb_id, long kinopoisk_id, string title, string original_title, string original_language, int year, string source, int serial, string account_email, string t, int s = -1, bool rjson = false)
        {
            Console.WriteLine($"UaFlix: Index method called with rjson={rjson}");
            var init = ModInit.UaFlix;
            if (!init.enable)
                return Forbid();

            var proxy = proxyManager.Get();
            Console.WriteLine($"UaFlix: Index method - calling search");
            var result = await search(imdb_id, kinopoisk_id, title, original_title, serial);
            Console.WriteLine($"UaFlix: Index method - search returned: {result != null}");

            // Видаляємо цю перевірку - повертаємося до стандартного підходу

            // Гарантуємо, що subtitles правильно ініціалізовані
            if (result?.movie != null)
            {
                foreach (var m in result.movie)
                {
                    // Перевіряємо чи subtitles порожні або null
                    if (m.subtitles == null || !m.subtitles.HasValue || m.subtitles.Value.IsEmpty())
                        m.subtitles = null;
                }
            }
            if (result?.serial != null)
            {
                foreach (var voices in result.serial.Values)
                {
                    foreach (var voice in voices)
                    {
                        foreach (var ep in voice.episodes)
                        {
                            // Перевіряємо чи subtitles порожні або null
                            if (ep.subtitles == null || !ep.subtitles.HasValue || ep.subtitles.Value.IsEmpty())
                                ep.subtitles = null;
                        }
                    }
                }
            }

            Console.WriteLine($"UaFlix: Index method - result is null: {result == null}");
            if (result == null)
            {
                proxyManager.Refresh();
                return Content("Uaflix", "text/html; charset=utf-8");
            }

            Console.WriteLine($"UaFlix: Index method - result.movie count: {result.movie?.Count ?? 0}");
            Console.WriteLine($"UaFlix: Index method - result.serial is null: {result.serial == null}");

            // Додаємо детальне логування результатів
            if (result.movie != null)
            {
                Console.WriteLine($"UaFlix: Index method - processing {result.movie.Count} movies from search result");
                for (int i = 0; i < result.movie.Count; i++)
                {
                    Console.WriteLine($"UaFlix: Index method - movie {i} subtitles: {Newtonsoft.Json.JsonConvert.SerializeObject(result.movie[i].subtitles?.ToObject())}");
                    Console.WriteLine($"UaFlix: Index method - movie {i} subtitles IsEmpty: {result.movie[i].subtitles?.IsEmpty()}");
                }
            }

            if (result.movie != null)
            {
                Console.WriteLine($"UaFlix: Index method - processing {result.movie.Count} movies");
                var tpl = new MovieTpl(title, original_title, result.movie.Count);

                foreach (var movie in result.movie)
                {
                    var streamquality = new StreamQualityTpl();
                    foreach (var item in movie.links)
                        streamquality.Append(HostStreamProxy(ModInit.UaFlix, item.link, proxy: proxy), item.quality);

                    Console.WriteLine($"UaFlix: Before tpl.Append - movie subtitles: {Newtonsoft.Json.JsonConvert.SerializeObject(movie.subtitles?.ToObject())}");
                    Console.WriteLine($"UaFlix: Before tpl.Append - movie subtitles IsEmpty: {movie.subtitles?.IsEmpty()}");
                    
                    // Проксуємо субтитри через наш сервер для уникнення CORS
                    if (movie.subtitles != null && !movie.subtitles.Value.IsEmpty())
                    {
                        var subtitleObjects = movie.subtitles.Value.ToObject();
                        if (subtitleObjects is Newtonsoft.Json.Linq.JArray subtitleArray)
                        {
                            var newSubtitles = new SubtitleTpl();
                            foreach (var sub in subtitleArray)
                            {
                                var originalUrl = sub["url"]?.ToString();
                                var label = sub["label"]?.ToString();
                                
                                if (!string.IsNullOrEmpty(originalUrl) && !string.IsNullOrEmpty(label))
                                {
                                    // Створюємо проксований URL для субтитрів
                                    var encodedUrl = HttpUtility.UrlEncode(originalUrl);
                                    var proxyUrl = $"{host}/subtitles?url={encodedUrl}";
                                    Console.WriteLine($"UaFlix: Proxying subtitle {label}: {originalUrl} -> {proxyUrl}");
                                    Console.WriteLine($"UaFlix: Encoded URL: {encodedUrl}");
                                    newSubtitles.Append(label, proxyUrl);
                                }
                            }
                            movie.subtitles = newSubtitles;
                            Console.WriteLine($"UaFlix: Proxied subtitles: {Newtonsoft.Json.JsonConvert.SerializeObject(newSubtitles.ToObject())}");
                        }
                    }

                    tpl.Append(
                        movie.translation,
                        streamquality.Firts().link,
                        streamquality: streamquality,
                        subtitles: movie.subtitles
                    );
                    var html = tpl.ToHtml();
                    Console.WriteLine($"UaFlix: After tpl.Append - tpl.ToHtml() length: {html.Length}");
                    Console.WriteLine($"UaFlix: After tpl.Append - tpl.ToHtml() contains 'subtitle': {html.Contains("subtitle")}");
                    Console.WriteLine($"UaFlix: After tpl.Append - HTML snippet: {html.Substring(0, Math.Min(200, html.Length))}");
                    // Знаходимо позицію субтитрів у HTML
                    var subtitleIndex = html.IndexOf("subtitle");
                    if (subtitleIndex >= 0)
                    {
                        var subtitleSnippet = html.Substring(subtitleIndex, Math.Min(100, html.Length - subtitleIndex));
                        Console.WriteLine($"UaFlix: Subtitle position in HTML: {subtitleIndex}, snippet: {subtitleSnippet}");
                    }
                }

                if (rjson)
                {
                    Console.WriteLine($"UaFlix: Index method - returning JSON response");
                    var movies = result.movie.Select(m => new {
                        translation = m.translation,
                        links = m.links,
                        subtitles = m.subtitles != null && m.subtitles.HasValue && !m.subtitles.Value.IsEmpty() 
                            ? m.subtitles.Value.ToObject() 
                            : new List<object>(),
                        // додайте інші потрібні поля, якщо потрібно
                    }).ToList();
                    var jsonResponse = JsonConvert.SerializeObject(new { movie = movies });
                    Console.WriteLine($"UaFlix: JSON response length: {jsonResponse.Length}");
                    Console.WriteLine($"UaFlix: JSON response contains 'subtitle': {jsonResponse.Contains("subtitle")}");
                    return Content(jsonResponse, "application/json; charset=utf-8");
                }
                else
                {
                    Console.WriteLine($"UaFlix: Index method - returning HTML response");
                    return Content(tpl.ToHtml(), "text/html; charset=utf-8");
                }
            }

            if (result.serial != null)
            {
                string defaultargs = $"&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&serial={serial}";

                if (s == -1)
                {
                    // Показуємо список сезонів
                    var tpl = new SeasonTpl(quality: "1080p");
                
                foreach (var voice in result.serial)
                    {
                        foreach (var season in voice.Value)
                            tpl.Append($"{season.id} сезон", $"{host}/uaflix?s={season.id}&t={voice.Key}" + defaultargs, season.id);
                    }

                    return rjson
                        ? Content(tpl.ToJson(), "application/json; charset=utf-8")
                        : Content(tpl.ToHtml(), "text/html; charset=utf-8");
                }
                else
                {
                    // Показуємо епізоди конкретного сезону
                    var etpl = new EpisodeTpl();
                    Console.WriteLine($"UaFlix: s param = '{s}'");
                    
                    // Використовуємо окремий метод для парсингу сезону з кешем
                    var seasonResult = await searchSeason(imdb_id, kinopoisk_id, title, original_title, s);
                    if (seasonResult == null || seasonResult.serial == null || !seasonResult.serial.ContainsKey("Українська") || seasonResult.serial["Українська"].Count == 0)
                    {
                        return Content("Uaflix", "text/html; charset=utf-8");
                    }
                    
                    var selectedSeason = seasonResult.serial["Українська"].First();
                    Console.WriteLine($"UaFlix: season id = '{selectedSeason.id}'");

                    // Сортуємо і видаляємо дублікати
                    var uniqueEpisodes = selectedSeason.episodes
                        .GroupBy(x => x.episode)
                        .Select(g => g.First())
                        .OrderBy(x => int.Parse(x.episode));

                    var episodes = new List<Episode>();
                    foreach (var ep in uniqueEpisodes)
                    {
                        var episodeUrl = ep.url;
                        var episodeId = ep.episode;

                        var episode = new Episode
                        {
                            episode = episodeId,
                            links = new List<LinkQuality>(),
                            url = episodeUrl,
                            subtitles = ep.subtitles ?? new SubtitleTpl()
                        };
                        SubtitleTpl? episodeSubtitles = null;
                        try
                        {
                            var episodeHtml = await httpClient.GetStringAsync(episodeUrl);
                            var episodeDoc = new HtmlDocument();
                            episodeDoc.LoadHtml(episodeHtml);
                            var iframeNodes = episodeDoc.DocumentNode.SelectNodes("//div[contains(@class, 'video-box')]/iframe | //iframe[contains(@src, 'zetvideo.net')] | //meta[@property='og:video:iframe']");
                            if (iframeNodes != null)
                            {
                                var uniqueIframeUrls = new HashSet<string>();

                                foreach (var iframe in iframeNodes)
                                {
                                    string iframeUrl = "";
                                    
                                    // Якщо це meta тег, витягуємо iframe з content
                                    if (iframe.Name == "meta" && iframe.GetAttributeValue("property", "") == "og:video:iframe")
                                    {
                                        var content = iframe.GetAttributeValue("content", "");
                                        var iframeMatch = Regex.Match(content, @"src=['\""]([^'\""]+)['\""]");
                                        if (iframeMatch.Success)
                                            iframeUrl = iframeMatch.Groups[1].Value;
                                    }
                                    else
                                    {
                                        iframeUrl = iframe.GetAttributeValue("src", "");
                                    }
                                    
                                    if (string.IsNullOrEmpty(iframeUrl) || !iframeUrl.Contains("zetvideo.net")) continue;
                                    if (!uniqueIframeUrls.Add(iframeUrl)) continue;
                                    Console.WriteLine($"UaFlix: Processing zetvideo URL: {iframeUrl}");
                                    var zlinks = await ParseAllZetvideoSources(iframeUrl);
                                    Console.WriteLine($"UaFlix: Found {zlinks.Count} zetvideo links");
                                    var subtitlesResult = await ParseZetvideoSubtitles(iframeUrl);
                                    if (subtitlesResult != null)
                                    {
                                        episodeSubtitles = subtitlesResult;
                                    }
                                    foreach (var l in zlinks)
                                        episode.links.Add(new LinkQuality { link = l.link, quality = l.quality });
                                }
                            }
                            // Якщо не zetvideo, але хочемо парсити субтитри з основної сторінки
                            episode.subtitles = episodeSubtitles ?? new SubtitleTpl();

                            // Проксуємо субтитри для епізодів при парсингу
                            if (episode.subtitles != null && !episode.subtitles.Value.IsEmpty())
                            {
                                var subtitleObjects = episode.subtitles.Value.ToObject();
                                if (subtitleObjects is Newtonsoft.Json.Linq.JArray subtitleArray)
                                {
                                    var newSubtitles = new SubtitleTpl();
                                    foreach (var sub in subtitleArray)
                                    {
                                        var originalUrl = sub["url"]?.ToString();
                                        var label = sub["label"]?.ToString();
                                        
                                        if (!string.IsNullOrEmpty(originalUrl) && !string.IsNullOrEmpty(label))
                                        {
                                            var encodedUrl = HttpUtility.UrlEncode(originalUrl);
                                            var proxyUrl = $"{host}/subtitles?url={encodedUrl}";
                                            Console.WriteLine($"UaFlix: Proxying parsed episode subtitle {label}: {originalUrl} -> {proxyUrl}");
                                            Console.WriteLine($"UaFlix: Encoded parsed episode URL: {encodedUrl}");
                                            newSubtitles.Append(label, proxyUrl);
                                        }
                                    }
                                    episode.subtitles = newSubtitles;
                                    Console.WriteLine($"UaFlix: Proxied parsed episode subtitles: {Newtonsoft.Json.JsonConvert.SerializeObject(newSubtitles.ToObject())}");
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Episode parse error: {ex.Message}");
                        }
                        episodes.Add(episode);
                    }

                    foreach (var episode in episodes)
                    {
                        var streamquality = new StreamQualityTpl();
                        foreach (var item in episode.links)
                            streamquality.Append(HostStreamProxy(ModInit.UaFlix, item.link, proxy: proxy), item.quality);

                        // Проксуємо субтитри для епізодів
                        if (episode.subtitles != null && !episode.subtitles.Value.IsEmpty())
                        {
                            var subtitleObjects = episode.subtitles.Value.ToObject();
                            if (subtitleObjects is Newtonsoft.Json.Linq.JArray subtitleArray)
                            {
                                var newSubtitles = new SubtitleTpl();
                                foreach (var sub in subtitleArray)
                                {
                                    var originalUrl = sub["url"]?.ToString();
                                    var label = sub["label"]?.ToString();
                                    
                                    if (!string.IsNullOrEmpty(originalUrl) && !string.IsNullOrEmpty(label))
                                    {
                                        var encodedUrl = HttpUtility.UrlEncode(originalUrl);
                                        var proxyUrl = $"{host}/subtitles?url={encodedUrl}";
                                        Console.WriteLine($"UaFlix: Proxying episode subtitle {label}: {originalUrl} -> {proxyUrl}");
                                        Console.WriteLine($"UaFlix: Encoded episode URL: {encodedUrl}");
                                        newSubtitles.Append(label, proxyUrl);
                                    }
                                }
                                episode.subtitles = newSubtitles;
                                Console.WriteLine($"UaFlix: Proxied episode subtitles: {Newtonsoft.Json.JsonConvert.SerializeObject(newSubtitles.ToObject())}");
                            }
                        }
                        
                        etpl.Append($"{episode.episode} серия", $"{title ?? original_title} ({episode.episode} серия)", s.ToString(), episode.episode, streamquality.Firts().link, streamquality: streamquality, subtitles: episode.subtitles);
                    }

                return rjson
                        ? Content(etpl.ToJson(), "application/json; charset=utf-8")
                        : Content(etpl.ToHtml(), "text/html; charset=utf-8");
                }
            }

            return Content("Uaflix", "text/html; charset=utf-8");
        }

        async ValueTask<Result> search(string imdb_id, long kinopoisk_id, string title, string original_title, int serial)
        {
            string filmTitle = !string.IsNullOrEmpty(title) ? title : original_title;
            string memKey = $"UaFlix:view:{kinopoisk_id}:{imdb_id}";
            Console.WriteLine($"UaFlix: Search started for '{filmTitle}' (serial={serial}, kinopoisk={kinopoisk_id}, imdb={imdb_id})");
            
            Result res = null;
            
            // Перевіряємо кеш
            if (hybridCache.TryGetValue(memKey, out CacheableResult cachedRes))
            {
                Console.WriteLine("UaFlix: Result from cache: " + Newtonsoft.Json.JsonConvert.SerializeObject(cachedRes));
                {
                    Console.WriteLine("UaFlix: Cache result movie count: " + (cachedRes?.movie?.Count ?? 0));
                    if (cachedRes?.movie != null)
                    {
                        foreach (var m in cachedRes.movie)
                        {
                            Console.WriteLine($"UaFlix: Cache movie subtitles: {Newtonsoft.Json.JsonConvert.SerializeObject(m.subtitles)}");
                        }
                    }
                    
                    if (cachedRes == null || (cachedRes.movie == null && cachedRes.serial == null))
                {
                    Console.WriteLine("UaFlix: Cached result is empty, ignoring cache");
                    res = null;
                }
                else
                {
                        // Конвертуємо кешований результат назад до нормального формату
                        res = new Result
                        {
                            movie = cachedRes.movie?.Select(m => new Movie
                            {
                                translation = m.translation,
                                links = m.links,
                                subtitles = null // Поки що встановлюємо null, потім відновимо
                            }).ToList(),
                            serial = cachedRes.serial
                        };
                        
                        // Відновлюємо субтитри з кешованих даних
                        if (res.movie != null && cachedRes.movie != null)
                        {
                            for (int i = 0; i < res.movie.Count && i < cachedRes.movie.Count; i++)
                            {
                                if (cachedRes.movie[i].subtitles != null)
                                {
                                    Console.WriteLine($"UaFlix: Processing cached subtitles for movie {i}: {Newtonsoft.Json.JsonConvert.SerializeObject(cachedRes.movie[i].subtitles)}");
                                    // Створюємо новий SubtitleTpl і заповнюємо його даними
                                    var subtitles = new SubtitleTpl();
                                    
                                    // Спробуємо різні типи даних
                                    if (cachedRes.movie[i].subtitles is Newtonsoft.Json.Linq.JArray subtitlesData)
                                    {
                                        Console.WriteLine($"UaFlix: SubtitlesData is JArray with {subtitlesData.Count} items");
                                        foreach (var sub in subtitlesData)
                                        {
                                            var url = sub["url"]?.ToString();
                                            var label = sub["label"]?.ToString();
                                            Console.WriteLine($"UaFlix: Processing subtitle: url='{url}', label='{label}'");
                                            if (!string.IsNullOrEmpty(url) && !string.IsNullOrEmpty(label))
                                            {
                                                subtitles.Append(label, url);
                                                Console.WriteLine($"UaFlix: Appended subtitle: {label} => {url}");
                                            }
                                        }
                                    }
                                    else if (cachedRes.movie[i].subtitles is Newtonsoft.Json.Linq.JObject subtitleObj)
                                    {
                                        Console.WriteLine($"UaFlix: SubtitlesData is JObject");
                                        var url = subtitleObj["url"]?.ToString();
                                        var label = subtitleObj["label"]?.ToString();
                                        Console.WriteLine($"UaFlix: Processing subtitle: url='{url}', label='{label}'");
                                        if (!string.IsNullOrEmpty(url) && !string.IsNullOrEmpty(label))
                                        {
                                            subtitles.Append(label, url);
                                            Console.WriteLine($"UaFlix: Appended subtitle: {label} => {url}");
                                        }
                                    }
                                    else
                                    {
                                        Console.WriteLine($"UaFlix: SubtitlesData is unknown type: {cachedRes.movie[i].subtitles?.GetType()}");
                                        // Спробуємо десеріалізувати як масив
                                        try
                                        {
                                            var jsonString = Newtonsoft.Json.JsonConvert.SerializeObject(cachedRes.movie[i].subtitles);
                                            var subtitleArray = Newtonsoft.Json.JsonConvert.DeserializeObject<Newtonsoft.Json.Linq.JArray>(jsonString);
                                            if (subtitleArray != null)
                                            {
                                                Console.WriteLine($"UaFlix: Deserialized as JArray with {subtitleArray.Count} items");
                                                foreach (var sub in subtitleArray)
                                                {
                                                    var url = sub["url"]?.ToString();
                                                    var label = sub["label"]?.ToString();
                                                    Console.WriteLine($"UaFlix: Processing subtitle: url='{url}', label='{label}'");
                                                    if (!string.IsNullOrEmpty(url) && !string.IsNullOrEmpty(label))
                                                    {
                                                        subtitles.Append(label, url);
                                                        Console.WriteLine($"UaFlix: Appended subtitle: {label} => {url}");
                                                    }
                                                }
                                            }
                                        }
                                        catch (Exception ex)
                                        {
                                            Console.WriteLine($"UaFlix: Failed to deserialize subtitles: {ex.Message}");
                                        }
                                    }
                                    res.movie[i].subtitles = subtitles;
                                    Console.WriteLine($"UaFlix: Restored subtitles for movie {i}: {Newtonsoft.Json.JsonConvert.SerializeObject(subtitles.ToObject())}");
                                }
                            }
                        }
                        
                        // Додаємо логування після відновлення
                        Console.WriteLine($"UaFlix: After restoration - movies count: {res.movie?.Count ?? 0}");
                    if (res.movie != null)
                    {
                            for (int i = 0; i < res.movie.Count; i++)
                            {
                                Console.WriteLine($"UaFlix: After restoration - movie {i} subtitles: {Newtonsoft.Json.JsonConvert.SerializeObject(res.movie[i].subtitles?.ToObject())}");
                                Console.WriteLine($"UaFlix: After restoration - movie {i} subtitles IsEmpty: {res.movie[i].subtitles?.IsEmpty()}");
                            }
                        }
                        
                        Console.WriteLine($"UaFlix: Converted cache result subtitles: {Newtonsoft.Json.JsonConvert.SerializeObject(res.movie?.Select(m => m.subtitles?.ToObject()))}");
                        
                        // Фінальне логування перед поверненням
                        Console.WriteLine($"UaFlix: Final result - movies count: {res.movie?.Count ?? 0}");
                        if (res.movie != null)
                        {
                            for (int i = 0; i < res.movie.Count; i++)
                            {
                                Console.WriteLine($"UaFlix: Final result - movie {i} subtitles: {Newtonsoft.Json.JsonConvert.SerializeObject(res.movie[i].subtitles?.ToObject())}");
                                Console.WriteLine($"UaFlix: Final result - movie {i} subtitles IsEmpty: {res.movie[i].subtitles?.IsEmpty()}");
                            }
                        }
                        
                    Console.WriteLine("UaFlix: Search completed, result: True");
                    return res;
                    }
                }
            }
            else
            {
                try
                {
                    string searchUrl = $"https://uafix.net/index.php?do=search&subaction=search&story={HttpUtility.UrlEncode(filmTitle)}";
                    
                    Console.WriteLine($"UaFlix: Searching at {searchUrl}");

                    httpClient.DefaultRequestHeaders.Clear();
                    httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
                    httpClient.DefaultRequestHeaders.Add("Referer", "https://uafix.net/");

                    var searchHtml = await httpClient.GetStringAsync(searchUrl);
                    var doc = new HtmlDocument();
                    doc.LoadHtml(searchHtml);

                    // Виправлений селектор для пошуку результатів
                    var filmNode = doc.DocumentNode.SelectSingleNode("//a[contains(@class, 'sres-wrap')]");
                    if (filmNode == null) {
                        Console.WriteLine($"UaFlix: No film found for '{filmTitle}' at {searchUrl}");
                        return null;
                    }

                    string filmUrl = filmNode.GetAttributeValue("href", "");
                    if (!filmUrl.StartsWith("http"))
                        filmUrl = "https://uafix.net" + filmUrl;
                    
                    Console.WriteLine($"UaFlix: Found film at {filmUrl}");

                    var filmHtml = await httpClient.GetStringAsync(filmUrl);
                    doc.LoadHtml(filmHtml);

                    // Перевіряємо чи це серіал
                    var serialIndicator = doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'serial')]") ?? 
                                        doc.DocumentNode.SelectSingleNode("//div[contains(text(), 'Сезон')]") ??
                                        doc.DocumentNode.SelectSingleNode("//div[contains(text(), 'Епізод')]");

                    Console.WriteLine($"UaFlix: Serial indicator found: {serialIndicator != null}");

                    // Визначаємо тип контенту за URL
                    if (filmUrl.Contains("/serials/"))
                    {
                        Console.WriteLine("UaFlix: URL contains /serials/ - parsing as serial");
                        var serialResult = await ParseSerial(filmUrl, filmTitle, null);
                        if (serialResult != null)
                        {
                            Console.WriteLine("UaFlix: Serial parsing successful");
                            res = new Result() { serial = serialResult };
                            hybridCache.Set(memKey, res, cacheTime(5));
                            proxyManager.Success();
                            return res;
                        }
                        else
                        {
                            Console.WriteLine("UaFlix: Serial parsing failed");
                        }
                    }
                    else if (filmUrl.Contains("/films/"))
                    {
                        Console.WriteLine("UaFlix: URL contains /films/ - parsing as movie");
                        // Парсимо фільм - виправлений селектор для iframe
                        var iframeNodes = doc.DocumentNode.SelectNodes("//div[contains(@class, 'video-box')]/iframe | //iframe[contains(@src, 'zetvideo.net')] | //meta[@property='og:video:iframe']");
                        if (iframeNodes == null || !iframeNodes.Any()) {
                            Console.WriteLine($"UaFlix: No video iframes found at {filmUrl}");
                            return null;
                        }

                        Console.WriteLine($"UaFlix: Found {iframeNodes.Count} iframe nodes");

                        var movies = new List<Movie>();
                        var uniqueIframeUrls = new HashSet<string>();

                        foreach (var iframe in iframeNodes)
                        {
                            string iframeUrl = "";
                            
                            // Якщо це meta тег, витягуємо iframe з content
                            if (iframe.Name == "meta" && iframe.GetAttributeValue("property", "") == "og:video:iframe")
                            {
                                var content = iframe.GetAttributeValue("content", "");
                                Console.WriteLine($"UaFlix: Found meta iframe content: {content}");
                                var iframeMatch = Regex.Match(content, @"src=['""]([^'""]+)['""]");
                                if (iframeMatch.Success)
                                    iframeUrl = iframeMatch.Groups[1].Value;
                            }
                            else
                            {
                                iframeUrl = iframe.GetAttributeValue("src", "");
                            }
                            
                            Console.WriteLine($"UaFlix: Processing iframe URL: {iframeUrl}");
                            
                            if (string.IsNullOrEmpty(iframeUrl) || !iframeUrl.Contains("zetvideo.net")) continue;
                            if (!uniqueIframeUrls.Add(iframeUrl)) continue; // вже додано, пропускаємо

                            Console.WriteLine($"UaFlix: Processing zetvideo URL: {iframeUrl}");
                            var zlinks = await ParseAllZetvideoSources(iframeUrl);
                            Console.WriteLine($"UaFlix: Found {zlinks.Count} zetvideo links");
                            var subtitlesResult = await ParseZetvideoSubtitles(iframeUrl);
                            var subtitles = subtitlesResult;
                            Console.WriteLine($"UaFlix: Subtitles for iframe {iframeUrl}: {Newtonsoft.Json.JsonConvert.SerializeObject(subtitles?.ToObject())}");
                            foreach (var l in zlinks)
                                movies.Add(new Movie
                                {
                                    translation = $"{filmTitle} (Zetvideo)",
                                    links = new List<LinkQuality> { l },
                                    subtitles = subtitles
                                });
                        }

                        if (movies.Count > 0)
                        {
                            Console.WriteLine($"UaFlix: Movie parsing successful, found {movies.Count} movies");
                            
                            // Парсимо субтитри для фільму
                            var subtitlesResult = await ParseSubtitles(filmUrl);
                            var subtitles = subtitlesResult.GetValueOrDefault(new SubtitleTpl());
                            
                            res = new Result()
                            {
                                movie = movies
                            };
                            
                            // Додаємо субтитри до всіх фільмів тільки якщо вони ще не встановлені
                            if (subtitlesResult.HasValue && !subtitlesResult.Value.IsEmpty())
                            {
                                foreach (var movie in movies)
                                {
                                    // Перезаписуємо тільки якщо поточні субтитри порожні
                                    if (movie.subtitles == null || movie.subtitles.Value.IsEmpty())
                                    {
                                        movie.subtitles = subtitlesResult.Value;
                                    }
                                }
                            }
                        
                        // Перевіряємо і логуємо субтитри перед кешуванням
                        Console.WriteLine($"UaFlix: Before caching - movies count: {movies.Count}");
                        foreach (var movie in movies)
                        {
                            Console.WriteLine($"UaFlix: Movie subtitles before cache: {Newtonsoft.Json.JsonConvert.SerializeObject(movie.subtitles)}");
                            Console.WriteLine($"UaFlix: Movie subtitles ToObject: {Newtonsoft.Json.JsonConvert.SerializeObject(movie.subtitles?.ToObject())}");
                            Console.WriteLine($"UaFlix: Movie subtitles IsEmpty: {movie.subtitles?.IsEmpty()}");
                        }
                        
                        // Конвертуємо результат для правильного кешування
                        var cacheResult = new CacheableResult
                        {
                            movie = movies.Select(m => new CacheableMovie
                            {
                                translation = m.translation,
                                links = m.links,
                                subtitles = m.subtitles?.ToObject()
                            }).ToList(),
                            serial = res.serial
                        };
                        
                        Console.WriteLine($"UaFlix: Cache result subtitles: {Newtonsoft.Json.JsonConvert.SerializeObject(cacheResult.movie.Select(m => m.subtitles))}");
                        
                        hybridCache.Set(memKey, cacheResult, cacheTime(5));
                                proxyManager.Success();
                            }
                            else
                            {
                                Console.WriteLine($"UaFlix: Movie parsing failed");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"UaFlix error: {ex.Message}");
                }
            }
            
            // Кешування вже виконується в кожному блоці коду вище
            
            Console.WriteLine($"UaFlix: Search completed, result: {res != null}");
            if (res == null || (res.movie == null && res.serial == null)) {
                Console.WriteLine($"UaFlix: Not caching empty result for '{filmTitle}'");
                return null;
            }
            Console.WriteLine($"UaFlix: Search method returning result with {res.movie?.Count ?? 0} movies");
            return res;
        }

        // Додаємо окремий метод для парсингу конкретного сезону з кешем
        async ValueTask<Result> searchSeason(string imdb_id, long kinopoisk_id, string title, string original_title, int seasonNumber)
        {
            string memKey = $"UaFlix:season:{kinopoisk_id}:{imdb_id}:{seasonNumber}";
            Console.WriteLine($"UaFlix: Season search started for '{title}' season {seasonNumber}");
            
            if (!hybridCache.TryGetValue(memKey, out CacheableResult cachedRes))
            {
                try
                {
                    string filmTitle = !string.IsNullOrEmpty(title) ? title : original_title;
                    string searchUrl = $"https://uafix.net/index.php?do=search&subaction=search&story={HttpUtility.UrlEncode(filmTitle)}";
                    
                    httpClient.DefaultRequestHeaders.Clear();
                    httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
                    httpClient.DefaultRequestHeaders.Add("Referer", "https://uafix.net/");

                    var searchHtml = await httpClient.GetStringAsync(searchUrl);
                    var doc = new HtmlDocument();
                    doc.LoadHtml(searchHtml);

                    var filmNode = doc.DocumentNode.SelectSingleNode("//a[contains(@class, 'sres-wrap')]");
                    if (filmNode == null) return null;

                    string filmUrl = filmNode.GetAttributeValue("href", "");
                    if (!filmUrl.StartsWith("http"))
                        filmUrl = "https://uafix.net" + filmUrl;

                    // Парсимо конкретний сезон
                    var serialResult = await ParseSerial(filmUrl, filmTitle, seasonNumber.ToString());
                    if (serialResult != null)
                    {
                        var res = new Result() { serial = serialResult };
                        
                        // Конвертуємо результат для правильного кешування
                        var cacheResult = new CacheableResult
                        {
                            movie = null,
                            serial = serialResult
                        };
                        
                        hybridCache.Set(memKey, cacheResult, cacheTime(10)); // Кешуємо на 10 хвилин
                        proxyManager.Success();
                        return res;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"UaFlix season error: {ex.Message}");
                }
            }
            else
            {
                Console.WriteLine($"UaFlix: Season result found in cache");
                // Конвертуємо кешований результат назад до нормального формату
                var res = new Result
                {
                    movie = null,
                    serial = cachedRes.serial
                };
            return res;
            }
            return null;
        }

        async Task<Dictionary<string, List<Voice>>> ParseSerial(string filmUrl, string filmTitle, string selectedSeason = null)
        {
            try
            {
                var doc = new HtmlDocument();
                var filmHtml = await httpClient.GetStringAsync(filmUrl);
                doc.LoadHtml(filmHtml);

                // Знаходимо всі сезони (посилання на сторінки сезону)
                var seasonLinks = new List<(string url, string season)>();
                var seasonNodes = doc.DocumentNode.SelectNodes("//a[contains(@href, 'sezon-')]");
                if (seasonNodes != null)
                {
                    foreach (var node in seasonNodes)
                    {
                        var href = node.GetAttributeValue("href", "");
                        if (!string.IsNullOrEmpty(href))
                        {
                            if (!href.StartsWith("http"))
                                href = "https://uafix.net" + href;
                            var seasonMatch = Regex.Match(href, @"sezon-(\d+)");
                            var season = seasonMatch.Success ? seasonMatch.Groups[1].Value : "1";
                            seasonLinks.Add((href, season));
                        }
                    }
                }
                // Якщо не знайдено жодного сезону, додаємо поточну сторінку як сезон 1
                if (seasonLinks.Count == 0)
                    seasonLinks.Add((filmUrl, "1"));

                var serial = new Dictionary<string, List<Voice>>();
                var voice = "Українська";
                serial[voice] = new List<Voice>();

                // Якщо не вибрано конкретний сезон - парсимо всі сезони для списку
                if (string.IsNullOrEmpty(selectedSeason) || selectedSeason == "-1")
                {
                    foreach (var seasonLink in seasonLinks.OrderBy(x => int.Parse(x.season)))
                    {
                        var episodes = new List<Episode>();
                        // Додаємо заглушку епізоду для відображення сезону в списку
                        episodes.Add(new Episode 
                        { 
                            episode = "1",
                            links = new List<LinkQuality>(),
                            url = seasonLink.url,
                            subtitles = new SubtitleTpl()
                        });
                        
                        serial[voice].Add(new Voice { id = seasonLink.season, name = "Українська", episodes = episodes });
                    }
                }
                else
                {
                    // Парсимо лише вибраний сезон
                    var seasonUrl = seasonLinks.First(x => x.season == selectedSeason).url;

                    // Парсимо лише вибраний сезон
                    var seasonDoc = new HtmlDocument();
                    var seasonHtml = await httpClient.GetStringAsync(seasonUrl);
                    seasonDoc.LoadHtml(seasonHtml);

                    // Збираємо всі посилання на епізоди на сторінці сезону
                    var episodeLinks = new List<(string url, string episode)>();
                    var episodeNodes = seasonDoc.DocumentNode.SelectNodes("//a[contains(@href, 'season-') and contains(@href, 'episode-')]");
                    if (episodeNodes != null)
                    {
                        foreach (var node in episodeNodes)
                        {
                            var href = node.GetAttributeValue("href", "");
                            if (!string.IsNullOrEmpty(href))
                            {
                                if (!href.StartsWith("http"))
                                    href = "https://uafix.net" + href;
                                var episodeMatch = Regex.Match(href, @"episode-(\d+)");
                                var episode = episodeMatch.Success ? episodeMatch.Groups[1].Value : "1";
                                episodeLinks.Add((href, episode));
                            }
                        }
                    }
                    // Якщо не знайдено жодного епізоду, додаємо перший епізод
                    if (episodeLinks.Count == 0)
                        episodeLinks.Add((seasonUrl, "1"));

                    // Сортуємо і видаляємо дублікати
                    var uniqueEpisodes = episodeLinks
                        .GroupBy(x => x.episode)
                        .Select(g => g.First())
                        .OrderBy(x => int.Parse(x.episode));

                    var episodes = new List<Episode>();
                    foreach (var ep in uniqueEpisodes)
                    {
                        var episodeUrl = ep.url;
                        var episodeId = ep.episode;

                        var episode = new Episode 
                        { 
                            episode = episodeId,
                            links = new List<LinkQuality>(),
                            url = episodeUrl,
                            subtitles = new SubtitleTpl()
                        };
                        SubtitleTpl? episodeSubtitles = null;
                        try
                        {
                            var episodeHtml = await httpClient.GetStringAsync(episodeUrl);
                            var episodeDoc = new HtmlDocument();
                            episodeDoc.LoadHtml(episodeHtml);
                            var iframeNodes = episodeDoc.DocumentNode.SelectNodes("//div[contains(@class, 'video-box')]/iframe | //iframe[contains(@src, 'zetvideo.net')] | //meta[@property='og:video:iframe']");
                            if (iframeNodes != null)
                            {
                                var uniqueIframeUrls = new HashSet<string>();

                                foreach (var iframe in iframeNodes)
                                {
                                    string iframeUrl = "";
                                    
                                    // Якщо це meta тег, витягуємо iframe з content
                                    if (iframe.Name == "meta" && iframe.GetAttributeValue("property", "") == "og:video:iframe")
                                    {
                                        var content = iframe.GetAttributeValue("content", "");
                                        var iframeMatch = Regex.Match(content, @"src=['\""]([^'\""]+)['\""]");
                                        if (iframeMatch.Success)
                                            iframeUrl = iframeMatch.Groups[1].Value;
                                    }
                                    else
                                    {
                                        iframeUrl = iframe.GetAttributeValue("src", "");
                                    }
                                    
                                    if (string.IsNullOrEmpty(iframeUrl) || !iframeUrl.Contains("zetvideo.net")) continue;
                                    if (!uniqueIframeUrls.Add(iframeUrl)) continue;
                                    Console.WriteLine($"UaFlix: Processing zetvideo URL: {iframeUrl}");
                                    var zlinks = await ParseAllZetvideoSources(iframeUrl);
                                    Console.WriteLine($"UaFlix: Found {zlinks.Count} zetvideo links");
                                    var subtitlesResult = await ParseZetvideoSubtitles(iframeUrl);
                                    if (subtitlesResult != null)
                                    {
                                        episodeSubtitles = subtitlesResult;
                                    }
                                    foreach (var l in zlinks)
                                        episode.links.Add(new LinkQuality { link = l.link, quality = l.quality });
                                }
                            }
                            // Якщо не zetvideo, але хочемо парсити субтитри з основної сторінки
                            episode.subtitles = episodeSubtitles ?? new SubtitleTpl();

                            // Проксуємо субтитри для епізодів при парсингу
                            if (episode.subtitles != null && !episode.subtitles.Value.IsEmpty())
                            {
                                var subtitleObjects = episode.subtitles.Value.ToObject();
                                if (subtitleObjects is Newtonsoft.Json.Linq.JArray subtitleArray)
                                {
                                    var newSubtitles = new SubtitleTpl();
                                    foreach (var sub in subtitleArray)
                                    {
                                        var originalUrl = sub["url"]?.ToString();
                                        var label = sub["label"]?.ToString();
                                        
                                        if (!string.IsNullOrEmpty(originalUrl) && !string.IsNullOrEmpty(label))
                                        {
                                            var encodedUrl = HttpUtility.UrlEncode(originalUrl);
                                            var proxyUrl = $"{host}/subtitles?url={encodedUrl}";
                                            Console.WriteLine($"UaFlix: Proxying parsed episode subtitle {label}: {originalUrl} -> {proxyUrl}");
                                            Console.WriteLine($"UaFlix: Encoded parsed episode URL: {encodedUrl}");
                                            newSubtitles.Append(label, proxyUrl);
                                        }
                                    }
                                    episode.subtitles = newSubtitles;
                                    Console.WriteLine($"UaFlix: Proxied parsed episode subtitles: {Newtonsoft.Json.JsonConvert.SerializeObject(newSubtitles.ToObject())}");
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Episode parse error: {ex.Message}");
                        }
                        episodes.Add(episode);
                    }
                    serial[voice].Add(new Voice { id = selectedSeason, name = "Українська", episodes = episodes });
                }

                return serial.Count > 0 ? serial : null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Serial parse error: {ex.Message}");
                return null;
            }
        }

        async Task<List<LinkQuality>> ParseAllZetvideoSources(string iframeUrl)
        {
            var result = new List<LinkQuality>();
            try
            {
                Console.WriteLine($"UaFlix: Parsing zetvideo sources from: {iframeUrl}");
                var request = new HttpRequestMessage(HttpMethod.Get, iframeUrl);
                request.Headers.Add("User-Agent", "Mozilla/5.0");
                var response = await httpClient.SendAsync(request);
                var html = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"UaFlix: Got zetvideo HTML, length: {html.Length}");
                
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                var sourceNodes = doc.DocumentNode.SelectNodes("//source[contains(@src, '.m3u8')]");
                if (sourceNodes != null)
                {
                    Console.WriteLine($"UaFlix: Found {sourceNodes.Count} source nodes with m3u8");
                    foreach (var node in sourceNodes)
                    {
                        var url = node.GetAttributeValue("src", null);
                        var label = node.GetAttributeValue("label", null) ?? node.GetAttributeValue("res", null) ?? "1080p";
                        if (!string.IsNullOrEmpty(url))
                        {
                            Console.WriteLine($"UaFlix: Found m3u8 source: {url} ({label})");
                            result.Add(new LinkQuality { link = url, quality = label });
                        }
                    }
                }

                if (result.Count == 0)
                {
                    Console.WriteLine($"UaFlix: No source nodes found, searching in scripts");
                    var scriptNodes = doc.DocumentNode.SelectNodes("//script");
                    if (scriptNodes != null)
                    {
                        foreach (var script in scriptNodes)
                        {
                            var text = script.InnerText;
                            var urls = Regex.Matches(text, @"https?:\/\/[^\s'""]+\.m3u8")
                                .Cast<Match>()
                                .Select(m => m.Value)
                                .Distinct();
                            foreach (var url in urls)
                            {
                                Console.WriteLine($"UaFlix: Found m3u8 in script: {url}");
                                result.Add(new LinkQuality { link = url, quality = "1080p" });
                            }
                        }
                    }
                }
                
                Console.WriteLine($"UaFlix: Total zetvideo sources found: {result.Count}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Zetvideo parse error: {ex.Message}");
            }
            return result;
        }

        // Додаємо метод для парсингу субтитрів
        async Task<SubtitleTpl?> ParseSubtitles(string filmUrl)
        {
            try
            {
                var doc = new HtmlDocument();
                var filmHtml = await httpClient.GetStringAsync(filmUrl);
                doc.LoadHtml(filmHtml);

                var subtitles = new SubtitleTpl();

                // Шукаємо субтитри в різних форматах
                var subtitleNodes = doc.DocumentNode.SelectNodes("//track[@kind='subtitles'] | //a[contains(@href, '.srt')] | //a[contains(@href, '.vtt')] | //div[contains(@class, 'subtitle')]//a");
                
                if (subtitleNodes != null)
                {
                    foreach (var node in subtitleNodes)
                    {
                        var subtitleUrl = node.GetAttributeValue("src", "") ?? node.GetAttributeValue("href", "");
                        var language = node.GetAttributeValue("srclang", "") ?? node.GetAttributeValue("lang", "") ?? "uk";
                        
                        if (!string.IsNullOrEmpty(subtitleUrl))
                        {
                            if (!subtitleUrl.StartsWith("http"))
                                subtitleUrl = "https://uafix.net" + subtitleUrl;
                            
                            subtitles.Append(language, subtitleUrl);
                            Console.WriteLine($"UaFlix: Parsed subtitle: {language} => {subtitleUrl}");
                        }
                    }
                }

                // Шукаємо субтитри в iframe
                var iframeNodes = doc.DocumentNode.SelectNodes("//iframe[contains(@src, 'subtitles') or contains(@src, 'sub')]");
                if (iframeNodes != null)
                {
                    foreach (var iframe in iframeNodes)
                    {
                        var iframeUrl = iframe.GetAttributeValue("src", "");
                        if (!string.IsNullOrEmpty(iframeUrl))
                        {
                            if (!iframeUrl.StartsWith("http"))
                                iframeUrl = "https://uafix.net" + iframeUrl;
                            
                            try
                            {
                                var iframeHtml = await httpClient.GetStringAsync(iframeUrl);
                                var iframeDoc = new HtmlDocument();
                                iframeDoc.LoadHtml(iframeHtml);

                                var subNodes = iframeDoc.DocumentNode.SelectNodes("//a[contains(@href, '.srt') or contains(@href, '.vtt')]");
                                if (subNodes != null)
                                {
                                    foreach (var subNode in subNodes)
                                    {
                                        var subUrl = subNode.GetAttributeValue("href", "");
                                        var subText = subNode.InnerText.Trim();
                                        
                                        if (!string.IsNullOrEmpty(subUrl))
                                        {
                                            if (!subUrl.StartsWith("http"))
                                                subUrl = "https://uafix.net" + subUrl;
                                            
                                            var lang = subText.Contains("укр") ? "uk" : 
                                                      subText.Contains("рос") ? "ru" : 
                                                      subText.Contains("eng") ? "en" : "uk";
                                            
                                            subtitles.Append(lang, subUrl);
                                            Console.WriteLine($"UaFlix: Parsed subtitle from iframe: {lang} => {subUrl}");
                                        }
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Subtitle iframe parse error: {ex.Message}");
                            }
                        }
                    }
                }

                // Додаємо парсинг JS-конфігурації Zetvideo (subtitle: '[Назва]URL,')
                var scriptNodes = doc.DocumentNode.SelectNodes("//script");
                if (scriptNodes != null)
                {
                    foreach (var script in scriptNodes)
                    {
                        var text = script.InnerText;
                        // Шукаємо subtitle: "..." або subtitle: '...'
                        var match = Regex.Match(text, "subtitle\\s*:\\s*[\"']([^\"']+)[\"']");
                        if (match.Success)
                        {
                            var subtitleString = match.Groups[1].Value;
                            // Може бути кілька субтитрів через кому
                            var subs = subtitleString.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                            foreach (var sub in subs)
                            {
                                var subMatch = Regex.Match(sub, "\\[(.*?)\\](https?://[^,]+)");
                                if (subMatch.Success)
                                {
                                    var lang = subMatch.Groups[1].Value.Trim();
                                    var url = subMatch.Groups[2].Value.Trim();
                                    subtitles.Append(lang, url);
                                    Console.WriteLine($"UaFlix: Parsed subtitle from JS: {lang} => {url}");
                                }
                            }
                        }
                    }
                }

                Console.WriteLine("UaFlix: All parsed subtitles: " + Newtonsoft.Json.JsonConvert.SerializeObject(subtitles));
                return subtitles;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Subtitle parse error: {ex.Message}");
                return null;
            }
        }

        // Додаємо окремий метод для парсингу субтитрів з zetvideo iframe
        async Task<SubtitleTpl?> ParseZetvideoSubtitles(string iframeUrl)
        {
            try
            {
                Console.WriteLine($"UaFlix: Parsing subtitles from zetvideo: {iframeUrl}");
                var request = new HttpRequestMessage(HttpMethod.Get, iframeUrl);
                request.Headers.Add("User-Agent", "Mozilla/5.0");
                var response = await httpClient.SendAsync(request);
                var html = await response.Content.ReadAsStringAsync();
                
                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                var subtitles = new SubtitleTpl();

                // Парсимо JS-конфігурацію Zetvideo для субтитрів
                var scriptNodes = doc.DocumentNode.SelectNodes("//script");
                if (scriptNodes != null)
                {
                    foreach (var script in scriptNodes)
                    {
                        var text = script.InnerText;
                        // Шукаємо subtitle: "..." або subtitle: '...'
                        var match = Regex.Match(text, "subtitle\\s*:\\s*[\"']([^\"']+)[\"']");
                        if (match.Success)
                        {
                            var subtitleString = match.Groups[1].Value;
                            Console.WriteLine($"UaFlix: Found subtitle config: {subtitleString}");
                            // Може бути кілька субтитрів через кому
                            var subs = subtitleString.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                            foreach (var sub in subs)
                            {
                                var subMatch = Regex.Match(sub, "\\[(.*?)\\](https?://[^,]+)");
                                if (subMatch.Success)
                                {
                                    var lang = subMatch.Groups[1].Value.Trim();
                                    var url = subMatch.Groups[2].Value.Trim();
                                    
                                    // Визначаємо мову
                                    var language = lang.Contains("Українськ") || lang.Contains("UA") ? "uk" : 
                                                 lang.Contains("Оригинал") || lang.Contains("ENG") ? "en" : 
                                                 lang.Contains("рос") ? "ru" : "uk";
                                    
                                    Console.WriteLine($"UaFlix: About to append subtitle: language='{language}', url='{url}'");
                                    subtitles.Append(language, url);
                                    Console.WriteLine($"UaFlix: Parsed zetvideo subtitle: {language} => {url}");
                                }
                            }
                        }
                    }
                }

                Console.WriteLine($"UaFlix: Zetvideo subtitles result: {Newtonsoft.Json.JsonConvert.SerializeObject(subtitles)}");
                Console.WriteLine($"UaFlix: Zetvideo subtitles ToObject: {Newtonsoft.Json.JsonConvert.SerializeObject(subtitles.ToObject())}");
                Console.WriteLine($"UaFlix: Zetvideo subtitles IsEmpty: {subtitles.IsEmpty()}");
                return subtitles;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Zetvideo subtitle parse error: {ex.Message}");
                return null;
            }
        }

        public class Movie
        {
            public string translation { get; set; }
            public List<LinkQuality> links { get; set; }
            public SubtitleTpl? subtitles { get; set; }
        }

        // Клас для кешування з правильною серіалізацією субтитрів
        public class CacheableMovie
        {
            public string translation { get; set; }
            public List<LinkQuality> links { get; set; }
            public object? subtitles { get; set; }
        }

        public class CacheableResult
        {
            public List<CacheableMovie> movie { get; set; }
            public Dictionary<string, List<Voice>> serial { get; set; }
        }

        public class Episode
        {
            public string episode { get; set; }
            public List<LinkQuality> links { get; set; }
            public string url { get; set; }
            public SubtitleTpl? subtitles { get; set; }
        }

        public class Voice
        {
            public string id { get; set; }
            public string name { get; set; }
            public List<Episode> episodes { get; set; }
        }

        public class LinkQuality
        {
            public string link { get; set; }
            public string quality { get; set; }
        }

        public class Result
        {
            public List<Movie> movie { get; set; }
            public Dictionary<string, List<Voice>> serial { get; set; }
        }
    }
}
