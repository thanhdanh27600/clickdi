import { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';
import { GOOGLE_ADS_CLIENT_ID, cdn, isShortDomain } from 'types/constants';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;500;700&display=swap"
          rel="stylesheet"
        />

        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />

        <meta charSet="utf-8" />
        <meta httpEquiv="content-language" content="en-us" />
        <meta httpEquiv="content-language" content="vi-vn" />
        {!isShortDomain && (
          <>
            <meta
              name="URL shortener, risk-free and cost-free as always"
              content="Shorten and track all clicks, convenient, user-friendly and always free."
            />
            <meta
              name="Rút gọn link, hoàn toàn miễn phí"
              content="Rút gọn và theo dõi tất cả lượt click, trực quan, dễ sử dụng và luôn luôn miễn phí"
            />
          </>
        )}

        <link rel="stylesheet" href={cdn(`/lib/styles.min.css`)} />
        <Script strategy="beforeInteractive" src="https://cdn.quickshare.my/tinymce/tinymce.min.js"></Script>
        <Script
          strategy="beforeInteractive"
          src="https://cdn.jsdelivr.net/npm/clipboard@2.0.11/dist/clipboard.min.js"></Script>

        <Script strategy="beforeInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-LE8KPBMBMD" />
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADS_CLIENT_ID}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <Script src={cdn(`/lib/styles.min.js`)} id="external-styles" strategy="beforeInteractive" />
      </body>
    </Html>
  );
}
