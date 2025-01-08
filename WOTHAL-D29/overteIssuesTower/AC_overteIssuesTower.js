//
//
//  AC_overteIssuesTower.js
//
//  Created by Alezia Kurdis on January 7th, 2025
//  Copyright 2025 Alezia Kurdis.
//
//  Server side manager for Overte Issues Tower (OIT).
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

print("OIT: start running.");
var jsMainFileName = "AC_overteIssuesTower.js";
var ROOT = Script.resolvePath('').split(jsMainFileName)[0];

var ORIGIN_POSITION = { "x": -4000, "y": 4000, "z": -4000};

var updateTimerInterval = 1200000; //20minutes.
var processTimer = 0;

const owner = "overte-org";
const repo = "overte";

var labels = [];
var data = [];

function myTimer(deltaTime) {
    var today = new Date();
    if ((today.getTime() - processTimer) > updateTimerInterval ) {

        getGitHubIssues(1, owner, repo);

        today = new Date();
        processTimer = today.getTime();
    }
}

    function getGitHubIssues(page, owner, repo) {
        const url = "https://api.github.com/repos/" + owner + "/" + repo + "/issues?per_page=100&page=" + page + "&sort=updated&state=open&r=" + Math.floor(Math.random() * 65000);
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Accept", "application/vnd.github.v3+json");

        // Handle the response
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) {
                var pageData = JSON.parse(xhr.responseText);
                data = data.concat(pageData);
                if(pageData.length > 0) {
                    getGitHubIssues(page + 1, owner, repo);
                } else {
                    processData();
                }
            } else {
                print("OIT: Error: " + xhr.status + " - " + xhr.statusText);
            }
        };

        xhr.onerror = function () {
            print("OIT: Request failed");
        };

        xhr.send();
    }

    function processData() {
        var tiles = [];
        var i;
        for (i = 0; i < data.length; i++) {
            if (data[i].pull_request === undefined) {
                var label = getLabelDataFrom(data[i].labels);
                var record = {
                    "title": data[i].title,
                    "body": data[i].body,
                    "number": data[i].number,
                    "htmlUrl": data[i].html_url,
                    "creationDate": dateToTimestamp(data[i].created_at),
                    "updateDate": dateToTimestamp(data[i].updated_at),
                    "labels": label.value,
                    "hueLabels": label.hue,
                    "creator": data[i].user.login
                };
                tiles.push(record);
            }
        }
        //generateTower(tiles);
        print("OIT: " + JSON.stringify(tiles));
    }
    
    function dateToTimestamp(dateString) {
        let date = new Date(dateString);
        return date.getTime();
    }
    
    function getLabelDataFrom(arOfLabels) {
        if (arOfLabels.length > 0) {
            var j;
            var value = "";
            var hue = -1;
            for (j = 0; j < arOfLabels.length; j++) {
                if (j === 0) {
                    value = arOfLabels[j].name;
                    hue = getHueFromHex(arOfLabels[j].color);
                } else {
                    value = value + ", " + arOfLabels[j].name;
                    hue = -1;
                }
            }
            return {"value": value, "hue": hue};
        } else {
            return {"value": "", "hue": -1};
        }
        
    }
    
    function getHueFromHex(hexColor) {
        hexColor = hexColor.replace(/^#/, '');
        const r = parseInt(hexColor.substring(0, 2), 16) / 255;
        const g = parseInt(hexColor.substring(2, 4), 16) / 255;
        const b = parseInt(hexColor.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        
        let hue = 0;

        if (delta !== 0) {
            if (max === r) {
                hue = ((g - b) / delta) % 6;
            } else if (max === g) {
                hue = (b - r) / delta + 2;
            } else {
                hue = (r - g) / delta + 4;
            }
        }

        hue = Math.round(hue * 60);
        if (hue < 0) {
            hue += 360;
        }

        return hue;
    }


    /*
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   {number}  h       The hue
     * @param   {number}  s       The saturation
     * @param   {number}  l       The lightness
     * @return  {Array}           The RGB representation
     */
    function hslToRgb(h, s, l){
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }


// ################## CYLCE AND TIME FUNCTIONS ###########################
function GetCurrentCycleValue(cyclelength, cycleduration){
    var today = new Date();
    var TodaySec = today.getTime()/1000;
    var CurrentSec = TodaySec%cycleduration;
    
    return (CurrentSec/cycleduration)*cyclelength;
    
}
// ################## END CYLCE AND TIME FUNCTIONS ###########################

getGitHubIssues(1, owner, repo);
Script.update.connect(myTimer);

Script.scriptEnding.connect(function () {
    //DELETIONS HERE
    Script.update.disconnect(myTimer);
});

