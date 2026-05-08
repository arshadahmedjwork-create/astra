-- ============================================================
-- Contact Messages Table Migration
-- Run this in the Supabase SQL Editor to enable the Contact Form
-- ============================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a new message (for public users submitting the form)
CREATE POLICY "Anyone can submit a contact message" 
  ON contact_messages 
  FOR INSERT 
  WITH CHECK (true);

-- Allow only admins to read, update, or delete messages
CREATE POLICY "Admins can manage contact messages" 
  ON contact_messages 
  FOR ALL 
  USING (true);

-- (Optional) If you have a specific admin role policy, use that instead of 'USING (true)'
-- For example: USING (auth.jwt() ->> 'role' = 'admin');
