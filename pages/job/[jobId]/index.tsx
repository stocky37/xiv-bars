import React, { useEffect } from 'react';
import db, { serializeDates } from 'lib/db';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { translateData } from 'lib/utils/i18n.mjs';
import { useRouter } from 'next/router';
import { useAppDispatch } from 'components/App/context';
import { appActions } from 'components/App/actions';
import Head from 'next/head';
import GlobalHeader from 'components/GlobalHeader';
import Jobs from 'apiData/Jobs.json';
import SelectedJob from 'components/JobSelect/SelectedJob';
import LayoutsList from 'components/LayoutsList';
import Lore from 'components/Lore';
import Footer from 'components/Footer';

import type { ClassJobProps } from 'types/ClassJob';
import type { LayoutViewProps } from 'types/Layout';
import type { GetServerSideProps } from 'next';

import styles from './index.module.scss';

interface Props {
  selectedJob: ClassJobProps,
  layouts: LayoutViewProps[]
}

export default function Layouts({ selectedJob, layouts }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const appDispatch = useAppDispatch();
  const jobName = translateData('Name', selectedJob, router.locale);
  const jobAbbr = translateData('Abbreviation', selectedJob, router.locale);

  useEffect(() => {
    appDispatch({ type: appActions.VIEW_LIST });
    const items = ['l', 's1', 's', 'xhb', 'wxhb', 'exhb'];
    const keys = Object.keys(router.query);

    if (keys.some((i) => items.includes(i))) {
      router.push({
        pathname: `/job/${selectedJob.Abbr}/new`,
        query: router.query
      });
    }
  }, []);

  return (
    <>
      { selectedJob?.Name && selectedJob?.Abbr && (
        <Head>
          <title>
            {t('Pages.Job.index_title', { jobName, jobAbbr })}
          </title>Lore
          <meta
            name="description"
            content={t('Pages.Job.index_description', { jobName })}
          />
        </Head>
      )}

      <GlobalHeader selectedJob={selectedJob} />

      <div
        className="container"
        itemScope
        itemProp="itemListElement"
        itemType="https://schema.org/ItemList"
      >
        { ['PCT', 'VPR'].includes(selectedJob.Abbr) && (
          <p className="system-message warn">
            The <b>Viper (VPR)</b> and <b>Pictomancer (PCT)</b> Class/Jobs are now available in a preview/development state. Layouts created prior to the release of patch 7.0 may break as Actions and other features associated with those Jobs are subject to change.
          </p>
        )}

        <div className={styles.header}>
          <div className={styles.headerDesc}>
            <SelectedJob
              job={selectedJob}
              className={styles.title}
            />

            <p className="text-xl" itemProp="description">
              { t('Pages.Job.index_description', { jobName: selectedJob.Name }) }
            </p>
          </div>

          { selectedJob?.Description && (
            <Lore description={selectedJob.Description} />
          ) }
        </div>

        { layouts.length > 0
          ? <LayoutsList layouts={layouts} />
          : (
            <>
              <h2>{t('Pages.Job.no_layouts', { jobName })}</h2>
              <a
                className="button btn-inline btn-primary"
                href={`/job/${selectedJob.Abbr}/new`}
              >
                {t('Pages.Job.create_layout')}
              </a>
            </>
          )}
      </div>

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const jobId = context.params?.jobId as string;
  const selectedJob = Jobs.find((job) => job.Abbr === jobId);

  if (!selectedJob || selectedJob.Disabled) return { notFound: true };

  // Request Layouts
  const layouts = await db.layout.findMany({
    where: {
      jobId: selectedJob?.Abbr,
      description: { not: '' },
      published: true
    },
    include: {
      user: {
        select: { name: true, id: true }
      },
      _count: {
        select: { hearts: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return {
    props: {
      ...(await serverSideTranslations(context.locale as string, ['common'])),
      selectedJob,
      layouts: serializeDates(layouts)
    }
  };
};
