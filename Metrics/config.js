// Firebase web config: Firebase console > Project settings > General > Your apps > Web app (</>) > SDK setup > Config.
// These values are public by design; access to the data is protected by database.rules.json.
// While apiKey is empty the page only offers the demo data.
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  appId: "",
};

// The login username is turned into this e-mail for Firebase Auth: "Predrag" -> predrag@example.com.
// Create exactly that user (Authentication > Users > Add user) with your password.
export const loginEmailDomain = "example.com";

// Levels in the order they appear in the game (Build Profiles scene list). Unknown levels go to the end.
// Optional display names: "FirstStage": "Prva etapa".
export const levels = [
  "FirstStage", "Arcade1", "SecondStage", "ThirdStage", "FinalBoss", "Arcade2", "Inferno",
  "HellFirst", "Hell1", "Hell2", "Arena1", "Hell3", "Castel",
];
export const levelNames = {};
