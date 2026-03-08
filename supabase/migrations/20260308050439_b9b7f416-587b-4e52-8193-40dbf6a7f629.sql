UPDATE auth.users 
SET encrypted_password = crypt('TestE2E!2025', gen_salt('bf'))
WHERE email = 'testuser-e2e@dukanly.test';