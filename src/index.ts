import { run } from "./app/game";
import * as log from "loglevel";
import * as prefix from "loglevel-plugin-prefix";
import * as firebase from "firebase";

const modeEmoji: string = process.env.NODE_ENV === "production" ? "⚙" : "🚧";
console.log(
  `${modeEmoji} App running in ${process.env.NODE_ENV} mode. ${modeEmoji}`
);

/**
 * Set up the logger and its log level depending on the NODE_ENV value
 * (production mode only displays warnings and errors).
 */
prefix.reg(log);
prefix.apply(log);
log.setLevel(
  process.env.NODE_ENV === "production" ? log.levels.WARN : log.levels.TRACE
);

const configFirebase: any = {
  apiKey: "AIzaSyB0X-GWABFoqvHwSsqs78FwL8uQiXPNlFQ",
  authDomain: "coolslide-25127.firebaseapp.com",
  databaseURL: "https://coolslide-25127.firebaseio.com",
  projectId: "coolslide-25127",
  storageBucket: "coolslide-25127.appspot.com",
  messagingSenderId: "92553476132",
  appId: "1:92553476132:web:965edd431d002f4b9c00b1",
};
firebase.initializeApp(configFirebase);

// Creates the Phaser canvas and launch the game
run();
