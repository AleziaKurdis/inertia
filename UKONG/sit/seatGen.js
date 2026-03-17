//
//  seatGen.js
//
//  Created by Alezia Kurdis, March 16th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Generate sit spots for UKONG Scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("seatGen.js")[0];
    var thisEntity;
    var renderWithZones;
    var entitiesToDelete = [];
    const COORD_REFERENCE = {"x": -3000,"y": 3000,"z": -3000};
    
    this.preload = function(entityID) { 
        thisEntity = entityID;
        
        renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;
        
        var seats = [
            {   //GUTT EATON seat 1
                "position": {"x":-3168.818359375,"y":3006.777099609375,"z":-3195.427001953125},
                "localRotation": {"x":0,"y":-0.9238796234130859,"z":0,"w":0.3826834559440613}
            },
            {   //GUTT EATON seat 2
                "position": {"x":-3169.631591796875,"y":3006.777099609375,"z":-3195.15283203125},
                "localRotation": {"x":0,"y":1,"z":0,"w":-4.371138828673793e-8}
            },
            {   //GUTT EATON seat 3
                "position": {"x":-3170.218505859375,"y":3006.777099609375,"z":-3195.15283203125},
                "localRotation": {"x":0,"y":1,"z":0,"w":-4.371138828673793e-8}
            },
            {   //GUTT EATON seat 4
                "position": {"x":-3168.557861328125,"y":3006.777099609375,"z":-3196.238525390625},
                "localRotation": {"x":0,"y":0.7071067690849304,"z":0,"w":-0.70710688829422}
            },
            {   //GUTT EATON seat 5
                "position": {"x":-3168.557861328125,"y":3006.777099609375,"z":-3196.845703125},
                "localRotation": {"x":0,"y":0.7071067690849304,"z":0,"w":-0.70710688829422}
            },
            {   //GUTT EATON seat 6
                "position": {"x":-3169.534423828125,"y":3006.777099609375,"z":-3197.93798828125},
                "localRotation": {"x":0,"y":-0.1908089816570282,"z":0,"w":0.9816271662712097}
            },
            {   //DEAD TRUNK seat 1
                "position": {"x":-3279.574462890625,"y":2985.98,"z":-2815.010009765625},
                "localRotation": {"x": 0,"y": 0.22495101392269135,"z": 0,"w": 0.9743700623512268}
            },
            {   //DEAD TRUNK seat 2
                "position": {"x":-3278.900146484375,"y":2985.98,"z":-2815.253173828125},
                "localRotation": {"x": 0,"y": 0.008726507425308228,"z": 0,"w": 0.9999619722366333}
            },
            {   //DEAD TRUNK seat 3
                "position": {"x":-3278.704345703125,"y":2985.98,"z":-2812.366943359375},
                "localRotation": {"x": 0,"y": -0.9969174265861511,"z": 0,"w": 0.07845912128686905}
            },
            {   //DEAD TRUNK seat 4
                "position": {"x":-3279.454345703125,"y":2985.98,"z":-2812.6484375},
                "localRotation": {"x": 0,"y": -0.9848077893257141,"z": 0,"w": -0.1736481487751007}
            },
            {   //DEAD TRUNK seat 5
                "position": {"x":-3278.161865234375,"y":2985.98,"z":-2812.8505859375},
                "localRotation": {"x": 0,"y": -0.9510565400123596,"z": 0,"w": 0.3090170621871948}
            }
        ];
        
        for (let t = 0; t < seats.length; t++ ) {
            entitiesToDelete.push(generateSeat(Vec3.subtract(seats[t].position, COORD_REFERENCE), seats[t].localRotation));
        }
    }

    function generateSeat(localPosition, localRotation) {
        var distanceOverrider = {
            "distanceToSeeIndicator": 2.0
        };
        
        var id = Entities.addEntity({
            "type": "Shape",
            "shape": "Cube",
            "parentID": thisEntity,
            "name": "Seat",
            "dimensions": {"x":0.3,"y":0.01,"z":0.3},
            "localPosition": localPosition,
            "localRotation": localRotation,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "visible": true,
            "alpha": 0.0,
            "script": ROOT + "sit_spot.js",
            "userData": JSON.stringify(distanceOverrider),
            "lifetime": 864000
        }, "local");
        return id;
    }

    this.unload = function(entityID) {
        for (let i = 0; i < entitiesToDelete.length; i++) {
            Entities.deleteEntity(entitiesToDelete[i]);
        }
        entitiesToDelete = [];
    };

})
