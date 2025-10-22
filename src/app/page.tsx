'use client';

import { useChat } from '@ai-sdk/react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Loader } from '@/components/ai-elements/loader';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools
} from '@/components/ai-elements/prompt-input';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Response } from '@/components/ai-elements/response';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/source';
import { fetchAllUserChats, fetchUserContext, initializeUserContext } from '@/lib/loyal/service';
import type { UserChat, UserContext } from '@/lib/loyal/types';
import { GrpcChatTransport } from '@/lib/query/transport';
import { createAndUploadChat } from '@/lib/services/service';

const models = [
  {
    name: 'GPT 4o',
    value: 'openai/gpt-4o',
  },
  {
    name: 'Deepseek R1',
    value: 'deepseek/deepseek-r1',
  },
];

const ChatBotDemo = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [darkMode, setDarkMode] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [userChats, setUserChats] = useState<UserChat[]>([]);
  const [isContextLoading, setIsContextLoading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const { messages, sendMessage, status } = useChat({
    transport: new GrpcChatTransport({
      baseUrl: 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/connect+proto',
      }
    }),
  });

  // Initialize dark mode based on system preference
  useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setDarkMode(mediaQuery.matches);
  
      const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }, []);
  
  // Check if the user has a context account
  useEffect(() => {
    if (!anchorWallet) {
      setUserContext(null);
      setUserChats([]);
      setIsContextLoading(false);
      return;
    }

    let cancelled = false;

    const hydrateContext = async () => {
      setIsContextLoading(true);
      try {
        let context = await fetchUserContext(connection, anchorWallet);
        if (!context) {
          console.log('No context account found. Creating one...');
          context = await initializeUserContext(connection, anchorWallet);
        }
        if (cancelled) {
          return;
        }
        setUserContext(context);
        const chats =
          (await fetchAllUserChats(connection, anchorWallet, context.nextChatId)) ??
          [];
        if (!cancelled) {
          console.log('Chats found:', chats);
          setUserChats(chats);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load Loyal context', error);
          setUserChats([]);
        }
      } finally {
        if (!cancelled) {
          setIsContextLoading(false);
        }
      }
    };

    void hydrateContext();

    return () => {
      cancelled = true;
    };
  }, [anchorWallet, connection]);    

  const handleTestCreateChat = useCallback(async () => {
    if (!anchorWallet || !userContext) {
      console.warn('Wallet or context not ready yet');
      return;
    }
    const messageText =
      userChats.length === 0
        ? 'Hello!'
        : `Hello again! (#${userChats.length + 1})`;
    setIsCreatingChat(true);
    try {
      await createAndUploadChat(connection, anchorWallet, messageText, userContext);
      const updatedContext = await fetchUserContext(connection, anchorWallet);
      if (updatedContext) {
        setUserContext(updatedContext);
        const chats =
          (await fetchAllUserChats(
            connection,
            anchorWallet,
            updatedContext.nextChatId
          )) ?? [];
        setUserChats(chats);
        console.log('Chats found:', chats);
      }
    } catch (error) {
      console.error('Failed to create chat', error);
    } finally {
      setIsCreatingChat(false);
    }
  }, [anchorWallet, connection, userContext, userChats]);

  // apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(
        { text: input },
        {
          body: {
            model: model,
          },
        },
      );
      setInput('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
      <button
        type="button"
        onClick={handleTestCreateChat}
        disabled={!anchorWallet || !userContext || isCreatingChat || isContextLoading}
        className="fixed top-6 right-[10.5rem] z-20 rounded-md border border-white/20 bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCreatingChat ? 'Creating chat...' : 'Test Chat Upload'}
      </button>
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'assistant' && (
                  <Sources>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'source-url':
                          return (
                            <>
                              <SourcesTrigger
                                count={
                                  message.parts.filter(
                                    (part) => part.type === 'source-url',
                                  ).length
                                }
                              />
                              <SourcesContent key={`${message.id}-${i}`}>
                                <Source
                                  key={`${message.id}-${i}`}
                                  href={part.url}
                                  title={part.url}
                                />
                              </SourcesContent>
                            </>
                          );
                      }
                    })}
                  </Sources>
                )}
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <Response key={`${message.id}-${i}`}>
                              {part.text}
                            </Response>
                          );
                        case 'reasoning':
                          return (
                            <Reasoning
                              key={`${message.id}-${i}`}
                              className="w-full"
                              isStreaming={status === 'streaming'}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{part.text}</ReasoningContent>
                            </Reasoning>
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputTextarea
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.value} value={model.value}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBotDemo;
