
var BoothBuilder = {
	theBGimgs: new Array(),
	theFGimgs: new Array(),
	thePropimgs: new Array(),
	selectedBG: '',
	selectedFG: '',
	propSelectQ: new Array(),
	theDOM: jQuery("<div id='boothBuilder'><div id='selectors'></div></div>"),

	init: function(){
		this.setupBackgrounds();
		this.setupForegrounds();
		this.setupProps();
		this.rigDOM();
		this.rigEvents();
		this.readUrl();
	},
	setupBackgrounds: function(){
		var $bgGalleries = jQuery("ul#backgroundImages");//get the first 3

		$bgGalleries.find("li a").each( function(){
			var imgUrl   = $(this).attr("href");
			var filename = BoothBuilder.extractCleanName(imgUrl);
			var bigUrl	 = BoothBuilder.createBigUrl(imgUrl);

			BoothBuilder.theBGimgs.push(
				{
					url: imgUrl,
					name: filename,
					big: bigUrl
				});
		});
	},
	setupForegrounds: function(){
		var $fgGalleries = jQuery("ul#foregroundImages");//get the 5th

		$fgGalleries.each( function(){
			$(this).find("li a").each( function(){
				var imgUrl   = $(this).attr("href");
				var filename = BoothBuilder.extractCleanName(imgUrl);
				var bigUrl	 = BoothBuilder.createBigUrl(imgUrl);

				BoothBuilder.theFGimgs.push(
					{
						url: imgUrl,
						name: filename,
						big: bigUrl
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
				var bigUrl	 = BoothBuilder.createBigUrl(imgUrl);

				BoothBuilder.thePropimgs.push(
					{
						url: imgUrl,
						name: filename,
						big: bigUrl
					});
			});
		});

	},
	//build accordions
	rigDOM: function(){
		
		//TODO: rig titles

		//append bg
		this.theBGimgs.forEach(function(img, idx){
			$('<img />', {
			    src: img.url,
			    title: img.name
			}).attr("data-big", img.big).appendTo($("#bgSelect"));
		});

		//append fg
		this.theFGimgs.forEach(function(img, idx){
			$('<div />', {
			    index: idx,
			    class: 'icon'
			}).css('background-image', 'url('+img.url+')').attr("data-big", img.big).appendTo($("#fgSelect"));
		});

		//append prop
		this.thePropimgs.forEach(function(img, idx){
			$('<img />', {
			    src: img.url,
			    title: img.name,
			    index: idx
			}).attr("data-big", img.big).appendTo($("#propSelect"));
		});

		$( "#selectAccordion" ).accordion();

	},
	//events for interaction
	rigEvents: function() {
		$(window).resize(function() {
			$( "#selectAccordion" ).accordion();
		});

		$(".ui-accordion-content img, .ui-accordion-content div.icon").on("click", function(e){
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
		});

		$("#bgSelect img").on("selected", function(e){
			//set label
			if($(this).hasClass("selected")){
				$(this).siblings().removeClass("selected");
				$(this).parent().addClass("selectComplete");
				//$(this).parent().parent().find("[aria-controls='bgSelect'] .headerTitle").text( $(this).attr("title") );
				$("#viewport .selectedBG").css('background-image', 'url("' + $(this).data("big") + '")').fadeIn();
			}else{
				//unselect
				$(this).parent().removeClass("selectComplete");
				//$(this).parent().parent().find("[aria-controls='bgSelect'] .headerTitle").text("Choose a Backdrop");
				//animate this
				$("#viewport .selectedBG").fadeOut();
			}

		});
		$("#fgSelect div.icon").on("selected", function(e){

			if($(this).hasClass("selected")){
				//set label
				$(this).siblings().removeClass("selected");
				$(this).parent().addClass("selectComplete");
				$(this).parent().parent().find("[aria-controls='fgSelect'] .headerTitle").find(".header-label").text( $(this).attr("title") );
				$("#viewport .selectedFG").css("backgroundImage", "url("+$(this).data("big")+")" ).fadeIn();

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
				$(this).parent().parent().find("[aria-controls='fgSelect'] .headerTitle").text("Add a Foreground (optional)");
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
			var theUrl = $(this).attr('src');

			if(!$(this).hasClass("selected")){
				//we're on an unselect action
				BoothBuilder.propSelectQ.forEach(function(img, idx){
					if(img.attr('src')===theUrl){
    					BoothBuilder.propSelectQ.splice(idx, 1);
					}
    			});

			}else{
				if(BoothBuilder.propSelectQ.length >= 3){//keep it at 3
					var unselectUrl = BoothBuilder.propSelectQ[0].attr('src');
					//unselect the front of Queue
					$("#propSelect img[src$='"+unselectUrl+"']").removeClass("selected");

					//pop it from queue
					BoothBuilder.propSelectQ.shift()
				}
				BoothBuilder.propSelectQ.push($(this));
			}

			//clear the viewport
			$("#viewport .selectedProps").empty();
			if(BoothBuilder.propSelectQ){
				//draw them in
				BoothBuilder.propSelectQ.forEach(function(img, idx){
					img = $(img);


					var nImg = $('<img />', {
					    src: img.data("big"),
					    title: img.attr("title"),
					    index: idx
					}).data("index", idx).data("addedOn", Date.now()).hide();
					nImg.appendTo( $("#viewport .selectedProps") );
					$("#viewport .selectedProps img").fadeIn();
				});
				if(BoothBuilder.propSelectQ.length>=3){
					$(this).parent().addClass("selectComplete");
				}
			}

			//warning text if needed
			if(!$("#viewport .selectedBG").is(':visible')){
				$("#introText").hide();
				$("#pleaseSelectText").fadeIn();
			}

		});

		$("a#saveBtn").on('click', function(e) {
			$(this).addClass("working");

			$("#imgDownloadCtr").remove();//cleanup any that exist

			//create holder
			var $imgDownloadCtr = $("<div id='imgDownloadCtr'></div>");
			$imgDownloadCtr.append($("#viewport").clone().addClass("saveImg"));
			$(".BoothBuilder .appRow").append($imgDownloadCtr);

			html2canvas(document.querySelector("#viewport")).then(canvas => {
				Canvas2Image.saveAsPNG(canvas, 750, 500)
				/*
				var image = canvas.toDataURL("image/png");
			    var anchor = document.createElement('a');
			    anchor.setAttribute('download', 'myBooth-OhSoVivant.png');
			    anchor.setAttribute('href', image);
			    anchor.setAttribute('id','downloadBtn');
			    $("body").append(anchor)
			    $("#downloadBtn").click();
			    */
    			$(this).removeClass("working");
			});
		});


		$("a#shareBtn").on('click',function() {
			var shareHtml = "",
				shareUrl = window.location.href,
				el = $(this),
				shareModalTitle = el.data("modal-title"),
				shareModalDescription = el.data("modal-description"),
				shareFacebookLabel = el.data("facebook-label"),
				shareTwitterLabel = el.data("twitter-label"),
				shareTwitterText = el.data("twitter-text"),
				shareLinkedInLabel = el.data("linkedin-label"),
				shareLinkedInTitle = encodeURIComponent(el.data("linkedin-title")),
				shareLinkedInSummary = encodeURIComponent(el.data("linkedin-summary")),
				shareLinkedInSource = window.location.protocol + "//" + window.location.hostname,
				shareEmailLabel = "Share with Oh So Vivant!",
				shareEmailSubject = el.data("email-subject");
			
			shareHtml += '<div class="modal fade in text-center" style="top: 9vw;" id="modal-share" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="false">'+
			'<div class="modal-dialog">'+
				'<div class="modal-content">'+
					'<div class="modal-header">'+
						'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>'+
						'<h3 class="modal-title" id="myModalLabel">Share Your Booth!</h3>';
			
						shareHtml += '<p>Feel free to share your booth with friends!</p>';
						
			
					'</div>'+
					'<div class="modal-body">'+
						'<ul class="list-unstyled">';
			
							if (shareFacebookLabel != undefined) {
								shareHtml += '<li><a href="https://www.facebook.com/sharer/sharer.php?u='+shareUrl+'" title="'+shareFacebookLabel+'" target="_blank" class="btn btn-facebook"><i class="icon-facebook"></i> '+shareFacebookLabel+'</a></li>';
							}
							if (shareTwitterLabel != undefined) {
								shareHtml += '<li><a href="https://twitter.com/intent/tweet?text='+shareTwitterText+'&url='+shareUrl+'" title="'+shareTwitterLabel+'" target="_blank" class="btn btn-twitter"><i class="icon-twitter"></i> '+shareTwitterLabel+'</a></li>';
							}
							if (shareLinkedInLabel != undefined) {
								shareHtml += '<li><a href="https://www.linkedin.com/shareArticle?mini=true&url='+shareUrl+'&title='+shareLinkedInTitle+'&summary='+shareLinkedInSummary+'&source='+shareLinkedInSource+'" title="'+shareLinkedInLabel+'" target="_blank" class="btn btn-linkedin"><i class="icon-linkedin"></i> '+shareLinkedInLabel+'</a></li>';
							}
							if (shareEmailLabel != undefined) {
								shareHtml += '<li><a href="mailto:?subject=My Oh So Vivant Booth!&body=Hi, I put together my own great Oh So Vivant PhotoBooth, check it out: '+shareUrl+'" title="'+shareEmailLabel+'" class="btn btn-email"><i class="icon-mail"></i> '+shareEmailLabel+'</a></li>';
							}
			
						'</ul>'+
					'</div>'+
				'</div>'+
			'</div>'+
		'</div>';
			
			$("body").append(shareHtml);
			
			$('#modal-share').modal()
		});
	},
	extractCleanName: function(imgUrl){
		//damn this ugly
		return imgUrl.substring(imgUrl.lastIndexOf("/")+1).replace("-"," ").replace(".jpg","");
	},
	createBigUrl: function(stringUrl){
		var new_string = stringUrl.substring(0, stringUrl.lastIndexOf(".")) + "-Big" + stringUrl.substring(stringUrl.lastIndexOf("."));
		return new_string;
	},
	writeUrl: function(){
		var bgIdx = $("#bgSelect").find("img.selected").index();
		var fgIdx = $("#fgSelect").find(".icon.selected").index();
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
        
        var baseUrl = [location.protocol, '//', location.host, location.pathname].join('');
        newUrl = baseUrl + "?" + jQuery.param(params);
        console.log(newUrl);
		window.history.replaceState(params, "Booth Builder", newUrl);
	},
	readUrl: function (){
		//read first
		var bgParam = getUrlParameter("bg");
		var fgParam = getUrlParameter("fg");
		var propParam = getUrlParameter("prop");

		console.log(propParam);

		if(bgParam){
			var bgIndex = parseInt(bgParam);
			if(bgIndex >= 0){
				//click that one!
				$('#bgSelect').children().eq(bgIndex).click();
			}
		}
		if(fgParam){
			var fgIndex = parseInt(fgParam);

			if(fgIndex >= 0){
				//click that one!
				$('#fgSelect').children().eq(fgIndex).click();
			}
		}
		if(propParam){
			var propIndex = propParam.split(',');

			//console.log(propIndex);
			propIndex.forEach( function(anIdx) {
				$('#propSelect').children().eq(anIdx).click();
			});
		}
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
	//lazyload big imgs

	$.each($("#bgSelect img, #propSelect img, #fgSelect img"), function(idx, elem){
	  	var curImg = new Image();

	    curImg.src = $(elem).data("big");
	    //throw them in hidden div
	    $(curImg).appendTo(".imagedata");

	    curImg.onload = function(){
	        // do whatever here, add it to the background, append the image ect.
	        //console.log(this);  
	    }
	})

	//render jqueryui.css
	$('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css'));
	//render jqueryui.js
	$.getScript('https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js', function(response, status) {
		console.log('jquery-ui loaded...')
	});

	//build dialog
    $("body").append($("<div id='dialog-modal'></div>"));

});


//polyfill for getting params;
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};