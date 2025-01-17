import React, { useEffect } from 'react';
import { appWithTranslation, useTranslation, UserConfig } from 'next-i18next';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { Roboto, Noto_Sans_Mono } from 'next/font/google';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import renderFavicon from 'components/Favicon';
import { UserProvider } from 'components/User/context';
import { SystemContextProvider } from 'components/System';
import { AppContextProvider } from 'components/App/context';
import Avatar from 'components/Avatar';
import LoadScreen from 'components/LoadScreen';
import DonateButton from 'components/DonateButton';
import { ErrorBoundary } from 'react-error-boundary';
import consentConfig from 'lib/consent.config';
import * as CookieConsent from 'vanilla-cookieconsent';
import nextI18NextConfig from '../next-i18next.config.js';

import 'vanilla-cookieconsent/dist/cookieconsent.css';
import '../styles/global.scss';

const emptyInitialI18NextConfig: UserConfig = {
  i18n: {
    defaultLocale: nextI18NextConfig.i18n.defaultLocale,
    locales: nextI18NextConfig.i18n.locales,
  },
};

const roboto = Roboto({ weight: ['100', '300', '400', '500', '700'], subsets: ['latin'] });
const notoSansMono = Noto_Sans_Mono({ weight: ['700'], subsets: ['latin'] });

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { selectedJob, session } = pageProps;

  useEffect(() => {
    CookieConsent.run(consentConfig);
  }, []);

  useEffect(() => {
    CookieConsent.setLanguage(router.locale!);
  }, [router.locale]);

  function generateTitle() {
    if (selectedJob) {
      return `FFXIV ${selectedJob.Name} (${selectedJob.Abbr}) Hotbar Setup Guide | ${t('Global.title')}`;
    }
    return t('Global.title');
  }

  const displayTitle = generateTitle();

  return (
    <ErrorBoundary
      fallback={(
        <div className="container container-sm panel panel-white mt-xl">
          <div className="system-message fail text-md">
            {t('Error.generic.title')}
          </div>

          <div className="mt-md mb-md text-center pad-lg mb-0">
            <p className="text-xl">{t('Error.generic.body')}</p>

            <a className="button btn-alt btn-inline mb-lg" href="/">
              {t('Error.generic.go_back')}
            </a>

            <div className="text-center">
              <Avatar img="av30.png" />
            </div>
          </div>
        </div>
      )}
    >

      <Head>
        <title>{displayTitle}</title>
        { renderFavicon() }
        { process.env.NEXT_PUBLIC_GOOGLE_ADSENSE && (
          <meta name="google-adsense-account" content={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE} />
        )}

        <meta name="keywords" content="hotbar cross ffxiv endwalker simulator xhb wxhb controller xiv fantasy final tool hotbars simulate planner interface configurations pc ps4 ps5 layouts keymaps keymapping keybinds keybindings" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="icons/favicon-144x144.png" />
        <meta name="msvalidate.01" content="1C49C656556D4EC56E43522F297886AF" />

        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="manifest" href="/manifest.json" />

        {/* <!-- Global site tag (gtag.js) --> */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
      </Head>

      <style jsx global>
        {`
        html {
          font-family: ${roboto.style.fontFamily};
        }
        .tag, .job-abbr {
          font-family: ${notoSansMono.style.fontFamily};
        }
      `}
      </style>

      {/* <!-- Google Tag Manager --> */}
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag() { dataLayer.push(arguments); }
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied'
          });
        `}
      </Script>

      {/* <!-- Google Analytics --> */}
      <Script
        id="google-analytics"
        strategy="afterInteractive"
      >
        {`
          gtag("js", new Date());
          gtag("config", "${process.env.NEXT_PUBLIC_GA_ID}");
        `}
      </Script>

      <main>
        <SystemContextProvider>
          <SessionProvider session={session}>
            <UserProvider>
              <AppContextProvider>
                { process.env.NEXT_PUBLIC_MESSAGE && (
                  <div className="system-message warn">
                    <div className="text-center">
                      { process.env.NEXT_PUBLIC_MESSAGE }
                    </div>
                  </div>
                )}

                <Component {...pageProps} />
                <DonateButton />
                <LoadScreen />
              </AppContextProvider>
            </UserProvider>
          </SessionProvider>
        </SystemContextProvider>
      </main>
    </ErrorBoundary>
  );
}

export default appWithTranslation(App, emptyInitialI18NextConfig);
