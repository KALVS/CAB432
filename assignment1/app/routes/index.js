var express = require('express');
var router = express.Router();
var request = require('request-promise');

const food = {
  api_key: '8ad1e94239f58582cfdbdd70bbe86c76',
  nojsoncallback: 1
}

//This is dumb but was a good idea at the time
function cleanString(str, dirtyChar, cleanChar) {
  result = str.replace(dirtyChar, cleanChar);
  return result;
}
//Creates an Array of Recipes, puts that into a URL that needs some cleaning
//Then returns a promise of the recipes
//If it rejects, we go to a 404 with a reason.
//This API has 50 calls. Use them wisely please. Or just make a fake account
//
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
        console.log(error);
      }
      console.log('statusCode:', response && response.statusCode); //Print response status incase it doesnt work
      rsp = JSON.parse(body);
      if (rsp.count > 0) {
        for (var i = 0; i < 3; i++) {
          if (typeof rsp.recipes[i] !== "undefined"){
            let dirtyTitle = rsp.recipes[i].title;
            dirtyTitle = decodeURI(dirtyTitle);
            let cleanTitle = cleanString(dirtyTitle, /’/g, '');
            cleanTitle = cleanString(dirtyTitle, /&#8217;/g, '');
            let recipe = {
              title: cleanTitle,
              recipeImg: rsp.recipes[i].image_url,
              source_URL : rsp.recipes[i].source_url
            }
            recipes[i] = recipe;
          }
        }
      } else {
        //for (var i = 0; i < 3; i++) {
          let recipe = {
            title: "NULL"
          }
          recipes.push(recipe);
        //}
      }
      resolve(recipes);
    });
  });
}

const edamam = {
  app_key: '94271fc667d95d0240640d96d0527c5c',
  app_id: 'b3684a31'
}
//This takes a recipe's title
//Done a quick check with old mate Edamam and
async function getRecipe(edamam, recipe, vegan) {
  return new Promise(resolve => {
    console.log("The recipe: " + recipe.title);
    if (recipe.title === "NULL") {
      recipe = {
      title: "Please refine search parameters",
      recipeImg: "https://media.giphy.com/media/woxVvsobzJO7u/giphy.gif",
      source_URL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      ingredients: ["You", "Didn't", "Say", "The","Magic","Word", "!"],
      yield: "0",
      energy: "0",
      fat: "0",
      carbs: "0",
      protein: "0",
      chart_div: Math.random() + '_div'
    }
    resolve(recipe);
    } else {
      var edamRawURL = `https://api.edamam.com/search?q=${recipe.title}&app_id=b3684a31&app_key=94271fc667d95d0240640d96d0527c5c&Health=peanut-free`
      edamRawURL = cleanString(edamRawURL, /’/g, '');
      var edamURL = encodeURI(edamRawURL);
      let rsp;
      let title = recipe.title;
      let title_div = cleanString(title,/ /g, '');
      request(edamURL, function (error, response, body) {
        console.log('getRecipe start');
        console.log('error:', error);
        console.log('statusCode:', response && response.statusCode);
        rsp = JSON.parse(body);
        console.log("Get Recipe response", rsp.hits[0].recipe);

        try {
          recipe = {
            title: title,
            ingredients: rsp.hits[0].recipe.ingredientLines,
            yield: rsp.hits[0].recipe.yield,
            recipeImg: rsp.hits[0].recipe.image,
            source_URL: rsp.hits[0].recipe.url,
            energy: rsp.hits[0].recipe.totalDaily.ENERC_KCAL.quantity/rsp.hits[0].recipe.yield,
            fat: rsp.hits[0].recipe.totalDaily.FAT.quantity/rsp.hits[0].recipe.yield,
            carbs: rsp.hits[0].recipe.totalDaily.CHOCDF.quantity/rsp.hits[0].recipe.yield,
            protein: rsp.hits[0].recipe.totalDaily.PROCNT.quantity/rsp.hits[0].recipe.yield,
            chart_div: title_div + '_div'
          }

        } catch (e) {
          title = recipe.title;
          recipeImg = recipe.recipeImg;
          source_URL = recipe.source_URL;
          recipe = {
            title: title,
            recipeImg: recipeImg,
            source_URL: source_URL,
            ingredients: ["Unable to retireve ingredients, please refer to the source URL."]
          }
        }
        resolve(recipe);
      });
    }
  });
}

async function processArray(edamam, recipes, vegan) {
  let newArr = [];
  if (recipes.length > 0) {
    for (var i = 0; i < recipes.length; i++) {
      let recipe = recipes[i];
      newArr[i] =  await getRecipe(edamam, recipe, vegan);
    }
  }else {
    newArr = await getRecipe(edamam, recipes);
  }
  console.log(newArr);
  return newArr;
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Welcome to Mindful Meals'});
});

router.post('/', async function(req, res, next) {
  let query = req.body.Search;
  let vegan = req.body.Vegan;
  const first = await searchForRecipe(food, query);
  const second = await processArray(edamam, first, vegan);
  res.render('index', {title: "You've searched for: " + query, recipes: second});
});


module.exports = router;
