//
//  scalableFire.js
//
//  Created by Alezia Kurdis, April 8th, 2026.
//  Copyright 2026, Overte e.V.
//
//  scalable fire for the UKONG scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    //OPTION (musbe set in description:
    //NOFLICK : No light flickering
    
    var ROOT = Script.resolvePath('').split("scalableFire.js")[0];
    const LIGHT_INTENSITY = 10.0;
    
    let timer;
    let entitiesToDelete = [];
    let isFlickering = true;

    
    this.preload = function(entityID) {
        const properties = Entities.getEntityProperties(entityID, ["renderWithZones", "dimensions", "description"]);
        const renderWithZones = properties.renderWithZones;
        const description = properties.description;
        
        if (description.indexOf("NOFLICK") !== -1) {
            isFlickering = false;
        }
        
        let scale = properties.dimensions.x > properties.dimensions.z ? properties.dimensions.z : properties.dimensions.x;

        let id = Entities.addEntity({
            "name": "Scalable Fire Light",
            "type": "Light",
            "localPosition": { "x": 0.0, "y": 0.0, "z": 0.0},
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "dimensions": {
                "x": 30 * scale,
                "y": 30 * scale,
                "z": 30 * scale
            },
            "color": {"red": 255, "green": 128, "blue": 0},
            "intensity": LIGHT_INTENSITY,
            "falloffRadius": LIGHT_INTENSITY/10,
            "isSpotlight": false
        }, "local");
        entitiesToDelete.push(id);
        
        let particleID = Entities.addEntity({
            "type": "ParticleEffect",
            "localPosition": {
                "x": 0.0,
                "y": 0.0,
                "z": 0.0
            },
            "name": "Scalable Fire Flamme FX",
            "dimensions": {
                "x": 3.3 * scale,
                "y": 3.3 * scale,
                "z": 3.3 * scale
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "collisionless": true,
            "ignoreForCollisions": true,
            "shapeType": "ellipsoid",
            "color": {
                "red": 255,
                "green": 130,
                "blue": 41
            },
            "alpha": 0.15,
            "textures": ROOT + "/images/flamme.png",
            "maxParticles": 36,
            "lifespan": 0.5,
            "emitRate": 18,
            "emitSpeed": 0,
            "speedSpread": 0,
            "emitOrientation": {
                "x": 0,
                "y": 0,
                "z": 0,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.4 * scale,
                "y": 0,
                "z": 0.4 * scale
            },
            "emitRadiusStart": 0,
            "polarFinish": 3.1415927410125732,
            "emitAcceleration": {
                "x": 0,
                "y": 2.8 * scale,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0.2 * scale,
                "z": 0
            },
            "particleRadius": 1 * scale,
            "radiusSpread": 0.008 * scale,
            "radiusStart": 0.5 * scale,
            "radiusFinish": 1.2 * scale,
            "colorStart": {
                "red": 255,
                "green": 208,
                "blue": 0
            },
            "colorFinish": {
                "red": 255,
                "green": 98,
                "blue": 0
            },
            "emitterShouldTrail": false,
            "alphaSpread": 0.1,
            "alphaStart": 0.4,
            "alphaFinish": 0,
            "spinSpread": 0.17,
            "spinStart": null,
            "spinFinish": null
        }, "local");
        entitiesToDelete.push(particleID);
        
        if (isFlickering) {
            timer = Script.setInterval(function () {
                Entities.editEntity(id, {"intensity": ((LIGHT_INTENSITY/2) + (Math.random() * LIGHT_INTENSITY))});
            }, 50);
        }
    };

    this.unload = function(entityID) {
        if (isFlickering) {
            Script.clearInterval(timer);
        }
        for (let i=0; i < entitiesToDelete.length; i++) {
            Entities.deleteEntity(entitiesToDelete[i]);
        }
        entitiesToDelete = [];
    };

})
