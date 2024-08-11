// Options used to draw the graph.
var options = {
	"season": 3,
	"days": 28,
	"planted": 1,
	"average": false,
  "maxSeedMoney": 0,
	"seeds": {
		"generalStore": true,
		"special": true
	},
	"buySeed": true,
	"extra": true,
	"disableLinks": false
};

// Different seasons with predefined crops.
var seasons = [
	{
		"name": "Spring",
		"duration": 28,
		"crops": [
			crops.turnip,
			crops.potato,
			crops.cabbage,
			crops.strawberry,
			crops.carrot,
			crops.peas,
			crops.daffodil,
			crops.tulip
		]
	},
	{
		"name": "Summer",
		"duration": 28,
		"crops": [
			crops.cucumber,
			crops.chili_pepper,
			crops.watermelon,
			crops.tomato,
			crops.corn,
			crops.sugar_cane,
			crops.tea,
			crops.daisy,
			crops.catmint,
			crops.cosmos
		]
	},
	{
		"name": "Fall",
		"duration": 28,
		"crops": [
			crops.sweet_potato,
			crops.broccoli,
			crops.cranberry,
			crops.pumpkin,
			crops.wheat,
			crops.rice_stalk,
			crops.onion,
			crops.celosia,
			crops.chrysanthemum
		]
	},
	{
		"name": "Winter",
		"duration": 28,
		"crops": [
			crops.beet,
			crops.cauliflower,
			crops.snow_peas,
			crops.daikon_radish,
			crops.frost_lily,
			crops.poinsettia
		]
	},
	{
		"name": "Greenhouse",
		"duration": 112,
		"crops": [
			crops.pineapple,
			crops.coffeebean,
			crops.strawberry,
			crops.rhubarb,
			crops.potato,
			crops.cauliflower,
			crops.greenbean,
			crops.kale,
			crops.unmilledrice,
			crops.garlic,
			crops.parsnip,
			crops.bluejazz,
			crops.tulip,
			crops.blueberry,
			crops.starfruit,
			crops.redcabbage,
			crops.hops,
			crops.melon,
			crops.hotpepper,
			crops.tomato,
			crops.radish,
			crops.summerspangle,
			crops.poppy,
			crops.wheat,
			crops.corn,
			crops.sweetgemberry,
			crops.cranberries,
			crops.pumpkin,
			crops.grape,
			crops.tealeaves,
			crops.artichoke,
			crops.beet,
			crops.eggplant,
			crops.amaranth,
			crops.yam,
			crops.fairyrose,
			crops.bokchoy,
			crops.sunflower,
			crops.ancientfruit,
			crops.cactusfruit,
			crops.taroroot,
			crops.carrot,
			crops.summersquash,
			crops.broccoli,
			crops.powdermelon
		]
	}
];
