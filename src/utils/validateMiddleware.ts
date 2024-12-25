import { keys } from 'ramda';
import { z } from 'zod';
import { HASH_CUSTOM, isProduction } from '../types/constants';
import { Theme, Themes } from '../types/og';
import { isValidUrl } from './text';

export const invalidUrlPatterns: RegExp[] = [/quickshare\.at/, /qsh\.at/, /localhost/];

export const isUrlToShortenValid = (url: string) => {
  let isValid = true;
  if (!url) return false;
  if (url.includes(' ')) return false;
  invalidUrlPatterns.map((pattern) => {
    if (url.match(pattern)) isValid = false;
  });
  return isValid;
};

export const validateUrl = (text: string) => {
  const message = 'errorInvalidUrl';
  if (!isValidUrl(text)) return message;
  if (!isUrlToShortenValid(text)) return message;
  return '';
};

export const validateShortenSchema = z.object({
  query: z.object({
    ip: z.string({
      required_error: 'IP is required',
    }),
    // url: z.nullable(
    //   z
    //     .string({
    //       description: 'Url is required',
    //     })
    //     .refine(isUrlToShortenValid, 'Invalid Url'),
    // ),
    hash: z.nullable(
      z
        .string({
          invalid_type_error: 'Hash must be string',
        })
        .max(HASH_CUSTOM.MaxLength, 'Hash is too long')
        .refine((value) => (!value ? true : HASH_CUSTOM.Regex.test(value || '')), 'Wrong hash format'),
    ),
    customHash: z.nullable(
      z
        .string({
          invalid_type_error: 'Hash must be string',
        })
        .max(HASH_CUSTOM.MaxLength, 'Hash is too long')
        .refine((value) => (!value ? true : HASH_CUSTOM.Regex.test(value || '')), 'Wrong hash format'),
    ),
  }),
});

export const validateUpdateShortenSchema = z.object({
  locale: z.string({
    required_error: 'Locale is required',
  }),
  hash: z
    .string({
      required_error: 'Hash is required',
    })
    .refine((value) => (!value ? true : HASH_CUSTOM.Regex.test(value || '')), 'Wrong hash format'),
  ogTitle: z.optional(
    z.string({
      required_error: 'Title is required',
    }),
  ),
  ogDescription: z.optional(z.string({})),
  ogImgSrc: z.optional(z.string({})),
  ogImgPublicId: z.optional(z.string({})),
  theme: z.optional(
    z.string().refine((t) => {
      return keys(Themes).includes(t as Theme);
    }, 'Invalid theme'),
  ),
  mediaId: z.optional(
    z.number({
      invalid_type_error: 'Must be a number',
    }),
  ),
  // ogImgSrc: z.string({
  //   required_error: 'Description is required',
  // }),
  // ogDomain: z.string({
  //   required_error: 'Description is required',
  // }),
});

export const validatePasswordSchema = z.object({
  hash: z.string({
    required_error: 'Hash is required',
  }),
  email: z.string({
    required_error: 'Email is required',
  }),
  password: z.string({
    required_error: 'Password is required',
  }),
  usePasswordForward: z.boolean({
    required_error: 'usePasswordForward is required',
  }),
});
export type PasswordSchema = z.infer<typeof validatePasswordSchema>;

export const validateOgSchema = z.object({
  query: z.object({
    title: z.string({
      required_error: 'Title is required',
    }),
  }),
});

export const validateVerifyPasswordSchema = z.object({ h: z.string(), p: z.string() });
export type VerifyPasswordSchema = z.infer<typeof validateVerifyPasswordSchema>;

export const validateStatsSchema = z.object({
  query: z.object({
    ...(isProduction
      ? {
          h: z.string({
            required_error: 'Hash is required',
          }),
        }
      : null),
    ip: z.string({
      required_error: 'IP is required',
    }),
  }),
});

export const validateQrSchema = z.object({
  query: z.object({
    text: z
      .string({
        required_error: 'Text is required',
      })
      .min(5)
      .max(100),
  }),
});

export const validateForwardSchema = z.object({
  ip: z.string({
    required_error: 'IP is required',
  }),
  userAgent: z.string({
    required_error: 'Agent is required',
  }),
  fromClientSide: z.boolean({
    required_error: 'From Client Side is required',
  }),
  hash: z.nullable(
    z
      .string({
        required_error: 'Hash is required',
      })
      .max(HASH_CUSTOM.MaxLength, 'Hash is too long')
      .refine((value) => (!value ? true : HASH_CUSTOM.Regex.test(value || '')), 'Wrong hash format'),
  ),
});
export type ForwardSchema = z.infer<typeof validateForwardSchema>;

export const validateMediaSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Url is required',
    }),
  }),
});

export const validateNoteSchema = z.object({
  ip: z.string({
    required_error: 'IP is required',
  }),
  text: z.string({
    description: 'NOTE_REQUIRED',
    invalid_type_error: 'NOTE_REQUIRED',
  }),
  uid: z.nullable(
    z.string({
      invalid_type_error: 'Uid is string',
    }),
  ),
  title: z.nullable(
    z.string({
      invalid_type_error: 'Title is string',
    }),
  ),
  medias: z.array(
    z.object({
      id: z.number(),
      // url: z.nullable(z.string()),
      name: z.string(),
      type: z.nullable(z.string()),
      externalId: z.any(),
      provider: z.any(),
    }),
  ),
  hash: z.nullable(
    z
      .string({
        invalid_type_error: 'Hash is required',
      })
      .refine((value) => (!value ? true : HASH_CUSTOM.Regex.test(value || '')), 'Wrong hash format'),
  ),
});
export type NoteSchema = z.infer<typeof validateNoteSchema>;

export const validateUpdateNoteSchema = z.object({
  uid: z.string({
    required_error: 'Uid is required',
  }),
  text: z.string({
    required_error: 'Text is required',
  }),
  title: z.nullable(
    z.string({
      invalid_type_error: 'Title is string',
    }),
  ),
  medias: z.array(
    z.object({
      id: z.number(),
      // url: z.nullable(z.string()),
      name: z.string(),
      type: z.nullable(z.string()),
      externalId: z.nullable(z.any()),
      provider: z.any(),
    }),
  ),
});
export type UpdateNoteSchema = z.infer<typeof validateUpdateNoteSchema>;

export const validateFileSchema = z.object({
  ip: z.string({
    required_error: 'IP is required',
  }),
  mediaId: z.number({
    required_error: 'Media is required',
  }),
  hash: z.nullable(
    z
      .string({
        invalid_type_error: 'Hash is required',
      })
      .refine((value) => (!value ? true : HASH_CUSTOM.Regex.test(value || '')), 'Wrong hash format'),
  ),
});
export type FileSchema = z.infer<typeof validateFileSchema>;
