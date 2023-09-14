import { BrandText } from 'components/atoms/BrandIcon';
import { Sidebar } from 'components/atoms/Sidebar';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BASE_URL } from 'types/constants';
import { linkWithLanguage, useTrans } from 'utils/i18next';

export const Header = () => {
  const { t, locale } = useTrans();
  const router = useRouter();

  return (
    <div className="mx-auto flex items-center justify-between p-4 sm:w-full md:mx-auto md:max-w-7xl">
      <Link href="/">
        <div className="flex w-fit cursor-pointer flex-col items-center gap-2">
          <BrandText width={148} />
        </div>
      </Link>
      <div className="sm:hidden">
        <Sidebar />
      </div>
      <div className="hidden items-center gap-4 sm:flex">
        {router.pathname !== '/' && (
          <Link
            href="/"
            className="text-grey-900 text-md h-fit font-semibold decoration-1 hover:text-cyan-500 hover:underline">
            {t('urlShortener')}
          </Link>
        )}
        {router.pathname !== '/tracking' && (
          <Link
            href="/tracking"
            className="text-grey-900 text-md h-fit font-semibold decoration-1 hover:text-cyan-500 hover:underline">
            {t('manageLink')}
          </Link>
        )}
        {router.pathname !== '/note' && (
          <Link
            href="/note"
            onClick={() => {
              location.href = linkWithLanguage(`${BASE_URL}/note`, locale);
            }}
            className="text-grey-900 text-md h-fit font-semibold decoration-1 hover:text-cyan-500 hover:underline">
            {t('noteEditor')}
          </Link>
        )}
      </div>
    </div>
  );
};
