//
//  astrobion.js
//
//  Created by Alezia Kurdis, July 14th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Generate a the ASTROBION components.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("astrobion.js")[0];
    var thisEntity;

    var channelComm = "ak.serverTimeService.overte";
    var deltaWithServerTime = 0;
    
    var generatorPosition;
    var renderWithZones;
    
    var D29_DAY_DURATION = 104400; //sec
    var DEGREES_TO_RADIANS = Math.PI / 180.0;

    var entitiesToDelete = [];

    function onMessageReceived(channel, message, sender, localOnly) {
        var messageToSent;
        var i;
        var displayText = "";
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if (data.action === "SERVER_TIME") {
                var today = new Date();
                deltaWithServerTime = today.getTime() - data.time;
            }
        }
    }

    this.preload = function(entityID) { 
        Workload.getConfig("controlViews")["regulateViewRanges"] = false;
        thisEntity = entityID;
        
        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);
        
        var messageToSend = {
            "action": "GET_SERVER_TIME"
        };
        Messages.sendMessage(channelComm, JSON.stringify(messageToSend));
        
        var prop = Entities.getEntityProperties(entityID, ["renderWithZones", "position"]);
        renderWithZones = prop.renderWithZones;
        generatorPosition = prop.position;
        
        //CORTEX####################################################
        var rotation = Quat.fromVec3Degrees( {
            "x": - GetCurrentCycleValue(360, 1500),
            "y": GetCurrentCycleValue(360, 300),
            "z": - GetCurrentCycleValue(360, 900)
        } );
        
        var id = Entities.addEntity({
            "type": "Model",
            "position": generatorPosition,
            "name": "CORTEX",
            "dimensions": {
                "x": 1034.142578125,
                "y": 1056.9639892578125,
                "z": 1011.7808837890625
            },
            "rotation": rotation,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularVelocity": {
                "x": -0.24 * (Math.PI / 180),
                "y": 1.2 * (Math.PI / 180),
                "z": -0.4 * (Math.PI / 180)
            },
            "damping": 0,
            "angularDamping": 0,
            "modelURL": ROOT + "models/CORTEX.fst",
            "useOriginalPivot": true,
            "lifetime": 864000
        }, "local");
        entitiesToDelete.push(id);

        var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
        var antiHue = hue - 0.5;
        if (antiHue < 0) {
            antiHue = antiHue + 1;
        }
        var colorArray = hslToRgb(antiHue, 1, 0.6);
        var color ={"red": colorArray[0], "green": colorArray[1], "blue": colorArray[2]}
        
        var eyeID = Entities.addEntity({
            "type": "Shape",
            "shape": "Sphere",
            "name": "Cortex - lightBulb",
            "dimensions": {"x":200,"y":200,"z":200},
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "localRotation": {"x":0.2299824208021164,"y":-0.12234975397586823,"z":0.021027235314249992,"w":0.9652442932128906},
            "parentID": id,
            "visible": true,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "lifetime": 25200
        }, "local");

        var lightOfBulbID = Entities.addEntity({
            "parentID": eyeID,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "localRotation": Quat.fromVec3Degrees({"x": 0.0, "y": 0.0, "z": 0.0}),
            "name": "Cortex - bulb-light",
            "grab": {
                "grabbable": false
            },
            "type": "Light",
            "dimensions": {
                "x": 6000.0,
                "y": 6000.0,
                "z": 6000.0
            },
            "color": color,
            "intensity": 300,
            "falloffRadius": 100,
            "isSpotlight": true,
            "visible": true,
            "exponent": 1,
            "cutoff": 20
        },"local");
        
        var sumColorCompnent = (color.red/255) +(color.green/255) +(color.blue/255);
        if (sumColorCompnent === 0) { 
            sumColorCompnent = 0.001; 
        }
        var bloomFactor = 9 / sumColorCompnent;

        var materialContent = {
            "materialVersion": 1,
            "materials": [
                    {
                        "name": "bulb",
                        "albedo": [1, 1, 1],
                        "metallic": 1,
                        "roughness": 1,
                        "opacity": 1,
                        "emissive": [(color.red/255) * bloomFactor, (color.green/255) * bloomFactor, (color.blue/255) * bloomFactor],
                        "scattering": 0,
                        "unlit": false,
                        "cullFaceMode": "CULL_NONE",
                        "model": "hifi_pbr"
                    }
                ]
            };
        
        var materialID = Entities.addEntity({
            "type": "Material",
            "parentID": eyeID,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": 0.0, "y": 0.2, "z": 0.0},
            "name": "Cortex - bulb-material",
            "materialURL": "materialData",
            "priority": 1,
            "materialData": JSON.stringify(materialContent)
        },"local");
        
        //BRAINSTORMER #####################################
        rotation = Quat.fromVec3Degrees( {
            "x": GetCurrentCycleValue(360, 800),
            "y": GetCurrentCycleValue(360, 1200),
            "z": GetCurrentCycleValue(360, 360)
        } );
        
        id = Entities.addEntity({
            "type": "Model",
            "position": generatorPosition,
            "name": "BRAINSTORMER",
            "dimensions": {
                "x": 1570.51318359375,
                "y": 1656.6041259765625,
                "z": 1178.34814453125
            },
            "rotation": rotation,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularVelocity": {
                "x": 0.45 * (Math.PI / 180),
                "y": 0.3 * (Math.PI / 180),
                "z": 1 * (Math.PI / 180)
            },
            "damping": 0,
            "angularDamping": 0,
            "modelURL": ROOT + "models/BRAINSTORMER.fst",
            "useOriginalPivot": true,
            "lifetime": 864000
        }, "local");
        entitiesToDelete.push(id);
        
        var REF_TO_LOCAL = {"x":-6000.0,"y":-6000.0,"z":6000.0};
        var brainStormerFXitems = [
            {"x":-6523.65185546875,"y":-6252.66357421875,"z":5863.2998046875},
            {"x":-6364.509765625,"y":-6411.6865234375,"z":5737.97216796875},
            {"x":-6165.146484375,"y":-6493.96728515625,"z":5625.50830078125},
            {"x":-5918.11962890625,"y":-6530.72314453125,"z":5530.26953125},
            {"x":-5752.7841796875,"y":-6536.85107421875,"z":5586.0810546875},
            {"x":-5623.40625,"y":-6547.390625,"z":5743.275390625},
            {"x":-5609.91796875,"y":-6547.3251953125,"z":5955.46337890625},
            {"x":-5728.08740234375,"y":-6532.248046875,"z":6149.74365234375},
            {"x":-5894.54052734375,"y":-6504.34716796875,"z":6341.0390625},
            {"x":-6119.9755859375,"y":-6457.1640625,"z":6442.80908203125},
            {"x":-6321.90478515625,"y":-6344.28466796875,"z":6440.21826171875},
            {"x":-6437.2236328125,"y":-6141.759765625,"z":6427.4365234375},
            {"x":-6571.537109375,"y":-5993.93310546875,"z":6309.36767578125},
            {"x":-6667.29052734375,"y":-5842.5576171875,"z":6196.18505859375},
            {"x":-6586.6416015625,"y":-5686.15673828125,"z":5977.046875},
            {"x":-6690.0625,"y":-6020.0361328125,"z":5987.51513671875},
            {"x":-6484.904296875,"y":-5574.38330078125,"z":5771.2802734375},
            {"x":-6313.33203125,"y":-5487.8271484375,"z":5579.14697265625},
            {"x":-6139.7109375,"y":-5424.9853515625,"z":5564.5498046875},
            {"x":-5983.41845703125,"y":-5363.4970703125,"z":5651.49462890625},
            {"x":-5917.63134765625,"y":-5346.23779296875,"z":5794.76220703125},
            {"x":-5953.525390625,"y":-5350.66064453125,"z":5977.197265625},
            {"x":-6047.69970703125,"y":-5380.2373046875,"z":6122.52880859375},
            {"x":-6125.5400390625,"y":-5417.01123046875,"z":6264.6005859375},
            {"x":-6276.671875,"y":-5542.47998046875,"z":6302.60546875},
            {"x":-6451.42822265625,"y":-5647.61181640625,"z":6372.61474609375},
            {"x":-6601.71923828125,"y":-5771.14892578125,"z":6411.47216796875}
        ];
        var i, bsID;
        for (i = 0; i < brainStormerFXitems.length; i++) {
            bsID = Entities.addEntity({
                "type": "ParticleEffect",
                "dimensions": {
                    "x": 960,
                    "y": 960,
                    "z": 960
                },
                "shapeType": "ellipsoid",
                "color": {
                    "red": 255,
                    "green": 220,
                    "blue": 105
                },
                "alpha": 0.03,
                "textures": ROOT + "images/fog.png",
                "lifespan": 10,
                "emitRate": 100,
                "emitSpeed": 0,
                "speedSpread": 20,
                "emitOrientation": {
                    "x": 0,
                    "y": 0,
                    "z": 0,
                    "w": 1
                },
                "emitDimensions": {
                    "x": 100,
                    "y": 100,
                    "z": 100
                },
                "emitRadiusStart": 0.3,
                "polarFinish": 3.1415927410125732,
                "emitAcceleration": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "particleRadius": 90,
                "radiusSpread": 30,
                "radiusStart": 60,
                "radiusFinish": 180,
                "colorStart": {
                    "red": 255,
                    "green": 255,
                    "blue": 255
                },
                "colorFinish": {
                    "red": 255,
                    "green": 255,
                    "blue": 255
                },
                "alphaSpread": 0.019999999552965164,
                "alphaStart": 0,
                "alphaFinish": 0,
                "spinSpread": 1.0499999523162842,
                "spinStart": -1.0499999523162842,
                "spinFinish": 1.0499999523162842,
                "rotateWithEntity": true,
                "localPosition": Vec3.subtract(brainStormerFXitems[i], REF_TO_LOCAL),
                "parentID": id,
                "name": "BRAIN-STORM " + i,
                "renderWithZones": renderWithZones,
                "grab": {
                    "grabbable": false
                },
                "visible": true,
                "script": ROOT + "storm.js"
            }, "local");
        }
        
        //BONE-1 #####################################
        rotation = Quat.fromVec3Degrees( {
            "x": GetCurrentCycleValue(360, 720),
            "y": 0,
            "z": 0
        } );
        
        id = Entities.addEntity({
            "type": "Model",
            "position": generatorPosition,
            "name": "BONE-1",
            "dimensions": {"x":803.9321899414062,"y":2610.29931640625,"z":2660.913330078125},
            "rotation": rotation,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularVelocity": {
                "x": 0.5 * (Math.PI / 180),
                "y": 0 * (Math.PI / 180),
                "z": 0 * (Math.PI / 180)
            },
            "damping": 0,
            "angularDamping": 0,
            "modelURL": ROOT + "models/BONE-1.fst",
            "useOriginalPivot": true,
            "lifetime": 864000
        }, "local");
        entitiesToDelete.push(id);
        
        //NUTRI #####################################
        rotation = Quat.fromVec3Degrees( {
            "x": GetCurrentCycleValue(360, 1800),
            "y": GetCurrentCycleValue(360, 1125),
            "z": GetCurrentCycleValue(360, 600)
        } );
        
        id = Entities.addEntity({
            "type": "Model",
            "position": generatorPosition,
            "name": "NUTRI",
            "dimensions": {"x":7277.0830078125,"y":3185.648681640625,"z":7616.95703125},
            "rotation": rotation,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularVelocity": {
                "x": 0.2 * (Math.PI / 180),
                "y": 0.32 * (Math.PI / 180),
                "z": 0.6 * (Math.PI / 180)
            },
            "damping": 0,
            "angularDamping": 0,
            "modelURL": ROOT + "models/NUTRI.fst",
            "useOriginalPivot": true,
            "lifetime": 864000
        }, "local");
        entitiesToDelete.push(id);
        
        //??? vapor point??? here?
        
        //ORGANEL########################################
        rotation = Quat.fromVec3Degrees( {
            "x": GetCurrentCycleValue(360, 450),
            "y": GetCurrentCycleValue(360, 2000),
            "z": GetCurrentCycleValue(360, 1500)
        } );
        
        id = Entities.addEntity({
            "type": "Model",
            "position": generatorPosition,
            "name": "ORGANEL",
            "dimensions": {"x":5346.357421875,"y":5301.4794921875,"z":1278.0474853515625},
            "rotation": rotation,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "angularVelocity": {
                "x": 0.8 * (Math.PI / 180),
                "y": 0.18 * (Math.PI / 180),
                "z": 0.24 * (Math.PI / 180)
            },
            "damping": 0,
            "angularDamping": 0,
            "modelURL": ROOT + "models/ORGANEL.fst",
            "useOriginalPivot": true,
            "lifetime": 864000
        }, "local");
        entitiesToDelete.push(id);
        
        //??? vapor point??? here?
        
        //BUCAL ###########################################
        //??? here or in json cause we want it physical???
    }


    this.unload = function(entityID) {
        var i;
        for (i = 0; i < entitiesToDelete.length; i++ ) {
            Entities.deleteEntity(entitiesToDelete[i]);
        }
        entitiesToDelete = [];

        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(channelComm);
        
        Workload.getConfig("controlViews")["regulateViewRanges"] = true;
    };

    /*
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h, s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   {number}  h       The hue
     * @param   {number}  s       The saturation
     * @param   {number}  l       The lightness
     * @return  {Array}           The RGB representation
     */
    function hslToRgb(h, s, l){
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = (today.getTime()- deltaWithServerTime)/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}

})
