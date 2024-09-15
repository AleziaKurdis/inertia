//
//  basicGun.js
//
//  Created by Alezia Kurdis, September 4th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Simple basic Gun for CTF game in Overte.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("basicGun.js")[0];
    var channelComm = "ak.ctf.ac.communication";

    var shots = [];

    var ammunitions = 0;
    var thisEntityID;
    var lightMaterialID = Uuid.NULL;
    
    var DAY_DURATION = 104400; //D29
    var justEquiped = false;
    var NBR_SHOT_TO_DIE = 2;
    
    var RELOAD_THRESHOLD = 0.95;
    var GUN_TIP_FWD_OFFSET = 0.05;
    var GUN_TIP_UP_OFFSET = 0.05;

    var TRIGGER_CONTROLS = [
        Controller.Standard.LT,
        Controller.Standard.RT
    ];

    var EMPTY_CLENCH_SOUND = SoundCache.getSound(ROOT + "sounds/emptyClench.mp3");
    var FIRE_SOUND = SoundCache.getSound(ROOT + "sounds/fireTrigger.mp3");
    
    function BasicGun() {
        return;
    }

    BasicGun.prototype = {
        hand: null,
        gunTipPosition: null,
        canShoot: true,
        equipped: false,
        firedProjectiles: [],
        startEquip: function(entityID, args) {
            justEquiped = true;
            this.hand = args[0] == "left" ? 0 : 1;
        },

        continueEquip: function(entityID, args) {
            this.checkTriggerPressure(this.hand);
        },

        releaseEquip: function(entityID, args) {
            var _this = this;
            this.equipped = false;
            this.canShoot = false;
            if (ammunitions === 0) {
                var messageToSent = {
                    "action": "DELETE_GUN",
                    "entityID": thisEntityID
                };
                Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
            }
        },
        checkTriggerPressure: function(gunHand) {
            this.triggerValue = Controller.getValue(TRIGGER_CONTROLS[gunHand]);
            if (this.triggerValue >= RELOAD_THRESHOLD && this.canShoot) {
                this.canShoot = false;
                var gunProperties = Entities.getEntityProperties(this.entityID, ["position", "rotation"]);
                this.fire(gunProperties);
            } else if (this.triggerValue <= RELOAD_THRESHOLD && !this.equipped && !this.canShoot) {
                this.equipped = true;
                this.canShoot = true;
            }
            return;
        },
        getGunTipPosition: function(properties) {
            //the tip of the gun is going to be in a different place than the center, so we move in space relative to the model to find that position
            var frontVector = Quat.getFront(properties.rotation);
            var frontOffset = Vec3.multiply(frontVector, GUN_TIP_FWD_OFFSET);
            var upVector = Quat.getUp(properties.rotation);
            var upOffset = Vec3.multiply(upVector, GUN_TIP_UP_OFFSET);

            var gunTipPosition = Vec3.sum(properties.position, frontOffset);
            gunTipPosition = Vec3.sum(gunTipPosition, upOffset);

            return gunTipPosition;
        },
        fire: function(gunProperties) {
            this.canShoot = false;

            var self = this;
            Script.setTimeout(function() {
                self.canShoot = true
            }, 1000);

            if (!justEquiped) {
                if (ammunitions > 0) {
                    playAnouncement(FIRE_SOUND);
                    Controller.triggerShortHapticPulse(1, this.hand);
                    ammunitions = ammunitions -1;
                    setAmmunitionsColor();
                    genShotFX(this.getGunTipPosition(gunProperties), gunProperties.rotation); // ################# TODO
                    var pick = Picks.createPick(PickType.Ray, {
                        "enabled": true,
                        "filter": Picks.PICK_AVATARS,
                        "maxDistance": 400,
                        "joint": "static",
                        "position": this.getGunTipPosition(gunProperties),
                        "orientation": gunProperties.rotation
                    });
                    var rayPickResult = Picks.getPrevPickResult(pick);
                    if (rayPickResult.intersects) {
                        var impactPosition = rayPickResult.intersection;
                        //impact FX call here ########################################################################## TODO
                        var killed = getHitNumber(rayPickResult.objectID);
                        if (killed) {
                            var messageSent = {
                                "action": "REVIVE",
                                "avatarID": rayPickResult.objectID,
                                "by": ownerID
                            };
                            Messages.sendMessage(channelComm, JSON.stringify(messageSent));

                            messageSent = {
                                "action": "KILL",
                                "position": impactPosition
                            };
                            Messages.sendMessage(channelComm, JSON.stringify(messageSent));
                        }
                    }
                    Picks.removePick(pick);
                } else {
                    playAnouncement(EMPTY_CLENCH_SOUND);
                    Controller.triggerShortHapticPulse(0.5, this.hand);
                }
            } else {
                justEquiped = false;
            }
        },
        preload: function(entityID) {
            this.entityID = entityID;
            thisEntityID = entityID;
            ammunitions = 12;
            setAmmunitionsColor();
        }
    }

    function getHitNumber(avatarID) {
        var i, rez;
        if (shots.length > 0) {
            rez = false;
            for (i = 0; i < shots.length; i++ ) {
                if (shots[i].id === avatarID) {
                    shots[i].hits = shots[i].hits + 1;
                    if (shots[i].hits > NBR_SHOT_TO_DIE - 1) {
                        rez = true;
                        shots[i].hits = 0;
                    }
                    break;
                }
            }
            return rez;
        } else {
            shots.push({"id": avatarID, "hits": 1});
            return false;
        }
    }

    function playAnouncement(soundCode) {
        var position = Entities.getEntityProperties(thisEntityID, ["position"]).position;
        var injectorOptions = {
            "position": position,
            "volume": 0.6,
            "loop": false,
            "localOnly": false
        };
        var injector = Audio.playSound(soundCode, injectorOptions);
    }

    function setAmmunitionsColor() {
        var color = hslToRgb(((ammunitions/6)*120)/360, 1.0, 0.6);
        var bloomFactor = 3;
        var materialContent = {
            "materialVersion": 1,
            "materials": [
                {
                    "name": "plasma",
                    "albedo": [1, 1, 1],
                    "metallic": 1,
                    "roughness": 1,
                    "emissive": [(color[0]/255) * bloomFactor, (color[1]/255) * bloomFactor, (color[2]/255) * bloomFactor],
                    "cullFaceMode": "CULL_NONE",
                    "model": "hifi_pbr"
                }
            ]
        };        
        if (lightMaterialID === Uuid.NULL) {
            //create
            lightMaterialID = Entities.addEntity({
                "type": "Material",
                "parentID": thisEntityID,
                "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
                "name": "ANIL-XM-material",
                "materialURL": "materialData",
                "priority": 3,
                "parentMaterialName": "mat::LIGHT",
                "materialData": JSON.stringify(materialContent)
            }, "local");
        } else {
            //edit
            Entities.editEntity(lightMaterialID, {"materialData": JSON.stringify(materialContent)});
        }
    }

    function genShotFX(position, rotation) {
/*        var id = Entities.addEntity({
            "name": "bulletFX",
            "type": "Shape",
            "shape": "Sphere",
            "dimensions": { "x": 0.1, "y": 0.1, "z":0.6 },
            "position": position,
            "rotation": rotation,
            "grab": {
                "grabbable": false
            },
            "damping":0,
            "angularDamping":0,
            "restitution":0.99,
            "friction":0.0,
            "collisionless": false,
            "collisionMask":31,
            "collidesWith":"static,dynamic,kinematic,myAvatar,otherAvatar,",
            "dynamic": true,
            "lifetime": 60
        }, "avatar");
            
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
        }, "avatar");
        
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
        }, "avatar");
        
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
        }, "avatar");
*/
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

    Messages.subscribe(channelComm);
    var self = new BasicGun();
    return self;
    
    Script.scriptEnding.connect(function () {
        //do nothing
        Messages.unsubscribe(channelComm);
    });
});