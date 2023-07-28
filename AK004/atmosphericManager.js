//
//  atmosphericManager.js
//
//  Created by Alezia Kurdis on July 25th, 2023.
//  Copyright 2023, Overte e.V.
//
//  Manage all the atmospheric events for AK004 scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function () {
    var jsMainFileName = "atmosphericManager.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    var thisEntity;
    var renderWithZones;
    var HALF = 0.5;
    var DEGREES_TO_RADIANS = Math.PI / 180.0;
    var universeCenter;
    var universeDimensions;
    var updateTimerInterval = 2000; // 2 sec
    var cycleCount = 0;
    var MAX_COUNT = 4; //3 X 2sec = 8 sec.
    var processTimer = 0;
    var skyID = Uuid.NULL;

    var DAY_DURATION = 104400; //29h
    var WEEK_DURATION = DAY_DURATION * 9;
    var MONTH_DURATION = WEEK_DURATION * 4;
    var YEAR_DURATION = MONTH_DURATION * 10;
    var D29_HOUR_DURATION = DAY_DURATION/24;

    this.preload = function(entityID) {
        thisEntity = entityID;
        var prop = Entities.getEntityProperties(entityID, ["position", "dimensions", "renderWithZones"]);
        renderWithZones = prop.renderWithZones;
        universeCenter = prop.position;
        universeDimensions = prop.dimensions;

        manageSky();
        var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer);
    };

    this.unload = function(entityID) {
        Script.update.disconnect(myTimer);
        
        if (skyID !== Uuid.NULL) {
            Entities.deleteEntity(skyID);
            skyID = Uuid.NULL;
        }

    };

    function myTimer(deltaTime) {
        var today = new Date();
        var i;
        if ((today.getTime() - processTimer) > updateTimerInterval ) {
            var isPresent = positionIsInsideBox(universeCenter, Quat.IDENTITY, universeDimensions);
            if (isPresent) {
                cycleCount++;
                if (cycleCount > MAX_COUNT) {
                    manageSky();
                    cycleCount = 0;
                }
            } else {
                if (skyID !== Uuid.NULL) {
                    Entities.deleteEntity(skyID);
                    skyID = Uuid.NULL;
                }
            }
            
            today = new Date();
            processTimer = today.getTime();
        }
    }

    function manageSky() {
        var hue, saturation, lightness, lighColor, intensity, skyTint;
        var today = new Date();
        var hour = GetCurrentCycleValue(today.getTime(), 24, DAY_DURATION);
        if (hour > 6 && hour < 18) {
            hue = 28/360;
            saturation = 1;
            lightness = .75 + Math.abs(Math.cos((hour/24) * (2 * Math.PI)) * 0.25);
            lighColor = hslToRgb(hue, saturation, lightness);
            skyTint = hslToRgb(hue, saturation, lightness);
        } else if (hour > 5 && hour < 6) {
            hue = (210 + ((hour - 5) * 182))/360;
            saturation = 1;
            lightness = .75 + Math.abs(Math.sin((hour/24) * (2 * Math.PI)) * 0.25);
            lighColor = hslToRgb(hue, saturation, lightness);
            skyTint = hslToRgb(hue, saturation, lightness);
        } else if (hour > 18 && hour < 19) {
            hue = (28 + ((hour - 19) * 182))/360;
            saturation = 1;
            lightness = .75 + Math.abs(Math.sin((hour/24) * (2 * Math.PI)) * 0.25);
            lighColor = hslToRgb(hue, saturation, lightness);
            skyTint = hslToRgb(hue, saturation, 1 - lightness);
        } else {
            hue = 210/360;
            saturation = 1;
            lightness = .75 + Math.abs(Math.sin((hour/24) * (2 * Math.PI)) * 0.25);
            lighColor = hslToRgb(hue, saturation, lightness);
            skyTint = hslToRgb(hue, saturation, 1 - lightness);
        }
        intensity = 2 - (Math.cos((hour/24) * (2 * Math.PI)) * 1.75);
        var HOUR_DIV = 12;
        //var zoneRotation = Quat.fromVec3Radians({"x": (Math.PI/8) * (Math.sin((GetCurrentCycleValue(today.getTime(), 2 * Math.PI, MONTH_DURATION)) * (2 * Math.PI))), "y": 0.0, "z": (Math.PI/2) - (Math.PI/3 * Math.sin(GetCurrentCycleValue(today.getTime(), 2 * Math.PI, D29_HOUR_DURATION/HOUR_DIV)))});
        var zoneRotation = Quat.fromVec3Radians({"x": (Math.PI/8) * (Math.sin((GetCurrentCycleValue(today.getTime(), 2 * Math.PI, MONTH_DURATION)) * (2 * Math.PI))), "y": 0.0, "z": (Math.PI/3 * Math.sin(GetCurrentCycleValue(today.getTime(), 2 * Math.PI, D29_HOUR_DURATION/HOUR_DIV)))});

        var anglVelo = 0; (-Math.PI/(D29_HOUR_DURATION/HOUR_DIV) )* 3;
        var ambientIntensity = intensity/10;
        var currentsky = "https://aleziakurdis.github.io/inertia/AK004/images/sky.jpg";
        
        print("version: 119");
        print("zoneRotation: " + JSON.stringify(zoneRotation));
        print("anglVelo: " + anglVelo);
        print("intensity: " + intensity);
        
        if (skyID === Uuid.NULL) {
            //CREATE
            skyID = Entities.addEntity({
                "type": "Zone",
                "name": "AK004-SKY",
                "dimensions": {
                    "x": universeDimensions.x - 20,
                    "y": universeDimensions.y - 20,
                    "z": universeDimensions.z - 20
                },
                "parentID": thisEntity,
                "renderWithZones": renderWithZones,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "localRotation": zoneRotation,
                "angularVelocity": {"x": 0.0, "y": 0.0, "z": anglVelo},
                "angularDamping": 0.0,
                "grab": {
                    "grabbable": false
                },
                "shapeType": "sphere",
                "keyLight": {
                    "color": {
                        "red": lighColor[0],
                        "green": lighColor[1],
                        "blue": lighColor[2]
                    },
                    "intensity": intensity,
                    "direction": Vec3.fromPolar( 89.9 * DEGREES_TO_RADIANS, 0 * DEGREES_TO_RADIANS),
                    "castShadows": true,
                    "shadowBias": 0.03,
                    "shadowMaxDistance": 120
                },
                "ambientLight": {
                    "ambientIntensity": ambientIntensity,
                    "ambientURL": currentsky
                },
                "skybox": {
                    "color": {
                        "red": skyTint[0],
                        "green": skyTint[1],
                        "blue": skyTint[2]
                    },
                    "url": currentsky
                },
                "bloom": {
                    "bloomIntensity": 0.5,
                    "bloomThreshhold": 0.7,
                    "bloomSize": 0.8
                },
                "haze": {
                    "hazeRange": 2000,
                    "hazeColor": {
                        "red": skyTint[0],
                        "green": skyTint[1],
                        "blue": skyTint[2]
                    },
                    "hazeGlareColor": {
                        "red": lighColor[0],
                        "green": lighColor[1],
                        "blue": lighColor[2]
                    },
                    "hazeEnableGlare": true,
                    "hazeGlareAngle": 30,
                    "hazeAltitudeEffect": true,
                    "hazeBaseRef": universeCenter.z -170,
                    "hazeCeiling": universeCenter.z + 30
                },
                "keyLightMode": "enabled",
                "ambientLightMode": "enabled",
                "skyboxMode": "enabled",
                "hazeMode": "enabled",
                "bloomMode": "enabled"
            }, "local");
            
        } else {
            //UPDATE
            Entities.editEntity(skyID, {
                "localRotation": zoneRotation,
                "angularVelocity": {"x": 0.0, "y": 0.0, "z": anglVelo},
                "ambientLight": {
                    "ambientIntensity": ambientIntensity
                },
                "keyLight": {
                    "color": {
                        "red": lighColor[0],
                        "green": lighColor[1],
                        "blue": lighColor[2]
                    },
                    "intensity": intensity
                },
                "haze": {
                    "hazeRange": 2000,
                    "hazeColor": {
                        "red": skyTint[0],
                        "green": skyTint[1],
                        "blue": skyTint[2]
                    },
                    "hazeGlareColor": {
                        "red": lighColor[0],
                        "green": lighColor[1],
                        "blue": lighColor[2]
                    },
                    "hazeEnableGlare": true,
                    "hazeGlareAngle": 30,
                    "hazeAltitudeEffect": true,
                    "hazeBaseRef": universeCenter.z -170,
                    "hazeCeiling": universeCenter.z + 30
                },                
                "skybox": {
                    "color": {
                        "red": skyTint[0],
                        "green": skyTint[1],
                        "blue": skyTint[2]
                    }
                }
            });
        }
        
    }

    function positionIsInsideBox(boxPosition, boxRotation, boxDimensions) {
        var targetPosition = MyAvatar.position;

        var worldOffset = Vec3.subtract(targetPosition, boxPosition);
        targetPosition = Vec3.multiplyQbyV(Quat.inverse(boxRotation), worldOffset);

        var minX = -boxDimensions.x * HALF;
        var maxX = boxDimensions.x * HALF;
        var minY = -boxDimensions.y * HALF;
        var maxY = boxDimensions.y * HALF;
        var minZ = -boxDimensions.z * HALF;
        var maxZ = boxDimensions.z * HALF;

        return (targetPosition.x >= minX && targetPosition.x <= maxX
            && targetPosition.y >= minY && targetPosition.y <= maxY
            && targetPosition.z >= minZ && targetPosition.z <= maxZ);
    }    
    


 

    // ################## CYLCE AND TIME FUNCTIONS ###########################
    function GetCurrentCycleValue(timestamp, cyclelength, cycleduration){
		var TodaySec = timestamp/1000;
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
