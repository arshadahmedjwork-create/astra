import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Mail, Search, CheckCircle, Trash2, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ContactMessage {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'resolved';
  created_at: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If the table doesn't exist yet, we catch it silently for the UI but warn the developer
        if (error.code === '42P01') {
          console.error("The contact_messages table does not exist in Supabase yet.");
          setMessages([]);
        } else {
          throw error;
        }
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', id);

      if (error) throw error;
      setMessages(messages.map(m => m.id === id ? { ...m, status: 'read' } : m));
      toast.success('Message marked as read');
    } catch (error) {
      toast.error('Failed to update message status');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessages(messages.filter(m => m.id !== id));
      toast.success('Message deleted successfully');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(m => 
    m.first_name?.toLowerCase().includes(search.toLowerCase()) || 
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <Mail className="w-8 h-8 text-primary" /> Contact Messages
          </h1>
          <p className="text-muted-foreground mt-1">View and manage customer inquiries and feedback.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card p-2 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or subject..." 
            className="pl-9 bg-transparent border-none shadow-none focus-visible:ring-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
          <Mail className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground">No messages found</h3>
          <p className="text-muted-foreground">When customers contact you, their messages will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredMessages.map((msg) => (
            <Card key={msg.id} className={`overflow-hidden transition-all ${msg.status === 'unread' ? 'border-primary/40 shadow-md bg-primary/[0.02]' : 'border-border/50 opacity-90'}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-foreground">{msg.first_name} {msg.last_name}</h3>
                      <Badge variant={msg.status === 'unread' ? 'default' : 'secondary'}>
                        {msg.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(msg.created_at), 'MMM dd, yyyy - hh:mm a')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                    </div>

                    <div className="bg-background rounded-xl p-4 border border-border/50 mt-4">
                      <h4 className="font-semibold text-foreground mb-2">Subject: {msg.subject || 'No Subject'}</h4>
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 md:w-32 shrink-0">
                    {msg.status === 'unread' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full gap-2 border-primary text-primary hover:bg-primary/10"
                        onClick={() => markAsRead(msg.id)}
                      >
                        <CheckCircle className="w-4 h-4" /> Mark Read
                      </Button>
                    )}
                    <a href={`mailto:${msg.email}?subject=RE: ${msg.subject}`} className="w-full">
                      <Button variant="default" size="sm" className="w-full gap-2">
                        Reply
                      </Button>
                    </a>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteMessage(msg.id)}
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
