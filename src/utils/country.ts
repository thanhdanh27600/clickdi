import { Locale } from 'types/locale';

export const getCountryName = (code: string, locale: Locale = Locale.English) => {
  let countryName: string | undefined = '';
  try {
    const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
    countryName = regionNames.of(code.toUpperCase());
  } catch (error) {
    console.error('GET COUNTRY NAME ERROR', error);
  }
  return countryName;
};
