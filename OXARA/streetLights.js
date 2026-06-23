//
//  streetLights.js
//
//  Created by Alezia Kurdis, June 23th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Street Lights generator for the OXARA scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("streetLights.js")[0];
    var COORD_REFERENCE = {"x": 5000, "y": -5000, "z": 5000};
    var lightEntries = [
        {"name": "ARRIVAL-OMEGA", "lightType": "STREETPOLE", "position": {"x":5284.4130859375,"y":-5010.12841796875,"z":5288.4609375}}
    ];
    
    var lights = [];
    this.preload = function(entityID) {
        var renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;
        var i, id, properties;
        for (i=0; i < lightEntries.length; i++) {
            if (lightEntries[i].lightType === "STREETPOLE") {
                properties = {
                    "type": "Light",
                    "name": lightEntries[i].lightType + " " + lightEntries[i].name,
                    "dimensions": {
                        "x": 32.485660552978516,
                        "y": 32.485660552978516,
                        "z": 33.631629943847656
                    },
                    "rotation": {
                        "x": 0.7071068286895752,
                        "y": 0,
                        "z": 0,
                        "w": -0.7071068286895752
                    },
                    "localPosition": Vec3.subtract(lightEntries[i].position, COORD_REFERENCE),
                    "parentID": entityID,
                    "renderWithZones": renderWithZones,
                    "grab": {
                        "grabbable": false
                    },
                    "collisionless": true,
                    "ignoreForCollisions": true,
                    "color": {
                        "red": 255,
                        "green": 205,
                        "blue": 148
                    },
                    "isSpotlight": true,
                    "intensity": 15,
                    "exponent": 1,
                    "cutoff": 75,
                    "falloffRadius": 1.5
                };
            }
            
            id = Entities.addEntity(properties, "local");
            lights.push(id);
        }
    };

    this.unload = function(entityID) {
        var i;
        for (i=0; i < lights.length; i++) {
            Entities.deleteEntity(lights[i]);
            
        }
        lights = [];
    };    

})
