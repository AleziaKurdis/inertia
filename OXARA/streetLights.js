//
//  streetLights.js
//
//  Created by Alezia Kurdis, June 23th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Street Lights generator for the OXARA scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("streetLights.js")[0];
    var COORD_REFERENCE = {"x": 5000, "y": -5000, "z": 5000};
    var lightEntries = [
        {"name": "ARRIVAL-OMEGA", "lightType": "STREETPOLE", "position": {"x":5284.4130859375,"y":-5010.12841796875,"z":5288.4609375}},
        {"name": "L1", "lightType": "STREETPOLE", "position": {"x":5244.9970703125,"y":-5017.3466796875,"z":5282.66943359375}},
        {"name": "L2", "lightType": "STREETPOLE", "position": {"x":5206.603515625,"y":-5021.72314453125,"z":5284.2080078125}},
        {"name": "L3", "lightType": "STREETPOLE", "position": {"x":5177.00927734375,"y":-5019.490234375,"z":5264.2958984375}},
        {"name": "L4", "lightType": "STREETPOLE", "position": {"x":5166.02685546875,"y":-5018.2607421875,"z":5227.4189453125}},
        {"name": "NOR-JCT", "lightType": "STREETPOLE", "position": {"x":5165.25830078125,"y":-5016.14404296875,"z":5195.173828125}},
        {"name": "NOR1", "lightType": "STREETPOLE", "position": {"x":5141.083984375,"y":-5016.1884765625,"z":5194.63623046875}},
        {"name": "NOR2", "lightType": "STREETPOLE", "position": {"x":5147.45703125,"y":-5016.3828125,"z":5204.50146484375}},
        {"name": "NOR3", "lightType": "STREETPOLE", "position": {"x":5141.04833984375,"y":-5016.42919921875,"z":5227.52392578125}},
        {"name": "WELL1-JCT", "lightType": "STREETPOLE", "position": {"x":5149.6171875,"y":-5012.451171875,"z":5148.36279296875}},
        {"name": "WELL1-1", "lightType": "STREETPOLE", "position": {"x":5173.75927734375,"y":-5013.72265625,"z":5127.75634765625}},
        {"name": "L5", "lightType": "STREETPOLE", "position": {"x":5143.26416015625,"y":-5017.56005859375,"z":5118.0791015625}},
        {"name": "T1", "lightType": "STREETPOLE", "position": {"x":5140.076171875,"y":-5015.5771484375,"z":5088.33984375}},
        {"name": "TER-L6", "lightType": "STREETPOLE", "position": {"x":5128.5498046875,"y":-5014.22021484375,"z":5064.97802734375}},
        {"name": "TER-L7", "lightType": "STREETPOLE", "position": {"x":5110.91845703125,"y":-5014.20166015625,"z":5050.517578125}},
        {"name": "TER-L8", "lightType": "STREETPOLE", "position": {"x":5087.107421875,"y":-5014.3525390625,"z":5034.529296875}},
        {"name": "KOR-JCT", "lightType": "STREETPOLE", "position": {"x":5103.998046875,"y":-5012.4658203125,"z":5002.03173828125}},
        {"name": "KE1", "lightType": "STREETPOLE", "position": {"x":5124.3359375,"y":-5010.234375,"z":5006.7021484375}},
        {"name": "KE2", "lightType": "STREETPOLE", "position": {"x":5132.90283203125,"y":-5006.2236328125,"z":5017.24072265625}},
        {"name": "KE3", "lightType": "STREETPOLE", "position": {"x":5159.6845703125,"y":-5000.93603515625,"z":5024.068359375}},
        {"name": "KE4", "lightType": "STREETPOLE", "position": {"x":5178.60986328125,"y":-5001.70947265625,"z":5038.59033203125}},
        {"name": "KW1", "lightType": "STREETPOLE", "position": {"x":5100.60693359375,"y":-5007.685546875,"z":4987.00048828125}},
        {"name": "KW2", "lightType": "STREETPOLE", "position": {"x":5089.29150390625,"y":-5008.68115234375,"z":4971.93408203125}},
        {"name": "KW3", "lightType": "STREETPOLE", "position": {"x":5077.853515625,"y":-5008.66015625,"z":4979.82421875}},
        {"name": "SURF", "lightType": "STREETPOLE", "position": {"x":5065.083984375,"y":-5004.56298828125,"z":4950.52001953125}},
        {"name": "KW4", "lightType": "STREETPOLE", "position": {"x":5062.4267578125,"y":-5013.20361328125,"z":4975.857421875}},
        {"name": "KW5", "lightType": "STREETPOLE", "position": {"x":5046.31396484375,"y":-5014.7451171875,"z":4963.92529296875}},
        {"name": "KW6", "lightType": "STREETPOLE", "position": {"x":5016.62158203125,"y":-5014.56689453125,"z":4946.7724609375}},
        {"name": "KW7", "lightType": "STREETPOLE", "position": {"x":4993.39697265625,"y":-5007.00927734375,"z":4933.55810546875}},
        {"name": "L9", "lightType": "STREETPOLE", "position": {"x":4949.8173828125,"y":-5007.03466796875,"z":4901.4501953125}},
        {"name": "L10", "lightType": "STREETPOLE", "position": {"x":4917.92529296875,"y":-5006.54296875,"z":4882.9970703125}},
        {"name": "OTH-JCT", "lightType": "STREETPOLE", "position": {"x":4879.212890625,"y":-5004.38037109375,"z":4877.05322265625}}
    ];
    
    var lights = [];
    this.preload = function(entityID) {
        var renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;
        var i, id, properties;
        for (i=0; i < lightEntries.length; i++) {
            if (lightEntries[i].lightType === "STREETPOLE") {
                properties = {
                    "type": "Light",
                    "name": lightEntries[i].lightType + " " + lightEntries[i].name,
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
                    "localPosition": Vec3.subtract(lightEntries[i].position, COORD_REFERENCE),
                    "parentID": entityID,
                    "renderWithZones": renderWithZones,
                    "grab": {
                        "grabbable": false
                    },
                    "collisionless": true,
                    "ignoreForCollisions": true,
                    "color": {
                        "red": 255,
                        "green": 205,
                        "blue": 148
                    },
                    "isSpotlight": true,
                    "intensity": 15,
                    "exponent": 1,
                    "cutoff": 75,
                    "falloffRadius": 1.5
                };
            }
            
            id = Entities.addEntity(properties, "local");
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
