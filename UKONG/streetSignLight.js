//
//  streetSignLight.js
//
//  Created by Alezia Kurdis, March 27th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Street Sign Light script.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    var ROOT = Script.resolvePath('').split("streetSignLight.js")[0];
    var lightID = Uuid.NONE;
    
    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID, ["renderWithZones"]);
        var renderWithZones = properties.renderWithZones;

        lightID = Entities.addEntity({
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": 0.0, "y": 0, "z": -0.08},
            "name": "Street Sign Light",
            "grab": {
                "grabbable": false
            },
            "type": "Light",
            "dimensions": {
                "x": 1,
                "y": 1,
                "z": 1
            },
            "color": {"red": 255, "green": 239, "blue": 199},
            "intensity": 5,
            "falloffRadius": 0.7,
            "isSpotlight": false
        },"local");
    };    

    this.unload = function(entityID) {
        if (lightID !== Uuid.NONE) {
            Entities.deleteEntity(lightID);
            lightID = Uuid.NONE;
        }
    };


})