const createUser = async (e) => {
  e.preventDefault();
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: newUserEmail,
      password: newUserPassword,
      email_confirm: true
    });
    if (error) {
      if (error.status === 422) {
        if (error.message.includes('already exists')) {
          toast.error('A user with this email already exists. Please use a different email address.');
        } else {
          toast.error('Invalid input: Please check the email and password. The password should be at least 6 characters long.');
        }
      } else {
        throw error;
      }
      return;
    }

    if (!data || !data.user) {
      throw new Error('User data not returned from Supabase');
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      data.user.id,
      { app_metadata: { is_admin: isAdmin } }
    );
    if (updateError) throw updateError;

    toast.success('User created successfully');
    fetchUsers();
    setNewUserEmail('');
    setNewUserPassword('');
    setIsAdmin(false);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.message && error.message.includes('already exists')) {
      toast.error('A user with this email already exists. Please use a different email address.');
    } else {
      toast.error('Error creating user: ' + (error.message || 'Unknown error occurred'));
    }
  }
};