import { Media } from '@prisma/client';
import { BlobViewer } from 'components/atoms/BlobViewer';
import { LayoutMain } from 'components/layouts/LayoutMain';
import { FeedbackLink, FeedbackTemplate } from 'components/sections/FeedbackLink';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import requestIp from 'request-ip';
import { getFileRequest } from 'requests';
import { FileWithData } from 'types/file';
import { defaultLocale, useTrans } from 'utils/i18next';
import PageNotFound from '../404';

interface Props {
  file: FileWithData;
  error?: unknown;
  ip: string;
}

const ViewFile = ({ file, ip, error }: Props) => {
  const { t, locale } = useTrans();
  if (!file || !file.Media || !!error) return <PageNotFound />;

  return (
    <>
      {/* CUSTOM HEAD */}
      <Head>
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.facebook.com/quickshare.at/" />
        <meta property="og:title" content={t('ogTitle', { hash: file.hash })} />
        <meta property="og:description" content={t('ogDescription')} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        {/* <meta property="twitter:url" content="https://twitter.com/quickshare.at" /> */}
        <meta property="twitter:title" content={t('ogTitle', { hash: file.hash })} />
        <meta property="twitter:description" content={t('ogDescription')} />
      </Head>
      <LayoutMain featureTab={false}>
        <h1 className="my-4 w-full break-words text-xl font-medium text-gray-700">{file.Media?.name}</h1>
        <div className="mt-6">
          <h2 className="mb-2">{t('attachments')}</h2>
          <div className="relative mb-4">
            <BlobViewer media={file.Media as Media} />
          </div>
        </div>
        <FeedbackLink template={FeedbackTemplate.UPLOAD} />
      </LayoutMain>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const locale = context.locale || defaultLocale;
    const { hash } = context.query;
    const ip = requestIp.getClientIp(context.req) || '';
    // start server-side get note
    const fileRs = await getFileRequest(hash ? (hash[0] as string) : '');

    if (!fileRs.file) throw new Error('Cannot found note');

    return {
      props: {
        file: fileRs.file,
        ip,
        ...(await serverSideTranslations(locale, ['common'])),
      },
    };
  } catch (error: any) {
    return {
      props: { error: error.message || 'somethingWrong', ...(await serverSideTranslations(defaultLocale, ['common'])) },
    };
  }
}

export default ViewFile;
