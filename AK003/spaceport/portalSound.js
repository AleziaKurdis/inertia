//#####################
//
//  portalSound.js
//
//  Created by Alezia Kurdis, January 16th, 2023.
//  Copyright 2023, Overte e.V.
//
//  Arrival portal sound generator.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var ROOT = Script.resolvePath('').split("portalSound.js")[0];
	var portalSound;
	var injector = null;
	var sourcePosition;
	
	
	this.preload = function(pEntityID) {     
		var properties = Entities.getEntityProperties(pEntityID, ["position"]); 
		portalSound = SoundCache.getSound(ROOT + "metaspaceportPortalSound.mp3");  
        sourcePosition = properties.position;

        if (portalSound.downloaded){
            playing();
        } else {
            portalSound.ready.connect(onSoundReady);
        }
    };

    function onSoundReady() {
        portalSound.ready.disconnect(onSoundReady);
        playing();
    }

    function playing(){
        injector = Audio.playSound(portalSound, {
            position: sourcePosition,
            volume: 0.1,
            loop: true,
            localOnly: true
        });        
    }

	this.unload = function(){
		if (injector) {
			injector.stop();
			injector = null;
		}
	};

});