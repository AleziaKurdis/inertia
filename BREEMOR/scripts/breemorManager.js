//
//  breemorManager.js
//
//  Created by Alezia Kurdis, May 7th, 2025.
//  Copyright 2025, Overte e.V.
//
//  manager script for the spaceship Breemor.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("breemorManager.js")[0];
    var renderWithZones = [];
    var entitiesToDelete = [];
    this.preload = function(entityID) {
        renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;
        
        //Ship Lights
        var lightDefinition = [
            {"name": "CARGO BAY 1", "dimensions": {"x":15.171574592590332,"y":15.171574592590332,"z":23.602781295776367}, "localPosition": {"x": 3.6099,"y": 5.4194,"z": 55.7471}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 40},
            {"name": "CARGO BAY 2", "dimensions": {"x":15.171574592590332,"y":15.171574592590332,"z":23.602781295776367}, "localPosition": {"x": -3.6099,"y": 5.4194,"z": 55.7471}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 40},
            {"name": "CARGO BAY 3", "dimensions": {"x":15.171574592590332,"y":15.171574592590332,"z":23.602781295776367}, "localPosition": {"x": 0.0,"y": 5.4194,"z": 67.2246}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 40},
            {"name": "CARGO BAY ENTRANCE", "dimensions": {"x":8.02638,"y":8.02638,"z":9.2680}, "localPosition": {"x": 0.0,"y": -0.8521,"z": 47.4229}, "color": {"red": 255, "green": 202, "blue": 133}, "intensity": 10, "falloffRadius": 1.0, "cutoff": 60},
            {"name": "SOUTE 1A", "dimensions": {"x":33.766197204589844,"y":33.766197204589844,"z":34.28709411621094}, "localPosition": {"x": 3.6387,"y": 0.7871,"z": 2.2438}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "SOUTE 1B", "dimensions": {"x":33.766197204589844,"y":33.766197204589844,"z":34.28709411621094}, "localPosition": {"x": -3.6387,"y": 0.7871,"z": 2.2438}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "SOUTE 2A", "dimensions": {"x":33.766197204589844,"y":33.766197204589844,"z":34.28709411621094}, "localPosition": {"x": 3.6387,"y": 0.7871,"z": 12.1289}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "SOUTE 2B", "dimensions": {"x":33.766197204589844,"y":33.766197204589844,"z":34.28709411621094}, "localPosition": {"x": -3.6387,"y": 0.7871,"z": 12.1289}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "SOUTE 3A", "dimensions": {"x":33.766197204589844,"y":33.766197204589844,"z":34.28709411621094}, "localPosition": {"x": 3.6387,"y": 0.7871,"z": 25.0972}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "SOUTE 3B", "dimensions": {"x":33.766197204589844,"y":33.766197204589844,"z":34.28709411621094}, "localPosition": {"x": -3.6387,"y": 0.7871,"z": 25.0972}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "SOUTE 4A", "dimensions": {"x":30.9626522064209,"y":30.9626522064209,"z":31.4403018951416}, "localPosition": {"x": 3.6387,"y": 0.7871,"z": 34.7954}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
            {"name": "SOUTE 4B", "dimensions": {"x":30.9626522064209,"y":30.9626522064209,"z":31.4403018951416}, "localPosition": {"x": -3.6387,"y": 0.7871,"z": 34.7954}, "color": {"red": 255, "green": 255, "blue": 255}, "intensity": 20, "falloffRadius": 4.0, "cutoff": 80},
        ];
        var i, id;
        for (i=0; i < lightDefinition.length; i++) {
            id = Entities.addEntity({
                "type": "Light",
                "name": "Breemor Light " + lightDefinition[i].name,
                "dimensions": lightDefinition[i].dimensions,
                "rotation": Quat.fromVec3Degrees({ "x": -90, "y": 0, "z": 0}),
                "localPosition": lightDefinition[i].localPosition,
                "parentID": entityID,
                "renderWithZones": renderWithZones,
                "grab": {
                    "grabbable": false
                },
                "collisionless": true,
                "ignoreForCollisions": true,
                "color": lightDefinition[i].color,
                "isSpotlight": true,
                "intensity": lightDefinition[i].intensity,
                "exponent": 1,
                "cutoff": lightDefinition[i].cutoff,
                "falloffRadius": lightDefinition[i].falloffRadius,
                "lifetime": 25200
            }, "local");
            
            entitiesToDelete.push(id);
        }
    };

    this.unload = function(entityID) {
        var i;
        for (i=0; i < entitiesToDelete.length; i++) {
            Entities.deleteEntity(entitiesToDelete[i]);
            
        }
        entitiesToDelete = [];
    };    

})
