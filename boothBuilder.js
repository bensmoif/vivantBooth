
var BoothBuilder = {
	theBGimgs: new Array(),
	theFGimgs: new Array(),
	thePropimgs: new Array(),
	selectedBG: '',
	selectedFG: '',
	selectedProps: new Array(),

	init: function(){
		this.setupBackgrounds();
		this.setupForegrounds();
		this.setupProps();
		this.rigDOM();
		this.rigEvents();
	},
	theDOM: jQuery("<div id='boothBuilder'><div id='selectors'></div></div>"),
	setupBackgrounds: function(){
		var $bgGalleries = jQuery("ul#backgroundImages");//get the first 3

		$bgGalleries.find("li a").each( function(){
			var imgUrl   = $(this).attr("href");
			var filename = BoothBuilder.extractCleanName(imgUrl);

			BoothBuilder.theBGimgs.push(
				{
					url: imgUrl,
					name: filename
				});
		});
		//TODO: push into DOM
		//theDOM.append()
	},
	setupForegrounds: function(){
		var $fgGalleries = jQuery("ul#foregroundImages");//get the 5th

		$fgGalleries.each( function(){
			$(this).find("li a").each( function(){
				var imgUrl   = $(this).attr("href");
				var filename = BoothBuilder.extractCleanName(imgUrl);

				BoothBuilder.theFGimgs.push(
					{
						url: imgUrl,
						name: filename
					});
			});
		});
	},
	setupProps: function(){
		var $propGalleries = jQuery("ul#propImages");//get the 4th

		$propGalleries.each( function(){
			$(this).find("li a").each( function(){
				var imgUrl   = $(this).attr("href");
				var filename = BoothBuilder.extractCleanName(imgUrl);

				BoothBuilder.thePropimgs.push(
					{
						url: imgUrl,
						name: filename
					});
			});
		});

	},
	//Build the dang thing, init events
	rigDOM: function(){
		
		//append bg
		this.theBGimgs.forEach(function(img, idx){
			$('<img />', {
			    src: img.url,
			    title: img.name
			}).data("index", idx).appendTo($("#bgSelect"));
		});

		//append fg
		this.theFGimgs.forEach(function(img, idx){
			$('<img />', {
			    src: img.url,
			    title: img.name,
			    index: idx
			}).data("index", idx).appendTo($("#fgSelect"));
		});

		//append prop
		this.thePropimgs.forEach(function(img, idx){
			$('<img />', {
			    src: img.url,
			    title: img.name,
			    index: idx
			}).data("index", idx).appendTo($("#propSelect"));
		});

		$( "#selectAccordion" ).accordion();

	},
	//events for interaction
	rigEvents: function() {
		$(".ui-accordion-content img").on("click", function(e){
			var selectedCount = $(this).parent().data("selected-count");

			if($(this).hasClass("selected")){
				$(this).parent().removeClass("selectComplete");
				selectedCount--;
			}else{
				selectedCount++;
			}
			$(this).parent().data("selected-count", selectedCount);
			//$(this).siblings().removeClass("selected");
			$(this).toggleClass("selected");

			//maxed out selection
			
			if($(this).parent().data("max-select-count") >= selectedCount){
				$(this).parent().addClass("selectComplete");
			}else if($(this).parent().find("img.selected").length == 0){
				$(this).parent().removeClass("selectComplete");
			}

			$(this).parent().trigger("selected");
		});

		$("#bgSelect").on("selected", function(e){
			selectedBG = $(this).find("img.selected")[0];
			//set label
			$(this).parent().find("[aria-controls='bgSelect']").find(".header-label").text(selectedBG.title);
			$("#viewport .selectedBG").css('background-image', 'url(' + selectedBG.src + ')').show();
		});
		$("#fgSelect").on("selected", function(e){
			selectedFG = $(this).find("img.selected")[0];
			//set label
			$(this).parent().find("[aria-controls='fgSelect']").find(".header-label").text(selectedFG.title);
			$("#viewport .selectedFG").css('background-image', 'url(' + selectedFG.src + ')').show();
		});
		$("#propSelect").on("selected", function(e){

		});
	},
	extractCleanName: function(imgUrl){
		//damn this ugly
		return imgUrl.substring(imgUrl.lastIndexOf("/")+1).replace("-"," ").replace(".jpg","");
	}
};

document.addEventListener("DOMContentLoaded", function() {
	window.$ = jQuery;
	BoothBuilder.init();
});