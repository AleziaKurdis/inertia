//
//  ritual.js
//
//  Created by Alezia Kurdis, April 6th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Ritual manager for the Zamyru Temple
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    const ROOT = Script.resolvePath('').split("ritual.js")[0];
    
    const channelComm = "ak.ukong.ritual.communications";
    
    let ritualOngoing = false;
    
    let processTimer = 0;
    const TIMER_INTERVAL = 1000;
    
    let thisEntityID;
    let thisRenderWithZones;
    
    let ritualId = Uuid.NONE;
    let ritualTime = 0;
    
    this.preload = function(entityID) {
        Messages.subscribe(channelComm);
        Messages.messageReceived.connect(onMessageReceived);
        
        thisEntityID = entityID;
        let properties = Entities.getEntityProperties(entityID,["renderWithZones"]);
        thisRenderWithZones = properties.renderWithZones;
    };

    function myTimer(deltaTime) {
        var today = new Date();
        if ((today.getTime() - processTimer) > TIMER_INTERVAL) {
            
            //DO SOMETHING HERE
            processRitual();
            
            today = new Date();
            processTimer = today.getTime();
        }
    }

    function onMessageReceived(channel, message, sender, localOnly) {
        var messageToSent;
        var i;
        var displayText = "";
        if (channel === channelComm) {
            var data = JSON.parse(message);
            if (data.action === "START_ZAMYRU_RITUAL_OF_DEATH") {
                if (!ritualOngoing) {
                    //start ritual here
                    ritualTime = 0;
                    Script.update.connect(myTimer);
                    ritualOngoing = true;
                }
            }
        }
    }

    function processRitual() {
        ritualTime++;
        if (ritualTime === 1) {
            //initiate (build fires, light and effect
            //start TAM TAM 1
        } else if (ritualTime === 60) {
            //start TAMTAM  2
        } else if (ritualTime === 68) {
            //stop TAMTAM  1
        } else if (ritualTime === 120) {
            //start TAMTAM  3
        } else if (ritualTime === 128) {
            //stop TAMTAM  2
        } else if (ritualTime === 180) {
            //ending the ritual
            if (ritualId !== Uuid.NONE) {
                Entities.deleteEntity(ritualId);
                ritualId = Uuid.NONE;
            }
            ritualOngoing = false;
            Script.update.disconnect(myTimer);
        }
    }

    this.unload = function(entityID) {
        if (ritualId !== Uuid.NONE) {
            Entities.deleteEntity(ritualId);
            ritualId = Uuid.NONE;
        }
        if (ritualOngoing) {
            Script.update.disconnect(myTimer);
        }
        ritualOngoing = false;
        
        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(channelComm);
        
    };

    Script.scriptEnding.connect(function () {
        //do nothing
    });
    
})
