import { toast } from 'react-hot-toast';

export function generateRandomString(numChars: number): string {
  const possibleChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < numChars; i++) {
    randomString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomString;
}

// export function testGenerateRandomString(numChars: number): string {
//   const possibleChars = '123';
//   let randomString = '';
//   for (let i = 0; i < numChars; i++) {
//     randomString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
//   }
//   return randomString;
// }

export const truncate = (text: string, l = 30) => {
  return text.length <= l ? text : text.substring(0, l) + '...';
};

export const truncateMiddle = (text: string, length = 30, r = 5) => {
  return text.length <= length ? text : text.substring(0, length - r) + '...' + text.slice(-r);
};

export const urlRegex = /(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)/i;
export const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i;

export const isValidUrl = (urlString: string) => {
  return !!urlRegex.test(urlString);
};

export const capitalize = (string?: string) => {
  if (!string) return string;
  return string[0].toUpperCase() + string.slice(1);
};

export const share = (shareData: ShareData, t: any) => {
  if (navigator.share) {
    navigator
      .share(shareData)
      .then(() => {
        // console.log('Shared successfully');
      })
      .catch((error) => {
        toast.error(t('errorSharing'));
        console.log('Error sharing:', error);
      });
  } else {
    toast.error(t('errorSharing'));
    console.log('Web Share API is not supported in this browser');
  }
};

export function generateFileName(originalFileName?: string): string {
  if (!originalFileName) return '';
  const hash = generateRandomString(8);
  const fileExtension = originalFileName.includes('.') ? `.${originalFileName.split('.').pop()}` : '';
  const fileNameWithoutExtension = originalFileName.replace(fileExtension, '');
  return `${fileNameWithoutExtension}_${hash}${fileExtension}`;
}
