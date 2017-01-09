var MANABI = window.MANABI || {};
MANABI.menu = {};

var util;
if(!(util = window.MANABI.utility)){
	throw({
		name: "NoUtilsError",
		message: "Unable to initialise utilities. Ensure you have included the script."
	});
}

//PAGINATOR USAGE
/*

paginator.init(template, items, [itemsPerPage], [currentItem]);
// currentItem is the currently active item, if you want it. This will cause the default page to be whatever page the "active item" lands on.
// itemsPerPage is how many items we want to appear on each page, default is 5.
// template is HTML with the variable from a JSON item in it surrounded by ampersands.
// items are the JSON objects which we want to iterate over

//template example:

// JSON Object:
{
	seriesName: "Festivals",
	number: 7,
	title: "Sapporo Yuki Festival",
	blurb: "The Sapporo Snow Festival (Sapporo Yuki Matsuri) is held during one week every February in Hokkaido's capital Sapporo. It is one of Japan's most popular winter events.",
	
	time: 39,
	words: 17, 
	pinned: 6,
	comments: 3
};

//	template += "<h1><span class=\"light\">&seriesName& #&number& </span>&title&</h1>";
//	template += "<p>&blurb&</p>";
//	template += "<span class=\"page-item-icon page-item-time\"><i class=\"fa fa-clock-o\"></i> &time&</span>";
//	template += "<span class=\"page-item-icon page-item-wordlist\"><i class=\"fa fa-bars\"></i> &words&</span>";
//	template += "<span class=\"page-item-icon page-item-pinned\"><i class=\"fa fa-bookmark\"></i> &pinned&</span>";
//	template += "<span class=\"page-item-icon page-item-comments\"><i class=\"fa fa-comment\"></i> &comments&</span>";

	
paginator.getPage(page); // returns html for page # : string

paginator.moveNext(); // increments the current page and returns that page number
paginator.movePrevious(); // decrements the current page and returns that page number
paginator.moveTo(number); // moves to a page and returns that page number.

paginator.previousPage(); // return the previous page : number
paginator.currentPage(); // returns the current page : number
paginator.totalPages(); //  returns how many pages : number

// Wrapper gets the class "page-item"
// If it is active it gets "page-item-active"
// If it came in from the left it gets the class "page-item-left"
// If it came in from the right it gets the class "page-item-right"

*/

// Paginates a bunch of JSON objects for us into a template.
MANABI.paginator = function(){
	
	var me = {};
	
	var totalPages = 0,
		currentPage = 0,
		previousPage = 0,
		
		totalItems = 0,
		itemsPerPage = 0,
		currentItem = 0;
		
	var template;
	
	var items;
		
	me.init = function(template_, items_, itemsPerPage_, currentItem_){
		
		items = items_;
		totalItems = items_.length;
		
		template = template_;
		itemsPerPage = itemsPerPage_ || 5; // default to 5
		currentItem = currentItem_ || 0 // default to nothing.
		
		if (currentItem > totalItems){
			currentItem = totalItems;
		}
		
		totalPages = Math.ceil(totalItems / itemsPerPage); // begins at 1
		currentPage = Math.ceil(currentItem / itemsPerPage) - 1; // begins at 0
		
		previousPage = currentPage;
	}
	
	// private function which we can use to implement the three public methods.
	function genHTML(page){
		var html = "";
		
		// For every page-item.
		for(var start = page * itemsPerPage, i = start, j = 1; i < start + itemsPerPage && i < totalItems; ++i, ++j){	
			
			var classes = [];
			
			// We want to wrap each item in a div with the class "page-item" so we can style it.
			classes.push("page-item");
			classes.push("item-" + j);
			
			// Add some classes so we can tell which way we should be moving. Can be used for animations, etc.
			
			console.log("prev: " + previousPage + " current: " + currentPage);
			
			if(previousPage > currentPage){ // We went left
				classes.push("enter-from-left");
			}
			else if (previousPage < currentPage){ // We went right
				classes.push("enter-from-right");
			}
			else{ // We didn't go anywhere.
				// so don't push anything!
				console.log(previousPage);
				console.log(currentPage);
			}
			
			// Check if it's the current item in the list. - Can be used for styling.
			if(i === (currentItem - 1)){
				classes.push("page-item-active");
			}
			
			html += "<div class=\"" + classes.join(" ") + "\">";
			
			// Replace the values in the template.
			for(var name in items[i]){					
				var regex = new RegExp("&"+name+"&");
				template = template.replace(regex, items[i][name]);
			}
			html += template;
			
			html += "</div>";
		}
		
		return html;
	}
	
	me.getPageHTML = function(page){
		var html = "";
		html += genHTML(page);
		
		previousPage = currentPage;
		currentPage = page;

		return html;
	};
	
	me.moveNext = function(){
		previousPage = currentPage < totalPages ? currentPage++ : currentPage;
		return currentPage;
	};
	
	me.movePrevious = function(){
		previousPage = currentPage > 0 ? currentPage-- : currentPage;
		return currentPage;
	};
	
	me.moveTo = function(page){
		previousPage = currentPage;
		currentPage = page;
		return currentPage;
	}
	
	
	me.previousPage = function(){
		return previousPage;
	};
	
	me.currentPage = function(){
		return currentPage;
	};
	
	me.totalPages = function(){
		return totalPages;
	};
	
	return me;
};

MANABI.menu = (function(){
	
	var me = {};

	// functions to generate html for the menu
	function genHeader(title){
		header = "";
		header += "<div class=\"dropdown-header\"><h1>"
		header += title;
		header += "</h1></div>";
		return header;	
	}
	
	function genNavigation(currentPage, totalPages){		
		// Generate the page control links
		var controls = "";
		controls += "<div class=\"bottom\">";
		controls += "<div class=\"go-left";
		controls +=	currentPage === 0 ? " disabled" : ""; // We're at the first page, can't go any further.
		controls += "\"><i class=\"fa fa-angle-left\"></i></div>"
		
		for(var i = 0; i < totalPages; ++i){
			controls += "<div class=\"";
			controls +=	i === currentPage ? "active-circle" : "inactive-circle";
			controls += "\"></div>";
		}		
		
		controls += "<div class=\"go-right"
		controls +=	currentPage === totalPages - 1 ? " disabled" : ""; // We're at the last page, can't go any further.
		controls +="\"><i class=\"fa fa-angle-right\"></i></div>";
		
		//alert("current:" + currentPage + " total:" + totalPages);
		
		controls += "</div>"; // end "bottom"
		
		return controls;
	}
	
	function calculatePosition(element, menu, direction, centered){
		
		var rect = element.getBoundingClientRect();
		var position = {};
		
		switch(direction){
			case "left":
				position.left = rect.left - menu.offsetWidth;
				position.top = rect.top;
				break;
			case "right":
				position.left = rect.right;
				position.top = rect.top;
				break;
			case "up":
				position.left = rect.left;
				position.top = rect.top - menu.offsetHeight;
				break;
			case "down":
				position.left = rect.left;
				position.top = rect.bottom;
				break;
		}
		
		if(centered){
			switch(direction){
				// centre vertically
				case "left":
				case "right":
					var elementHeight = element.offsetHeight;
					var menuHeight = menu.offsetHeight;
					position.top -= menuHeight / 2;
					position.top += elementHeight / 2;
				break;
				// centre horizontally
				case "up":
				case "down":
					var elementWidth = element.offsetWidth;
					var menuWidth = menu.offsetWidth;
					position.left -= menuWidth / 2;
					position.left += elementWidth / 2;
				break;
			}
		}
		
		// Adjust if the page has been scrolled.
		position.top += window.pageYOffset;
		
		return position;
	}
	
	// Creates and attaches the events for the menu.
	function createMenu(element, config, id){
		var menu = document.createElement("div");
		
		if(id){
			menu.id = id;
		}
		
		menu.className = "dropdown";
		if(config.customClass && typeof config.customClass == "string"){
			menu.className += " " + config.customClass;
		}
		
		menu.style["position"] = "absolute";
		
		switch(config.type){
			case "click":
				util.addEventListener(element, "click", function(){
					if(!util.getClassesFor(menu).contains("dropdown-active")){
						// make the menu active
						util.addClass(menu, "dropdown-active");
						
						// Can only calculate its position once it's beign rendered and has a size.
						var pos = calculatePosition(element, menu, config.direction, config.centered);
						menu.style["left"] = pos.left + "px";
						menu.style["top"] = pos.top + "px";
					}
					else{
						var pageItems = document.getElementsByClassName("page-item");
						
						util.removeClass(menu, "dropdown-active");
						
						util.removeClassFromArray(pageItems, "enter-from-right");
						util.removeClassFromArray(pageItems, "enter-from-left");
					}
				});
			break;
			case "mouseover":
				util.addEventListener(element, "mouseover", function(){
					if(!util.getClassesFor(menu).contains("dropdown-active")){
						// make the menu active
						util.addClass(menu, "dropdown-active");
						
						// Can only calculate its position once it's beign rendered and has a size.
						var pos = calculatePosition(element, menu, config.direction, config.centered);
						menu.style["left"] = pos.left + "px";
						menu.style["top"] = pos.top + "px";
					}
				});
		
				util.addEventListener(element, "mouseout", function(){
					var pageItems = document.getElementsByClassName("page-item");
					
					util.removeClass(menu, "dropdown-active");
					
					util.removeClassFromArray(pageItems, "enter-from-right");
					util.removeClassFromArray(pageItems, "enter-from-left");
				});
			break;
		}
		
		return menu;
	}
	
	function setDefaults(config){
		config = config || {};
		
		config.header = config.header || "";
		config.centered = config.centered || false;
		config.direction = config.direction || "down";
		config.type = config.type || "click";
		config.exitDelay = config.exitDelay || 0;
		
		return config;
	}
	
	// lol this whole thing is bad
	function transition(menu, currentPage, totalPages, config, callback, paginator){
		menu.innerHTML = "";
		
		if(config.header){
			menu.innerHTML = genHeader(config.header);
		}
		
		//menu.innerHTML += "<div class=\"page-item\">" + callback(currentPage) + "</div>";
		menu.innerHTML += callback(currentPage);
		menu.innerHTML += genNavigation(currentPage, totalPages);
		
		// Left and right controls will always be the first the and last children of the bottom div.
		var navigation = menu.lastChild;
		var left = navigation.children[0];
		var right = navigation.lastChild;
		
		if(paginator){
			var pageItems = document.getElementsByClassName("page-item");
			
			util.addEventListener(right, "click", function(){
				
				for(var i = 0; i < pageItems.length; i++){
					util.addClass(pageItems[i], "exit-to-left");
				}
				
				console.log(pageItems);
				
				setTimeout(function(){
					transition(menu, paginator.moveNext(), totalPages, config, callback, paginator);
				}, 
				config.exitDelay)
				
			});
			
			util.addEventListener(left, "click", function(){
				
				for(var i = 0; i < pageItems.length; i++){
					util.addClass(pageItems[i], "exit-to-right");
				}
				
				setTimeout(function(){
					transition(menu, paginator.movePrevious(), totalPages, config, callback, paginator);
				}, 
				config.exitDelay)
			});
		}
		else{
			util.addEventListener(right, "click", function(){
			transition(menu, ++currentPage, totalPages, config, callback);
			});
			
			util.addEventListener(left, "click", function(){
				transition(menu, --currentPage, totalPages, config, callback);
			});
		}
	}
	
	// config object
	/*
		header: string // the title you want in the header, null, if you don't want a header.
		centered: bool // whether or not you want the menu to be centered relative to the element, if false, left sides of the menu and element match.
		direction: string, "up", "down", "left", "right", where the menu will be around the element.
		type: string, "click" or "mouseover", changes which event causes the menu to appear.
		exitDelay: number, milliseconds, how long to wait before changing the innerHTML, so we can do exit animations. page-items will get a class which we can style, exit-to-right (click left), exit-to-left (click right)	
	*/
	/*
	var config = {
		header: "menu",
		centered: true,
		direction: "down",
		type: "click",
		exitDelay: 0,
		customClass: "className"	
	};
	*/
	
	me.addDropdown = function addDropdown(element, callback, config, id){
		setDefaults(config);
		var dropdown = createMenu(element, config, id);
		
		if(config.header){
			dropdown.innerHTML = genHeader(config.header);
		}
		dropdown.innerHTML += callback();
		
		// Insert it into the document.
		document.body.insertBefore(dropdown, null);
	};
	
	me.addPagedDropdown = function addPagedDropdown(element, callback, totalPages, currentPage, config, id){
		
		totalPages ? totalPages-- : totalPages = 0;
		currentPage ? currentPage-- : currentPage = 0;
		
		config = setDefaults(config);
		
		var dropdown = createMenu(element, config, id);
		
		transition(dropdown, currentPage, totalPages, config, callback);
		
		// Insert it into the document.
		document.body.insertBefore(dropdown, null);
	};
	
	me.addPaginatedDropdown = function addPaginatedDropdown(element, paginator, config, id){
		config = setDefaults(config);
		
		var dropdown = createMenu(element, config, id);
		
		transition(dropdown, paginator.currentPage(), paginator.totalPages(), config, paginator.getPageHTML, paginator);
		
		document.body.insertBefore(dropdown, null);
	};
		
	return me; 
})();

