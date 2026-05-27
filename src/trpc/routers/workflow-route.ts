import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { generateSlug } from "random-word-slugs";
import prisma from "@/lib/db";
import redis from "@/lib/redis";
import { singleWorkflow, workflowFirstPage } from "@/lib/redis-keys";
import { Workflow } from "@/generated/prisma/client";
interface workflowsPage {
    workflows :Workflow[],
    cursor:string|null
}
export const workflowRoutes = createTRPCRouter({
    create:protectedProcedure
    .input(
        z.object({
            name:z.string().min(3).max(64).optional()
        })
    )
    .mutation(async({ctx,input})=>{
        const userId = ctx.auth.userId
        const workflowName = input.name || generateSlug()
        const new_workflow =  await prisma.workflow.create({
            data:{
                userId,
                name:workflowName,
            }
        });

        await redis.setex(singleWorkflow(new_workflow.id,userId),60*60*4,new_workflow)
        const firstPage = await redis.get<workflowsPage>(workflowFirstPage(userId)) 
        if (firstPage){
            if(firstPage.workflows.length>10){
                firstPage.cursor = firstPage.workflows[10].id
                firstPage.workflows.pop()
            }
                                await redis.setex(workflowFirstPage(userId),60*60*10,firstPage)

        }
        const page:workflowsPage = {workflows:[new_workflow], cursor:null}
        await redis.setex(workflowFirstPage(userId),60*60*10,page)
        return new_workflow
    }),
    rename:protectedProcedure
    .input(z.object({
        new_name:z.string().min(3).max(64),
        id:z.string()
    }))
    .mutation(async({ctx,input})=>{
        const userId = ctx.auth.userId
        const workflowName = input.new_name 
        const new_workflow =  await prisma.workflow.update({
            where:{
                userId,
                id:input.id
            },
            data:{
                name:workflowName,
            }
        });

        await redis.setex(singleWorkflow(new_workflow.id,userId),60*60*4,new_workflow)
        const firstPage = await redis.get<workflowsPage>(workflowFirstPage(userId)) 
        if (firstPage){
            if(firstPage.workflows.length>10){
                firstPage.cursor = firstPage.workflows[10].id
                firstPage.workflows.pop()
            }
                    await redis.setex(workflowFirstPage(userId),60*60*10,firstPage)
        }
        const page:workflowsPage = {workflows:[new_workflow], cursor:null}
        await redis.setex(workflowFirstPage(userId),60*60*10,page)
        return new_workflow
    }),
    remove:protectedProcedure
    .input(z.object({
        id:z.string()
    }))
    .mutation(async({ctx,input})=>{
        const userId = ctx.auth.userId
        await prisma.workflow.delete({
            where:{
                userId,
                id:input.id
            }
        })

        await redis.del(singleWorkflow(input.id,userId))
        const firstPage = await redis.get<workflowsPage>(workflowFirstPage(userId)) 
        if (firstPage){
           firstPage.workflows.filter((w)=>w.id!==input.id)
                    await redis.setex(workflowFirstPage(userId),60*60*10,firstPage)
        }
 
        
    }),
})