var express = require('express');
var router = express.Router();
var request = require('request-promise');

const Recipe = require(__dirname + `/../models/recipe.model`);
const config = require(__dirname + '/../config.js');

const food = {
  api_key: '16588e72a33a4b5a609959e1da609c4b',
  nojsoncallback: 1
}

function cleanString(str, dirtyChar, cleanChar) {
  result = str.replace(dirtyChar, cleanChar);
  return result;
}



async function searchForRecipe(food, query) {
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
      //console.log("About to return: ",recipes);
    });
  });
}

const edamam = {
  app_key: '94271fc667d95d0240640d96d0527c5c',
  app_id: 'b3684a31'
}

async function getRecipe(edamam, recipe) {
  console.log("The recipe: " + recipe.title);
  var edamRawURL = `https://api.edamam.com/search?q=${recipe.title}&app_id=b3684a31&app_key=94271fc667d95d0240640d96d0527c5c`
  edamRawURL = cleanString(edamRawURL, /’/g, '');
  var edamURL = encodeURI(edamRawURL);
  let rsp;
  let title = recipe.title;
  let title_div = cleanString(title,/ /g, '');
  return new Promise(resolve, reject => {
    request(edamURL, function (error, response, body) {
      console.log('getRecipe start');
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      rsp = JSON.parse(body);
      try {
        recipe = {
          title: title,
          recipeImg: rsp.hits[0].recipe.image,
          source_URL : rsp.hits[0].recipe.url,
          ingredients : rsp.hits[0].recipe.ingredientLines,
          yield : rsp.hits[0].recipe.yield,
          energy : rsp.hits[0].recipe.totalDaily.ENERC_KCAL.quantity/rsp.hits[0].recipe.yield,
          fat : rsp.hits[0].recipe.totalDaily.FAT.quantity/rsp.hits[0].recipe.yield,
          carbs : rsp.hits[0].recipe.totalDaily.CHOCDF.quantity/rsp.hits[0].recipe.yield,
          protein : rsp.hits[0].recipe.totalDaily.PROCNT.quantity/rsp.hits[0].recipe.yield,
          chart_div: title_div + '_div'
        }
        console.log("Nrecipe= ",recipe);

      } catch (e) {
        console.log("catch failed in getRecipe \n error:" ,e);
      }
      resolve(recipe);
    });
  });
}

async function processArray(edamam, recipes) {
  let newArr = [];
  //console.log("processArray recipes",recipes);
  for (var i = 0; i < recipes.length; i++) {
    let recipe = recipes[i];
    newArr[i] =  await getRecipe(edamam, recipe);

  }
  //console.log("newArr", newArr);
  return newArr;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Welcome to Mindful Meals'});
});

router.post('/', async function(req, res, next) {
  let query = req.body.Search;
  const first = await searchForRecipe(food, query);
  console.log("first val", first);
  const second = await processArray(edamam, first);
  console.log("second in post", second);
  //graph = second(google);
  res.render('index', {title: "You've searched for: " + query, recipes: second});
  });
//});


module.exports = router;
