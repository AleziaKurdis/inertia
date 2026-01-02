//
//  worldBuilder.js
//
//  Created by Alezia Kurdis, January 2nd, 2026.
//  Copyright 2026, Overte e.V.
//
//  Landscape generator for the TRONIX scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const ROOT = Script.resolvePath('').split("worldBuilder.js")[0];
    
    let entitiesToDelete = [];
    
    this.preload = function(entityID) {
        let properties = Entities.getEntityProperties(entityID, ["renderWithZones", "position"]);
        let renderWithZones = properties.renderWithZones;
        let corePosition = properties.position;

        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
                if (x === 0 && z === 0) {
                    continue;
                }
                
                let model = ROOT + "models/TRONIX.fst";
                if (Math.abs(x) > 1 || Math.abs(z) > 1) {
                    model = ROOT + "models/LOW-TRONIX.fst";
                }
                
                let id = Entities.addEntity({
                    "name": "landscape " + x + " | " + z,
                    "renderWithZones": renderWithZones,
                    "type": "Model",
                    "grab": {
                        "grabbable": false
                    },
                    "position": Vec3.sum(corePosition, { "x": 2000 * x, "y": 0.0, "z": 2000 * z}),
                    "dimensions": {
                        "x": 2000,
                        "y": 917.8575439453125,
                        "z": 2000
                    },
                    "damping": 0,
                    "angularDamping": 0,
                    "modelURL": model,
                    "useOriginalPivot": true
                }, "local");
                entitiesToDelete.push(id);
                
            }
        }

    };

    this.unload = function(entityID) {
        for (let i = 0; i < entitiesToDelete.length; i++) {
            Entities.deleteEntity(entitiesToDelete[i]);
        }
        entitiesToDelete = [];
    };

})
