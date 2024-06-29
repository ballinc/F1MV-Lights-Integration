import fetch from "cross-fetch";
import log from "electron-log";
import { getConfig, globalConfig } from "../../../ipc/config";
import { integrationStates } from "../states";
import { ControlType } from "../../controlAllLights";
import { rgbToColorTemp } from "../rgbToColorTemp";
import { rgbToHueSat } from "../rgbToHueSat";
import { EventType } from "../../../../shared/config/config_types";
import {
    IHomebridgeAPIPingResponse,
    IHomebridgeAPIAccessoryResponse,
} from "../../../../shared/integrations/homebridge_types";
import { access } from "original-fs";

let token: string;

export async function homebridgeOnlineCheck(): Promise<
    "online" | "offline"
> {
    const headers = {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
    };
    const options = {
        method: "GET",
        headers,
    };

    const url = new URL("/api/auth/check", globalConfig.homebridgeHost);
    url.port = globalConfig.homebridgePort.toString();

    try {
        const res = await fetch(url, options);
        const data = await res.json();
        console.log(data);
        if (data.message == "Unauthorized") {
            // Authorize the user
            let url;

            let body = {};
            if (globalConfig.homebridgeUsername) {
                body['username'] = globalConfig.homebridgeUsername;
            }

            if (globalConfig.homebridgePassword) {
                body['password'] = globalConfig.homebridgePassword;
            }

            if (globalConfig.homebridgeUsername && globalConfig.homebridgePassword) {
                url = new URL("/api/auth/login", globalConfig.homebridgeHost);
                url.port = globalConfig.homebridgePort.toString();
            } else {
                url = new URL("/api/auth/noauth", globalConfig.homebridgeHost);
                url.port = globalConfig.homebridgePort.toString();
            }

            const options = {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            };
            const res = await fetch(url, options);
            const data = await res.json();
            console.log(data);
            if (data.access_token) {
                token = data.access_token;
                return "online";
            }

        }
        integrationStates.homebridge = data.status === "OK";
        return integrationStates.homebridge ? "online" : "offline";
    } catch (err) {
        integrationStates.homebridge = false;
        return "offline";
    }
}

export async function homebridgeInitialize() {
    log.debug("Checking if the Homebridge API is online...");

    const status = await homebridgeOnlineCheck();
    if (status === "online") {
        log.debug("Homebridge API is online.");
    } else {
        log.error(
            "Error: Could not connect to the Homebridge API, please make sure that the hostname and port are correct!",
        );
    }
}

export async function homebridgeGetAccessories() {
    const config = await getConfig();
    const url = new URL("/api/accessories", config.homebridgeHost);
    url.port = config.homebridgePort.toString();

    const headers = {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
    };
    const options = {
        method: "GET",
        headers,
    };

    const res = await fetch(url, options);
    const json: IHomebridgeAPIAccessoryResponse[] = await res.json();
    const lightList: IHomebridgeAPIAccessoryResponse[] = [];

    json.forEach((item) => {
        if (item.type == "Lightbulb") {
            lightList.push(item);
        }
    });

    return {
        accessories: lightList,
        selectedAccessories: config.homebridgeAccessories,
    };
}

export async function homebridgeCheckDeviceSpectrum(entityId: string) {
    // const config = await getConfig();
    // const url = new URL("/api/states/" + entityId, config.homeAssistantHost);
    // url.port = config.homeAssistantPort.toString();

    // const headers = {
    //     Authorization: "Bearer " + config.homeAssistantToken,
    //     "Content-Type": "application/json",
    // };
    // const options = {
    //     method: "GET",
    //     headers,
    // };

    // try {
    //     const res = await fetch(url, options);
    //     const data: IHomeAssistantStateResponse = await res.json();
    //     if (!data.attributes.supported_color_modes) return false;
    //     return !!data.attributes.supported_color_modes.find(
    //         (mode: string) =>
    //             mode === "rgb" || mode === "rgbw" || mode === "hs" || mode === "xy",
    //     );
    // } catch (err) {
    //     log.error(
    //         `An error occurred while checking if Home Assistant device ${entityId} supports spectrum: ${err}`,
    //     );
    //     return false;
    // }
    return true;
}

export interface HomebridgeControlArgs {
    controlType: ControlType;
    color: {
        r: number;
        g: number;
        b: number;
    };
    brightness: number;
    event: EventType;
}

export async function homebridgeControl({
    controlType,
    color,
    brightness,
    event,
}: HomebridgeControlArgs) {
    console.log("control device");
    if (!integrationStates.homebridge) return;

    const config = await getConfig();

    const homebridgeAccessories = config.homebridgeAccessories;
    brightness = Math.round((brightness / 100) * 254);

    const headers = {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
    };

    console.log(event);
    console.log(controlType);
    console.log(color);
    switch (controlType) {
        case ControlType.On:
            for (const accessory in homebridgeAccessories) {
                const uniqueId = homebridgeAccessories[accessory];

                let url = new URL(
                    "/api/accessories/" + uniqueId,
                    config.homebridgeHost,
                );
                url.port = config.homebridgePort.toString();

                const supportsRGB = await homebridgeCheckDeviceSpectrum(uniqueId);

                let colorTemp = 0;

                if (!supportsRGB) {
                    const accessoryData = (await homebridgeGetAccessories()).accessories;
                    const foundDevice = accessoryData.find(
                        (item) => item.uniqueId === uniqueId,
                    );

                    // colorTemp = rgbToColorTemp(
                    //     event,
                    //     foundDevice?.attributes.min_mireds || 0,
                    //     foundDevice?.attributes.max_mireds || 0,
                    // );
                }

                // convert RGB to HSB
                const hsb = rgbToHueSat(color.r, color.g, color.b);

                console.log(hsb);

                const putData = [
                    {
                        characteristicType: "On",
                        value: 1
                    },
                    {
                        characteristicType: "Hue",
                        value: Math.floor(hsb.hue)
                    },
                    {
                        characteristicType: "Saturation",
                        value: Math.floor(hsb.sat)
                    },
                    {
                        characteristicType: "Brightness",
                        value: brightness
                    }
                ];

                putData.forEach(async (data) => {
                    let options = {
                        method: "PUT",
                        headers,
                        body: JSON.stringify(data),
                    };

                    try {
                        const f = await fetch(url, options);
                        const json = await f.json();
                        if (json.message == "Unauthorized") {
                            log.error("An authorization error occurred while turning on Homebridge device " + uniqueId);
                        }
                    } catch (error) {
                        log.error(
                            `An error occurred while turning on Homebridge device ${uniqueId}: ${error}`,
                        );
                    }
                });

            }
            break;
        case ControlType.Off:
            for (const accessory in homebridgeAccessories) {
                const uniqueId = homebridgeAccessories[accessory];

                let url = new URL(
                    "/api/accessories/" + uniqueId,
                    config.homebridgeHost,
                );
                url.port = config.homebridgePort.toString();

                const putData = {
                    characteristicType: "On",
                    value: 0
                };

                const options = {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(putData),
                };

                try {
                    await fetch(url, options);
                } catch (error) {
                    log.error(
                        `An error occurred while turning off Homebridge device ${uniqueId}: ${error}`,
                    );
                }
            }
            break;
    }
}