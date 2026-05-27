import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

export const createTRPCContext = cache(async () => {
  return { };
});
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
export const protectedProcedure  = baseProcedure.use(async({ctx,next})=>{
    const session = await auth()
    if(!session.userId) throw new TRPCError({code:"UNAUTHORIZED"})
    return next({ctx:{...ctx,auth:session}})
})

export const internalProcedure = baseProcedure.use(async({ctx,next})=>{
  const he = await headers()
  const internalHeader = he.get("x-internal-secret")
  if(internalHeader !== process.env.INTERNAL_SECRET) throw new TRPCError({code:"UNAUTHORIZED"})  
  return next({ctx:{...ctx, internal:true}})
})