var express = require('express');
var router = express.Router();
var request = require('request');

const Recipe = require(__dirname + `/../models/recipe.model`);
const config = require(__dirname + '/../config.js');

const food = {
  api_key: 'a23d6f58e8bf92249bac4c743b26364f',
  nojsoncallback: 1
}

function cleanString(str, dirtyChar, cleanChar) {
  result = str.replace(dirtyChar, cleanChar);
  return result;
}

function searchForRecipe(food, query, callback) {
  let foodRawURL = `https://www.food2fork.com/api/search?key=${food.api_key}` +
  `&q=${query}`;
  foodRawURL = cleanString(foodRawURL, /&#8217;/g, '');
  let foodURL = encodeURI(foodRawURL);
  let rsp;
  let recipes = [];
  try {
    console.log('food START');
    request(foodURL, function(error, response, body) {
      console.log('error:', error); //Print error if error
      console.log('statusCode:', response && response.statusCode); //Print response status incase it doesnt work
      rsp = JSON.parse(body);
      for (var i = 0; i < 3; i++) {
        let dirtyTitle = rsp.recipes[i].title;
        dirtyTitle = decodeURI(dirtyTitle);
        cleanTitle = cleanString(dirtyTitle, /’/g, '');
        cleanTitle = cleanString(dirtyTitle, /&#8217;/g, '');
        let recipe = {
          title: cleanTitle,
          yield: '',
          recipeImg: rsp.recipes[i].image_url,
          ingredients: '',
          energy: '',
          fat: '',
          carbs: '',
          protein: '',
          source_URL: rsp.recipes[i].source_url,
        }
        recipes[i] = recipe;
      }
      callback(recipes);
    });
  } catch (err) {
    console.log("error: ", err);

  }
}

const edamam = {
  app_key: '94271fc667d95d0240640d96d0527c5c',
  app_id: 'b3684a31'
}

function getRecipe(edamam, recipes, callback) {
  let recipes2= [];
  let tmpIngre = [];
  for (var i = 0; i < recipes.length; i++) {
    console.log("recipes "+[i]+" title", recipes[i].title);
    recipes2[i] = recipes[i].title;
  }
  let j = 0
  for (title of recipes2) {
    recipes2 = recipes;
    var edamRawURL = `https://api.edamam.com/search?q=${recipes2[j]}&app_id=b3684a31&app_key=94271fc667d95d0240640d96d0527c5c`
    edamRawURL = cleanString(edamRawURL, /’/g, '');
    var edamURL = encodeURI(edamRawURL);
    let rsp;
    try {
      request(edamURL, function (error, response, body) {
        console.log('getRecipe start');
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        rsp = JSON.parse(body);
        recipes2[j].title = recipes[j].title;
        recipes2[j].recipeImg = recipes[j].recipeImg;
        recipes2[j].source_URL = recipes[j].source_URL;
        recipes2[j].ingredients = rsp.hits[j].recipe.ingredientLines;
        recipes2[j].yield = rsp.hits[j].recipe.yield;
        recipes2[j].energy = rsp.hits[j].recipe.totalDaily.ENERC_KCAL.quantity/recipes[j].yield;
        recipes2[j].fat = rsp.hits[j].recipe.totalDaily.FAT.quantity/recipes[j].yield;
        recipes2[j].carbs = rsp.hits[j].recipe.totalDaily.CHOCDF.quantity/recipes[j].yield;
        recipes2[j].protein = rsp.hits[j].recipe.totalDaily.PROCNT.quantity/recipes[j].yield;
        j++;
        console.log('RSP end');
      });
    } catch (e) {
      console.log('error in edamam:', err);
    } finally {
      callback(recipes2);
    }
    console.log("getRecipe has ended");
  }
}
/*} catch (err) {
  console.log('error in edamam:', err);
}*/



/* GET home page. */
router.get('/', function(req, res, next) {
  var called = false;
  let cardInfo = [];
  if(!req.query.Search) {
    res.render('index', {title: 'Welcome to Mindful Meals'});
  } else if (req.query.Search) {
    query = JSON.stringify(req.query.Search);
    searchForRecipe(food, query, function(recipes){
      if (recipes) {
        getRecipe(edamam, recipes, function(recipes2) {
          console.log('its fucking working!!!!')
          if (recipes2) {
            console.log('render starting');
            res.render('index',{title: "You've searched for " + query, recipes2: recipes})
          }
      });
      } else {
        console.log("failure to get foodtitle");
      }
    });
//    console.log(content);
//console.log(cardInfo);
    //res.render('index',{ title: "You've searched for: " + query, CardTitle: recipes, });
  }
});

module.exports = router;
