const MongoClient = require("mongodb").MongoClient;

const is_hosted = process.env.IS_HOSTED || false;

const hostedURI = "mongodb+srv://theMongoAdmin:accidentalLoginSteps@cluster0.4ulcc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const localURI = "mongodb://127.0.0.1/?authSource=admin&retryWrites=true&w=majority";

let database;

if (is_hosted) {
  database = new MongoClient(hostedURI);
} else {
  database = new MongoClient(localURI);
}

module.exports = database;