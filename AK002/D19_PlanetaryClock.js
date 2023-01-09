"use strict";
//
//  D19_PlanetaryClock.js
//
//  Created by Alezia Kurdis, January 7th 2023.
//  Copyright 2023, Overte e.V.
//
//  Generate a D19 (HUT) Planetary clock.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("D19_PlanetaryClock.js")[0];
    var thisEntity;
    
    var UPDATE_TIMER_INTERVAL = 1000; // 1 sec 
    var processTimer = 0;

    var fireMatId = Uuid.NULL;
    var fireLightId = Uuid.NULL;
    var fireParticles = Uuid.NULL;
    
    var renderWithZones;
    
    var HYTRION_DAY_DURATION = 68400; //sec
    var STAR_DIAMATER = 100; //m
    var DISTANCE_RATIO = 6;
    var DIAMETER_RATIO = 2;
    var TROPIC = 20; //degree
    
    var planets = [
        {
            "name": "Star Year", 
            "duration": 360 * HYTRION_DAY_DURATION,
            "id": Uuid.NULL
        },
        {
            "name": "Planet Month", 
            "duration": 36 * HYTRION_DAY_DURATION,
            "id": Uuid.NULL 
        },
        {
            "name": "Planet Week", 
            "duration": 9 * HYTRION_DAY_DURATION,
            "id": Uuid.NULL 
        },
        {
            "name": "Planet Day", 
            "duration": 9 * HYTRION_DAY_DURATION,
            "id": Uuid.NULL 
        },
        {
            "name": "Planet Hour", 
            "duration": HYTRION_DAY_DURATION / 24,
            "id": Uuid.NULL
        },
        {
            "name": "Planet Minute", 
            "duration": HYTRION_DAY_DURATION / 24 * 60,
            "id": Uuid.NULL
        },
        {
            "name": "Planet Second", 
            "duration": HYTRION_DAY_DURATION / 24 * 3600,
            "id": Uuid.NULL
        }      
    ];

    
    this.preload = function(entityID) { 
        thisEntity = entityID;
        renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;
        
        for (var i = 0; i < planets.length; i++) {
            var parentID;
            var rotation = GetCurrentCycleValue(360, planets[i].duration);
            var inclinaison;
            if (i === 0) {
                parentID = entityID;
                planets[i].diameter = STAR_DIAMATER;
                planets[i].localPosition = {"x": 0, "y": 0, "z": 0};
                inclinaison = Math.cos(rotation * Math.PI/180) * TROPIC;
            } else {
                parentID = planets[i - 1].id;
                planets[i].diameter = planets[i - 1].diameter / DIAMETER_RATIO; 
                planets[i].localPosition = {"x": 0, "y": 0, "z": -planets[i].diameter * DISTANCE_RATIO};
                inclinaison = Math.cos(GetCurrentCycleValue(2 * Math.PI, planets[i - 1].duration)) * TROPIC;
            }
            planets[i].id = Entities.addEntity({
                "name": planets[i].name,
                "parentID": parentID,
                "dimensions": {"x": planets[i].diameter, "y": planets[i].diameter, "z": planets[i].diameter},
                "localPosition": planets[i].localPosition,
                "type": "Shape",
                "shape": "Sphere",
                "color": {"red": 128, "green": 128, "blue": 128},
                "renderWithZones": renderWithZones,
                "localRotation": Quat.fromVec3Degrees({"x": inclinaison, "y": rotation, "z": 0}),
                "angularDamping": 0,
                "angularVelocity": {"x": 0, "y": 0, "z": 0}
            }, "local");
        }

        updateStar();
        
        var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer); 
    }

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            
            for (var i = 0; i < planets.length; i++) {
                if (planets[i].id !== Uuid.NULL) {
                    var rotation = GetCurrentCycleValue(360, planets[i].duration);
                    var inclinaison;
                    if (i === 0) {
                        inclinaison = Math.cos(rotation * Math.PI/180) * TROPIC;
                    } else {
                        inclinaison = Math.cos(GetCurrentCycleValue(2 * Math.PI, planets[i - 1].duration)) * TROPIC;
                    }                    
                    Entities.editEntity(planets[i].id, {
                        "localRotation": Quat.fromVec3Degrees({"x": inclinaison, "y": rotation, "z": 0}),
                    });
                }
            }

            updateStar();

            today = new Date();
            processTimer = today.getTime();
        }  
    }   


    function updateStar() {
        if (planets[0].id !== Uuid.NULL) {
            var hue = GetCurrentCycleValue(1, HYTRION_DAY_DURATION);
            var fireColor = hslToRgb(hue, 1, 0.5);
            var plasmaColor = hslToRgb(hue, 1, 0.61);
            var fireColorStart = hslToRgb(hue, 1, 0.9);
            var fireColorFinish = hslToRgb(hue, 1, 0.15);
            var bloomFactor = 6;
            
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
                    "parentID": planets[0].id,
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
                    "name": "FIRE LIGHT",
                    "dimensions": {
                        "x": 4.288541316986084,
                        "y": 4.288541316986084,
                        "z": 4.288541316986084
                    },
                    "localRotation": {"x":-0.000030517578125,"y":-0.000030517578125,"z":-0.000030517578125,"w":1},
                    "localPosition": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "renderWithZones": renderWithZones,
                    "parentID": planets[0].id,
                    "grab": {
                        "grabbable": false
                    },
                    "color": {
                        "red": fireColor[0],
                        "green": fireColor[1],
                        "blue": fireColor[2]
                    },
                    "intensity": 8,
                    "exponent": 1,
                    "cutoff": 75,
                    "falloffRadius": 2                
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
                    "name": "PIT_PARTICLE",
                    "dimensions": {
                        "x": 3.7335205078125,
                        "y": 3.7335205078125,
                        "z": 3.7335205078125
                    },
                    "rotation": {
                        "x": -0.0000152587890625,
                        "y": -0.0000152587890625,
                        "z": -0.0000152587890625,
                        "w": 1
                    },
                    "localPosition": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "renderWithZones": renderWithZones,
                    "parentID": planets[0].id,
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
                    "maxParticles": 800,
                    "lifespan": 1.5,
                    "emitRate": 300,
                    "emitSpeed": 0,
                    "speedSpread": 0.20000000298023224,
                    "emitOrientation": {
                        "x": -0.0000152587890625,
                        "y": -0.0000152587890625,
                        "z": -0.0000152587890625,
                        "w": 1
                    },
                    "emitDimensions": {
                        "x": 0.75,
                        "y": 0.10000000149011612,
                        "z": 0.75
                    },
                    "polarFinish": 3.1415927410125732,
                    "emitAcceleration": {
                        "x": 0,
                        "y": 0.4000000059604645,
                        "z": 0
                    },
                    "accelerationSpread": {
                        "x": 0,
                        "y": 0.20000000298023224,
                        "z": 0
                    },
                    "particleRadius": 0.6000000238418579,
                    "radiusSpread": 0.20000000298023224,
                    "radiusStart": 0.20000000298023224,
                    "radiusFinish": 0.800000011920929,
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
                    "emitterShouldTrail": true,
                    "spinSpread": 1.5700000524520874,
                    "spinStart": null,
                    "spinFinish": null
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
        for (var i = 0; i < planets.length; i++) {
            if (planets[i].id !== Uuid.NULL) {
                Entities.deleteEntity(planets[i].id);
            }
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
