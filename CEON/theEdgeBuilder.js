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
    var D29_DAY_DURATION = 104400;
    var UPDATE_TIMER_INTERVAL = 5000; // 5 sec 
    var processTimer = 0;
    
    var lightMatID = Uuid.NULL;
    var light2MatID = Uuid.NULL;
    var danceFloorFogID = Uuid.NULL;
    var barFogID = Uuid.NULL;
    var danceFloorLightID = Uuid.NULL;
    var barLight1ID = Uuid.NULL;
    var barLight2ID = Uuid.NULL;
    
    this.preload = function(entityID) {
        thisEntity = entityID;
        var properties = Entities.getEntityProperties(entityID, ["renderWithZones"]);
        renderWithZones = properties.renderWithZones;

        manageLightMaterial(thisEntity, renderWithZones);
        manageLight2Material(thisEntity, renderWithZones);
        manageDanceFloorFog(thisEntity, renderWithZones);

        var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer); 
    }

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {

            manageLightMaterial(thisEntity, renderWithZones);
            manageLight2Material(thisEntity, renderWithZones);
            manageDanceFloorFog(thisEntity, renderWithZones);
            
            today = new Date();
            processTimer = today.getTime();
        }  
    }
    
    function manageDanceFloorFog(id, rwz) {
        var hue = GetCurrentCycleValue(1, D29_DAY_DURATION / 48); //30 minutes (D29) cycle
        var color = hslToRgb(hue, 1, 0.5);
        var lightMatColor = hslToRgb(hue, 1, 0.7);
        
        if (danceFloorFogID === Uuid.NULL) {
            danceFloorFogID = Entities.addEntity({
                "type": "ParticleEffect",
                "localPosition": {"x":-35.023,"y":-4.936,"z":-56.0},
                "parentID": id,
                "renderWithZones": rwz,
                "name": "DANCE FLOOR FOG",
                "dimensions": {
                    "x": 8.199999809265137,
                    "y": 8.199999809265137,
                    "z": 8.199999809265137
                },
                "grab": {
                    "grabbable": false
                },
                "shapeType": "ellipsoid",
                "color": {
                    "red": lightMatColor[0],
                    "green": lightMatColor[1],
                    "blue": lightMatColor[2]
                },
                "alpha": 0.014999999664723873,
                "textures": ROOT + "images/fog.png",
                "maxParticles": 600,
                "emitRate": 120,
                "emitSpeed": 0,
                "lifespan": 3.0,
                "speedSpread": 0,
                "emitOrientation": {
                    "x": 0,
                    "y": 0,
                    "z": 0,
                    "w": 1
                },
                "emitDimensions": {
                    "x": 3,
                    "y": 0,
                    "z": 3
                },
                "emitRadiusStart": 0,
                "polarFinish": 3.1415927410125732,
                "emitAcceleration": {
                    "x": 0,
                    "y": -0.10999999940395355,
                    "z": 0
                },
                "accelerationSpread": {
                    "x": 0,
                    "y": 0.10000000149011612,
                    "z": 0
                },
                "particleRadius": 2,
                "radiusSpread": 0.6000000238418579,
                "radiusStart": 1,
                "radiusFinish": 2,
                "colorStart": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                },
                "colorFinish": {
                    "red": 255,
                    "green": 255,
                    "blue": 255
                },
                "alphaSpread": 0.02,
                "alphaStart": 0.019999999552965164,
                "alphaFinish": 0,
                "emitterShouldTrail": true,
                "spinSpread": 0.699999988079071,
                "spinStart": 0,
                "spinFinish": 0
            }, "local");
            
            danceFloorLightID = Entities.addEntity({
                "type": "Light",
                "localPosition": {"x":-35.023,"y":-4.936,"z":-56.0},
                "parentID": id,
                "renderWithZones": rwz,
                "name": "EDGE DANCE FLOOR LIGHT",
                "dimensions": {
                    "x": 6.633143901824951,
                    "y": 6.633143901824951,
                    "z": 8.658954620361328
                },
                "rotation": {
                    "x": 0.7071068286895752,
                    "y": 0,
                    "z": 0,
                    "w": -0.7071068286895752
                },
                "grab": {
                    "grabbable": false
                },
                "color": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                },
                "isSpotlight": true,
                "intensity": 20,
                "exponent": 1,
                "cutoff": 50,
                "falloffRadius": 3
            }, "local");
        } else {
            Entities.editEntity(danceFloorFogID, {
                "color": {
                    "red": lightMatColor[0],
                    "green": lightMatColor[1],
                    "blue": lightMatColor[2]
                },
                "colorStart": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                }
            });
            
            Entities.editEntity(danceFloorLightID, {
                "color": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                }
            });
        }
        
        if (barFogID === Uuid.NULL) {
            barFogID = Entities.addEntity({
                "type": "ParticleEffect",
                "localPosition": {"x":-30.3672,"y":-4.936,"z":-58.9753},
                "parentID": id,
                "renderWithZones": rwz,
                "name": "DANCE FLOOR FOG",
                "dimensions": {
                    "x": 8.199999809265137,
                    "y": 8.199999809265137,
                    "z": 8.199999809265137
                },
                "grab": {
                    "grabbable": false
                },
                "shapeType": "ellipsoid",
                "color": {
                    "red": lightMatColor[0],
                    "green": lightMatColor[1],
                    "blue": lightMatColor[2]
                },
                "alpha": 0.014999999664723873,
                "textures": ROOT + "images/fog.png",
                "maxParticles": 600,
                "emitRate": 120,
                "emitSpeed": 0,
                "lifespan": 3.0,
                "speedSpread": 0,
                "emitOrientation": {
                    "x": 0,
                    "y": 0,
                    "z": 0,
                    "w": 1
                },
                "emitDimensions": {
                    "x": 0.8,
                    "y": 0,
                    "z": 3
                },
                "emitRadiusStart": 0,
                "polarFinish": 3.1415927410125732,
                "emitAcceleration": {
                    "x": 0,
                    "y": -0.10999999940395355,
                    "z": 0
                },
                "accelerationSpread": {
                    "x": 0,
                    "y": 0.10000000149011612,
                    "z": 0
                },
                "particleRadius": 2,
                "radiusSpread": 0.6000000238418579,
                "radiusStart": 1,
                "radiusFinish": 2,
                "colorStart": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                },
                "colorFinish": {
                    "red": 255,
                    "green": 255,
                    "blue": 255
                },
                "alphaSpread": 0.02,
                "alphaStart": 0.019999999552965164,
                "alphaFinish": 0,
                "emitterShouldTrail": true,
                "spinSpread": 0.699999988079071,
                "spinStart": 0,
                "spinFinish": 0
            }, "local");
            
            barLight1ID = Entities.addEntity({
                "type": "Light",
                "localPosition": {"x":-31.069,"y":-6.118,"z":-59.235},
                "parentID": id,
                "renderWithZones": rwz,
                "name": "EDGE BAR LIGHT 1",
                "dimensions": {
                    "x": 4.34384822845459,
                    "y": 4.34384822845459,
                    "z": 6.143128871917725
                },
                "rotation": {
                    "x": 0.7071068286895752,
                    "y": 0,
                    "z": 0,
                    "w": -0.7071068286895752
                },
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
                "cutoff": 45,
                "falloffRadius": 1.5
            }, "local");
            
            barLight2ID = Entities.addEntity({
                "type": "Light",
                "localPosition": {"x":-31.069,"y":-6.118,"z":-57.313},
                "parentID": id,
                "renderWithZones": rwz,
                "name": "EDGE BAR LIGHT 1",
                "dimensions": {
                    "x": 4.34384822845459,
                    "y": 4.34384822845459,
                    "z": 6.143128871917725
                },
                "rotation": {
                    "x": 0.7071068286895752,
                    "y": 0,
                    "z": 0,
                    "w": -0.7071068286895752
                },
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
                "cutoff": 45,
                "falloffRadius": 1.5
            }, "local");
        } else {
            Entities.editEntity(barFogID, {
                "color": {
                    "red": lightMatColor[0],
                    "green": lightMatColor[1],
                    "blue": lightMatColor[2]
                },
                "colorStart": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                }
            });
            
            Entities.editEntity(barLight1ID, {
                "color": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                }
            });
            Entities.editEntity(barLight2ID, {
                "color": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                }
            });
        }
    }
    
    function manageLightMaterial(id, rwz) {
        var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
        var color = hslToRgb(hue, 1, 0.5);
        var lightMatColor = hslToRgb(hue, 1, 0.61);
        var bloomFactor = 3;
        
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
        
        if (lightMatID === Uuid.NULL) {
            lightMatID = Entities.addEntity({
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
        } else {
            Entities.editEntity(lightMatID, {"materialData": JSON.stringify(materialContent)});
        }
    }

    function manageLight2Material(id, rwz) {
        var hue = GetCurrentCycleValue(1, D29_DAY_DURATION / 48); //30 minutes (D29) cycle
        var color = hslToRgb(hue, 1, 0.5);
        var lightMatColor = hslToRgb(hue, 1, 0.61);
        var bloomFactor = 3;
        
        var materialContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "LIGHT2",
                    "albedo": [1, 1, 1],
                    "metallic": 0.001,
                    "roughness": 1,
                    "emissive": [(lightMatColor[0]/255) * bloomFactor, (lightMatColor[1]/255) * bloomFactor, (lightMatColor[2]/255) * bloomFactor],
                    "cullFaceMode": "CULL_NONE",
                    "model": "hifi_pbr"
                }
            ]
        };
        
        if (light2MatID === Uuid.NULL) {
            light2MatID = Entities.addEntity({
                "type": "Material",
                "parentID": id,
                "renderWithZones": rwz,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "name": "EdgeBar-Mobilier-Light2",
                "materialURL": "materialData",
                "priority": 3,
                "parentMaterialName": "mat::LIGHT2",
                "materialData": JSON.stringify(materialContent)
            }, "local");
        } else {
            Entities.editEntity(light2MatID, {"materialData": JSON.stringify(materialContent)});
        }
    }

    
    this.unload = function(entityID) {
        if (lightMatID !== Uuid.NULL) {
            Entities.deleteEntity(lightMatID);
            lightMatID = Uuid.NULL;
        }
        if (light2MatID !== Uuid.NULL) {
            Entities.deleteEntity(light2MatID);
            light2MatID = Uuid.NULL;
        }
        
        if (danceFloorFogID !== Uuid.NULL) {
            Entities.deleteEntity(danceFloorFogID);
            danceFloorFogID = Uuid.NULL;
        }
        
        if (barFogID !== Uuid.NULL) {
            Entities.deleteEntity(barFogID);
            barFogID = Uuid.NULL;
        }

        if (danceFloorLightID !== Uuid.NULL) {
            Entities.deleteEntity(danceFloorLightID);
            danceFloorLightID = Uuid.NULL;
        }

        if (barLight1ID !== Uuid.NULL) {
            Entities.deleteEntity(barLight1ID);
            barLight1ID = Uuid.NULL;
        }
        
        if (barLight2ID !== Uuid.NULL) {
            Entities.deleteEntity(barLight2ID);
            barLight2ID = Uuid.NULL;
        }
      
        Script.update.disconnect(myTimer);
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

    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}


})
