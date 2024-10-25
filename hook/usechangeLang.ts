import { i18n } from "../translations/i18n";

const useChangeLang = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage("cimode");
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  return {
    changeLanguage,
  };
};

export default useChangeLang;
