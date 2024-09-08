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

    var RELOAD_THRESHOLD = 0.95;
    var RELOAD_TIME = 2;
    var GUN_TIP_FWD_OFFSET = 0.05;
    var GUN_TIP_UP_OFFSET = 0.05;

    var TRIGGER_CONTROLS = [
        Controller.Standard.LT,
        Controller.Standard.RT
    ];

    var EMPTY_CLENCH_SOUND = SoundCache.getSound(ROOT + "sounds/emptyClench.mp3");

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
            this.hand = args[0] == "left" ? 0 : 1;
        },

        continueEquip: function(entityID, args) {
            this.checkTriggerPressure(this.hand);
        },

        releaseEquip: function(entityID, args) {
            var _this = this;
            this.equipped = false;
            this.canShoot = false;
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
            if (ammunitions > 0) {
                
             
                    /*      var size = SHOOT_SOUNDS.length - 1;
                          var rand = Math.random();
                          var co = Math.round(Math.random() * size);
                          var sound = SHOOT_SOUNDS[co];
                          var entityCount = ENTITY_AMOUNT;
                          var particleCount = PARTICLE_AMOUNT;
                          if (0.95 < rand) {
                            sound = SUPRISE_SOUND;
                            entityCount = 5;
                            particleCount = 1;
                          }
                          Audio.playSound(sound, {
                            volume: 1,
                            position: gunProperties.position
                          });*/
            Controller.triggerShortHapticPulse(1, this.hand);
            print("BANG!"); //#############################################################################
            ammunitions = ammunitions -1;
            setAmmunitionsColor();

            
                /*

                      for (var x = 0; x < particleCount; x++) {
                        var part = PLASTIC;

                        part.colorStart = randColor();
                        part.colorFinish = part.colorStart;
                        part.color = part.colorStart;
                        part.dimensions= {
                          x:Math.random()*0.5,
                          y:Math.random()*0.5,
                          z:Math.random()*0.5,
                        }
                        part.position = this.getGunTipPosition(gunProperties);
                        part.rotation = gunProperties.rotation;
                        Entities.addEntity(part, true);
                      }

                      for (var i = 0; i < entityCount; i++) {
                        //  Controller.triggerShortHapticPulse(1, this.hand)
                        var forwardVec = Quat.multiply(randCone(45), Quat.getFront(Quat.multiply(gunProperties.rotation, Quat.fromPitchYawRollDegrees(0, 0, 0))));
                        forwardVec = Vec3.normalize(forwardVec);
                        forwardVec = Vec3.multiply(forwardVec, GUN_FORCE);
                        Entities.addEntity({
                          type: 'Box',
                          name: 'Confetti',
                          position: Vec3.sum(randVec(0.05), this.getGunTipPosition(gunProperties)),
                          color: randColor(),
                          collisionless: 1,
                          rotation: randCone(180),
                          script: "(function() { return { preload: function(e) { Script.setTimeout(function(){ Entities.editEntity(e, { 'collisionless': 0, 'script':'' }) },50); } } })",
                          dynamic: true,
                          dimensions: Math.ceil(Math.random() * 12) % 2 === 0 ? DIMENSIONS : DIMENSIONS_VARIANT,
                          gravity: GRAVITY,
                          velocity: forwardVec,
                          angularVelocity: randVec(25),
                          angularDamping: FRICTION,
                          gravity: GRAVITY,
                          dynamic: true,
                          lifetime: 15
                        }, true);
                
                }*/
            } else {
                playAnouncement(EMPTY_CLENCH_SOUND);
                Controller.triggerShortHapticPulse(0.5, this.hand);
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
                    break;
                case "ANIL-8M":
                    ammunitions = 3;
                    lethalRadius = 4;
                    break;
                case "ANIL-16M":
                    ammunitions = 1;
                    lethalRadius = 8;
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