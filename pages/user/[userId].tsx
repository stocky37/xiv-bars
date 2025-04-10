import { useEffect } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import db, { serializeDates, layoutsQuery } from 'lib/db';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import { AppContextProvider } from 'components/App/context';
import { useUserState, useUserDispatch } from 'components/User/context';
import { userActions } from 'components/User/actions';
import GlobalHeader from 'components/GlobalHeader';
import LayoutsList from 'components/LayoutsList';
import Footer from 'components/Footer';
import Icon, { Icons } from 'components/Icon';
import ProfileImage from 'components/User/ProfileImage';
import renderMeta from 'components/Meta';
import dynamic from 'next/dynamic';
import { maxLayouts } from 'lib/user';

import type { GetServerSideProps } from 'next';
import type { UserProps } from 'types/User';
import type { LayoutViewProps } from 'types/Layout';

import styles from './userId.module.scss';

const AdUnit = dynamic(() => import('components/AdUnit'), { ssr: false });

interface UserViewProps {
  user: UserProps
}

export default function User({ user }:UserViewProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const isCurrentUser = user.id === session?.user.id;
  const userDispatch = useUserDispatch();
  const { layouts } = useUserState();

  useEffect(() => {
    userDispatch({
      type: userActions.UPDATE_LAYOUTS,
      payload: { layouts: user.layouts }
    });
  }, [user]);

  if (!user) return null;

  return (
    <>
      <Head>
        <title>
          {`${t('Pages.User.title', { userName: user.name })} | XIVBARS`}
        </title>

        <meta
          name="description"
          content={t('Pages.User.description', { userName: user.name })}
        />

        { user.layouts.length < 1 && <meta name="robots" content="noindex" />}

        { renderMeta({
          title: t('Pages.User.title', { userName: user.name }),
          description: t('Pages.User.description', { userName: user.name }),
          canonicalPath: `/user/${user.name}`
        })}
      </Head>

      <AppContextProvider>
        <GlobalHeader />
      </AppContextProvider>

      <div itemType="https://schema.org/ProfilePage" itemScope>
        <meta itemProp="dateCreated" content={user.createdAt} />
        <meta itemProp="dateModified" content={user.updatedAt} />

        <div
          className="container"
          itemProp="mainEntity"
          itemType="https://schema.org/Person"
          itemScope
        >
          <div className={`${styles.hgroup} row`}>
            <div className="main">
              <h1 className={`mt-md ${styles.profile}`}>
                <meta itemProp="identifier" content={user.id.toString()} />

                <ProfileImage
                  src={user.image}
                  title={user.name}
                  className={styles.profileImage}
                />

                <span
                  className={styles.profileName}
                  itemProp="alternateName"
                >
                  {user.name}
                </span>
              </h1>

              { isCurrentUser && (
                <div className={styles.layoutsCount}>
                  {layouts?.length ? layouts.length : '-'}/{maxLayouts}
                  <Icon id={Icons.LAYOUTS} alt="Layouts" type="white" />
                </div>
              )}
            </div>

            <div className="sidebar">
              <AdUnit format="largeRect" id="ad-UserPage" />
            </div>
          </div>
        </div>

        <div className="container">
          { (!layouts || typeof layouts === 'number') ? (
            <h2 id="jobSelectTitle">
              {t('Pages.User.no_layouts')}
            </h2>
          ) : (
            <LayoutsList
              id="userLayouts"
              layouts={layouts}
              filterable
            />
          )}
        </div>

        { isCurrentUser && user.hearts && user.hearts.length > 0 && (
          <div className="container">
            <h2>{t('Pages.User.saved_layouts')}</h2>
            <LayoutsList
              id="heartedLayouts"
              layouts={user.hearts}
            />
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  const userId = context.params?.userId as string;
  const isOwner = session?.user.id.toString() === userId;
  const id = parseInt(userId, 10);
  const userQuery = id ? { id } : { name: userId };

  const userLayoutsQuery = isOwner
    ? layoutsQuery
    : { ...layoutsQuery, where: { published: true } };

  const user = await db.user.findFirst({
    where: userQuery,
    select: {
      name: true,
      id: true,
      image: true,
      layouts: userLayoutsQuery,
      createdAt: true,
      updatedAt: true
    }
  });

  const heartedLayouts = isOwner ? await db.layout.findMany({
    where: {
      published: true,
      hearts: {
        some: { userId: id }
      }
    },
    include: {
      user: {
        select: { id: true, name: true, image: true }
      }
    }
  }) : [];

  if (!user) return { notFound: true };

  const userLayouts = user.layouts.map((layout:LayoutViewProps) => layout);

  return {
    props: {
      ...(await serverSideTranslations(context.locale as string, ['common'])),
      user: {
        name: user.name,
        id: user.id,
        image: user.image,
        hearts: serializeDates(heartedLayouts),
        layouts: serializeDates(userLayouts),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }
    }
  };
};
