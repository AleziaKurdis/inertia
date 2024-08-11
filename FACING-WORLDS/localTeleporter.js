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
    
    this.preload = function(entityID) {

        var properties = Entities.getEntityProperties(entityID, ["renderWithZones", "description", "position", "rotation"]);
        var data = JSON.parse(properties.description);
        var teamColor = data.teamColor;
        arrivalPosition = Vec3.sum(properties.position, Vec3.multiplyQbyV( properties.rotation, data.localPosition ));
        //arrivalPosition = Vec3.sum(properties.position, data.localPosition);
        arrivalRotation = Quat.multiply( data.localRotation, properties.rotation );
        
        print("arrivalPosition: " + JSON.stringify(arrivalPosition));
        //############################################# DEBUG ##############
        //TEST TP Origin
        id = Entities.addEntity({
            "type": "Shape",
            "position": properties.position,
            "visible": true,
            "name": "TELEPORTER_IN",
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
            "color": teamColor
        }, "local");

        id = Entities.addEntity({
            "type": "Shape",
            "position": arrivalPosition,
            "visible": true,
            "name": "TELEPORTER_ARRIVAL",
            "locked": true,
            "dimensions": {
                "x": 1,
                "y": 1,
                "z": 1
            },
            "renderWithZones": properties.renderWithZones,
            "grab": {
                "grabbable": false
            }
        }, "local");
        //############################################# END DEBUG ##############
        
        
        //generate Local FX here
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
            "color": teamColor
        }, "local");
    }

    this.enterEntity = function(entityID) {
        MyAvatar.position = arrivalPosition;
        MyAvatar.orientation = arrivalRotation;
        
        //PLAY SOUND HERE
        
    }; 
    
    this.leaveEntity = function(entityID) {
        //do nothing.
    };
    
    
})
