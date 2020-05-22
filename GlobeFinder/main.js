// ================================================== SCRIPT START ================================================== //
/* 
Map is ready with a default starting location while user accepts prompt 
Initialize the map object 
*/
var mymap = L.map('mapid').setView([51.5, 0.127], 5);

// Setup:
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "rastin2020/ckaia37x00pw91ilk11hroz4r",
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoicmFzdGluMjAyMCIsImEiOiJjazkydzQwb24wM25nM2VvMjYyYzI3Zm9kIn0.ZUV5ivYL6-5YQEbYumKYkw'
}).addTo(mymap);

// Find current location and center map there:
$(document).ready(function () {
	navigator.geolocation.getCurrentPosition(function(position) {

		// Get the coordinates of the current position:
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;

		// Add marker to and center on the map:
		mymap.setView([lat, lng], 5);
		var pulsingIcon = L.icon.pulse({iconSize:[20,20],color:'black'});
		var marker = L.marker([lat, lng],{icon: pulsingIcon}).addTo(mymap).bindPopup("You are here").openPopup();

		// Pans to current location without changing map state:
		$("#location-finder").on("click", function() {
			mymap.setView([lat, lng], 5);
			var pulsingIcon = L.icon.pulse({iconSize:[20,20],color:'black'});
			var marker = L.marker([lat, lng],{icon: pulsingIcon}).addTo(mymap);
		})

		// When page loads, inital calls are made with the current coords:
		calls(lat, lng);
	})
})

$(document).ready(function () {
	// When search bar is used, same calls are made with different country name:
	$("#search-bar").keypress(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			var countrySearch = ($("#search-bar").val()).trim();

			$("#country-capital").empty();

			$("#population").empty();

			$("#currency-exchange").empty();

			$("#weather").empty();
			
			$("#country-capital").append("Country <img src='assets/images/worldIcon.png' width='28px' height='28px'> | ");
			
			$("#population").append("Population <img src='assets/images/popIcon.png' width='30px' height='30px'> | ");
			
			$("#currency-exchange").append("Currency <img src='assets/images/currencyIcon.png' width='26px's> | ");
			
			$("#weather").append("Weather <img src='assets/images/weatherIcon.png' width='26px' height='26px'> | ");
			
			$("#nearby-interest-list").empty();

			$("div.leaflet-popup.leaflet-zoom-animated").remove();

			$("path.leaflet-interactive").remove();

			$("img.leaflet-marker-icon.leaflet-zoom-animated.leaflet-interactive").remove();
			
			// Find new coords for searched country to make the new calls:
			if (localStorage.getItem("opencage"+countrySearch) != null) {
				
				var obj = JSON.parse(localStorage.getItem("opencage"+countrySearch));
					
					try {

						var newLat = obj.results[0].geometry.lat;
						
						var newLng = obj.results[0].geometry.lng;
						
						// Make new calls for new country:
						calls(newLat, newLng);
						
						// Re-center map to new country:
						mymap.setView([newLat, newLng], 5);

					} catch (error) {
						$("#country-capital").append("Invalid country...").css("color", "#ff3030");
					}
			} else {
				$.ajax({
				url : "assets/php/opencage.php",
				type : "POST",
				dataType : "JSON",
				data : { "countryName": countrySearch },
				success: function (data, status, xhr) {
					try {
						localStorage.setItem(("opencage"+countrySearch), JSON.stringify(data));
					} catch (error) {
						try {

							var newLat = data.results[0].geometry.lat;
							
							var newLng = data.results[0].geometry.lng;
							
							// Make new calls for new country:
							calls(newLat, newLng);
							
							// Re-center map to new country:
							mymap.setView([newLat, newLng], 5);

						} catch (error) {
							$("#country-capital").append("Invalid country...").css("color", "#ff3030");
						}
					}
				},
				error: function(error) {
				console.log(error);
				}
			}) 
			} 
		}
});
})

// When user clicks current location icon, page is refreshed so they can be prompted with choice once again:
$("#page-refresh").on("click", function() {
	location.reload();
})

// When user submits data for directions:
$("#modalsubmit").on("click", function() {

	var startPostCode = $("#start").val();
	var finishPostCode = $("#finish").val();
	
	postCodesCall(startPostCode, finishPostCode);
})

mymap.on("popupclose", function() {
	$("path.leaflet-interactive").remove();
});

// ================================================== MAIN FUNCTIONS ================================================== //

function applyCountryBorder(map, countryname) {

    $.ajax({
      type: "GET",
      dataType: "JSON",
      url:
        "https://nominatim.openstreetmap.org/search?country=" +
        countryname.trim() +
        "&polygon_geojson=1&format=json"
    })
    .then(function(data) {
      L.geoJSON(data[0].geojson, {
        color: "green",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.0 
      }).addTo(map);
    });
}

function calls(lat, lng) {
                    
    // First Call - (OpenCage) to retrieve country name:
    $(document).ready(function () {
		// Geolocate Call:
		geolocateCall(lat, lng)

		// Geonames Call:
		geonamesCall(lat, lng);
    });
}

function directions(lat1, lng1, lat2, lng2) {

		$.ajax({
			url : "assets/php/directions.php",
			type : "POST",
			dataType : "JSON",
			data : { "latitude1": lat1, "longitude1": lng1, "latitude2": lat2, "longitude2": lng2 },
            success: function (data, status, xhr) {    
				
				try {
					// Remove previous line, if any
					$("path.leaflet-interactive").remove();
					mymap.closePopup();

					// Draw new line
					var line = L.geoJSON(data).addTo(mymap);

					var lines = new L.LayerGroup();
					lines.addTo(mymap);
					lines.addLayer(line);

					mymap.setView([lat2, lng2], 13);

					var popup2 = L.popup();

					popup2
					.setLatLng([lat2, lng2])
					.setContent("<h6>Destination</h6>" + formatMeters(data.features[0].properties.summary.distance))
					.openOn(mymap);
					}

					catch(err) {
						console.log(err);
					}
            },
            error: function (error) {
                console.log(error);
            }
        });
	}

function formatMeters(x) {
	var length = x.toString().length;
			return (x/1000).toFixed(1) + "(km)";
}

function formatNumber(x) {
	if(isNaN(x)) return x;

	if(x < 9999) {
		return x;
	}

	if(x < 1000000) {
		return Math.round(x/1000) + "K";
	}
	if( x < 10000000) {
		return (x/1000000).toFixed(2) + "M";
	}

	if(x < 1000000000) {
		return Math.round((x/1000000)) + "M";
	}

	if(x < 1000000000000) {
		return Math.round((x/1000000000)) + "B";
	}

	return "1T+";
}

function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
    }
    return splitStr.join(' '); 
}

// ================================================== API Calls ================================================== //

function geonamesCall(lat, lng) {
	$.ajax({
		url : "assets/php/geonames.php",
		type : "POST",
		dataType : "JSON",
		data : { "latitude": lat, "longitude": lng },
			success: function (data5, status, xhr) {
				try {
					if(data5.geonames.length == 0) {
						$("#nearby-interest-list").append("<li>None found...</li>").css("color", "#ff3030");;
				} 	else {
						for(var i=0; i<data5.geonames.length; i++) {

						var title = data5.geonames[i].title;

						$("#nearby-interest-list").append("<li id="+ [i] +">"+"<h6 id='list_comp'"+">"+titleCase(title) + "<h6/>"+"</li>");
						
						$("#"+[i]).append("<p>" + data5.geonames[i].summary + " - " + "<a href="+"https://"+data5.geonames[i].wikipediaUrl+" target='_blank'"+" id='list_comp'"+">" + "View More"+"<a/>" + "</p>");

						$("#nearby-interest-list").css("color", "white");
						
						// Add these locations to map as markers as well:
						var customiconClass = L.Icon.extend({
							options: {
								iconSize:     [40, 40],
								iconAnchor:   [20, 40],
							}
						});

						var customicon = new customiconClass({
							iconUrl: "assets/images/interestlogo.png",
						})

						var marker = L.marker([data5.geonames[i].lat, data5.geonames[i].lng], { icon: customicon })
						.bindTooltip(titleCase(title), 
						{ permanent: false })
						.openTooltip();

						var markers = L.layerGroup().addLayer(marker).addTo(mymap);
						}
				}
				} catch (error) {
					alert("Error occurred: Please refresh your browser.");
				}
			},
			error: function(error) {
			console.log(error);
		}
		}); 
}

function geolocateCall(lat, lng) {
	$.ajax({
		url : "assets/php/geolocate.php",
		type : "POST",
		dataType : "JSON",
		data : { "latitude": lat, "longitude": lng },
			success: function (data1, status, xhr) {

				var imageIconUrl = "https://www.countryflags.io/"+data1.results[0].components.country_code+"/flat/64.png";
				
				var country = (data1.results[0].components.country.toUpperCase());

				applyCountryBorder(mymap, country);

				$("#country-capital").append(titleCase(country)+"  "+"<img src="+imageIconUrl+" width='30px' height='30px' style='padding: 0 2px'>");

				$("#country-capital").css("color", "white");

				// Second Call - (Rest Countries) within the first, since we need values from first call in the second call: 
				restCountriesCall(country, lat, lng);
			},
			error: function(error) {
			console.log(error);
			}
		});
}

function openWeatherMapCall(lat, lng) {
	$.ajax({
		url : "assets/php/openweathermap.php",
		type : "POST",
		dataType : "JSON",
		data : { "latitude": lat, "longitude": lng },
				success: function (data4, status, xhr) {    

					var description = (data4.weather[0].description).toUpperCase();

					var temperatureKelvins = data4.main.temp;

					var temperatureCelsius = (temperatureKelvins - 273).toFixed(2);

					var humidity = data4.main.humidity;

					$("#weather").append(titleCase(description)+" "+temperatureCelsius+"C "+humidity+"% (humidity)");
				},
				error: function(error) {
				console.log(error);
				}
			});
}

function openExchangeRatesCall(currency, data2, lat, lng) {
	$.ajax({
		url : "assets/php/openexchangerates.php",
		type : "POST",
		dataType : "JSON",
				success: function (data3, status, xhr) {

					// CURRENCY RATE value extracted (against the "USD", which is the default from the URL):
					var rate = data3.rates[currency].toFixed(3); // NOTE TO SELF: if you want to use a variable as the selector, dot notation doesn't work, so you have to use bracket notation as shown here to select the property.

					$("#currency-exchange").append(" ("+data2[0].currencies[0].symbol+rate+"/USD)");

						// Fourth Call - (Open Weather Map) - current weather:
						openWeatherMapCall(lat, lng);
				},
				error: function(error) {
				console.log(error);
				}
			});
}

function postCodesCall(postcode1, postcode2) {
	$.ajax({
		url : "assets/php/postcodes.php",
		type : "POST",
		dataType : "JSON",
		data: { "postcode": postcode1.replace(/ /g,'')},
				success: function (data6, status, xhr) {

					var lat1 = data6.result[0].latitude;
					var lng1 = data6.result[0].longitude;

					$.ajax({
						url : "assets/php/postcodes.php",
						type : "POST",
						dataType : "JSON",
						data: { "postcode": postcode2.replace(/ /g,'')},
								success: function (data6, status, xhr) {
									try {

										var lat2 = data6.result[0].latitude;
										var lng2 = data6.result[0].longitude;
											
										directions(lat1, lng1, lat2, lng2);

									} catch (error) {
										alert("Please enter a valid postcode");
									}
								},
								error: function(error) {
								console.log(error);
								}
							});
				},
				error: function(error) {
				console.log(error);
				}
			});
}

function restCountriesCall(country, lat, lng) {
	$.ajax({
		url : "assets/php/restcountries.php",
		type : "POST",
		dataType : "JSON",
		data : { "cont": country },
				success: function (data2, status, xhr) {   

					var capital = data2[0].capital;

					$("#country-capital").append(" || Capital: "+capital);

					var population = formatNumber(data2[0].population);

					$("#population").append(population);

					var currency = data2[0].currencies[0].code;

					$("#currency-exchange").append(currency);
				
						// Third Call - (Open Exchange Rates) within the second, since we need a value from the second call in the third call:
						openExchangeRatesCall(currency, data2, lat, lng);
				},
				error: function(error) {
				console.log(error);
				}
			});
}