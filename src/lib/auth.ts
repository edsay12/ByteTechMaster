import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcrypt";
import { db } from "./db";

export const nextOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jssmith" },
        password: { label: "PasseWord", type: "password" },
        username: { label: "Name", type: "text", placeholder: "jhon lenon" },
      },

      async authorize(credentials, req): Promise<any> {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Dados nulos");
        }
        const user = await db.user.findUnique({
          where: {
            email: credentials?.email,
          },
        });

        if (!user || !user.hashedPassword) {
          throw new Error("usuario ou senha incorretos");
        }
        const machPassword = compare(credentials.password, user.hashedPassword);

        if (!machPassword) {
          throw new Error("Login ou senha incorretos");
        }
        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  debug:true,
  secret: process.env.SESSION_SECRET,
  pages: {
    signIn: "/auth", // Definindo a Pagina de Login.
  },
};
