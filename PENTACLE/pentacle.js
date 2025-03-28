//#####################
//
//  pentacle.js
//
//  Created by Alezia Kurdis, November 15th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Pentacle illumination for Dark ambience for witchcraft.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("pentacle.js")[0];
    var UPDATE_TIMER_INTERVAL = 31000; // 31 sec 
    var processTimer = 0;

    var DAY_DURATION = 104400; //D29

    var pentacleMaterialID = Uuid.NONE;
    
    var thisEntityID;

    this.preload = function(entityID) {
        thisEntityID = entityID;
        
        makePentacleAntiGlow();

        var today = new Date();
        processTimer = today.getTime();
        
        Script.update.connect(myTimer);
    };

    this.unload = function(entityID) {
        Script.update.disconnect(myTimer);

        if (pentacleMaterialID !== Uuid.NONE) {
            Entities.deleteEntity(pentacleMaterialID);
            pentacleMaterialID = Uuid.NONE;
        }
    };

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            makePentacleAntiGlow();
            today = new Date();
            processTimer = today.getTime();
        }  
    }

    function makePentacleAntiGlow() {
        var hue = GetCurrentCycleValue(1, DAY_DURATION * 9);
        var antiHue = hue + 0.5;
        if (antiHue >= 1) {
            antiHue = antiHue - 1;
        }
        var plasmaColor = hslToRgb(antiHue, 1, 0.55);
        var bloomFactor = 3;
        
        var materialContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "antiplasma",
                    "albedo": [1, 1, 1],
                    "metallic": 1,
                    "roughness": 1,
                    "emissive": [(plasmaColor[0]/255) * bloomFactor, (plasmaColor[1]/255) * bloomFactor, (plasmaColor[2]/255) * bloomFactor],
                    "cullFaceMode": "CULL_NONE",
                    "model": "hifi_pbr"
                }
            ]
        };
        
        if (pentacleMaterialID === Uuid.NONE) {
            //CREATE
            pentacleMaterialID = Entities.addEntity({
                "type": "Material",
                "parentID": thisEntityID,
                "position": {"x": 0.0, "y": 0.0, "z": 0.0},
                "name": "pentacle material",
                "materialURL": "materialData",
                "priority": 3,
                "materialData": JSON.stringify(materialContent)
            }, "local");
        } else {
            //UPDATE
            Entities.editEntity(pentacleMaterialID, {
                "materialData": JSON.stringify(materialContent)
            });
        }

    }

    // ################## CYLCE AND TIME FUNCTIONS ###########################
    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}    
    // ################## END CYLCE AND TIME FUNCTIONS ###########################   

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

})
