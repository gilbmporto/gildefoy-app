"use client"
import { generateChatResponse } from "@/utils/actions"
import { useMutation } from "@tanstack/react-query"
import { ChatCompletionMessage } from "openai/resources/index.mjs"
import React, { useState } from "react"
import toast from "react-hot-toast"

export type Message = {
  role: "user" | "assistant" | "system" | "function"
  content: string
}

export default function Chat() {
  const [text, setText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])

  const { mutate: createMessage, isPending } = useMutation<
    ChatCompletionMessage | null,
    Error,
    Message
  >({
    mutationFn: (query: Message) => generateChatResponse([...messages, query]),
    onSuccess: (data: ChatCompletionMessage | null) => {
      if (!data) {
        toast.error("Something went wrong")
        return
      } else {
        const newMessage: Message = {
          role: data.role!,
          content: data?.content!,
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

  console.log(messages)

  return (
    <div className="min-h-[calc(100vh-5rem)] grid grid-rows-[1fr,auto]">
      {messages.length === 0 ? (
        <h2 className="text-xl p-4">Start your conversation down below...</h2>
      ) : null}
      <div>
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
        {isPending ? <span className="loading"></span> : null}
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
