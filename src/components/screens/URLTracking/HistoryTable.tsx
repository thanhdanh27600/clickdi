import { Calendar, Copy, Globe, MapPin, Search, Sliders, UserCheck, UserX } from '@styled-icons/feather';
import clsx from 'clsx';
import { Button } from 'components/atoms/Button';
import { Popover } from 'components/atoms/Popover';
import isbot from 'isbot';
import mixpanel from 'mixpanel-browser';
import { Dispatch, SetStateAction, useState } from 'react';
import toast from 'react-hot-toast';
import { UrlHistoryWithMeta } from 'types/stats';
import { MIXPANEL_EVENT } from 'types/utils';
import { UAParser } from 'ua-parser-js';
import { getCountryName } from 'utils/country';
import date, { DATE_FULL_FORMAT } from 'utils/date';
import { useTrans } from 'utils/i18next';
import { PAGE_SIZE } from 'utils/requests';
import { capitalize, truncateMiddle } from 'utils/text';

interface Props {
  history?: UrlHistoryWithMeta;
  noBot: boolean;
  setNoBot: Dispatch<SetStateAction<boolean>>;
  refetch: any;
  statsMore: any;
  getMoreUA: any;
}

export const HistoryTable = (props: Props) => {
  const { history, noBot, setNoBot, statsMore, getMoreUA, refetch } = props;
  const { t, locale } = useTrans();

  const [qc, setQc] = useState<number | undefined>(0);

  const handleClickBot = () => {
    setNoBot((state: any) => !state);
    setTimeout(() => {
      refetch();
    });
  };

  const onLoadMore = () => {
    setQc((_) => {
      const _qc = history?.UrlForwardMeta?.at(-1)?.id;
      if (!statsMore.isLoading) {
        statsMore.mutate({ hash: history?.hash, noBot, queryCursor: _qc });
      }
      return _qc;
    });
  };

  const hasData = !!history?.UrlForwardMeta?.length;
  const hasMore = hasData && (history?.UrlForwardMeta?.length || 0) % PAGE_SIZE === 0;

  return (
    <div className="relative shadow-md">
      <div className="h-[300px] overflow-auto border border-gray-200 sm:rounded-lg lg:h-[400px] 2xl:h-[600px]">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-6 py-3">
                <span className="">{t('country')}</span>
              </th>
              <th className="px-6 py-3">
                <span className="">{t('userAgent')}</span>
              </th>
              <th className="px-6 py-3">
                <span className="">{`IP`}</span>
              </th>
              <th className="px-6 py-3">
                <span className="">{t('date')}</span>
              </th>
              <th className="px-6 py-3">
                <div className="flex items-center justify-end gap-2">
                  <span className="float-right block w-max">{t('clickedByHuman')}</span>
                  <button>
                    <Popover
                      id="tracking-filter"
                      closed={noBot}
                      Classname={{
                        Content: 'translate-y-[-20%] translate-x-[-110%]',
                        Button: 'text-gray-500 hover:text-gray-900 transition-colors',
                      }}
                      Button={<Sliders className="w-4" />}
                      Content={
                        <div className="w-max">
                          <ul className="flex flex-col items-start gap-2">
                            <li
                              className="flex w-full items-center gap-2 p-4 hover:rounded-lg hover:bg-gray-200"
                              onClick={handleClickBot}>
                              {!noBot ? (
                                <UserX className={clsx('h-4 w-4 stroke-2 text-red-500')} />
                              ) : (
                                <UserCheck className={clsx('h-4 w-4 stroke-2 text-green-500')} />
                              )}
                              <span className="ml-2 max-sm:hidden">{t('filterBot')}</span>
                            </li>
                          </ul>
                        </div>
                      }
                    />
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {history?.UrlForwardMeta?.map((m, j) => {
              const UA = m.userAgent ? new UAParser(m.userAgent) : undefined;
              const ref = m.userAgent ? isbot.find(m.userAgent) : undefined;
              return (
                <tr key={`meta-${j}`} className="border-b bg-white">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    <MapPin className="mr-1 w-4" />
                    {m.countryCode ? getCountryName(m.countryCode, locale) : t('unknown')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    {UA ? (
                      <div>
                        <p>
                          Device: {UA?.getDevice().vendor} {UA?.getDevice().model}{' '}
                          {capitalize(UA?.getDevice().type) || t('unknown')}
                        </p>
                        <p>OS: {UA?.getOS().name || t('unknown')}</p>
                        <p>Browser: {UA?.getBrowser().name || t('unknown')}</p>
                        {m.userAgent && (
                          <p
                            data-te-toggle="modal"
                            data-te-target="#parsedUA"
                            className="cursor-pointer text-gray-500 underline hover:text-cyan-500"
                            onClick={() => {
                              getMoreUA.mutate(m.userAgent!);
                            }}>
                            {t('advancedView')} <Globe className="mb-2 w-3" />
                          </p>
                        )}

                        <p
                          data-clipboard-text={m.userAgent || t('unknown')}
                          className="btn-copy cursor-pointer text-gray-500 hover:text-cyan-500 hover:underline"
                          onClick={() => {
                            mixpanel.track(MIXPANEL_EVENT.USER_AGENT_COPY, {
                              data: m,
                            });
                            toast.success('Copied');
                          }}>
                          {t('copyRawInfo')} <Copy className="mb-2 w-3" />
                        </p>
                      </div>
                    ) : (
                      t('unknown')
                    )}
                  </td>
                  <td className="cursor-pointer whitespace-nowrap px-6 py-4 font-medium text-gray-900 hover:text-cyan-500 hover:underline">
                    <a
                      href={`https://www.ipqualityscore.com/free-ip-lookup-proxy-vpn-test/lookup/${m.ip}`}
                      target="_blank">
                      {m.ip || t('unknown')}
                      <Search className="relative w-3 -translate-y-2 translate-x-[0.8px]" />
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    <Calendar className="mr-1 w-4" />
                    {m.updatedAt ? date(m.updatedAt).locale(locale).format(DATE_FULL_FORMAT) : t('unknown')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-gray-900">
                    {m.fromClientSide ? (
                      <UserCheck className="mr-1 w-6 stroke-2 text-green-500" />
                    ) : (
                      <>
                        <UserX className="mr-1 w-6 stroke-2 text-red-500" />
                        {ref && (
                          <div className="max-w-xs" title={ref}>
                            <p className="line-clamp-1 block text-ellipsis whitespace-nowrap">{truncateMiddle(ref)}</p>
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {hasMore && (
              <tr>
                <td colSpan={5}>
                  <div className="flex justify-center py-4">
                    <Button text={t('loadMore')} onClick={onLoadMore} loading={statsMore.isLoading} />
                  </div>
                </td>
              </tr>
            )}
            {!hasData && (
              <tr>
                <td className="h-[200px] text-center text-base" colSpan={5}>
                  {t('noData')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
