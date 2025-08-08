// SPDX-License-Identifier: CC0-1.0
// sit_spot.js
//
//  Created by ada-tv, July 18th, 2025.
//  Modified by Alezia Kurdis, August 7th, 2025.
//  Copyright 2025, ada-tv.
//
//  Sit_spot, but that vanish after 40 second and reactivate when we approach to at least 3m.
//
//  SPDX-License-Identifier: CC0-1.0
//
(function() {try{
	const MSG_CHANNEL = "net.thingvellir.sit_spot";
	const EDIT_SETTING = "io.highfidelity.isEditing"; // true if the create app is open

	const actionTranslateY = Controller.findAction("TranslateY");
	let previousAvatarXform = [Vec3.ZERO, Quat.IDENTITY];
	let isSitting = false;
	let disabled = false;
	let visualID;
	let selfID;
    let renderWithZones;
    let thisPosition;
    let hasBeenViewed;
    
    let timerIntervall = 4000; // 4 sec 
    let processTimer = 0;
    const DISTANCE_TO_SEE_INDICATOR = 3.0;
    
    const ROOT = Script.resolvePath('').split("sit_spot.js")[0];

	this.actionEvent = function(actionID, value) {
		if (disabled || !isSitting || actionID != actionTranslateY) { return; }

		if (value > 0.5) {
			MyAvatar.endSit(...previousAvatarXform);
			Messages.sendLocalMessage(MSG_CHANNEL, JSON.stringify({ seatID: selfID, sitting: false }));
			Entities.editEntity(visualID, { "visible": true });
            hasBeenViewed = true;
			isSitting = false;
            Script.setTimeout(function () {
                Entities.editEntity(visualID, { "visible": false });
            }, 40000); //40 sec
		}
	}

	this.preload = function(_selfID) {
		selfID = _selfID;
        let properties = Entities.getEntityProperties(selfID, ["position", "renderWithZones"]);
        renderWithZones = properties.renderWithZones;
        thisPosition = properties.position;
		Controller.actionEvent.connect(this.actionEvent);

		visualID = Entities.addEntity({
			"type": "Image",
			"parentID": selfID,
            "localPosition": {"x": 0.0, "y": 0.0, "z": 0.0},
			"localRotation": Quat.fromPitchYawRollDegrees(-90, 180, 0),
			"dimensions": [0.3, 0.3, 0.1],
			"imageURL": ROOT + "sit.svg",
			"emissive": true,
			"alpha": 0.8,
			"ignorePickIntersection": true,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            },
            "visible": false
		}, "local");
        
        hasBeenViewed = false;
        let today = new Date();
        processTimer = today.getTime();
        Script.update.connect(myTimer);
	};

    function myTimer(deltaTime) {
        let today = new Date();
        if ((today.getTime() - processTimer) > timerIntervall ) {
            if (!isSitting) {
                if (Vec3.distance(MyAvatar.position, thisPosition) < DISTANCE_TO_SEE_INDICATOR) {
                    if (!hasBeenViewed) {
                        Entities.editEntity(visualID, { "visible": true });
                        hasBeenViewed = true;

                        Script.setTimeout(function () {
                            Entities.editEntity(visualID, { "visible": false });
                        }, 40000); //40 sec
                    }
                } else {
                    Entities.editEntity(visualID, { "visible": false });
                    hasBeenViewed = false;
                }
            }
            today = new Date();
            processTimer = today.getTime();
        }  
    }

	this.mousePressOnEntity = function(entityID, event) {
		if (
			disabled ||
			entityID !== selfID ||
			isSitting ||
			!event.isPrimaryButton ||
			Settings.getValue(EDIT_SETTING)
		) { return; }

		const {position, rotation} = Entities.getEntityProperties(selfID, ["position", "rotation"]);
		previousAvatarXform = [MyAvatar.position, MyAvatar.orientation];
		MyAvatar.beginSit(Vec3.sum(position, Vec3.multiplyQbyV(rotation, [0, 0.1, 0])), rotation);
		Messages.sendLocalMessage(MSG_CHANNEL, JSON.stringify({ seatID: selfID, sitting: true }));
		Entities.editEntity(visualID, { "visible": false });
        hasBeenViewed = false;
		isSitting = true;
	};


	this.messageRecv = function(channel, message, senderID, localOnly) {
		if (channel !== MSG_CHANNEL || !localOnly || senderID != MyAvatar.sessionUUID) { return; }

		try {
			let data = JSON.parse(message);

			if (data.seatID == selfID) { return; }

			if (data.sitting !== undefined) {
				disabled = !!data.sitting;
			}
		} catch(e) {
			console.error(e);
		}
	};

	Messages.messageReceived.connect(this.messageRecv);

	this.unload = function(_selfID) {
		unloading();
	};

    function unloading() {
        Script.update.disconnect(myTimer);
        Messages.messageReceived.disconnect(this.messageRecv);
		Controller.actionEvent.disconnect(this.actionEvent);
		Entities.deleteEntity(visualID);
		delete visualID;
		if (isSitting) {
			MyAvatar.endSit(MyAvatar.position, MyAvatar.orientation);
		}
    }

	Window.domainChanged.connect(function() {
		unloading();
	});
} catch(e) { console.error(e); this.unload(); }})
