//
//  energyPit.js
//
//  Created by Alezia Kurdis, July 1st, 2026.
//  Copyright 2026, Overte e.V.
//
//  Return fallen avatars for the OXARA energy pit.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 

    const ROOT = Script.resolvePath('').split("energyPit.js")[0];
    let lightID = Uuid.NONE;
    let lightTopID = Uuid.NONE;
    let materialID = Uuid.NONE;
    
    const DAY_DURATION = 68400; //D19


    let returnPosition;
    let returnRotation;

    this.preload = function(entityID) {
        returnPosition = MyAvatar.position;
        returnRotation = MyAvatar.orientation;
        let properties = Entities.getEntityProperties(entityID, ["renderWithZones", "description"]);
        let renderWithZones = properties.renderWithZones;

        let hue = GetCurrentCycleValue(1, DAY_DURATION * 9);
        let color = hslToRgb(hue, 1, 0.55);
        let lightColor = hslToRgb(hue, 1, 0.65);
        
        if (properties.description === "OTHYN") {
            lightTopID = Entities.addEntity({
                "parentID": entityID,
                "renderWithZones": renderWithZones,
                "localPosition": {"x": 0.0, "y": 75.0, "z": 0.0},
                "name": "Energy Pit Light OTHYN",
                "grab": {
                    "grabbable": false
                },
                "type": "Light",
                "dimensions": {
                    "x": 70,
                    "y": 70,
                    "z": 70
                },
                "color": {"red": lightColor[0], "green": lightColor[1], "blue": lightColor[2]},
                "intensity": 15,
                "falloffRadius": 2,
                "isSpotlight": false
            },"local");
        }

        lightID = Entities.addEntity({
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": 0.0, "y": 10.0, "z": 0.0},
            "name": "Energy Pit Light",
            "grab": {
                "grabbable": false
            },
            "type": "Light",
            "dimensions": {
                "x": 70,
                "y": 70,
                "z": 70
            },
            "color": {"red": lightColor[0], "green": lightColor[1], "blue": lightColor[2]},
            "intensity": 25,
            "falloffRadius": 3,
            "isSpotlight": false
        },"local");

        let sumColorCompnent = (color[0]/255) +(color[1]/255) +(color[2]/255);
        if (sumColorCompnent === 0) { 
            sumColorCompnent = 0.001; 
        }
        let bloomFactor = 6 / sumColorCompnent;

        let materialContent = {
            "materialVersion": 1,
            "materials": [
                    {
                        "name": "LIGHT",
                        "albedo": [1, 1, 1],
                        "metallic": 0.001,
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
            "localPosition": {"x": 0.0, "y": 60.0, "z": 0.0},
            "name": "Energy Pit Material",
            "materialURL": "materialData",
            //"parentMaterialName": "[0]",
            "priority": 2,
            "materialData": JSON.stringify(materialContent)
        },"local");

    };
    
    this.unload = function(entityID) {
        if (lightID !== Uuid.NONE) {
            Entities.deleteEntity(lightID);
            lightID = Uuid.NONE;
        }
        if (lightTopID !== Uuid.NONE) {
            Entities.deleteEntity(lightTopID);
            lightTopID = Uuid.NONE;
        }
        if (materialID !== Uuid.NONE) {
            Entities.deleteEntity(materialID);
            materialID = Uuid.NONE;
        }
    };


    this.enterEntity = function(entityID) {
        MyAvatar.position = returnPosition;
        MyAvatar.orientation = returnRotation;
    }

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
