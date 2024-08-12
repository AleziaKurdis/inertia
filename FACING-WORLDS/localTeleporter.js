//
//  localTeleporter.js
//
//  Created by Alezia Kurdis,November 10th, 2023.
//  Copyright 2023, Overte e.V.
//
//  Space 3d portals.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var ROOT = Script.resolvePath('').split("localTeleporter.js")[0];
    var arrivalPosition, arrivalRotation;
    var TP_SOUND = SoundCache.getSound(ROOT + "sounds/teleportSound.mp3");
    
    this.preload = function(entityID) {

        var properties = Entities.getEntityProperties(entityID, ["renderWithZones", "description", "position", "rotation"]);
        var data = JSON.parse(properties.description);
        var teamColor = data.teamColor;
        var team = data.team;
        var sideRotation = Quat.IDENTITY;
        if (team === "BLUE") {
            sideRotation = Quat.fromVec3Degrees({"x": 0, "y": 180, "z": 0});
        }
        arrivalRotation = Quat.multiply( data.localRotation, sideRotation );
        arrivalPosition = Vec3.sum(properties.position, Vec3.multiplyQbyV( sideRotation, data.localPosition ));
        
        //FX
        id = Entities.addEntity({
            "type": "ParticleEffect",
            "localPosition": {
                "x": 0.0,
                "y": 0.0,
                "z": 0.0
            },
            "parentID": entityID,
            "visible": true,
            "name": "TELEPORTER_FX",
            "locked": true,
            "dimensions": {
                "x": 1.5,
                "y": 3,
                "z": 1.5
            },
            "renderWithZones": properties.renderWithZones,
            "grab": {
                "grabbable": false
            },
            "color": teamColor,
            "colorStart": {
                "red": 255,
                "green": 255,
                "blue": 255
            },
            "colorFinish": teamColor,
            "alpha": 0.06,
            "alphaStart": 0.0,
            "alphaFinish": 0.0,
            "alphaSpread": 0.05,
            "isEmitting": true,
            "emitRate": 200,
            "lifespan": 1.5,
            "maxParticles": 300,
            "emitSpeed": 0,
            "speedSpread": 0.1,
            "emitAcceleration": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0.8,
                "z": 0
            },
            "emitDimensions":  {
                "x": 0.7,
                "y": 0.15,
                "z": 0.7
            },
            "emitRadiusStart": 0,
            "textures": ROOT + "images/PARTICULE_OPERA_007.png",
            "particleRadius": 0.7,
            "radiusStart": 0.1,
            "radiusFinish": 0.2,
            "radiusSpread": 0.1,
            "particleSpin": 0,
            "spinStart": -Math.PI,
            "spinFinish": Math.PI,
            "spinSpread": 0.0
        }, "local");
    }

    this.enterEntity = function(entityID) {
        var injectorOptions = {
            "position": MyAvatar.position,
            "volume": 0.3,
            "loop": false,
            "localOnly": false
        };
        var injector = Audio.playSound(TP_SOUND, injectorOptions);
            
        MyAvatar.position = arrivalPosition;
        MyAvatar.orientation = arrivalRotation;
        
    }; 
    
    this.leaveEntity = function(entityID) {
        //do nothing.
    };
    
    
})
