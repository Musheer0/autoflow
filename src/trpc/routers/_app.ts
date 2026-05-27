import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { CredentialsRoute } from './credentials-route';
 
export const appRouter = createTRPCRouter({
  credentials:CredentialsRoute
});
 
// export type definition of API
export type AppRouter = typeof appRouter;