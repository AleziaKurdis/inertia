//
//  auditorium.js
//
//  Created by Alezia Kurdis, June 3rd, 2025.
//  Copyright 2025, Overte e.V.
//
//  auditorium generated elements for the CEON scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("auditorium.js")[0];
    var D29_DAY_DURATION = 104400; //sec
    var COORD_REFERENCE = {"x": 4000, "y": 4000, "z": 4000};
    var audienceLights = [
        { "localPosition": {"x":4028.1669921875,"y":3994.126953125,"z":4000.596923828125}, "dimensionsScaleFactor": 1.3}, //far wall
        { "localPosition": {"x":4032.249267578125,"y":3995.49365234375,"z":4002.78515625}, "dimensionsScaleFactor": 1.0}, //p1 coin
        { "localPosition": {"x":4032.144287109375,"y":3995.49365234375,"z":4007.705810546875}, "dimensionsScaleFactor": 1.0}, //p2
        { "localPosition": {"x":4027.203125,"y":3995.49365234375,"z":4013.000732421875}, "dimensionsScaleFactor": 1.0}, //p3
        { "localPosition": {"x":4022.2568359375,"y":3995.49365234375,"z":4013.358642578125}, "dimensionsScaleFactor": 1.0}, //p4
        { "localPosition": {"x":4020.186767578125,"y":3994.126953125,"z":4009.3759765625}, "dimensionsScaleFactor": 1.3}, //wall 1 x1.3
        { "localPosition": {"x":4019.093994140625,"y":3994.126953125,"z":4013.29736328125}, "dimensionsScaleFactor": 1.3}, //wall 2 x1.3
        { "localPosition": {"x":4017.780029296875,"y":3994.60791015625,"z":4008.8525390625}, "dimensionsScaleFactor": 1.8}, //door x1.8
        { "localPosition": {"x":4031.945068359375,"y":3994.126953125,"z":4000.545654296875}, "dimensionsScaleFactor": 1.3} //far entry x 0.5
    ];
    
    var zoneID = Uuid.NONE;
    this.preload = function(entityID) {
        var renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;
        //Create a visibility zone
        zoneID = Entities.addEntity({
            "type": "Zone",
            "name": "AUDITORIUM-VISIBILITY_ZONE",
            "localPosition": {
                "x": 23.6450,
                "y": 0.09769,
                "z": 11.7122
            },
            "dimensions": {"x":47.31103515625,"y":18.260009765625,"z":35.173095703125},
            "parentID": entityID,
            "grab": {
                "grabbable": false
            },
            "shapeType": "box",
            "keyLight": {
                "direction": {
                    "x": 0,
                    "y": -0.7071067690849304,
                    "z": 0.7071067690849304
                },
                "castShadows": true
            },
            "lifetime": 25200
        }, "local");
        
        //wall lights
        var i, id;
        for (i=0; i < audienceLights.length; i++) {
            id = Entities.addEntity({
                "type": "Light",
                "name": "auditorium-light",
                "dimensions": Vec3.multiply({"x": 7, "y": 7, "z": 7}, audienceLights[i].dimensionsScaleFactor),
                "rotation": {
                    "x": 0.7071068286895752,
                    "y": 0,
                    "z": 0,
                    "w": -0.7071068286895752
                },
                
                "localPosition": Vec3.subtract(Vec3.subtract(audienceLights[i].localPosition, COORD_REFERENCE),{"x": 23.6450,"y": 0.09769,"z": 11.7122}),
                "parentID": zoneID,
                "renderWithZones": [zoneID],
                "grab": {
                    "grabbable": false
                },
                "collisionless": true,
                "ignoreForCollisions": true,
                "color": {
                    "red": 255,
                    "green": 171,
                    "blue": 97
                },
                "isSpotlight": true,
                "intensity": 9,
                "exponent": 1,
                "cutoff": 50,
                "falloffRadius": 1.5,
                "lifetime": 25200
            }, "local");
            
        }
        
        //scene lights
        id = Entities.addEntity({
            "type": "Light",
            "name": "SCENE_MAIN_LIGHT",
            "dimensions": {
                "x": 6,
                "y": 6,
                "z": 12
            },
            "rotation": {
                "x": 0.7071068286895752,
                "y": 0,
                "z": 0,
                "w": -0.7071068286895752
            },
            "isSpotlight": true,
            "intensity": 10,
            "exponent": 1,
            "cutoff": 30,
            "falloffRadius": 2,
            "parentID": zoneID,
            "renderWithZones": [zoneID],
            "grab": {
                "grabbable": false
            },
            "localPosition": {"x": 0.4888, "y": -4.2073, "z": -6.5605},
            "lifetime": 25200
        }, "local");
        
        id = Entities.addEntity({
            "type": "Light",
            "name": "SCENE_FRONT_LIGHT 1",
            "dimensions": {"x":8.0,"y":8.0,"z":8.0},
            "isSpotlight": false,
            "intensity": 6.0,
            "exponent": 1,
            "cutoff": 30,
            "falloffRadius": 1.0,
            "parentID": zoneID,
            "renderWithZones": [zoneID],
            "grab": {
                "grabbable": false
            },
            "localPosition": {"x": 0.1165, "y": -6.9021, "z": -4.6587},
            "lifetime": 25200
        }, "local");

        id = Entities.addEntity({
            "type": "Light",
            "name": "SCENE_FRONT_LIGHT 2",
            "dimensions": {"x":8.0,"y":8.0,"z":8.0},
            "isSpotlight": false,
            "intensity": 6.0,
            "exponent": 1,
            "cutoff": 30,
            "falloffRadius": 1.0,
            "parentID": zoneID,
            "renderWithZones": [zoneID],
            "grab": {
                "grabbable": false
            },
            "localPosition": {"x": 1.8984, "y": -6.9021, "z": -5.0847},
            "lifetime": 25200
        }, "local");

        id = Entities.addEntity({
            "type": "Light",
            "name": "SCENE_FRONT_LIGHT 3",
            "dimensions": {"x":8.0,"y":8.0,"z":8.0},
            "isSpotlight": false,
            "intensity": 6.0,
            "exponent": 1,
            "cutoff": 30,
            "falloffRadius": 1.0,
            "parentID": zoneID,
            "renderWithZones": [zoneID],
            "grab": {
                "grabbable": false
            },
            "localPosition": {"x": 2.3335, "y": -6.9021, "z": -7.5825},
            "lifetime": 25200
        }, "local");
        
        //LUTRINS LIGHTS
        id = Entities.addEntity({
            "type": "Light",
            "name": "LUTRIN 1",
            "dimensions": {"x":3,"y":3,"z":3},
            "isSpotlight": false,
            "intensity": 7.0,
            "exponent": 1,
            "cutoff": 30,
            "falloffRadius": 1.0,
            "parentID": zoneID,
            "renderWithZones": [zoneID],
            "grab": {
                "grabbable": false
            },
            "localPosition": Vec3.subtract({"x": 28.9380, "y": -6.7698, "z": 5.3738}, {"x": 23.6450,"y": 0.09769,"z": 11.7122}),
            "lifetime": 25200,
            "color": {
                "red": 255,
                "green": 171,
                "blue": 97
            }
        }, "local");
        
        id = Entities.addEntity({
            "type": "Light",
            "name": "LUTRIN 2",
            "dimensions": {"x":3,"y":3,"z":3},
            "isSpotlight": false,
            "intensity": 7.0,
            "exponent": 1,
            "cutoff": 30,
            "falloffRadius": 1.0,
            "parentID": zoneID,
            "renderWithZones": [zoneID],
            "grab": {
                "grabbable": false
            },
            "localPosition": Vec3.subtract({"x": 24.6475, "y": -6.7698, "z": 9.9131},{"x": 23.6450,"y": 0.09769,"z": 11.7122}),
            "lifetime": 25200,
            "color": {
                "red": 255,
                "green": 171,
                "blue": 97
            }
        }, "local");
        
        //circle
        var hue = GetCurrentCycleValue(1, D29_DAY_DURATION * 9);
        var color = hslToRgb(hue, 1.0, 0.35);
        id = Entities.addEntity({
            "type": "Shape",
            "name": "CIRCLE",
            "dimensions": {
                "x": 4.400000095367432,
                "y": 0.03886719048023224,
                "z": 4.400000095367432
            },
            "parentID": zoneID,
            "renderWithZones": [zoneID],
            "grab": {
                "grabbable": false
            },
            "shape": "Cylinder",
            "color": {
                "red": color[0],
                "green": color[1],
                "blue": color[2]
            },
            "localPosition": {"x": 0.4888, "y": -8.0408, "z": -6.5605},
            "lifetime": 25200
        }, "local");
        
        //back light
        var goldenHue = hue + 0.618;
        if (goldenHue >= 1.0) { 
            goldenHue = goldenHue - 1.0;
        }
        color = hslToRgb(goldenHue, 1.0, 0.35);
        
        id = Entities.addEntity({
            "type": "Light",
            "name": "BackLight",
            "dimensions": {
                "x": 44.168922424316406,
                "y": 44.168922424316406,
                "z": 44.85029983520508
            },
            "localRotation": {
                "x": 0.8335155844688416,
                "y": -0.18009650707244873,
                "z": -0.2768820524215698,
                "w": 0.44289180636405945
            },
            "parentID": zoneID,
            "renderWithZones": [zoneID],
            "grab": {
                "grabbable": false
            },
            "localPosition": Vec3.subtract(Vec3.subtract({"x":4033.091796875,"y":3990.1416015625,"z":4017.246826171875}, COORD_REFERENCE),{"x": 23.6450,"y": 0.09769,"z": 11.7122}),
            "lifetime": 25200,
            "color": {
                "red": color[0],
                "green": color[1],
                "blue": color[2]
            },
            "isSpotlight": true,
            "intensity": 30,
            "exponent": 1,
            "cutoff": 80,
            "falloffRadius": 10
        }, "local");
        
        //Sign
        id = Entities.addEntity({
            "type": "Model",
            "name": "AUDITORIUM Sign",
            "dimensions": {
                "x": 1.841064453125,
                "y": 0.3342578411102295,
                "z": 0.03999999910593033
            },
            "rotation": {
                "x": 0,
                "y": -0.7071068286895752,
                "z": 0,
                "w": 0.7071068286895752
            },
            "grab": {
                "grabbable": false
            },
            "shapeType": "box",
            "textures": "{\"base_color_texture\":\"" + ROOT + "images/auditorium.jpg\",\"emission_color_texture\":\"" + ROOT + "images/auditorium.jpg\"}",
            "modelURL": "https://aleziakurdis.github.io/signs/models/framed_sign_emissive_h.fst",
            "useOriginalPivot": true,
            "parentID": zoneID,
            "renderWithZones": renderWithZones,
            "localPosition": {"x": -7.2720, "y": -5.7803, "z": -2.8826},
            "lifetime": 25200
        }, "local");
    };

    this.unload = function(entityID) {
        if (zoneID !== Uuid.NONE) {
            Entities.deleteEntity(zoneID);
            zoneID = Uuid.NONE;
        }
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
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}

})
