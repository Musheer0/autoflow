import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { CredentialsRoute } from './credentials-route';
import { workflowRoutes } from './workflow-route';
 
export const appRouter = createTRPCRouter({
  credentials:CredentialsRoute,
  workflows:workflowRoutes
});
 
// export type definition of API
export type AppRouter = typeof appRouter;