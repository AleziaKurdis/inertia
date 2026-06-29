//
//  singularityOxara.js
//
//  Created by Alezia Kurdis, May 15th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Generate a singularity for OXARA.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("singularityOxara.js")[0];
    var thisEntity;

    var UPDATE_TIMER_INTERVAL = 5000; // 5 sec 
    var processTimer = 0;

    var starId = Uuid.NONE;
    let compagnonStarId = Uuid.NONE;
    let moonId = Uuid.NONE;
    var fireMatId = Uuid.NONE;
    var solarZoneId = Uuid.NONE;
    
    var singularityGeneratorPosition;
    
    var renderWithZones;
    
    var matId = Uuid.NONE;
    var lightTableID = Uuid.NONE;
    
    var D19_DAY_DURATION = 68400; //sec
    var STAR_DIAMETER = 900; //m
    var MOON_DIAMETER = 200; //m
    var STAR_LIGHT_DIAMETER_MULTIPLICATOR = 20; //X time the diameter of the star.
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    
    var currentSunPosition = {"x": 0, "y": 0, "z": 0};
    let isNight = false;
    const HUE_SUN = 30/360;
    const HUE_MOON = 210/360;
    const OFFSET_SIX_D19_HOUR_BEFORE = 17100;
    
    this.preload = function(entityID) { 
        thisEntity = entityID;
        var prop = Entities.getEntityProperties(entityID, ["renderWithZones", "position"]);
        renderWithZones = prop.renderWithZones;
        singularityGeneratorPosition = prop.position;
        
        var visibilityZoneId = Entities.findEntitiesByName( "OXARA_VISIBILITY_ZONE", singularityGeneratorPosition, 10);
        var superZoneDimensions = Entities.getEntityProperties(visibilityZoneId[0], ["dimensions"]).dimensions;
        
        var sunCumputedValues = getCurrentSunPosition();
        currentSunPosition = sunCumputedValues.localPosition;

        let hue;
        let intensity;
        if (isNight) {
            hue = HUE_MOON;
            intensity = 0.4;
        } else {
            hue = HUE_SUN;
            intensity = 2.6;
        }
        var sunColor = hslToRgb(hue, 1, 0.6);
        solarZoneId = Entities.addEntity({
            "name": "SUNLIGHT_(!)_Z0N3",
            "dimensions": {"x": superZoneDimensions.x - 200, "y": superZoneDimensions.y - 200, "z": superZoneDimensions.z - 200},
            "type": "Zone",
            "keyLightMode": "enabled",
            "keyLight": {
                "color": {"red": sunColor[0], "green": sunColor[1], "blue": sunColor[2]},
                "intensity": intensity,
                "direction": Vec3.fromPolar( sunCumputedValues.elevation, sunCumputedValues.azimuth),
                "castShadows": true,
                "shadowBias": 0.02,
                "shadowMaxDistance": 200
            },
            "position": singularityGeneratorPosition,
            "renderWithZones": renderWithZones,
        }, "local");
        
        starId = Entities.addEntity({
                "name": "STAR",
                "parentID": thisEntity,
                "dimensions": {"x": STAR_DIAMETER, "y": STAR_DIAMETER, "z": STAR_DIAMETER},
                "localPosition": currentSunPosition,
                "type": "Shape",
                "shape": "Sphere",
                "color": {"red": 128, "green": 128, "blue": 128},
                "renderWithZones": renderWithZones,
                "damping": 0,
                "angularDamping": 0,
                "angularVelocity": {"x": 0.2, "y": 0.03, "z": 0.0},
                "visible": !isNight
        }, "local");

        compagnonStarId = Entities.addEntity({
                "name": "STAR B",
                "parentID": starId,
                "dimensions": {"x": STAR_DIAMETER*0.382, "y": STAR_DIAMETER*0.382, "z": STAR_DIAMETER*0.382},
                "localPosition": {"x": 0, "y": 0, "z": (-STAR_DIAMETER * 3)},
                "type": "Shape",
                "shape": "Sphere",
                "color": {"red": 128, "green": 128, "blue": 128},
                "renderWithZones": renderWithZones,
                "damping": 0,
                "visible": !isNight
        }, "local");
        
        var compagnonMatContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "plasma",
                    "albedo": [1, 1, 1],
                    "metallic": 0.01,
                    "roughness": 1,
                    "emissive": [2, 2, 3],
                    "cullFaceMode": "CULL_NONE",
                    "model": "hifi_pbr"
                }
            ]
        };

        var compagnonMatId = Entities.addEntity({
            "type": "Material",
            "parentID": compagnonStarId,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "name": "plasma-material",
            "materialURL": "materialData",
            "priority": 1,
            "materialData": JSON.stringify(compagnonMatContent)
        }, "local");

        moonId = Entities.addEntity({
                "name": "MOON",
                "parentID": thisEntity,
                "dimensions": {"x": MOON_DIAMETER, "y": MOON_DIAMETER, "z": MOON_DIAMETER},
                "localPosition": currentSunPosition,
                "type": "Shape",
                "shape": "Sphere",
                "color": {"red": 128, "green": 128, "blue": 128},
                "renderWithZones": renderWithZones,
                "damping": 0,
                "visible": !isNight
        }, "local");

        let moonMatContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "plasma",
                    "albedo": [1, 1, 1],
                    "metallic": 0.01,
                    "roughness": 1,
                    "emissive": [0, 1.9978, 3.98],
                    "cullFaceMode": "CULL_NONE",
                    "model": "hifi_pbr"
                }
            ]
        };

        let moonMatId = Entities.addEntity({
            "type": "Material",
            "parentID": moonId,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "name": "plasma-material",
            "materialURL": "materialData",
            "priority": 1,
            "materialData": JSON.stringify(moonMatContent)
        }, "local");

        let farlandID = Entities.addEntity({
                "name": "FARLAND",
                "parentID": thisEntity,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "type": "Model",
                "useOriginalPivot": true,
                "renderWithZones": renderWithZones,
                "damping": 0,
                "angularDamping": 0,
                "collisionless": true,
                "dimensions": {
                    "x": 17455.91015625,
                    "y": 428.9638977050781,
                    "z": 17455.53125
                },
                "grab": {
                    "grabbable": false
                },
                "ignoreForCollisions": true,
                "modelURL": ROOT + "models/FARLAND.fst"
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
            let sunCumputedValues = getCurrentSunPosition();
            currentSunPosition = sunCumputedValues.localPosition;
            Entities.editEntity(starId, {"localPosition": currentSunPosition, "visible": !isNight});
            Entities.editEntity(compagnonStarId, {"visible": !isNight});
            Entities.editEntity(moonId, {"localPosition": currentSunPosition, "visible": !isNight});
            
            let hue;
            let intensity;
            if (isNight) {
                hue = HUE_MOON;
                intensity = 0.4;
            } else {
                hue = HUE_SUN;
                intensity = 2.6;
            }
            let sunColor = hslToRgb(hue, 1, 0.6);
            Entities.editEntity(solarZoneId, {
                "keyLight": {
                    "color": {"red": sunColor[0], "green": sunColor[1], "blue": sunColor[2]},
                    "intensity": intensity,
                    "direction": Vec3.fromPolar( sunCumputedValues.elevation, sunCumputedValues.azimuth)
                }
            });
        }
    }

    function getCurrentSunPosition() {
        let coord = getSunCoordinates();
        let localPosition = Vec3.multiplyQbyV(Quat.fromVec3Radians({"x": coord.elevation,"y": coord.azimuth, "z": 0}), {"x": 0,"y": 0, "z": -8800});
        return { 
                    "elevation" : coord.elevation,
                    "azimuth" : coord.azimuth,
                    "localPosition": localPosition
                };
    }

    function getSunCoordinates() {
        let inclinationDeg = 30 * Math.sin(GetCurrentCycleValue((2* Math.PI), D19_DAY_DURATION * 36, OFFSET_SIX_D19_HOUR_BEFORE));
        let latitudeDeg = 0;
        let elapsedSeconds = GetCurrentCycleValue(43200, (D19_DAY_DURATION / 2), OFFSET_SIX_D19_HOUR_BEFORE);
        isNight = getIsNight();

        let t = elapsedSeconds / 43200;
        // Hour angle:
        // -90° = east horizon
        // 0° = highest point
        // +90° = west horizon
        let hourAngleDeg = (t * 180) - 90;

        // Convert to radians
        let H = hourAngleDeg * Math.PI / 180;
        let dec = inclinationDeg * Math.PI / 180;
        let lat = latitudeDeg * Math.PI / 180;

        // Elevation formula
        let sinAlt =
            Math.sin(dec) * Math.sin(lat) +
            Math.cos(dec) * Math.cos(lat) * Math.cos(H);

        let elevation = Math.asin(sinAlt);

        // Azimuth formula
        let y = -Math.sin(H);
        let x =
            Math.tan(dec) * Math.cos(lat) -
            Math.sin(lat) * Math.cos(H);

        let azimuth = Math.atan2(y, x);

        azimuth = (azimuth + (2 * Math.PI)) % (2 * Math.PI);

        return {
            "elevation": elevation,
            "azimuth": azimuth
        };
    }

    function getIsNight() {
        let dayOrNight = GetCurrentCycleValue(2, D19_DAY_DURATION, OFFSET_SIX_D19_HOUR_BEFORE);
        if (Math.floor(dayOrNight) === 0) { 
            return true;
        } else {
            return false;
        }
    }

    function updateStar() {
        if (starId !== Uuid.NONE) {
            
            var pitch = Math.sin(GetCurrentCycleValue((2 * Math.PI), (3600 * 5))); //5 h cycle
            if (pitch === 0) {pitch = 0.001;}
            
            var hue = HUE_SUN; //GetCurrentCycleValue(1, D19_DAY_DURATION * 9);
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

    function GetCurrentCycleValue(cyclelength, cycleduration, timeOffset = 0){
		var today = new Date();
		var TodaySec = (today.getTime()/1000) + timeOffset;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}


})
