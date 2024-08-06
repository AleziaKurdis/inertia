//
//  tower.js
//
//  Created by Alezia Kurdis, August 5th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Add tower related elements for FACING-WORLD scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("tower.js")[0];
    var entitiesToDelete = [];

    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID, ["renderWithZones", "description"]);
        var renderWithZones = properties.renderWithZones;
        var team = properties.description; // (RED | BLUE)
        if (team === "") {
            team = "RED";
        }
        var lightColor = {"red": 255, "green": 0, "blue": 0 };
        if (team === "BLUE") {
            lightColor = {"red": 0, "green": 0, "blue": 255 };
        }
        
        var id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 117.1812,
                "y": 0.5300,
                "z": 1.6025
            },
            "name": "ENTRANCE_LIGHT_" + team,
            "dimensions": {
                "x": 27.221336364746094,
                "y": 27.221336364746094,
                "z": 28.968341827392578
            },
            "rotation": {
                "x": 0.7071068286895752,
                "y": 0,
                "z": 0,
                "w": -0.7071068286895752
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": true,
            "intensity": 15,
            "exponent": 1,
            "cutoff": 70,
            "falloffRadius": 3
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 111.1812,
                "y": -2.2712,
                "z": 8.0198
            },
            "name": "LEFT_LIGHT_" + team,
            "dimensions": {
                "x": 27.221336364746094,
                "y": 27.221336364746094,
                "z": 28.968341827392578
            },
            "rotation": {
                "x": 0.7071068286895752,
                "y": 0,
                "z": 0,
                "w": -0.7071068286895752
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": true,
            "intensity": 10,
            "exponent": 1,
            "cutoff": 70,
            "falloffRadius": 2
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 111.1812,
                "y": -2.2712,
                "z": -4.6797
            },
            "name": "RIGHT_LIGHT_" + team,
            "dimensions": {
                "x": 27.221336364746094,
                "y": 27.221336364746094,
                "z": 28.968341827392578
            },
            "rotation": {
                "x": 0.7071068286895752,
                "y": 0,
                "z": 0,
                "w": -0.7071068286895752
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": true,
            "intensity": 10,
            "exponent": 1,
            "cutoff": 70,
            "falloffRadius": 2
        }, "local");
        entitiesToDelete.push(id);
        
    };

    this.unload = function(entityID) {
        var i;
        for (i=0; i < entitiesToDelete.length; i++) {
            Entities.deleteEntity(entitiesToDelete[i]);
            
        }
        entitiesToDelete = [];
    };

})
