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
        {"x":4024.80810546875,"y":4008.416259765625,"z":3946.296875},
        {"x":3987.093017578125,"y":4008.416259765625,"z":3946.296875},
        {"x":3960.08740234375,"y":4008.416259765625,"z":3947.06884765625},
        {"x":3964.45751953125,"y":4016.385986328125,"z":3994.80615234375},
        {"x":3987.230224609375,"y":4016.385986328125,"z":3987.0185546875},
        {"x":4012.555419921875,"y":4016.385986328125,"z":3989.042236328125},
        {"x":4029.883544921875,"y":3985.713623046875,"z":3960.51611328125}, //passerelle
        {"x":4038.99609375,"y":3985.871337890625,"z":3950.581298828125}, //passerelle
        {"x":4017.89013671875,"y":4021.821044921875,"z":3959.470703125},
        {"x":3972.101806640625,"y":3989.76318359375,"z":3991.4072265625}, //plafoniers
        {"x":3972.101806640625,"y":3989.76318359375,"z":3965.470947265625},
        {"x":4023.176025390625,"y":3989.76318359375,"z":3965.470947265625},
        {"x":4003.42626953125,"y":3989.76318359375,"z":3965.470947265625},
        {"x":4003.42626953125,"y":3989.76318359375,"z":3998.661376953125},
        {"x":3990.959716796875,"y":3989.76318359375,"z":4007.955322265625},
        {"x":4061.766357421875,"y":3987.585693359375,"z":3933.0126953125}
    ];
    
    var zoneID = Uuid.NONE;
    this.preload = function(entityID) {
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
        
        var i, id;
        for (i=0; i < localPositions.length; i++) {
            id = Entities.addEntity({
                "type": "Light",
                "name": "auditorium-light",
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
                
                "localPosition": localPositions[i],
                "parentID": zoneID,
                "renderWithZones": [zoneID],
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
                "falloffRadius": 1.5,
                "lifetime": 25200
            }, "local");
            
        }
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
