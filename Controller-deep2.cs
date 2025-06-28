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

namespace Uaflix.Controllers
{
    [Route("uaflix")]
    public class UaflixController : BaseController
    {
        ProxyManager proxyManager = new ProxyManager(ModInit.UaFlix);
        static HttpClient httpClient = new HttpClient();

        static Dictionary<string, AshdiEpisode> ashdiEpisodesDict = new Dictionary<string, AshdiEpisode>();

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

        public class Movie
        {
            public string translation { get; set; }
            public List<(string link, string quality)> links { get; set; }
            public SubtitleTpl subtitles { get; set; }
        }

        public class Serial
        {
            public string id { get; set; }
            public List<(string link, string quality)> links { get; set; }
        }

        public class Voice
        {
            public string id { get; set; }
            public string name { get; set; }
            public List<Serial> episodes { get; set; }
        }

        public class Result
        {
            public List<Movie> movie { get; set; }
            public Dictionary<string, List<Voice>> serial { get; set; }
        }

        void Log(string msg)
        {
            System.IO.File.AppendAllText("lampac-log.txt", $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {msg}\r\n");
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
            bool? rjson = null,
            int serial = 0,
            string account_email = "",
            string source = "")
        {
            if (!ModInit.UaFlix.enable)
                return Forbid();

            var init = ModInit.UaFlix;
            var proxy = proxyManager.Get();
            string memKey = $"UaFlix:view:{kinopoisk_id}:{imdb_id}";

            // Обробка rjson для серіалів
            if (rjson == true && !string.IsNullOrEmpty(e) && !string.IsNullOrEmpty(s))
            {
                string voiceParam = t;
                string normE = int.TryParse(e, out var eNum) ? eNum.ToString() : e;
                string dictKey = $"{voiceParam}|{s}|{normE}";

                if (!ashdiEpisodesDict.TryGetValue(dictKey, out var episode))
                {
                    return Content(JsonConvert.SerializeObject(new { method = "error", message = "Серія не знайдена." }), "application/json");
                }

                return Content(JsonConvert.SerializeObject(new
                {
                    method = "play",
                    url = episode.file,
                    title = $"{title ?? original_title} ({e})",
                    poster = episode.poster,
                    subtitle = episode.subtitle
                }), "application/json");
            }

            Result result = null;
            if (!hybridCache.TryGetValue(memKey, out result))
            {
                result = await Search(imdb_id, kinopoisk_id, title, original_title, serial);
                if (result != null)
                    hybridCache.Set(memKey, result, cacheTime(5));
            }

            // Обробка серіалів
            if (result?.serial != null && result.serial.Count > 0)
            {
                Log($"=== Serial processing START === t={t} s={s} e={e}");
                
                var allSeasons = new Dictionary<string, (string voice, string seasonName)>();
                foreach (var voicePair in result.serial)
                {
                    foreach (var season in voicePair.Value)
                    {
                        if (!allSeasons.ContainsKey(season.id))
                            allSeasons[season.id] = (voicePair.Key, season.name);
                    }
                }

                string currentVoice = t; // Використовуємо тільки t, без fallback на v
                string currentSeason = s;

                Log($"Initial: currentVoice='{currentVoice}', currentSeason='{currentSeason}'");

                // Якщо передано сезон, знаходимо озвучку для нього
                if (!string.IsNullOrEmpty(currentSeason))
                {
                    if (allSeasons.TryGetValue(currentSeason, out var seasonInfo))
                    {
                        currentVoice = seasonInfo.voice;
                        Log($"Found voice for season '{currentSeason}': '{currentVoice}'");
                    }
                }

                // Якщо озвучка не знайдена або не валідна, беремо першу доступну
                if (string.IsNullOrEmpty(currentVoice) || !result.serial.ContainsKey(currentVoice))
                {
                    currentVoice = result.serial.Keys.First();
                    Log($"Using first available voice: '{currentVoice}'");
                }

                // Якщо сезон не вказаний, беремо перший сезон поточної озвучки
                if (string.IsNullOrEmpty(currentSeason))
                {
                    currentSeason = result.serial[currentVoice].First().id;
                    Log($"Using first season for voice '{currentVoice}': '{currentSeason}'");
                }

                Log($"Final: currentVoice='{currentVoice}', currentSeason='{currentSeason}'");
                Log($"Available voices: {string.Join(", ", result.serial.Keys)}");
                Log($"All seasons: {string.Join(", ", allSeasons.Select(kv => $"{kv.Key}({kv.Value.voice})"))}");

                // Формуємо HTML-фільтр озвучок
                var voicesHtml = new System.Text.StringBuilder();
                voicesHtml.Append("<div class=\"videos__line\">");
                foreach (var voice in result.serial.Keys)
                {
                    bool isActive = voice == currentVoice;
                    voicesHtml.Append($"<div class=\"videos__button selector{(isActive ? " active" : "")}\" data-json='{{\"method\":\"link\",\"url\":\"{Request.Scheme}://{Request.Host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(voice)}\"}}'>{HttpUtility.HtmlEncode(voice)}</div>");
                }
                voicesHtml.Append("</div>");

                // Якщо є кілька сезонів і s не задано — повертаємо список сезонів
                if (allSeasons.Count > 1 && string.IsNullOrEmpty(s))
                {
                    Log("Showing season list (multiple seasons, no season selected)");
                    var stpl = new SeasonTpl();
                    foreach (var seasonPair in allSeasons)
                    {
                        stpl.Append(
                            seasonPair.Key,
                            $"{Request.Scheme}://{Request.Host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&s={HttpUtility.UrlEncode(seasonPair.Key)}",
                            seasonPair.Value.seasonName
                        );
                    }
                    return Content(voicesHtml.ToString() + stpl.ToHtml(), "text/html; charset=utf-8");
                }

                // Якщо вибрано озвучку - перевіряємо це ПЕРШИМ
                if (!string.IsNullOrEmpty(t))
                {
                    Log($"Voice selected: '{t}'");
                    
                    // Якщо також вибрано сезон і ця озвучка має цей сезон - показуємо серії
                    if (!string.IsNullOrEmpty(s))
                    {
                        Log($"Season also selected: '{s}'");
                        bool hasSeason = result.serial[t].Any(vs => vs.id == s);
                        Log($"Voice '{t}' has season '{s}': {hasSeason}");
                        
                        if (hasSeason)
                        {
                            Log("Showing episodes for specific voice and season");
                            // Показуємо озвучки для цього сезону
                            var voicesForSeasonHtml = new System.Text.StringBuilder();
                            voicesForSeasonHtml.Append("<div class=\"videos__line\">");
                            foreach (var voice in result.serial.Keys)
                            {
                                bool voiceHasSeason = result.serial[voice].Any(vs => vs.id == s);
                                bool isActive = voice == t;
                                if (voiceHasSeason)
                                {
                                    voicesForSeasonHtml.Append($"<div class=\"videos__button selector{(isActive ? " active" : "")}\" data-json='{{\"method\":\"link\",\"url\":\"{Request.Scheme}://{Request.Host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(voice)}&s={HttpUtility.UrlEncode(s)}\"}}'>{HttpUtility.HtmlEncode(voice)}</div>");
                                }
                            }
                            voicesForSeasonHtml.Append("</div>");
                            
                            // Показуємо серії
                            var selectedSeasonForVoice = result.serial[t].FirstOrDefault(vs => vs.id == s);
                            int episodeCountForVoice = selectedSeasonForVoice?.episodes?.Count ?? 0;
                            Log($"Episodes count for voice '{t}' season '{s}': {episodeCountForVoice}");
                            
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
                                        $"{Request.Scheme}://{Request.Host}/uaflix?rjson=True&e={epNum}&s={s}&id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(t)}",
                                        "call",
                                        null, // streamquality
                                        null, // subtitles
                                        null, // streamlink
                                        t // voice_name/details
                                    );
                                    epNum++;
                                }
                                return Content(voicesForSeasonHtml.ToString() + etpl.ToHtml(), "text/html; charset=utf-8");
                            }
                        }
                    }
                    
                    // Якщо сезон не вибрано або ця озвучка не має цього сезону - показуємо сезони цієї озвучки
                    Log("Showing seasons for selected voice");
                    var seasonsForVoiceHtml = new System.Text.StringBuilder();
                    seasonsForVoiceHtml.Append("<div class=\"videos__line\">");
                    foreach (var voice in result.serial.Keys)
                    {
                        bool isActive = voice == t;
                        seasonsForVoiceHtml.Append($"<div class=\"videos__button selector{(isActive ? " active" : "")}\" data-json='{{\"method\":\"link\",\"url\":\"{Request.Scheme}://{Request.Host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(voice)}\"}}'>{HttpUtility.HtmlEncode(voice)}</div>");
                    }
                    seasonsForVoiceHtml.Append("</div>");
                    
                    var stplForVoice = new SeasonTpl();
                    foreach (var season in result.serial[t])
                    {
                        bool isActive = season.id == currentSeason;
                        stplForVoice.Append(
                            season.id,
                            $"{Request.Scheme}://{Request.Host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(t)}&s={HttpUtility.UrlEncode(season.id)}",
                            season.name
                        );
                    }
                    return Content(seasonsForVoiceHtml.ToString() + stplForVoice.ToHtml(), "text/html; charset=utf-8");
                }

                // Якщо вибрано сезон - показуємо серії цього сезону
                if (!string.IsNullOrEmpty(s))
                {
                    Log($"Season selected: '{s}' (no voice specified)");
                    
                    // Знаходимо озвучку для цього сезону
                    string seasonVoice = currentVoice;
                    if (allSeasons.TryGetValue(s, out var seasonInfo))
                    {
                        seasonVoice = seasonInfo.voice;
                        Log($"Found voice for season '{s}': '{seasonVoice}'");
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
                            voicesForSeasonHtml.Append($"<div class=\"videos__button selector{(isActive ? " active" : "")}\" data-json='{{\"method\":\"link\",\"url\":\"{Request.Scheme}://{Request.Host}/uaflix?id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(voice)}&s={HttpUtility.UrlEncode(s)}\"}}'>{HttpUtility.HtmlEncode(voice)}</div>");
                        }
                    }
                    voicesForSeasonHtml.Append("</div>");
                    
                    // Показуємо серії
                    var selectedSeasonForS = result.serial[seasonVoice].FirstOrDefault(v => v.id == s);
                    int episodeCountForS = selectedSeasonForS?.episodes?.Count ?? 0;
                    Log($"Episodes count for season '{s}' with voice '{seasonVoice}': {episodeCountForS}");
                    
                    if (episodeCountForS > 0)
                    {
                        Log("Showing episodes for selected season");
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
                                $"{Request.Scheme}://{Request.Host}/uaflix?rjson=True&e={epNum}&s={s}&id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(seasonVoice)}",
                                "call",
                                null, // streamquality
                                null, // subtitles
                                null, // streamlink
                                seasonVoice // voice_name/details
                            );
                            epNum++;
                        }
                        return Content(voicesForSeasonHtml.ToString() + etpl.ToHtml(), "text/html; charset=utf-8");
                    }
                }

                // Якщо є кілька серій і e не задано — повертаємо список серій
                var selectedSeason = result.serial[currentVoice].FirstOrDefault(v => v.id == currentSeason);
                int episodeCount = selectedSeason?.episodes?.Count ?? 0;
                Log($"Default case: currentVoice='{currentVoice}', currentSeason='{currentSeason}', episodeCount={episodeCount}, e='{e}'");
                
                if (episodeCount > 1 && string.IsNullOrEmpty(e))
                {
                    Log("Showing episode list (multiple episodes, no episode selected)");
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
                            $"{Request.Scheme}://{Request.Host}/uaflix?rjson=True&e={epNum}&s={currentSeason}&id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(currentVoice)}",
                            "call",
                            null, // streamquality
                            null, // subtitles
                            null, // streamlink
                            currentVoice // voice_name/details
                        );
                        epNum++;
                    }
                    return Content(voicesHtml.ToString() + etpl.ToHtml(), "text/html; charset=utf-8");
                }

                // Вибір серії (або автоматично перша)
                var episodeId = e;
                if (episodeCount == 0)
                {
                    Log("No episodes found");
                    return Content("Пошук не дав результатів.", "text/html; charset=utf-8");
                }
                if (string.IsNullOrEmpty(episodeId))
                {
                    episodeId = "1"; // Перша серія
                    Log($"No episode selected, using first episode: {episodeId}");
                }

                // Перенаправляємо на rjson endpoint для відтворення
                var videoUrl = $"/uaflix?rjson=True&e={episodeId}&s={currentSeason}&id={id}&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&t={HttpUtility.UrlEncode(currentVoice)}";
                Log($"Redirecting to video: {videoUrl}");
                return Redirect(videoUrl);
            }

            // Обробка фільмів
            if (result?.movie != null && result.movie.Count > 0)
            {
                var tpl = new MovieTpl(title, original_title, result.movie.Count);
                foreach (var movie in result.movie)
                {
                    var streamquality = new StreamQualityTpl();
                    foreach (var item in movie.links)
                        streamquality.Append(HostStreamProxy(init, item.link, proxy: proxy), item.quality);

                    tpl.Append(
                        movie.translation,
                        streamquality.Firts().link,
                        streamquality: streamquality,
                        subtitles: movie.subtitles
                    );
                }

                return Content(tpl.ToHtml(), "text/html; charset=utf-8");
            }

            return Content("Контент не знайдено", "text/html; charset=utf-8");
        }

        async ValueTask<Result> Search(string imdb_id, long kinopoisk_id, string title, string original_title, int serial)
        {
            Result result = new Result();
            string filmTitle = !string.IsNullOrEmpty(title) ? title : original_title;
            string searchUrl = $"https://uafix.net/index.php?do=search&subaction=search&story={HttpUtility.UrlEncode(filmTitle)}";

            httpClient.DefaultRequestHeaders.Clear();
            httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
            httpClient.DefaultRequestHeaders.Add("Referer", "https://uafix.net/");

            try
            {
            var searchHtml = await httpClient.GetStringAsync(searchUrl);
            var doc = new HtmlDocument();
            doc.LoadHtml(searchHtml);

                var filmNode = doc.DocumentNode.SelectSingleNode("//a[contains(@class, 'sres-wrap')]");
                if (filmNode == null) return null;

                string filmUrl = filmNode.GetAttributeValue("href", "");
                if (!filmUrl.StartsWith("http"))
                    filmUrl = "https://uafix.net" + filmUrl;

                var filmHtml = await httpClient.GetStringAsync(filmUrl);
                doc.LoadHtml(filmHtml);

                // Обробка серіалів (ashdi.vip)
                var ashdiIframe = doc.DocumentNode.SelectSingleNode("//iframe[contains(@src,'ashdi.vip/serial/')]");
                if (ashdiIframe != null && serial == 1)
                {
                    Log("Found Ashdi serial iframe, processing...");
                    string ashdiUrl = ashdiIframe.GetAttributeValue("src", "");
                var ashdiHtml = await httpClient.GetStringAsync(ashdiUrl);

                var ashdiFileMatch = Regex.Match(ashdiHtml, @"file:'(\[.*?\])'");
                if (ashdiFileMatch.Success)
                {
                        Log("Found Ashdi file JSON, parsing...");
                    string fileJson = ashdiFileMatch.Groups[1].Value;
                    var voices = JsonConvert.DeserializeObject<List<AshdiVoice>>(fileJson);

                        Log($"Parsed {voices.Count} voices from Ashdi");
                        ashdiEpisodesDict.Clear();
                    var serialDict = new Dictionary<string, List<Voice>>();

                    foreach (var voice in voices)
                    {
                            Log($"Processing voice: '{voice.title}' with {voice.folder?.Count ?? 0} seasons");
                        var voiceSeasons = new List<Voice>();
                        foreach (var season in voice.folder ?? new List<AshdiSeason>())
                        {
                                string seasonNum = Regex.Match(season.title, "\\d+").Value;
                            var episodesList = new List<Serial>();

                                Log($"Processing season: '{season.title}' (num: {seasonNum}) with {season.folder?.Count ?? 0} episodes");
                                int epNum = 1;
                            foreach (var episode in season.folder ?? new List<AshdiEpisode>())
                            {
                                episodesList.Add(new Serial
                                {
                                    id = episode.id,
                                    links = new List<(string link, string quality)> { (episode.file, "1080p") }
                                    });

                                    ashdiEpisodesDict[$"{voice.title.Trim()}|{seasonNum}|{epNum}"] = episode;
                                    Log($"Added episode {epNum} to dict: '{voice.title.Trim()}|{seasonNum}|{epNum}' -> '{episode.title}'");
                                    epNum++;
                                }

                                voiceSeasons.Add(new Voice
                                {
                                    id = seasonNum,
                                    name = $"{seasonNum} сезон",
                                    episodes = episodesList
                                });
                            }
                            serialDict[voice.title.Trim()] = voiceSeasons;
                        }

                        result.serial = serialDict;
                        Log($"Final result: {serialDict.Count} voices, {ashdiEpisodesDict.Count} episodes in cache");
                        return result;
                    }
                    else
                    {
                        Log("Ashdi file JSON not found");
                    }
                }

                // Обробка фільмів
                var iframeNodes = doc.DocumentNode.SelectNodes("//div[contains(@class, 'video-box')]/iframe");
                if (iframeNodes == null || !iframeNodes.Any()) return null;

                var movies = new List<Movie>();
                foreach (var iframe in iframeNodes)
                {
                    string iframeUrl = iframe.GetAttributeValue("src", "");
                    if (string.IsNullOrEmpty(iframeUrl)) continue;

                    if (iframeUrl.Contains("zetvideo.net"))
                    {
                        var zlinks = await ParseZetvideo(iframeUrl);
                        foreach (var l in zlinks)
                        {
                            movies.Add(new Movie
                            {
                                translation = $"{filmTitle} (Zetvideo)",
                                links = new List<(string, string)> { (l.link, l.quality) },
                                subtitles = null
                            });
                        }
                    }
                    else if (iframeUrl.Contains("ashdi.vip"))
                    {
                        var alinks = await ParseAshdi(iframeUrl);
                        string ashdiId = Regex.Match(iframeUrl, @"_(\d+)").Groups[1].Value;
                        SubtitleTpl subtitles = await GetAshdiSubtitles(ashdiId);

                        foreach (var l in alinks)
                        {
                            movies.Add(new Movie
                            {
                                translation = $"{filmTitle} (Ashdi)",
                                links = new List<(string, string)> { (l.link, l.quality) },
                                subtitles = subtitles
                            });
                        }
                    }
                }

                if (movies.Count > 0)
                {
                    result.movie = movies;
                    return result;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"UaFlix error: {ex.Message}");
            }

            return null;
        }

        async Task<List<(string link, string quality)>> ParseZetvideo(string iframeUrl)
        {
            var result = new List<(string link, string quality)>();
            try
            {
                var response = await httpClient.GetStringAsync(iframeUrl);
                var doc = new HtmlDocument();
                doc.LoadHtml(response);

                var sourceNodes = doc.DocumentNode.SelectNodes("//source[contains(@src, '.m3u8')]");
                if (sourceNodes != null)
                {
                    foreach (var node in sourceNodes)
                    {
                        var url = node.GetAttributeValue("src", null);
                        var label = node.GetAttributeValue("label", null) ?? "1080p";
                        if (!string.IsNullOrEmpty(url))
                            result.Add((url, label));
                    }
                }

                if (result.Count == 0)
                {
                    var matches = Regex.Matches(response, @"https?:\/\/[^\s'""]+\.m3u8");
                    foreach (Match match in matches)
                        result.Add((match.Value, "1080p"));
                }
            }
            catch { }
            return result;
        }

        async Task<List<(string link, string quality)>> ParseAshdi(string iframeUrl)
        {
            var result = new List<(string link, string quality)>();
            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, iframeUrl);
                request.Headers.Add("Referer", "https://ashdi.vip/");
                var response = await httpClient.SendAsync(request);
                var html = await response.Content.ReadAsStringAsync();

                var sourceNodes = HtmlAgilityPack.HtmlNode.CreateNode(html)
                    .SelectNodes("//source[contains(@src, '.m3u8')]");

                if (sourceNodes != null)
                {
                    foreach (var node in sourceNodes)
                    {
                        var url = node.GetAttributeValue("src", null);
                        var label = node.GetAttributeValue("label", null) ?? "1080p";
                        if (!string.IsNullOrEmpty(url))
                            result.Add((url, label));
                    }
                }

                if (result.Count == 0)
                {
                    var matches = Regex.Matches(html, @"https?:\/\/[^\s'""]+\.m3u8");
                    foreach (Match match in matches)
                        result.Add((match.Value, "1080p"));
                }
            }
            catch { }
            return result;
        }

        async Task<SubtitleTpl> GetAshdiSubtitles(string id)
        {
            var st = new SubtitleTpl();
            try
            {
                string url = $"https://ashdi.vip/vod/{id}";
                var html = await httpClient.GetStringAsync(url);

                string subtitle = new Regex("subtitle(\")?:\"([^\"]+)\"").Match(html).Groups[2].Value;
                if (!string.IsNullOrEmpty(subtitle))
                {
                    var match = new Regex("\\[([^\\]]+)\\](https?://[^\\,]+)").Match(subtitle);
                    while (match.Success)
                    {
                        st.Append(match.Groups[1].Value, match.Groups[2].Value);
                        match = match.NextMatch();
                    }
                }
            }
            catch { }
            return st;
        }
    }
}
