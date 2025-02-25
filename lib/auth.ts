// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcrypt";
import sql from "@/lib/db"; // Your existing Postgres connection

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {

          console.log(credentials.email,'email')

          // Find user by email using your existing users table
          const users = await sql`
            SELECT * FROM users WHERE email = ${credentials.email} LIMIT 1
          `;

          const user = users[0];

          console.log(user)

          if (!user || !user.password_hash) {
            return null;
          }

          // Check password against password_hash field in your schema
          const isPasswordValid = await compare(credentials.password, user.password_hash);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name || null,
            image: user.profile_picture_url || null,
          };
        } catch (error) {
          console.error("Error during authorization:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // For Google sign-in, we might need to create or update the user in our DB
        if (account.provider === "google" && user.email) {
          try {
            const users = await sql`
              SELECT * FROM users WHERE email = ${user.email} LIMIT 1
            `;
            
            if (users.length === 0) {
              // Create user if they don't exist
              // Generate a random password hash since we won't need it for OAuth users
              const randomPasswordHash = await hash(Math.random().toString(36), 10);
              
              const newUsers = await sql`
                INSERT INTO users (name, email, password_hash, profile_picture_url)
                VALUES (${user.name || null}, ${user.email}, ${randomPasswordHash}, ${user.image || null})
                RETURNING id
              `;
              if (newUsers && newUsers[0]) {
                token.id = newUsers[0].id.toString();
              }
            } else {
              token.id = users[0].id.toString();
            }
          } catch (error) {
            console.error("Error handling OAuth sign in:", error);
          }
        } else {
          // For credentials login, we already have the user.id
          token.id = user.id;
        }
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};