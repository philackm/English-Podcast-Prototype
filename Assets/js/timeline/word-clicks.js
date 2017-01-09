(function(){
	
	// TODO: Generate these definitions from the HTML dumped out from rails.
	var definitions = {
		1: { en:"hello", jp:"こんにちは", en_meaning:"a greeting used upon meeting someone", pos:"interjection"},
		2: { en:"welcome", jp:"ようこそ", en_meaning:"a greeting used when someone arrives somewhere", pos:"interjection"},
		3: { en:"another", jp:"もう一つの", en_meaning:"one more, a further, separate thing", pos:"pronoun"},
		4: { en:"one", jp:"一、一つ", en_meaning:"the number 1, the lowest cardinal number", pos:"number"},
		5: { en:"minute", jp:"分", en_meaning:"1/60th of an hour, 60 seconds", pos:"noun"},
		6: { en:"English Supercharge", jp:"n/a", en_meaning:"a podcast series on kikiTORA.com", pos:"proper noun"},
		7: { en: "Put up with", jp:"我慢する", en_meaning:"to tolerate or accept something", pos:"verb"}
	}
	
	function createWord(element){
		
		var word = {};
		
		word.element = element;
		word.clicked = false;
		
		word.highlight = function(){
			if(!word.clicked){
				util.addClass( word.element, "clicked" );
				word.clicked = true;
			}
		};
		word.unhighlight = function(){
			if(word.clicked){
				util.removeClass(word.element, "clicked");
				word.clicked = false;
			}
		};
		
		word.ident = word.element.attributes["word-id"].value;;
		
		word.en = definitions[word.ident].en;
		word.jp = definitions[word.ident].jp;
		word.en_meaning = definitions[word.ident].en_meaning;
		word.pos = definitions[word.ident].pos;
		
		return word;
	}
	
	var sidebar = {
		
		entries: [],
		addHandlers: [],
		removeHandlers: [],
		
		add: function(word){
			// add the object
			this.entries.push(word.ident);
			
			// call the handlers
			for(var i = 0; i < this.addHandlers.length; i++){
				this.addHandlers[i](word);
			}
		},
		
		remove: function(word){
			// remove the object
			if(this.contains(word)){
				this.entries.splice(this.entries.indexOf(word.ident), 1);
			}
			
			// call the handlers
			for(var i = 0; i < this.removeHandlers.length; i++){
				this.removeHandlers[i](word);
			}
		},
		
		contains: function(word){
			if(this.entries.indexOf(word.ident) > -1){
				return true;
			}
			else{
				return false;
			}
		},
		
		count: function(){
			return this.entries.length;
		},
		
		last: function(){
			return this.entries[this.entries.length];
		},
		
		setAddHandler: function(handler){
			this.addHandlers[this.addHandlers.length] = handler;
		},
		setRemoveHandler: function(handler){
			this.removeHandlers[this.removeHandlers.length] = handler;
		}
	};
	
	
	// Create all the clickable words.
	var clickables = document.getElementsByClassName("timeline-word");
	var words = [];
	
	for(var i = 0; i < clickables.length; i++){
		
		var word = createWord(clickables[i])

		word.onClick = (function(word){
			return function(){
				// Highlight the current word.
				word.clicked ? word.unhighlight() : word.highlight();
				
				// Highlight any other words with the same id that aren't the current word.
				for(var j = 0; j < words.length; j++){
					if(words[j].ident === word.ident && words[j] !== word){
						words[j].clicked ? words[j].unhighlight() : words[j].highlight();
					}
				}
				
				// Then add itself to the sidebar.
				sidebar.contains(word) ? sidebar.remove(word) : sidebar.add(word);
			}
		})(word);
		
		// Set the event listener on the actual element.
		util.addEventListener(word.element, "click", word.onClick);
		
		words.push(word);
	}	
	
	// Update PC UI
	function updateUIPCAdd(word){

		var domSidebar = document.getElementById("vocab");
		var newEntry = generateEntry(word);
		
		domSidebar.insertBefore(newEntry, undefined);
		// By using setTimeout it delays this slightly so the width is calculated and the animation works correctly. I assume anyway. It works.
		setTimeout(function(){util.addClass( newEntry, "wordin" );}, 0);
	}
	
	function updateUIPCRemove(word){
		
		var vocab = document.getElementById("vocab");
		
		removeUIEntry(word, vocab, function(){
			for(var j = 0; j < vocab.children.length; j++){	
				vocab.children[j].children[0].children[0].textContent = j + 1;
			}
		});
	}
	
	// Update Mobile UI
	function updateUIMobileAdd(word){
		var vocab = document.getElementById("mobile-vocab");
		
		var newEntry = generateEntry(word);
		
		vocab.insertBefore(newEntry, vocab.children[0]);
		vocab.style["height"] = newEntry.offsetHeight + "px";
		
		// By using setTimeout it delays this slightly so the width is calculated and the animation works correctly. I assume anyway. It works.
		setTimeout(function(){util.addClass( newEntry, "wordin" );}, 0);	
	}
	
	function updateUIMobileRemove(word){
		var vocab = document.getElementById("mobile-vocab");
		
		removeUIEntry(word, vocab, function(){
			
			// after it is removed, update the side count.
			var length = vocab.children.length;
			for(var j = 0; j < vocab.children.length; j++){
			
				vocab.children[j].children[0].children[0].textContent = length--;
			}
		});
	}
	
	// The the handlers for the UI.
	sidebar.setAddHandler(updateUIPCAdd);
	sidebar.setAddHandler(updateUIMobileAdd);
	
	sidebar.setRemoveHandler(updateUIPCRemove);
	sidebar.setRemoveHandler(updateUIMobileRemove);
	
	function generateEntry(word){
		var newEntry = document.createElement("div");
		
		newEntry.className = "word-container";
		newEntry.setAttribute("word-id", word.ident);
		newEntry.innerHTML = "";
		
		var template = "";
		
		template += "<div class=\"number-column\">";
		template += "<h1>&number&</h1>";
		template += "</div>";
		template += "<div class=\"word\">";
		template += "<div class=\"pos\">&pos&</div>";
		template += "<div class=\"english\">&en&</div><span> ⇋ </span><div class=\"japanese\">&jp&</div>";
		template += "<div class=\"meaning\">&en_meaning&</div>";
		template += "</div>";
		
		// Replace the values in the template.
		for(var name in word){					
			var regex = new RegExp("&"+name+"&");
			template = template.replace(regex, word[name]);
		}
		
		// Add in the number.
		template = template.replace("&number&", sidebar.count());
		
		newEntry.innerHTML = template;
		
		return newEntry;
	}
	
	function removeUIEntry(word, container, finished){
		
		for(var i = 0; i < container.children.length; i++){
			
			if(container.children[i] && util.getClassesFor(container.children[i]).contains("word-container")){
				
				if(container.children[i].attributes["word-id"].value == word.ident){
					
					//util.addClass(vocab.children[i], "wordout");
					
					console.log(container.children[i]);
					$(container.children[i]).css("display", "block");
					$(container.children[i]).animate({height: "0px"}, {duration: 200, queue: false});
					
					// let the animation complete then remove it.
					setTimeout(function(){
						
						container.children[i].parentNode.removeChild(container.children[i]);
						
						finished();
						
					}, 190);
					
					break;
				}
			}
		}
	}
	
})();
	
	
	
