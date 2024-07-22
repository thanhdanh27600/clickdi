import { useEffect, useId } from 'react';
import { tinymce } from 'types/constants';
import { useTrans } from 'utils/i18next';

const plugins = [
  'advlist',
  'autosave',
  'autolink',
  'lists',
  'link',
  'image',
  'charmap',
  'preview',
  'anchor',
  'searchreplace',
  'visualblocks',
  'code',
  'fullscreen',
  'insertdatetime',
  'media',
  'table',
  'wordcount',
];

const toolbar =
  'bold italic underline strikethrough forecolor backcolor link image align fontsize | bullist numlist outdent indent | ' +
  'undo redo | blocks restoredraft removeformat';

const TextEditor = ({ defaultValue, readonly }: { defaultValue?: string; readonly?: boolean }) => {
  const { t, locale } = useTrans();
  const id = useId().replaceAll(':', '-');
  useEffect(() => {
    if (!tinymce) return;
    tinymce.init({
      selector: `#${id}`,
      block_unsupported_drop: true,
      paste_block_drop: true,
      paste_data_images: true,
      autosave_restore_when_empty: true,
      height: 500,
      fontsize_formats: '8pt 9pt 10pt 11pt 12pt 14pt 18pt 24pt 30pt 36pt 48pt 60pt 72pt 96pt',
      plugins,
      toolbar: readonly ? '' : toolbar,
      menubar: !readonly,
      readonly,
      language: locale,
      content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:12pt }',
    });
  }, [tinymce]);

  return (
    <div className={`${readonly ? 'tox-readonly' : ''}`}>
      <textarea
        className="h-[300px] w-full md:h-[500px]"
        id={id}
        defaultValue={defaultValue}
        placeholder={t('notePlaceholder')}></textarea>
    </div>
  );
};
TextEditor.displayName = 'TextEditor';

export default TextEditor;
