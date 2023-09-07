"use strict";
//
//  arrivalBack.js
//
//  Created by Alezia Kurdis, September 5th, 2023.
//  Copyright 2023, Overte e.V.
//
//  Arrival portal that can be used to return back.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var ROOT = Script.resolvePath('').split("arrivalBack.js")[0];
    var fxID = Uuid.NULL;
    var arrived = false;
    var D29_DAY_DURATION = 104400; //sec
    var HALF = 0.5;
    
    this.preload = function(entityID) {
        if (positionIsInsideEntityBounds(entityID, MyAvatar.position)) {
            arrived = false;
        } else {
            arrived = true;
        }
        
        var rwz = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;

        var antiHue = 0.5 + GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
        if (antiHue > 1) {
            antiHue = antiHue - 1;
        }
        var color = hslToRgb(antiHue, 1, 0.5);
        fxID = Entities.addEntity({
                "type": "ParticleEffect",
                "parentID": entityID,
                "localPosition": {
                    "x": 0,
                    "y": -1,
                    "z": 0
                },
                "name": "ARRIVAL-BACK FX",
                "dimensions": {
                    "x": 8.792000770568848,
                    "y": 8.792000770568848,
                    "z": 8.792000770568848
                },
                "renderWithZones": rwz,
                "grab": {
                    "grabbable": false
                },
                "damping": 0,
                "angularDamping": 0,
                "shapeType": "ellipsoid",
                "color": {
                    "red": 255,
                    "green": 255,
                    "blue": 255
                },
                "alpha": 0.20000000298023224,
                "textures": ROOT + "/images/bubble.png",
                "maxParticles": 2800,
                "lifespan": 6,
                "emitRate": 400,
                "emitSpeed": -0.10000000149011612,
                "speedSpread": 0.10000000149011612,
                "emitOrientation": {
                    "x": 0,
                    "y": 0,
                    "z": 0,
                    "w": 1
                },
                "emitDimensions": {
                    "x": 2,
                    "y": 0,
                    "z": 2
                },
                "emitRadiusStart": 0,
                "polarFinish": 3.1415927410125732,
                "emitAcceleration": {
                    "x": 0,
                    "y": 0.20000000298023224,
                    "z": 0
                },
                "particleRadius": 0.03999999910593033,
                "radiusStart": 0,
                "radiusFinish": 0.03999999910593033,
                "colorStart": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                },
                "colorFinish": {
                    "red": color[0],
                    "green": color[1],
                    "blue": color[2]
                },
                "alphaStart": 0.20000000298023224,
                "alphaFinish": 0,
                "emitterShouldTrail": true,
                "spinStart": 0,
                "spinFinish": 0
            }, "local");

            var id = Entities.addEntity({
                    "type": "Light",
                    "parentID": fxID,
                    "localPosition": {
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "name": "ARRIVAL-BACK LIGHT",
                    "dimensions": {
                        "x": 7,
                        "y": 7,
                        "z": 7
                    },
                    "renderWithZones": rwz,
                    "grab": {
                        "grabbable": false
                    },
                    "color": {
                        "red": color[0],
                        "green": color[1],
                        "blue": color[2]
                    },
                    "intensity": 6,
                    "falloffRadius": 1
                }, "local");

    }

    this.enterEntity = function(entityID) {
        if (arrived) {
            if (location.canGoBack()) {
                location.goBack();
            } else {
                if (LocationBookmarks.getHomeLocationAddress()) {
                    location.handleLookupString(LocationBookmarks.getHomeLocationAddress());
                } else {
                    Window.location = "file:///~/serverless/tutorial.json";
                }
            }
        }
    }; 

    this.leaveEntity = function(entityID) {
        arrived = true;
    };
    
    this.unload = function(entityID) {
        //remove effect
        if (fxID !== Uuid.NULL) {
            Entities.deleteEntity(fxID);
            fxID = Uuid.NULL;
        }
        arrived = false;
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

    function positionIsInsideEntityBounds(entityID, targetPosition) {
        targetPosition = targetPosition || MyAvatar.position;

        var properties = Entities.getEntityProperties(entityID, ["position", "dimensions", "rotation"]);
        var entityPosition = properties.position;
        var entityDimensions = properties.dimensions;
        var entityRotation = properties.rotation;

        var worldOffset = Vec3.subtract(targetPosition, entityPosition);
        targetPosition = Vec3.multiplyQbyV(Quat.inverse(entityRotation), worldOffset);

        var minX = -entityDimensions.x * HALF;
        var maxX = entityDimensions.x * HALF;
        var minY = -entityDimensions.y * HALF;
        var maxY = entityDimensions.y * HALF;
        var minZ = -entityDimensions.z * HALF;
        var maxZ = entityDimensions.z * HALF;

        return (targetPosition.x >= minX && targetPosition.x <= maxX
            && targetPosition.y >= minY && targetPosition.y <= maxY
            && targetPosition.z >= minZ && targetPosition.z <= maxZ);
    }

})

