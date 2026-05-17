-- Supabase SQL Schema for Portfolio
-- Run this in your Supabase SQL Editor

-- 1. Create Profile Table
CREATE TABLE IF NOT EXISTS public.profile (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text DEFAULT 'Yuda Arif Rahman',
    role text DEFAULT 'Web Developer',
    bio text DEFAULT 'Web developer yang berfokus pada pembuatan sistem modern berbasis web dan IoT integration. Berpengalaman mengembangkan sistem absensi, dashboard monitoring, dan aplikasi operasional dengan tampilan responsif dan realtime system.',
    github_url text DEFAULT 'https://github.com/yudaarifrahmann',
    linkedin_url text DEFAULT 'https://linkedin.com',
    whatsapp text DEFAULT '6283119110413',
    email text DEFAULT 'yudaarifrahman6@gmail.com',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial profile if not exists
INSERT INTO public.profile (name, role, bio) 
SELECT 'Yuda Arif Rahman', 'Web Developer', 'Web developer yang berfokus pada pembuatan sistem modern berbasis web dan IoT integration. Berpengalaman mengembangkan sistem absensi, dashboard monitoring, dan aplikasi operasional dengan tampilan responsif dan realtime system.'
WHERE NOT EXISTS (SELECT 1 FROM public.profile);

-- 2. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    image_url text,
    link text,
    "order" integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Messages/Inbox Table (For Contact Form)
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS (Row Level Security)
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Select policies (Public)
CREATE POLICY "Allow public select on profile" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Allow public select on projects" ON public.projects FOR SELECT USING (true);

-- Insert policies (Public can insert messages)
CREATE POLICY "Allow public insert on messages" ON public.messages FOR INSERT WITH CHECK (true);

-- Full access policies for Authenticated Users (Admin)
CREATE POLICY "Allow authenticated full access on profile" ON public.profile TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on projects" ON public.projects TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on messages" ON public.messages TO authenticated USING (true) WITH CHECK (true);
