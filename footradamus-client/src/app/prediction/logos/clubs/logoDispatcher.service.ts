/**
 * Created by kevinkreuzer on 05.12.16.
 */

import {Injectable, Inject} from "@angular/core";
import BundesligaLogos from "./bundesligaLogos.service";

@Injectable()
export default class LogoService {

  private PREMIER_LEAGUE_ID: string = '1204';
  private LALIGA_LEAGUE_ID: string = '1399';
  private BUNDESLIGA_LEAGUE_ID: string = '1229';

  private readonly PREMIER_LEAGUE_BASE_URL = 'premier-league';
  private readonly PRIMERA_DIVISION_BASE_URL = 'primera-division';

  constructor(private bundesligaLogos: BundesligaLogos,
              @Inject('config') private config) {
  }

  getLogo(leagueID: string, teamName: string) {
    let imageName = this.getImageName(teamName);
    switch (leagueID) {
      case this.PREMIER_LEAGUE_ID:
        return `${this.config.predictionBackendUrl}${this.PREMIER_LEAGUE_BASE_URL}/${imageName}`;
      case this.LALIGA_LEAGUE_ID:
        return `${this.config.predictionBackendUrl}${this.PRIMERA_DIVISION_BASE_URL}/${imageName}`;
      case this.BUNDESLIGA_LEAGUE_ID:
        return this.bundesligaLogos.getLogoUrl(teamName);
      default:
        return null;
    }
  }

  private getImageName(teamName: string) {
    let imageName = `${teamName
      .replace(/ /g, "-")
      .split('.').join("")
      .toLowerCase()}.png`;
    return imageName;
  }
}
