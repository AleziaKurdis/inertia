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
        
        //Pit ligth
        var lightID = Entities.addEntity({
            "type": "Light",
            "parentID": thisEntity,
            "localPosition": {"x": 1.8408, "y": 1.1875, "z": 3.3052},
            "name": "OUTPUT PIT LIGHT",
            "dimensions": {
                "x": 7.475191116333008,
                "y": 7.475191116333008,
                "z": 7.475191116333008
            },
            "rotation": {
                "x": 0.7071068286895752,
                "y": 0,
                "z": 0,
                "w": 0.7071068286895752
            },
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "color": {
                "red": fireColor[0],
                "green": fireColor[1],
                "blue": fireColor[2]
            },
            "isSpotlight": true,
            "intensity": 9,
            "exponent": 1,
            "cutoff": 90,
            "falloffRadius": 3,
            "lifetime": 864000
        }, "local");
        
        entitiesToDelete.push(lightID);
        
        //Cabine Light
        lightID = Entities.addEntity({
            "type": "Light",
            "parentID": thisEntity,
            "localPosition": {"x": -1.3828, "y": 3.7031, "z": -1.1191},
            "name": "OUTPUT CABINE LIGHT",
            "dimensions": {
                "x": 8.0,
                "y": 8.0,
                "z": 8.0
            },
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "color": {
                "red": fireColor[0],
                "green": fireColor[1],
                "blue": fireColor[2]
            },
            "isSpotlight": false,
            "intensity": 9,
            "exponent": 1,
            "cutoff": 90,
            "falloffRadius": 2,
            "lifetime": 864000
        }, "local");
        
        entitiesToDelete.push(lightID);
        
        //pit particle
        var pitFxID = Entities.addEntity({
            "parentID": thisEntity,
            "localPosition": {"x": 1.8408, "y": 1.12, "z": 3.3052},
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "type": "ParticleEffect",
            "name": "PIT FX",
            "dimensions": {
                "x": 27.665000915527344,
                "y": 27.665000915527344,
                "z": 27.665000915527344
            },
            "shapeType": "ellipsoid",
            "color": {
                "red": plasmaColor[0],
                "green": plasmaColor[1],
                "blue": plasmaColor[2]
            },
            "textures": ROOT + "images/PARTICLE-GLOWBLOB.png",
            "maxParticles": 120,
            "lifespan": 15,
            "emitRate": 8,
            "emitSpeed": 0,
            "speedSpread": 0,
            "emitOrientation": {
                "x": 0,
                "y": 0,
                "z": 0,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.5,
                "y": 0,
                "z": 0.5
            },
            "emitRadiusStart": 0,
            "polarFinish": 3.1415927410125732,
            "emitAcceleration": {
                "x": 0,
                "y": 0.10000000149011612,
                "z": 0
            },
            "particleRadius": 0.10000000149011612,
            "radiusSpread": 0.07000000029802322,
            "radiusStart": 0.15000000596046448,
            "radiusFinish": 0.10000000149011612,
            "colorStart": {
                "red": 255,
                "green": 255,
                "blue": 255
            },
            "colorFinish": {
                "red": fireColor[0],
                "green": fireColor[1],
                "blue": fireColor[2]
            },
            "alphaStart": 1,
            "alphaFinish": 0,
            "emitterShouldTrail": true,
            "spinSpread": 3.140000104904175,
            "spinStart": -3.119999885559082,
            "spinFinish": 3.119999885559082,
            "lifetime": 864000
        }, "local");
        
        entitiesToDelete.push(pitFxID);
        
        //Seats ###########################################
        var seats = [
            {"localPosition": {"x": 0.0,"y": 0.0,"z": 0.0}, "localRotation": {"x":0,"y":-0.10452844202518463,"z":0,"w":0.994521975517273}},
            {"localPosition": {"x": 0.0,"y": 0.0,"z": 0.0}, "localRotation": {"x":0,"y":0.10452844202518463,"z":0,"w":0.994521975517273}},
            {"localPosition": {"x": 0.0,"y": 0.0,"z": 0.0}, "localRotation": {"x":0,"y":-0.10452844202518463,"z":0,"w":0.994521975517273}},
            {"localPosition": {"x": 0.0,"y": 0.0,"z": 0.0}, "localRotation": {"x":0,"y":0.10452844202518463,"z":0,"w":0.994521975517273}},
            {"localPosition": {"x": 0.0,"y": 0.0,"z": 0.0}, "localRotation": {"x":0,"y":-0.10452844202518463,"z":0,"w":0.994521975517273}}
        ];
        
        var t;
        for (t = 0; t < seats.length; t++ ) {
            entitiesToDelete.push(generateSeat(seats[t].localPosition, seats[t].localRotation));
        }
    }

    function generateSeat(localPosition, localRotation) {
        var id = Entities.addEntity({
            "type": "Shape",
            "shape": "Cube",
            "parentID": thisEntity,
            "name": "Outpost - Seat",
            "dimensions": {"x":0.3,"y":0.01,"z":0.3},
            "localPosition": localPosition,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "visible": false,
            "script": ROOT + "sit_spot.js",
            "lifetime": 864000
        }, "local");
        return id;
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
