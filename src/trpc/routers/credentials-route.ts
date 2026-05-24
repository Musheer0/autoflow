import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { encrypt } from "../lib/encrypt-decrypt";
import prisma from "@/lib/db";
import { NodeType } from "@/generated/prisma/enums";
import { get } from "http";
import redis from "@/lib/redis";
import { credentialsListCacheKey, singleCredentialCacheKey } from "@/lib/redis-keys";

export const CredentialsRoute = createTRPCRouter({

    create:protectedProcedure
    .input(
        z.object({
            name:z.string(),
            secret:z.string(),
            type:z.enum(NodeType)
        })
    )
    .mutation(async({ctx,input})=>{
        const userId = ctx.auth.userId
        const data = encrypt({data:input.secret,key:userId})
        const new_credential  = await prisma.credential.create({
            data:{
                secret:data,
                name:input.name,
                userId,
                type:input.type,
            }
        })
        await redis.setex(singleCredentialCacheKey(userId,new_credential.id),60*60,new_credential)
        const cached = await redis.get<Credential[]>(credentialsListCacheKey(userId,input.type))||[]
        await redis.setex(credentialsListCacheKey(userId,input.type),60*60,[new_credential,...cached])
        //@ts-ignore
        //delete secret from new_credential which is encrypted and not useful for client
        delete new_credential.secret
        return new_credential
    }),
    getCredentials:protectedProcedure
    .input(z.object({
        type:z.enum(NodeType)
    }))
    .query(async({ctx,input})=>{
        const userId = ctx.auth.userId
        const cached = await redis.get<Credential[]>(credentialsListCacheKey(userId,input.type))||[]
        if(cached) return cached
        const credentials = await prisma.credential.findMany({
            where:{
                userId,
                type:input.type
            },
            select:{
                id:true,
                name:true,
                type:true,
                createdAt:true,
                updatedAt:true
            }
        })
        await redis.setex(credentialsListCacheKey(userId,input.type),60*60,credentials)
        return credentials
    }),
    remove:protectedProcedure
    .input(z.object({
        id:z.string()
    }))
    .mutation(async({ctx,input})=>{
        const userId = ctx.auth.userId
        const cache = null
        const oldCredential = cache || await prisma.credential.findFirst({
            where:{
                id:input.id,
                userId
            }
        })
        if(!oldCredential) throw new Error("Credential not found")
        await prisma.credential.deleteMany({
            where:{
                id:input.id,
                userId
            }
        })
       await redis.del(singleCredentialCacheKey(userId,input.id))
       const cachedList = await redis.get<Credential[]>(credentialsListCacheKey(userId,oldCredential.type))||[]
       const newCachedList = cachedList.filter(c=>c.id !== input.id)
       await redis.setex(credentialsListCacheKey(userId,oldCredential.type),60*60,newCachedList)
        return {success:true}
    }),
    

})