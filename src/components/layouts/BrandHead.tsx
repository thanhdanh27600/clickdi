import Head from 'next/head';
import { FeatureTabKey } from 'store/utilitySlice';
import { BASE_URL, isProduction, isShortDomain } from 'types/constants';
import { defaultLocale, useTrans } from 'utils/i18next';

export const BrandHead = ({ feature = FeatureTabKey.SHARE_LINK }: { feature?: FeatureTabKey }) => {
  const { t, locale } = useTrans();
  if (isShortDomain) {
    return null;
  }

  const brandTitle = locale
    ? feature === FeatureTabKey.SHARE_LINK
      ? t('brandTitle')
      : feature === FeatureTabKey.SHARE_TEXT
      ? t('brandTitleNote')
      : t('brandTitle')
    : '404 Not Found';
  const brandDescription = locale ? t('brandDescription') : '404 Not Found';

  return (
    <Head>
      {/* Primary Meta Tags */}
      <meta name="title" content={brandTitle} />
      <meta name="description" content={brandDescription} />

      {isProduction && <title>{brandTitle}</title>}
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.facebook.com/quickshare.at/" />
      <meta property="og:title" content={brandTitle} />
      <meta property="og:description" content={brandDescription} />
      <meta property="og:image" content={`${BASE_URL}/assets/quickshare-banner-${locale || defaultLocale}.jpg`} />
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      {/* <meta property="twitter:url" content="https://x.com/quickshare.at" /> */}
      <meta property="twitter:title" content={brandTitle} />
      <meta property="twitter:description" content={brandDescription} />
      <meta property="og:image" content={`${BASE_URL}/assets/quickshare-banner-${locale || defaultLocale}.jpg`} />
    </Head>
  );
};
