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
        var message;
        var displayText = "";
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if (data.action === "REVIVE" && data.avatarID === MyAvatar.sessionUUID) {
                var team = isPlayerKnown(data.avatarID);
                if (team === "NONE") {
                    team = determineTeamForNewPlayer();
                    message = {
                        "action": "SET_PLAYER_TEAM",
                        "avatarID": data.avatarID,
                        "team": team
                    };
                    Messages.sendMessage(channelComm, JSON.stringify(message));
                    assignLandingPoint(team);
                } else {
                    assignLandingPoint(team);
                }
            } else if (data.action === "PLAYER_LIST") {
                players = data.players;
            }
        }
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
        return Team;
    }

    function assignLandingPoint(team) {
        //Determine a landing point from 2 list of landing points... then tp MyAvatar there
        
        
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
