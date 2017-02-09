let uri = 'mongodb://localhost:27017/footradamus';
let mongoose = require('mongoose');

mongoose.connect(uri);
let db = mongoose.connection;

db.on('error', () => console.log('An error occured'));
db.once('open', () => console.log('Successfully connected to the database'));

let predictionSchema = mongoose.Schema({
  leagueID: String,
  leagueName: String,
  homeTeam: String,
  homeTeamId: String,
  awayTeam: String,
  awayTeamId: String,
  winner: String,
  matchDate: String,
  id: Number
});

/*
predictionModel.find({}, (error, prediction) => {
  console.log('Prediction', prediction);
});
*/

exports.Predictions = mongoose.model('Prediction', predictionSchema);
