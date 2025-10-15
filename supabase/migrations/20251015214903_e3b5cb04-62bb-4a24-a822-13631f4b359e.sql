-- Create pages table to store available pages in the system
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  route TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_page_permissions table to control which users can access which pages
CREATE TABLE public.user_page_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, page_id)
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_page_permissions ENABLE ROW LEVEL SECURITY;

-- Pages policies (everyone can view available pages)
CREATE POLICY "Users can view all pages"
  ON public.pages FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage pages"
  ON public.pages FOR ALL
  USING (public.is_admin(auth.uid()));

-- User page permissions policies
CREATE POLICY "Users can view own permissions"
  ON public.user_page_permissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all permissions"
  ON public.user_page_permissions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage all permissions"
  ON public.user_page_permissions FOR ALL
  USING (public.is_admin(auth.uid()));

-- Insert default pages
INSERT INTO public.pages (name, route, description) VALUES
  ('Dashboard', '/dashboard', 'Main dashboard page'),
  ('User Management', '/admin/users', 'User management page (Admin only)'),
  ('Reports', '/reports', 'Reports and analytics'),
  ('Settings', '/settings', 'User settings');