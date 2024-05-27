//
//  popsicle.js
//
//  Created by Alezia Kurdis, May 13th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Popsicle script.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const ROOT = Script.resolvePath('').split("popsicle.js")[0];
    const UPDATE_TIMER_INTERVAL = 5000; // 4 sec
    const DISTANCE_EFFECTIVE = 1.2; //m
    let processTimer = 0;
    let renderWithZones = [];
    let beginingOfExistence = 0;
    let this_entityID;
    let isTimerRuning = false;
    const ICE_CUBE_URL = ROOT + "models/ice-cube.fst";
    let textureBank = ["fractal1.png", "fractal2.png", "floral.png", "quantum.png", "quantumWeb.png", "brainfog.png", "echo.png", "particles.png", "globular.png"];
    let entitiesToDelete = [];
    
    
    this.preload = function(entityID) {
        print("POPSICLE PRELOADED!");
        this_entityID = entityID;
        let properties = Entities.getEntityProperties(entityID, ["lifetime", "renderWithZones"]);
        renderWithZones = properties.renderWithZones;
        if (properties.lifetime === -1) {
            print("POPSICLE ABORTED!");
        } else {
            popsicleProcess();
            
            let today = new Date();
            processTimer = today.getTime();
            beginingOfExistence = processTimer;
            Script.update.connect(myTimer);
            isTimerRuning = true;
        }
    };

    function myTimer(deltaTime) {
        let today = new Date();
        if ((today.getTime() - processTimer) > UPDATE_TIMER_INTERVAL ) {

            popsicleProcess();
            
            today = new Date();
            processTimer = today.getTime();
        }
    }

    function popsicleProcess() {
        let properties = Entities.getEntityProperties(this_entityID, ["lifetime", "position", "lastEditedBy"]);
        
        if (properties.lastEditedBy === MyAvatar.sessionUUID && properties.lifetime !== -1 && (Vec3.distance(properties.position, MyAvatar.position) < DISTANCE_EFFECTIVE) && (processTimer - beginingOfExistence) > 15000) {
            let lifespan = Math.random() * UPDATE_TIMER_INTERVAL;
            let emitRate = 5 + Math.floor(Math.random() * 200);
            let emitSpeed = (Math.random() * 1) - 0.5;
            let electedTexture = ROOT + "images/icepops/" + textureBank[Math.floor(Math.random() * textureBank.length)];
            let color = hslToRgb(Math.random(), 1, 0.5);
            let colorStart = hslToRgb(Math.random(), 1, 0.5);
            let colorFinish = hslToRgb(Math.random(), 1, 0.5);
            
            print("DEBUG POPSICLE: electedTexture: " + electedTexture);
            print("DEBUG POPSICLE: emitRate: " + emitRate);
            print("DEBUG POPSICLE: emitSpeed: " + emitSpeed);
            print("DEBUG POPSICLE: color: " + JSON.stringify(color));
            print("DEBUG POPSICLE: colorStart: " + JSON.stringify(colorStart));
            print("DEBUG POPSICLE: colorFinish: " + JSON.stringify(colorFinish));
            
            let partFxID = Entities.addEntity({
                    "lifetime": Math.ceil(1.3 * UPDATE_TIMER_INTERVAL),
                    "name": "icePopFX",
                    "type": "ParticleEffect",
                    "isEmitting": true,
                    "maxParticles": Math.ceil(lifespan * emitRate),
                    "lifespan": lifespan,
                    "emitRate": emitRate,
                    "emitSpeed": emitSpeed,
                    "speedSpread": Math.abs(Math.random() * emitSpeed),
                    "emitAcceleration": {"x": 0.0, "y": 0.0, "z": 0.0},
                    //"dimensions": { "x": 2, "y": 2, "z": 2},
                    "emitterShouldTrail": false,
                    "shapeType": "ellipsoid",
                    "emitRadiusStart": Math.random(),
                    "polarStart": 0,
                    "polarFinish": Math.PI,
                    "azimuthStart": -Math.PI,
                    "azimuthFinish": Math.PI,
                    "texture": electedTexture,
                    "particleRadius": Math.random(),
                    "radiusStart": Math.random(),
                    "radiusFinish": Math.random(),
                    "radiusSpread": Math.random(),
                    "color": {"red": color[0], "green": color[1], "blue": color[2]},
                    "colorStart": {"red": colorStart[0], "green": colorStart[1], "blue": colorStart[2]},
                    "colorFinish": {"red": colorFinish[0], "green": colorFinish[1], "blue": colorFinish[2]},
                    "colorSpread": {"red": Math.floor(Math.random() * 30), "green": Math.floor(Math.random() * 30), "blue": Math.floor(Math.random() * 30)},
                    "alpha": Math.random() * 0.2,
                    "alphaStart": Math.random() * 0.2,
                    "alphaFinish": Math.random() * 0.2,
                    "alphaSpread": Math.random() * 0.1,
                    "spinSpread": (Math.random() * Math.PI),
                    "rotateWithEntity": true,
                    "localPosition": {"x": 0.0, "y": 0.1, "z": 0.0},
                    "parentID": this_entityID, //MyAvatar.SELF_ID,
                    "renderWithZones": renderWithZones,
                    //"parentJointIndex": MyAvatar.getJointIndex("Head"),
                    "grab": {
                        "grabbable": false
                    }
                }, "local");
                
                print("DEBUG POPSICLE: entity ID: " + partFxID);
                
                let today = new Date();
                let timestamp = today.getTime();
                entitiesToDelete.push({"id": partFxID, "expiration": timestamp + (1000 * Math.ceil(1.3 * UPDATE_TIMER_INTERVAL))});
                
            if ((processTimer - beginingOfExistence) > 120000) {
                let id = Entities.addEntity({
                    "type": "Model",
                    "localPosition": {"x": 0.0, "y": 0.1, "z": 0.0},
                    "parentID": MyAvatar.SELF_ID,
                    "name": "ICE CUBE",
                    "locked": false,
                    "dimensions": {
                        "x": 0.4,
                        "y": 0.4,
                        "z": 0.4
                    },
                    "renderWithZones": renderWithZones,
                    "grab": {
                        "grabbable": false
                    },
                    "collisionless": true,
                    "ignoreForCollisions": true,
                    "modelURL": ICE_CUBE_URL,
                    "useOriginalPivot": true,
                    "parentJointIndex": MyAvatar.getJointIndex("Head"),
                    "lifetime": 30 + Math.floor(Math.random() * 60)
                }, "avatar");
                //delete unnecessary things.
                Script.update.disconnect(myTimer);
                isTimerRuning = false;
                processTimer = 0;
            }
            deleteLocalEntities(false);
        } 
    }

    function deleteLocalEntities(allEntity) {
        let i;
        let today = new Date();
        let timestamp = today.getTime();
        
        for (i = 0; i < entitiesToDelete.lenght; i++) {
            if (allEntity) {
                Entities.deleteEntity(entitiesToDelete[i].id);
            } else {
                if (entitiesToDelete[i].expiration < timestamp) {
                    Entities.deleteEntity(entitiesToDelete[i].id);
                    entitiesToDelete.splice(i, 1);
                }
            }
        }
        if (allEntity) {
            entitiesToDelete = [];
        }
    }

    this.unload = function(entityID) {
        //cleanup
        deleteLocalEntities(true);
        if (isTimerRuning) {
            Script.update.disconnect(myTimer);
        }
        processTimer = 0;
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

    function GetCurrentCycleValue(cyclelength, cycleduration){
		let today = new Date();
		let TodaySec = today.getTime()/1000;
		let CurrentSec = TodaySec%cycleduration;
		return (CurrentSec/cycleduration)*cyclelength;
	}

})
