import { Media } from '@prisma/client';
import { CheckCircle, Download, File, Image as ImageIcon, PlusCircle, Trash } from '@styled-icons/feather';
import axios from 'axios';
import clsx from 'clsx';
import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { API } from 'requests/api';
import { LIMIT_FILE_UPLOAD } from 'types/constants';
import { useTrans } from 'utils/i18next';
import { UploadProvider, isImage } from 'utils/media';
import { truncateMiddle } from 'utils/text';

interface Props {
  name?: string;
  selectedMedia?: Media;
}

export const BlobUploaderV2 = ({ name = '', selectedMedia }: Props) => {
  const { t } = useTrans();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const { setValue, watch } = useFormContext();

  const _name = watch(`${name}.type`);
  const _type = watch(`${name}.type`);
  const fileName = useMemo(() => _name || selectedMedia?.name, [_name, selectedMedia]);
  const fileType = useMemo(() => _type || selectedMedia?.type || null, [_type, selectedMedia]);
  const hasSelected = (selectedMedia?.id || -1) > 0;
  const hasFile = !!hasSelected || !!selectedFile;

  useEffect(() => {
    if (!!selectedFile) {
      handleFileUpload();
    }
  }, [selectedFile]);

  const handleDelete = (event?: any) => {
    event?.stopPropagation();
    event?.preventDefault();
    if (uploading) return;
    setValue(`${name}.id`, -1);
    setSelectedFile(null);
    setError('');
  };

  const handleFile = (file: File) => {
    if (file.size > LIMIT_FILE_UPLOAD) {
      return setError('File size cannot be bigger than 20MB.');
    }
    setSelectedFile(file);
  };

  const handleFileDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (!!selectedFile) return;
    event.preventDefault();
    if (!!event.dataTransfer.files?.length) {
      handleFile(event.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!!selectedFile) return;
    if (uploading) return;
    setError('');
    if (!!event.target.files?.length) {
      handleFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    try {
      setUploading(true);
      // const uploadUrl = await getPresignedUrl();
      // if (!uploadUrl) {
      //   return setError('Please get the pre-signed URL first');
      // }
      const formData = new FormData();
      formData.append('file', selectedFile as Blob);
      const rs = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent?.total || 1));
          console.log('percentCompleted', percentCompleted);
        },
      });
      if (!rs?.data?.filename) {
        throw new Error('No filename returned');
      }
      const imageRs = await API.post('/api/i', {
        // url: uploadUrl,
        name: rs.data.filename,
        type: fileType,
        provider: UploadProvider.LOCAL,
      });
      setValue(`${name}.name`, imageRs.data.name);
      setValue(`${name}.provider`, UploadProvider.LOCAL);
      setValue(`${name}.type`, imageRs.data.type);
      setValue(`${name}.id`, imageRs.data.id);
      setUploading(false);
    } catch (error) {
      setError('An error occurred while uploading file.');
      console.error(error);
    }
  };

  const FileProvider = ({ children }: { children: ReactElement }) => {
    if (fileName)
      return (
        <a download={fileName} referrerPolicy="same-origin" target="_self" href={'/api/upload?fileName=' + fileName}>
          {children}
        </a>
      );
    return (
      <div className="flex w-full" onDragOver={(e) => e.preventDefault()} onDrop={handleFileDrop}>
        {children}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <FileProvider>
        <label
          className={clsx(
            'flex w-full flex-col items-center rounded-lg border border-gray-300 p-10 py-24 transition-colors',
            !hasFile && 'pb-24 hover:bg-gray-100',
            hasFile && 'pb-28',
            uploading && 'cursor-not-allowed opacity-30',
            !uploading && !selectedFile && ' cursor-pointer',
          )}>
          {!hasFile && (
            <input
              key={fileName}
              disabled={uploading || hasFile}
              className="hidden"
              type="file"
              onChange={handleFileChange}
            />
          )}
          <div className="flex items-center gap-2 text-gray-700">
            {!hasFile ? (
              <PlusCircle className="w-6" />
            ) : !isImage(fileType) ? (
              <File className="w-6" />
            ) : (
              <ImageIcon className="w-6" />
            )}
            {!!hasFile && fileName ? (
              <div>
                <span className="max-sm:hidden">{truncateMiddle(fileName, 50, 5)}</span>
                <span className="sm:hidden">{truncateMiddle(fileName, 20, 5)}</span>
                <CheckCircle className="mb-1 ml-2 w-4 stroke-2 text-green-500" />
              </div>
            ) : (
              <p className="max-sm:text-sm">{t('selectOrDropFiles')}</p>
            )}
          </div>
          {hasFile && (
            <div className="absolute bottom-2 flex gap-4">
              <button className="flex cursor-pointer items-center gap-1 text-gray-700">
                <Download className="h-4 w-4 " />
                <p className="text-sm">Download</p>
              </button>
              <div className="flex cursor-pointer items-center gap-1 text-gray-700" onClick={handleDelete}>
                <Trash className="h-4 w-4 " />
                <p className="text-sm">Delete</p>
              </div>
            </div>
          )}
        </label>
      </FileProvider>
      {error && <p className="text-red-400">{error}</p>}
    </div>
  );
};
