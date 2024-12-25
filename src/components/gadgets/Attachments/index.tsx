import { Media } from '@prisma/client';
import { Plus, Trash2 } from '@styled-icons/feather';
import { BlobUploaderV2 } from 'components/atoms/BlobUploaderV2';
import { useEffect } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useTrans } from 'utils/i18next';

const MAX_ATTACHMENTS = 3;

type BlobForm = {
  blobs: Media[];
};

export const Attachments = ({
  maxAttachments = MAX_ATTACHMENTS,
  defaultValues,
  onChange,
  generateFor,
}: {
  maxAttachments?: number;
  defaultValues?: Media[] | null;
  onChange: (attatchments: Media[]) => void;
  generateFor: 'note' | 'file';
}) => {
  const { t } = useTrans();
  const methods = useForm<BlobForm>({ defaultValues: { blobs: defaultValues || [{ id: -1 } as any] } });

  const { control, watch, reset } = methods;
  const attachments = watch('blobs');
  const uploadedAttachments = attachments?.filter((att) => att.id > 0);

  useEffect(() => {
    if (onChange) onChange(uploadedAttachments);
  }, [uploadedAttachments?.length]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'blobs',
  });

  const onDelete = () => {
    remove();
  };

  const onAdd = () => {
    append({ id: -1 } as any);
  };

  return (
    <FormProvider {...methods}>
      {fields.map((field, index) => {
        return (
          <div className="relative my-2 md:my-4" key={`blob-${index}`}>
            {/* <BlobUploader selectedMedia={attachments[index]} name={`blobs.${index}`} /> */}
            <BlobUploaderV2 selectedMedia={attachments[index]} name={`blobs.${index}`} />
          </div>
        );
      })}
      {generateFor === 'note' && fields.length > 0 && (
        <div
          className="mt-2 flex w-fit cursor-pointer items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
          onClick={onDelete}>
          <Trash2 onClick={onDelete} className="w-4 cursor-pointer" />
          {t('resetFiles')}
        </div>
      )}
      {generateFor === 'note' && fields.length < maxAttachments && (
        <div
          className="mt-2 flex w-fit cursor-pointer items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
          onClick={onAdd}>
          <Plus className="w-4 cursor-pointer" />
          {t('addAttachment')}
        </div>
      )}
    </FormProvider>
  );
};
