//
//  triggerObservatory.js
//
//  Created by Alezia Kurdis, April 3rd 2024.
//  Copyright 2024 Overte e.V.
//
//  trigger beacons from Observatory or Service point.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    const CHANNEL = "overte.ak.intertia.kopra.beacons"; 
    let emphasis;
    
    this.preload = function(entityID) {
        emphasis = Entities.getEntityProperties(entityID, ["description"]).description;
    }
    
    this.enterEntity = function(entityID) {
        let message = {
            "action": "SHOW_BEACONS",
            "emphasisNo": emphasis,
            "showOnlyEmphasis": false,
            "duration": 1200
        };
        Messages.sendMessage(CHANNEL, message, true);
    };

    this.leaveEntity = function(entityID) {
        let message = {
            "action": "HIDE_BEACONS"
        };
        Messages.sendMessage(CHANNEL, message, true);
    };
})
