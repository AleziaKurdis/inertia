// SPDX-License-Identifier: CC0-1.0
// sit_spot.js
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
    const ROOT = Script.resolvePath('').split("sit_spot.js")[0];

	this.actionEvent = function(actionID, value) {
		if (disabled || !isSitting || actionID != actionTranslateY) { return; }

		if (value > 0.5) {
			MyAvatar.endSit(...previousAvatarXform);
			Messages.sendLocalMessage(MSG_CHANNEL, JSON.stringify({ seatID: selfID, sitting: false }));
			Entities.editEntity(visualID, { visible: true });
			isSitting = false;
		}
	}

	this.preload = function(_selfID) {
		selfID = _selfID;
        renderWithZones = Entities.getEntityProperties(selfID, ["renderWithZones"]).renderWithZones;
		Controller.actionEvent.connect(this.actionEvent);

		/*visualID = Entities.addEntity({
			"type": "Text",
			"parentID": selfID,
			"localRotation": Quat.fromPitchYawRollDegrees(-90, 180, 0),
			"dimensions": [0.3, 0.3, 0.1],
			"text": "SIT",
			"unlit": true,
			"backgroundAlpha": 0.6,
			"textEffect": "outline fill",
			"textEffectColor": [0, 0, 0],
			"textEffectThickness": 0.4,
			"alignment": "center",
			"verticalAlignment": "center",
			"ignorePickIntersection": true,
            "renderWithZones": renderWithZones,
            "grab": {
                "grabbable": false
            }
		}, "local");*/
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
            }
		}, "local");
	};

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
		Entities.editEntity(visualID, { visible: false });
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
