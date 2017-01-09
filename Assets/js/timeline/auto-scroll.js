$(function(){ //onready
	
	// Easing functions
	$.extend($.easing,
	{
	    easeInCubic: function (x, t, b, c, d) {
	        return c*(t/=d)*t*t + b;
	    },
	    easeOutCubic: function (x, t, b, c, d) {
	        return c*((t=t/d-1)*t*t + 1) + b;
	    },
	    easeInOutCubic: function (x, t, b, c, d) {
	        if ((t/=d/2) < 1) return c/2*t*t*t + b;
	        return c/2*((t-=2)*t*t + 2) + b;
	    }
	});
	
	// Default to true.
	var autoscroll = true;
	var scrollTime = 500; // half a second
	var autoscrolling = false; // are we scrolling automatically?
	
	var pauseDuration = 10000; // 10 seconds.
	
	// Only scroll when the currently active line changes.
	function handleActiveChange(previous, next){
		
		var domLine = next.element;
		autoscrolling = true;
		
		if(autoscroll && timelineController.playing){
			$('html, body').animate({
		        	scrollTop: $(domLine).position().top
		    	}, 
		    	
		    	{duration: scrollTime, easing: "easeInOutCubic", complete:
		    	function(){
			    	//autoscrolling = false;
			    	setTimeout(function(){ autoscrolling = false; }, 50);
			    	//alert("finished");
		    	}}
	    	);
		}
	}
	
	function dismissPopup(){
		$("#autoscroll-info").remove();
	}
	
	function enableAutoscroll(){
		if(!autoscroll){
			autoscroll = !autoscroll;
			$("#autoscroll-check-mobile, #autoscroll-check-pc").removeClass("hidden");
		}
	}
	
	function disableAutoscroll(){
		if(autoscroll){
			autoscroll = !autoscroll;
			$("#autoscroll-check-mobile, #autoscroll-check-pc").addClass("hidden");
		}
		
		if(pauseID > -1){
			clearTimeout(pauseID);
		}
	}
	
	function toggleAutoscroll(){
		if(autoscroll){
			disableAutoscroll();
		}
		else{
			enableAutoscroll();
		}
	}
	
	var pauseID = -1;
	function pauseAutoScroll(time){
		time = time || pauseDuration; // default to 10 seconds
		
		// Pause the autoscrolling.
		disableAutoscroll();
		
		// Save the timeout id so that we can cancel the re-enabling if the user manually turns off autoscrolling
		// in between the pause and re-enabling.
		pauseID = setTimeout(function(){
			enableAutoscroll();
			dismissPopup();
		}, time);
		
		var count = pauseDuration / 1000;

		(function countdown(){
			// countdown every second
			setTimeout(function(){
				
				$("#autoscroll-info p").html("Auto scrolling paused. Resuming in " + --count +"...");
				
				// Set another one.
				if(count > 0){
					countdown();
				}
				
			}, 1000);
		})();
	}
	
	// Enable and disable auto-scroll.
	$("#autoscroll-mobile, #autoscroll-pc").on("click", function(){
		toggleAutoscroll();
	});
	
	// When the user scrolls make temporarily cancel auto-scroll so it's not horrible to move around when auto-scroll is enabled.
	$(window).scroll(function(){
		
		// Only if the audio is playing.
		if(timelineController.playing){
			
			// And only if the browser is not autoscrolling and we have autoscroll set to true.
			if(!autoscrolling && autoscroll){
				
				// We are manually scrolling when we are set to autoscroll, so pause the autoscrolling for a while.
				
				if(!$("autoscroll-info").length){ // Check if it's already there.
					// Add a div for info.
					$(document.body).append("<div id=\"autoscroll-info\"><p>Auto scrolling paused. Resuming in 10...</p><button id=\"autoscroll-toggle\">Turn off autoscrolling</button><div>");
					
					// Add a click handler for the button.
					$("#autoscroll-toggle").on("click", function(){
						disableAutoscroll();
						dismissPopup();
					});
					
					pauseAutoScroll();
				}
			}
		}
		
		// We also want the nav to auto-scroll down the page.		
		if(window.pageYOffset - 60 > 0){
			$("#main-nav").css("position", "fixed");
			$("#main-nav").css("top", "2em");
			$("#main-nav").css("width", "4.2em"); // When the navigation is set to fixed, it no longer knows its own width.
		}
		else if(window.pageYOffset - 60 < 0){
			$("#main-nav").css("position", "inherit");
			$("#main-nav").css("top", "inherit");
			$("#main-nav").css("width", "100%");
		}
		
		// Check if the main play button is off screen, if it is, add the secondary one.
		var playBottom = $("#main-play-button").offset().top + $("#main-play-button").height();
		var windowTop = $(window).scrollTop();
		
		if (playBottom <= windowTop){ // play button is off screen.
			$("#secondary-play-button").removeClass("hidden");
			$("#secondary-play-button").addClass("active");
		}
		else{ //play button is on screen.
			$("#secondary-play-button").addClass("hidden");
			$("#secondary-play-button").removeClass("active");		
		}
	});
	
	//BUGs
	// Can't scroll during the 500ms animation when auto-scrolling.
	// Clicking a time during the 500ms animation will pause auto-scrolling.
	
	// Set the handler on the timeline controller.
	timelineController.setOnActiveChange(handleActiveChange);
});
