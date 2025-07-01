using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Web;
using System.Linq;
using Shared.Engine.CORE;
using Lampac.Engine;
using Shared.Model.Templates;
using Hdvbua.Models.HdvbUa;
using System.Net.Http;
using HtmlAgilityPack;
using System.IO;
using System.Text.RegularExpressions;
using System;

namespace Hdvbua.Controllers
{
    public class HdvbUa : BaseController
    {
        ProxyManager proxyManager = new ProxyManager(ModInit.HdvbUa);

        [HttpGet]
        [Route("hdvbua")]
        async public Task<ActionResult> Index(long id, string imdb_id, long kinopoisk_id, string title, string original_title, string original_language, int year, string source, int serial, string account_email, string t, int s = -1, bool rjson = false)
        {
            var init = ModInit.HdvbUa;
            if (!init.enable)
                return Forbid();

            var proxy = proxyManager.Get();

            var result = await search(imdb_id, kinopoisk_id, serial, title, original_title, year);
            if (result == null)
            {
                proxyManager.Refresh();
                return Ok();
            }

            if (result.movie != null)
            {
                try { System.IO.File.AppendAllText("D:/Lampac/lampac_hdvbua_diag.txt", $"MovieTpl: result.foundTitle={result.foundTitle}, title={title}, original_title={original_title}\n"); } catch {}
                var tpl = new MovieTpl(result.foundTitle ?? title, original_title);

                foreach (var movie in result.movie)
                {
                    var streamquality = new StreamQualityTpl();
                    foreach (var item in movie.links)
                        streamquality.Append(HostStreamProxy(init, item.link, proxy: proxy), item.quality);

                    tpl.Append(movie.translation, streamquality.Firts().link, quality: streamquality.Firts().quality, streamquality: streamquality);
                }

                if (rjson)
                    return Content(tpl.ToJson(), "application/json; charset=utf-8");

                return Content(tpl.ToHtml(), "text/html; charset=utf-8");
            }
            else
            {
                if (result.serial == null)
                {
                    proxyManager.Refresh();
                    return Ok();
                }

                string defaultargs = $"&imdb_id={imdb_id}&kinopoisk_id={kinopoisk_id}&title={HttpUtility.UrlEncode(title)}&original_title={HttpUtility.UrlEncode(original_title)}&serial={serial}";

                if (s == -1)
                {
                    var tpl = new SeasonTpl(quality: "4K HDR");

                    foreach (var season in result.serial)
                        tpl.Append($"{season.Key} сезон", $"{host}/hdvbua?s={season.Key}" + defaultargs, season.Key);

                    if (rjson)
                        return Content(tpl.ToJson(), "application/json; charset=utf-8");

                    return Content(tpl.ToHtml(), "text/html; charset=utf-8");
                }
                else
                {
                    var vtpl = new VoiceTpl();
                    var etpl = new EpisodeTpl();

                    string activTranslate = t;

                    foreach (var translation in result.serial[s.ToString()])
                    {
                        if (string.IsNullOrEmpty(activTranslate))
                            activTranslate = translation.id;

                        vtpl.Append(translation.name, activTranslate == translation.id, $"{host}/hdvbua?s={s}&t={translation.id}" + defaultargs);
                    }

                    foreach (var episode in result.serial[s.ToString()].First(i => i.id == activTranslate).episodes)
                    {
                        var streamquality = new StreamQualityTpl();
                        foreach (var item in episode.links)
                            streamquality.Append(HostStreamProxy(init, item.link, proxy: proxy), item.quality);

                        etpl.Append($"{episode.id} серия", $"{title ?? original_title} ({episode.id} серия)", s.ToString(), episode.id, streamquality.Firts().link, streamquality: streamquality);
                    }

                    if (rjson)
                        return Content(etpl.ToJson(vtpl), "application/json; charset=utf-8");

                    return Content(vtpl.ToHtml() + etpl.ToHtml(), "text/html; charset=utf-8");
                }
            }
        }


        async ValueTask<Result> search(string imdb_id, long kinopoisk_id, int serial, string title, string original_title, int year)
        {
            string memKey = $"HdvbUa:view:{kinopoisk_id}:{imdb_id}";
            if (hybridCache.TryGetValue(memKey, out Result res))
            {
                try { System.IO.File.AppendAllText("D:/Lampac/lampac_hdvbua_diag.txt", $"FROM CACHE: res.foundTitle={res.foundTitle}\n"); } catch {}
                return res;
            }

            res = new Result();
            try
            {
                // 1. Пошук фільму по title/original_title
                string searchTitle = title ?? original_title;
                if (string.IsNullOrWhiteSpace(searchTitle))
                    return null;
                string searchUrl = $"https://eneyida.tv/index.php?do=search&subaction=search&search_start=0&full_search=0&story={System.Web.HttpUtility.UrlEncode(searchTitle)}";
                using var httpClient = new HttpClient();
                var searchHtml = await httpClient.GetStringAsync(searchUrl);
                try { System.IO.File.WriteAllText("D:/Lampac/lampac_hdvbua.html", searchHtml); } catch { }

                // --- Нова логіка як у Eneyida ---
                try {
                    System.IO.File.WriteAllText("D:/Lampac/lampac_hdvbua_diag.txt", $"searchTitle={searchTitle}\n");
                } catch {}
                var rows = searchHtml.Split("<article ");
                string? stitle = (title ?? "").ToLower().Trim();
                string? sorig = (original_title ?? "").ToLower().Trim();
                string syear = year > 0 ? year.ToString() : null;
                string filmUrl = null;
                string reservedlink = null;
                int minLevenshtein = int.MaxValue;
                foreach (string row in rows.Skip(1))
                {
                    if (row.Contains(">Анонс</div>") || row.Contains(">Трейлер</div>"))
                        continue;
                    string newslink = System.Text.RegularExpressions.Regex.Match(row, "href=\"(https?://[^/]+/[^\"]+\\.html)\"").Groups[1].Value;
                    if (string.IsNullOrWhiteSpace(newslink))
                        continue;
                    // Основна назва (українською)
                    string mainTitle = System.Text.RegularExpressions.Regex.Match(row, "<a[^>]+class=\"short_title\"[^>]*>([^<]+)</a>").Groups[1].Value.Trim().ToLower();
                    var g = System.Text.RegularExpressions.Regex.Match(row, "class=\"short_subtitle\">(<a [^>]+>([0-9]{4})</a>)?([^<]+)</div>").Groups;
                    string origTitle = System.Net.WebUtility.HtmlDecode(g[3].Value.Replace("&bull;", "")).ToLower().Trim();
                    string foundYear = g[2].Value;
                    // Покращене порівняння
                    bool mainTitleEq = !string.IsNullOrEmpty(mainTitle) && mainTitle == stitle;
                    bool mainTitleContains = !string.IsNullOrEmpty(mainTitle) && (mainTitle.Contains(stitle) || stitle.Contains(mainTitle));
                    int mainLev = LevenshteinDistance(mainTitle, stitle);
                    bool origTitleEq = !string.IsNullOrEmpty(origTitle) && origTitle == sorig;
                    bool origTitleContains = !string.IsNullOrEmpty(origTitle) && (origTitle.Contains(sorig) || sorig.Contains(origTitle));
                    int origLev = LevenshteinDistance(origTitle, sorig);
                    bool yearEq = !string.IsNullOrEmpty(syear) && foundYear == syear;
                    try {
                        System.IO.File.AppendAllText("D:/Lampac/lampac_hdvbua_diag.txt",
                            $"mainTitle={mainTitle}, origTitle={origTitle}, foundYear={foundYear}, mainLev={mainLev}, origLev={origLev}, mainTitleEq={mainTitleEq}, origTitleEq={origTitleEq}, mainTitleContains={mainTitleContains}, origTitleContains={origTitleContains}, yearEq={yearEq}, newslink={newslink}\n");
                    } catch {}
                    // Відповідність
                    bool isMatch = false;
                    if (yearEq)
                    {
                        if (mainTitleEq || origTitleEq)
                            isMatch = true;
                        else if (mainTitleContains || origTitleContains)
                            isMatch = true;
                        else if (mainLev <= 2 || origLev <= 2)
                            isMatch = true;
                    }
                    try {
                        System.IO.File.AppendAllText("D:/Lampac/lampac_hdvbua_diag.txt", $"isMatch={isMatch}\n");
                    } catch {}
                    if (isMatch)
                    {
                        filmUrl = newslink;
                        try {
                            System.IO.File.AppendAllText("D:/Lampac/lampac_hdvbua_diag.txt", $"FOUND: filmUrl={filmUrl}\n");
                        } catch {}
                        break;
                    }
                    // fallback: найкращий за Левенштейном
                    if ((mainLev < minLevenshtein || origLev < minLevenshtein) && (string.IsNullOrEmpty(syear) || yearEq))
                    {
                        reservedlink = newslink;
                        minLevenshtein = Math.Min(mainLev, origLev);
                    }
                }
                if (string.IsNullOrEmpty(filmUrl))
                    filmUrl = reservedlink;
                if (string.IsNullOrEmpty(filmUrl))
                {
                    // fallback: перший результат
                    var first = System.Text.RegularExpressions.Regex.Match(searchHtml, "href=\"(https?://[^/]+/[^\"]+\\.html)\"");
                    if (first.Success)
                        filmUrl = first.Groups[1].Value;
                }
                if (string.IsNullOrEmpty(filmUrl))
                    return null;
                if (!filmUrl.StartsWith("http"))
                    filmUrl = "https://eneyida.tv" + filmUrl;

                // 2. Парсинг сторінки фільму
                var filmHtml = await httpClient.GetStringAsync(filmUrl);
                try { System.IO.File.WriteAllText("D:/Lampac/lampac_hdvbua_film.html", filmHtml); } catch { }
                var doc = new HtmlDocument();
                doc.LoadHtml(filmHtml);
                var h1Node = doc.DocumentNode.SelectSingleNode("//h1");
                if (h1Node != null)
                {
                    res.foundTitle = h1Node.InnerText.Trim();
                    try { System.IO.File.AppendAllText("D:/Lampac/lampac_hdvbua_diag.txt", $"AFTER H1: res.foundTitle={res.foundTitle}\n"); } catch {}
                }
                var playerLinks = doc.DocumentNode.SelectNodes("//iframe[contains(@src, 'hdvbua.pro/embed') or contains(@src, 'hdvbua.pro/vid')] | //a[contains(@href, 'hdvbua.pro/embed') or contains(@href, 'hdvbua.pro/vid')]");
                try { System.IO.File.AppendAllText("D:/Lampac/lampac_hdvbua_diag.txt", $"playerLinks count={(playerLinks == null ? 0 : playerLinks.Count)}\n"); } catch { }
                string playerUrl = null;
                if (playerLinks != null)
                {
                    foreach (var node in playerLinks)
                    {
                        string url = node.GetAttributeValue("src", null) ?? node.GetAttributeValue("href", null);
                        if (string.IsNullOrEmpty(url)) continue;
                        if (url.Contains("trailer")) continue;
                        playerUrl = url;
                        try { System.IO.File.AppendAllText("D:/Lampac/lampac_hdvbua_diag.txt", $"playerUrl={playerUrl}\n"); } catch { }
                        break;
                    }
                }
                if (string.IsNullOrEmpty(playerUrl))
                {
                    try { System.IO.File.AppendAllText("D:/Lampac/lampac_hdvbua_diag.txt", "NO playerUrl FOUND\n"); } catch { }
                    return null;
                }
                if (!playerUrl.StartsWith("http"))
                    playerUrl = "https://hdvbua.pro" + playerUrl;

                // 3. Парсинг /embed/{id} або /vid/{id} для m3u8
                var playerHtml = await httpClient.GetStringAsync(playerUrl);
                try { System.IO.File.WriteAllText("D:/Lampac/lampac_hdvbua_player.html", playerHtml); } catch { }
                doc.LoadHtml(playerHtml);
                string m3u8 = null;
                var sourceNode = doc.DocumentNode.SelectSingleNode("//source[contains(@src, '.m3u8')]");
                if (sourceNode != null)
                {
                    try { System.IO.File.AppendAllText("D:/Lampac/lampac_hdvbua_diag.txt", $"FOUND sourceNode m3u8={sourceNode.GetAttributeValue("src", "")}\n"); } catch { }
                    m3u8 = sourceNode.GetAttributeValue("src", "");
                }
                if (string.IsNullOrEmpty(m3u8))
                {
                    var videoNode = doc.DocumentNode.SelectSingleNode("//video[contains(@src, '.m3u8')]");
                    if (videoNode != null)
                    {
                        try { System.IO.File.AppendAllText("D:/Lampac/lampac_hdvbua_diag.txt", $"FOUND videoNode m3u8={videoNode.GetAttributeValue("src", "")}\n"); } catch { }
                        m3u8 = videoNode.GetAttributeValue("src", "");
                    }
                    // Парсимо m3u8 з JS-ініціалізації Playerjs
                    if (string.IsNullOrEmpty(m3u8))
                    {
                        var m3u8Match = System.Text.RegularExpressions.Regex.Match(playerHtml, "file:\\s*\"([^\"]+\\.m3u8)\"");
                        if (m3u8Match.Success)
                        {
                            m3u8 = m3u8Match.Groups[1].Value;
                            try { System.IO.File.AppendAllText("D:/Lampac/lampac_hdvbua_diag.txt", $"FOUND JS m3u8={m3u8}\n"); } catch { }
                        }
                    }
                }
                if (string.IsNullOrEmpty(m3u8))
                {
                    try { System.IO.File.AppendAllText("D:/Lampac/lampac_hdvbua_diag.txt", "NO m3u8 FOUND\n"); } catch { }
                    return null;
                }

                res.movie = new List<Movie>()
                {
                    new Movie()
                    {
                        translation = "HDVBua",
                        links = new List<(string, string)>() { (m3u8, "auto") }
                    }
                };
                proxyManager.Success();
                hybridCache.Set(memKey, res, cacheTime(10));
                try { System.IO.File.AppendAllText("D:/Lampac/lampac_hdvbua_diag.txt", $"RETURN: res.foundTitle={res.foundTitle}\n"); } catch {}
            }
            catch
            {
                return null;
            }
            return res;
        }

        static int LevenshteinDistance(string a, string b)
        {
            if (string.IsNullOrEmpty(a)) return b?.Length ?? 0;
            if (string.IsNullOrEmpty(b)) return a.Length;
            int[,] d = new int[a.Length + 1, b.Length + 1];
            for (int i = 0; i <= a.Length; i++) d[i, 0] = i;
            for (int j = 0; j <= b.Length; j++) d[0, j] = j;
            for (int i = 1; i <= a.Length; i++)
                for (int j = 1; j <= b.Length; j++)
                    d[i, j] = Math.Min(
                        Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                        d[i - 1, j - 1] + (a[i - 1] == b[j - 1] ? 0 : 1));
            return d[a.Length, b.Length];
        }
    }
}
