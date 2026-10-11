import fetch from "cross-fetch";
import log from "electron-log";
import { getConfig, globalConfig } from "../../../ipc/config";
import { integrationStates } from "../states";
import { ControlType } from "../../controlAllLights";
import { rgbToHueSat } from "../rgbToHueSat";
import { fetchWithTimeout } from "../../../utils/fetch";
import { map } from "lodash";

var options = {
  iface: '10.3.50.9',
  host: '10.3.31.1'
}

var artnet = require('artnet')(options);


let storedToken: { token: string; expiry: number } | null = null;

export async function artnetOnlineCheck(): Promise<"online" | "offline"> {
  integrationStates.artnet = true;
  return "online";
  // const url = new URL("/api/auth/check", globalConfig.homebridgeHost);
  // url.port = globalConfig.homebridgePort.toString();

  // const token = await requestHomebridgeToken();

  // const options = {
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: "Bearer " + token,
  //   },
  // };

  // try {
  //   const res = await fetchWithTimeout(url.toString(), options);
  //   const data: IHomebridgeAuthCheckResponse = await res.json();

  //   const isOnline = data.status === "OK";

  //   integrationStates.homebridge = isOnline;
  //   return isOnline ? "online" : "offline";
  // } catch (error) {
  //   integrationStates.homebridge = false;
  //   return "offline";
  // }
}

export async function requestHomebridgeToken() {
  // if (storedToken && storedToken.expiry > Date.now()) {
  //   return storedToken.token;
  // }

  // const url = new URL("/api/auth/login", globalConfig.homebridgeHost);
  // url.port = globalConfig.homebridgePort.toString();

  // const options = {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     username: globalConfig.homebridgeUsername,
  //     password: globalConfig.homebridgePassword,
  //   }),
  // };

  // try {
  //   const res = await fetchWithTimeout(url.toString(), options);
  //   const data: IHomebridgeTokenResponse = await res.json();

  //   storedToken = {
  //     token: data.access_token,
  //     expiry: Date.now() + data.expires_in * 1000,
  //   };

  //   return data.access_token;
  // } catch (error) {
  //   log.error(
  //     `An error occurred while requesting the Homebridge token: ${error}`,
  //   );
  // }
}

export async function artnetInitialize() {
  // log.debug("Checking if the Homebridge API is online...");

  // const status = await homebridgeOnlineCheck();

  // if (status === "online") {
  //   log.debug("Homebridge API is online.");
  // } else {
  //   log.error(
  //     "Error: Could not connect to the Homebridge API, please make sure that the hostname and port are correct!",
  //   );
  // }

}

export async function homebridgeGetAccessories() {
  // const config = await getConfig();
  // const url = new URL("/api/accessories", config.homebridgeHost);
  // url.port = config.homebridgePort.toString();

  // const token = await requestHomebridgeToken();

  // const options = {
  //   method: "GET",
  //   headers: {
  //     Authorization: "Bearer " + token,
  //     "Content-Type": "application/json",
  //   },
  // };

  // const res = await fetch(url.toString(), options);
  // const json: IHomebridgeAccessoryResponse = await res.json();

  // const lightList: IHomebridgeAccessory[] = [];

  // json.forEach((item) => {
  //   if (item.type == "Lightbulb" && homebridgeSupportsHSB(item)) {
  //     lightList.push(item);
  //   }
  // });

  // return {
  //   accessories: lightList,
  //   selectedAccessories: config.homebridgeAccessories,
  // };
}

export function artnetSupportsHSB(accessory: any) {
  // if ("Hue" in accessory.values && "Saturation" in accessory.values) {
  //   return true;
  // }

  // return false;
  return true;
}

interface ArtnetControlArgs {
  controlType: ControlType;
  color: {
    r: number;
    g: number;
    b: number;
  };
  brightness: number;
}

export async function artnetControl({
  controlType,
  color,
  brightness,
}: ArtnetControlArgs) {
  console.log(controlType, color, brightness)
  if (!integrationStates.artnet) return;
  console.log("Artnet enabled")

  const config = await getConfig();

  // const homebridgeAccessories = config.homebridgeAccessories;

  // const headers = {
  //   Authorization: "Bearer " + token,
  //   "Content-Type": "application/json",
  // };

  const profile_150 = {
    PAN: 0,
    PAN_FINE: 1,
    TILT: 2,
    TILT_FINE: 3,
    PT_SPEED: 4,
    CTRL: 5,
    COLOR: 6,
    RED: 7,
    RED_FINE: 8,
    GREEN: 9,
    GREEN_FINE: 10,
    BLUE: 11,
    BLUE_FINE: 12,
    WHITE: 13,
    WHITE_FINE: 14,
    CTC: 15,
    COLOR_CTRL: 16,
    ZOOM: 17,
    ZOOM_FINE: 18,
    SHUTTER: 19,
    INTENSITY: 20,
    INTENSITY_FINE: 21,
  }

  const artnetLightingFixtures: number[] = [
    23, 45, 67, 89, 111, 133
  ]

  switch (controlType) {
    case ControlType.On:
      for (const channel of artnetLightingFixtures as number[]) {
        const universe = 20;

        artnet.set(universe, channel + profile_150.INTENSITY, brightness * 2.55);
        artnet.set(universe, channel + profile_150.RED, color.r);
        artnet.set(universe, channel + profile_150.GREEN, color.g);
        artnet.set(universe, channel + profile_150.BLUE, color.b);

        log.debug(`Setting ArtNet fixture ${channel}`);
      }
      break;
    case ControlType.Off:
      for (const channel in artnetLightingFixtures) {

        artnet.set(20, channel + profile_150.INTENSITY, 0);

        log.debug(`Turning off ArtNet fixture ${channel}`);
      }
      break;
  }
}
