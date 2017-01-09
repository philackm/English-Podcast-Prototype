var MANABI = window.MANABI || {};

var util;
if(!(util = window.MANABI.utility)){
	throw({
		name: "NoUtilsError",
		message: "Unable to initialise utilities. Ensure you have included the script."
	});
}

/* Init the timeline. */
// Testing - Need to include timeline_audio.js before this file.
try{
	
	// IF we are on iOS, we need to tell the user to click the play button to start listening. No auto loading on iOS.
	var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
	
	if(iOS){
		var durationLabel = document.getElementById("duration");
		durationLabel.innerHTML = "Push play to start!";
	}
	else
	{
		var durationLabel = document.getElementById("duration");
		durationLabel.innerHTML = "loading <span class=\"fa fa-cog fa-spin\"></span>";
	}
	
	var audio = MANABI.media.htmlAudio("audio", {startAt:0, autoplay:false, ticksPerSecond:2});
	var timelineController = MANABI.controllers.timelineController(audio, "html-audio-controls", "secondary-play-button", "line-container", undefined);
	
	timelineController.showTooltip(false);	
}
catch(e){
	console.log(e.name + ": " + e.message);
}

/* PC Scripts */
(function(){
	'use strict';
	
	// CLICK EVENTS
	
	// Language selector
	var sel = document.getElementsByClassName("language-selector")[0];
	
	function menuhtml(){
		return "<img src=../Assets/img/global/language-UK.png id=\"eng\">";
	}
	MANABI.menu.addDropdown(sel, menuhtml, {centered:false, direction:"down", type:"click", customClass:"language-selector-dropdown"});
	
	// TODO - Add remove dropdown menu on click.
	// TODO - Do language change.
	
	// Season drop-down menu
	
	// Wrap variable names in &&.
	// For example, if in JSON the value is going to be "title", then put in &title&
	var template = "";
	
	template += "<h1><span class=\"light\">&seriesName& #&number& </span>&title&</h1>";
	template += "<p>&blurb&</p>";
	template += "<span class=\"page-item-icon page-item-time\"><i class=\"fa fa-clock-o\"></i> &time&</span>";
	template += "<span class=\"page-item-icon page-item-wordlist\"><i class=\"fa fa-bars\"></i> &words&</span>";
	template += "<span class=\"page-item-icon page-item-pinned\"><i class=\"fa fa-bookmark\"></i> &pinned&</span>";
	template += "<span class=\"page-item-icon page-item-comments\"><i class=\"fa fa-comment\"></i> &comments&</span>";
	
	// DOM
	var heading = document.getElementsByClassName("series-number")[0];
	
	// Really we'd get this via AJAX, but let's just make some dummy data for now.
	var items = [];
	var numberOfItems = 8;
	
	// Each item will need the following from JSON.
	var seriesItem = {
		seriesName: "Festivals",
		number: 7,
		title: "Sapporo Yuki Festival",
		blurb: "The Sapporo Snow Festival (Sapporo Yuki Matsuri) is held during one week every February in Hokkaido's capital Sapporo. It is one of Japan's most popular winter events.",
		
		time: 39,
		words: 17, 
		pinned: 6,
		comments: 3
	};
	
	// Make a bunch.
	for(var i = 0; i < numberOfItems; ++i){
		items.push(seriesItem);
	}
	
	// Use our paginator.
	var paginator = MANABI.paginator();
	paginator.init(template, items, 4, 7);
	
	MANABI.menu.addPaginatedDropdown(heading, paginator, {centered:false, direction:"down", type:"click", header:"SERIES MENU", exitDelay:100}, "series-menu");
	
	// Remove the hint.
	function remove(){
		
		var hint = document.getElementById("hint");
		
		hint.parentNode.removeChild(hint);
		console.log("removing hint");
		
		// Remove this event listenter once it has been completed.
		window.removeEventListener("click", remove);
	}
	
	window.addEventListener("click", remove);
	
	
})();


/* Mobile Scripts */
(function(){
	
	// CLICK EVENTS
	
	// Mobile menu
	var menuButton = document.getElementById("mobile-menu-button");
	var menu = document.getElementById("mobile-drop-down");
	
	menuButton.addEventListener("click", function(){
		MANABI.utility.toggleClass(menu, "active");
	});
	
	// Word popup
	var popup = document.getElementById("mobile-vocab");
	var htmlElem = document.documentElement;
	var bodyElem = document.body;

	var added = false;	
	var scroll;

	var active = false;
	var offset = 0;
	
	popup.addEventListener("click", function(){
		
		if(!active){
			MANABI.utility.toggleClass(popup, "active");
			offset = window.pageYOffset;
			active = true;
		}
		else{
			MANABI.utility.toggleClass(popup, "active");
			window.scrollTo(0, offset);
			active = false;
		}
	});
})();

// Other examples of adding menus.
/*

var userIcon = document.getElementsByClassName("user")[0];

function menuhtml(){
	return "<h1>Any HTML here works!</h1>";
}

// EG 
MANABI.menu.addDropdown(userIcon, menuhtml, {centered:true, direction:"right", type:"mouseover"}); // Now there is a mouseover menu!

*/




