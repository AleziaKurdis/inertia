//
//  lampion.js
//
//  Created by Alezia Kurdis, July 18th, 2026.
//  Copyright 2026, Overte e.V.
//
//  lampion light.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 

    //const ROOT = Script.resolvePath('').split("lampion.js")[0];
    let lightID = Uuid.NONE;
    let hue;
    let thisEntityID;
    let renderWithZones;
    let intervalID = null;
    
    const DAY_DURATION = 68400; //D19

    function getCurrentHour() {
        return (GetCurrentCycleValue(8640000, DAY_DURATION)/100) / 3600;
    }

    this.preload = function(entityID) {
        thisEntityID = entityID;
        let properties = Entities.getEntityProperties(entityID, ["renderWithZones", "description"]);
        renderWithZones = properties.renderWithZones;
        let hueDeg = 12;
        let demandedHue = parseInt(properties.description, 10);
        if (!isNaN(demandedHue) && demandedHue >= 0 && demandedHue <= 360) {
            hueDeg = demandedHue;
        }
        hue = hueDeg/360;
        
        setLight();
        
        if (intervalID !== null) {
            Script.clearInterval(intervalID);
            intervalID = null;
        }
        
        intervalID = Script.setInterval(function () {
            setLight();
        }, 180000);//3 minutes
    };
    
    function setLight() {
        let color = hslToRgb(hue, 1, 0.5);
        
        const hour = getCurrentHour();
        if (hour > 18 || hour <= 6) {
            if (lightID === Uuid.NONE) {
                lightID = Entities.addEntity({
                    "parentID": thisEntityID,
                    "renderWithZones": renderWithZones,
                    "localPosition": {"x": 0.0, "y": 0.06, "z": 0.0},
                    "name": "Lampion Light",
                    "grab": {
                        "grabbable": false
                    },
                    "type": "Light",
                    "dimensions": {
                        "x": 5,
                        "y": 5,
                        "z": 5
                    },
                    "color": {"red": color[0], "green": color[1], "blue": color[2]},
                    "intensity": 3,
                    "falloffRadius": 0.5,
                    "isSpotlight": false
                },"local");
            }
        } else {
            if (lightID !== Uuid.NONE) {
                Entities.deleteEntity(lightID);
                lightID = Uuid.NONE;
            }
        }
    }
    
    this.unload = function(entityID) {
        if (intervalID !== null) {
            Script.clearInterval(intervalID);
            intervalID = null;
        }
        
        if (lightID !== Uuid.NONE) {
            Entities.deleteEntity(lightID);
            lightID = Uuid.NONE;
        }
    };

    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
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
    function hslToRgb(h, s, l) {
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




})
