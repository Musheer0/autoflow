import prisma from '@/lib/db'
import redis from '@/lib/redis'
import { failedUserSave } from '@/lib/redis-keys'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'

export const GET = async()=>{
    return new  Response('Webhook Healthy')
}

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    const { id } = evt.data
    const eventType = evt.type
    console.log(evt.data)
    if (eventType==="user.created" && id){
       try {
         await prisma.user.create({
            data:{
                clerk_id:id,
            }
        })
       } catch (error) {
        console.error(error)
        await redis.set(failedUserSave(id),{id,email:evt.data.email_addresses})
       }
    }
    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}