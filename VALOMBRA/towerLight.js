//
//  towerLight.js
//
//  Created by Alezia Kurdis, December 31st, 2025.
//  Copyright 2025, Overte e.V.
//
//  Light Tower script.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    const ROOT = Script.resolvePath('').split("towerLight.js")[0];
    let lightID = Uuid.NONE;
    
    const DAY_DURATION = 104400; //D29
    
    this.preload = function(entityID) {
        let properties = Entities.getEntityProperties(entityID, ["renderWithZones"]);
        let renderWithZones = properties.renderWithZones;

        let hue = GetCurrentCycleValue(1, DAY_DURATION * 9);
        let color = hslToRgb(hue, 1, 0.5);

        let currentHour = GetCurrentCycleValue(24, DAY_DURATION);
        if (currentHour > 20 || currentHour < 6) {
            let remainingTime = getRemainingTime(currentHour);
            lightID = Entities.addEntity({
                "parentID": entityID,
                "renderWithZones": renderWithZones,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "name": "lightPole Light",
                "grab": {
                    "grabbable": false
                },
                "type": "Light",
                "dimensions": {
                    "x": 40,
                    "y": 40,
                    "z": 40
                },
                "color": {"red": color[0], "green": color[1], "blue": color[2]},
                "intensity": 25,
                "falloffRadius": 4,
                "isSpotlight": false,
                "lifetime": remainingTime
            },"local");
            /*
            let particleID = Entities.addEntity({
                "type": "ParticleEffect",
                "parentID": lightID,
                "renderWithZones": renderWithZones,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "name": "TOWER LIGHT FX",
                "lifetime": remainingTime,
                "isEmitting": true,
                
            },"local");
            */
        }
    };    
    
    function getRemainingTime(currentHour) {
        if (currentHour > 20) {
            return (6.0 + 24.0 - currentHour) * 3600;
        } else if (currentHour < 6) {
            return (6.0 - currentHour) * 3600;
        } else {
            return 0;
        }
    }
    
    this.unload = function(entityID) {
        if (lightID !== Uuid.NONE) {
            print("HMM!");
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