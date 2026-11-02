//
//  poolLight.js
//
//  Created by Alezia Kurdis, November 1st, 2026.
//  Copyright 2026, Overte e.V.
//
//  Pool Light script.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    let lightID = Uuid.NONE;
    let timer = null;
    
    this.preload = function(entityID) {
        let properties = Entities.getEntityProperties(entityID, ["renderWithZones"]);
        let renderWithZones = properties.renderWithZones;

        lightID = Entities.addEntity({
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": 0.0, "y": 3, "z": 0.0},
            "name": "Pool Light",
            "grab": {
                "grabbable": false
            },
            "type": "Light",
            "dimensions": {
                "x": 40,
                "y": 40,
                "z": 40
            },
            "color": {"red": 255, "green": 255, "blue": 255},
            "intensity": 15,
            "falloffRadius": 2,
            "isSpotlight": false
        },"local");
        
        timer = Script.setInterval(function () {
            Entities.editEntity(lightID, {"intensity": 15 + (Math.random() * 30) - 15});
        }, 80);
        
    };    

    this.unload = function(entityID) {
        if (timer !== null) {
            Script.clearInterval(timer);
            timer = null;
        }
        
        if (lightID !== Uuid.NONE) {
            print("HMM!");
            Entities.deleteEntity(lightID);
            lightID = Uuid.NONE;
        }
    };


})