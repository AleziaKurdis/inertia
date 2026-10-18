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
    var ROOT = Script.resolvePath('').split("dataFetcher.js")[0];
    let entityID = null;
    let refreshTimer = null;
    let requestInProgress = false;
    let stopped = false;
    let config = null;
    
    let rendererContainerID = Uuid.NONE;
    let emitterDimensions = null;
    let renderWithZones = [];

    const HMD_INTER_SPACE_NOTIFICATION = 0.05;
    const HMD_UI_SCALE_FACTOR = 1.0; //This define the size of all the notification system in HMD.
    let entityTopMargin = 0.02;
    let entityLeftMargin = 0.03;
    const MAX_LINE_LENGTH = 42;

    const DEFAULT_MAX_ENTRIES = 5;
    const DEFAULT_REFRESH_SECONDS = 300;
    const TIME_UNIT = 29; //for D29 time format
    
/*    
===== "timeFormat" suported: =====
"auto"	Automatically parses date strings
"unix-ms"	Unix timestamp in milliseconds
"unix-s"	Unix timestamp in seconds
"iso8601"	ISO 8601 date string
"rfc822"	RFC 822 date string, commonly used in RSS feeds
===================================

===== "colorMode" suported: =====
"staticColor" use the color defined in the property: "staticColor"
"hotToCold" use a gradation from rencent in red (hue 5 deg) to old in blue (hue 45 deg)
"weeklyHueCycle" set the color based on the timestamp and the weekly Hue cycle.
"whiteToHue" use a gradation from rencent in white to old in hue saturated color.

===================================
*/
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
            "descriptor": {
                "title": "Location: ",
                "summary": "Magnitude: ",
                "url": "",
                "timestamp": "Event date: "
            },
            "timeFormat": "unix-ms",
            "maxEntries": 5,
            "refreshSeconds": 300
        },
        "rendering": {
            "showTimestamp": true,
            "lineHeight": 0.05,
            "colorMode": "staticColor",
            "staticColor": {
                "red": 94,
                "green": 255,
                "blue":0
            },
            "hue": 0,
            "oldStackUp": true,
            "frameImageUrl": "https://aleziakurdis.github.io/inertia/WOTHAL-D29/images/entryFrame.jpg"
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
            source.format !== "atom" &&
            source.format !== "csv") {
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

    function parseCsv(csv) {
        csv = String(csv).replace(/^\uFEFF/, "");

        const rows = [];
        let row = [];
        let field = "";
        let inQuotes = false;

        for (let i = 0; i < csv.length; i++) {
            const char = csv[i];

            if (inQuotes) {
                if (char === '"') {
                    if (csv[i + 1] === '"') {
                        field += '"';
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    field += char;
                }
            } else if (char === '"' && field === "") {
                inQuotes = true;
            } else if (char === ",") {
                row.push(field);
                field = "";
            } else if (char === "\n" || char === "\r") {
                if (char === "\r" && csv[i + 1] === "\n") {
                    i++;
                }

                row.push(field);
                field = "";

                if (row.some(function (value) {
                    return value !== "";
                })) {
                    rows.push(row);
                }

                row = [];
            } else {
                field += char;
            }
        }

        if (field !== "" || row.length > 0) {
            row.push(field);

            if (row.some(function (value) {
                return value !== "";
            })) {
                rows.push(row);
            }
        }

        if (rows.length < 2) {
            return [];
        }

        const headers = rows[0].map(function (header) {
            return header.trim();
        });

        const records = [];

        for (let i = 1; i < rows.length; i++) {
            const record = {};

            for (let j = 0; j < headers.length; j++) {
                record[headers[j]] = rows[i][j] === undefined
                    ? ""
                    : rows[i][j];
            }

            records.push(record);
        }

        return records;
    }

    // ---------------------------------------------------------
    // Convert source-specific entries to common records.
    // ---------------------------------------------------------

    function normalizeCsvEntries(csv, source) {
        const entries = parseCsv(csv);
        const fields = source.fields || {};

        return entries.map(function (entry) {
            return {
                title: getFieldValue(entry, fields.title),
                summary: getFieldValue(entry, fields.summary),
                url: getFieldValue(entry, fields.url),
                timestamp: normalizeTimestamp(
                    getFieldValue(entry, fields.timestamp),
                    source.timeFormat
                )
            };
        });
    }

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
        
        if (rendererContainerID !== Uuid.NONE) {
            Entities.deleteEntity(rendererContainerID);
        }
        rendererContainerID = Entities.addEntity({
            "name": "Data Container",
            "type": "Empty",
            "parentID": entityID,
            "dimensions": emitterDimensions,
            "renderWithZones": renderWithZones,
            "lifetime": source.refreshSeconds * 2,
            "canCastShadow": false,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0}
        }, "local");
        
        
        const descriptors = source.descriptor || {};
        
        let properties, count, extraLine, breaks, height, currentTimestamp;
        let breakPoint = MAX_LINE_LENGTH + 1;
        let entityLevel = 0;

        for (let i = 0; i < records.length; i++) {

            const record = records[i];

            let cardText = "";

            const fields = ["title", "summary", "url", "timestamp"];

            for (let j = 0; j < fields.length; j++) {
                const field = fields[j];
                const value = record[field];

                // Skip missing values.
                if (value === null || value === undefined) {
                    continue;
                }

                // An explicitly empty descriptor hides the field.
                if (descriptors[field] === "") {
                    continue;
                }

                // Use the configured descriptor, or the default label.
                let label = descriptors[field];

                if (label === undefined || label === null) {
                    label = field.charAt(0).toUpperCase() +
                        field.slice(1) + ": ";
                }

                // Format timestamps for display.
                if (field === "timestamp") {
                    currentTimestamp = value;
                    if (config.rendering.showTimestamp) {
                        //cardText = cardText + "\n" + label + new Date(value).toISOString();
                        cardText = cardText + "\n" + label + getDtimeLocalFormat(value, TIME_UNIT);
                    }
                } else {
                    cardText = cardText + "\n" + label + value;
                }

            }
            
            const textLines = cardText.split("\n");
            let estimatedLineCount = 0;

            for (let k = 0; k < textLines.length; k++) {
                estimatedLineCount += Math.max(
                    1,
                    Math.ceil(textLines[k].length / (MAX_LINE_LENGTH * 1.5))
                );
            }

            let sensorScaleFactor = 1;
            let lineHeight = config.rendering.lineHeight;

            height = (
                (estimatedLineCount * lineHeight) +
                (2 * entityTopMargin)
            ) * HMD_UI_SCALE_FACTOR;

            
            if (config.rendering.oldStackUp) {
                entityLevel = entityLevel + (height/2);
            } else {
                entityLevel = entityLevel - (height/2);
            }
            
            let textColor = config.rendering.staticColor;
            if (config.rendering.colorMode === "hotToCold") {
                let colorTemp = hslToRgb((((i / records.length) * 240)+5)/360, 1, 0.5);
                textColor = { "red": colorTemp[0], "green": colorTemp[1], "blue": colorTemp[2]};
            } else if (config.rendering.colorMode === "whiteToHue") {
                let colorFromHue  = hslToRgb(config.rendering.hue/360, 1, 1 - ((i / records.length)/2));
                textColor = { "red": colorFromHue[0], "green": colorFromHue[1], "blue": colorFromHue[2]};
            } else if (config.rendering.colorMode === "weeklyHueCycle") {
                textColor = getWeeklyColor(currentTimestamp, TIME_UNIT);
            }
            
            let backColor =  { "red": 0, "green": 0, "blue": 0};
            
            properties = {
                "type": "Text",
                "parentID": rendererContainerID,
                "localPosition": {"x": 0, "y": entityLevel, "z": 0},
                "dimensions": {"x": (emitterDimensions.x * HMD_UI_SCALE_FACTOR), "y": height, "z": 0.01},
                "lineHeight": lineHeight * sensorScaleFactor,
                "textColor": textColor,
                "textAlpha": 0.85,
                "backgroundColor": backColor,
                "backgroundAlpha": 0.0,
                "leftMargin": entityLeftMargin * sensorScaleFactor,
                "topMargin": entityTopMargin * sensorScaleFactor,
                "unlit": true,
                "grab": { "grabbable": false },
                "text": cardText
            };
            let id = Entities.addEntity(properties, "local");

            //Set card image background here SOON
            let imageID = Entities.addEntity({
                "type": "Image",
                "parentID": id,
                "localPosition": {"x": 0, "y": 0, "z": 0.01},
                "name": "Entry Frame",
                "dimensions": {"x": (emitterDimensions.x * HMD_UI_SCALE_FACTOR), "y": height, "z": 0.01},
                "imageURL": config.rendering.frameImageUrl,
                "emissive": true,
                "keepAspectRatio": false,
                "color": textColor,
                "alpha": 0.5,
            }, "local");

            if (config.rendering.oldStackUp) {
                entityLevel = entityLevel + (height/2) + (HMD_INTER_SPACE_NOTIFICATION * HMD_UI_SCALE_FACTOR);
            } else {
                entityLevel = entityLevel - (height/2) - (HMD_INTER_SPACE_NOTIFICATION * HMD_UI_SCALE_FACTOR);
            }
        }

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
                } else if (source.format === "csv") {
                    records = normalizeCsvEntries(xhr.responseText, source);
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

        xhr.onload = function () {
            print("[DataFetcher] Ready state: " + xhr.readyState);
            print("[DataFetcher] HTTP status: " + xhr.status);
            print("[DataFetcher] Response length: " + xhr.responseText.length);
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
            xhr.open("GET", source.url, true);
            xhr.timeout = 20000;
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

        let properties = Entities.getEntityProperties(entityID, ["renderWithZones", "dimensions"]);
        emitterDimensions = properties.dimensions;
        renderWithZones = properties.renderWithZones;

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
        
        if (rendererContainerID !== Uuid.NONE) {
            Entities.deleteEntity(rendererContainerID);
            rendererContainerID = Uuid.NONE;
        }
    };

    function getDtimeLocalFormat(timestamp, timeDilation) {
        const DAY_DURATION = timeDilation * 3600;
        const WEEK_DURATION = DAY_DURATION * 9;
        const MONTH_DURATION = WEEK_DURATION * 4;
        const YEAR_DURATION = MONTH_DURATION * 10;

        const weekDaysNames = [
            "Virmonday",
            "Virtuesday",
            "Virwednesday",
            "Virthursday",
            "Virfriday",
            "Friturday",
            "Virsaturday",
            "Sameday",
            "Virsunday"
        ];

        const monthsNames = [
            "Primum",
            "Secundum",
            "Tertium",
            "Quartum",
            "Quintilis",
            "Sextilis",
            "September",
            "October",
            "November",
            "December"
        ];

        // Accept Unix timestamps in seconds or milliseconds.
        // Values below 100 billion are interpreted as seconds.
        let timestampMs = Number(timestamp);

        if (!isFinite(timestampMs)) {
            return "";
        }

        if (Math.abs(timestampMs) < 100000000000) {
            timestampMs *= 1000;
        }

        const secSince1970 = timestampMs / 1000;

        // Normalize negative timestamps to a positive cycle position.
        function getCycleValue(cycleLength, cycleDuration) {
            const position = ((secSince1970 % cycleDuration) +
                cycleDuration) % cycleDuration;

            return (position / cycleDuration) * cycleLength;
        }

        const dayOfWeek = weekDaysNames[
            Math.floor(getCycleValue(9, WEEK_DURATION))
        ];

        const year = Math.floor(secSince1970 / YEAR_DURATION) + 1;

        const monthIndex = Math.floor(
            getCycleValue(10, YEAR_DURATION)
        );

        const month = monthsNames[monthIndex];

        const dayOfMonth = 1 + Math.floor(
            getCycleValue(36, MONTH_DURATION)
        );

        const daySeconds = getCycleValue(86400, DAY_DURATION);
        const hours = Math.floor(daySeconds / 3600);
        const minutes = Math.floor(daySeconds / 60) % 60;

        const minuteText = minutes < 10 ? "0" + minutes : "" + minutes;
        const hourText = hours + ":" + minuteText;

        return dayOfWeek + ", " +
            dayOfMonth + " " + month + " " + year + ", " +
            hourText + " (D" + timeDilation + ")";
    }

    function getWeeklyColor(timestamp, timeDilation) {
        const DAY_DURATION = timeDilation * 3600;
        const WEEK_DURATION = DAY_DURATION * 9;
        
        const timestampSec = Number(timestamp) / 1000;
        let hue = ((timestampSec % WEEK_DURATION) / WEEK_DURATION);
        
        let color = hslToRgb(hue, 1, 0.5);
        return {"red": color[0], "green": color[1], "blue": color[2]};
    }


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
