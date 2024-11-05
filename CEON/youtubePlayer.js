//
//  youtubePlayer.js
//
//  Created by Alezia Kurdis, November 3rd, 2024.
//  Copyright 2024, Overte e.V.
//
//  Youtube video and sync button.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    print("YOUTUBE PLAYER STARTED!");
    var ROOT = Script.resolvePath('').split("youtubePlayer.js")[0];
    var thisEntity;
    var renderWithZones;
    var playlist = [];
/*
[
    {"day": "virmonday", "youtubeID": "0i-i00P9k8c", "duractionInSec": 4094},
    {"day": "virtuesday", "youtubeID": "0i-i00P9k8c", "duractionInSec": 4094},
    {"day": "virwednesday", "youtubeID": "0i-i00P9k8c", "duractionInSec": 4094},
    {"day": "virthurstday", "youtubeID": "0i-i00P9k8c", "duractionInSec": 4094},
    {"day": "virfriday", "youtubeID": "0i-i00P9k8c", "duractionInSec": 4094},
    {"day": "friturday", "youtubeID": "0i-i00P9k8c", "duractionInSec": 4094},
    {"day": "virsaturday", "youtubeID": "0i-i00P9k8c", "duractionInSec": 4094},
    {"day": "sameday", "youtubeID": "0i-i00P9k8c", "duractionInSec": 4094},
    {"day": "virsunday", "youtubeID": "0i-i00P9k8c", "duractionInSec": 4094}
]
*/

    var webID = Uuid.NONE;
    
    var MAX_CLICKABLE_DISTANCE_M = 9;
    
    function refreshWeb() {
        if (webID !== Uuid.NONE) {
            Entities.deleteEntity(webID);
            webID = Uuid.NONE;
        }
        webID = Entities.addEntity({
            "type": "Web",
            "name": "The Edge - Show Screen",
            "parentID": thisEntity,
            "localPosition": {"x": 0, "y": 0, "z": 0.01},
            "dimensions": {
                "x": 4.724425792694092,
                "y": 2.657489538192749,
                "z": 0.009999999776482582
            },
            "localRotation": Quat.IDENTITY,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "sourceUrl": computeUrl(),
            "dpi": 8,
            "maxFPS": 60
        }, "local");
    }
    
    function computeUrl() {
        var D29DAY = 104400;
        var D29WEEK = D29DAY * 9;
        var currentShow = playlist[Math.floor(GetCurrentCycleValue(9, D29WEEK))];
        var playedSecond = Math.floor(GetCurrentCycleValue(currentShow.duractionInSec, currentShow.duractionInSec));
        var url = "https://www.youtube.com/embed/" + currentShow.youtubeID + "?start=" + playedSecond;
        return url;
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

    function GetCurrentCycleValue(cyclelength, cycleduration) {
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}

    // Constructor
    var _this = null;

    function clickableUI() {
        _this = this;
        this.entityID = null;
    }

    // Entity methods
    clickableUI.prototype = {
        preload: function (id) {
            _this.entityID = id;
            HMD.displayModeChanged.connect(this.displayModeChangedCallback);
            thisEntity = id;
            var properties = Entities.getEntityProperties(id, ["renderWithZones", "userData"]);
            renderWithZones = properties.renderWithZones;
            playlist = JSON.parse(properties.userData);
            refreshWeb();
        },

        displayModeChangedCallback: function() {
            if (_this && _this.entityID) {
                //Nothing
            }
        },

        mousePressOnEntity: function (entityID, event) {
            if (event.isPrimaryButton && 
                Vec3.distance(MyAvatar.position, Entities.getEntityProperties(_this.entityID, ["position"]).position) <= MAX_CLICKABLE_DISTANCE_M) {
                    refreshWeb();
            }
        },

        unload: function () {
            HMD.displayModeChanged.disconnect(this.displayModeChangedCallback);
            if (webID !== Uuid.NONE) {
                Entities.deleteEntity(webID);
                webID = Uuid.NONE;
            }
        }
    };

    return new clickableUI();
})
