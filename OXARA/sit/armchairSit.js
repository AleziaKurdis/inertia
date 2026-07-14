//
//  armchairSit.js
//
//  Created by Alezia Kurdis, July 11th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Generate sit spots for armchairs in OXARA Scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    const ROOT = Script.resolvePath('').split("armchairSit.js")[0];
    let seatID = Uuid.NONE;

    const DISTANCE_OVERRIDER = {
        "distanceToSeeIndicator": 2.0
    };
    
    this.preload = function(entityID) { 
        let renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;

        seatID = Entities.addEntity({
            "type": "Shape",
            "shape": "Cube",
            "parentID": entityID,
            "name": "Seat",
            "dimensions": {"x":0.3,"y":0.01,"z":0.3},
            "localPosition": {"x":0.05,"y":0.57,"z":0.0},
            "localRotation": Quat.fromVec3Degrees({"x":0.0,"y":90.0,"z":0.0}),
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "visible": true,
            "alpha": 0.0,
            "script": ROOT + "sit_spot.js",
            "userData": JSON.stringify(DISTANCE_OVERRIDER),
            "lifetime": 21600
        }, "local");

    }

    this.unload = function(entityID) {
        if (seatID !== Uuid.NONE) {
            Entities.deleteEntity(seatID);
            seatID = Uuid.NONE;
        }
    };

})
