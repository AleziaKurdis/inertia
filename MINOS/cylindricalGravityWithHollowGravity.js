//
//  cylindricalGravityWithHollowGravity.js
//
//  Created by Alezia Kurdis, April 26th, 2024.
//  Copyright 2024, Overte e.V.
//  Inpired from: gravity.js created by Alan-Michael Moody on july 24th 2017, (Apache License 2.0) Copyright 2017 High Fidelity, Inc.
//
//  Set a gravitational field (cylindrical) around any entity, so you can walk on this entity.
//  It also contain an inverted gravity field to equipe an hollow cylinder to be walkable indide.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {

    var _entityID;
    var processInterval = null; 
    var gravityStatus = 0;
    var hmdMode = HMD.active;
    
    var CYLINDER_LENGTH = 255; //in meters
    var CYLINDER_RADIUS = 176; //in meters
    var EXTERNAL_GRAVITY_FIELD_INFLUENCE_RADIUS = 1.2 * CYLINDER_RADIUS;
    var HOLLOW_GRAVITY_INVERSION_RADIUS = 174; // in meters
    
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
        var myCylinder = Entities.getEntityProperties(_entityID, ["position"]);
        var distanceRadius = Vec3.distance({ "x": myCylinder.position.x, "y": myCylinder.position.y, "z": 0}, { "x": MyAvatar.position.x, "y": MyAvatar.position.y, "z": 0});
        var distanceFromInversionPoint = HOLLOW_GRAVITY_INVERSION_RADIUS - distanceRadius;
        if (distanceFromInversionPoint < 0.7 && distanceFromInversionPoint > -0.7) {
                MyAvatar.position = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: -2, z: 0 }));
        }
        var direction = Vec3.subtract({ "x": MyAvatar.position.x, "y": MyAvatar.position.y, "z": 0}, { "x": myCylinder.position.x, "y": myCylinder.position.y, "z": 0});
        var localUp = Quat.getUp(MyAvatar.orientation);
        if (distanceRadius <= HOLLOW_GRAVITY_INVERSION_RADIUS) {
            direction = Vec3.subtract({ "x": myCylinder.position.x, "y": myCylinder.position.y, "z": 0}, { "x": MyAvatar.position.x, "y": MyAvatar.position.y, "z": 0});
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
        var myCylinder = Entities.getEntityProperties(_entityID, ["position"]);
        var distanceLength = Math.abs(myCylinder.position.z - MyAvatar.position.z);
        var distanceRadius = Vec3.distance({ "x": myCylinder.position.x, "y": myCylinder.position.y, "z": 0}, { "x": MyAvatar.position.x, "y": MyAvatar.position.y, "z": 0});
        
        if (distanceRadius < EXTERNAL_GRAVITY_FIELD_INFLUENCE_RADIUS && distanceLength < (CYLINDER_LENGTH/2)) {
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
