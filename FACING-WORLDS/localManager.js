//
//  localManager.js
//
//  Created by Alezia Kurdis, August 14th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Local side game manager.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var ROOT = Script.resolvePath('').split("localManager.js")[0];
    
    var channelComm = "ak.ctf.ac.communication";
    
    var processTimer = 0;
    var TIMER_INTERVAL = 1000;
    
    var thisEntityID = Uuid.NULL;
    var thisRenderWithZones;
    var thisPosition;
    
    var players = [];
    
    this.preload = function(entityID) {
        Workload.getConfig("controlViews")["regulateViewRanges"] = false;
        
        thisEntityID = entityID;
        var properties = Entities.getEntityProperties(entityID,["renderWithZones", "position"]);
        thisRenderWithZones = properties.renderWithZones;
        thisPosition = properties.position;
        
        //Request the current player list
        var message = {
            "action": "GET_PLAYER_LIST"
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));
        
        
        
        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);
        //Script.update.connect(myTimer);
        
    }
/*
    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > TIMER_INTERVAL) {
            
            //DO SOMETHING HERE
            
            today = new Date();
            processTimer = today.getTime();
        }
    }
*/
    function onMessageReceived(channel, message, sender, localOnly) {
        var messageToSent;
        var displayText = "";
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if (data.action === "REVIVE" && data.avatarID === MyAvatar.sessionUUID) {
                var team = isPlayerKnown(data.avatarID);
                if (team === "NONE") {
                    team = determineTeamForNewPlayer();
                    messageToSent = {
                        "action": "SET_PLAYER_TEAM",
                        "avatarID": data.avatarID,
                        "team": team
                    };
                    Messages.sendMessage(channelComm, JSON.stringify(messageToSent));
                    assignLandingPoint(team);
                } else {
                    assignLandingPoint(team);
                    showDeath();
                }
            } else if (data.action === "PLAYER_LIST") {
                players = data.players;
            }
        }
    }

    function showDeath() {
        var deathID = Entities.addEntity({
            "type": "ParticleEffect",
            "name": "DEATH",
            "dimensions": {
                "x": 2.9000000953674316,
                "y": 2.9000000953674316,
                "z": 2.9000000953674316
            },
            "parentID": MyAvatar.sessionUUID,
            "localPosition": {
                "x": 0,
                "y": 1,
                "z": 0
            },
            "grab": {
                "grabbable": false
            },
            "shapeType": "ellipsoid",
            "color": {
                "red": 255,
                "green": 0,
                "blue": 0
            },
            "alpha": 0,
            "textures": ROOT + "images/skull.png",
            "maxParticles": 240,
            "lifespan": 2,
            "emitRate": 80,
            "emitSpeed": 0,
            "speedSpread": 0,
            "emitOrientation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "emitDimensions": {
                "x": 2,
                "y": 2,
                "z": 2
            },
            "polarFinish": 3.1415927410125732,
            "emitAcceleration": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "particleRadius": 0.3499999940395355,
            "radiusSpread": 0.10000000149011612,
            "radiusStart": 0,
            "radiusFinish": null,
            "colorStart": {
                "red": 255,
                "green": 166,
                "blue": 166
            },
            "colorFinish": {
                "red": null,
                "green": null,
                "blue": null
            },
            "alphaStart": 1,
            "alphaFinish": 0,
            "emitterShouldTrail": true,
            "spinStart": null,
            "spinFinish": null,
            "rotateWithEntity": true
        },"local");
        Script.setTimeout(function () {
            Entities.deleteEntity(deathID);
        }, 4000);
    }

    function isPlayerKnown(avatarID) {
        if (players.length > 0) {
            var team = "NONE";
            for (var i = 0; i < players.length; i++) {
                if (players[i].avatarID === avatarID) {
                    team = players[i].team;
                    break;
                }
            }
            return team;
        } else {
            return "NONE";
        }
    }

    function determineTeamForNewPlayer() {
        if (players.length > 0) {
            var bleu = 0;
            var red = 0;
            for (var i = 0; i < players.length; i++) {
                if (players[i].team === "RED") {
                    red = red + 1;
                } else {
                    bleu = bleu + 1;
                }
            }
            if (bleu > red) {
                return "RED";
            } else if (blue === red) {
                return getRandomTeam();
            } else {
                return "BLUE";
            }
        } else {
            return getRandomTeam();
        }
    }

    function getRandomTeam() {
        var team = "RED";
        if (Math.random() < 0.5) {
            team = "BLUE";
        }
        return team;
    }

    function assignLandingPoint(team) {
        var tp;
        var redTP = [
            {"position": {"x": -126.31, "y": -8.42, "z": 4.08}, "azimuth": 90},
            {"position": {"x": -126.31, "y": -8.42, "z": -6.95}, "azimuth": 90},
            {"position": {"x": -113.15, "y": -8.42, "z": -8.83}, "azimuth": 180},
            {"position": {"x": -113.5, "y": -8.42, "z": 5.7}, "azimuth": 0}, 
            {"position": {"x": -104.66, "y": 26.25, "z": -3.16}, "azimuth": 270}, 
            {"position": {"x": -121.52, "y": -9.71, "z": -17.29}, "azimuth": 0}
        ];
        
        var blueTP = [
            {"position": {"x": 126.08, "y": -8.42, "z": -3.89}, "azimuth": 270},
            {"position": {"x": 126.06, "y": -8.42, "z": 7.23}, "azimuth": 270},
            {"position": {"x": 113.71, "y": -8.42, "z": 9.13}, "azimuth": 0}, 
            {"position": {"x": 113.74, "y": -8.42, "z": -5.68}, "azimuth": 180}, 
            {"position": {"x": 104.79, "y": 26.25, "z": 3.06}, "azimuth": 90},
            {"position": {"x": 121.23, "y": -9.74, "z": 17.15}, "azimuth": 180}
        ];
        
        if (team === "RED") {
            tp = redTP[Math.floor(Math.random() * redTP.length)];
        } else {
            tp = blueTP[Math.floor(Math.random() * blueTP.length)];
        }
        MyAvatar.position = Vec3.sum(thisPosition, tp.position);
        MyAvatar.orientation = Quat.fromVec3Degrees({ "x": 0, "y": tp.azimuth, "z": 0 });
        
    }

    this.unload = function(entityID) {
        /*
        if (startTriggerId !== Uuid.NULL) {
            Entities.deleteEntity(startTriggerId);
            startTriggerId = Uuid.NULL;
        }
        */

        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(channelComm);
        //Script.update.disconnect(myTimer);
        Workload.getConfig("controlViews")["regulateViewRanges"] = true;
    };

    Script.scriptEnding.connect(function () {
        //do nothing
    });
    
})
