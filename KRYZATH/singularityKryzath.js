"use strict";
//
//  singularityKryzath.js
//
//  Created by Alezia Kurdis, May 11th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Generate a singularity for KRYZATH.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("singularityKryzath.js")[0];
    var thisEntity;

    var UPDATE_TIMER_INTERVAL = 5000; // 5 sec 
    var processTimer = 0;

    var starId = Uuid.NONE;
    var fireMatId = Uuid.NONE;
    var solarZoneId = Uuid.NONE;
    
    var singularityGeneratorPosition;
    
    var renderWithZones;
    
    var matId = Uuid.NONE;
    var lightTableID = Uuid.NONE;
    
    var D29_DAY_DURATION = 104400; //sec
    var STAR_DIAMETER = 300; //m
    var STAR_LIGHT_DIAMETER_MULTIPLICATOR = 20; //X time the diameter of the star.
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    
    var currentSunPosition = {"x": 0, "y": 0, "z": 0};
    //var nextSunPosition;
    
    this.preload = function(entityID) { 
        thisEntity = entityID;
        var prop = Entities.getEntityProperties(entityID, ["renderWithZones", "position"]);
        renderWithZones = prop.renderWithZones;
        singularityGeneratorPosition = prop.position;
        
        var visibilityZoneId = Entities.findEntitiesByName( "KRYZATH_VISIBILITY_ZONE", singularityGeneratorPosition, 10);
        var superZoneDimensions = Entities.getEntityProperties(visibilityZoneId[0], ["dimensions"]).dimensions;
        
        var sunCumputedValues = getCurrentSunPosition();
        currentSunPosition = sunCumputedValues.localPosition;
        //nextSunPosition = currentSunPosition;
        var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
        var sunColor = hslToRgb(hue, 1, 0.6);
        solarZoneId = Entities.addEntity({
            "name": "SUNLIGHT_(!)_Z0N3",
            "dimensions": {"x": superZoneDimensions.x - 200, "y": superZoneDimensions.y - 200, "z": superZoneDimensions.z - 200},
            "type": "Zone",
            "keyLightMode": "enabled",
            "keyLight": {
                "color": {"red": sunColor[0], "green": sunColor[1], "blue": sunColor[2]},
                "intensity": 2.6,
                "direction": Vec3.fromPolar( sunCumputedValues.elevation, sunCumputedValues.azimuth),
                "castShadows": true,
                "shadowBias": 0.02,
                "shadowMaxDistance": 200
            },
            "position": singularityGeneratorPosition,
            "renderWithZones": renderWithZones,
        }, "local");
        
//        genMainAsteroidLightMaterial(thisEntity, renderWithZones);
        
        starId = Entities.addEntity({
                "name": "STAR",
                "parentID": thisEntity,
                "dimensions": {"x": STAR_DIAMETER, "y": STAR_DIAMETER, "z": STAR_DIAMETER},
                "localPosition": currentSunPosition,
                "type": "Shape",
                "shape": "Sphere",
                "color": {"red": 128, "green": 128, "blue": 128},
                "renderWithZones": renderWithZones,
                "damping": 0
        }, "local");

        updateStar();
        
        var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer); 
    }

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {

            updateStar();
            moveStar();
            
            today = new Date();
            processTimer = today.getTime();
        }  
    }   

    function moveStar() {// readd velocity
        if (starId !== Uuid.NONE) {
            var sunCumputedValues = getCurrentSunPosition();
            currentSunPosition = sunCumputedValues.localPosition;
            var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
            var sunColor = hslToRgb(hue, 1, 0.6);
            Entities.editEntity(starId, {"localPosition": currentSunPosition});
            Entities.editEntity(solarZoneId, {
                "keyLight": {
                    "color": {"red": sunColor[0], "green": sunColor[1], "blue": sunColor[2]},
                    "direction": Vec3.fromPolar( sunCumputedValues.elevation, sunCumputedValues.azimuth)
                }
            });
        }
    }

    function getCurrentSunPosition() {//elevation to adjust duration 400x sec
        //var elevation = (Math.PI/6) + ((Math.PI/3.75) * Math.sin(GetCurrentCycleValue((2* Math.PI), D29_DAY_DURATION * 12))); //un cycle par 12 jours (1/3 de mois) D29. +/- 60 deg.
        //var elevation = (Math.PI/6) + ((Math.PI/3.75) * Math.sin(GetCurrentCycleValue((2* Math.PI), 418.879))); //Matching the translation time.
        var elevation = (Math.PI/12) + ((Math.PI/4) * Math.sin(GetCurrentCycleValue((2* Math.PI), D29_DAY_DURATION * 3))); //un cycle de 3 jours
        var azimuth = GetCurrentCycleValue((2* Math.PI), D29_DAY_DURATION); //un tour par jour D29
        var localPosition = Vec3.multiplyQbyV(Quat.fromVec3Radians({"x": elevation,"y": azimuth, "z": 0}), {"x": 0,"y": 0, "z": -2000});
        return { 
                    "elevation" : elevation,
                    "azimuth" : azimuth,
                    "localPosition": localPosition
                };
    }

/*    function genMainAsteroidLightMaterial(id, rwz) {
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
                    "metallic": 1,
                    "roughness": 1,
                    "emissive": [(lightMatColor[0]/255) * bloomFactor, (lightMatColor[1]/255) * bloomFactor, (lightMatColor[2]/255) * bloomFactor],
                    "cullFaceMode": "CULL_NONE",
                    "model": "hifi_pbr"
                }
            ]
        };

        matId = Entities.addEntity({
            "type": "Material",
            "parentID": id,
            "renderWithZones": rwz,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "name": "plasma-material",
            "materialURL": "materialData",
            "priority": 3,
            "parentMaterialName": "mat::LIGHT",
            "materialData": JSON.stringify(materialContent)
        }, "local");
        
        lightTableID = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": -53.3345,
                "y": 4.5818,
                "z": -38.0559
            },
            "parentID": id,
            "name": "TABLE_LIGHT",
            "dimensions": {
                "x": 9,
                "y": 9,
                "z": 9
            },
            "rotation": {"x":0.7071068286895752,"y":0,"z":0,"w":0.7071068286895752},
            "renderWithZones": rwz,
            "grab": {
                "grabbable": false
            },
            "color": {
                "red": color[0],
                "green": color[1],
                "blue": color[2]
            },
            "isSpotlight": true,
            "intensity": 10,
            "exponent": 1,
            "cutoff": 90,
            "falloffRadius": 2
        }, "local");
    }
*/
    function updateStar() {
        if (starId !== Uuid.NONE) {
            
            var pitch = Math.sin(GetCurrentCycleValue((2 * Math.PI), (3600 * 5))); //5 h cycle
            if (pitch === 0) {pitch = 0.001;}
            
            var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);

            var fireColor = hslToRgb(hue, 1, 0.5);
            var plasmaColor = hslToRgb(hue, 1, 0.61);
            var fireColorStart = hslToRgb(hue, 1, 0.9);
            var fireColorFinish = hslToRgb(hue, 1, 0.15);
            var bloomFactor = 4;
            
            var materialContent = {
                "materialVersion": 1,
                "materials": [
                    {
                        "name": "plasma",
                        "albedo": [1, 1, 1],
                        "metallic": 1,
                        "roughness": 1,
                        "emissive": [(plasmaColor[0]/255) * bloomFactor, (plasmaColor[1]/255) * bloomFactor, (plasmaColor[2]/255) * bloomFactor],
                        "cullFaceMode": "CULL_NONE",
                        "model": "hifi_pbr"
                    }
                ]
            };
            
            if (fireMatId === Uuid.NONE) {
                //CREATE
                fireMatId = Entities.addEntity({
                    "type": "Material",
                    "parentID": starId,
                    "renderWithZones": renderWithZones,
                    "localPosition": {"x": 0.0, "y": 1, "z": 0.0},
                    "name": "plasma-material",
                    "materialURL": "materialData",
                    "priority": 1,
                    "materialData": JSON.stringify(materialContent)
                }, "local");
            } else {
                //UPDATE
                Entities.editEntity(fireMatId, {
                    "materialData": JSON.stringify(materialContent)
                });
            }
        }
    }


    this.unload = function(entityID) {
        if (starId !== Uuid.NONE) {
            Entities.deleteEntity(starId);
            starId = Uuid.NONE;
        }
        if (solarZoneId !== Uuid.NONE) {
            Entities.deleteEntity(solarZoneId);
            solarZoneId = Uuid.NONE;
        }
        
        if (matId !== Uuid.NONE) {
            Entities.deleteEntity(matId);
            matId = Uuid.NONE;
        }

        if (lightTableID !== Uuid.NONE) {
            Entities.deleteEntity(lightTableID);
            lightTableID = Uuid.NONE;
        }

        Script.update.disconnect(myTimer);
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
