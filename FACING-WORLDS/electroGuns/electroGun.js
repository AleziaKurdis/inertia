//
//  electroGun.js
//
//  Created by Alezia Kurdis, September 19th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Simple electro Gun for CTF game in Overte.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("electroGun.js")[0];
    var channelComm = "ak.ctf.ac.communication";

    var ammunitions = 0;
    var thisEntityID;
    var lightMaterialID = Uuid.NULL;
    
    var DAY_DURATION = 104400; //D29
    var justEquiped = false;
    var DEFAULT_NBR_AMMUNITIONS = 8;

    var CANON_EXIT_LOCAL_POSITION = {"x": 0, "y": 0.02, "z": -0.3426};
    var LETHAL_POINT_1_LOCAL_POSITION = {"x": 0, "y": 0.02, "z": -1.3426};
    var LETHAL_POINT_2_LOCAL_POSITION = {"x": 0, "y": 0.02, "z": -3.3426};
    var LETHAL_POINT_3_LOCAL_POSITION = {"x": 0, "y": 0.02, "z": -5.3426};
    var LETHAL_POINT_4_LOCAL_POSITION = {"x": 0, "y": 0.02, "z": -7.3426};
    
    var RELOAD_THRESHOLD = 0.95;

    var TRIGGER_CONTROLS = [
        Controller.Standard.LT,
        Controller.Standard.RT
    ];

    var EMPTY_CLENCH_SOUND = SoundCache.getSound(ROOT + "sounds/emptyClench.mp3");
    var FIRE_SOUND = SoundCache.getSound(ROOT + "sounds/fireElectroTrigger.mp3");
    
    function ElectroGun() {
        return;
    }

    ElectroGun.prototype = {
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
            //var gunTipPosition = Vec3.sum(properties.position, Vec3.multiplyQbyV(properties.rotation, CANON_EXIT_LOCAL_POSITION));
            //return gunTipPosition;
        },
        fire: function(gunProperties) {
            this.canShoot = false;

            var self = this;
            Script.setTimeout(function() {
                self.canShoot = true
            }, 2000);

            if (!justEquiped) {
                if (ammunitions > 0) {
                    playAnouncement(FIRE_SOUND);
                    Controller.triggerShortHapticPulse(1.8, this.hand);
                    ammunitions = ammunitions -1;
                    setAmmunitionsColor();
                    genShotFX(thisEntityID, CANON_EXIT_LOCAL_POSITION);
                    var j, messageSent;
                    var victimesIDs = AvatarManager.getAvatarsInRange( Vec3.sum(gunProperties.position, Vec3.multiplyQbyV(gunProperties.rotation, LETHAL_POINT_1_LOCAL_POSITION)), 1);
                    victimesIDs.push(AvatarManager.getAvatarsInRange( Vec3.sum(gunProperties.position, Vec3.multiplyQbyV(gunProperties.rotation, LETHAL_POINT_2_LOCAL_POSITION)), 1));
                    victimesIDs.push(AvatarManager.getAvatarsInRange( Vec3.sum(gunProperties.position, Vec3.multiplyQbyV(gunProperties.rotation, LETHAL_POINT_3_LOCAL_POSITION)), 1));
                    victimesIDs.push(AvatarManager.getAvatarsInRange( Vec3.sum(gunProperties.position, Vec3.multiplyQbyV(gunProperties.rotation, LETHAL_POINT_4_LOCAL_POSITION)), 1));
                    print("victimesIDs: " + JSON.stringify(victimesIDs)); //########################################################################## DEBUG/REMOVE
                    var victimes = remove_duplicates_safe(victimesIDs);
                    print("victimes: " + JSON.stringify(victimes)); //########################################################################## DEBUG/REMOVE
                    if (victimes.length > 0) {
                        for (j = 0; j < victimes.length; j++) {
                            //if (victimes[j] !== MyAvatar.sessionUUID) {
                                var victimePosition = AvatarManager.getAvatar(victimes[j]).position;
                                messageSent = {
                                    "action": "REVIVE",
                                    "avatarID": victimes[j],
                                    "by": MyAvatar.sessionUUID
                                };
                                Messages.sendMessage(channelComm, JSON.stringify(messageSent));
                                
                                messageSent = {
                                    "action": "KILL",
                                    "position": victimePosition
                                };
                                Messages.sendMessage(channelComm, JSON.stringify(messageSent));
                            //}
                        }
                    }
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
            ammunitions = DEFAULT_NBR_AMMUNITIONS;
            setAmmunitionsColor();
        }
    }

    function remove_duplicates_safe(arr) {
        var seen = {};
        var ret_arr = [];
        for (var i = 0; i < arr.length; i++) {
            if (!(arr[i] in seen)) {
                ret_arr.push(arr[i]);
                seen[arr[i]] = true;
            }
        }
        return ret_arr;
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
        var color = hslToRgb(((ammunitions/DEFAULT_NBR_AMMUNITIONS)*120)/360, 1.0, 0.6);
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

    function genShotFX(parentID, localPosition) {
        var fxId = Entities.addEntity({
            "type": "ParticleEffect",
            "parentID": parentID,
            "localPosition": localPosition,
            "localRotation": Quat.fromVec3Degrees({ "x": 0.0, "y": 180, "z": 0 }),
            "name": "gun-fx",
            "dimensions": {
                "x": 21.720001220703125,
                "y": 21.720001220703125,
                "z": 21.720001220703125
            },
            "grab": {
                "grabbable": false
            },
            "shapeType": "ellipsoid",
            "color": {
                "red": 0,
                "green": 255,
                "blue": 96
            },
            "alpha": 0.5,
            "textures": ROOT + "electricArc.png",
            "maxParticles": 300,
            "lifespan": 1.0,
            "emitRate": 300,
            "emitSpeed": 6.5,
            "speedSpread": 2.0,
            "emitRadiusStart": 0,
            "emitOrientation": {
                "x": 0,
                "y": 0,
                "z": 0,
                "w": 1
            },
            "emitDimensions": { "x": 0.02, "y": 0.02, "z": 0.02 },
            "polarFinish": 0.019999999552965164,
            "emitAcceleration": {"x": 0,"y": 0,"z": 0},
            "accelerationSpread": {"x": 0,"y": 0,"z": 0},
            "particleRadius": 1.0,
            "radiusSpread": 0.5,
            "radiusStart": 0.02,
            "radiusFinish": 1.0,
            "colorStart": {
                "red": 255,
                "green": 255,
                "blue": 255
            },
            "colorFinish": {
                "red": 0,
                "green": 255,
                "blue": 0
            },
            "alphaStart": 0.5,
            "alphaFinish": 0.0,
            "alphaSpread": 0.2,
            "emitterShouldTrail": false,
            "particleSpin": 0.0,
            "spinSpread": 1.5708,
            "spinStart": -0.523599,
            "spinFinish": 0.523599
        }, "avatar");
        
        Script.setTimeout(function () {
            Entities.deleteEntity(fxId);
        }, 1800);
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
    var self = new ElectroGun();
    return self;
    
    Script.scriptEnding.connect(function () {
        Picks.removePick(pick);
        Messages.unsubscribe(channelComm);
    });
});