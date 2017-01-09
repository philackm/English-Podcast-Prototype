var MANABI = window.MANABI || {};

MANABI.utility = function(){
	
	var utility = {};
	
	utility.getElem = function(id) {
		var elem = document.getElementById(id);
		
		if(elem){
			return elem;
		}
		else{
			return {};
		}
	}
	
	// pad(number:Number, zeroes:Number):Number
	utility.pad = function pad(number, zeroes) {
		var padded = number.toString();
		
		var i = zeroes;
		while(i--)
		{
			padded = "0" + padded; 
		}
		
		return padded;
	};
	
	// generateTimeString(seconds:int):String
	utility.generateTimeString = function generateTimeString(seconds)
	{
		if(seconds <= 0 || isNaN(seconds)){
			return("0:00");
		}
		var min = 0, 
			sec = 0;
		
		min = Math.floor(seconds / 60);
		sec = Math.floor(seconds % 60);
		
		sec = (sec < 10) ? util.pad(sec, 1) : sec;
		
		if(min >= 60){
			var hour = Math.floor(min / 60);
			min = Math.floor(min % 60);
			
			min = (min < 10) ? util.pad(min, 1) : sec;
			
			return(hour + ":" + min + ":" + sec);
		}
		else{
			return(min + ":" + sec);
		}
	}
	
	// setClass(elem:Object, className:String):void
	utility.setClass = function(elem, className){
		if(elem){
			elem.className = className;
		}
	};
	
	// addClass(elem:Object, className:String):void
	utility.addClass = function(elem, className){
		if(elem){
			elem.className += (" " + className);
		}
	};
	
	// removeClass(elem:Object, className:String):void
	utility.removeClass = function(elem, className){
		if(elem){
			var regex = new RegExp("(?:[\\s]+)?" + className, "g");
			elem.className = elem.className.replace(regex, "");
		}
	};
	
	// removeClass(elem:Object, className:String):void
	utility.removeClassFromArray = function(elements, className){
		if(elements.length){
			
			var regex = new RegExp("(?:[\\s]+)?" + className, "g");
			
			for(var i = 0; i < elements.length; i++){
				elements[i].className = elements[i].className.replace(regex, "");
			}
		}
	};
	
	// getClassesFor(elem:Object):Array
	// use: getClassesFor(someDomElement).contains("class_name") // true/false
	utility.getClassesFor = function(elem){
		var classes = elem.className.split(" ");
			classes.contains = function(classname){
				var i = classes.length;
				while(i--){
					if(classes[i] == classname){
						return true;
					}
				}
				return false;
			}
		return classes;
	};
	
	utility.toggleClass = function(elem, className){
		if(this.getClassesFor(elem).contains(className)){
			this.removeClass(elem, className);
		}
		else{
			this.addClass(elem, className);
		}
	};
	
	utility.setStyle = function(elem, style, value){
		elem.style[style] = value;
	};
	
	utility.addEventListener = (function(){		
		if(document.addEventListener){
			return function(element, event, handler){
				console.log(event);
				element.addEventListener(event, handler, false);
			};
		}
		else{
			return function(element, event, handler){
				console.log(handler);
				element.attachEvent('on' + event, handler);
			};
		}
	})();
	
	// getPositionThroughElement(elem:Object):Object
	// Returned object has the fields: 
	// x: horizontal position IN the element
	// y: vertical position IN the element
	// nanode, x:0, y:0 would be the top left of the element
	// width: total width of the element
	// height: total height of the element
	utility.getPositionThroughElement = function(elem, event){
			
		// Get the rectangle for this element.
		var rect = elem.getClientRects()[0];
		
		//console.log(rect);
		
		// Determine where we clicked in the element.
		var x = event.clientX - rect.left;
		var y = event.clientY - rect.top;
			
			return{
				x:x,
				y:y,
				width: rect.width,
				height: rect.height
			};
	};
	
	utility.surround = function(text, character){
		return (character + text + character);
	};
	
	utility.ajax = function ajax(url, completion){
		var request = new XMLHttpRequest();
		request.open("GET", url, false);
		
		// set the completion handler
		request.onreadystatechange = function(){
			if(request.readyState === 4)
			{
				if(request.status === 200 || request.status == 0)
				{
					completion(request.responseText);
				}
			}
		}
		
		request.send();
	}
		
	return utility;	
}();












