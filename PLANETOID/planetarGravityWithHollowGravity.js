//  planetarGravityWithHollowGravity.js
//
//  Created by Alezia Kurdis, February 9th, 2023.
//  Copyright 2023, Overte e.V.
//  Inpired from: gravity.js created by Alan-Michael Moody on july 24th 2017, (Apache License 2.0) Copyright 2017 High Fidelity, Inc.
//
//  Set a gravitational field (spheric) around any entity, so you can walk on this entity.
//  It also contain an inverted gravity field to equipe an hollow planet to be walkable indide.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {

    var _entityID;
    var processInterval = null; 
    var gravityStatus = 0;
    var hmdMode = HMD.active;
    
    var PLANETAR_RADIUS = 650; //in meters
    var EXTERNAL_GRAVITY_FIELD_INFLUENCE_RADIUS = 1.2 * PLANETAR_RADIUS;
    var HOLLOW_GRAVITY_INVERSION_RADIUS = 572; // in meters
    
    this.preload = function (entityID) {
        _entityID = entityID;
        checkGravityField();
        var processInterval = Script.setInterval(function() {
            checkGravityField();
        }, 2000); //2 sec
    };

    this.unload = function (entityID) {
        if (gravityStatus === 1) {
            clean();
        }
        if(processInterval !== null) {
            Script.clearInterval(processInterval);
        } 
    };

    HMD.displayModeChanged.connect(function(isHMDMode) {
        hmdMode = isHMDMode;
    });

    function update(deltatime) {
        var planet = Entities.getEntityProperties(_entityID, ["position"]);
        var distanceFromInversionPoint = HOLLOW_GRAVITY_INVERSION_RADIUS - Vec3.distance(planet.position, MyAvatar.position);
        if (distanceFromInversionPoint < 0.7 && distanceFromInversionPoint > -0.7) {
                MyAvatar.position = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: -2, z: 0 }));
        }
        var direction = Vec3.subtract(MyAvatar.position, planet.position);
        var localUp = Quat.getUp(MyAvatar.orientation);
        if (Vec3.distance(planet.position, MyAvatar.position) <= HOLLOW_GRAVITY_INVERSION_RADIUS) {
            direction = Vec3.subtract(planet.position, MyAvatar.position);
        }
        MyAvatar.orientation = Quat.normalize(Quat.multiply(Quat.rotationBetween(localUp, direction), MyAvatar.orientation));
        if (hmdMode === false) {
            Camera.mode = "third person";
        } else {
            Camera.mode = "first person look at";
        }
        gravityStatus = 1;
    }

    function init() {
        Script.update.connect(update);
    }

    function clean() {
        Script.update.disconnect(update);
        MyAvatar.orientation = Quat.fromVec3Degrees({
            "x": 0,
            "y": 0,
            "z": 0
        });
        gravityStatus = 0;
    }

    function checkGravityField() {
        var myPlanet = Entities.getEntityProperties(_entityID, ["position"]);
        if (Vec3.distance(myPlanet.position, MyAvatar.position) <= EXTERNAL_GRAVITY_FIELD_INFLUENCE_RADIUS) {
            if (gravityStatus == 0) {
                init();
            }
        }else{
            if (gravityStatus == 1) {
                clean();
            }
        }
    }

    Script.scriptEnding.connect(clean);
});
