//
//  fallenCollector.js
//
//  Created by Alezia Kurdis, December 26th, 2025.
//  Copyright 2025, Overte e.V.
//
//  Return fallen avatars for the VALOMBRA scenery.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 
    let returnPosition;
    let returnRotation;
    
    this.preload = function(entityID) {
        returnPosition = MyAvatar.position;
        returnRotation = MyAvatar.orientation;
    };

    this.enterEntity = function(entityID) {
        MyAvatar.position = returnPosition;
        MyAvatar.orientation = returnRotation;
    }

})
