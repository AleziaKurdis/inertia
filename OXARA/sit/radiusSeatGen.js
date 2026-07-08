//
//  radiusSeatGen.js
//
//  Created by Alezia Kurdis, July 7th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Generate sit spots for NORETH in OXARA Scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    const ROOT = Script.resolvePath('').split("radiusSeatGen.js")[0];
    let thisEntity;
    let renderWithZones;
    let entPosition;
    let seatID = Uuid.NONE;
    let processing = null;
    
    const MAX_DIST = 5; //in meters
    
    const DISTANCE_OVERRIDER = {
        distanceToSeeIndicator: 2.0
    };
    
    this.preload = function(entityID) { 
        thisEntity = entityID;
        let properties = Entities.getEntityProperties(entityID, ["renderWithZones", "position"]);
        renderWithZones = properties.renderWithZones;
        entPosition = properties.position;

        processing = Script.setInterval(function () {
            generateSeat();
        }, 2000);
    }

    function generateSeat() {
        let distance = Vec3.distance(entPosition, MyAvatar.position);

        let localRotation = Quat.lookAtSimple( 
            {"x":entPosition.x,"y":0.0,"z":entPosition.z}, 
            {"x":MyAvatar.position.x,"y":0.0,"z":MyAvatar.position.z}
        );
        let localPosition = Vec3.multiplyQbyV( localRotation, {"x":0.0,"y":0.0,"z": 4} );
        
        if (distance < MAX_DIST) {
            if (seatID === Uuid.NONE) {
                seatID = Entities.addEntity({
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
                    "userData": JSON.stringify(DISTANCE_OVERRIDER),
                    "lifetime": 21600
                }, "local");
            } else {
                //edit (move)
                Entities.editEntity(seatID, {
                    "localPosition": localPosition,
                    "localRotation": localRotation
                });
            }
        } else if (seatID !== Uuid.NONE) {
            Entities.deleteEntity(seatID);
            seatID = Uuid.NONE;
        }
    }

    this.unload = function(entityID) {
        if (processing) { 
            Script.clearInterval(processing);
            processing = null;
        }
        if (seatID !== Uuid.NONE) {
            Entities.deleteEntity(seatID);
            seatID = Uuid.NONE;
        }
    };

})
