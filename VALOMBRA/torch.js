//
//  torch.js
//
//  Created by Alezia Kurdis, December 2nd, 2025.
//  Copyright 2025, Overte e.V.
//
//  torch for the VALOMBRA scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("torch.js")[0];
    const LIGHT_INTENSITY = 8.0;

    let timer;
    let entitiesToDelete = [];
    
    this.preload = function(entityID) {
        const renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;

        let id = Entities.addEntity({
            "name": "Torch Light",
            "type": "Light",
            "localPosition": { "x": 0.0, "y": 0.0, "z": 0.0},
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "dimensions": {
                "x": 20,
                "y": 20,
                "z": 20
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
            "name": "Flamme FX",
            "dimensions": {
                "x": 0.8235000371932983,
                "y": 0.8235000371932983,
                "z": 0.8235000371932983
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "shapeType": "ellipsoid",
            "color": {
                "red": 255,
                "green": 162,
                "blue": 41
            },
            "alpha": 0.15,
            "textures": ROOT + "/images/flambeau.png",
            "maxParticles": 8,
            "lifespan": 0.5,
            "emitRate": 16,
            "emitSpeed": 0,
            "speedSpread": 0,
            "emitOrientation": {
                "x": 0,
                "y": 0,
                "z": 0,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.05000000074505806,
                "y": 0,
                "z": 0.05000000074505806
            },
            "emitRadiusStart": 0,
            "polarFinish": 3.1415927410125732,
            "emitAcceleration": {
                "x": 0,
                "y": 1.2000000476837158,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0.20000000298023224,
                "z": 0
            },
            "particleRadius": 0.15000000596046448,
            "radiusSpread": 0.05000000074505806,
            "radiusStart": 0.15000000596046448,
            "radiusFinish": 0.15000000596046448,
            "colorStart": {
                "red": 255,
                "green": 223,
                "blue": 64
            },
            "colorFinish": {
                "red": 255,
                "green": 115,
                "blue": 0
            },
            "alphaSpread": 0.10000000149011612,
            "alphaStart": 0.4000000059604645,
            "alphaFinish": 0,
            "spinSpread": 0.17000000178813934,
            "spinStart": null,
            "spinFinish": null
        }, "local");
        entitiesToDelete.push(particleID);
        
        timer = Script.setInterval(function () {
            Entities.editEntity(id, {"intensity": ((LIGHT_INTENSITY/2) + (Math.random() * LIGHT_INTENSITY))});
        }, 50);
    };

    this.unload = function(entityID) {
        Script.clearInterval(timer);
        for (let i=0; i < entitiesToDelete.length; i++) {
            Entities.deleteEntity(entitiesToDelete[i]);
        }
        entitiesToDelete = [];
    };

})
