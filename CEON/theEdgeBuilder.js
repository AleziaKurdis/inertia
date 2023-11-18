//
//  theEdgeBuilder.js
//
//  Created by Alezia Kurdis,November 17th, 2023.
//  Copyright 2023, Overte e.V.
//
//  Generate non physical content for The Edge Bar in Ceon.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var ROOT = Script.resolvePath('').split("theEdgeBuilder.js")[0];
    var thisEntity;
    var renderWithZones;
    var entitiesToBeDeleted = [];
    var D29_DAY_DURATION = 104400;
    
    this.preload = function(entityID) {
        thisEntity = entityID;
        var properties = Entities.getEntityProperties(entityID, ["renderWithZones"]);
        renderWithZones = properties.renderWithZones;
        
        //Material LIGHT
        var id = addLightMaterial(entityID, renderWithZones);
        print("ID: " + id);
        entitiesToBeDeleted.push(id);
        
        //Material LIGHT2
        //Particle dance fog
        //Bar dance fog
        //lights???
    }

    function addLightMaterial(id, rwz) {
        var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
        var color = hslToRgb(hue, 1, 0.5);
        var lightMatColor = hslToRgb(hue, 1, 0.61);
        var bloomFactor = 4;
        
        var materialContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "LIGHT",
                    "albedo": [1, 1, 1],
                    "metallic": 0.001,
                    "roughness": 1,
                    "emissive": [(lightMatColor[0]/255) * bloomFactor, (lightMatColor[1]/255) * bloomFactor, (lightMatColor[2]/255) * bloomFactor],
                    "cullFaceMode": "CULL_NONE",
                    "model": "hifi_pbr"
                }
            ]
        };
        var matId = Entities.addEntity({
            "type": "Material",
            "parentID": id,
            "renderWithZones": rwz,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "name": "EdgeBar-Mobilier-Light",
            "materialURL": "materialData",
            "priority": 3,
            "parentMaterialName": "mat::LIGHT",
            "materialData": JSON.stringify(materialContent)
        }, "local");
        return matId;
    }


    
    this.unload = function(entityID) {
        if (entitiesToBeDeleted.lenght !== 0) {
            var i;
            for (i = 0; i < entitiesToBeDeleted.lenght; i++ ) {
                    Entities.deleteEntity(entitiesToBeDeleted[i]);
                }
                entitiesToBeDeleted = [];
            }
        }
    }
    
    // ################## CYLCE AND TIME FUNCTIONS ###########################
    function GetCurrentCycleValue(timestamp, cyclelength, cycleduration){
		var TodaySec = timestamp/1000;
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

})
