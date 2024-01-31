"use client"
import { fetchUserTokensById, generateChatResponse } from "@/utils/actions"
import { useAuth } from "@clerk/nextjs"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ChatCompletionMessage } from "openai/resources/index.mjs"
import React, { useState } from "react"
import { IoIosWarning } from "react-icons/io"
import toast from "react-hot-toast"

export type Message = {
  role: "user" | "assistant" | "system" | "function"
  content: string
}

type ChatResponse = {
  message: ChatCompletionMessage
  tokens: number
}

export default function Chat() {
  const [text, setText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const { userId } = useAuth()

  const { data: queryData, isPending: queryIsPending } = useQuery({
    queryKey: ["chat", userId],
    queryFn: async () => {
      return await fetchUserTokensById(userId!)
    },
  })

  const {
    mutate: createMessage,
    isPending,
    data,
  } = useMutation<ChatResponse | null, Error, Message>({
    mutationFn: async (query: Message) =>
      await generateChatResponse([...messages, query], userId!),
    onSuccess: (data: ChatResponse | null) => {
      if (!data) {
        toast.error("Something went wrong")
        return
      } else if (
        data?.message?.content === "You don't have enough tokens left!"
      ) {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <IoIosWarning
                    className="h-10 w-10 text-yellow-500"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">Warning</p>
                  <p className="mt-1 text-sm text-gray-500">
                    You don't have enough tokens left!
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
        return
      } else {
        const newMessage: Message = {
          role: data.message.role!,
          content: data?.message.content!,
        }
        setMessages((prevState) => [...prevState, newMessage])
      }
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const query: Message = { role: "user", content: text }
    createMessage(query)
    setMessages((prevState) => [...prevState, query])
    setText("")
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] sm:min-h-[calc(100vh-5rem)] grid grid-rows-[1fr,auto]">
      <div className=" max-w-md">
        {queryIsPending ? null : data ? (
          <div className="border border-slate-900 bg-base-300 p-4 rounded-xl shadow-md">
            <span className="ml-4 mb-4">Tokens left: {data.tokens}</span>
          </div>
        ) : (
          <div className="border border-slate-900 bg-base-300 p-4 rounded-xl shadow-md">
            <span className="ml-4 mb-4">Tokens left: {queryData}</span>
          </div>
        )}
        {messages.length === 0 ? (
          <h2 className="text-xl p-4">Start your conversation down below...</h2>
        ) : null}
      </div>
      <div className="py-10 mb-5">
        {messages.map(({ role, content }, index) => {
          const avatar = role == "user" ? "👤" : "🧞"
          const background = role === "user" ? "bg-base-200" : "bg-base-100"
          return (
            <div
              key={index}
              className={`${background} flex py-6 -mx-8 px-8 text-lg leading-loose border-b border-base-300`}
            >
              <span className="mr-4 text-3xl">{avatar}</span>
              <p className="max-w-3xl">{content}</p>
            </div>
          )
        })}
        {isPending ? <span className="loading mt-5"></span> : null}
      </div>
      <form onSubmit={handleSubmit} className="max-w-4xl pt-12">
        <div className="join w-full">
          <input
            type="text"
            placeholder="Message gildefoy..."
            className="input-bordered join-item w-full pl-4"
            value={text}
            required
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="btn btn-primary join-item"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Please wait..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  )
}
