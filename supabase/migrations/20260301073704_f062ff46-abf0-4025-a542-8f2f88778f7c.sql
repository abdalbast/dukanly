-- Add DELETE policies for profiles and sellers tables

CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own seller profile"
ON public.sellers FOR DELETE
TO authenticated
USING (auth.uid() = user_id);