import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcrypt'
import sql from "@/lib/db";


export const authOptions : NextAuthOptions = {
    providers:[
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
              async authorize(credentials:any) : Promise<any> {
                if (!credentials?.email || !credentials?.password) {
                  return null;
                }
        
                try {
                  // Find user by email
                  const users = await sql`
                    SELECT * FROM users WHERE email = ${credentials.email} LIMIT 1
                  `;
        
                  const user = users[0];

                  console.log(user,'user')
        
                  if (!user || !user.password_hash) {
                        throw new Error('No user found with this email')
                  }
        
                  // Check password
                  const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
        
                  if (!isPasswordValid) {
                    throw new Error('Password is invalid')
                  }
                  return user
                } catch (error) {
                  console.error("Error during authorization:", error);
                  return null;
                }
              },
        }),
    ],
    pages: {
      signIn: "/auth/signin",
      signOut: "/auth/signout",
      error: "/auth/error",
      verifyRequest: "/auth/verify-request",
    },
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks:{
      async jwt({ token, user,account }) {
        if (account && user) {
          if (account.provider === "google") {
            try {
              const users = await sql`
                SELECT * FROM users WHERE email = ${user.email} LIMIT 1
              `;
              
              if (users.length === 0 && user.email) {

                console.log(user)

                const [newUser] = await sql`
                  INSERT INTO users (name, email, profile_picture_url)
                  VALUES (${user.name ?? null}, ${user.email ?? null}, ${user.image ?? null})
                RETURNING id
              `;
                token.id = newUser.id;
                token.email = newUser.email;
              } else {
                token.id = users[0].id;
                token.email = users[0].email;
              }
            } catch (error) {
              console.error("Error handling OAuth sign in:", error);
            }
          } else {
            token.id = user.id;
            token.email = user.email;
          }
        }
        return token;
      },
      async session ({ session, token, }) {
        if (token && token.email && token.id) {
          session.user.email = token.email;
          session.user.id = token.id;
        }
          return session
      },
    }
}