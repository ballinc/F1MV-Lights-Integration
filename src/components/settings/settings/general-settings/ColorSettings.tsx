import React, { useEffect, useState } from "react";
import { RgbColorPicker } from "react-colorful";
import Typography from "@mui/material/Typography";
import { AutocompleteChangeReason, Box } from "@mui/material";
import { Autocomplete, TextField } from "@mui/material";
import { getConfig, settingBoxSX, handleSetSingleSetting } from "@/components/settings/allSettings";

interface IColorSettings {
  [key: string]: string;
}

interface IFlagOption {
  label: string;
  value: string;
}

interface IFlagMap {
  [key: string]: string;
}

const flagNameMaps: IFlagMap = {
  green: "Green",
  yellow: "Yellow",
  red: "Red",
  safetyCar: "Safety Car",
  vsc: "Virtual Safety Car",
  vscEnding: "Virtual Safety Car Ending",
  staticColor: "Static Color",
};

const flagDescriptionMaps: IFlagMap = {
  green: "This is the color that will be used when the track status is green.",
  yellow: "This is the color that will be used when the track status is yellow.",
  red: "This is the color that will be used when the track status is red.",
  safetyCar: "This is the color that will be used when there is a safety car.",
  vsc: "This is the color that will be used when there is a virtual safety car.",
  vscEnding: "This is the color that will be used when the virtual safety car is ending.",
  staticColor: "This is the color that will be used when going back to the static color.",
};

const DEFAULT_FLAG = "green";

export default function ColorSettings() {
  const [settings, setSettings] = useState<any | null>(null);
  const [selectedFlag, setSelectedFlag] = useState<string | null>(DEFAULT_FLAG);
  const flagOptions: IFlagOption[] = Object.keys(flagNameMaps).map((flagKey) => ({
    label: flagNameMaps[flagKey],
    value: flagKey,
  }));

  useEffect(() => {
    async function fetchConfig() {
      const config = await getConfig();
      setSettings(config.Settings.generalSettings.colorSettings);
    }
    fetchConfig();
  }, []);

  const saveConfig = async () => {
    if (!settings) return;
    await window.f1mvli.config.set("Settings.generalSettings.colorSettings", settings);
  };

  useEffect(() => {
    const handleUnload = async () => {
      await saveConfig();
    };

    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("unload", handleUnload);
      saveConfig();
    };
  }, [saveConfig]);

  const handleFlagChange = (event: AutocompleteChangeReason, option: IFlagOption | null) => {
    if (option) {
      setSelectedFlag(option.value);
    }
  };

  return (
    <>
      {settings && (
        <div>
          <div>
            <Box sx={settingBoxSX}>
              <Typography variant="h6" component="div">
                Color Customization
              </Typography>
            </Box>
            <Autocomplete
              disablePortal={true}
              autoComplete={true}
              autoSelect={true}
              clearIcon={false}
              //@ts-ignore
              defaultValue={"green"}
              value={flagOptions.find((option: IFlagOption) => option.value === selectedFlag)}
              //@ts-ignore
              onChange={handleFlagChange}
              autoHighlight={true}
              id={"flag-selector"}
              sx={{ width: 300, mb: 2, mt: 1 }}
              renderInput={(params) => <TextField {...params} label="Select Flag" color={"secondary"} />}
              getOptionLabel={(option: IFlagOption) => option.label}
              options={flagOptions}
            />
          </div>
          {selectedFlag && (
            <Box sx={settingBoxSX}>
              <div>
                <Typography variant="h6" component="div">
                  {flagNameMaps[selectedFlag]}
                </Typography>
                <Typography variant="body2" component="div" sx={{ color: "grey", mb: 3 }}>
                  {flagDescriptionMaps[selectedFlag]}
                </Typography>
                <div style={{ display: "flex", alignItems: "center", marginTop: "16px" }}>
                  <TextField
                    color="secondary"
                    variant="outlined"
                    label={"Red value"}
                    inputProps={{
                      step: 1,
                      min: 0,
                      max: 255,
                      type: "number",
                    }}
                    //@ts-ignore
                    value={settings[selectedFlag].r}
                    //@ts-ignore
                    onChange={(e) => handleSetSingleSetting(selectedFlag, { ...settings[selectedFlag], r: parseInt(e.target.value) }, setSettings, settings)}
                    style={{ marginRight: "16px", width: "30%" }}
                  />
                  <TextField
                    color="secondary"
                    variant="outlined"
                    label={"Green value"}
                    inputProps={{
                      step: 1,
                      min: 0,
                      max: 255,
                      type: "number",
                    }}
                    //@ts-ignore
                    value={settings[selectedFlag].g}
                    //@ts-ignore
                    onChange={(e) => handleSetSingleSetting(selectedFlag, { ...settings[selectedFlag], g: parseInt(e.target.value) }, setSettings, settings)}
                    style={{ marginRight: "16px", width: "30%" }}
                  />
                  <TextField
                    color="secondary"
                    variant="outlined"
                    label={"Blue value"}
                    inputProps={{
                      step: 1,
                      min: 0,
                      max: 255,
                      type: "number",
                    }}
                    //@ts-ignore
                    value={settings[selectedFlag].b}
                    //@ts-ignore
                    onChange={(e) => handleSetSingleSetting(selectedFlag, { ...settings[selectedFlag], b: parseInt(e.target.value) }, setSettings, settings)}
                    style={{ width: "30%" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", marginTop: "16px", justifyContent: "center" }}>
                <RgbColorPicker
                  //@ts-ignore
                  color={settings[selectedFlag]}
                  onChange={(color) => handleSetSingleSetting(selectedFlag, color, setSettings, settings)}
                />
              </div>
            </Box>
          )}
        </div>
      )}
    </>
  );
}