//
//  towerTeleportEliteDown.js
//
//  Created by Alezia Kurdis, May 1st, 2024.
//  Copyright 2024, Overte e.V.
//
//  tower tp down.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("towerTeleportEliteDown.js")[0];
    
    this.preload = function(entityID) {
        
    }

    this.enterEntity = function(entityID) {
            MyAvatar.position = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, {"x": 0, "y": -55.5, "z": -3}));
    }; 
    
    this.leaveEntity = function(entityID) {
        
    };
})
