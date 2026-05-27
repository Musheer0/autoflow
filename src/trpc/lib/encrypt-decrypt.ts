import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"

const secret = process.env.ENCRYPTION_KEY
if (!secret) throw new Error("Missing key")

function deriveKey(userKey: string) {
    return crypto
        .createHash("sha256")
        .update(userKey + secret)
        .digest()
}

export function encrypt({
    data,
    key,
}:{
    data:string
    key:string
}) {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(
        ALGORITHM,
        deriveKey(key),
        iv
    )

    let encrypted =
        cipher.update(data,"utf8","hex")

    encrypted += cipher.final("hex")

    const tag = cipher.getAuthTag()

    return [
        iv.toString("hex"),
        tag.toString("hex"),
        encrypted
    ].join(":")
}

export function decrypt({
    data,
    key
}:{
    data:string
    key:string
}) {
    const [ivHex,tagHex,encrypted] =
        data.split(":")

    const decipher =
        crypto.createDecipheriv(
            ALGORITHM,
            deriveKey(key),
            Buffer.from(ivHex,"hex")
        )

    decipher.setAuthTag(
        Buffer.from(tagHex,"hex")
    )

    let decrypted =
        decipher.update(
            encrypted,
            "hex",
            "utf8"
        )

    decrypted += decipher.final("utf8")

    return decrypted
}