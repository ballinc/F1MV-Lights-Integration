import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App";
import "./style/index.scss";
import {createTheme, ThemeProvider} from "@mui/material";
import { lightBlue} from "@mui/material/colors";


const theme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#212121",
		},
		secondary: lightBlue,
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				root: {
					backgroundColor: "#212121",
				}
			}
		}
	}

});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<App />
		</ThemeProvider>
	</React.StrictMode>,
);

postMessage({ payload: "removeLoading" }, "*");
