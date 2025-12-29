//
//  lightPole.js
//
//  Created by Alezia Kurdis, December 23th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Light Pole script.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    var ROOT = Script.resolvePath('').split("lightPole.js")[0];
    var lightID = Uuid.NONE;
    var materialID = Uuid.NONE;
    
    const DAY_DURATION = 104400; //D29
    
    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID, ["renderWithZones"]);
        var renderWithZones = properties.renderWithZones;

        var hue = GetCurrentCycleValue(1, DAY_DURATION * 9);
        var color = hslToRgb(hue, 1, 0.55);
        var lightColor = hslToRgb(hue, 1, 0.65);

        lightID = Entities.addEntity({
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": 0.0, "y": 3.65, "z": 0.0},
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
            "color": {"red": lightColor[0], "green": lightColor[1], "blue": lightColor[2]},
            "intensity": 15,
            "falloffRadius": 2,
            "isSpotlight": false
        },"local");

        var sumColorCompnent = (color[0]/255) +(color[1]/255) +(color[2]/255);
        if (sumColorCompnent === 0) { 
            sumColorCompnent = 0.001; 
        }
        var bloomFactor = 9 / sumColorCompnent;

        var materialContent = {
            "materialVersion": 1,
            "materials": [
                    {
                        "name": "LIGHT",
                        "albedo": [1, 1, 1],
                        "metallic": 1,
                        "roughness": 1,
                        "opacity": 1,
                        "emissive": [(color[0]/255) * bloomFactor, (color[1]/255) * bloomFactor, (color[2]/255) * bloomFactor],
                        "scattering": 0,
                        "unlit": false,
                        "cullFaceMode": "CULL_NONE",
                        "model": "hifi_pbr"
                    }
                ]
            };
        
        materialID = Entities.addEntity({
            "type": "Material",
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": 0.0, "y": 0.2, "z": 0.0},
            "name": "lightPole material",
            "materialURL": "materialData",
            "parentMaterialName": "[mat::LIGHT]",
            "priority": 2,
            "materialData": JSON.stringify(materialContent)
        },"local");
    };    

    this.unload = function(entityID) {
        print("AT LEAST!");
        if (lightID !== Uuid.NONE) {
            print("HMM!");
            Entities.deleteEntity(lightID);
            lightID = Uuid.NONE;
        }
        if (materialID !== Uuid.NONE) {
            Entities.deleteEntity(materialID);
            materialID = Uuid.NONE;
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


})();