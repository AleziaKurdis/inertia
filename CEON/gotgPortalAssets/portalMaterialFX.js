//
//  portalMaterialFX.js
//
//  Created by Alezia Kurdis,November 12th, 2023.
//  Copyright 2023, Overte e.V.
//
//  Space prtal material fx
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var ROOT = Script.resolvePath('').split("portalMaterialFX.js")[0];
    var thisEntity;
    var thisPosition;
    var hue = 0;
    var bloomFactor = 2;
    

    var UPDATE_TIMER_INTERVAL = 100; // 0.1 sec 
    var processTimer = 0;
    var MIN_DISTANCE_TO_STAY_VISIBLE = 200; //in meters
    
    this.preload = function(entityID) {
        thisEntity = entityID;
        thisPosition = Entities.getEntityProperties(entityID, ["position"]).position;
        
        var today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer); 
    }

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {
            
            if (Vec3.distance(thisPosition, MyAvatar.position) < MIN_DISTANCE_TO_STAY_VISIBLE) {
                updateMaterialData();
            }
            
            today = new Date();
            processTimer = today.getTime();
        }  
    }

    function updateMaterialData() {
        hue = hue + ((Math.random() * 0.32) - 0.16);
        if (hue < 0) {
            hue = hue + 1;
        }
        if (hue > 1) {
            hue = hue - 1;
        }        
        var lightMatColor = hslToRgb(hue, 1, 0.61);
        bloomFactor = bloomFactor + ((Math.random() * 4) - 2);
        if (bloomFactor < 1) {
            bloomFactor = 1;
        }
        if (bloomFactor > 6) {
            bloomFactor = 6;
        }
        var materialContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "LIGHT",
                    "albedo": [1, 1, 1],
                    "metallic": 1,
                    "roughness": 1,
                    "emissive": [(lightMatColor[0]/255) * bloomFactor, (lightMatColor[1]/255) * bloomFactor, (lightMatColor[2]/255) * bloomFactor],
                    "cullFaceMode": "CULL_NONE",
                    "model": "hifi_pbr"
                }
            ]
        };
        Entities.editEntity(thisEntity, {"materialData": JSON.stringify(materialContent)});
    }

    this.unload = function(entityID) {
        Script.update.disconnect(myTimer);
    }
    
//######################## CYCLE & COLOR #############################
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
//######################## END CYCLE & COLOR #############################

})
