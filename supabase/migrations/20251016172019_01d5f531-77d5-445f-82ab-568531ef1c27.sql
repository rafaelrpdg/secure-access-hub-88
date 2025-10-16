-- Create admin user admin@oikoswm.com
-- Password: r0driguesOikoswm

DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Try to get existing user
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@oikoswm.com';
  
  -- If user doesn't exist, create it
  IF admin_user_id IS NULL THEN
    admin_user_id := gen_random_uuid();
    
    -- Insert user into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_user_id,
      'authenticated',
      'authenticated',
      'admin@oikoswm.com',
      crypt('r0driguesOikoswm', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Oikos Admin"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    -- Profile will be created by trigger, but ensure it exists
    INSERT INTO public.profiles (id, full_name)
    VALUES (admin_user_id, 'Oikos Admin')
    ON CONFLICT (id) DO UPDATE SET full_name = 'Oikos Admin';
  END IF;
  
  -- Ensure admin role exists for this user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
END $$;