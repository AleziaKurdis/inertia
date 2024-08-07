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
        var lightColor = {"red": 255, "green": 72, "blue": 0 };
        if (team === "BLUE") {
            lightColor = {"red": 0, "green": 72, "blue": 255 };
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

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 111.4155,
                "y": 48.5168,
                "z": 4.9294
            },
            "name": "LEFT_TOP_LIGHT_" + team,
            "dimensions": {
                "x": 28.6224,
                "y": 28.6224,
                "z": 28.6224
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": false,
            "intensity": 10,
            "exponent": 1,
            "cutoff": 70,
            "falloffRadius": 2
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 111.4155,
                "y": 48.5168,
                "z": -1.8120
            },
            "name": "RIGHT_TOP_LIGHT_" + team,
            "dimensions": {
                "x": 28.6224,
                "y": 28.6224,
                "z": 28.6224
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": false,
            "intensity": 10,
            "exponent": 1,
            "cutoff": 70,
            "falloffRadius": 2
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 106.6592,
                "y": 29.6604,
                "z": 1.6609
            },
            "name": "2ND_FLOOR_LIGHT_" + team,
            "dimensions": {
                "x": 38.1230,
                "y": 38.1230,
                "z": 38.1230
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
            "isSpotlight": false,
            "intensity": 10,
            "exponent": 1,
            "cutoff": 70,
            "falloffRadius": 2
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 99.1528,
                "y": 11.4370,
                "z": 1.6609
            },
            "name": "1ST_FLOOR_LIGHT_" + team,
            "dimensions": {
                "x":18.74223518371582,
                "y":18.74223518371582,
                "z":18.74223518371582
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
            "cutoff": 90,
            "falloffRadius": 2
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 128.3232,
                "y": -4.1531,
                "z": 1.6609
            },
            "name": "FLAG_ROOM_LIGHT_" + team,
            "dimensions": {
                "x":14.422473907470703,
                "y":14.422473907470703,
                "z":22.437387466430664
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
            "exponent": 15,
            "cutoff": 40,
            "falloffRadius": 2
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 6.2952,
                "y": 5.1257,
                "z": 0.0
            },
            "name": "BRIDGE_LIGHT_" + team,
            "dimensions": {"x":45.148406982421875,"y":45.148406982421875,"z":45.148406982421875},
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
            "exponent": 15,
            "cutoff": 40,
            "falloffRadius": 1
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
