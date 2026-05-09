const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function run() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const email = 'admin@goala.tv';
  const password = 'password123';

  console.log(`Checking if user ${email} exists...`);
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    process.exit(1);
  }

  let user = usersData.users.find(u => u.email === email);
  let userId;

  if (user) {
    userId = user.id;
    console.log(`User found: ${userId}`);
  } else {
    console.log(`Creating user ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      console.error('Error creating user:', authError);
      process.exit(1);
    }
    userId = authData.user.id;
    console.log('User created:', userId);
  }

  console.log(`Setting admin role for ${email} (${userId}) in "User" table...`);
  const now = new Date().toISOString();
  
  // Upsert into public.User table
  const { error: userTableError } = await supabase
    .from('User')
    .upsert({ 
      id: userId, 
      email: email,
      role: 'admin', 
      createdAt: now,
      updatedAt: now 
    }, { onConflict: 'id' });
    
  if (userTableError) {
    console.error('Error setting role in "User":', userTableError.message);
  } else {
    console.log('Success: Admin role set in "User" table.');
  }
}

run();
