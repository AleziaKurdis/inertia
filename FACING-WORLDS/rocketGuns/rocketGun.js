//
//  rocketGun.js
//
//  Created by Alezia Kurdis, September 4th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Rocket launcher for CTF game in Overte.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ROOT = Script.resolvePath('').split("rocketGun.js")[0];
    var channelComm = "ak.ctf.ac.communication";

    var ammunitions = 0;
    var lethalRadius = 0;
    var model = "";
    var thisEntityID;
    var lightMaterialID = Uuid.NULL;
    
    var DAY_DURATION = 104400; //D29
    var justEquiped = false;
    var bulletHue = 0;
    
    var RELOAD_THRESHOLD = 0.95;
    var RELOAD_TIME = 2;
    var GUN_TIP_FWD_OFFSET = 0.05;
    var GUN_TIP_UP_OFFSET = 0.05;

    var TRIGGER_CONTROLS = [
        Controller.Standard.LT,
        Controller.Standard.RT
    ];

    var EMPTY_CLENCH_SOUND = SoundCache.getSound(ROOT + "sounds/emptyClench.mp3");
    var FIRE_SOUND = SoundCache.getSound(ROOT + "sounds/fireTrigger.mp3");

    //var GUN_FORCE = 3;

    var LOCAL_AUDIOPLAYBACK = {
        volume: 1,
        position: Vec3.sum(Camera.getPosition(), Quat.getFront(Camera.getOrientation()))
    };
/*
  var GRAVITY = {
    x: 0,
    y: -1,
    z: 0
  };
  var DIMENSIONS = {
    x: 0.04,
    y: 0.002,
    z: 0.04
  }

  var DIMENSIONS_VARIANT = {
    x: 0.02,
    y: 0.002,
    z: 0.02
  }
*/
  //var FRICTION = 0.05;
  //var DENSITY = 100;

  //var PARTICLE_AMOUNT = 8;
  //var ENTITY_AMOUNT = 20;
/*
  var randColor = function() {
    return {
      red: Math.random() * 255,
      green: Math.random() * 255,
      blue: Math.random() * 255
    }
  };
  var randVec = function(amount) {
    return Vec3.multiply({
      x: Math.random() - Math.random(),
      y: Math.random() - Math.random(),
      z: Math.random() - Math.random()
    }, amount)
  }
  var randCone = function(size) {
    return Quat.fromVec3Degrees(randVec(size));
  }
*/
    //var rotation = Quat.fromVec3Degrees({x:0,y:90,z:0});

    function RocketGun() {
        return;
    }

    RocketGun.prototype = {
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
            }, 2000);

            if (!justEquiped) {
                if (ammunitions > 0) {
                    playAnouncement(FIRE_SOUND);
                    var currentGravity = (Math.sin(GetCurrentCycleValue(Math.PI * 2, Math.floor((DAY_DURATION/24) * 1.618))) * 3.5) - 6.3; // -9.8 to -2.8 m/s2
                    Controller.triggerShortHapticPulse(1, this.hand);
                    ammunitions = ammunitions -1;
                    setAmmunitionsColor();
                    var bulletId = createBullet(this.getGunTipPosition(gunProperties), gunProperties.rotation, {"x": 0.0, "y": 0.0, "z": -10}, {"x": 0.0, "y": currentGravity, "z": 0.0});
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
            model = Entities.getEntityProperties( entityID, ["name"] ).name;
            switch(model) {
                case "ANIL-4M":
                    ammunitions = 6;
                    lethalRadius = 2;
                    bulletHue = 150;
                    break;
                case "ANIL-8M":
                    ammunitions = 3;
                    lethalRadius = 4;
                    bulletHue = 66;
                    break;
                case "ANIL-16M":
                    ammunitions = 1;
                    lethalRadius = 8;
                    bulletHue = 36;
                    break;
                default:
                    print("Error: unkown gun model!");
            }
            setAmmunitionsColor();
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

    function createBullet(position, rotation, velocity, gravity) {
        var BULLET_SIZE = 0.12;
        var id = Entities.addEntity({
            "name": bullet,
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
            "ignoreForCollisions": false,
            "collisionMask":31,
            "collidesWith":"static,dynamic,kinematic,myAvatar,otherAvatar,",
            "dynamic": true,
            "lifetime": 60;
            "script": ""
        }, "avatar");
            
        var fireColor = hslToRgb(bulletHue, 1, 0.5);
        var plasmaColor = hslToRgb(bulletHue, 1, 0.61);
        var colorStart = hslToRgb(bulletHue, 1, 0.9);
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
            "intensity": 25.0,
            "falloffRadius": 3.0
        }, "avatar");
        
        //particle
        let fxId = Entities.addEntity({
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
            "maxParticles": 4000,
            "lifespan": 10,
            "emitRate": 400,
            "emitSpeed": 1.6,
            "speedSpread": 0.7,
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
            "particleRadius": 2,
            "radiusSpread": 0.1,
            "radiusStart": BULLET_SIZE,
            "radiusFinish": 30,
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
        
        return id;
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
    var self = new RocketGun();
    return self;
    
    Script.scriptEnding.connect(function () {
        //do nothing
        Messages.unsubscribe(channelComm);
    });
});