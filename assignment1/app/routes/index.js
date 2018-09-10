var express = require('express');
var router = express.Router();
var request = require('request');

const Recipe = require(__dirname + `/../models/recipe.model`);
const config = require(__dirname + '/../config.js');

const food = {
  api_key: 'b7313c432692515177bb2ad599cf3d9d',
  nojsoncallback: 1
}

function cleanString(str, dirtyChar, cleanChar) {
  result = str.replace(dirtyChar, cleanChar);
  return result;
}



function searchForRecipe(food, query) {
  let recipes = [];
  let foodRawURL = `https://www.food2fork.com/api/search?key=${food.api_key}` +
  `&q=${query}`;
  foodRawURL = cleanString(foodRawURL, /&#8217;/g, '');
  let foodURL = encodeURI(foodRawURL);
  return new Promise(resolve => {
    let rsp;
    console.log('food START');
    request(foodURL, function(error, response, body) {
      if (error) {
        console.log("error : ", error);
        return error;
      }
      console.log('statusCode:', response && response.statusCode); //Print response status incase it doesnt work
      rsp = JSON.parse(body);
      for (var i = 0; i < 3; i++) {
        let dirtyTitle = rsp.recipes[i].title;
        dirtyTitle = decodeURI(dirtyTitle);
        let cleanTitle = cleanString(dirtyTitle, /’/g, '');
        cleanTitle = cleanString(dirtyTitle, /&#8217;/g, '');
        let recipe = {
          title: cleanTitle
        }
        recipes[i] = recipe;
      }

      resolve(recipes);
      console.log("About to return: ",recipes);
    });
  });
}

const edamam = {
  app_key: '94271fc667d95d0240640d96d0527c5c',
  app_id: 'b3684a31'
}

async function getRecipe(edamam, recipes) {
  var newRecipes = [];
  console.log("The lenght of the recipes: " + recipes.length);
  return new Promise(resolve => {
    for (var j = 0; j < recipes.length; j++) {
      var edamRawURL = `https://api.edamam.com/search?q=${recipes[j].title}&app_id=b3684a31&app_key=94271fc667d95d0240640d96d0527c5c`
      edamRawURL = cleanString(edamRawURL, /’/g, '');
      var edamURL = encodeURI(edamRawURL);
      let rsp;
      let title = recipes[j].title;
      request(edamURL, function (error, response, body) {
        console.log('getRecipe start');
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        rsp = JSON.parse(body);
        try {
          let recipe = {
            title: title,
            recipeImg: rsp.hits[j].recipe.image,
            source_URL : rsp.hits[j].recipe.url,
            ingredients : rsp.hits[j].recipe.ingredients,
            yield : rsp.hits[j].recipe.yield,
            energy : rsp.hits[j].recipe.totalDaily.ENERC_KCAL.quantity/rsp.hits[j].recipe.yield,
            fat : rsp.hits[j].recipe.totalDaily.FAT.quantity/rsp.hits[j].recipe.yield,
            carbs : rsp.hits[j].recipe.totalDaily.CHOCDF.quantity/rsp.hits[j].recipe.yield,
            protein : rsp.hits[j].recipe.totalDaily.PROCNT.quantity/rsp.hits[j].recipe.yield,
          }
          newRecipes[j] = recipe
          console.log("try",recipe);

        } catch (e) {
          console.log("catch failed in getRecipe \n error:" ,e);
        }
      });
    }
    resolve(newRecipes);
  });
}

async function doitAll(food, query, edamam) {
  let first = await searchForRecipe(food, query);//.then(recipes => {
  let second = await getRecipe(edamam, first);

  return second;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Welcome to Mindful Meals'});
});

router.post('/', async function(req, res, next) {
  let query = req.body.Search;
  const second = await doitAll(food, query, edamam);
    res.render('index', {title: "You've searched for: " + query, recipes: second});
  });
//});


module.exports = router;
