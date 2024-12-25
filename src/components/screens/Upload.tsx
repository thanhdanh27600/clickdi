import { AxiosError } from 'axios';
import { Loading } from 'components/atoms/Loading';
import { Attachments } from 'components/gadgets/Attachments';
import { URLShare } from 'components/gadgets/URLShare';
import { ShortenUrlTile } from 'components/gadgets/URLShortener/ShortenUrlTile';
import { FeedbackLink, FeedbackTemplate } from 'components/sections/FeedbackLink';
import { logEvent } from 'firebase/analytics';
import mixpanel from 'mixpanel-browser';
import { useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { createFileRequest } from 'requests';
import shortenSlice from 'store/shortenSlice';
import { BASE_URL, LIMIT_FEATURE_HOUR, LIMIT_FILE_REQUEST } from 'types/constants';
import { EVENTS_STATUS, FIREBASE_ANALYTICS_EVENT, MIXPANEL_EVENT } from 'types/utils';
import { analytics } from 'utils/firebase';
import { linkWithLanguage, useTrans } from 'utils/i18next';
import { QueryKey } from 'utils/requests';
import { validateFileSchema } from 'utils/validateMiddleware';
import { ZodError } from 'zod';

export const Upload = () => {
  const { t, locale } = useTrans();
  const [localError, setLocalError] = useState('');
  const [shortenUrl, setShortenHistory] = shortenSlice((state) => [state.getShortenUrl(), state.setShortenHistory]);

  useEffect(() => {
    setShortenHistory(undefined);
  }, []);

  const requestFile = useMutation(QueryKey.FILE, createFileRequest, {
    onMutate: (variables) => {
      setLocalError('');
    },
    onError: (error, variables, context) => {
      const log = {
        status: EVENTS_STATUS.FAILED,
        errorMessage: error,
        data: variables,
      };
      mixpanel.track(MIXPANEL_EVENT.FILE_CREATE, log);
      logEvent(analytics, FIREBASE_ANALYTICS_EVENT.FILE_CREATE, log);
    },
    onSuccess: (data, variables, context) => {
      if (data.file?.UrlShortenerHistory) {
        setShortenHistory(data.file.UrlShortenerHistory);
        mixpanel.track(MIXPANEL_EVENT.FILE_CREATE, {
          status: EVENTS_STATUS.OK,
          data,
        });
      } else {
        setLocalError(t('somethingWrong'));
        const log = {
          status: EVENTS_STATUS.INTERNAL_ERROR,
          urlRaw: variables,
        };
        mixpanel.track(MIXPANEL_EVENT.FILE_CREATE, log);
        logEvent(analytics, FIREBASE_ANALYTICS_EVENT.FILE_CREATE, log);
      }
    },
  });

  const handleCreateFile = async (mediaId: number) => {
    const data = {
      hash: null,
      uid: null,
      ip: '',
      mediaId,
    };
    const validate = await validateFileSchema.safeParse(data);
    if (!validate.success) {
      setLocalError(t((validate.error as ZodError<any>).issues[0].message as any));
    } else {
      const payload = validate.data;
      requestFile.mutate(payload);
    }
  };
  const mutateError = (requestFile.error as AxiosError)?.message;
  const requestErrorMessage = useMemo(() => {
    let errorMessage;
    switch (mutateError) {
      case 'EXCEEDED_FILE':
        errorMessage = t('reachedFeatureLimit', {
          n: LIMIT_FILE_REQUEST,
          feature: t('uploadFile'),
          time: `${LIMIT_FEATURE_HOUR} ${t('hour')}`,
        });
        break;
      default:
        errorMessage = mutateError;
        break;
    }
    return errorMessage;
  }, [mutateError]);

  const error = localError || requestErrorMessage;
  const loading = requestFile.isLoading;
  const hasData = !loading && !requestFile.isError && shortenUrl;

  return (
    <>
      <h1 className="mb-4 flex gap-1 text-xl md:text-3xl">{t('uploadFile')}</h1>
      <div className={`relative ${loading ? 'opacity-50' : ''}`}>
        {!error && (
          <Attachments
            generateFor="file"
            onChange={(attachment) => {
              const mediaId = attachment?.at(-1)?.id;
              if (!mediaId) return;
              handleCreateFile(mediaId);
            }}
          />
        )}
        {loading && (
          <div className="absolute left-[calc(50%-20px)] top-[calc(50%+30px)]">
            <Loading className="" />
          </div>
        )}
      </div>
      {hasData && (
        <>
          <p>🚀 {t('fileSuccess')}</p>
          <ShortenUrlTile />
          <a
            onClick={(e) => {
              e.preventDefault();
              mixpanel.track(MIXPANEL_EVENT.SHORTEN_MORE, undefined, () => {
                window.location.href = linkWithLanguage(`${BASE_URL}/upload`, locale);
              });
            }}
            href={linkWithLanguage(`${BASE_URL}/upload`, locale)}
            target="_self"
            className="mt-2 cursor-pointer text-right text-cyan-500 underline decoration-1 transition-all hover:decoration-wavy">
            {t('generateFileMore')}
          </a>
          <URLShare />
        </>
      )}
      <p className="mt-4 text-red-400">{error}</p>
      <FeedbackLink template={FeedbackTemplate.UPLOAD} />
    </>
  );
};
