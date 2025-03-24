
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

type Message = {
  id: string;
  sender_id: string; // Added the sender_id property
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
};

const DiscussionRoom = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = getCurrentUser();
  const { toast } = useToast();
  
  // Function to fetch latest messages
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('discussion_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
        
      if (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load discussion messages',
          variant: 'destructive',
        });
        return;
      }
      
      if (data) {
        // Reverse to show oldest messages first
        setMessages(data.reverse());
      }
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch of messages
  useEffect(() => {
    fetchMessages();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('discussion_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'discussion_messages',
        },
        (payload) => {
          // Add new message to the list
          const newMsg = payload.new as Message;
          setMessages((prevMessages) => {
            // If we already have 30 messages, remove the oldest one
            if (prevMessages.length >= 30) {
              return [...prevMessages.slice(1), newMsg];
            }
            return [...prevMessages, newMsg];
          });
        }
      )
      .subscribe();
      
    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Send a new message
  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;
    
    try {
      const { error } = await supabase
        .from('discussion_messages')
        .insert({
          sender_id: user.id,
          sender_name: user.name,
          sender_role: user.role,
          message: newMessage.trim(),
        });
        
      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message',
          variant: 'destructive',
        });
        return;
      }
      
      // Clear input after successful send
      setNewMessage('');
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
    }
  };
  
  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Get avatar fallback initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Get color based on user role
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'bg-red-100 text-red-700';
      case 'hr':
        return 'bg-purple-100 text-purple-700';
      case 'teacher':
        return 'bg-blue-100 text-blue-700';
      case 'parent':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <Card className="h-[70vh] flex flex-col">
      <CardHeader>
        <CardTitle>Discussion Room</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <ScrollArea className="h-[calc(70vh-8rem)] px-4">
            {messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-400">
                No messages yet. Be the first to start the discussion!
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender_id !== user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={getRoleColor(msg.sender_role)}>
                          {getInitials(msg.sender_name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        msg.sender_id === user?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.sender_id !== user?.id && (
                        <div className="font-semibold mb-1 flex items-center gap-2">
                          {msg.sender_name}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(msg.sender_role)}`}
                          >
                            {msg.sender_role}
                          </span>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.message}</div>
                      <div
                        className={`text-xs mt-1 ${
                          msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    {msg.sender_id === user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={getRoleColor(user.role)}>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-3">
        <div className="flex w-full gap-2">
          <Textarea
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] flex-grow"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !user}
            className="self-end"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DiscussionRoom;
