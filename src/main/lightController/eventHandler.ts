import { ActionType, EventType } from "../../shared/config/config_types";
import { getConfig } from "../ipc/config";
import { sleep } from "../utils/sleep";
import { liveTimingState } from "../multiviewer/api";
import { ControlType, controlAllLights } from "./controlAllLights";

export async function eventHandler(event: EventType) {
  const config = await getConfig();
  const events = config.events;

  for (let i = 0; i < events.length; i++) {
    const currentEvent = events[i];
    if (!currentEvent.triggers.includes(event) || !currentEvent.enabled) {
      continue;
    }

    //repeat for amount
    for (let j = 0; j < currentEvent.amount; j++) {
      //loop through all actions
      for (let k = 0; k < currentEvent.actions.length; k++) {
        const currentAction = currentEvent.actions[k];

        switch (currentAction.type) {
          case ActionType.On:
            await controlAllLights({
              controlType: ControlType.On,
              color: currentAction.color,
              brightness: currentAction.brightness,
              event,
              eventAction: currentAction,
            });
            break;
          case ActionType.Off:
            await controlAllLights({
              controlType: ControlType.Off,
              event,
              eventAction: currentAction,
            });
            break;
          case ActionType.Delay:
            await sleep(currentAction.delay ?? 0);
            break;
          case ActionType.GoBackToCurrentStatus:
            switch (liveTimingState?.TrackStatus.Status) {
              case "1":
                eventHandler(EventType.GreenFlag);
                break;
              case "2":
                eventHandler(EventType.YellowFlag);
                break;
              case "4":
                eventHandler(EventType.SafetyCar);
                break;
              case "5":
                eventHandler(EventType.RedFlag);
                break;
              case "6":
                eventHandler(EventType.VirtualSafetyCar);
                break;
              case "7":
                eventHandler(EventType.VirtualSafetyCarEnding);
                break;
            }
            break;
        }
      }
    }

    if (currentEvent.goBackToStatic) {
      const delay = config.goBackToStaticDelay;

      let color = config.goBackToStaticColor;
      const brightness = config.goBackToStaticBrightness;

      if (config.goBackToStaticColorLeaderColor) {
        const leader = Object.values(liveTimingState?.TimingData.Lines ?? {})
          .map((line) => {
            // if (TimingStats[line.RacingNumber]?.PersonalBestLapTime.Position !== 1) {
            //   return "";
            // }
            return line;
          })
          .filter((line) => line.Position == "1")[0].RacingNumber;

        // TODO: Get these colours from MV
        const colours = {
          // Max Verstappen
          1: { r: 0, g: 0, b: 255 },
          // Sergio Perez
          11: { r: 0, g: 0, b: 255 },
          // Lando Norris
          4: { r: 255, g: 65, b: 35 },
          // Oscar Piastri
          81: { r: 255, g: 65, b: 35 },
          // Lewis Hamilton
          44: { r: 0, g: 165, b: 255 },
          // George Russell
          63: { r: 0, g: 165, b: 255 },
          // Valteri Bottas
          77: { r: 0, g: 255, b: 0 },
          // Guanyu Zhou
          24: { r: 0, g: 255, b: 0 },
          // Charlse Leclerc
          16: { r: 255, g: 0, b: 0 },
          // Carlos Sainz
          55: { r: 255, g: 0, b: 0 },
          // Daniel Ricciardo
          3: { r: 20, g: 52, b: 203 },
          // Yuki Tsunoda
          22: { r: 20, g: 52, b: 203 },
          // Fernando Alonso
          14: { r: 0, g: 255, b: 40 },
          // Lance Stroll
          18: { r: 0, g: 255, b: 40 },
          // Esteban Ocon
          31: { r: 0, g: 147, b: 204 },
          // Pierre Gasly
          10: { r: 0, g: 147, b: 204 },
          // Logan Sargeant
          2: { r: 100, g: 196, b: 255 },
          // Alex Albon
          23: { r: 100, g: 196, b: 255 },
          // Kevin Magnussen
          20: { r: 255, g: 255, b: 255 },
          // Nico Hulkenberg
          27: { r: 255, g: 255, b: 255 },
        };

        color = colours[leader] ? colours[leader] : color;

      }

      if (delay) await sleep(delay);
      await controlAllLights({
        controlType: ControlType.On,
        color,
        brightness,
        event,
        eventAction: { type: ActionType.On },
      });
    }
  }
}
