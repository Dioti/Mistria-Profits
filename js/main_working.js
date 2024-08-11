// Prepare variables.
var cropList;

var svgWidth = 1080;
var svgMinWidth = 300;
var svgHeight = 480;

var width = svgWidth - 48;
var height = (svgHeight - 56) / 2;
var barPadding = 5;
var paddingLeft = 8;
var barWidth = width / getMaxCropCount() - barPadding;
var barWidth = width / 45 - barPadding;
var miniBar = 8;
var barOffsetX = 29;
var barOffsetY = 40;
var graphDescription = "Profit";

// Prepare web elements.
var svg = d3.select("div.graph")
	.append("svg")
	.attr("width", svgWidth)
	.attr("height", svgHeight)
	.style("background-color", "#333333")
	.style("border-radius", "8px");

var tooltip = d3.select("body")
	.append("div")
	.style("position", "absolute")
	.style("z-index", 10)
	.style("visibility", "hidden")
	.style("background", "rgb(0, 0, 0)")
	.style("background", "rgba(0, 0, 0, 0.75)")
	.style("padding", "8px")
	.style("border-radius", "8px")
	.style("border", "2px solid black");

var gAxis = svg.append("g");
var gTitle = svg.append("g");
var gProfit = svg.append("g");
var gSeedLoss = svg.append("g");
var gIcons = svg.append("g");
var gTooltips = svg.append("g");

var axisY;
var barsProfit;
var barsSeed;
var imgIcons;
var barsTooltips;
var options;
var MAX_INT = Number.MAX_SAFE_INTEGER || Number.MAX_VALUE;

/*
 * Formats a specified number, adding separators for thousands.
 * @param num The number to format.
 * @return Formatted string.
 */
function formatNumber(num) {
    num = num.toFixed(2) + '';
    x = num.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

/*
 * Calculates the maximum number of harvests for a crop, specified days, season, etc.
 * @param cropID The ID of the crop to calculate. This corresponds to the crop number of the selected season.
 * @return Number of harvests for the specified crop.
 */
function harvests(cropID) {
	var crop = seasons[options.season].crops[cropID];

	remainingDays = options.days;

	// console.log("=== " + crop.name + " ===");

	var harvests = 0;
	var day = 1;

	day += crop.growth.initial;

	if (day <= remainingDays)
		harvests++;

	while (day <= remainingDays) {
		if (crop.growth.regrow > 0) {
			// console.log("Harvest on day: " + day);
			day += crop.growth.regrow;
		}
		else {
			// console.log("Harvest on day: " + day);
			day += crop.growth.initial;
		}

		if (day <= remainingDays)
			harvests++;
	}

	// console.log("Crop: " + crop.name + ", harvests: " + harvests);
	return harvests;
}

/*
 * Calculates the minimum cost of a single packet of seeds.
 * @param crop The crop object, containing all the crop data.
 * @return The minimum cost of a packet of seeds, taking options into account.
 */
function minSeedCost(crop) {
	var minSeedCost = Infinity;

	if (crop.seeds.generalStore != 0 && options.seeds.generalStore && crop.seeds.generalStore < minSeedCost)
		minSeedCost = crop.seeds.generalStore;
	if (crop.seeds.special != 0 && options.seeds.special && crop.seeds.special < minSeedCost)
			minSeedCost = crop.seeds.special;
    if (minSeedCost == Infinity)
        minSeedCost = 0;
			
	// console.log("Crop: " + crop.name + ", minSeedCost: " + minSeedCost);
	return minSeedCost;
}

/*
 * Calculates the number of crops planted.
 * @param crop The crop object, containing all the crop data.
 * @return The number of crops planted, taking the desired number planted and the max seed money into account.
 */
function planted(crop) {
	var numPlanted = options.planted;
	if (options.buySeed && options.maxSeedMoney !== 0) {
		numPlanted = Math.min(options.planted, Math.floor(options.maxSeedMoney / minSeedCost(crop)));
	}
	// console.log("Crop: " + crop.name + ", numPlanted: " + numPlanted);
	return numPlanted;
}

/*
 * Calculates the profit for a specified crop.
 * @param crop The crop object, containing all the crop data.
 * @return The total profit.
 */
function profit(crop) {
    profitData = {}
	var num_planted = planted(crop);
	//var total_harvests = crop.harvests * num_planted;
	
	var netIncome = 0;
	var netExpenses = 0;
	var totalProfit = 0;
	var totalReturnOnInvestment = 0;
	var averageReturnOnInvestment = 0;
	
	//Skip keg/jar calculations for ineligible crops (where corp.produce.jar or crop.produce.keg = 0)
	
  var total_harvest = num_planted * 1.0 + num_planted * crop.produce.extraPerc * crop.produce.extra;
	var forSeeds = 0;
	
	var total_crops = total_harvest * crop.harvests;
	
	// console.log("Calculating raw produce value for: " + crop.name);
	// Determine income
	var tempSeeds = forSeeds;
	
	netIncome += crop.produce.price * total_crops;
	
	profitData.quantitySold  = Math.floor(total_crops - forSeeds);

	// Determine expenses
	if (options.buySeed) {
		netExpenses += crop.seedLoss;
		// console.log("Profit (After seeds): " + profit);
	}

	// Determine total profit
	totalProfit = netIncome + netExpenses;
	if (netExpenses != 0) {
		totalReturnOnInvestment = 100 * ((totalProfit) / -netExpenses); // Calculate the return on investment and scale it to a % increase
		if (crop.growth.regrow == 0) {
			averageReturnOnInvestment = (totalReturnOnInvestment / crop.growth.initial);
		}
		else {
			averageReturnOnInvestment = (totalReturnOnInvestment / options.days);
		}
	}
	else {
		totalReturnOnInvestment = 0;
		averageReturnOnInvestment = 0;
	}

	profitData.totalReturnOnInvestment = totalReturnOnInvestment;
	profitData.averageReturnOnInvestment = averageReturnOnInvestment;
	profitData.netExpenses = netExpenses;
  profitData.profit = totalProfit;

	// console.log("Profit: " + profit);
	//console.log(profitData);
	return profitData;
}

/*
 * Calculates the loss to profit when seeds are bought.
 * @param crop The crop object, containing all the crop data.
 * @return The total loss.
 */
function seedLoss(crop) {
	var harvests = crop.harvests;

    var loss = -minSeedCost(crop);

	if (crop.growth.regrow == 0 && harvests > 0 && !options.replant)
		loss = loss * harvests;

	return loss * planted(crop);
}

/*
 * Converts any value to the average per day value.
 * @param value The value to convert.
 * @return Value per day.
 */
function perDay(value) {
	return value / options.days;
}

/*
 * Performs filtering on a season's crop list, saving the new list to the cropList array.
 */
function fetchCrops() {
	cropList = [];

	var season = seasons[options.season];

	for (var i = 0; i < season.crops.length; i++) {
			// if seed source exists (and store sources have a listed buy price - excludes special loc)
	    if (options.seeds.generalStore && (season.crops[i].seeds.generalStore != 0) || (options.seeds.special && season.crops[i].seeds.specialLoc != "")) {
	    	cropList.push(JSON.parse(JSON.stringify(season.crops[i])));
	    	cropList[cropList.length - 1].id = i;
		}
	}
}

/*
 * Calculates all profits and losses for all crops in the cropList array.
 */
function valueCrops() {
	for (var i = 0; i < cropList.length; i++) {
		
		cropList[i].planted = planted(cropList[i]);
		cropList[i].harvests = harvests(cropList[i].id);
		cropList[i].seedLoss = seedLoss(cropList[i]);
		cropList[i].profitData = profit(cropList[i]);
    cropList[i].profit = cropList[i].profitData.profit;
		cropList[i].totalReturnOnInvestment = cropList[i].profitData.totalReturnOnInvestment;
		cropList[i].averageReturnOnInvestment = cropList[i].profitData.averageReturnOnInvestment;
		cropList[i].netExpenses = cropList[i].profitData.netExpenses;
		cropList[i].averageProfit = perDay(cropList[i].profit);
		cropList[i].averageSeedLoss = perDay(cropList[i].seedLoss);

		if (options.average == 1) {
			cropList[i].drawProfit = cropList[i].averageProfit;
			cropList[i].drawSeedLoss = cropList[i].averageSeedLoss;
			graphDescription = "Daily Profit"
		}
		else if ((options.average == 2) ){
			if (options.buySeed) {
				cropList[i].drawProfit = cropList[i].totalReturnOnInvestment;
				graphDescription = "Total Return On Investment";
			}
			else {
				cropList[i].drawProfit = 0;
				graphDescription = "Total Profit (Choose an expense for ROI)";
			}
			cropList[i].drawSeedLoss = cropList[i].seedLoss;
		}
		else if (options.average == 3) {
			cropList[i].drawSeedLoss = cropList[i].averageSeedLoss;
			if (options.buySeed) {
				cropList[i].drawProfit = cropList[i].averageReturnOnInvestment;
				graphDescription = "Daily Return On Investment";
			}
			else {
				cropList[i].drawProfit = 0;
				graphDescription = "Daily Profit (Choose an expense for ROI)";
			}
		}
		else {
			cropList[i].drawProfit = cropList[i].profit;
			cropList[i].drawSeedLoss = cropList[i].seedLoss;
			graphDescription = "Total Profit";
		}
	}
}

/*
 * Sorts the cropList array, so that the most profitable crop is the first one.
 */
function sortCrops() {
	var swapped;
    do {
        swapped = false;
        for (var i = 0; i < cropList.length - 1; i++) {
            if (cropList[i].drawProfit < cropList[i + 1].drawProfit) {
                var temp = cropList[i];
                cropList[i] = cropList[i + 1];
                cropList[i + 1] = temp;
                swapped = true;
            }
        }
    } while (swapped);


	// console.log("==== SORTED ====");
	for (var i = 0; i < cropList.length; i++) {
		// console.log(cropList[i].drawProfit.toFixed(2) + "  " + cropList[i].name);
	}
}

/*
 * Get the largest number of crops in any season
 * @return The crop count.
 */
function getMaxCropCount() {
	var maxCropCount = 0;
	var seasonWithMostCrops = null;
	seasons.forEach(function(season) {
			if (season.crops.length > maxCropCount) {
					maxCropCount = season.crops.length;
					seasonWithMostCrops = season.name;
			}
	});
	return maxCropCount;
}

/*
 * Updates the X D3 scale.
 * @return The new scale.
 */
function updateScaleX() {
	return d3.scale.ordinal()
		.domain(d3.range(getMaxCropCount()))
		.rangeRoundBands([0, width]);
}

/*
 * Updates the Y D3 scale.
 * @return The new scale.
 */
function updateScaleY() {
	return d3.scale.linear()
		.domain([0, d3.max(cropList, function(d) {
			//console.log(d.drawProfit);
			//console.log((~~((d.drawProfit + 99) / 100) * 100));
			if (d.drawProfit >= 0) {
				return (~~((d.drawProfit + 99) / 100) * 100);
			}
			else {
				var profit = d.drawProfit;
				if (options.buySeed) {
					if (d.seedLoss < profit)
						profit = d.drawSeedLoss;
				}
				return (~~((-profit + 99) / 100) * 100);
			}
		})])
		.range([height, 0]);
}

/*
 * Updates the axis D3 scale.
 * @return The new scale.
 */
function updateScaleAxis() {
	return d3.scale.linear()
		.domain([
			-d3.max(cropList, function(d) {
				if (d.drawProfit >= 0) {
					return (~~((d.drawProfit + 99) / 100) * 100);
				}
				else {
					var profit = d.drawProfit;
					if (options.buySeed) {
						if (d.seedLoss < profit)
							profit = d.drawSeedLoss;
					}
					return (~~((-profit + 99) / 100) * 100);
				}
			}),
			d3.max(cropList, function(d) {
				if (d.drawProfit >= 0) {
					return (~~((d.drawProfit + 99) / 100) * 100);
				}
				else {
					var profit = d.drawProfit;
					if (options.buySeed) {
						if (d.seedLoss < profit)
							profit = d.drawSeedLoss;
					}
					return (~~((-profit + 99) / 100) * 100);
				}
			})])
		.range([height*2, 0]);
}

/*
 * Renders the graph.
 * This is called only when opening for the first time or when changing seasons/seeds.
 */
function renderGraph() {

	var x = updateScaleX();
	var y = updateScaleY();
	var ax = updateScaleAxis();

    var width = barOffsetX + barPadding * 2 + (barWidth + barPadding) * cropList.length + paddingLeft;
    if (width < svgMinWidth)
        width = svgMinWidth;
	svg.attr("width", width).style("padding-top", "12px");
	d3.select(".graph").attr("width", width);

	var yAxis = d3.svg.axis()
		.scale(ax)
		.orient("left")
		.tickFormat(d3.format(",s"))
		.ticks(16);

	axisY = gAxis.attr("class", "axis")
		.call(yAxis)
		.attr("transform", "translate(48, " + barOffsetY + ")");

	title = gTitle.attr("class", "Title")
		.append("text")
		.attr("class", "axis")
		.attr("x", 24)
		.attr("y", 12)
	 	.style("text-anchor", "start")
		.text(graphDescription);

	barsProfit = gProfit.selectAll("rect")
		.data(cropList)
		.enter()
		.append("rect")
			.attr("x", function(d, i) {
				if (d.drawProfit < 0 && options.buySeed)
					return x(i) + barOffsetX + (barWidth / miniBar);
				else
					return x(i) + barOffsetX;
			})
			.attr("y", function(d) {
				if (d.drawProfit >= 0)
					return y(d.drawProfit) + barOffsetY;
				else
					return height + barOffsetY;
			})
			.attr("height", function(d) {
				if (d.drawProfit >= 0)
					return height - y(d.drawProfit);
				else
					return height - y(-d.drawProfit);
			})
			.attr("width", function(d) {
				if (d.drawProfit < 0 && options.buySeed)
					return barWidth - (barWidth / miniBar);
				else
					return barWidth;
			})
 			.attr("fill", function (d) {
 				if (d.drawProfit >= 0)
 					return "lime";
 				else
 					return "red";
 			});

	barsSeed = gSeedLoss.selectAll("rect")
		.data(cropList)
		.enter()
		.append("rect")
			.attr("x", function(d, i) { return x(i) + barOffsetX; })
			.attr("y", height + barOffsetY)
			.attr("height", function(d) {
				if (options.buySeed)
					return height - y(-d.drawSeedLoss);
				else
					return 0;
			})
			.attr("width", barWidth / miniBar)
 			.attr("fill", "orange");

 	imgIcons = gIcons.selectAll("image")
		.data(cropList)
		.enter()
		.append("svg:image")
			.attr("x", function(d, i) { return x(i) + barOffsetX; })
			.attr("y", function(d) {
				if (d.drawProfit >= 0)
					return y(d.drawProfit) + barOffsetY - barWidth - barPadding;
				else
					return height + barOffsetY - barWidth - barPadding;
			})
		    .attr('width', barWidth)
		    .attr('height', barWidth)
		    .attr("xlink:href", function(d) { return "img/" + d.img; });

	barsTooltips = gTooltips.selectAll("rect")
		.data(cropList)
		.enter()
		.append("rect")
			.attr("x", function(d, i) { return x(i) + barOffsetX - barPadding/2; })
			.attr("y", function(d) {
				if (d.drawProfit >= 0)
					return y(d.drawProfit) + barOffsetY - barWidth - barPadding;
				else
					return height + barOffsetY - barWidth - barPadding;
			})
			.attr("height", function(d) {
				var topHeight = 0;

				if (d.drawProfit >= 0)
					topHeight = height + barWidth + barPadding - y(d.drawProfit);
				else
					topHeight = barWidth + barPadding;

				var lossArray = [0];

				if (options.buySeed)
					lossArray.push(d.drawSeedLoss);
				if (d.drawProfit < 0)
					lossArray.push(d.drawProfit);

				var swapped;
			    do {
			        swapped = false;
			        for (var i = 0; i < lossArray.length - 1; i++) {
			            if (lossArray[i] > lossArray[i + 1]) {
			                var temp = lossArray[i];
			                lossArray[i] = lossArray[i + 1];
			                lossArray[i + 1] = temp;
			                swapped = true;
			            }
			        }
			    } while (swapped);

			    return topHeight + (height - y(-lossArray[0]));
			})
			.attr("width", barWidth + barPadding)
 			.attr("opacity", "0")
 			.attr("cursor", "pointer")
			.on("mouseover", function(d) {
				tooltip.selectAll("*").remove();
				tooltip.style("visibility", "visible");

				tooltip.append("h3").attr("class", "tooltipTitle").text(d.name);

				var tooltipTable = tooltip.append("table")
					.attr("class", "tooltipTable")
					.attr("cellspacing", 0);
				var tooltipTr;


				tooltipTr = tooltipTable.append("tr");
				tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Total profit:");
				if (d.profit > 0)
					tooltipTr.append("td").attr("class", "tooltipTdRightPos").text("+" + formatNumber(d.profit))
						.append("div").attr("class", "tesserae");
				else
					tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text(formatNumber(d.profit))
						.append("div").attr("class", "tesserae");

				tooltipTr = tooltipTable.append("tr");
				tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Profit per day:");
				if (d.averageProfit > 0)
					tooltipTr.append("td").attr("class", "tooltipTdRightPos").text("+" + formatNumber(d.averageProfit))
						.append("div").attr("class", "tesserae");
				else
					tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text(formatNumber(d.averageProfit))
						.append("div").attr("class", "tesserae");

				if (options.buySeed || options.buyFert) {
				tooltipTr = tooltipTable.append("tr");
				tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Return on investment:");
				if (d.totalReturnOnInvestment > 0)
					tooltipTr.append("td").attr("class", "tooltipTdRightPos").text("+" + formatNumber(d.totalReturnOnInvestment) + "%");
				else
					tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text(formatNumber(d.totalReturnOnInvestment) + "%");

				tooltipTr = tooltipTable.append("tr");
				tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Return on investment per day:");
				if (d.averageReturnOnInvestment > 0)
					tooltipTr.append("td").attr("class", "tooltipTdRightPos").text("+" + formatNumber(d.averageReturnOnInvestment) + "%");
				else
					tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text(formatNumber(d.averageReturnOnInvestment) + "%");
				}

				if (options.buySeed) {
					tooltipTr = tooltipTable.append("tr");
					tooltipTr.append("td").attr("class", "tooltipTdLeftSpace").text("Total seed loss:");
					tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text(formatNumber(d.seedLoss))
						.append("div").attr("class", "tesserae");

					tooltipTr = tooltipTable.append("tr");
					tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Seed loss per day:");
					tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text(formatNumber(d.averageSeedLoss))
						.append("div").attr("class", "tesserae");
				}
				
				tooltipTr = tooltipTable.append("tr");
				tooltipTr.append("td").attr("class", "tooltipTdLeftSpace").text("Quantity sold:");
				if(d.profitData.quantitySold > 0 ){
					tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.profitData.quantitySold);
				}
				else
					tooltipTr.append("td").attr("class", "tooltipTdRightNeg").text(d.profitData.quantitySold);
				
				tooltipTr = tooltipTable.append("tr");
				tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Duration:");
				tooltipTr.append("td").attr("class", "tooltipTdRight").text(options.days + " days");
				tooltipTr = tooltipTable.append("tr");
				tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Planted:");
				tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.planted);
				tooltipTr = tooltipTable.append("tr");
				tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Harvests:");
				tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.harvests);

				if (options.extra) {

					var seedPrice = d.seeds.sell;
					var initialGrow = 0;
					initialGrow += d.growth.initial;

					tooltip.append("h3").attr("class", "tooltipTitleExtra").text("Crop info");
					tooltipTable = tooltip.append("table")
						.attr("class", "tooltipTable")
						.attr("cellspacing", 0);

					tooltipTr = tooltipTable.append("tr");
					tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Sell (Crop):");
					tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.produce.price)
						.append("div").attr("class", "tesserae");

					tooltipTr = tooltipTable.append("tr");
					tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Sell (Seeds):");
					tooltipTr.append("td").attr("class", "tooltipTdRight").text(seedPrice)
					.append("div").attr("class", "tesserae");


					var first = true;
					if (d.seeds.generalStore > 0) {
						tooltipTr = tooltipTable.append("tr");
						tooltipTr.append("td").attr("class", "tooltipTdLeftSpace").text("Seed cost (General Store):");
						first = false;
						tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.seeds.generalStore)
						.append("div").attr("class", "tesserae");
					}
					
					if (d.seeds.special > 0) {
						tooltipTr = tooltipTable.append("tr");
						if (first) {
							tooltipTr.append("td").attr("class", "tooltipTdLeftSpace").text("Seeds (Special):");
							first = false;
						}
						else
							tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Seeds (Special):");
						tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.seeds.special)
						.append("div").attr("class", "tesserae");
						tooltipTr = tooltipTable.append("tr");
						tooltipTr.append("td").attr("class", "tooltipTdLeft").text("");
						tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.seeds.specialLoc);
					}

					tooltipTr = tooltipTable.append("tr");
					tooltipTr.append("td").attr("class", "tooltipTdLeftSpace").text("Time to grow:");
					tooltipTr.append("td").attr("class", "tooltipTdRight").text(initialGrow + " days");
					tooltipTr = tooltipTable.append("tr");
					tooltipTr.append("td").attr("class", "tooltipTdLeft").text("Time to regrow:");
					if (d.growth.regrow > 0)
						tooltipTr.append("td").attr("class", "tooltipTdRight").text(d.growth.regrow + " days");
					else
						tooltipTr.append("td").attr("class", "tooltipTdRight").text("N/A");

				}
			})
			.on("mousemove", function() {
				tooltip.style("top", (d3.event.pageY - 16) + "px").style("left",(d3.event.pageX + 20) + "px");
			})
			.on("mouseout", function() { tooltip.style("visibility", "hidden"); })
			.on("click", function(d) { 
				if(!options.disableLinks)
					window.open(d.url, "_blank"); 
			});

}

/*
 * Updates the already rendered graph, showing animations.
 */
function updateGraph() {
	var x = updateScaleX();
	var y = updateScaleY();
	var ax = updateScaleAxis();

	var yAxis = d3.svg.axis()
		.scale(ax)
		.orient("left")
		.tickFormat(d3.format(",s"))
		.ticks(16);

	axisY.transition()
		.call(yAxis);

	title = gTitle.attr("class", "Title")
	.append("text")
	.attr("class", "axis")
	.attr("x", 24)
    .attr("y", 12)
	.style("text-anchor", "start")
	.text(graphDescription);

	barsProfit.data(cropList)
		.transition()
			.attr("x", function(d, i) {
				if (d.drawProfit < 0 && options.buySeed)
					return x(i) + barOffsetX + (barWidth / miniBar);
				else
					return x(i) + barOffsetX;
			})
			.attr("y", function(d) {
				if (d.drawProfit >= 0)
					return y(d.drawProfit) + barOffsetY;
				else
					return height + barOffsetY;
			})
			.attr("height", function(d) {
				if (d.drawProfit >= 0)
					return height - y(d.drawProfit);
				else
					return height - y(-d.drawProfit);
			})
			.attr("width", function(d) {
				if (d.drawProfit < 0 && options.buySeed)
					return barWidth - (barWidth / miniBar);
				else
					return barWidth;
			})
 			.attr("fill", function (d) {
 				if (d.drawProfit >= 0)
 					return "lime";
 				else
 					return "red";
 			});

	barsSeed.data(cropList)
		.transition()
			.attr("x", function(d, i) { return x(i) + barOffsetX; })
			.attr("y", height + barOffsetY)
			.attr("height", function(d) {
				if (options.buySeed)
					return height - y(-d.drawSeedLoss);
				else
					return 0;
			})
			.attr("width", barWidth / miniBar)
 			.attr("fill", "orange");

 	imgIcons.data(cropList)
		.transition()
			.attr("x", function(d, i) { return x(i) + barOffsetX; })
			.attr("y", function(d) {
				if (d.drawProfit >= 0)
					return y(d.drawProfit) + barOffsetY - barWidth - barPadding;
				else
					return height + barOffsetY - barWidth - barPadding;
			})
		    .attr('width', barWidth)
		    .attr('height', barWidth)
		    .attr("xlink:href", function(d) { return "img/" + d.img; });

	barsTooltips.data(cropList)
		.transition()
			.attr("x", function(d, i) { return x(i) + barOffsetX - barPadding/2; })
			.attr("y", function(d) {
				if (d.drawProfit >= 0)
					return y(d.drawProfit) + barOffsetY - barWidth - barPadding;
				else
					return height + barOffsetY - barWidth - barPadding;
			})
			.attr("height", function(d) {
				var topHeight = 0;

				if (d.drawProfit >= 0)
					topHeight = height + barWidth + barPadding - y(d.drawProfit);
				else
					topHeight = barWidth + barPadding;

				var lossArray = [0];

				if (options.buySeed)
					lossArray.push(d.drawSeedLoss);
				if (d.drawProfit < 0)
					lossArray.push(d.drawProfit);

				var swapped;
			    do {
			        swapped = false;
			        for (var i = 0; i < lossArray.length - 1; i++) {
			            if (lossArray[i] > lossArray[i + 1]) {
			                var temp = lossArray[i];
			                lossArray[i] = lossArray[i + 1];
			                lossArray[i + 1] = temp;
			                swapped = true;
			            }
			        }
			    } while (swapped);

			    return topHeight + (height - y(-lossArray[0]));
			})
			.attr("width", barWidth + barPadding);
}

/*
 * Updates all options and data, based on the options set in the HTML.
 * After that, filters, values and sorts all the crops again.
 */
function updateData() {

  options.season = parseInt(document.getElementById('select_season').value);

	if (document.getElementById('max_seed_money').value < 0)
		document.getElementById('max_seed_money').value = '0';
	options.maxSeedMoney = parseInt(document.getElementById('max_seed_money').value);
	if (isNaN(options.maxSeedMoney)) {
		options.maxSeedMoney = 0;
	}

	options.average = parseInt(document.getElementById('select_profit_display').value);

	document.getElementById('number_days').disabled = true;
	document.getElementById('current_day').disabled = false;
	document.getElementById('current_day').style.cursor = "text";

	if (document.getElementById('current_day').value <= 0)
			document.getElementById('current_day').value = 1;
	if (options.crossSeason) {
			document.getElementById('number_days').value = 56;
			if (document.getElementById('current_day').value > 56)
					document.getElementById('current_day').value = 56;
			options.days = 57 - document.getElementById('current_day').value;
	}
	else {
			document.getElementById('number_days').value = 28;
			if (document.getElementById('current_day').value > 28)
						document.getElementById('current_day').value = 28;
			options.days = 29 - document.getElementById('current_day').value;
	}

	//options.seeds.generalStore = document.getElementById('check_seedsGeneralStore').checked;
	//options.seeds.special = document.getElementById('check_seedsSpecial').checked;

	options.buySeed = document.getElementById('check_buySeed').checked;

	if (document.getElementById('number_planted').value <= 0)
			document.getElementById('number_planted').value = 1;
	if (options.replant && parseInt(document.getElementById('number_planted').value) % 2 == 1)
			document.getElementById('number_planted').value = parseInt(document.getElementById('number_planted').value) + 1;

	options.planted = document.getElementById('number_planted').value;

	options.extra = document.getElementById('check_extra').checked;
	options.disableLinks = document.getElementById('disable_links').checked;

	// Persist the options object into the URL hash.
	window.location.hash = encodeURIComponent(serialize(options));

	fetchCrops();
	valueCrops();
	sortCrops();
}

/*
 * Called once on startup to draw the UI.
 */
function initial() {
	optionsLoad();
	updateData();
	renderGraph();
}

/*
 * Called on every option change to animate the graph.
 */
function refresh() {
	updateData();
	gTitle.selectAll("*").remove();
	updateGraph();
}

/*
 * Parse out and validate the options from the URL hash.
 */
function optionsLoad() {
	if (!window.location.hash) return;

	options = deserialize(window.location.hash.slice(1));

	function validBoolean(q) {
		return q == 1;
	}

	function validIntRange(min, max, num) {
		return num < min ? min : num > max ? max : parseInt(num, 10);
	}

	options.season = validIntRange(0, 3, options.season);
	document.getElementById('select_season').value = options.season;

	options.planted = validIntRange(1, MAX_INT, options.planted);
	document.getElementById('number_planted').value = options.planted;

	options.maxSeedMoney = validIntRange(0, MAX_INT, options.maxSeedMoney);
	document.getElementById('max_seed_money').value = options.maxSeedMoney;

	options.average = validIntRange(0,3,options.average);
	document.getElementById('select_profit_display').checked = options.average;

	//options.seeds.generalStore = validBoolean(options.seeds.generalStore);
	//document.getElementById('check_seedsGeneralStore').checked = options.seeds.generalStore;
	
	//options.seeds.special = validBoolean(options.seeds.special);
	//document.getElementById('check_seedsSpecial').checked = options.seeds.special;

	options.buySeed = validBoolean(options.buySeed);
	document.getElementById('check_buySeed').checked = options.buySeed;

	options.extra = validBoolean(options.extra);
	document.getElementById('check_extra').checked = options.extra;

	options.disableLinks = validBoolean(options.disableLinks);
	document.getElementById('disable_links').checked = options.disableLinks;

}

function deserialize(str) {
    var json = `(${str})`
        .replace(/_/g, ' ')
        .replace(/-/g, ',')
        .replace(/\(/g, '{')
        .replace(/\)/g, '}')
        .replace(/([a-z]+)/gi, '"$1":')
        .replace(/"(true|false)":/gi, '$1');

    //console.log(json);

	return JSON.parse(json);
}

function serialize(obj) {

	return Object.keys(obj)
		.reduce((acc, key) => {
			return /^(?:true|false|\d+)$/i.test('' + obj[key])
				? `${acc}-${key}_${obj[key]}`
				: `${acc}-${key}_(${serialize(obj[key])})`;
		}, '')
		.slice(1);
}

/*
 * Called when changing season/seeds, to redraw the graph.
 */
function rebuild() {
	gAxis.selectAll("*").remove();
	gProfit.selectAll("*").remove();
	gSeedLoss.selectAll("*").remove();
	gIcons.selectAll("*").remove();
	gTooltips.selectAll("*").remove();
	gTitle.selectAll("*").remove();

	updateData();
	renderGraph();
}

document.addEventListener('DOMContentLoaded', initial);
document.addEventListener('click', function (event) {
	if (event.target.id === 'reset') window.location = 'index.html';
});