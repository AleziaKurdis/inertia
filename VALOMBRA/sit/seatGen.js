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
            {"localPosition": {"x": 0.7163,"y": 1.4902,"z": 3.9883}, "localRotation": {"x":0,"y":-0.5,"z":0,"w":0.8660253882408142}},
            {"localPosition": {"x": 0.8555,"y": 1.4902,"z": 2.3784}, "localRotation": {"x":0,"y":-0.9025852680206299,"z":0,"w":0.43051114678382874}},
            {"localPosition": {"x": 3.1714,"y": 1.4902,"z": 3.8174}, "localRotation": {"x":0,"y":0.5735764503479004,"z":0,"w":0.8191521167755127}},
            {"localPosition": {"x": 2.1230,"y": 1.4902,"z": 1.8643}, "localRotation": {"x":0,"y":0.9659258723258972,"z":0,"w":0.2588191032409668}},
            {"localPosition": {"x": 2.9697,"y": 1.4902,"z": 2.2861}, "localRotation": {"x":0,"y":0.9659258723258972,"z":0,"w":0.2588191032409668}}
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
            "name": "Outpost - Seat",
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
