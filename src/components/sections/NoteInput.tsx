import { AxiosError } from 'axios';
import { Button } from 'components/atoms/Button';
import { URLShare } from 'components/gadgets/URLShare';
import { SetPassword } from 'components/screens/URLTracking/SetPassword';
import { FeedbackLink, FeedbackTemplate } from 'components/sections/FeedbackLink';
import { URLAdvancedSetting } from 'components/sections/URLAdvancedSetting';
import { logEvent } from 'firebase/analytics';
import mixpanel from 'mixpanel-browser';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation } from 'react-query';
import { createNoteRequest, updateNoteRequest } from 'requests';
import { useBearStore } from 'store';
import { LIMIT_FEATURE_HOUR, LIMIT_NOTE_REQUEST, tinymce } from 'types/constants';
import { NoteWithMedia } from 'types/note';
import { EVENTS_STATUS, FIREBASE_ANALYTICS_EVENT, MIXPANEL_EVENT } from 'types/utils';
import { analytics } from 'utils/firebase';
import { useTrans } from 'utils/i18next';
import { QueryKey } from 'utils/requests';
import { validateNoteSchema, validateUpdateNoteSchema } from 'utils/validateMiddleware';
import { ZodError } from 'zod';
import { Attachments } from '../gadgets/Attachments';
import { NoteTitleInput } from '../gadgets/Note/NoteTitleInput';
import { NoteUrlTile } from '../gadgets/Note/NoteUrlTile';

const TextEditor = dynamic(() => import('../gadgets/shared/TextEditor').then((c) => c.default), { ssr: false });

export const NoteInput = () => {
  const { t } = useTrans();

  const router = useRouter();
  const { noteSlice, shortenSlice } = useBearStore();
  const [note, setNote] = noteSlice((state) => [state.note, state.setNote]);
  const [setShortenHistory] = shortenSlice((state) => [state.setShortenHistory]);
  const [localError, setLocalError] = useState('');
  const hasNote = note?.id;
  const hasPassword = note?.password !== null;

  useEffect(() => {
    getNote();
  }, []);

  const getNote = () => {
    const query = new URLSearchParams(window.location.search);
    const uid = query.get('uid') || '';
    if (!!uid) {
      requestNote.mutate({ hash: null, ip: '', text: '', title: '', uid, medias: [] });
    }
  };

  const requestNote = useMutation(QueryKey.NOTE, createNoteRequest, {
    onMutate: (variables) => {
      setLocalError('');
    },
    onError: (error, variables, context) => {
      const log = {
        status: EVENTS_STATUS.FAILED,
        errorMessage: error,
        data: variables,
      };
      mixpanel.track(MIXPANEL_EVENT.NOTE_CREATE, log);
      logEvent(analytics, FIREBASE_ANALYTICS_EVENT.NOTE_CREATE, log);
    },
    onSuccess: (data, variables, context) => {
      if (data.note) {
        setNote(data.note);
        if (data.note.UrlShortenerHistory) setShortenHistory(data.note.UrlShortenerHistory);
        mixpanel.track(MIXPANEL_EVENT.NOTE_CREATE, {
          status: EVENTS_STATUS.OK,
          data,
        });
        const queryParams = { ...router.query, ...{ uid: data.note.uid } };
        router.push({ pathname: router.pathname, query: queryParams });
      } else {
        setLocalError(t('somethingWrong'));
        const log = {
          status: EVENTS_STATUS.INTERNAL_ERROR,
          urlRaw: variables,
        };
        mixpanel.track(MIXPANEL_EVENT.NOTE_CREATE, log);
        logEvent(analytics, FIREBASE_ANALYTICS_EVENT.NOTE_CREATE, log);
      }
    },
  });

  const requestUpdateNote = useMutation(QueryKey.SHORTEN_UPDATE, updateNoteRequest, {
    onMutate: (variables) => {
      setLocalError('');
    },
    onError: (error, variables, context) => {
      const log = {
        status: EVENTS_STATUS.FAILED,
        errorMessage: error,
        data: variables,
      };
      mixpanel.track(MIXPANEL_EVENT.NOTE_UPDATE, log);
      logEvent(analytics, FIREBASE_ANALYTICS_EVENT.NOTE_UPDATE, log);
    },
    onSuccess: (data, variables, context) => {
      if (data.note) {
        setNote(data.note);
        mixpanel.track(MIXPANEL_EVENT.NOTE_UPDATE, {
          status: EVENTS_STATUS.OK,
          data,
        });
        toast.success(t('updated'));
      } else {
        setLocalError(t('somethingWrong'));
        const log = {
          status: EVENTS_STATUS.INTERNAL_ERROR,
          urlRaw: variables,
        };
        mixpanel.track(MIXPANEL_EVENT.SHORTEN, log);
        logEvent(analytics, FIREBASE_ANALYTICS_EVENT.SHORTEN, log);
      }
    },
  });

  const handleUpdateNote = async (note: NoteWithMedia) => {
    const medias = note?.Media?.filter((m) => m.id > 0) || [];
    const data = {
      uid: note.uid,
      title: note.title,
      text: tinymce.activeEditor.getContent() || null,
      medias,
    };
    const validate = await validateUpdateNoteSchema.safeParse(data);
    if (!validate.success) {
      console.log('validate.error', validate.error);
      setLocalError(t((validate.error as ZodError<any>).issues[0].message as any));
    } else {
      const payload = validate.data;
      requestUpdateNote.mutate(payload);
    }
    return;
  };

  const handleCreateNote = async () => {
    const medias = note?.Media?.filter((m) => m.id > 0) || [];
    const data = {
      hash: null,
      uid: null,
      title: note?.title || null,
      text: tinymce.activeEditor.getContent() || null,
      ip: '',
      medias,
    };
    const validate = await validateNoteSchema.safeParse(data);
    if (!validate.success) {
      setLocalError(t((validate.error as ZodError<any>).issues[0].message as any));
    } else {
      const payload = validate.data;
      requestNote.mutate(payload);
    }
  };

  const onSubmit = async () => {
    setLocalError('');
    if (hasNote) return handleUpdateNote(note as NoteWithMedia);
    return handleCreateNote();
  };

  const loading = requestNote.isLoading || requestUpdateNote.isLoading;
  const mutateError = ((requestNote.error || requestUpdateNote.error) as AxiosError)?.message;
  const requestErrorMessage =
    mutateError === 'EXCEEDED_NOTE'
      ? t('reachedFeatureLimit', {
          n: LIMIT_NOTE_REQUEST,
          feature: t('note'),
          time: `${LIMIT_FEATURE_HOUR} ${t('hour')}`,
        })
      : mutateError;
  const error = localError || requestErrorMessage;

  return (
    <div>
      {hasNote && (
        <div className="mb-4">
          <NoteUrlTile />
          {!hasPassword && (
            <div className="mt-4 flex w-full justify-end">
              <SetPassword hash={note?.UrlShortenerHistory?.hash || ''} onSetPasswordSuccess={getNote} />
            </div>
          )}
          <URLShare />
        </div>
      )}
      <NoteTitleInput />
      <TextEditor reloadKey={(hasNote || 0) + 1} defaultValue={note?.text} />
      <h2 className="mt-4 text-sm text-gray-700">{t('attachmentsCreate')}</h2>
      <Attachments
        key={(hasNote || 0) + 2}
        generateFor="note"
        defaultValues={hasNote ? note?.Media : [{ id: -1 } as any]}
        onChange={(attachments) => {
          console.log('attachments', attachments);
          setNote({ Media: attachments });
        }}
      />
      {error && <p className="mt-4 text-red-400">{error}</p>}
      <Button
        text={hasNote ? t('save') : t('publish')}
        onClick={onSubmit}
        loading={loading}
        className="mx-auto mt-4 flex w-fit min-w-[5rem] justify-center"
        animation
      />
      {hasNote && <URLAdvancedSetting />}
      <FeedbackLink template={FeedbackTemplate.NOTE} />
    </div>
  );
};
