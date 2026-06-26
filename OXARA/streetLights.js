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
    const ROOT = Script.resolvePath('').split("streetLights.js")[0];
    const COORD_REFERENCE = {"x": 5000, "y": -5000, "z": 5000};
    let lightEntries = [
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
        {"name": "OTH-JCT", "lightType": "STREETPOLE", "position": {"x":4879.212890625,"y":-5004.38037109375,"z":4877.05322265625}},
        {"name": "LOR1", "lightType": "STREETPOLE", "position": {"x":4827.07958984375,"y":-5009.85791015625,"z":4908.26806640625}},
        {"name": "LOR2", "lightType": "STREETPOLE", "position": {"x":4802.0595703125,"y":-5010.26953125,"z":4918.01513671875}},
        {"name": "LOR3", "lightType": "STREETPOLE", "position": {"x":4791.6708984375,"y":-5014.74560546875,"z":4936.806640625}},
        {"name": "LOR4", "lightType": "STREETPOLE", "position": {"x":4788.31982421875,"y":-5020.72412109375,"z":4955.56494140625}},
        {"name": "TAL-JCT", "lightType": "STREETPOLE", "position": {"x":4789.1171875,"y":-5020.98486328125,"z":4972.47265625}},
        {"name": "TAL1", "lightType": "STREETPOLE", "position": {"x":4824.23388671875,"y":-5025.5625,"z":4942.7578125}},
        {"name": "TAL2", "lightType": "STREETPOLE", "position": {"x":4853.2529296875,"y":-5025.5458984375,"z":4921.40234375}},
        {"name": "TAL3", "lightType": "STREETPOLE", "position": {"x":4888.66748046875,"y":-5015.74365234375,"z":4931.76025390625}},
        {"name": "TAL4", "lightType": "STREETPOLE", "position": {"x":4919.216796875,"y":-5008.4208984375,"z":4931.92333984375}},
        {"name": "TAL5", "lightType": "STREETPOLE", "position": {"x":4946.98486328125,"y":-5006.23681640625,"z":4945.27001953125}},
        {"name": "OTY1", "lightType": "STREETPOLE", "position": {"x":4945.9580078125,"y":-5011.95849609375,"z":4807.6923828125}},
        {"name": "OTY2", "lightType": "STREETPOLE", "position": {"x":4930.83203125,"y":-5011.97021484375,"z":4796.38671875}},
        {"name": "OTY3", "lightType": "STREETPOLE", "position": {"x":4930.85546875,"y":-5014.97509765625,"z":4772.59375}},
        {"name": "OTY4", "lightType": "STREETPOLE", "position": {"x":4949.5341796875,"y":-5021.05712890625,"z":4764.466796875}},
        {"name": "LORW-JCT", "lightType": "STREETPOLE", "position": {"x":4727.3115234375,"y":-5013.1240234375,"z":4956.76904296875}},
        {"name": "LORW", "lightType": "STREETPOLE", "position": {"x":4739.4443359375,"y":-5011.01513671875,"z":4943.5302734375}},
        {"name": "DAL1", "lightType": "STREETPOLE", "position": {"x":4703.677734375,"y":-5003.1455078125,"z":4923.978515625}},
        {"name": "DAL2", "lightType": "STREETPOLE", "position": {"x":4708.0634765625,"y":-5003.15869140625,"z":4903.6484375}},
        {"name": "DAL3", "lightType": "STREETPOLE", "position": {"x":4723.50830078125,"y":-4999.86181640625,"z":4898.345703125}},
        {"name": "DAL4", "lightType": "STREETPOLE", "position": {"x":4716.14501953125,"y":-4996.11376953125,"z":4854.59423828125}},
        {"name": "DAL5", "lightType": "STREETPOLE", "position": {"x":4694.70361328125,"y":-4996.11328125,"z":4817.80078125}},
        {"name": "ARR-ALPHA", "lightType": "STREETPOLE", "position": {"x":4667.39404296875,"y":-4996.1181640625,"z":4784.2568359375}},
        {"name": "TUN-1", "lightType": "TUNEL", "position": {"x":4879.12060546875,"y":-5005.2275390625,"z":4861.25927734375}},
        {"name": "TUN-2", "lightType": "TUNEL", "position": {"x":4895.11572265625,"y":-5005.2529296875,"z":4839.56884765625}},
        {"name": "TUN-3", "lightType": "TUNEL", "position": {"x":4924.30126953125,"y":-5010.13623046875,"z":4834.3857421875}},
        {"name": "TUN-4", "lightType": "TUNEL", "position": {"x":4936.04931640625,"y":-5012.185546875,"z":4822.0576171875}},
        {"name": "TUN-5", "lightType": "TUNEL", "position": {"x":4927.5302734375,"y":-5019.970703125,"z":4753.12109375}},
        {"name": "TUN-6", "lightType": "TUNEL", "position": {"x":4926.75048828125,"y":-5023.03369140625,"z":4772.72216796875}},
        {"name": "TUN-7", "lightType": "TUNEL", "position": {"x":4949.634765625,"y":-5023.1357421875,"z":4752.93115234375}},
        {"name": "TUN-8", "lightType": "TUNEL", "position": {"x":4927.326171875,"y":-5027.93115234375,"z":4731.19873046875}}
    ];

    let lights = [];
    this.preload = function(entityID) {
        let renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;
        let i, id; 
        let properties;
        for (i=0; i < lightEntries.length; i++) {
            properties = null;
            if (lightEntries[i].lightType === "STREETPOLE" || lightEntries[i].lightType === "TUNEL" ) {
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
            
            if (properties !== null) {
                id = Entities.addEntity(properties, "local");
                lights.push(id);
            }
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
