var mongoose = require("mongoose");

var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model
var UserSchema = new Schema({
  // `title` is of type String
  username: String,
  // `body` is of type String
  password: String
});

// This creates our model from the above schema, using mongoose's model method
var User = mongoose.model("User", UserSchema);

// Export the Note model
module.exports = User;