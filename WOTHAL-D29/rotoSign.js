//
//  rotoSign.js
//
//  Created by Alezia Kurdis, October 11th, 2026.
//  Copyright 2025, Overte e.V.
//
//  Light Sign.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    const ROOT = Script.resolvePath('').split("rotoSign.js")[0];
    let materialID = Uuid.NONE;

    let renderWithZones;
    let colorSign;
    let signImageURL;
    
    const template = {
        "color": [1,1,1],
        "imageUrl": ""
    };
    
    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID, ["renderWithZones", "userdata"]);
        renderWithZones = properties.renderWithZones || [];
        if (properties.userdata === "") {
            Entities.editEntity(entityID,{"userdata": JSON.stringify(template)});
            
        }
        let data = JSON.parse(properties.userdata);
        colorSign = data.color || [1,1,1];
        signImageURL = data.imageUrl || "";

        let materialContent = {
            "materialVersion": 1,
            "materials": [
                    {
                        "name": "GALVRON",
                        "albedo": [colorSign[0], colorSign[1], colorSign[2]],
                        "albedoMap": signImageURL,
                        "metallic": 0.001,
                        "roughness": 0.5,
                        "opacityMap": signImageURL,
                        "opacityMapMode": "OPACITY_MAP_BLEND",
                        "unlit": true,
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
            "name": "holoSign material",
            "materialURL": "materialData",
            "parentMaterialName": "[mat::GALVRON]",
            "priority": 2,
            "materialData": JSON.stringify(materialContent)
        },"local");
    };    

    this.unload = function(entityID) {
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


})
