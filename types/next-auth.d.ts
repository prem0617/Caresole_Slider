import 'next-auth'
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface User{
        email: string;
        id:any;
    }
    interface Session{
        user: {
            id: any;
            email: string;
        } & DefaultSession['user'];
    } 
    interface JWT{
        email: string;
        id:number;
    }
}