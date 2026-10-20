export enum RouterKeys {
  HOME = "/",
  FORBIDDEN_ACCESS = "/403",
  // The landing page is the login screen (Screen#01), so LOGIN is an alias of HOME.
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  LOGIN = "/",
  MAIN = "/main",
  USERS = "/users",
  UPDATE_PASSWORD = "/update-password",
  USER_REQUIRE_ACTIVATION = "/require-activation-user",
  SETTINGS = "/settings",
  INSTALLATIONS = "/installations",
  PUMPS = "/pumps",
  INTERVENTIONS = "/interventions",
  NEW_INTERVENTION = "/new-intervention/:id/:installation/:pump/:period",
  INTERVENTION = "/intervention/:id",
  CHECKLISTS = "/checklists",
}
