import { PaletteColor, PaletteColorOptions, createTheme } from "@mui/material";
import { CSSObject } from "@mui/system";

declare module "@mui/material/styles" {
  interface Palette {
    incomeColor: PaletteColor;
    expenseColor: PaletteColor;
    balanceColor: PaletteColor;
    privateColor: PaletteColor;
    workColor: PaletteColor;
    routineColor: PaletteColor;
  }
  interface PaletteOptions {
    incomeColor?: PaletteColorOptions;
    expenseColor?: PaletteColorOptions;
    balanceColor?: PaletteColorOptions;
    privateColor?: PaletteColorOptions;
    workColor?: PaletteColorOptions;
    routineColor?: PaletteColorOptions;
  }
  interface Components {
    MuiLoadingButton?: {
      styleOverrides?: {
        root?: CSSObject;
        loading?: CSSObject;
      };
    };
  }
}

export const theme = createTheme({
  typography: {
    fontFamily:
      "'Arial', 'Helvetica Neue', 'Zen Kaku Gothic New', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN',  'Yu Gothic', 'Meiryo', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "3px",
        },
        contained: {
          boxShadow: "none",
          padding: "9px 16px",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "transparent",
          backgroundImage:
            "linear-gradient(45deg,rgba(50, 50, 50, 0.95),rgba(50, 50, 50, 0.95)),url(/img/noise.webp)",
          backgroundSize: "auto, 125px",
          color: "white",
          "&::before": {
            content: "''",
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "calc(100% - 6px)",
            height: "calc(100% - 6px)",
            border: "1px solid #fff",
            borderRadius: "2px",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
          },
          "&:hover": {
            boxShadow: "none",
            backgroundImage:
              "linear-gradient(180deg, rgba(120, 120, 120, 0.95), rgba(120, 120, 120, 0.95)), url(/img/noise.webp)",
          },
        },
      },
    },
    MuiLoadingButton: {
      styleOverrides: {
        root: {
          borderRadius: "3px",
          "&&.MuiButton-contained": {
            boxShadow: "none",
            padding: "9px 16px",
            position: "relative",
            overflow: "hidden",
            backgroundColor: "transparent",
            backgroundImage:
              "linear-gradient(45deg,rgba(50, 50, 50, 0.95),rgba(50, 50, 50, 0.95)),url(/img/noise.webp)",
            backgroundSize: "auto, 125px",
            color: "white",
          },
          "&&.MuiButton-contained::before": {
            content: "''",
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "calc(100% - 6px)",
            height: "calc(100% - 6px)",
            border: "1px solid #fff",
            borderRadius: "2px",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
          },
          "&&.MuiButton-contained:hover": {
            boxShadow: "none",
            backgroundImage:
              "linear-gradient(180deg, rgba(120, 120, 120, 0.95), rgba(120, 120, 120, 0.95)), url(/img/noise.webp)",
          },
          "&&.MuiButton-contained:active": {
            boxShadow: "none",
          },
          "&&.MuiButton-contained.MuiLoadingButton-loading": {
            backgroundImage:
              "linear-gradient(180deg, rgba(120, 120, 120, 0.95), rgba(120, 120, 120, 0.95)), url(/img/noise.webp)",
          },
          "&&.MuiButton-contained .MuiCircularProgress-root": {
            color: "#fff",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "10px",
        },
        head: {
          borderBottom: "1px solid #444444",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
          borderRadius: "3px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "3px",
        },
      },
    },
  },

  palette: {
    text: {
      primary: "#404040",
    },
    action: {
      hoverOpacity: 0.1,
    },
    primary: {
      main: "#444444",
    },
    secondary: {
      main: "#888888",
    },
    incomeColor: {
      main: "#566E93",
      light: "#8CA2C3",
      dark: "#485973",
    },
    expenseColor: {
      main: "#bf5c5c",
      light: "#C18585",
      dark: "#954545",
    },
    balanceColor: {
      main: "#59A0A7",
      light: "#85C1BF",
      dark: "#558C8F",
    },
    privateColor: {
      main: "#788BA9",
      light: "#bad0e5",
      dark: "#364b7b",
    },
    workColor: {
      main: "#c18585",
      light: "#ebcfcf",
      dark: "#923535",
    },
    routineColor: {
      main: "#6E989B",
      light: "#c1dbd9",
      dark: "#235658",
    },
  },
});
