//
//  enterUMCrectiline.js
//
//  Created by Alezia Kurdis, July 15th, 2026.
//  Copyright 2026, Overte e.V.
//
//  Teleport to UMC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    let thisEntityID;
    let thisPosition;
    let thisRotation;

    this.preload = function(entityID) {
        thisEntityID = entityID;
        let properties = Entities.getEntityProperties(thisEntityID, ["position", "rotation"]);
        thisPosition = properties.position;
        thisRotation = properties.rotation;
    };


    
    this.enterEntity = function(entityID) {
        MyAvatar.position = Vec3.sum(thisPosition, Vec3.multiplyQbyV(thisRotation, {x: 0, y: 0, z: -2.5}));
        MyAvatar.orientation = thisRotation;
        location.storeCurrentAddress();
        
        Window.location = "hifi://vankh/8450.26,-2501.60,7426.4/0,0.032041,0,0.999487";
    };

})