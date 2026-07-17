import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';
import { useUsersQuery } from '@/hooks/useUsers';
import { useMessagesQuery, useSendMessageMutation } from '@/hooks/useMessages';
import type { MessageData } from '@/hooks/useMessages';
import { Send, MessageSquare, Loader2, Menu, List, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

export default function Chat() {
  const { data: session } = authClient.useSession();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userid');
  const queryClient = useQueryClient();

  // Read online status map and mobile drawer toggler from context
  const { onlineUsers, setMobileMenuOpen } = useOutletContext<{
    onlineUsers: string[];
    setMobileMenuOpen: (open: boolean) => void;
  }>();

  // Shared state: Socket.io client and users list
  const socket = useSocket();
  const { data: users = [], isLoading: loadingUsers } = useUsersQuery();

  // Messages queries and mutations
  const { data: currentChatMessages = [], isLoading: loadingMessages } = useMessagesQuery(userId);
  const sendMessageMutation = useSendMessageMutation();

  const [inputValue, setInputValue] = useState('');
  const [targetIsTyping, setTargetIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Mark all messages as read on entry / user selection
  useEffect(() => {
    if (!socket || !session?.user?.id || !userId) return;

    socket.emit('read_all_messages', {
      senderId: userId,
      receiverId: session.user.id,
    });

    setTargetIsTyping(false);
  }, [socket, userId, session?.user?.id]);

  // Handle incoming real-time messages & updates via the shared socket client
  useEffect(() => {
    if (!socket || !session?.user?.id) return;

    const handleNewMessage = (msg: MessageData) => {
      const convoId = msg.senderId === session.user.id ? msg.receiverId : msg.senderId;

      // If we are currently active in this chat and receive a message from the target user, mark it as read immediately
      if (msg.senderId === userId) {
        msg.status = 'read';
        socket.emit('read_all_messages', {
          senderId: userId,
          receiverId: session.user.id,
        });
      }

      queryClient.setQueryData<MessageData[]>(['messages', convoId], (oldMessages) => {
        if (!oldMessages) return [msg];
        if (oldMessages.some((m) => m.id === msg.id)) return oldMessages;
        return [...oldMessages, msg];
      });
    };

    const handleUserTyping = ({ senderId, isTyping }: { senderId: string; isTyping: boolean }) => {
      if (senderId === userId) {
        setTargetIsTyping(isTyping);
      }
    };

    const handleAllMessagesRead = ({ readerId }: { readerId: string }) => {
      if (readerId === userId) {
        queryClient.setQueryData<MessageData[]>(['messages', userId], (oldMessages) => {
          if (!oldMessages) return [];
          return oldMessages.map((m) => ({ ...m, status: 'read' as const }));
        });
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('all_messages_read', handleAllMessagesRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('all_messages_read', handleAllMessagesRead);
    };
  }, [socket, session?.user?.id, userId, queryClient]);

  const selectedUser = users.find((u) => u.id === userId);
  const isOnline = selectedUser ? onlineUsers.includes(selectedUser.id) : false;

  const handleInputChange = (val: string) => {
    setInputValue(val);

    if (!socket || !session?.user?.id || !userId) return;

    socket.emit('typing', {
      senderId: session.user.id,
      receiverId: userId,
      isTyping: true,
    });

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      socket.emit('typing', {
        senderId: session.user.id,
        receiverId: userId,
        isTyping: false,
      });
    }, 2000);

    setTypingTimeout(timeout);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !userId || !session) return;

    const textToSend = inputValue;
    setInputValue('');

    // Emit stop typing immediately
    if (socket && session?.user?.id) {
      if (typingTimeout) clearTimeout(typingTimeout);
      socket.emit('typing', {
        senderId: session.user.id,
        receiverId: userId,
        isTyping: false,
      });
    }

    // Trigger TanStack Query mutation
    sendMessageMutation.mutate({
      receiverId: userId,
      content: textToSend,
    });
  };

  if (loadingUsers) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-950/20 text-zinc-100">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-xs text-zinc-500 mt-3 animate-pulse">Establishing workspace link...</p>
      </div>
    );
  }

  // Render placeholder if no user selected
  if (!userId || !selectedUser) {
    return (
      <div className="h-full w-full flex flex-col bg-zinc-900/5 backdrop-blur-sm z-10 overflow-hidden relative">
        {/* Mobile Header (only visible when no chat is active to allow opening menu) */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-zinc-400 hover:text-zinc-100 cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <img src="/favicon.svg" alt="Vedaz Logo" className="h-6 w-6 object-contain" />
            <span className="text-sm font-bold tracking-wider text-white">VEDAZ</span>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-955/10 text-center p-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="max-w-md space-y-4 relative z-10 flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl">
              <MessageSquare className="h-7 w-7 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-200">Start a Conversation</h2>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
              Select a direct message channel from the sidebar list to start exchanging encrypted
              real-time messages.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900/5 backdrop-blur-sm z-10 overflow-hidden relative">
      {/* Top Header bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon-xs"
            className="md:hidden text-zinc-400 hover:text-zinc-100 mr-2 cursor-pointer"
            onClick={() => setMobileMenuOpen(true)}
          >
            <List className="size-5" />
          </Button>
          <div className="relative">
            <Avatar className="h-8.5 w-8.5 border border-zinc-800">
              <AvatarImage src={selectedUser.image || undefined} />
              <AvatarFallback className="bg-indigo-950 text-indigo-400 text-xs font-semibold">
                {selectedUser.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-950 animate-pulse" />
            )}
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-200">{selectedUser.name}</h1>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {targetIsTyping ? (
                <span className="text-indigo-400 font-medium animate-pulse">Typing...</span>
              ) : isOnline ? (
                <span className="text-emerald-400 font-medium">Online</span>
              ) : (
                <span>Offline</span>
              )}
            </p>
          </div>
        </div>

        {/* Header right spacer */}
        <div />
      </header>

      {/* Messages view list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loadingMessages ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-zinc-500 py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mb-2" />
            <p className="text-xs animate-pulse">Retrieving secure chat log...</p>
          </div>
        ) : currentChatMessages.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <MessageSquare className="h-8 w-8 text-zinc-700 mb-2" />
            <p className="text-xs">No message history. Start typing below to begin.</p>
          </div>
        ) : (
          currentChatMessages.map((msg) => {
            const isMe = msg.senderId === session?.user?.id;
            const messageSender = isMe ? session?.user : users.find((u) => u.id === msg.senderId);
            const senderName = isMe ? 'You' : messageSender?.name || 'User';

            return (
              <div
                key={msg.id}
                className="flex items-start space-x-3 animate-in fade-in zoom-in duration-200"
              >
                <Avatar className="h-8.5 w-8.5 border border-zinc-850 mt-0.5">
                  <AvatarImage src={messageSender?.image || undefined} />
                  <AvatarFallback className="bg-indigo-950 text-indigo-400 text-xs font-semibold">
                    {senderName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-baseline space-x-2">
                    <span
                      className={`text-xs font-semibold ${isMe ? 'text-indigo-400' : 'text-zinc-200'}`}
                    >
                      {senderName}
                    </span>
                    <span className="text-[9px] text-zinc-650 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {isMe && (
                        <span>
                          {msg.status === 'read' ? (
                            <CheckCheck className="h-3 w-3 text-emerald-500 inline" />
                          ) : msg.status === 'delivered' ? (
                            <CheckCheck className="h-3 w-3 text-zinc-500 inline" />
                          ) : (
                            <Check className="h-3 w-3 text-zinc-500 inline" />
                          )}
                        </span>
                      )}
                    </span>
                  </div>
                  <div
                    className={`text-sm leading-relaxed p-3.5 rounded-2xl border ${
                      isMe
                        ? 'bg-indigo-950/20 border-indigo-900/35 text-zinc-200'
                        : 'bg-zinc-900/60 border-zinc-800/50 text-zinc-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Message panel */}
      <footer className="p-4 pb-10 border-t border-zinc-800/80 bg-zinc-950/20">
        <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <Input
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={`Message ${selectedUser.name}...`}
            className="flex-1 bg-zinc-900 border-transparent focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-200 rounded-xl h-11 px-4 text-sm shadow-none outline-none border-0 ring-0 ring-offset-0"
          />
          <Button
            type="submit"
            disabled={sendMessageMutation.isPending}
            className="h-11 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center justify-center cursor-pointer shadow-lg shadow-indigo-600/10 disabled:opacity-50"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <Send className="h-4 w-4 mr-1.5" />
            )}
            Send
          </Button>
        </form>
      </footer>
    </div>
  );
}
