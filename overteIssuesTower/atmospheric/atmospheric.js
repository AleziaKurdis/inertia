"use strict";
//
//  atmospheric.js
//
//  Created by Alezia Kurdis, January 26th, 2025.
//  Copyright 2025 Overte e.V.
//
//  Generate an atmosphere.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    var ROOT = Script.resolvePath('').split("atmospheric.js")[0];
    var atmosBuildingdModelUrl = ROOT + "atmos_Building_Wothal-B.fbx";
    var atmosAirSoundUrl = ROOT + "air.mp3";
    var airSound;
    var airSoundInjector = Uuid.NONE;
    var AIR_SOUND_VOLUME = 0.3;
    var atmosSkyUrl = ROOT + "sky.jpg";
    var thisEntity = Uuid.NONE;
    var positionZero;
    var toDelete = [];

    
    this.preload = function(entityID) {

        thisEntity = entityID;
        
        airSound = SoundCache.getSound(atmosAirSoundUrl);
        
        var properties = Entities.getEntityProperties(entityID, ["position"]);
        positionZero = properties.position;
        
        generateSky();
        
        if (airSound.downloaded) {
            playAirSound();
        } else {
            airSound.ready.connect(onSoundReady);
        }

    };

    function onSoundReady() {
        airSound.ready.disconnect(onSoundReady);
        playAirSound();
    }
    
    function playAirSound() {
        airSoundInjector = Audio.playSound(airSound, {
            "loop": true,
            "localOnly": true,
            "volume": AIR_SOUND_VOLUME
        });
    }

    function generateSky() {
        var d = new Date();
        var n = d.getTime();
        var D29_DAY = 104400000;
        var sunOrientation = GetCurrentCycleValue(Math.PI * 2, D29_DAY);
        var colorSky, colorAmbient;
        if (sunOrientation < Math.PI/2 || sunOrientation > (3 * Math.PI)/2 ) {
            if (sunOrientation < Math.PI/2) {
                colorSky = hslToRgb(0.618, 1.0, sunOrientation/(Math.PI/2));
                colorAmbient = hslToRgb(0.618, 0.1, sunOrientation/(Math.PI/2));
            } else {
                colorSky = hslToRgb(0.618, 1.0, ((Math.PI * 2) - sunOrientation)/(Math.PI/2));
                colorAmbient = hslToRgb(0.618, 0.1, ((Math.PI * 2) - sunOrientation)/(Math.PI/2));
            }
            colorSky = hslToRgb(0.618, 1.0, 0.5 + (Math.sin(sunOrientation)/2));
            colorAmbient = hslToRgb(0.618, 0.1, 0.5 + (Math.sin(sunOrientation)/2));
        } else {
            colorSky = hslToRgb(0.618, 1.0, 1.0);
            colorAmbient = hslToRgb(0.618, 1.0, 1.0);
        }

        var skyZoneId = Entities.addEntity({
            "type": "Zone",
            "name": "SKY",
            "locked": true,
            "dimensions": {
                "x": 10000,
                "y": 2000,
                "z": 10000
            },
            "grab": {
                "grabbable": false
            },
            "shapeType": "box",
            "keyLight": {
                "color": {
                    "red": 255,
                    "green": 244,
                    "blue": 199
                },
                "intensity": 3,
                "direction": {
                    "x": 0.0013233129866421223,
                    "y": -0.5563610196113586,
                    "z": -0.8309397101402283
                },
                "castShadows": true,
                "shadowBias": 0.02,
                "shadowMaxDistance": 60
            },
            "ambientLight": {
                "ambientIntensity": 0.6,
                "ambientURL": atmosSkyUrl,
                "ambientColor": {
                    "red": colorAmbient[0],
                    "green": colorAmbient[1],
                    "blue": colorAmbient[2]
                }
            },
            "skybox": {
                "color": {
                    "red": colorSky[0],
                    "green": colorSky[1],
                    "blue": colorSky[2]
                },
                "url": atmosSkyUrl
            },
            "haze": {
                "hazeRange": 1000,
                "hazeColor": {
                    "red": 227,
                    "green": 187,
                    "blue": 138
                },
                "hazeGlareColor": {
                    "red": 255,
                    "green": 202,
                    "blue": 87
                },
                "hazeEnableGlare": true,
                "hazeGlareAngle": 30,
                "hazeAltitudeEffect": true,
                "hazeCeiling": positionZero.y - 30,
                "hazeBaseRef": positionZero.y - 250
            },
            "bloom": {
                "bloomIntensity": 0.5
            },
            "keyLightMode": "enabled",
            "ambientLightMode": "enabled",
            "skyboxMode": "enabled",
            "hazeMode": "enabled",
            "bloomMode": "enabled",
            "position": positionZero,
            "rotation": Quat.fromVec3Radians( {"x": 0.0, "y": sunOrientation, "z": 0.0} )
        }, "local");
        toDelete.push(skyZoneId);
        
        //Buildings
        var nbrBuidling = Math.floor(Math.random() * 17) + 3;
        for (i=0; i < nbrBuidling; i++) {
            
            var buildingRotation = Quat.fromVec3Radians( {"x": 0.0, "y": (Math.random() * 2 * Math.PI), "z": 0.0} );
            
            var distance = Math.floor(Math.random() * 8000) + 600;
            var directionRad = Math.random() * 2 * Math.PI;
            var relativeBuidlingPosition = {"x": distance * Math.cos(directionRad), "y": (Math.floor(Math.random() * 600) - 350), "z": distance * Math.sin(directionRad)};
            var buildingPosition = Vec3.sum(positionZero, relativeBuidlingPosition);
            
            var buildingId = Entities.addEntity({
                    "type": "Model",
                    "locked": true,
                    "name": "BUIDING-" + i,
                    "dimensions": {
                        "x": 328.3628845214844,
                        "y": 1978.876220703125,
                        "z": 313.246826171875
                    },
                    "grab": {
                        "grabbable": false
                    },
                    "shapeType": "static-mesh",
                    "modelURL": atmosBuildingdModelUrl,
                    "position": buildingPosition,
                    "rotation": buildingRotation,
                    "useOriginalPivot": true
                }, "local");
            toDelete.push(buildingId);
            
            
        }
        
    }

    this.unload = function(entityID) {
        if (airSoundInjector !== Uuid.NONE) {
            airSoundInjector.stop();
        }
        
        
        var i;
        for (i = 0; i < toDelete.length; i++) {
            Entities.deleteEntity(toDelete[i]);
        }
        toDelete = [];
    };  

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
