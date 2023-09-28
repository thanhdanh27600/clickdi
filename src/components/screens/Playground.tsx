import { CustomLinkForm } from 'components/gadgets/URLShortener/CustomLinkForm';
import { SignInToCustomLink } from 'components/gadgets/URLShortener/SignInToCustomLink';

export const Playground = () => {
  // if (isProduction) return null;

  return (
    <>
      <h1 className="my-8 text-xl font-bold">Playground</h1>
      <CustomLinkForm />
      <SignInToCustomLink />

      {/* <BlobUploader /> */}
      {/* <Sidebar /> */}
      {/* <TextEditor /> */}
      {/* <button onClick={log}>Log editor content</button> */}
    </>
  );
};
