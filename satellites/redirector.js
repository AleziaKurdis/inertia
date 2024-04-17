"use strict";
//
//  redirector.js
//
//  Created by Alezia Kurdis, January 6th 2023.
//  Copyright 2022, Overte e.V.
//
//  Serverless redirection to teleport place to place in a same domain forcing to reload.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {

    this.preload = function(entityID) {
        var url = Entities.getEntityProperties(entityID, ["description"]).description;
        Window.location = url;
    };

})
