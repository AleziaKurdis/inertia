"use strict";
//
//  singularitySanctuary.js
//
//  Created by Alezia Kurdis, August 29th, 2023.
//  Copyright 2023, Overte e.V.
//
//  Generate a singularity for SANCTUARY.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("singularitySanctuary.js")[0];
    var thisEntity;

    var UPDATE_TIMER_INTERVAL = 5000; // 5 sec 
    var processTimer = 0;

    var starId = Uuid.NULL;
    var fireMatId = Uuid.NULL;
    var fireLightId = Uuid.NULL;
    var fireParticles = Uuid.NULL;
    var solarZoneId = Uuid.NULL;
    
    var singularityGeneratorPosition;
    
    var renderWithZones;
    
    var D29_DAY_DURATION = 104400; //sec
    var STAR_DIAMETER = 400; //m
    var STAR_LIGHT_DIAMETER_MULTIPLICATOR = 20; //X time the diameter of the star.
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    
    var currentSunPosition = {"x": 0, "y": 0, "z": 0};
    var nextSunPosition;
    
    this.preload = function(entityID) { 
        thisEntity = entityID;
        var prop = Entities.getEntityProperties(entityID, ["renderWithZones", "position"]);
        renderWithZones = prop.renderWithZones;
        singularityGeneratorPosition = prop.position;
        var sunCumputedValues = getCurrentSunPosition();
        currentSunPosition = sunCumputedValues.localPosition;
        nextSunPosition = currentSunPosition;
        var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
        var sunColor = hslToRgb(hue, 1, 0.6);
        solarZoneId = Entities.addEntity({
            "name": "SUNLIGHT_(!)_Z0N3",
            "dimensions": {"x": 3800, "y": 3800, "z": 3800},
            "type": "Zone",
            "keyLightMode": "enabled",
            "keyLight": {
                "color": {"red": sunColor[0], "green": sunColor[1], "blue": sunColor[2]},
                "intensity": 2.6,
                "direction": Vec3.fromPolar( sunCumputedValues.elevation, sunCumputedValues.azimuth),
                "castShadows": true,
                "shadowBias": 0.02,
                "shadowMaxDistance": 100
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
                "damping": 0
        }, "local");
        
        var RATIO_Z = 0.24;
        
        var sizeMultiplicator = 4;
        var betlOneId = Entities.addEntity({
            "name": "BELT-01",
            "parentID": starId,
            "dimensions": {"x": STAR_DIAMETER * sizeMultiplicator, "y": STAR_DIAMETER * RATIO_Z * sizeMultiplicator, "z": STAR_DIAMETER * sizeMultiplicator},
            "localPosition": {"x": 0, "y": 0, "z": 0},
            "type": "Model",
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularDamping": 0,
            "angularVelocity": {
                "x":0,
                "y":0.6,
                "z":0
            },
            "modelURL": ROOT + "models/BELT01.fbx",
            "useOriginalPivot": true
        }, "local");

        sizeMultiplicator = 6;
        var betlOneId = Entities.addEntity({
            "name": "BELT-02",
            "parentID": starId,
            "dimensions": {"x": STAR_DIAMETER * sizeMultiplicator, "y": STAR_DIAMETER * RATIO_Z * sizeMultiplicator, "z": STAR_DIAMETER * sizeMultiplicator},
            "localPosition": {"x": 0, "y": 0, "z": 0},
            "type": "Model",
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularDamping": 0,
            "angularVelocity": {
                "x":0,
                "y":0.3,
                "z":0
            },
            "modelURL": ROOT + "models/BELT01.fbx",
            "useOriginalPivot": true
        }, "local");

        sizeMultiplicator = 9;
        var betlOneId = Entities.addEntity({
            "name": "BELT-03",
            "parentID": starId,
            "dimensions": {"x": STAR_DIAMETER * sizeMultiplicator, "y": STAR_DIAMETER * RATIO_Z * sizeMultiplicator, "z": STAR_DIAMETER * sizeMultiplicator},
            "localPosition": {"x": 0, "y": 0, "z": 0},
            "type": "Model",
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularDamping": 0,
            "angularVelocity": {
                "x":0,
                "y":0.2,
                "z":0
            },
            "modelURL": ROOT + "models/BELT01.fbx",
            "useOriginalPivot": true
        }, "local");

        sizeMultiplicator = 12;
        var betlOneId = Entities.addEntity({
            "name": "BELT-04",
            "parentID": starId,
            "dimensions": {"x": STAR_DIAMETER * sizeMultiplicator, "y": STAR_DIAMETER * RATIO_Z * sizeMultiplicator, "z": STAR_DIAMETER * sizeMultiplicator},
            "localPosition": {"x": 0, "y": 0, "z": 0},
            "type": "Model",
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularDamping": 0,
            "angularVelocity": {
                "x":0,
                "y":0.1,
                "z":0
            },
            "modelURL": ROOT + "models/BELT01.fbx",
            "useOriginalPivot": true
        }, "local");

        sizeMultiplicator = 20;
        var betlOneId = Entities.addEntity({
            "name": "BELT-05",
            "parentID": starId,
            "dimensions": {"x": STAR_DIAMETER * sizeMultiplicator, "y": STAR_DIAMETER * RATIO_Z * sizeMultiplicator, "z": STAR_DIAMETER * sizeMultiplicator},
            "localPosition": {"x": 0, "y": 0, "z": 0},
            "type": "Model",
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularDamping": 0,
            "angularVelocity": {
                "x":0,
                "y":0.03,
                "z":0
            },
            "modelURL": ROOT + "models/BELT01.fbx",
            "useOriginalPivot": true
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

    function moveStar() {
        if (starId !== Uuid.NULL) {
            currentSunPosition = nextSunPosition;
            var sunCumputedValues = getCurrentSunPosition();
            nextSunPosition = sunCumputedValues.localPosition;
            var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
            var sunColor = hslToRgb(hue, 1, 0.6);
            var velocity = Vec3.subtract(nextSunPosition, currentSunPosition);
            Entities.editEntity(starId, {"localPosition": currentSunPosition, "localVelocity": velocity});
            Entities.editEntity(starId, {
                "keyLight": {
                    "color": {"red": sunColor[0], "green": sunColor[1], "blue": sunColor[2]},
                    "direction": Vec3.fromPolar( sunCumputedValues.elevation, sunCumputedValues.azimuth)
                }
            });
        }
    }

    function getCurrentSunPosition() {
        var distanceFactor = Math.abs(Math.sin(GetCurrentCycleValue((2* Math.PI), D29_DAY_DURATION * 36))); //un tour par mois
        var elevation = (0.38 * Math.PI) - ((Math.PI/4) * Math.sin(GetCurrentCycleValue((2* Math.PI), D29_DAY_DURATION)));
        var azimuth = GetCurrentCycleValue((2* Math.PI), D29_DAY_DURATION *  9); //un tour par semaine
        var localPosition = Vec3.multiplyQbyV(Quat.fromVec3Radians({"x": elevation,"y": azimuth, "z": 0}), {"x": 0,"y": 0, "z": -1500 - (1000 * distanceFactor)});
        print("local Position!!!!::: " + JSON.stringify(localPosition));
        return { 
                    "elevation" : elevation,
                    "azimuth" : azimuth,
                    "localPosition": localPosition
                };
    }

    function updateStar() {
        if (starId !== Uuid.NULL) {
            
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
            
            if (fireMatId === Uuid.NULL) {
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
            

            if (fireLightId === Uuid.NULL) {
                //CREATE
                fireLightId = Entities.addEntity({
                    "type": "Light",
                    "name": "STAR-LIGHT",
                    "dimensions": {
                        "x": 1500,
                        "y": 1500,
                        "z": 1500
                    },
                    "localPosition": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "renderWithZones": renderWithZones,
                    "parentID": starId,
                    "grab": {
                        "grabbable": false
                    },
                    "color": {
                        "red": fireColor[0],
                        "green": fireColor[1],
                        "blue": fireColor[2]
                    },
                    "isSpotlight": false,
                    "intensity": 15,
                    "exponent": 1,
                    "cutoff": 75,
                    "falloffRadius": STAR_DIAMETER * 2                
                }, "local");
            } else {
                //UPDATE
                Entities.editEntity(fireLightId, {
                    "color": {
                        "red": fireColor[0],
                        "green": fireColor[1],
                        "blue": fireColor[2]
                    }                    
                });
            } 
            if (fireParticles === Uuid.NULL) {
                //CREATE
                fireParticles = Entities.addEntity({
                    "type": "ParticleEffect",
                    "name": "STAR_PARTICLE",
                    "dimensions": {
                        "x": STAR_DIAMETER * 2,
                        "y": STAR_DIAMETER * 2,
                        "z": STAR_DIAMETER * 2
                    },
                    "rotation": Quat.IDENTITY,
                    "localPosition": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "renderWithZones": renderWithZones,
                    "parentID": starId,
                    "grab": {
                        "grabbable": false
                    },
                    "shapeType": "ellipsoid",
                    "color": {
                        "red": fireColor[0],
                        "green": fireColor[1],
                        "blue": fireColor[2]
                    },
                    "alpha": 0.10000000149011612,
                    "textures": ROOT + "images/pitParticle.png",
                    "maxParticles": 2250,
                    "lifespan": 9,
                    "emitRate": 250,
                    "emitSpeed": 0,
                    "speedSpread": 0.1 * STAR_DIAMETER,
                    "emitOrientation": {
                        "x": -0.0000152587890625,
                        "y": -0.0000152587890625,
                        "z": -0.0000152587890625,
                        "w": 1
                    },
                    "emitDimensions": {
                        "x": 0.9 * STAR_DIAMETER,
                        "y": 0.9 * STAR_DIAMETER,
                        "z": 0.9 * STAR_DIAMETER,
                    },
                    "emitRadiusStart": 1,
                    "polarFinish": 3.1415927410125732,
                    "emitAcceleration": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "accelerationSpread": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "particleRadius": 0.4 * STAR_DIAMETER,
                    "radiusSpread": 0.1 * STAR_DIAMETER,
                    "radiusStart": 0.1 * STAR_DIAMETER,
                    "radiusFinish": 0.6 * STAR_DIAMETER,
                    "colorStart": {
                        "red": fireColorStart[0],
                        "green": fireColorStart[1],
                        "blue": fireColorStart[2]
                    },
                    "colorFinish": {
                        "red": fireColorFinish[0],
                        "green": fireColorFinish[1],
                        "blue": fireColorFinish[2]
                    },
                    "colorSpread": {
                        "red": Math.floor(pitch * 15.9),
                        "green": Math.floor(pitch * 15.9),
                        "blue": Math.floor(pitch * 15.9)
                    },                
                    "alphaSpread": 0.10000000149011612,
                    "alphaStart": 0.5,
                    "alphaFinish": 0,
                    "emitterShouldTrail": false,
                    "rotateWithEntity": true,
                    "spinSpread": 1.5700000524520874,
                    "spinStart": 0,
                    "particleSpin": 1,
                    "spinFinish": 2,
                    "angularDamping": 0,
                    "angularVelocity": {
                        "x":0,
                        "y":0.5,
                        "z":0
                    }                    
                }, "local");
            } else {
                //UPDATE
                Entities.editEntity(fireParticles, {
                    "color": {
                        "red": fireColor[0],
                        "green": fireColor[1],
                        "blue": fireColor[2]
                    },
                    "colorStart": {
                        "red": fireColorStart[0],
                        "green": fireColorStart[1],
                        "blue": fireColorStart[2]
                    },
                    "colorSpread": {
                        "red": Math.floor(pitch * 15.9),
                        "green": Math.floor(pitch * 15.9),
                        "blue": Math.floor(pitch * 15.9)
                    },                 
                    "colorFinish": {
                        "red": fireColorFinish[0],
                        "green": fireColorFinish[1],
                        "blue": fireColorFinish[2]
                    }                
                });
            } 
        }
    }


    this.unload = function(entityID) {
        if (starId !== Uuid.NULL) {
            Entities.deleteEntity(starId);
        }
        if (solarZoneId !== Uuid.NULL) {
            Entities.deleteEntity(solarZoneId);
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
