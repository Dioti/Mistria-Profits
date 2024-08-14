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
      crops.strawberry,
      crops.peas,
      crops.carrot,
      crops.turnip,
      crops.chickpea,
      crops.lilac,
      crops.snowdrop_anemone,
      crops.potato,
      crops.daffodil,
      crops.tulip,
      crops.cabbage
    ]
  },
  {
    "name": "Summer",
    "duration": 28,
    "crops": [
      crops.sunflower,
      crops.iris,
      crops.cosmos,
      crops.oregano,
      crops.tea,
      crops.basil,
      crops.dill,
      crops.thyme,
      crops.catmint,
      crops.daisy,
      crops.cucumber,
      crops.marigold,
      crops.watermelon,
      crops.sage,
      crops.corn,
      crops.night_queen,
      crops.sugar_cane,
      crops.chili_pepper,
      crops.tomato
    ]
  },
  {
    "name": "Fall",
    "duration": 28,
    "crops": [
      crops.pumpkin,
      crops.chrysanthemum,
      crops.heather,
      crops.moon_fruit,
      crops.garlic,
      crops.viola,
      crops.cranberry,
      crops.rosemary,
      crops.wheat,
      crops.onion,
      crops.rice_stalk,
      crops.celosia,
      crops.sweet_potato,
      crops.broccoli
    ]
  },
  {
    "name": "Winter",
    "duration": 28,
    "crops": [
      crops.cauliflower,
      crops.poinsettia,
      crops.snow_peas,
      crops.snapdragon,
      crops.jasmine,
      crops.burdock_root,
      crops.beet,
      crops.daikon_radish,
      crops.frost_lily
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