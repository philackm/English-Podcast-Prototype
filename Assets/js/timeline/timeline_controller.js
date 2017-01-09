var MANABI = window.MANABI || {};

MANABI.controllers = MANABI.controllers || {};

var util;
if(!(util = window.MANABI.utility)){
	throw({
		name: "NoUtilsError",
		message: "Unable to initialise utilities. Ensure you have included the script."
	});
}

MANABI.controllers.timelineController = function(audio, controlsID, alternatePlayID, linesID, config){
	'use strict';
	
	var me = {};
	
	// Public
	me.scrolling = true;
	me.displayTranslation = false;
	me.playing = false;;
	
	me.setSpeed = function(speed){ audio.setSpeed(speed); };
	
	// DOM
	var controls = {};
	
	var playButton = {};
	var alternatePlayButton = {};
	
	var progressBar = {};
	
	var completionBar = {};
	var alternateCompletionBar = {};
	
	var bufferedBar = {};
	
	var currentTimeLabel = {};
	var durationTimeLabel = {};
	
	var tooltip = {};
	
	// iOS will only play if the user initiates it.
	var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
	
	// LINES
	function createLine(element){
		
		var timestamp = parseFloat(element.getAttribute("timestamp"));
		var text = element.children[1].children[0].innerHTML;
		
		var highlight = function(){
			util.addClass(element, "active");
		};
		var clear = function(){
			util.removeClass(element, "active");
		};

		var setClick = function(callback) {
			//util.addEventListener(element, "click", callback); // the entire line
			util.addEventListener(element.children[0].children[0], "click", callback); // click the time span instead of the entire line.
		};
		
		return{
			timestamp: timestamp,
			text: text,
			element: element, // Added so we can access the HTML element for the line when we set onActiveChange handlers.
			
			highlight: highlight,
			clear: clear, 
			setClick: setClick
		}
	}
	var linebyline = (function(){
		var me = {};
		
		me.lines = [];
		me.activeLine = {};
		me.previousLine = {};
		
		me.tooltip = false;
		
		// CALLBACKS
		// Called to parse all the dom lines.
		// Adds the click handlers for the lines to seek.
		me.init = function(){
			var domLines = [];
			var container;
			
			try{
				container = util.getElem(linesID);
			}
			catch(e){
				throw e;	
			}
			
			var children = container.children;
			
			for(var i = 0, max = container.children.length; i < max; i++){
				if(util.getClassesFor(container.children[i]).contains("line")){
					domLines.push(container.children[i]);
				}
			}
			
			// Parse all the lines.
			for(var i = 0, max = domLines.length; i < max; i++)
			{
				var line = createLine(domLines[i]);
				me.lines.push(line);
			}
			
			// No active lines until we start playing.
			linebyline.activeLine = {};
			linebyline.previousLine = {};
			
			// Need this so that each click handler we set won't be pointing to the same line.
			// This works because JavaScript passes arguments by VALUE, not reference.
			function makeClickHandler(line){
				return( function(){ 
					audio.seek(line.timestamp + 0.10); // 0.10 to fix a weirdness in Safari & iOS
					me.update(); // Check which line is now active that we've moved.
				});
			}
			
			for(var i = 0, max = linebyline.lines.length; i < max; i++)
			{
				var line = linebyline.lines[i];
				line.setClick(makeClickHandler(line));
			}
		};
		
		// Called every tick to check which line is active.
		me.update = function(){
			var nextActive = getNextActiveLine();
			
			if(nextActive === me.activeLine){
				return;
			}
			else{
				setActive(nextActive);
			}
		}; 
		// Called when the audio ends to reset all the lines.
		me.reset = function(){
			for(var i = 0, max = me.lines.length; i < max; i++){
				me.lines[i].clear();
			}
		}; 
		
		// Can return a line for the specified time (in seconds);
		me.getLine = function(time){
			for(var i = 0, max = me.lines.length; i < max; i++){
				
				var timestamp = me.lines[i].timestamp;
				var timestampNext = me.lines[i+1] ? me.lines[i+1].timestamp : audio.getDuration();
				
				if(timestamp <= time && time < timestampNext){
					
					return me.lines[i];
				}
			}
		};
		
		// Allow custom handlers to be set for when the currently active line changes.
		me.setOnActiveChange = function(handler){
			onActiveChange[onActiveChange.length] = handler;
		};
		
		// Private functions.
		var setActive = function(line){
			me.previousLine = me.activeLine;
			me.activeLine = line;
			
			for(var i = 0; i < onActiveChange.length; i++){
				
				onActiveChange[i](me.previousLine, me.activeLine);
			}
		};
		
		var getNextActiveLine = function(){
			return (me.getLine(audio.getCurrentTime()));
		};
		
		// Called whenever the currently active is about to change.
		// Is an array of functions so we can add many.
		var onActiveChange = [];
		onActiveChange[onActiveChange.length] = function(prev, next){
			if(prev && typeof prev.clear === "function"){
				prev.clear();
			}
			if(next && typeof next.highlight === "function"){
				next.highlight();
			}
		}; 
		
		return me;
	})();
	
	// UI
	function setCompletionBar(percentage){
		MANABI.utility.setStyle(completionBar, "width", percentage + "%");
		MANABI.utility.setStyle(alternateCompletionBar, "width", percentage + "%");
	};
	function setBufferedBar(percentage){
		MANABI.utility.setStyle(bufferedBar, "width", percentage + "%");
	};
	
	function updatePlayButtonState(){
		switch(audio.getStatus()){
			case MANABI.media.audioState.PLAYING:
				MANABI.utility.setClass(playButton, "playing");
				
				// TODO - Change this to something like, registerPlayButton, so that we can have multiple play buttons without tying this into the controller.
				MANABI.utility.removeClass(alternatePlayButton.children[0], "fa-play");
				MANABI.utility.addClass(alternatePlayButton.children[0], "fa-pause")
				break;
				
			case MANABI.media.audioState.PAUSED:
			case MANABI.media.audioState.ENDED:
				MANABI.utility.removeClass(playButton, "playing");
				
				MANABI.utility.removeClass(alternatePlayButton.children[0], "fa-pause");
				MANABI.utility.addClass(alternatePlayButton.children[0], "fa-play")
				break;
		}
	};
	
	function initControls(){
		util.removeClass(controls, "disabled");
		util.removeClass(util.getElem(linesID), "disabled");
		
		currentTimeLabel.innerHTML = util.generateTimeString(audio.getCurrentTime());
		durationTimeLabel.innerHTML = util.generateTimeString(audio.getDuration());
		
		var timeline = document.getElementById(linesID);
		MANABI.utility.removeClass(timeline, "loading");
	};
	
	function updateControls(){
		currentTimeLabel.innerHTML = util.generateTimeString(audio.getCurrentTime());
		setCompletionBar((audio.getCurrentTime() / audio.getDuration()) * 100);
		setBufferedBar((audio.getBufferedRange().end / audio.getDuration() * 100));
	};
	
	function resetControls(){
		currentTimeLabel.innerHTML = util.generateTimeString(audio.getCurrentTime());
		audio.seek(0); // for good measure.
		audio.pause(); // in ie, it doesn't stop, so eseentially we start looping.
		setCompletionBar(0);
		updatePlayButtonState();
	};
	
	// Assign handlers to events for the UI
	audio.setOnReady(initControls);
	audio.setOnTick(updateControls);
	audio.setOnSeeked(updateControls); // Update controls when we seek via the progress bar or lines.
	audio.setOnEnd(resetControls);
	
	audio.setOnPlay(updatePlayButtonState);
	audio.setOnPause(updatePlayButtonState);
	
	// Update our public playing variable so users can check if the timeline is currently playing.
	function updatePlaying(){
		switch(audio.getStatus()){
			case MANABI.media.audioState.PLAYING:
				me.playing = true;
				break
			case MANABI.media.audioState.PAUSED:
			case MANABI.media.audioState.ENDED:
				me.playing = false;
				break;
		}
	}
	audio.setOnPlay(updatePlaying);
	audio.setOnPause(updatePlaying);
	audio.setOnEnd(updatePlaying);
	
	// Assign handlers for the LINEBYLINE.	
	audio.setOnReady(linebyline.init);
	audio.setOnTick(linebyline.update);
	audio.setOnSeeked(linebyline.update);
	audio.setOnEnd(linebyline.reset);
	
	// INITIALISATION - Get all the control elements. Init the lines.
	(function init(){
		
		// PUBLIC SETTINGS
		// TODO: Implement this.
		if(config){
			me.scrolling = config.scrolling || true;
			me.displayTranslations = config.translations || false;
		}
		
		// controls should look like:
		//<div id="html-audio-controls" class="controls">
		//	<div id="play-button"></div>
		//	<div id="stats">
		//		<span id="playtime"></span>
		//		<span id="separator"></span>
		//		<span id="duration"></span>
		//		<div id="progress-bar">			
		//			<div id="buffered-bar" progress="0%"></div>
		//			<div id="completion-bar" progress="0%"></div>
		//		</div>
		//		<div id="progress-tooltip"></div>
		//	</div>
		//</div>
		
		// We get the elements using the children so that we can have multiple timelines on a single page.
		// A less brittle solution would be to get the elements by ID, but that forces 1 timeline per page
		//	and makes it so the IDs are hard coded into the controller.
		controls = MANABI.utility.getElem(controlsID);
		
		playButton = controls.children[0]; // "main-play-button"
		alternatePlayButton = document.getElementById(alternatePlayID);
		
		console.log(alternatePlayButton);
		
		progressBar = controls.children[1].children[3]; // the container for the buffered and completion bar
		alternateCompletionBar = alternatePlayButton.children[1].children[0];
		
		bufferedBar = controls.children[1].children[3].children[0]; // "buffered-bar"
		completionBar = controls.children[1].children[3].children[1]; // "completion-bar"
		tooltip = controls.children[1].children[4]; // "progress-tooltip"
		
		currentTimeLabel = controls.children[1].children[0]; // "playtime"
		durationTimeLabel = controls.children[1].children[2]; // "duration" 

		// Sometimes if the file is so small "ready" has already been fired by the time we set onReady, 
		// so for now let's check if everything is ready and init again.
		if(audio.getStatus() === MANABI.media.audioState.READY){
			linebyline.init();
			initControls();
		}
		
		// SET HTML EVENTS to control everything.
		// Need to set these after we have loaded the dom elements.
		util.addEventListener(playButton, "click", (function(){
			
			var initialPlay = true;
			return function(){
				
				switch(audio.getStatus()){
					case MANABI.media.audioState.PLAYING:
						audio.pause();
						break;
					case MANABI.media.audioState.PAUSED:
					case MANABI.media.audioState.ENDED:
					case MANABI.media.audioState.READY:
						audio.play();
					default:
						if(initialPlay && iOS){
							audio.play();
							initialPlay = false;
							console.log("iOS play");
						}
						break;
				}
				
			};

		})());
		
		util.addEventListener(alternatePlayButton, "click", function(){
			switch(audio.getStatus()){
				case MANABI.media.audioState.PLAYING:
					audio.pause();
					break;
				case MANABI.media.audioState.PAUSED:
				case MANABI.media.audioState.ENDED:
				case MANABI.media.audioState.READY:
					audio.play();
					break;
			}
		});
		
		// Progress bar seeking.
		util.addEventListener(progressBar, "click", function(e){
			var pos = util.getPositionThroughElement(this, e);
			
			var time = audio.getDuration() * (pos.x / pos.width);

			audio.seek(time);
		});
		
		// Show the tooltip when the mouse enters the progress bar.
		util.addEventListener(progressBar, "mouseover", function(e){
			if(me.tooltip && tooltip){
				util.removeClass(tooltip, "hidden");
			}
			
			console.log("mouse in");
		});
		
		// Hide the tooltip when the mouse leaves the progress bar.
		util.addEventListener(progressBar, "mouseout", function(e){
			if(me.tooltip && tooltip){
				util.addClass(tooltip, "hidden");
			}
			
			console.log("mouse out");
		});
		
		// Update the tooltip's text and time when the mouse moves along the progress bar.
		util.addEventListener(progressBar, "mousemove", function(e){
			var pos = util.getPositionThroughElement(this, e);
			var time = audio.getDuration() * (pos.x / pos.width);

			var text = linebyline.getLine(time).text;
			
			if(tooltip){
				
				// Remove any previous text if there was any.
				if(tooltip.childNodes[0]){
					tooltip.removeChild(tooltip.childNodes[0]);
				}
				
				var timeAndText = util.generateTimeString(time) + ": " + text;
				var textNode = document.createTextNode(timeAndText);
				tooltip.appendChild(textNode);
				
				// This can be done better to get the styles out of the controller.
				tooltip.style.top = (progressBar.getBoundingClientRect().top + 15) + "px";
			}
		});
		
		// TODO
		// Playback speed buttons.
		
		// TODO
		// Translation button.
		
		// TODO
		// Scrolling button.
		
	})();
	
	// This will be a public function so that we can call it from other controllers.
	me.setOnActiveChange = function(handler){
		linebyline.setOnActiveChange(handler);
	};
	
	me.showTooltip = function(active){
		me.tooltip = active;
	}
	
	return me;
};


