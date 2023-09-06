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
    
    this.preload = function(entityID) {
        var rwz = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;

        fxID = Entities.addEntity({
            "type": "ParticleEffect",
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
                "red": 240,
                "green": 240,
                "blue": 240
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
                "red": null,
                "green": null,
                "blue": null
            },
            "colorFinish": {
                "red": 106,
                "green": 0,
                "blue": 255
            },
            "alphaStart": 0.20000000298023224,
            "alphaFinish": 0,
            "emitterShouldTrail": true,
            "spinStart": 0,
            "spinFinish": 0
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
            Entities.deleteEnity(fxID);
            fxID = Uuid.NULL;
        }
        arrived = FALSE;
    };
    
    
})

