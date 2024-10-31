"use client";

import ChangeLanguage from "@/components/change-language";
import AuthButton from "./components/AuthButton";
import { i18n } from "@/translations/i18n";

export default function Landscape() {
  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col space-y-8 relative">
      <ChangeLanguage type="dropdown" /> <h1>Equitotal</h1>
      <h2>{i18n.t("landingPage.manageFirePumps")}</h2>
      <p style={{ marginTop: "100px" }}>
        The following app requires the pre approval from the administration of
        equitotal. etc etc
      </p>
      <div style={{ width: "200px" }}>
        <AuthButton />
      </div>
    </div>
  );
}
