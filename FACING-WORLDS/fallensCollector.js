//
//  fallensCollector.js
//
//  Created by Alezia Kurdis, August 14th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Collecting player that fall and make then revive.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("fallensCollector.js")[0];
    var channelComm = "ak.ctf.ac.communication";

    this.enterEntity = function(entityID) {
        var message = {
            "action": "REVIVE",
            "avatarID": MyAvatar.sessionUUID,
            "by": Uuid.NULL
        };
        Messages.sendMessage(channelComm, JSON.stringify(message));
    }; 
    
})
