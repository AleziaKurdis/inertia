//
//  gravitySetter.js
//
//  Created by Alezia Kurdis on September 30th, 2024.
//  Copyright 2024 Alezia Kurdis.
//
//  Set the gravity to everyone.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    var jsMainFileName = "gravitySetter.js";
    var ROOT = Script.resolvePath('').split(jsMainFileName)[0];
    
    var originalGravity;
    var currentGravity;
    
    var updateTimerInterval = 10000; //10sec.
    var processTimer = 0;
    var generatorPosition;
    var range;
    
    this.preload = function(entityID) {
        originalGravity = MyAvatar.getGravity();
        var properties = Entities.getEntityProperties(entityID, ["userData", "position"]);
        var userData = JSON.parse(properties.userData);
        generatorPosition = properties.position;
        range = userData.radius;
        currentGravity = userData.gravity;
        manageGravity();
        Script.update.connect(myTimer);
    };

    function myTimer(deltaTime) {
        var today = new Date();
        
        if ((today.getTime() - processTimer) > updateTimerInterval ) {
            
            manageGravity();
            
            today = new Date();
            processTimer = today.getTime();
        }
    }
    function manageGravity() {
        if (Vec3.distance(generatorPosition, MyAvatar.position) > range ) {
            if (MyAvatar.getGravity() !== originalGravity) {
                MyAvatar.setGravity(originalGravity);
            }
        } else {
            if (MyAvatar.getGravity() !== currentGravity) {
                MyAvatar.setGravity(currentGravity);
            }
        }
    }
    
    this.unload = function(entityID) {
        MyAvatar.setGravity(originalGravity);
        Script.update.disconnect(myTimer);
    };

})
