//
//  streetLights.js
//
//  Created by Alezia Kurdis, November 29th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Street Lights generator for the VALOMBRA scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("streetLights.js")[0];
    const COORD_REFERENCE = {"x":4000,"y":4107.67236328125,"z":-4000};
    const LIGHT_INTENSITY = 8.0;
    var flickers = [];
    var timer;
    var currentFlicker = 0;
    var luminaires = [
        { //arrival
            "localPosition": {"x":4083.7763671875,"y":4131.3330078125,"z":-3903.164794921875}, 
            "rotation": {"x":0,"y":0.8987940549850464,"z":0,"w":0.4383711516857147}, 
            "model": "muralight"
        }, 
        { //arrival 2
            "localPosition": {"x":4073.913330078125,"y":4133.74462890625,"z":-3895.22802734375}, 
            "rotation": {"x":0,"y":0.8987940549850464,"z":0,"w":0.4383711516857147}, 
            "model": "muralight"
        },
        { //escalier
            "localPosition": {"x":4060.9951171875,"y":4140.462890625,"z":-3886.0888671875}, 
            "rotation": {"x":0,"y":0.8987940549850464,"z":0,"w":0.4383711516857147}, 
            "model": "muralight"
        }, 
        { //wall 1
            "localPosition": {"x":4057.41357421875,"y":4140.462890625,"z":-3883.29052734375}, 
            "rotation": {"x":0,"y":0.8987940549850464,"z":0,"w":0.4383711516857147}, 
            "model": "muralight"
        }, 
        { //wall 2
            "localPosition": {"x":4054.44384765625,"y":4140.462890625,"z":-3880.97021484375}, 
            "rotation": {"x":0,"y":0.8987940549850464,"z":0,"w":0.4383711516857147}, 
            "model": "muralight"
        },
        { //wall 3
            "localPosition": {"x":4077.46142578125,"y":4140.462890625,"z":-3893.5830078125}, 
            "rotation": {"x":0,"y":0.8987940549850464,"z":0,"w":0.4383711516857147}, 
            "model": "muralight"
        },
        { //wall 4
            "localPosition": {"x":4080.820068359375,"y":4140.462890625,"z":-3896.20703125}, 
            "rotation": {"x":0,"y":0.8987940549850464,"z":0,"w":0.4383711516857147}, 
            "model": "muralight"
        },
        { //wall 5
            "localPosition": {"x":4083.8671875,"y":4140.462890625,"z":-3898.587646484375}, 
            "rotation": {"x":0,"y":0.8987940549850464,"z":0,"w":0.4383711516857147}, 
            "model": "muralight"
        },
        { //wall 6
            "localPosition": {"x":4087.34375,"y":4140.462890625,"z":-3901.303955078125}, 
            "rotation": {"x":0,"y":0.8987940549850464,"z":0,"w":0.4383711516857147}, 
            "model": "muralight"
        },
        { //wall 7
            "localPosition": {"x":4101.650390625,"y":4140.462890625,"z":-3918.918212890625}, 
            "rotation": {"x":0,"y":0.8987940549850464,"z":0,"w":0.4383711516857147}, 
            "model": "muralight"
        },
        { //Entance
            "localPosition": {"x":4101.01025390625,"y":4140.462890625,"z":-3909.70068359375}, 
            "rotation": {"x":0,"y":-0.32556819915771484,"z":0,"w":-0.9455186128616333}, 
            "model": "muralight"
        },
        { //EntanceAlley
            "localPosition": {"x":4103.47607421875,"y":4140.462890625,"z":-3902.359375}, 
            "rotation": {"x":0,"y":-0.32556819915771484,"z":0,"w":-0.9455186128616333}, 
            "model": "muralight"
        },
        { //EntanceAlleyTower
            "localPosition": {"x":4110.0869140625,"y":4140.462890625,"z":-3894.4541015625}, 
            "rotation": {"x":0,"y":-0.32556819915771484,"z":0,"w":-0.9455186128616333}, 
            "model": "muralight"
        },
        { //TowerFond
            "localPosition": {"x":4109.31005859375,"y":4140.462890625,"z":-3886.926513671875}, 
            "rotation": {"x":0,"y":-0.4383711814880371,"z":0,"w":0.8987941741943359}, 
            "model": "muralight"
        },
        { //Colonne
            "localPosition": {"x":4100.36083984375,"y":4140.462890625,"z":-3886.752197265625}, 
            "rotation": {"x":0,"y":0.9455186128616333,"z":0,"w":-0.32556819915771484}, 
            "model": "muralight"
        },
        { //Escalier to niv1
            "localPosition": {"x":4096.89111328125,"y":4141.302734375,"z":-3892.808349609375}, 
            "rotation": {"x":0,"y":0.9455186128616333,"z":0,"w":-0.32556819915771484}, 
            "model": "muralight"
        },
        { //Escalier to niv1 Haut palier
            "localPosition": {"x":4092.487548828125,"y":4145.279296875,"z":-3898.25439453125}, 
            "rotation": {"x":0,"y":0.9455186128616333,"z":0,"w":-0.32556819915771484}, 
            "model": "muralight"
        },
        { //Escalier to niv2 palier
            "localPosition": {"x":4106.42529296875,"y":4151.6884765625,"z":-3890.045654296875}, 
            "rotation": {"x":0,"y":-0.8987941741943359,"z":0,"w":-0.4383711814880371}, 
            "model": "muralight"
        },
        { //Inner Wall 1
            "localPosition": {"x":4085.146240234375,"y":4140.60986328125,"z":-3896.93212890625}, 
            "rotation": {"x":0,"y":-0.4383711814880371,"z":0,"w":0.8987941741943359}, 
            "model": "muralight"
        },
        { //Inner Wall 2
            "localPosition": {"x":4078.206298828125,"y":4140.60986328125,"z":-3891.361083984375}, 
            "rotation": {"x":0,"y":-0.4383711814880371,"z":0,"w":0.8987941741943359}, 
            "model": "muralight"
        },
        { //Inner Wall 3
            "localPosition": {"x":4065.640869140625,"y":4140.60986328125,"z":-3887.046142578125}, 
            "rotation": {"x":0,"y":-0.4383711814880371,"z":0,"w":0.8987941741943359}, 
            "model": "muralight"
        },
        { //Inner Wall 4
            "localPosition": {"x":4059.598876953125,"y":4140.60986328125,"z":-3882.171142578125}, 
            "rotation": {"x":0,"y":-0.4383711814880371,"z":0,"w":0.8987941741943359}, 
            "model": "muralight"
        },
        { //Inner Exit
            "localPosition": {"x":4063.948486328125,"y":4140.60986328125,"z":-3871.461181640625}, 
            "rotation": {"x":0,"y":0.8987941741943359,"z":0,"w":0.4383711814880371}, 
            "model": "muralight"
        },
        { //Out exit
            "localPosition": {"x":4056.022705078125,"y":4140.67431640625,"z":-3873.784423828125}, 
            "rotation": {"x":0,"y":0.9455186128616333,"z":0,"w":-0.32556819915771484}, 
            "model": "muralight"
        },
        { //Colomne 2
            "localPosition": {"x":4083.839111328125,"y":4140.67431640625,"z":-3875.439697265625}, 
            "rotation": {"x":0,"y":-0.8987941741943359,"z":0,"w":-0.4383711814880371}, 
            "model": "muralight"
        },
        {// balcony1
            "localPosition": {"x":4052.75341796875,"y":4139.6953125,"z":-3890.79638671875}, 
            "rotation": {"x":0,"y":0,"z":0,"w":1}, 
            "model": "torchere"
        },
        {// balcony2
            "localPosition": {"x":4064.64599609375,"y":4139.6962890625,"z":-3900.36669921875}, 
            "rotation": {"x":0,"y":0,"z":0,"w":1}, 
            "model": "torchere"
        },
        {// balcony3
            "localPosition": {"x":4086.66650390625,"y":4139.6962890625,"z":-3918.244384765625}, 
            "rotation": {"x":0,"y":0,"z":0,"w":1}, 
            "model": "torchere"
        },
        {// Niv 2 escalier
            "localPosition": {"x":4097.66845703125,"y":4148.13427734375,"z":-3902.943115234375}, 
            "rotation": {"x":0,"y":0,"z":0,"w":1}, 
            "model": "torchere"
        },
        {// Niv 2 to niv3
            "localPosition": {"x":4082.936767578125,"y":4152.76171875,"z":-3874.947998046875}, 
            "rotation": {"x":0,"y":0,"z":0,"w":1}, 
            "model": "torchere"
        },
        {// Niv 2 to niv3 palier
            "localPosition": {"x":4071.81787109375,"y":4159.3310546875,"z":-3865.83251953125}, 
            "rotation": {"x":0,"y":0,"z":0,"w":1}, 
            "model": "torchere"
        },
    ];
    
    var entitiesToDelete = [];
    this.preload = function(entityID) {
        var renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;
        var i, id, subId;
        for (i = 0; i < luminaires.length; i++) {
            if (luminaires[i].model === "torchere") {
                //TORCHERE
                id = Entities.addEntity({
                    "localPosition": Vec3.subtract(luminaires[i].localPosition, COORD_REFERENCE),
                    "rotation": luminaires[i].rotation,
                    "parentID": entityID,
                    "renderWithZones": renderWithZones,
                    "grab": {
                        "grabbable": false
                    },
                    "name": "TORCHERE [" + i + "]",
                    "type": "Model",
                    "dimensions": {
                        "x": 0.27416229248046875,
                        "y": 0.2719966173171997,
                        "z": 0.27416229248046875
                    },
                    "damping": 0,
                    "angularDamping": 0,
                    "modelURL": ROOT + "/models/torchere.fst",
                    "useOriginalPivot": true
                }, "local");
                
                subId = Entities.addEntity({
                    "name": "TORCHERE LIGHT [" + i + "]",
                    "type": "Light",
                    "localPosition": { "x": 0.0, "y": 0.0, "z": 0.0},
                    "parentID": id,
                    "renderWithZones": renderWithZones,
                    "grab": {
                        "grabbable": false
                    },
                    "dimensions": {
                        "x": 10,
                        "y": 10,
                        "z": 10
                    },
                    "color": {"red": 255, "green": 128, "blue": 0},
                    "intensity": LIGHT_INTENSITY,
                    "falloffRadius": LIGHT_INTENSITY/10,
                    "isSpotlight": false
                }, "local");
                flickers.push(subId);
            } else if (luminaires[i].model === "muralight") {
                //MURALIGHT
                id = Entities.addEntity({
                    "localPosition": Vec3.subtract(luminaires[i].localPosition, COORD_REFERENCE),
                    "rotation": luminaires[i].rotation,
                    "parentID": entityID,
                    "renderWithZones": renderWithZones,
                    "grab": {
                        "grabbable": false
                    },
                    "name": "MURALIGHT [" + i + "]",
                    "type": "Model",
                    "dimensions": {
                        "x": 0.2192804515361786,
                        "y": 0.4064638912677765,
                        "z": 0.3325210213661194
                    },
                    "damping": 0,
                    "angularDamping": 0,
                    "modelURL": ROOT + "/models/muralight.fst",
                    "useOriginalPivot": true
                }, "local");
                
                subId = Entities.addEntity({
                    "name": "TORCHERE LIGHT [" + i + "]",
                    "type": "Light",
                    "localPosition": { "x": 0.0, "y": 0.0, "z": 0.0},
                    "parentID": id,
                    "renderWithZones": renderWithZones,
                    "grab": {
                        "grabbable": false
                    },
                    "dimensions": {
                        "x": 7,
                        "y": 7,
                        "z": 7
                    },
                    "color": {"red": 255, "green": 128, "blue": 0},
                    "intensity": LIGHT_INTENSITY,
                    "falloffRadius": LIGHT_INTENSITY/10,
                    "isSpotlight": false
                }, "local");
                flickers.push(subId);
                
            }
            entitiesToDelete.push(id);
        }
        
        timer = Script.setInterval(function () {
            Entities.editEntity(flickers[currentFlicker], {"intensity": ((LIGHT_INTENSITY/2) + (Math.random() * LIGHT_INTENSITY))});
            currentFlicker++;
            if (currentFlicker >= flickers.length) {
                currentFlicker = 0;
            }
        }, 5);
    };

    this.unload = function(entityID) {
        var i;
        
        Script.clearInterval(timer);
        
        for (i=0; i < entitiesToDelete.length; i++) {
            Entities.deleteEntity(entitiesToDelete[i]);
            
        }
        entitiesToDelete = [];
        
    };

})
