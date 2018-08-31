app.get('/analysis', function (appReq, appRes) {
  console.log("#######################################");
  console.log(appReq.url);
  console.log(appReq.path);
  console.log(appReq.query);

  let food = {
    api_key: "314d3d963539dc5403f5328dbde78dbe",
    nojsoncallback: 1
  };

  let edamam = {
    app_key: "ee834218f4b56573e04e75950e0dd195",
    app_id: "ac7b4c28",
  };
  //"https://api.edamam.com/api/nutrition-data
  //?app_id=ac7b4c28&app_key=ee834218f4b56573e04e75950e0dd195
  //&ingr=1%20large%20apple"


  function createfoodOptionsSearch(food, query, page) {
    let options = {
      hostname: 'food2fork.com',
      port: 443,
      path:`/api/search?`,
      //   search?key=314d3d963539dc5403f5328dbde78dbe&q=shredded%20chicken`,
      method: 'GET'
    }
    let str = `key=${food.api_key}` +
    `&q=${query}`;

    options.path += str;
    return options;

  }


    //http://food2fork.com/api/get?key=314d3d963539dc5403f5328dbde78dbe&rId=47320

  function createFoodOptionsRecipe(food, rId) {
    let options = {
      hostname: 'food2fork.com',
      port: 443,
      path:
      `/api/get?`,
      //   /get?key=314d3d963539dc5403f5328dbde78dbe&rId=47320
      method: 'GET',
      rId: rId
    }

    let str = `key=${food.api_key}` +
    `&rId=47320`//${appReq.params.query}`;

    options.path += str;
    console.log(str);
    return options;

  }

  function parseFoodRspSearch(rsp) {
    let s = "";
    for(let i = 0; i <rsp.recipes.length; i++) {
      recipe_title = rsp.recipes[i].title;
      recipe_url = rsp.recipes[i].f2f_url;
      recipePhoto_url = rsp.recipes[i].image_url;
      //Recipe URl will become a page with the graph and the ingredients and link to recipe
      s += `<a href="${recipe_url}"><img alt="${recipe_title}" src="${recipePhoto_url}"/></a>`;
    }
    return s;
  }

  function parseFoodRspRecipe(rsp) {
    let ingredients = rsp.recipe.ingredients;
    let s = '';
    for (ingredient of ingredients) {
      s += ingredient;
    }
    return s;
  }

  function parseAnalysisRsp(rsp) {
    let ingredients = rsp.recipe.ingredients;
    let s= [];
    for (ingredient of ingredient) {
      s.push(ingredient);
    }
    return s;
  }

  function createPage(title, rsp) {
    let number = rsp.count;
    //let imageString = parseFoodRspSearch(rsp);
    let imageString = parseFoodRspRecipe(rsp);
    let str = '<html><head><title>Food JSON</title></head>' + '<body>' +
    `<h1>${title}</h1>` +
    `Total number of entries is: ${number}</br>${imageString}` +
    '</body></html>';
    return str;
  }

  //let options = createFoodOptionsSearch(food, appReq.query['query']);
  let options = createFoodOptionsRecipe(food, appReq.query['query']);
  //let options = createAnalysisOptions()

  let foodReq = https.request(options, function(foodRes) {
    console.log("statusCode: ", foodRes.statusCode);
    console.log("headers: ", foodRes.headers);

    let body = [];
    foodRes.on('data', function(chunk) {
      body.push(chunk);
    });

    foodRes.on('end', function() {
      appRes.writeHead(foodRes.statusCode, {'content-type':
      'text/html'});
      let bodyString = body.join('');
      let rsp = JSON.parse(bodyString);

      let s = createPage("analysis", rsp);
        appRes.write(s);
        appRes.end();
      });


  });

  foodReq.on('error', (e) => {
    console.error(e);
  });
  foodReq.end();
});
