//
//  outpost.js
//
//  Created by Alezia Kurdis, August 2nd, 2025.
//  Copyright 2025, Overte e.V.
//
//  Generate light FX and glowing material for the Astrobion's outpost.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("outpost.js")[0];
    var thisEntity;
    var renderWithZones;

    var D29_DAY_DURATION = 104400; //sec
    var entitiesToDelete = [];
    
    this.preload = function(entityID) { 
        thisEntity = entityID;
        
        renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;

        //determine color and generate stuff
        
        var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
        var antihue = hue - 0.5;
        if (antihue < 0) {
            antihue = antihue + 1;
        }
        var fireColor = hslToRgb(antihue, 1, 0.5);
        var plasmaColor = hslToRgb(antihue, 1, 0.61);
        var bloomFactor = 4;
        
        var materialContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "GLOW",
                    "albedo": [1, 1, 1],
                    "metallic": 1,
                    "roughness": 1,
                    "emissive": [(plasmaColor[0]/255) * bloomFactor, (plasmaColor[1]/255) * bloomFactor, (plasmaColor[2]/255) * bloomFactor],
                    "cullFaceMode": "CULL_NONE",
                    "model": "hifi_pbr"
                }
            ]
        };
        
        var fireMatId = Entities.addEntity({
            "type": "Material",
            "parentID": thisEntity,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": 0.0, "y": 1, "z": 0.0},
            "name": "glow-material",
            "materialURL": "materialData",
            "parentMaterialName": "mat::GLOW",
            "priority": 2,
            "materialData": JSON.stringify(materialContent),
            "lifetime": 864000
        }, "local");
        
        entitiesToDelete.push(fireMatId);
        
        
    }


    this.unload = function(entityID) {
        var i;
        for (i = 0; i < entitiesToDelete.length; i++) {
            Entities.deleteEntity(entitiesToDelete[i]);
        }
        entitiesToDelete = [];
    };

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

    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}

})
