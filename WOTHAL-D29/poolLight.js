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
        let properties = Entities.getEntityProperties(entityID, ["renderWithZones", "name"]);
        let renderWithZones = properties.renderWithZones;
        
        let lightDim = 60;
        let height = 0;
        if (properties.name === "POOL 2"){
            height = 12;
        }

        lightID = Entities.addEntity({
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": 0.0, "y": 0.0, "z": height},
            "name": "Pool Light",
            "grab": {
                "grabbable": false
            },
            "type": "Light",
            "dimensions": {
                "x": lightDim,
                "y": lightDim,
                "z": lightDim
            },
            "color": {"red": 234, "green": 212, "blue": 255},
            "intensity": 20,
            "falloffRadius": 3,
            "isSpotlight": false
        },"local");
        
        timer = Script.setInterval(function () {
            Entities.editEntity(lightID, {"intensity": 20 + (Math.random() * 40) - 20});
        }, 100);
        
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