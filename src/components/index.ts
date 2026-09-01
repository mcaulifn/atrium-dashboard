import type { AtriumComponent } from "../types";
import { attentionComponent } from "./attention";
import { cardComponent } from "./card";
import { climateComponent } from "./climate";
import { fansComponent } from "./fans";
import { headerComponent } from "./header";
import { houseComponent } from "./house";
import { musicComponent } from "./music";
import { navComponent } from "./nav";
import { roomsComponent } from "./rooms";
import { scenesComponent } from "./scenes";

// The component registry — add a builder here and it's usable from config by id.
type AnyComponent = AtriumComponent<Record<string, unknown>>;
export const COMPONENTS: Record<string, AnyComponent> = {
  nav: navComponent as AnyComponent,
  header: headerComponent as AnyComponent,
  music: musicComponent as AnyComponent,
  house: houseComponent as AnyComponent,
  scenes: scenesComponent as AnyComponent,
  fans: fansComponent as AnyComponent,
  attention: attentionComponent as AnyComponent,
  rooms: roomsComponent as AnyComponent,
  climate: climateComponent as AnyComponent,
  card: cardComponent as AnyComponent,
};
