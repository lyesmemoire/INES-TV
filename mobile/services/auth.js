import { supabase } from "../lib/supabase";

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (data?.user) {
    await supabase.from("profiles").insert([
      {
        id: data.user.id,
        email: data.user.email,
        role: "user", // 👈 default
      },
    ]);
  }

  return { data, error };
};

export const signIn = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};
