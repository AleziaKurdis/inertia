"use strict";
//
//  singularityInnerWorld.js
//
//  Created by Alezia Kurdis, March 21st 2023.
//  Copyright 2023, Overte e.V.
//
//  Generate a singularity for an inner planetary world.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("singularityInnerWorld.js")[0];
    var thisEntity;

    var UPDATE_TIMER_INTERVAL = 1000; // 1 sec 
    var processTimer = 0;

    var starId = Uuid.NULL;
    var fireMatId = Uuid.NULL;
    var fireLightId = Uuid.NULL;
    var fireParticles = Uuid.NULL;
    
    var renderWithZones;
    
    var HYTRION_DAY_DURATION = 68400; //sec
    var STAR_DIAMETER = 152; //m
    var STAR_LIGHT_DIAMETER = 980; //m

    this.preload = function(entityID) { 
        thisEntity = entityID;
        renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;

        starId = Entities.addEntity({
                "name": "STAR",
                "parentID": thisEntity,
                "dimensions": {"x": STAR_DIAMETER, "y": STAR_DIAMETER, "z": STAR_DIAMETER},
                "localPosition": {"x": 0, "y": 0, "z": 0},
                "type": "Shape",
                "shape": "Sphere",
                "color": {"red": 255, "green": 255, "blue": 255},
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

        sizeMultiplicator = 5;
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

        updateStar();
        
        var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer); 
    }

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {

            updateStar();
            
            today = new Date();
            processTimer = today.getTime();
        }  
    }   

    function updateStar() {
        if (starId !== Uuid.NULL) {
            
            var pitch = Math.sin(GetCurrentCycleValue((2 * Math.PI), (3600 * 5))); //5 h cycle
            if (pitch === 0) {pitch = 0.001;}
            
            var hue = GetCurrentCycleValue(1, HYTRION_DAY_DURATION);
            var fireColor = hslToRgb(hue, 1, 0.5);
            var lightColor = hslToRgb(hue, 1, 0.8);
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
                        "x": STAR_LIGHT_DIAMETER,
                        "y": STAR_LIGHT_DIAMETER,
                        "z": STAR_LIGHT_DIAMETER
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
                        "red": lightColor[0],
                        "green": lightColor[1],
                        "blue": lightColor[2]
                    },
                    "isSpotlight": false,
                    "intensity": 60,
                    "exponent": 1,
                    "cutoff": 75,
                    "falloffRadius": 4
                }, "local");
            } else {
                //UPDATE
                Entities.editEntity(fireLightId, {
                    "color": {
                        "red": lightColor[0],
                        "green": lightColor[1],
                        "blue": lightColor[2]
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
