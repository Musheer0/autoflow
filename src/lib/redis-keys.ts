import { NodeType } from "@/generated/prisma/enums"
export const singleCredentialCacheKey = (userId:string,credentialId:string) => `credential:${userId}:${credentialId}`
export const credentialsListCacheKey = (userId:string,type:NodeType) => `credentials:${userId}:${type}:credentialsList`
