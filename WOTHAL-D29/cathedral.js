//#####################
//
//  cathedral.js
//
//  Created by Alezia Kurdis, April 6th, 2023.
//  Copyright 2023, Overte e.V.
//
//  light and other stuff generated for teh Black Cathedral of Wothal.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("cathedral.js")[0];

    var centralLightID = Uuid.NULL;
    var thisEntity = Uuid.NULL;
    var renderWithZones;
    
    var UPDATE_TIMER_INTERVAL = 1000; // 1 sec 
    var processTimer = 0;
    
    var starId = Uuid.NULL;
    var poolAId = Uuid.NULL;
    var poolBId = Uuid.NULL;
    var fireMatId = Uuid.NULL;
    var poolAMatId = Uuid.NULL;
    var poolBMatId = Uuid.NULL;
    var poolALightId = Uuid.NULL;
    var poolBLightId = Uuid.NULL;    
    var fireLightId = Uuid.NULL;
    var fireParticles = Uuid.NULL;
    
    var STAR_DIAMETER = 12;
    var DAY_DURATION = 104400; //29h
    var WEEK_DURATION = DAY_DURATION * 9;
    
    this.preload = function(entityID) {
        thisEntity = entityID;
        var properties = Entities.getEntityProperties(thisEntity, ["renderWithZones"]);
        renderWithZones = properties.renderWithZones;
        
        centralLightID = Entities.addEntity({
            "parentID": thisEntity,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": 0, "y": 294.5840, "z": 0},
            "type": "Light",
            "name": "CATHEDRAL CENTRAL LIGHT",
            "localRotation": {"x":-0.7071488499641418,"y":-0.0000152587890625,"z":-0.0000152587890625,"w":0.7070878744125366},
            "dimensions": {
                "x": 70,
                "y": 70,
                "z": 241
            },
            "grab": {
                "grabbable": false
            },
            "collisionless": true,
            "ignoreForCollisions": true,
            "color": {
                "red": 255,
                "green": 121,
                "blue": 38
            },
            "isSpotlight": true,
            "intensity": 60,
            "exponent": 1,
            "cutoff": 17,
            "falloffRadius": 15
        }, "local");

        starId = Entities.addEntity({
                "name": "STAR",
                "parentID": thisEntity,
                "dimensions": {"x": STAR_DIAMETER, "y": STAR_DIAMETER/3, "z": STAR_DIAMETER},
                "localPosition": {"x": 0, "y": 177.5, "z": 0},
                "type": "Shape",
                "shape": "Sphere",
                "color": {"red": 128, "green": 128, "blue": 128},
                "renderWithZones": renderWithZones
        }, "local");

        poolAId = Entities.addEntity({
                "name": "POOL_A",
                "parentID": starId,
                "dimensions": {"x": 25, "y": 0.70, "z": 10},
                "localPosition": {"x": 0.7466, "y": -0.7788, "z": 14.8410},
                "type": "Shape",
                "shape": "Cylinder",
                "color": {"red": 128, "green": 128, "blue": 128},
                "renderWithZones": renderWithZones
        }, "local");

        poolBId = Entities.addEntity({
                "name": "POOL_A",
                "parentID": starId,
                "dimensions": {"x": 25, "y": 0.70, "z": 10},
                "localPosition": {"x": -1.1860, "y": -0.7788, "z": -16.923},
                "type": "Shape",
                "shape": "Cylinder",
                "color": {"red": 128, "green": 128, "blue": 128},
                "renderWithZones": renderWithZones
        }, "local");

        updateStar();

        var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer);
    };

    
    this.unload = function(entityID) {
        shutdown();
    };    

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
            
            var hue = GetCurrentCycleValue(1, WEEK_DURATION);
            hue = hue + 0.5;
            if (hue > 1) {
                hue = hue - 1;
            }
            var fireColor = hslToRgb(hue, 1, 0.5);
            var plasmaColor = hslToRgb(hue, 1, 0.61);
            var fireColorStart = hslToRgb(hue, 1, 0.9);
            var fireColorFinish = hslToRgb(hue, 1, 0.15);
            var bloomFactor = 3;
            
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

            if (poolAMatId === Uuid.NULL) {
                //CREATE
                poolAMatId = Entities.addEntity({
                    "type": "Material",
                    "parentID": poolAId,
                    "renderWithZones": renderWithZones,
                    "localPosition": {"x": 0.0, "y": 1, "z": 0.0},
                    "name": "plasma-material",
                    "materialURL": "materialData",
                    "priority": 1,
                    "materialData": JSON.stringify(materialContent)
                }, "local");
            } else {
                //UPDATE
                Entities.editEntity(poolAMatId, {
                    "materialData": JSON.stringify(materialContent)
                });
            }

            if (poolBMatId === Uuid.NULL) {
                //CREATE
                poolBMatId = Entities.addEntity({
                    "type": "Material",
                    "parentID": poolBId,
                    "renderWithZones": renderWithZones,
                    "localPosition": {"x": 0.0, "y": 1, "z": 0.0},
                    "name": "plasma-material",
                    "materialURL": "materialData",
                    "priority": 1,
                    "materialData": JSON.stringify(materialContent)
                }, "local");
            } else {
                //UPDATE
                Entities.editEntity(poolBMatId, {
                    "materialData": JSON.stringify(materialContent)
                });
            }

            if (fireLightId === Uuid.NULL) {
                //CREATE
                fireLightId = Entities.addEntity({
                    "type": "Light",
                    "name": "STAR-LIGHT",
                    "dimensions": {
                        "x": STAR_DIAMETER * 1.3,
                        "y": STAR_DIAMETER * 1.3,
                        "z": STAR_DIAMETER * 1.3
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
                        "x": STAR_DIAMETER,
                        "y": STAR_DIAMETER,
                        "z": STAR_DIAMETER
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
                    "speedSpread": 0.1,
                    "emitOrientation": {
                        "x": -0.0000152587890625,
                        "y": -0.0000152587890625,
                        "z": -0.0000152587890625,
                        "w": 1
                    },
                    "emitDimensions": {
                        "x": 0.7 * STAR_DIAMETER,
                        "y": (0.7 * STAR_DIAMETER)/3,
                        "z": 0.7 * STAR_DIAMETER,
                    },
                    "emitRadiusStart": 0.5,
                    "polarFinish": 3.1415927410125732,
                    "emitAcceleration": {
                        "x": 0,
                        "y": 0.1,
                        "z": 0
                    },
                    "accelerationSpread": {
                        "x": 0,
                        "y": 0.5,
                        "z": 0
                    },
                    "particleRadius": 0.2 * STAR_DIAMETER,
                    "radiusSpread": 0.05 * STAR_DIAMETER,
                    "radiusStart": 0.05 * STAR_DIAMETER,
                    "radiusFinish": 0.4 * STAR_DIAMETER,
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
                    "spinFinish": 2
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


    function shutdown() {
        Script.update.disconnect(myTimer);
        if (centralLightID != Uuid.NULL){
            Entities.deleteEntity(centralLightID);
            centralLightID = Uuid.NULL;
        }
        if (starId != Uuid.NULL){
            Entities.deleteEntity(starId);
            starId = Uuid.NULL;
        }
        
    }

    // ################## CYLCE AND TIME FUNCTIONS ###########################
    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}    
    // ################## END CYLCE AND TIME FUNCTIONS ###########################   

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
