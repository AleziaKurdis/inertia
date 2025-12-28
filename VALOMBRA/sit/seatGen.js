//
//  seatGen.js
//
//  Created by Alezia Kurdis, December 27th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Generate sit spots.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("seatGen.js")[0];
    var thisEntity;
    var renderWithZones;
    var entitiesToDelete = [];
    
    this.preload = function(entityID) { 
        thisEntity = entityID;
        
        renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;

        var seats = [
            {   //Table 1 Seat 1
                "localPosition": {"x": 107.3726,"y": 31.3979,"z": 126.6627},
                "localRotation": {"x":0,"y":0.017452405765652657,"z":0,"w":0.9998477101325989}
            },
            {   //Table 1 Seat 2
                "localPosition": {"x": 106.5962,"y": 31.3979,"z": 126.6899},
                "localRotation": {"x":0,"y":0.017452405765652657,"z":0,"w":0.9998477101325989}
            },
            {   //Table 1 Seat 3
                "localPosition": {"x": 105.9878,"y": 31.3979,"z": 126.7109},
                "localRotation": {"x":0,"y":0.017452405765652657,"z":0,"w":0.9998477101325989}
            },
            {   //Table 1 Seat 4
                "localPosition": {"x": 106.0835,"y": 31.3979,"z": 128.6123},
                "localRotation": {"x":0,"y":0.9998478293418884,"z":0,"w":-0.0174524188041687}
            },
            {   //Table 1 Seat 5
                "localPosition": {"x": 106.7495,"y": 31.3979,"z": 128.5891},
                "localRotation": {"x":0,"y":0.9998478293418884,"z":0,"w":-0.0174524188041687}
            },
            {   //Table 1 Seat 6
                "localPosition": {"x": 107.4365,"y": 31.3979,"z": 128.5540},
                "localRotation": {"x":0,"y":0.9998478293418884,"z":0,"w":-0.0174524188041687}
            },
            {   //Table 2 Seat 1
                "localPosition": {"x": 104.5996,"y": 31.3979,"z": 125.1965},
                "localRotation": {"x":0,"y":0.7071068286895752,"z":0,"w":-0.7071068286895752}
            },
            {   //Table 2 Seat 2
                "localPosition": {"x": 104.5830,"y": 31.3979,"z": 125.9741},
                "localRotation": {"x":0,"y":0.7071068286895752,"z":0,"w":-0.7071068286895752}
            },
            {   //Table 2 Seat 3
                "localPosition": {"x": 102.9448,"y": 31.3979,"z": 125.9741},
                "localRotation": {"x":0,"y":-0.7071068286895752,"z":0,"w":-0.7071068286895752}
            },
            {   //Table 2 Seat 4
                "localPosition": {"x": 102.9600,"y": 31.3979,"z": 125.1394},
                "localRotation": {"x":0,"y":-0.7071068286895752,"z":0,"w":-0.7071068286895752}
            }
        ];
        
        for (let t = 0; t < seats.length; t++ ) {
            entitiesToDelete.push(generateSeat(seats[t].localPosition, seats[t].localRotation));
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
