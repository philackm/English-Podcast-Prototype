var MANABI = window.MANABI || {};

MANABI.media = MANABI.media || {};

var util;
if(!(util = window.MANABI.utility)){
	throw {
		name: "NoUtilsError",
		message: "Unable to initialise utilities. Ensure you have included the script."
	};
}

MANABI.media.audioBase = (function(){
	'use strict';
	
	var me = {};
	var sound;
	
	MANABI.media.audioState = Object.freeze({
		PREINIT : "preinit",
		READY : "ready",
		PLAYING : "playing", 
		PAUSED : "paused", 
		BUFFERING : "buffering", 
		ENDED : "ended",	
	});
	
	// For tracking the status of an audio source.
	var currentStatus = MANABI.media.audioState.PREINIT;
	
	var onStatusChange = function(){
		console.log("Audio Status: " + currentStatus);
	};
	
	me.getStatus = function(){
		return currentStatus;
	};
	
	me.setStatus = function(newStatus){
		if(newStatus){
			currentStatus = newStatus;
			onStatusChange();
		}
	};
	
	me.setOnStatusChange = function(callback) { onStatusChange = callback; };
	
	// Properties we will want on every audio source.
	me.autoplay = false;
	me.startAt = 0.0;
	me.loop = false;
	me.buffered = {start: 0.0, end: 0.0};
	
	// Must implement these in "subclasses".
	// Callbacks
	me.setOnReady = function(callback){};
	me.setOnPlay = function(callback){};
	me.setOnPause = function(callback){};
	me.setOnEnd = function(callback){};
	me.setOnTick = function(callback){};
	me.setOnSeeked = function(callback){};
	
	// Controls for the audio.
	me.play = function(){};
	me.pause = function(){};
	me.seek = function(time){};
	me.setSpeed = function(speed){};
	
	// Info
	me.isReady = function(){};
	me.isPlaying = function(){};
	me.getCurrentTime = function(){};
	me.getDuration = function(){};
	me.getBufferedRange = function(){};
	
	return me;	
})();

MANABI.media.htmlAudio = function(id, config){
	'use strict';
	
	var me = Object.create(MANABI.media.audioBase);
	var sound = {}; // Holds our html audio element.
	var intervalTime = 1000; // The time between ticks. Defaults to 1 update per second.
	var intervalID = 0; // Store the current interval loop ID so we can cancel it.
	var bufferIntervalID = 0; // The currently buffered loop so we can see how much has buffered and display it.
	
	// Callbacks
	
	// I want the update time to be consistent and variable, so I will deal with the 
	// ticks myself instead of relying on the HTML <audio> ontimeupdate which seems to
	// fire randomly.
	var onTick = [];
	me.setOnTick = function(callback) { onTick.push(callback); };
	
	me.setOnReady = function(callback) { util.addEventListener(sound, "loadeddata", callback); };
	me.setOnPlay = function(callback) { util.addEventListener(sound, "playing", callback); };
	me.setOnPause = function(callback) { util.addEventListener(sound, "pause", callback); };
	me.setOnEnd = function(callback) { util.addEventListener(sound, "ended", callback); };
	me.setOnSeeked = function(callback) { util.addEventListener(sound, "seeked", callback); };
	
	// Controls for the audio.
	me.play = function(){ sound.play(); };
	me.pause = function(){ sound.pause(); };
	me.seek = function(time){ sound.currentTime = time; };
	me.setSpeed = function(speed){ if(speed > 0.0) {sound.playbackRate = Math.min(speed, 2.0);} };
	
	// Info
	me.isReady = function(){ return this.getStatus() === MANABI.media.audioState.READY; };
	me.isPlaying = function(){ return this.getStatus() === MANABI.media.audioState.PLAYING; };
	me.getCurrentTime = function(){ return sound.currentTime; };
	me.getDuration = function(){ return sound.duration; };
	me.getBufferedRange = function(){ return me.buffered; };
	
	// Initialisation
	var init = function(id, config){
		
		sound = document.getElementById(id);
		
		if(sound && sound.tagName.toLowerCase() === "audio"){
			
			// Keep the current status updated.
			this.setOnReady(function(){ me.setStatus(MANABI.media.audioState.READY); });
			this.setOnPlay(function(){ me.setStatus(MANABI.media.audioState.PLAYING); });
			this.setOnPause(function(){ me.setStatus(MANABI.media.audioState.PAUSED); });
			this.setOnEnd(function(){ me.setStatus(MANABI.media.audioState.ENDED); });
			
			// CONFIGURATION
			
			// Config object can contain:
			//
			//	startAt: float,
			//	autoplay: bool,
			//	speed:  float,
			//	loop: bool,
			//	ticksPerSecond: int	
			if(config){
				// Allow starting times to be specified.
				if(config.startAt){
					this.startAt = config.startAt;
				}
				
				// Allow autoplay.
				if(config.autoplay){
					this.setOnReady(function(){
						me.seek(me.startAt);
						me.play();	
					});
				}
				else{
					this.setOnReady(function(){
						if(me.startAt > 0){
							me.seek(me.startAt);
						}
					});
				}
				 // Allow looping.
				if(config.loop){
					sound.loop = true;
				}
				
				// Configure the speed.
				if(config.speed){
					this.setSpeed(config.speed);
				}
				
				// Updates per second.
				if(config.ticksPerSecond){
					intervalTime = 1000 / config.ticksPerSecond;
				}
			}
			
			// Update LOOPS
			// Start our playing update loop, but only when the audio is playing.
			this.setOnPlay(function(){
				intervalID = setInterval(function(){
						for(var i in onTick){
							onTick[i]();
						}
					}, intervalTime);	
			});
			
			this.setOnPause(function(){
				clearInterval(intervalID);
			});
			
			this.setOnEnd(function(){
				clearInterval(intervalID);
			});
			
			// Buffering update loop
			var updateBuffered = function(){
				var length = sound.buffered.length;
				if(length){
					me.buffered.start = sound.buffered.start(length - 1);
					me.buffered.end = sound.buffered.end(length - 1);
					
					// Stop updating the amount we have buffered if it has fully loaded.
					if(me.buffered.start === 0.0 && me.buffered.end >= me.getDuration()){
						clearInterval(bufferIntervalID);
						
						console.log("removed buffered update");
					}
				}
			};
			
			this.setOnReady(function(){
				console.log("setting buffered update");
				bufferIntervalID = setInterval(updateBuffered, 1000); // once a second.
			});
			
			// If the sound is cached by the browser, then the onready doesn't get fired. (?)
			// Check the ready state here and then update the status.
			if(sound.readyState > 0){
				// Fire the event manually.
				var event = new CustomEvent("loadeddata", {});
				sound.dispatchEvent(event);
			}
		}
		// Couldn't get the audio, ABORT ABORT.
		else{
			throw {
				name: "NoAudioElementError",
				message: "Unable to find the <audio> tag, ensure you have passed the correct ID."
			};
		}
	};
	
	init.apply(me, ["audio", config]);
	
	return me;
};

// Can add youtube audio here and implement the functions using its API.
// As long as everything is implemented correctly here, shouldn't have to touch the timelineController.js file.

//MANABI.media.youtubeVideo = function(videoID, config){
	// ...	
//};