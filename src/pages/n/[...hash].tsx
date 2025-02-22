import { BlobViewerV2 } from 'components/atoms/BlobViewerV2';
import { LayoutMain } from 'components/layouts/LayoutMain';
import { FeedbackLink, FeedbackTemplate } from 'components/sections/FeedbackLink';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import requestIp from 'request-ip';
import { getNoteRequest } from 'requests';
import { NoteWithMedia } from 'types/note';
import { defaultLocale, useTrans } from 'utils/i18next';
import PageNotFound from '../404';

interface Props {
  note: NoteWithMedia;
  error?: unknown;
  ip: string;
}

const TextEditor = dynamic(() => import('../../components/gadgets/shared/TextEditor').then((c) => c.default), {
  ssr: false,
});

const ViewNote = ({ note, ip, error }: Props) => {
  const { t, locale } = useTrans();
  if (!note || !note.text || !!error) return <PageNotFound />;

  return (
    <>
      {/* CUSTOM HEAD */}
      <Head>
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.facebook.com/quickshare.my/" />
        <meta property="og:title" content={t('ogTitle', { hash: note.hash })} />
        <meta property="og:description" content={t('ogDescription')} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        {/* <meta property="twitter:url" content="https://twitter.com/quickshare.my" /> */}
        <meta property="twitter:title" content={t('ogTitle', { hash: note.hash })} />
        <meta property="twitter:description" content={t('ogDescription')} />
      </Head>
      <LayoutMain featureTab={false}>
        <h1 className="mx-2 my-4 w-full break-words text-xl font-medium text-gray-700">{note.title}</h1>
        <TextEditor reloadKey={0} defaultValue={note.text} readonly />
        <div className="mt-6">
          {(note.Media || []).length > 0 && <h2 className="mb-2">{t('attachments')}</h2>}
          {note.Media?.map((media, index) => (
            <div className="relative mb-4" key={`blob-${index}`}>
              <BlobViewerV2 media={media} />
            </div>
          ))}
        </div>
        <FeedbackLink template={FeedbackTemplate.NOTE} />
      </LayoutMain>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const locale = context.locale || defaultLocale;
    const { hash, token } = context.query;
    const ip = requestIp.getClientIp(context.req) || '';
    // start server-side get note
    const noteRs = await getNoteRequest(hash ? (hash[0] as string) : '', token as string);

    if (!noteRs.note) throw new Error('Cannot found note');

    return {
      props: {
        note: noteRs.note,
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

export default ViewNote;
