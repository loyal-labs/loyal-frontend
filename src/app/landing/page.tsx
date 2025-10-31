'use client';

import { useChat } from '@ai-sdk/react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
import { TopicsSidebar } from '@/components/ai-elements/topics-sidebar';
import { mapChatsToTopics } from '@/lib/chat/topic-utils';
import { GrpcChatTransport } from '@/lib/query/transport';
import { createAndUploadChat } from '@/lib/services/service';
import { useUserChats } from '@/providers/user-chats';

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
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const {
    userContext,
    userChats,
    isLoading: isUserChatsLoading,
    refreshUserChats,
  } = useUserChats();

  const { messages, sendMessage, status } = useChat({
    transport: new GrpcChatTransport({
      baseUrl: 'http://localhost:8000',
      headers: {
        'Content-Type': 'application/connect+proto',
      }
    }),
  });

  const topics = useMemo(() => mapChatsToTopics(userChats), [userChats]);

  // Initialize dark mode based on system preference
  useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setDarkMode(mediaQuery.matches);
  
      const handler = (e: MediaQueryListEvent) => setDarkMode(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }, []);
  
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
      await refreshUserChats();
    } catch (error) {
      console.error('Failed to create chat', error);
    } finally {
      setIsCreatingChat(false);
    }
  }, [anchorWallet, connection, refreshUserChats, userContext, userChats]);

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
    <div className="flex h-screen">
      <TopicsSidebar topics={topics} />
      <div className="flex-1 overflow-hidden">
        <div className="relative mx-auto flex h-full max-w-4xl flex-col p-6">
          <button
            type="button"
            onClick={handleTestCreateChat}
            disabled={!anchorWallet || !userContext || isCreatingChat || isUserChatsLoading}
            className="fixed top-6 right-[10.5rem] z-20 rounded-md border border-white/20 bg-zinc-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreatingChat ? 'Creating chat...' : 'Test Chat Upload'}
          </button>
          <div className="flex h-full flex-col">
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
      </div>
    </div>
  );
};

export default ChatBotDemo;
