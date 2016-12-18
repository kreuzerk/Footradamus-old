/**
 * Created by kevinkreuzer on 05.12.16.
 */

import {NgModule} from "@angular/core";
import PremierLeagueLogos from "./premierLeagueLogos.service";
import LogoService from "./logoDispatcher.service";
import LaLigaLogos from "./laLigaLogos.service";

@NgModule({
  providers:[LogoService, PremierLeagueLogos, LaLigaLogos]
})
export default class LogosServiceModule{
}
