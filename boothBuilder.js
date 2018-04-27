
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
	//build accordions
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
			$(this).toggleClass("selected").promise().done(function(){
			    $(this).trigger("selected");
				BoothBuilder.writeUrl();
			});

			//maxed out selection
			
			if($(this).parent().data("max-select-count") >= selectedCount){
				$(this).parent().addClass("selectComplete");
			}else if($(this).parent().find("img.selected").length == 0){
				$(this).parent().removeClass("selectComplete");
			}

			//$(this).parent().trigger("selected");
		});

		$("#bgSelect img").on("selected", function(e){
			
			//set label
			if($(this).hasClass("selected")){
				$(this).siblings().removeClass("selected");
				$(this).parent().addClass("selectComplete");
				$(this).parent().parent().find("[aria-controls='bgSelect']").find(".header-label").text( $(this).attr("title") );
				$("#viewport .selectedBG").attr("src", $(this).attr("src")).fadeIn();

				BoothBuilder.openNextAccordion();
			}else{
				//unselect
				$(this).parent().removeClass("selectComplete");
				$(this).parent().parent().find("[aria-controls='bgSelect']").find(".header-label").text("Pick One!");
				//animate this
				//$("#viewport .selectedBG").fadeOut();
				$("#viewport .selectedBG").fadeOut();
			
			}

		});
		$("#fgSelect img").on("selected", function(e){

			if($(this).hasClass("selected")){
				//set label
				$(this).siblings().removeClass("selected");
				$(this).parent().addClass("selectComplete");
				$(this).parent().parent().find("[aria-controls='fgSelect']").find(".header-label").text( $(this).attr("title") );
				$("#viewport .selectedFG").attr("src", $(this).attr("src") ).fadeIn();

				//warning text
				if(!$("#viewport .selectedBG").is(':visible')){
					$("#introText").hide();
					$("#pleaseSelectText").fadeIn();
				}else{
					$("#pleaseSelectText").fadeOut();
				}

				//BoothBuilder.openNextAccordion();
			}else{
				//unselect
				$(this).parent().removeClass("selectComplete");
				$(this).parent().parent().find("[aria-controls='fgSelect']").find(".header-label").text("Pick Any!");
				//animate this
				$("#viewport .selectedFG").fadeOut();

				//warning text
				if(!$("#viewport .selectedBG").is(':visible')){
					$("#pleaseSelectText").hide();
					$("#introText").fadeIn();
				}
			}

		});
		$("#propSelect img").on("selected", function(e){
			selectedPropImgs = $(this).parent().find("img.selected");

			$("#viewport .selectedProps").empty();
			if(selectedPropImgs){

				selectedPropImgs.toArray().forEach(function(img, idx){
					img = $(img);
					$('<img />', {
					    src: img.attr("src"),
					    title: img.attr("title"),
					    index: idx
					}).data("index", idx).appendTo( $("#viewport .selectedProps") );
				});
				if(selectedPropImgs.length>=10){
					$(this).parent().addClass("selectComplete");
				}
			}

			//warning text if needed
			if(!$("#viewport .selectedBG").is(':visible')){
				$("#introText").hide();
				$("#pleaseSelectText").fadeIn();
			}else{

			}

		});
	},
	extractCleanName: function(imgUrl){
		//damn this ugly
		return imgUrl.substring(imgUrl.lastIndexOf("/")+1).replace("-"," ").replace(".jpg","");
	},
	writeUrl: function(){
		var bgIdx = $("#bgSelect").find("img.selected").index();
		var fgIdx = $("#fgSelect").find("img.selected").index();
		var props = $("#propSelect").find("img.selected");
		var propIdx = "";
		props.toArray().forEach(function(img, idx){
			propIdx+= $(img).index()+",";
		});
		var params = {
			bg: bgIdx,
			fg: fgIdx,
			prop: propIdx
		}
		//alert(jQuery.param(params));
		//alert($(location).attr('search'));
        
        var baseUrl = [location.protocol, '//', location.host, location.pathname].join('');
		//window.history.replaceState(params, "Booth Builder", baseUrl + jQuery.param(params));
	},
	openNextAccordion: function(){
		var $accordion = $( "#selectAccordion" );

	    var current = $accordion.accordion("option","active"),
	        maximum = $accordion.find("h3").length,
	        next = current+1 === maximum ? 0 : current+1;
	    // $accordion.accordion("activate",next); // pre jQuery UI 1.10
	    $accordion.accordion("option","active",next);
	}
};

document.addEventListener("DOMContentLoaded", function() {
	window.$ = jQuery;
	BoothBuilder.init();
});