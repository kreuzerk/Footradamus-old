/**
 * Created by kevinkreuzer on 10.11.16.
 */

import {Injectable, Inject} from "@angular/core";
import {Http} from "@angular/http";
import team from "../../../model/team.model";
import LogoService from "../../logos/logoDispatcher.service";
import league from "../../../model/league.model";

import {Observable} from "rxjs";
import 'rxjs/add/operator/map'


@Injectable()
export default class TeamSelectionService {

  private PREMIER_LEAGUE = 'Premier League';
  private PRIMERA_DIVISION = 'Primera División';
  private CHAMPIONS_LEAGUE = 'UEFA Champions League';

  constructor(private http: Http, @Inject('config') private config, private logoService: LogoService) {
  }

  public getLeagues(): Observable<Array<league>> {
    return this.http.get(`${this.config.backendUrl}competitions${this.config.authParam}`)
      .map(res => res.json())
      .map(res => {
          return this._getFilteredLeagues(res);
        }
      );
  }

  private _getFilteredLeagues(leagues){
    return leagues.filter(league => (league.name === this.PREMIER_LEAGUE && league.region === 'England') ||
    league.name === this.PRIMERA_DIVISION || league.name === this.CHAMPIONS_LEAGUE);
  }

  public getTeams(leagueId: string): Observable<Array<team>> {
    return this.http.get(`${this.config.backendUrl}standings/${leagueId}${this.config.authParam}`)
      .map(res => {
        return res.json()
          .map(res => {
            return {
              name: res.team_name,
              id: res.team_id,
              clubLogo: this.logoService.getLogo(1204, res.team_name)
            }
          });
      });
  }
}
