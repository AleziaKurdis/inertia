"use strict";
//
//  tpGenerator.js
//
//  Created by Alezia Kurdis, April 15th, 2023.
//  Copyright 2023, Overte e.V.
//
//  Generate a teleporter triggers.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("tpGenerator.js")[0];
    var thisEntity;

 
    var entitiesToBeDeleted = [];
    
    var renderWithZones;
    var portalData;
    
    /* Example of a "userData" config:
    {
        "url": "hifi://vankh/-1807.96,5027.84,438.628/0,0.0376498,0,0.999291",
        "localPosition": {"x": 0.7804, "y": 1.6006, "z": -0.1526},
        "dimensions": {"x": 1.0339, "y": 2.8464, "z": 1.5076}
    }
    */
    
    this.preload = function(entityID) { 
        thisEntity = entityID;
        var properties = Entities.getEntityProperties(entityID, ["renderWithZones", "userData"]);
        
        portalData = JSON.parse(properties.userData);
        renderWithZones = properties.renderWithZones;
        
        var id = Entities.addEntity({
            "type": "Box",
            "name": teleporters[i].name,
            "visible": false,
            "description": portalData.url,
            "dimensions": portalData.dimensions,
            "localPosition": portalData.localPosition,
            "parentID": thisEntity,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "collisionless": true,
            "ignoreForCollisions": true,
            "shape": "Cube",
            "script": ROOT + "teleporter.js"
        }, "local");
        entitiesToBeDeleted.push(id);
    }

    this.unload = function(entityID) {
        for (var i = 0; i < entitiesToBeDeleted.length; i++) {
            if (entitiesToBeDeleted[i] !== Uuid.NULL) {
                Entities.deleteEntity(entitiesToBeDeleted[i]);
            }
        }
    };

})
