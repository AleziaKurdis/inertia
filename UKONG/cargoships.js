//
//  cargoships.js
//
//  Created by Alezia Kurdis, April 9th, 2026.
//  Copyright 2026, Overte e.V.
//
//  cargoship generator for the UKONG scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    
    var ROOT = Script.resolvePath('').split("cargoships.js")[0];
    let horaireID = Uuid.NONE;
    let antiHoraireID = Uuid.NONE;
    let entitiesToDelete = [];
    
    this.preload = function(entityID) {
        const renderWithZones = Entities.getEntityProperties(entityID, ["renderWithZones"]).renderWithZones;

        //HORAIRE
        
        let horaireAngle = GetCurrentCycleValue(360, 1800);
        let horaireSpeed = 0.00349;
        let antiHoraireAngle = 360 - GetCurrentCycleValue(360, 1800);
        let antiHoraireSpeed = -0.00349;
        
        horaireID = Entities.addEntity({
            "name": "CargoShips Group A",
            "type": "Shape",
            "shape": "Sphere",
            "localPosition": { "x": 0.0, "y": 0.0, "z": 0.0},
            "localRotation": Quat.fromVec3Degrees({ "x": 0.0, "y": horaireAngle, "z": 0.0}),
            "localAngularVelocity": { "x": 0.0, "y": horaireSpeed, "z": 0.0},
            "angularDamping": 0.0,
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "dimensions": {
                "x": 5.0,
                "y": 5.0,
                "z": 5.0
            },
            "visible": false
        }, "local");
        entitiesToDelete.push(horaireID);
        
        let boatID = Entities.addEntity({
            "type": "Model",
            "parentID": horaireID,
            "localPosition": { "x": -2000.0, "y": 0.0, "z": 0.0},
            "localRotation": Quat.fromVec3Degrees({ "x": 0.0, "y": 180.0, "z": 0.0}),
            "name": "CARGOSHIP-1",
            "dimensions": {
                "x": 34.47477722167969,
                "y": 44.9405403137207,
                "z": 260.0521240234375
            },
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "collisionless": true,
            "ignoreForCollisions": true,
            "modelURL": ROOT + "models/CARGOSHIP_BLUE.fst",
            "useOriginalPivot": true
        }, "local");

        boatID = Entities.addEntity({
            "type": "Model",
            "parentID": horaireID,
            "localPosition": { "x": 2000.0, "y": 0.0, "z": 0.0},
            "localRotation": Quat.fromVec3Degrees({ "x": 0.0, "y": 0.0, "z": 0.0}),
            "name": "CARGOSHIP-2",
            "dimensions": {
                "x": 34.47477722167969,
                "y": 44.9405403137207,
                "z": 260.0521240234375
            },
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "collisionless": true,
            "ignoreForCollisions": true,
            "modelURL": ROOT + "models/CARGOSHIP_ORANGE.fst",
            "useOriginalPivot": true
        }, "local");
        
        //ANTIHORAIRE
        antiHoraireID = Entities.addEntity({
            "name": "CargoShips Group B",
            "type": "Shape",
            "shape": "Sphere",
            "localPosition": { "x": 0.0, "y": 0.0, "z": 0.0},
            "localRotation": Quat.fromVec3Degrees({ "x": 0.0, "y": antiHoraireAngle, "z": 0.0}),
            "localAngularVelocity": { "x": 0.0, "y": antiHoraireSpeed, "z": 0.0},
            "angularDamping": 0.0,
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "dimensions": {
                "x": 5.0,
                "y": 5.0,
                "z": 5.0
            },
            "visible": false
        }, "local");
        entitiesToDelete.push(antiHoraireID);
        
        boatID = Entities.addEntity({
            "type": "Model",
            "parentID": antiHoraireID,
            "localPosition": { "x": -2200.0, "y": 0.0, "z": 0.0},
            "localRotation": Quat.fromVec3Degrees({ "x": 0.0, "y": 180.0, "z": 0.0}),
            "name": "CARGOSHIP-3",
            "dimensions": {
                "x": 34.47477722167969,
                "y": 44.9405403137207,
                "z": 260.0521240234375
            },
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "collisionless": true,
            "ignoreForCollisions": true,
            "modelURL": ROOT + "models/CARGOSHIP_BLACK.fst",
            "useOriginalPivot": true
        }, "local");

        boatID = Entities.addEntity({
            "type": "Model",
            "parentID": antiHoraireID,
            "localPosition": { "x": 2200.0, "y": 0.0, "z": 0.0},
            "localRotation": Quat.fromVec3Degrees({ "x": 0.0, "y": 0.0, "z": 0.0}),
            "name": "CARGOSHIP-4",
            "dimensions": {
                "x": 34.47477722167969,
                "y": 44.9405403137207,
                "z": 260.0521240234375
            },
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "collisionless": true,
            "ignoreForCollisions": true,
            "modelURL": ROOT + "models/CARGOSHIP_GREEN.fst",
            "useOriginalPivot": true
        }, "local");
        
    };

    function GetCurrentCycleValue(cyclelength, cycleduration){
		var today = new Date();
		var TodaySec = today.getTime()/1000;
		var CurrentSec = TodaySec%cycleduration;
		
		return (CurrentSec/cycleduration)*cyclelength;
		
	}

    this.unload = function(entityID) {
        for (let i=0; i < entitiesToDelete.length; i++) {
            Entities.deleteEntity(entitiesToDelete[i]);
        }
        entitiesToDelete = [];
    };

})
