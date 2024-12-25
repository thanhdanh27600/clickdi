import { Media } from '@prisma/client';
import { File, Image as ImageIcon } from '@styled-icons/feather';
import clsx from 'clsx';
import { isImage } from 'utils/media';
import { truncateMiddle } from 'utils/text';

export const BlobViewerV2 = ({ media }: { media: Media }) => {
  return (
    <div>
      <a
        download={media.name}
        target="_blank"
        href={`/api/upload?fileName=${media.name}`}
        className="flex cursor-pointer items-center gap-1 text-gray-500 hover:text-gray-900">
        <div
          className={clsx(
            'flex w-full cursor-pointer flex-col items-center rounded-lg border border-gray-300 p-6 py-10 transition-colors hover:bg-gray-100',
          )}>
          <div className="flex items-center gap-2 text-gray-700">
            {isImage(media.type) ? <ImageIcon className="w-6" /> : <File className="w-6" />}
            <div>
              <span className="max-sm:hidden">{truncateMiddle(media?.name || '', 50, 5)}</span>
              <span className="sm:hidden">{truncateMiddle(media?.name || '', 20, 5)}</span>
            </div>
          </div>
          <div className="absolute bottom-2 flex gap-4"></div>
        </div>
      </a>
    </div>
  );
};
