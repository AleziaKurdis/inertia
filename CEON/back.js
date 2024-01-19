//
//  back.js
//
//  Created by Alezia Kurdis, January 18th, 2024.
//  Copyright 2024, Overte e.V.
//
//  Just a trigger to navigate back.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){ 

    this.enterEntity = function(entityID) {
        if (location.canGoBack()) {
            location.goBack();
        }        
    }
    
})
