const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Tweet Schema Definition.
recipeSchema = new Schema( {
  recipeTitle: {type: String},
  ingredients: { type: Array, of: String, default: null },
  
  //nutrition: {type: Array, of: Arrays, default: null }
});
// Construct and Export the Model.
module.exports = mongoose.model('recipe', recipeSchema);
