const MongoClient = require("mongodb").MongoClient;

const is_hosted = process.env.IS_HOSTED === "true";

const hostedURI = "mongodb+srv://monk:1234a@cluster0.wowgtvj.mongodb.net/lab_example?retryWrites=true&w=majority";
const localURI = "mongodb://127.0.0.1";

const database = new MongoClient(is_hosted ? hostedURI : localURI);

module.exports = database;