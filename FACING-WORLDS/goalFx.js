//
//  goalFx.js
//
//  Created by Alezia Kurdis, September 1st, 2024.
//  Copyright 2024 Alezia Kurdis.
//
//  generate Particle annimation for Goals.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("goalFx.js")[0]; 
    var fxID = Uuid.NULL;
    var RED_COLOR = {"red": 255, "green": 24, "blue": 0 };
    var BLUE_COLOR = {"red": 0, "green": 108, "blue": 255 };
    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID,["renderWithZones", "name"]);
        var color = RED_COLOR;
        if (properties.name === "FLAG_TRAP_RED_SIDE") {
            color = BLUE_COLOR;
        }
        
        fxID = Entities.addEntity({
            "type": "ParticleEffect",
            "localPosition": {"x": 0.0 , "y": 0.0, "z": 0.0},
            "name": "GOAL_FX",
            "dimensions": {
                "x": 1.9500000476837158,
                "y": 1.9500000476837158,
                "z": 1.9500000476837158
            },
            "renderWithZones": properties.renderWithZones,
            "parentID": entityID,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "shapeType": "compound",
            "compoundShapeURL": ROOT + "models/FLAG.glb",
            "color": color,
            "alpha": 0.800000011920929,
            "textures": ROOT + "images/ASTROLITHE.png",
            "maxParticles": 400,
            "lifespan": 0.25,
            "emitRate": 1600,
            "emitSpeed": 0,
            "speedSpread": 0,
            "emitOrientation": {
                "x": 0,
                "y": 0,
                "z": 0,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.1599999964237213,
                "y": 1.7300000190734863,
                "z": 0.05000000074505806
            },
            "emitRadiusStart": 0,
            "polarFinish": 3.1415927410125732,
            "emitAcceleration": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "particleRadius": 0.05999999865889549,
            "radiusSpread": 0.05000000074505806,
            "radiusStart": 0,
            "radiusFinish": 0,
            "colorStart": {
                "red": 255,
                "green": 255,
                "blue": 255
            },
            "colorFinish": {
                "red": 255,
                "green": 255,
                "blue": 255
            },
            "alphaStart": 0,
            "alphaFinish": 0,
            "emitterShouldTrail": true,
            "spinStart": null,
            "spinFinish": null
        }, "local");
    };
    
    this.unload = function(entityID) {
        if (fxID !== Uuid.NULL) {
            Entities.deleteEntity(fxID);
            fxID = Uuid.NULL;
        }
    };

});