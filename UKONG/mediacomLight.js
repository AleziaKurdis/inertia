//
//  mediacomLight.js
//
//  Created by Alezia Kurdis, April 3rd, 2026.
//  Copyright 2026, Overte e.V.
//
//  Street Sign Light script.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    var ROOT = Script.resolvePath('').split("mediacomLight.js")[0];
    var lightID = Uuid.NONE;
    
    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID, ["renderWithZones"]);
        var renderWithZones = properties.renderWithZones;

        lightID = Entities.addEntity({
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": -2.6316, "y": 2.3481, "z": -0.01},
            "localRotation": Quat.fromVec3Degrees({"x": 0.0, "y": -90.0, "z": 22.0001}),
            "name": "Mediacom Light",
            "grab": {
                "grabbable": false
            },
            "type": "Light",
            "dimensions": {"x":14.245699882507324,"y":14.245699882507324,"z":14.245699882507324},
            "color": {"red": 255, "green": 239, "blue": 199},
            "intensity": 8.0,
            "falloffRadius": 0.8,
            "isSpotlight": true,
            "exponent": 1.0,
            "cutoff": 90,
        },"local");
    };    

    this.unload = function(entityID) {
        if (lightID !== Uuid.NONE) {
            Entities.deleteEntity(lightID);
            lightID = Uuid.NONE;
        }
    };


})