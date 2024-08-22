//
//  tower.js
//
//  Created by Alezia Kurdis, August 5th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Add tower related elements for FACING-WORLD scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("tower.js")[0];
    var entitiesToDelete = [];

    var channelComm = "ak.ctf.ac.communication";
    var team;
    var otherTeam;
    var renderWithZones;
    var thisEntityID;
    
    var RED_COLOR = {"red": 255, "green": 24, "blue": 0 };
    var BLUE_COLOR = {"red": 0, "green": 108, "blue": 255 };
    
    var localPlayerListID = Uuid.NULL;
    var visitorPlayerListID = Uuid.NULL;
    var gameTimeID = Uuid.NULL;
    
    var startButtonID = Uuid.NULL;
    var swapButtonID = Uuid.NULL;
    
    this.preload = function(entityID) {
        thisEntityID = entityID;
        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);
        
        var properties = Entities.getEntityProperties(entityID, ["renderWithZones", "description"]);
        renderWithZones = properties.renderWithZones;
        team = properties.description; // (RED | BLUE)

        if (team === "") {
            team = "RED";
        }
        var lightColor = RED_COLOR;
        if (team === "BLUE") {
            otherTeam = "RED";
            lightColor = BLUE_COLOR;
        } else {
            otherTeam = "BLUE";
        }
        
        var id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 117.1812,
                "y": 0.5300,
                "z": 1.6025
            },
            "name": "ENTRANCE_LIGHT_" + team,
            "dimensions": {
                "x": 27.221336364746094,
                "y": 27.221336364746094,
                "z": 28.968341827392578
            },
            "rotation": {
                "x": 0.7071068286895752,
                "y": 0,
                "z": 0,
                "w": -0.7071068286895752
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": true,
            "intensity": 15,
            "exponent": 1,
            "cutoff": 70,
            "falloffRadius": 3
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 111.1812,
                "y": -2.2712,
                "z": 8.0198
            },
            "name": "LEFT_LIGHT_" + team,
            "dimensions": {
                "x": 27.221336364746094,
                "y": 27.221336364746094,
                "z": 28.968341827392578
            },
            "rotation": {
                "x": 0.7071068286895752,
                "y": 0,
                "z": 0,
                "w": -0.7071068286895752
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": true,
            "intensity": 10,
            "exponent": 1,
            "cutoff": 70,
            "falloffRadius": 2
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 111.1812,
                "y": -2.2712,
                "z": -4.6797
            },
            "name": "RIGHT_LIGHT_" + team,
            "dimensions": {
                "x": 27.221336364746094,
                "y": 27.221336364746094,
                "z": 28.968341827392578
            },
            "rotation": {
                "x": 0.7071068286895752,
                "y": 0,
                "z": 0,
                "w": -0.7071068286895752
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": true,
            "intensity": 10,
            "exponent": 1,
            "cutoff": 70,
            "falloffRadius": 2
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 111.4155,
                "y": 48.5168,
                "z": 4.9294
            },
            "name": "LEFT_TOP_LIGHT_" + team,
            "dimensions": {
                "x": 28.6224,
                "y": 28.6224,
                "z": 28.6224
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": false,
            "intensity": 10,
            "exponent": 1,
            "cutoff": 70,
            "falloffRadius": 2
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 111.4155,
                "y": 48.5168,
                "z": -1.8120
            },
            "name": "RIGHT_TOP_LIGHT_" + team,
            "dimensions": {
                "x": 28.6224,
                "y": 28.6224,
                "z": 28.6224
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": false,
            "intensity": 10,
            "exponent": 1,
            "cutoff": 70,
            "falloffRadius": 2
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 106.6592,
                "y": 29.6604,
                "z": 1.6609
            },
            "name": "2ND_FLOOR_LIGHT_" + team,
            "dimensions": {
                "x": 38.1230,
                "y": 38.1230,
                "z": 38.1230
            },
            "rotation": {
                "x": 0.7071068286895752,
                "y": 0,
                "z": 0,
                "w": -0.7071068286895752
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": false,
            "intensity": 10,
            "exponent": 1,
            "cutoff": 70,
            "falloffRadius": 2
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 99.1528,
                "y": 11.4370,
                "z": 1.6609
            },
            "name": "1ST_FLOOR_LIGHT_" + team,
            "dimensions": {
                "x":18.74223518371582,
                "y":18.74223518371582,
                "z":18.74223518371582
            },
            "rotation": {
                "x": 0.7071068286895752,
                "y": 0,
                "z": 0,
                "w": -0.7071068286895752
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": true,
            "intensity": 10,
            "exponent": 1,
            "cutoff": 90,
            "falloffRadius": 2
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 128.3232,
                "y": -4.1531,
                "z": 1.6609
            },
            "name": "FLAG_ROOM_LIGHT_" + team,
            "dimensions": {
                "x":14.422473907470703,
                "y":14.422473907470703,
                "z":22.437387466430664
            },
            "rotation": {
                "x": 0.7071068286895752,
                "y": 0,
                "z": 0,
                "w": -0.7071068286895752
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": true,
            "intensity": 15,
            "exponent": 15,
            "cutoff": 40,
            "falloffRadius": 2
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 6.2952,
                "y": 5.1257,
                "z": 0.0
            },
            "name": "BRIDGE_LIGHT_" + team,
            "dimensions": {"x":45.148406982421875,"y":45.148406982421875,"z":45.148406982421875},
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": false,
            "intensity": 10,
            "exponent": 15,
            "cutoff": 40,
            "falloffRadius": 1
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Model",
            "localPosition": {
                "x": 67.1079,
                "y": -5.5293,
                "z": 5.9536
            },
            "name": "LAMPADAIRE_1R_" + team,
            "locked": true,
            "dimensions": {
                "x": 0.2867816984653473,
                "y": 3.595228433609009,
                "z": 0.3295843005180359
            },
            "renderWithZones": renderWithZones,
            "parentID": entityID,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "shapeType": "box",
            "modelURL": ROOT + "models/lantern" + team + ".fst",
            "useOriginalPivot": true
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 67.1079,
                "y": -5.5293,
                "z": 5.9536
            },
            "name": "LAMPADAIRE_1R_LIGHT_" + team,
            "dimensions": {"x":45.148406982421875,"y":45.148406982421875,"z":45.148406982421875},
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": false,
            "intensity": 10,
            "exponent": 15,
            "cutoff": 40,
            "falloffRadius": 1
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Model",
            "localPosition": {
                "x": 41.9575,
                "y": -1.1699,
                "z": 14.9473
            },
            "name": "LAMPADAIRE_2R_" + team,
            "locked": true,
            "dimensions": {
                "x": 0.2867816984653473,
                "y": 3.595228433609009,
                "z": 0.3295843005180359
            },
            "renderWithZones": renderWithZones,
            "parentID": entityID,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "shapeType": "box",
            "modelURL": ROOT + "models/lantern" + team + ".fst",
            "useOriginalPivot": true
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 41.9575,
                "y": -1.1699,
                "z": 14.9473
            },
            "name": "LAMPADAIRE_2R_LIGHT_" + team,
            "dimensions": {"x":45.148406982421875,"y":45.148406982421875,"z":45.148406982421875},
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": false,
            "intensity": 10,
            "exponent": 15,
            "cutoff": 40,
            "falloffRadius": 1
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Model",
            "localPosition": {
                "x": 37.9287,
                "y": 0.8435,
                "z": -12.0247
            },
            "name": "LAMPADAIRE_2L_" + team,
            "locked": true,
            "dimensions": {
                "x": 0.2867816984653473,
                "y": 3.595228433609009,
                "z": 0.3295843005180359
            },
            "renderWithZones": renderWithZones,
            "parentID": entityID,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "shapeType": "box",
            "modelURL": ROOT + "models/lantern" + team + ".fst",
            "useOriginalPivot": true
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 37.9287,
                "y": 0.8435,
                "z": -12.0247
            },
            "name": "LAMPADAIRE_2L_LIGHT_" + team,
            "dimensions": {"x":45.148406982421875,"y":45.148406982421875,"z":45.148406982421875},
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": false,
            "intensity": 10,
            "exponent": 15,
            "cutoff": 40,
            "falloffRadius": 1
        }, "local");
        entitiesToDelete.push(id);
        
        id = Entities.addEntity({
            "type": "Model",
            "localPosition": {
                "x": 74.1296,
                "y": -6.7546,
                "z": -12.0247
            },
            "name": "LAMPADAIRE_1L_" + team,
            "locked": true,
            "dimensions": {
                "x": 0.2867816984653473,
                "y": 3.595228433609009,
                "z": 0.3295843005180359
            },
            "renderWithZones": renderWithZones,
            "parentID": entityID,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "shapeType": "box",
            "modelURL": ROOT + "models/lantern" + team + ".fst",
            "useOriginalPivot": true
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 74.1296,
                "y": -6.7546,
                "z": -12.0247
            },
            "name": "LAMPADAIRE_1L_LIGHT_" + team,
            "dimensions": {"x":45.148406982421875,"y":45.148406982421875,"z":45.148406982421875},
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": false,
            "intensity": 10,
            "exponent": 15,
            "cutoff": 40,
            "falloffRadius": 1
        }, "local");
        entitiesToDelete.push(id);
        
        //TELEPORTERS ===========================

        id = Entities.addEntity({
            "type": "Box",
            "localPosition": {
                "x": 116.04,
                "y": -6.9600,
                "z": 10.9646
            },
            "localRotation": Quat.IDENTITY,
            "parentID": entityID,
            "visible": false,
            "name": "TELEPORTER_LEFT_" + team, //pass
            "locked": true,
            "dimensions": {
                "x": 1.5,
                "y": 3,
                "z": 1.5
            },
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "collisionless": true,
            "ignoreForCollisions": true,
            "shape": "Cube",
            "script": ROOT + "localTeleporter.js",
            "description": '{"team": "' + team + '", "teamColor": ' + JSON.stringify(lightColor) + ', "localPosition": { "x": 2.1572, "y": 34.6558, "z": 9.3582}, "localRotation": ' + JSON.stringify(Quat.fromVec3Degrees( { "x": 0, "y": -90, "z": 0} ))+ '}'
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Box",
            "localPosition": {
                "x": 116.04,
                "y": -6.9600,
                "z": -7.8650
            },
            "localRotation": Quat.IDENTITY,
            "parentID": entityID,
            "visible": false,
            "name": "TELEPORTER_RIGHT_" + team, //pass
            "locked": true,
            "dimensions": {
                "x": 1.5,
                "y": 3,
                "z": 1.5
            },
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "collisionless": true,
            "ignoreForCollisions": true,
            "shape": "Cube",
            "script": ROOT + "localTeleporter.js",
            "description": '{"team": "' + team + '", "teamColor": ' + JSON.stringify(lightColor) + ', "localPosition": { "x": 1.7554, "y": 53.0559, "z": -8.3364}, "localRotation": ' + JSON.stringify(Quat.fromVec3Degrees( { "x": 0, "y": 270, "z": 0} ))+ '}'
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Box",
            "localPosition": {
                "x": 123.2969,
                "y": -6.9600,
                "z": 1.5942
            },
            "localRotation": Quat.IDENTITY,
            "parentID": entityID,
            "visible": false,
            "name": "TELEPORTER_FLAG_ROOM_" + team, //to test
            "locked": true,
            "dimensions": {
                "x": 1.5,
                "y": 3,
                "z": 1.5
            },
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "collisionless": true,
            "ignoreForCollisions": true,
            "shape": "Cube",
            "script": ROOT + "localTeleporter.js",
            "description": '{"team": "' + team + '", "teamColor": ' + JSON.stringify(lightColor) + ', "localPosition": { "x": 16.0547, "y": 16.6794, "z": -0.0122}, "localRotation": ' + JSON.stringify(Quat.fromVec3Degrees( { "x": 0, "y": 270, "z": 0} ))+ '}'
        }, "local");
        entitiesToDelete.push(id);
        
        id = Entities.addEntity({
            "type": "Box",
            "localPosition": {
                "x": 108.2891,
                "y": 9.6707,
                "z": 1.5942
            },
            "localRotation": Quat.IDENTITY,
            "parentID": entityID,
            "visible": false,
            "name": "TELEPORTER_GATE_KEEPER_" + team, //pass
            "locked": true,
            "dimensions": {
                "x": 1.5,
                "y": 3,
                "z": 1.5
            },
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "collisionless": true,
            "ignoreForCollisions": true,
            "shape": "Cube",
            "script": ROOT + "localTeleporter.js",
            "description": '{"team": "' + team + '", "teamColor": ' + JSON.stringify(lightColor) + ', "localPosition": { "x": -16.2549, "y": -16.6560, "z": -0.0122}, "localRotation": ' + JSON.stringify(Quat.fromVec3Degrees( { "x": 0, "y": 90, "z": 0} ))+ '}'
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Box",
            "localPosition": {
                "x": 115.0034,
                "y": 27.6858,
                "z": 1.5942
            },
            "localRotation": Quat.IDENTITY,
            "parentID": entityID,
            "visible": false,
            "name": "TELEPORTER_SNIPER_ROOM_" + team, //pass
            "locked": true,
            "dimensions": {
                "x": 1.5,
                "y": 3,
                "z": 1.5
            },
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "collisionless": true,
            "ignoreForCollisions": true,
            "shape": "Cube",
            "script": ROOT + "localTeleporter.js",
            "description": '{"team": "' + team + '", "teamColor": ' + JSON.stringify(lightColor) + ', "localPosition": { "x": -1.0366, "y": -34.6711, "z": -7.9187}, "localRotation": ' + JSON.stringify(Quat.fromVec3Degrees( { "x": 0, "y": 180, "z": 0} ))+ '}'
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Box",
            "localPosition": {
                "x": 114.2847,
                "y": 46.0959,
                "z": -1.8455
            },
            "localRotation": Quat.IDENTITY,
            "parentID": entityID,
            "visible": false,
            "name": "TELEPORTER_ROOF_" + team, //pass
            "locked": true,
            "dimensions": {
                "x": 1.5,
                "y": 3,
                "z": 1.5
            },
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "collisionless": true,
            "ignoreForCollisions": true,
            "shape": "Cube",
            "script": ROOT + "localTeleporter.js",
            "description": '{"team": "' + team + '", "teamColor": ' + JSON.stringify(lightColor) + ', "localPosition": { "x": -1.7554, "y": -53.0813, "z": 4.4490}, "localRotation": ' + JSON.stringify(Quat.fromVec3Degrees( { "x": 0, "y": 0, "z": 0} ))+ '}'
        }, "local");
        entitiesToDelete.push(id);

        //4 fires
        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 94.8875,
                "y": -7.0762,
                "z": -2.8420
            },
            "name": "RIGHT_FIRE_LIGHT_" + team,
            "dimensions": {"x":35.148406982421875,"y":35.148406982421875,"z":35.148406982421875},
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": false,
            "intensity": 10,
            "exponent": 15,
            "cutoff": 40,
            "falloffRadius": 1
        }, "local");
        entitiesToDelete.push(id);
        
        id = Entities.addEntity({
            "type": "Light",
            "localPosition": {
                "x": 94.8875,
                "y": -7.0762,
                "z": 5.9294
            },
            "name": "LEFT_FIRE_LIGHT_" + team,
            "dimensions": {"x":35.148406982421875,"y":35.148406982421875,"z":35.148406982421875},
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "damping": 0,
            "angularDamping": 0,
            "color": lightColor,
            "isSpotlight": false,
            "intensity": 10,
            "exponent": 15,
            "cutoff": 40,
            "falloffRadius": 1
        }, "local");
        entitiesToDelete.push(id);
        
        id = Entities.addEntity({
            "type": "ParticleEffect",
            "localPosition": {
                "x": 94.8875,
                "y": -8.4553,
                "z": -2.8420
            },
            "name": "FIRE_1_" + team,
            "dimensions": {
                "x": 11.211999893188477,
                "y": 11.211999893188477,
                "z": 11.211999893188477
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "color": lightColor,
            "shapeType": "ellipsoid",
            "alpha": 0.10000000149011612,
            "textures": ROOT + "images/fog.png",
            "maxParticles": 400,
            "lifespan": 2,
            "emitRate": 200,
            "emitSpeed": 0,
            "speedSpread": 0,
            "emitOrientation": {
                "x": 0,
                "y": 0,
                "z": 0,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.30000001192092896,
                "y": 0.10000000149011612,
                "z": 0.30000001192092896
            },
            "emitRadiusStart": 0,
            "polarFinish": 3.1415927410125732,
            "emitAcceleration": {
                "x": 0,
                "y": 1.399999976158142,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0.4000000059604645,
                "z": 0
            },
            "particleRadius": 1,
            "radiusSpread": 0.20000000298023224,
            "radiusStart": 0.30000001192092896,
            "radiusFinish": 0.5,
            "colorStart": {
                "red": 255,
                "green": 255,
                "blue": 255
            },
            "colorFinish": lightColor,
            "alphaSpread": 0.07000000029802322,
            "alphaStart": 0.15000000596046448,
            "alphaFinish": 0,
            "emitterShouldTrail": true,
            "spinSpread": 1.5700000524520874,
            "spinStart": null,
            "spinFinish": null
        }, "local");
        entitiesToDelete.push(id);
        
        id = Entities.addEntity({
            "type": "ParticleEffect",
            "localPosition": {
                "x": 94.8875,
                "y": -8.4553,
                "z": 5.9294
            },
            "name": "FIRE_2_" + team,
            "dimensions": {
                "x": 11.211999893188477,
                "y": 11.211999893188477,
                "z": 11.211999893188477
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "color": lightColor,
            "shapeType": "ellipsoid",
            "alpha": 0.10000000149011612,
            "textures": ROOT + "images/fog.png",
            "maxParticles": 400,
            "lifespan": 2,
            "emitRate": 200,
            "emitSpeed": 0,
            "speedSpread": 0,
            "emitOrientation": {
                "x": 0,
                "y": 0,
                "z": 0,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.30000001192092896,
                "y": 0.10000000149011612,
                "z": 0.30000001192092896
            },
            "emitRadiusStart": 0,
            "polarFinish": 3.1415927410125732,
            "emitAcceleration": {
                "x": 0,
                "y": 1.399999976158142,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0.4000000059604645,
                "z": 0
            },
            "particleRadius": 1,
            "radiusSpread": 0.20000000298023224,
            "radiusStart": 0.30000001192092896,
            "radiusFinish": 0.5,
            "colorStart": {
                "red": 255,
                "green": 255,
                "blue": 255
            },
            "colorFinish": lightColor,
            "alphaSpread": 0.07000000029802322,
            "alphaStart": 0.15000000596046448,
            "alphaFinish": 0,
            "emitterShouldTrail": true,
            "spinSpread": 1.5700000524520874,
            "spinStart": null,
            "spinFinish": null
        }, "local");
        entitiesToDelete.push(id);
        
        
        id = Entities.addEntity({
            "type": "ParticleEffect",
            "localPosition": {
                "x": 111.4995,
                "y": 48.4709,
                "z": 4.9456
            },
            "name": "FIRE_3_" + team,
            "dimensions": {
                "x": 11.211999893188477,
                "y": 11.211999893188477,
                "z": 11.211999893188477
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "color": lightColor,
            "shapeType": "ellipsoid",
            "alpha": 0.10000000149011612,
            "textures": ROOT + "images/fog.png",
            "maxParticles": 400,
            "lifespan": 2,
            "emitRate": 200,
            "emitSpeed": 0,
            "speedSpread": 0,
            "emitOrientation": {
                "x": 0,
                "y": 0,
                "z": 0,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.30000001192092896,
                "y": 0.10000000149011612,
                "z": 0.30000001192092896
            },
            "emitRadiusStart": 0,
            "polarFinish": 3.1415927410125732,
            "emitAcceleration": {
                "x": 0,
                "y": 1.399999976158142,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0.4000000059604645,
                "z": 0
            },
            "particleRadius": 1,
            "radiusSpread": 0.20000000298023224,
            "radiusStart": 0.30000001192092896,
            "radiusFinish": 0.5,
            "colorStart": {
                "red": 255,
                "green": 255,
                "blue": 255
            },
            "colorFinish": lightColor,
            "alphaSpread": 0.07000000029802322,
            "alphaStart": 0.15000000596046448,
            "alphaFinish": 0,
            "emitterShouldTrail": true,
            "spinSpread": 1.5700000524520874,
            "spinStart": null,
            "spinFinish": null
        }, "local");
        entitiesToDelete.push(id);
        
        id = Entities.addEntity({
            "type": "ParticleEffect",
            "localPosition": {
                "x": 111.4995,
                "y": 48.4709,
                "z": -1.7961
            },
            "name": "FIRE_4_" + team,
            "dimensions": {
                "x": 11.211999893188477,
                "y": 11.211999893188477,
                "z": 11.211999893188477
            },
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "color": lightColor,
            "shapeType": "ellipsoid",
            "alpha": 0.10000000149011612,
            "textures": ROOT + "images/fog.png",
            "maxParticles": 400,
            "lifespan": 2,
            "emitRate": 200,
            "emitSpeed": 0,
            "speedSpread": 0,
            "emitOrientation": {
                "x": 0,
                "y": 0,
                "z": 0,
                "w": 1
            },
            "emitDimensions": {
                "x": 0.30000001192092896,
                "y": 0.10000000149011612,
                "z": 0.30000001192092896
            },
            "emitRadiusStart": 0,
            "polarFinish": 3.1415927410125732,
            "emitAcceleration": {
                "x": 0,
                "y": 1.399999976158142,
                "z": 0
            },
            "accelerationSpread": {
                "x": 0,
                "y": 0.4000000059604645,
                "z": 0
            },
            "particleRadius": 1,
            "radiusSpread": 0.20000000298023224,
            "radiusStart": 0.30000001192092896,
            "radiusFinish": 0.5,
            "colorStart": {
                "red": 255,
                "green": 255,
                "blue": 255
            },
            "colorFinish": lightColor,
            "alphaSpread": 0.07000000029802322,
            "alphaStart": 0.15000000596046448,
            "alphaFinish": 0,
            "emitterShouldTrail": true,
            "spinSpread": 1.5700000524520874,
            "spinStart": null,
            "spinFinish": null
        }, "local");
        entitiesToDelete.push(id);
        
        id = Entities.addEntity({
            "type": "Box",
            "localPosition":{
                "x": 119.1147,
                "y": -7.0654,
                "z": -6.3276
            },
            "name": "GRAVITY CLOCK",
            "dimensions": {
                "x": 2.367738723754883,
                "y": 0.607806384563446,
                "z": 0.002970418892800808
            },
            "localRotation": {"x":0,"y":0,"z":0,"w":1},
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "script": ROOT + "gravityClock.js",
            "color": {
                "red": 0,
                "green": 0,
                "blue": 0
            },
            "shape": "Cube"
        }, "local");
        entitiesToDelete.push(id);

        id = Entities.addEntity({
            "type": "Box",
            "localPosition":{
                "x": 119.1147,
                "y": -6.0654,
                "z": -6.3276
            },
            "name": "CLOCK D29",
            "dimensions": {
                "x": 1.2,
                "y": 0.9,
                "z": 0.01
            },
            "localRotation": {"x":0,"y":0,"z":0,"w":1},
            "parentID": entityID,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "script": "https://aleziakurdis.github.io/inertia/clocks/d29Clock.js",
            "color": {
                "red": 0,
                "green": 0,
                "blue": 0
            },
            "shape": "Cube"
        }, "local");
        entitiesToDelete.push(id);
        
        updatePlayersDashboard([]);
        displayFameTime("");
    };

    function onMessageReceived(channel, message, sender, localOnly) {
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if (data.action === "PLAYER_LIST") {
                updatePlayersDashboard(data.players);
            } else if (data.action === "MANAGE_START_BUTTON") {
                manageStartButton(data.visible); //true|false
            } else if (data.action === "DISPLAY_GAME_TIME") {
                displayFameTime(data.value);
            }
        }
    }
    
    function displayFameTime(strValue) {
        if (gameTimeID === Uuid.NULL) {
            //create
            gameTimeID = Entities.addEntity({
                "type": "Text",
                "name": "GAME TIME - " + team,
                "dimensions": {"x":5,"y":1,"z":0.009999999776482582},
                "localPosition": {
                    "x": 122.51,
                    "y": -2.0,
                    "z": 1.57325
                },
                "localRotation": Quat.fromVec3Degrees( {"x": 0.0,"y": 270,"z": 0.0} ),
                "parentID": thisEntityID,
                "text": strValue,
                "textColor": {"red": 255,  "green": 255, "blue": 255 },
                "lineHeight": 0.8,
                "leftMargin": 0.1,
                "rightMargin": 0.1,
                "topMargin": 0.05,
                "bottomMargin": 0.05,
                "alignment": "center",
                "unlit": true,
                "renderWithZones": renderWithZones
            }, "local");
        } else {
            //update
            Entities.editEntity(gameTimeID, {
                "text": strValue
            });
        }
    }
    
    function manageStartButton(visible) {
        if (startButtonID !== Uuid.NULL) {
            Entities.deleteEntity(startButtonID);
            startButtonID = Uuid.NULL;
            Entities.deleteEntity(swapButtonID);
            swapButtonID = Uuid.NULL;
        }
        if (visible) {
            startButtonID = Entities.addEntity({
                "name": "START_BUTTON_" + team,
                "renderWithZones": renderWithZones,
                "parentID": thisEntityID,
                "script": ROOT + "start.js",
                "type": "Model",
                "dimensions": {"x":1,"y":0.5,"z":0.1},
                "localPosition": {
                    "x": 122.51,
                    "y": -7.1494,
                    "z": 5.2881
                },
                "localRotation": Quat.fromVec3Degrees( {"x": 0.0,"y": 270,"z": 0.0} ),
                "grab": {
                    "grabbable": false
                },
                "damping": 0,
                "angularDamping": 0,
                "shapeType": "static-mesh",
                "modelURL": ROOT + "models/startButton.glb",
                "useOriginalPivot": true
            },"local");
            
            swapButtonID = Entities.addEntity({
                "name": "SWAP_BUTTON_" + team,
                "renderWithZones": renderWithZones,
                "parentID": thisEntityID,
                "script": ROOT + "swap.js",
                "type": "Model",
                "dimensions": {"x":0.395,"y":0.395,"z":0.08},
                "localPosition": {
                    "x": 122.51,
                    "y": -7.1494,
                    "z": 1.57325
                },
                "localRotation": Quat.fromVec3Degrees( {"x": 0.0,"y": 270,"z": 0.0} ),
                "grab": {
                    "grabbable": false
                },
                "damping": 0,
                "angularDamping": 0,
                "shapeType": "static-mesh",
                "modelURL": ROOT + "models/swapButton.glb",
                "useOriginalPivot": true
            },"local");
        }
    }

    function updatePlayersDashboard(players) {
        var i, localColor, visitorColor;
        var localList = team + " TEAM:";
        var visitorList = otherTeam + " TEAM:";
        var name;
        for (i = 0; i < players.length; i++) {
            name = AvatarManager.getAvatar(players[i].avatarID).displayName;
            if (players[i].team === team) {
                localList = localList + "\n - " + name;
            } else {
                visitorList = visitorList + "\n - " + name;
            }
        }
        
        if (team === "RED") {
            localColor = RED_COLOR;
            visitorColor = BLUE_COLOR;
        } else {
            localColor = BLUE_COLOR;
            visitorColor = RED_COLOR;
        }
        if (localPlayerListID === Uuid.NULL) {
            //create
            localPlayerListID = Entities.addEntity({
                "type": "Text",
                "name": "LOCAL PLAYERS - " + team,
                "dimensions": {"x":2.506094217300415,"y":2.581923007965088,"z":0.009999999776482582},
                "localPosition": {
                    "x": 122.51,
                    "y": -6.5530,
                    "z": 0.0056
                },
                "localRotation": Quat.fromVec3Degrees( {"x": 0.0,"y": 270,"z": 0.0} ),
                "parentID": thisEntityID,
                "text": localList,
                "textColor": localColor,
                "lineHeight": 0.2,
                "leftMargin": 0.1,
                "rightMargin": 0.1,
                "topMargin": 0.05,
                "bottomMargin": 0.05,
                "unlit": true,
                "renderWithZones": renderWithZones
            }, "local");
        } else {
            //update
            Entities.editEntity(localPlayerListID, {
                "text": localList
            });
        }

        if (visitorPlayerListID === Uuid.NULL) {
            //create
            visitorPlayerListID = Entities.addEntity({
                "type": "Text",
                "name": "VISITOR PLAYERS - " + team,
                "dimensions": {"x":2.506094217300415,"y":2.581923007965088,"z":0.009999999776482582},
                "localPosition": {
                    "x": 122.51,
                    "y": -6.5530,
                    "z": 3.1409
                },
                "localRotation": Quat.fromVec3Degrees( {"x": 0.0,"y": 270,"z": 0.0} ),
                "parentID": thisEntityID,
                "text": visitorList,
                "textColor": visitorColor,
                "lineHeight": 0.2,
                "leftMargin": 0.1,
                "rightMargin": 0.1,
                "topMargin": 0.05,
                "bottomMargin": 0.05,
                "unlit": true,
                "renderWithZones": renderWithZones
            }, "local");
        } else {
            //update
            Entities.editEntity(visitorPlayerListID, {
                "text": visitorList
            });
        }

    }

    this.unload = function(entityID) {
        var i;
        for (i=0; i < entitiesToDelete.length; i++) {
            Entities.deleteEntity(entitiesToDelete[i]);
            
        }
        entitiesToDelete = [];
        
        if (localPlayerListID !== Uuid.NULL) {
            Entities.deleteEntity(localPlayerListID);
            localPlayerListID = Uuid.NULL;
        }
        
        if (visitorPlayerListID !== Uuid.NULL) {
            Entities.deleteEntity(visitorPlayerListID);
            visitorPlayerListID = Uuid.NULL;
        }

        if (gameTimeID !== Uuid.NULL) {
            Entities.deleteEntity(gameTimeID);
            gameTimeID = Uuid.NULL;
        }

        manageStartButton(false);
        
        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(channelComm);
    };

})
