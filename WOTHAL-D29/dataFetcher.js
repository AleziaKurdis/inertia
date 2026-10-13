//
//  dataFetcher.js
//
//  Created by Alezia Kurdis, October 12th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Datasource  extraction and display.
//  Client-side data fetcher for Overte
//  Supports JSON, RSS and Atom feeds.
//  No persistent cache. No entity creation.

//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function () {
    let entityID = null;
    let refreshTimer = null;
    let requestInProgress = false;
    let stopped = false;
    let config = null;

    const DEFAULT_MAX_ENTRIES = 5;
    const DEFAULT_REFRESH_SECONDS = 300;

    const DEFAULT_USER_DATA = {
        "dataSource": {
            "url": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
            "format": "json",
            "entryPath": "features",
            "fields": {
                "title": "properties.place",
                "summary": "properties.mag",
                "url": "properties.url",
                "timestamp": "properties.time"
            },
            "timeFormat": "unix-ms",
            "maxEntries": 5,
            "refreshSeconds": 300
        },
        "rendering": {
            "type": "list",
            "maxLines": 5,
            "showTimestamp": true
        }
    };

    // ---------------------------------------------------------
    // Configuration
    // ---------------------------------------------------------

    function loadConfig() {
        const properties = Entities.getEntityProperties(
            entityID,
            ["userData"]
        );

        if (!properties) {
            print("[DataFetcher] Could not read entity properties.");
            return false;
        }

        let userData = properties.userData;

        if (!userData || !userData.trim()) {
            userData = JSON.stringify(DEFAULT_USER_DATA, null, 4);

            Entities.editEntity(entityID, {
                userData: userData
            });

            print("[DataFetcher] Default userData template initialized.");
        }

        try {
            config = JSON.parse(userData);
        } catch (e) {
            print("[DataFetcher] Invalid userData JSON: " + e);
            return false;
        }

        if (!config.dataSource || !config.dataSource.url) {
            print("[DataFetcher] Missing dataSource.url.");
            return false;
        }

        const source = config.dataSource;

        if (!/^https?:\/\//i.test(source.url)) {
            print("[DataFetcher] Only HTTP and HTTPS URLs are supported.");
            return false;
        }

        source.format = String(source.format || "json").toLowerCase();

        if (source.format !== "json" &&
            source.format !== "rss" &&
            source.format !== "atom") {
            print("[DataFetcher] Unsupported format: " + source.format);
            return false;
        }

        source.maxEntries = parseInt(source.maxEntries, 10);

        if (isNaN(source.maxEntries) || source.maxEntries < 1) {
            source.maxEntries = DEFAULT_MAX_ENTRIES;
        }

        source.maxEntries = Math.min(source.maxEntries, 100);

        source.refreshSeconds = Number(source.refreshSeconds);

        if (!isFinite(source.refreshSeconds) ||
            source.refreshSeconds < 0) {
            source.refreshSeconds = DEFAULT_REFRESH_SECONDS;
        }

        return true;
    }

    // ---------------------------------------------------------
    // Generic field-path reader for JSON
    // Example: properties.place
    // ---------------------------------------------------------

    function getPath(object, path) {
        if (path === undefined || path === null || path === "") {
            return null;
        }

        const parts = String(path).split(".");
        let value = object;

        for (let i = 0; i < parts.length; i++) {
            if (value === null || value === undefined) {
                return null;
            }

            value = value[parts[i]];
        }

        if (value === undefined || value === null) {
            return null;
        }

        // Preserve arrays and objects for internal use.
        return value;
    }

    function getEntries(data, path) {
        if (!path) {
            return data;
        }

        return getPath(data, path);
    }

    function getFieldValue(object, path) {
        const value = getPath(object, path);

        if (value === null || value === undefined) {
            return null;
        }

        if (typeof value === "object") {
            return JSON.stringify(value);
        }

        return value;
    }

    // ---------------------------------------------------------
    // Timestamp normalization
    // All valid timestamps become Unix milliseconds.
    // Numeric timestamps require an explicit unit.
    // ---------------------------------------------------------

    function normalizeTimestamp(value, format) {
        if (value === undefined || value === null || value === "") {
            return null;
        }

        format = String(format || "auto").toLowerCase();

        if (format === "unix-ms" || format === "unix-s") {
            const number = Number(value);

            if (!isFinite(number)) {
                return null;
            }

            return Math.round(
                format === "unix-s" ? number * 1000 : number
            );
        }

        // Do not guess whether a numeric timestamp uses seconds
        // or milliseconds.
        if (typeof value === "number" ||
            /^[+-]?\d+(\.\d+)?$/.test(String(value).trim())) {
            return null;
        }

        if (format === "iso8601" ||
            format === "rfc822" ||
            format === "auto") {
            const milliseconds = Date.parse(String(value));

            if (isFinite(milliseconds)) {
                return milliseconds;
            }
        }

        return null;
    }

    // ---------------------------------------------------------
    // XML helpers for RSS and Atom.
    // This lightweight parser is intended for ordinary feeds,
    // not arbitrary XML documents.
    // ---------------------------------------------------------

    function decodeXml(text) {
        return String(text)
            .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
            .replace(/&#x([0-9a-f]+);/gi, function (match, hex) {
                return String.fromCharCode(parseInt(hex, 16));
            })
            .replace(/&#(\d+);/g, function (match, number) {
                return String.fromCharCode(parseInt(number, 10));
            })
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&amp;/g, "&");
    }

    function xmlText(text) {
        return decodeXml(text)
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function getXmlTag(xml, tagName) {
        const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const expression = new RegExp(
            "<(?:[\\w.-]+:)?" + escaped + "\\b[^>]*>" +
            "([\\s\\S]*?)" +
            "<\\/(?:[\\w.-]+:)?" + escaped + "\\s*>",
            "i"
        );

        const match = expression.exec(xml);

        if (!match) {
            return "";
        }

        return xmlText(match[1]);
    }

    function getFeedLink(xml, format) {
        if (format === "atom") {
            const expression = /<(?:[\w.-]+:)?link\b([^>]*)\/?>/gi;
            let match;

            while ((match = expression.exec(xml)) !== null) {
                const attributes = match[1];
                const relMatch = /\brel\s*=\s*["']([^"']+)["']/i.exec(attributes);
                const hrefMatch = /\bhref\s*=\s*["']([^"']+)["']/i.exec(attributes);

                if (!hrefMatch) {
                    continue;
                }

                if (!relMatch || relMatch[1] === "alternate") {
                    return decodeXml(hrefMatch[1]);
                }
            }

            return "";
        }

        return getXmlTag(xml, "link");
    }

    function parseFeed(xml, format) {
        const tag = format === "atom" ? "entry" : "item";
        const expression = new RegExp(
            "<(?:[\\w.-]+:)?" + tag + "\\b[^>]*>" +
            "([\\s\\S]*?)" +
            "<\\/(?:[\\w.-]+:)?" + tag + "\\s*>",
            "gi"
        );

        const records = [];
        let match;

        while ((match = expression.exec(xml)) !== null) {
            const item = match[1];

            const title = getXmlTag(item, "title");
            let summary = getXmlTag(item, "description");

            if (!summary) {
                summary = getXmlTag(item, "summary");
            }

            if (!summary) {
                summary = getXmlTag(item, "content");
            }

            let timestamp = getXmlTag(item, "pubDate");

            if (!timestamp) {
                timestamp = getXmlTag(item, "published");
            }

            if (!timestamp) {
                timestamp = getXmlTag(item, "updated");
            }

            if (!timestamp) {
                timestamp = getXmlTag(item, "date");
            }

            records.push({
                title: title,
                summary: summary,
                url: getFeedLink(item, format),
                timestamp: timestamp
            });
        }

        return records;
    }

    // ---------------------------------------------------------
    // Convert source-specific entries to common records.
    // ---------------------------------------------------------

    function normalizeJsonEntries(data, source) {
        const entries = getEntries(data, source.entryPath);

        if (!Array.isArray(entries)) {
            print("[DataFetcher] entryPath did not resolve to an array.");
            return [];
        }

        const fields = source.fields || {};
        const records = [];

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];

            const rawTimestamp = fields.timestamp
                ? getFieldValue(entry, fields.timestamp)
                : null;

            records.push({
                title: getFieldValue(entry, fields.title),
                summary: getFieldValue(entry, fields.summary),
                url: getFieldValue(entry, fields.url),
                timestamp: normalizeTimestamp(
                    rawTimestamp,
                    source.timeFormat
                )
            });
        }

        return records;
    }

    // ---------------------------------------------------------
    // Output
    // ---------------------------------------------------------

    function printRecords(records, source) {
        print("");
        print("========== DATA FETCHER ==========");
        print("URL: " + source.url);
        print("Format: " + source.format);
        print("Entries extracted: " + records.length);

        for (let i = 0; i < records.length; i++) {
            const record = records[i];

            print("");
            print("--- Entry " + (i + 1) + " ---");

            if (record.title !== null && record.title !== undefined) {
                print("Title: " + record.title);
            }

            if (record.summary !== null && record.summary !== undefined) {
                print("Summary: " + record.summary);
            }

            if (record.url !== null && record.url !== undefined) {
                print("URL: " + record.url);
            }

            if (record.timestamp !== null) {
                print("Timestamp (Unix ms): " + record.timestamp);
                print("Timestamp (UTC): " +
                    new Date(record.timestamp).toISOString());
            }
        }

        print("==================================");
        print("");
    }

    // ---------------------------------------------------------
    // Fetch
    // ---------------------------------------------------------

    function fetchData() {
        if (stopped || requestInProgress || !config) {
            return;
        }

        const source = config.dataSource;
        const xhr = new XMLHttpRequest();

        requestInProgress = true;

        xhr.open("GET", source.url, true);
        xhr.timeout = 20000;

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) {
                return;
            }

            requestInProgress = false;

            if (stopped) {
                return;
            }

            if (xhr.status < 200 || xhr.status >= 300) {
                print("[DataFetcher] HTTP error: " + xhr.status);
                return;
            }

            let records = [];

            try {
                if (source.format === "json") {
                    const data = JSON.parse(xhr.responseText);
                    records = normalizeJsonEntries(data, source);
                } else {
                    records = parseFeed(
                        xhr.responseText,
                        source.format
                    );

                    records = records.map(function (record) {
                        record.timestamp = normalizeTimestamp(
                            record.timestamp,
                            "auto"
                        );
                        return record;
                    });
                }

                records = records.slice(0, source.maxEntries);
                printRecords(records, source);
            } catch (e) {
                print("[DataFetcher] Parse error: " + e);
            }
        };

        xhr.onerror = function () {
            requestInProgress = false;
            print("[DataFetcher] Network error. Check URL and CORS.");
        };

        xhr.ontimeout = function () {
            requestInProgress = false;
            print("[DataFetcher] Request timed out.");
        };

        try {
            xhr.send();
        } catch (e) {
            requestInProgress = false;
            print("[DataFetcher] Request failed: " + e);
        }
    }

    // ---------------------------------------------------------
    // Entity script lifecycle
    // ---------------------------------------------------------

    this.preload = function (id) {
        entityID = id;
        stopped = false;

        if (!loadConfig()) {
            return;
        }

        fetchData();

        if (config.dataSource.refreshSeconds > 0) {
            refreshTimer = Script.setInterval(
                fetchData,
                config.dataSource.refreshSeconds * 1000
            );
        }
    };

    this.unload = function () {
        stopped = true;

        if (refreshTimer !== null) {
            Script.clearInterval(refreshTimer);
            refreshTimer = null;
        }
    };

    function GetCurrentCycleValue(cyclelength, cycleduration) {
        const today = new Date();
        const todaySec = today.getTime() / 1000;
        const currentSec = todaySec % cycleduration;

        return (currentSec / cycleduration) * cyclelength;
    }

    /*
     * Converts an HSL color value to RGB.
     * Assumes h, s, and l are in [0, 1].
     * Returns r, g, and b in [0, 255].
     */
    function hslToRgb(h, s, l) {
        let r;
        let g;
        let b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = function (p, q, t) {
                if (t < 0) {
                    t += 1;
                }
                if (t > 1) {
                    t -= 1;
                }
                if (t < 1 / 6) {
                    return p + (q - p) * 6 * t;
                }
                if (t < 1 / 2) {
                    return q;
                }
                if (t < 2 / 3) {
                    return p + (q - p) * (2 / 3 - t) * 6;
                }
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }
})
