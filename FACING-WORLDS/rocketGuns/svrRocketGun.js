//
//  svrRocketGun.js
//
//  Created by Alezia Kurdis, September 11th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Server Entity script for Rocket launcher for CTF game in Overte.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("svrRocketGun.js")[0];

    function createBulletServerSide(entityID, params) {
        var position = params[0];
        var rotation = params[1];
        var velocity = params[2];
        var gravity = params[3];
        var lethalRadius = params[4];
        
        var BULLET_SIZE = 0.12;
        var id = Entities.addEntity({
            "name": "bullet",
            "description": "" + lethalRadius,
            "type": "Shape",
            "shape": "Sphere",
            "dimensions": { "x": BULLET_SIZE, "y": BULLET_SIZE, "z": BULLET_SIZE },
            "position": position,
            "rotation": rotation,
            "grab": {
                "grabbable": false
            },
            "density": 1000,
            "velocity": velocity,
            "angularVelocity": { 
                "x": 0, 
                "y": 0, 
                "z": 0 
            },
            "gravity": gravity,
            "damping":0,
            "angularDamping":0,
            "restitution":0.99,
            "friction":0.0,
            "collisionless": false,
            "collisionMask":31,
            "collidesWith":"static,dynamic,kinematic,myAvatar,otherAvatar,",
            "dynamic": true,
            "lifetime": 60,
            "script": ROOT + "bullet.js"
        }, "domain");
            
        var fireColor = hslToRgb(bulletHue/360, 1, 0.5);
        var plasmaColor = hslToRgb(bulletHue/360, 1, 0.61);
        var colorStart = hslToRgb(bulletHue/360, 1, 0.9);
        var bloomFactor = 4;

        //material           
        var materialContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "plasma",
                    "albedo": [1, 1, 1],
                    "metallic": 1,
                    "roughness": 1,
                    "emissive": [(plasmaColor[0]/255) * bloomFactor, (plasmaColor[1]/255) * bloomFactor, (plasmaColor[2]/255) * bloomFactor],
                    "cullFaceMode": "CULL_NONE",
                    "model": "hifi_pbr"
                }
            ]
        };
                
        var fireMatId = Entities.addEntity({
            "type": "Material",
            "parentID": id,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "name": "plasma-material",
            "materialURL": "materialData",
            "priority": 1,
            "materialData": JSON.stringify(materialContent)
        }, "domain");
        
        //light
        var lightId = Entities.addEntity({
            "type": "Light",
            "parentID": id,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "name": "plasma-light",
            "dimensions": {
                "x": 50,
                "y": 50,
                "z": 50
            },
            "grab": {
                "grabbable": false
            },
            "color": {
                "red": plasmaColor[0],
                "green": plasmaColor[1],
                "blue": plasmaColor[2]
            },
            "intensity": 20.0,
            "falloffRadius": 2.0
        }, "domain");
        
        //particle
        var fxId = Entities.addEntity({
            "type": "ParticleEffect",
            "parentID": id,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
            "name": "plasma-fx",
            "dimensions": {
                "x": 381.0999755859375,
                "y": 381.0999755859375,
                "z": 381.0999755859375
            },
            "grab": {
                "grabbable": false
            },
            "shapeType": "ellipsoid",
            "color": {
                "red": plasmaColor[0],
                "green": plasmaColor[1],
                "blue": plasmaColor[2]
            },
            "alpha": 0.05,
            "textures": ROOT + "fog.png",
            "maxParticles": 3200,
            "lifespan": 8,
            "emitRate": 400,
            "emitSpeed": 0.1,
            "speedSpread": 0.05,
            "emitRadiusStart": 0,
            "emitOrientation": {
                "x": 0,
                "y": 0,
                "z": 0,
                "w": 1
            },
            "emitDimensions": { "x": BULLET_SIZE, "y": BULLET_SIZE, "z": BULLET_SIZE },
            "polarFinish": 3.1415927410125732,
            "emitAcceleration": {
                "x": 0,
                "y": 1.5,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0.6,
                "z": 0
            },
            "particleRadius": 1,
            "radiusSpread": 0.1,
            "radiusStart": BULLET_SIZE * 0.7,
            "radiusFinish": 20,
            "colorStart": {
                "red": colorStart[0],
                "green": colorStart[1],
                "blue": colorStart[2]
            },
            "colorFinish": {
                "red": fireColor[0],
                "green": fireColor[1],
                "blue": fireColor[2]
            },
            "alphaStart": 0.2,
            "alphaFinish": 0,
            "emitterShouldTrail": true,
            "spinSpread": 1.0499999523162842,
            "spinStart": -1.5700000524520874,
            "spinFinish": 1.5700000524520874
        }, "domain");
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
    
    this.remotelyCallable = [
        "createBulletServerSide"
    ];    

    // Constructor
    var _this = null;
    function BulletServer() {
        _this = this;
        this.entityID = null;
    }

    // Entity methods
    BulletServer.prototype = {
        remotelyCallable: [
            "createBulletServerSide"
        ],
        createBulletServerSide: createBulletServerSide
    };

    return new BulletServer();
});