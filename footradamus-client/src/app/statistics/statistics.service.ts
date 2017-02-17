/**
 * Created by kevinkreuzer on 09.01.17.
 */

import {Injectable, Inject} from "@angular/core";
import {Http} from "@angular/http";
import prediction from "../shared/model/prediction.model";
import predictionStatistics from "../shared/model/predictionStatistics.model";
import {Subject} from "rxjs";
import {leaguePredictions} from "../shared/model/predictionStatistics.model";

@Injectable()
export default class StatisticsService {

  private predictionStatistics: predictionStatistics;
  private $statistics: Subject<predictionStatistics> = new Subject<predictionStatistics>();

  constructor(private http: Http, @Inject('config') private config) {
    this.initPredictionStatistics();
  }

  getStatistics() {
    this.initPredictionStatistics();
    this._getStoredPredictions()
      .subscribe((predictions: Array<prediction>) => {
        predictions.forEach((prediction: prediction) => {
          this.calculateStatsForPrediction(prediction);
        });
      });
    return this.$statistics;
  }

  private initPredictionStatistics() {
    this.predictionStatistics = {
      totalCorrectPredictions: 0,
      totalFalsePredictions: 0,
      statisticsPerLeague: []
    };
  }

  private calculateStatsForPrediction(prediction: prediction) {
    if (this.isAlreadyPredicted(prediction)) {
      this.addStatsForCachedPredictions(prediction);
    }
    else {
      this.addStatsForNewPredictions(prediction);
    }
  }

  private addStatsForCachedPredictions(prediction: prediction) {
    let wasPredictionCorrect = prediction.predictionHistory.correctlyPredicted;
    this.calculateStats(prediction, wasPredictionCorrect);
    this.$statistics.next(this.predictionStatistics);
  }

  private addStatsForNewPredictions(prediction: prediction) {
    this._getMatchStatistics(prediction)
      .subscribe(matchStatistics => {
        let actualWinner = this._getWinningTeam(matchStatistics[0]);
        let wasPredictionCorrect = this._wasPredictionCorrect(prediction.winner, actualWinner);
        this.calculateStats(prediction, wasPredictionCorrect);
        this.addPredictionToCache(prediction, wasPredictionCorrect);
        this.$statistics.next(this.predictionStatistics);
      });
  }

  private addPredictionToCache(prediction: prediction, wasPredictionCorrect: boolean) {
    let predictionHistory = {
      'predictionHistory': {
        'correctlyPredicted': wasPredictionCorrect
      }
    }
    this.http.put(`${this.config.predictionBackendUrl}/${prediction._id}`, predictionHistory).subscribe();
  }

  private calculateStats(prediction: prediction, wasPredictionCorrect: boolean) {
    this._calculateTotals(wasPredictionCorrect, this.predictionStatistics);
    this._calculateLeagueStats(prediction, wasPredictionCorrect);
  }

  private isAlreadyPredicted(prediction: prediction) {
    return !prediction.predictionHistory ? false : true;
  }

  private _calculateLeagueStats(prediction: prediction, wasPredictionCorrect: boolean) {
    let leaguePredStats = this.predictionStatistics.statisticsPerLeague.find((stat: leaguePredictions) => stat.leagueId === prediction.leagueID);

    if (!leaguePredStats) {
      leaguePredStats = {
        leagueId: prediction.leagueID,
        leagueName: prediction.leagueName,
        totalCorrectPredictions: 0,
        totalFalsePredictions: 0
      }
      this.predictionStatistics.statisticsPerLeague.push(leaguePredStats);
    }
    this._calculateTotals(wasPredictionCorrect, leaguePredStats);
  }

  private _calculateTotals(wasPredictionCorrect: boolean, stats) {
    if (wasPredictionCorrect) {
      stats.totalCorrectPredictions++;
    }
    else {
      stats.totalFalsePredictions++;
    }
  }

  private _getWinningTeam(matchStatistics) {
    let homeTeamScore: number = parseInt(matchStatistics.localteam_score);
    let awayTeamScore: number = parseInt(matchStatistics.visitorteam_score);

    if (homeTeamScore > awayTeamScore) {
      return matchStatistics.localteam_name;
    }
    else {
      return matchStatistics.visitorteam_name;
    }
  }

  private _wasPredictionCorrect(predictedWinner, actualWinner) {
    return predictedWinner.toLowerCase() === actualWinner.toLowerCase();
  }

  private _getStoredPredictions() {
    return this.http.get(this.config.predictionBackendUrl)
      .map(res => res.json());
  }

  private _getMatchStatistics(prediction: prediction) {
    return this.http.get(`${this.config.backendUrl}matches?comp_id=${prediction.leagueID}&team_id=${prediction.homeTeamId}&match_date=${prediction.matchDate}&${this.config.authParam}`)
      .map(res => res.json());
  }
}
