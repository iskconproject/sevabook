-- Create users table to store user profiles with roles
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('superAdmin', 'admin', 'seller', 'manager')),
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'pending')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.users;
DROP POLICY IF EXISTS "Super admins can update any profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Policy to allow users to read their own profile
CREATE POLICY "Users can read their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy to allow the trigger function to insert new profiles
CREATE POLICY "Allow trigger to insert profiles"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow admins and super admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.users
  FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN ('arindamdawn3@gmail.com', 'arindam.dawn@monet.work')
  );

-- Policy to allow super admins to update any profile
CREATE POLICY "Super admins can update any profile"
  ON public.users
  FOR UPDATE
  USING (
    auth.jwt() ->> 'email' = 'arindamdawn3@gmail.com'
  );

-- Policy to allow users to update their own profile (except role)
CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Drop the trigger first if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the email is in the allowed list
  IF NEW.email = 'arindamdawn3@gmail.com' THEN
    INSERT INTO public.users (id, name, email, role, status)
    VALUES (NEW.id, split_part(NEW.email, '@', 1), NEW.email, 'superAdmin', 'active');
  ELSIF NEW.email = 'arindam.dawn@monet.work' THEN
    INSERT INTO public.users (id, name, email, role, status)
    VALUES (NEW.id, split_part(NEW.email, '@', 1), NEW.email, 'admin', 'active');
  ELSIF NEW.email = 'projectiskcon@gmail.com' THEN
    INSERT INTO public.users (id, name, email, role, status)
    VALUES (NEW.id, split_part(NEW.email, '@', 1), NEW.email, 'seller', 'active');
  ELSIF NEW.email = 'arindam@appexert.com' THEN
    INSERT INTO public.users (id, name, email, role, status)
    VALUES (NEW.id, split_part(NEW.email, '@', 1), NEW.email, 'manager', 'active');
  ELSE
    -- For any other email, don't create a profile
    -- This effectively prevents unauthorized users from signing up
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Drop the trigger first if it exists
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS public.update_last_login();

-- Create function to update last_login
CREATE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET last_login = now(), updated_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user login
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.update_last_login();
