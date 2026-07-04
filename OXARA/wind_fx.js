//
//  wind_fx.js
//
//  Created by Alezia Kurdis, July 2nd, 2026.
//  Copyright 2026, Overte e.V.
//
//  Generate a wind effect for OXARA.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    const ROOT = Script.resolvePath('').split("wind_fx.js")[0];
    const UPDATE_TIMER_INTERVAL = 120000; // 2 minutes
    let processTimer = 0;

    
    let thisEntity;
    let thisRenderWithZones;
    
    //SPECIFIC
    let windId = Uuid.NONE;

    this.preload = function(entityID) {
        thisEntity = entityID;
        let properties = Entities.getEntityProperties(entityID, ["renderWithZones"]);
        thisRenderWithZones = properties.renderWithZones;
        
        update();
        
        let today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer);
        
    };    
    
    this.unload = function(entityID) {
        Script.update.disconnect(myTimer);
        if (windId !== Uuid.NONE) {
            Entities.deleteEntity(windId);
            windId = Uuid.NONE;
        }
    };    

    function myTimer(deltaTime) {
        let today = Date.now();
        if ((today - processTimer) > UPDATE_TIMER_INTERVAL ) {
            update();
            processTimer = today;
        }  
    }

    function update() {
        const HYTRION_DAY = 19 * 3600; //19h
        let hour = GetCurrentCycleValue(24, HYTRION_DAY);
        let isEmitting = false;
        //if (hour > 6.0 && hour < 18.0) { //PRODUCTION
        if (hour > 0.0 && hour < 23.9) { //DEBUGING
            isEmitting = true;
        }
        

        if (windId !== Uuid.NONE) {
            Entities.editEntity(windId, {"isEmitting": isEmitting});
        } else {
            windId = Entities.addEntity({
                    "type": "ParticleEffect",
                    "name": "WIND FX",
                    "isEmitting": isEmitting,
                    "dimensions": {
                        "x": 1214.47998046875,
                        "y": 1214.47998046875,
                        "z": 1214.47998046875
                    },
                    "rotation": {
                        "x": -0.0000457763671875,
                        "y": -0.010544002056121826,
                        "z": -0.0000152587890625,
                        "w": 0.99993896484375
                    },
                    "grab": {
                        "grabbable": false
                    },
                    "damping": 0,
                    "angularDamping": 0,
                    "shapeType": "box",
                    "color": {
                        "red": 250,
                        "green": 144,
                        "blue": 57
                    },
                    "alpha": 0.20000000298023224,
                    "textures": ROOT + "images/fog.png",
                    "maxParticles": 16,
                    "lifespan": 16,
                    "emitRate": 1,
                    "emitSpeed": 0,
                    "emitOrientation": {
                        "x": -0.0000152587890625,
                        "y": -0.0000152587890625,
                        "z": -0.0000152587890625,
                        "w": 1
                    },
                    "emitDimensions": {
                        "x": 200,
                        "y": 10,
                        "z": 50
                    },
                    "emitRadiusStart": 0,
                    "polarFinish": 3.1415927410125732,
                    "emitAcceleration": {
                        "x": 0,
                        "y": 0,
                        "z": 3
                    },
                    "particleRadius": 35,
                    "radiusSpread": 15,
                    "radiusStart": 30,
                    "radiusFinish": 60,
                    "colorStart": {
                        "red": 168,
                        "green": 142,
                        "blue": 123
                    },
                    "colorFinish": {
                        "red": 158,
                        "green": 77,
                        "blue": 24
                    },
                    "alphaSpread": 0.10000000149011612,
                    "alphaStart": 0,
                    "alphaFinish": 0,
                    "emitterShouldTrail": true,
                    "spinSpread": 0.5199999809265137,
                    "spinStart": -3.140000104904175,
                    "spinFinish": 3.140000104904175,
                    "renderWithZones": thisRenderWithZones,
                    "parentID": thisEntity,
                    "localPosition": {"x": 0, "y": 0, "z": 0}
                }, "local");

        }
    }

    // ################## CYLCE AND TIME FUNCTIONS ###########################
    function GetCurrentCycleValue(cyclelength, cycleduration){
		let today = new Date();
		let TodaySec = today.getTime()/1000;
		let CurrentSec = TodaySec%cycleduration;
		
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
        let r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            let hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            let p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }


})
