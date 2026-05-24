"use client"

import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { NodeType } from "@/generated/prisma/enums"
import useCreateCredential from "../hooks/use-create-credential"

const alertDialogForm = z.object({
  name: z.string().min(2, "Name too short").max(64),
  secret: z.string().min(1, "Secret is required"),
})

type FormValues = z.infer<typeof alertDialogForm>

const CreateCredentials = ({
  type,
  children,
}: {
  type: NodeType
  children: React.ReactNode
}) => {
  const {
    control,
    handleSubmit,
    reset,
  } = useForm<FormValues>({
    //@ts-ignore
    resolver: zodResolver(alertDialogForm),
    defaultValues: {
      name: "",
      secret: "",
    },
  })
  const {createCredential} = useCreateCredential()
  const onSubmit = async (data: FormValues) => {
    await createCredential({name:data.name,secret:data.secret,type})

    reset()
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Add New Credentials
          </AlertDialogTitle>

          <AlertDialogDescription>
            Securely store API keys, secrets, or authentication
            tokens. These credentials can be safely referenced in your{" "}
            {type} nodes.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 mt-4"
        >
          <FieldGroup>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Name</FieldLabel>

                  <Input
                    {...field}
                    placeholder="My OpenAI Key"
                  />

                  <FieldDescription>
                    Friendly name for this credential
                  </FieldDescription>

                  {fieldState.error && (
                    <FieldError>
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              name="secret"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Secret</FieldLabel>

                  <Input
                    {...field}
                    type="password"
                    placeholder="sk-xxxxx"
                  />

                  <FieldDescription>
                    Your API key / token
                  </FieldDescription>

                  {fieldState.error && (
                    <FieldError>
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button className="w-full" type="submit">
            Save Credentials
          </Button>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default CreateCredentials