//
//  streetLights.js
//
//  Created by Alezia Kurdis, October 26th, 2023.
//  Copyright 2023, Overte e.V.
//
//  Street Lights generator for the CEON scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("streetLights.js")[0];
    var COORD_REFERENCE = {"x": 4000, "y": 4000, "z": 4000};
    var localPositions = [
        {"x":3965.537353515625,"y":3997.328857421875,"z":3996.233154296875}, //poles
        {"x":3973.868408203125,"y":3997.328857421875,"z":4001.27978515625},
        {"x":3988.75341796875,"y":3997.328857421875,"z":4001.27978515625},
        {"x":4011.181640625,"y":3997.328857421875,"z":3998.645751953125},
        {"x":4022.7724609375,"y":3997.328857421875,"z":3993.577392578125},
        {"x":4020.814208984375,"y":3997.328857421875,"z":3977.77001953125},
        {"x":4020.814208984375,"y":3997.328857421875,"z":3962.255859375},
        {"x":4007.5458984375,"y":3997.328857421875,"z":3949.8076171875},
        {"x":3999.577392578125,"y":3997.328857421875,"z":3967.605712890625},
        {"x":3989.285888671875,"y":3997.328857421875,"z":3959.0087890625},
        {"x":3975.41796875,"y":3997.328857421875,"z":3948.828369140625},
        {"x":3962.45703125,"y":3997.328857421875,"z":3965.427490234375},
        {"x":3971.734375,"y":3997.328857421875,"z":3979.51123046875},
        {"x":3972.101806640625,"y":3989.76318359375,"z":3991.4072265625}, //plafoniers
        {"x":3972.101806640625,"y":3989.76318359375,"z":3965.470947265625},
        {"x":4023.176025390625,"y":3989.76318359375,"z":3965.470947265625},
        {"x":4003.42626953125,"y":3989.76318359375,"z":3965.470947265625},
        {"x":4003.42626953125,"y":3989.76318359375,"z":3998.661376953125},
        {"x":3990.959716796875,"y":3989.76318359375,"z":4007.955322265625}
    ];
    
    var lights = [];
    this.preload = function(entityID) {
        var renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;
        var i, id;
        for (i=0; i < localPositions.length; i++) {
            id = Entities.addEntity({
                "type": "Light",
                "name": "street-light",
                "dimensions": {
                    "x": 32.485660552978516,
                    "y": 32.485660552978516,
                    "z": 33.631629943847656
                },
                "rotation": {
                    "x": 0.7071068286895752,
                    "y": 0,
                    "z": 0,
                    "w": -0.7071068286895752
                },
                "localPosition": Vec3.subtract(localPositions[i], COORD_REFERENCE),
                "parentID": entityID,
                "renderWithZones": renderWithZones,
                "grab": {
                    "grabbable": false
                },
                "collisionless": true,
                "ignoreForCollisions": true,
                "color": {
                    "red": 255,
                    "green": 196,
                    "blue": 148
                },
                "isSpotlight": true,
                "intensity": 15,
                "exponent": 1,
                "cutoff": 75,
                "falloffRadius": 1.5
            }, "local");
            
            lights.push(id);
        }
    };

    this.unload = function(entityID) {
        var i;
        for (i=0; i < lights.length; i++) {
            Entities.deleteEntity(lights[i]);
            
        }
        lights = [];
    };    

})
