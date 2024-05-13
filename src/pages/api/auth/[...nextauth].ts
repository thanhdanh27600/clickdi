import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth, { AuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import prisma from '../../../services/db/prisma';
import { SERVER_AUTH } from '../../../types/constants';
import { sendVerificationRequest } from '../../../utils/emailAuth';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: SERVER_AUTH,
  providers: [
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID!,
    //   clientSecret: process.env.GITHUB_SECRET!,
    // }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      maxAge: 15 * 60, // 15 minutes,
      sendVerificationRequest,
    }),
    // ...add more providers here
  ],
  pages: { verifyRequest: '/auth/verify-request', signIn: '/auth/sign-in', error: '/auth/error' },
  theme: {
    colorScheme: 'light', // "auto" | "dark" | "light"
    brandColor: '#722df5', // Hex color code
    logo: '/assets/quickshare.png', // Absolute URL to image
    buttonText: '#fff', // Hex color code
  },
};
export default NextAuth(authOptions);
