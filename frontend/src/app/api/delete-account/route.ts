import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error. Please contact administrator.' },
        { status: 500 }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the user's token with regular Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token or user not found' },
        { status: 401 }
      );
    }

    const userId = user.id;
    console.log(`Attempting to delete account for user: ${userId}`);

    // Delete user's avatar from storage if it exists
    try {
      const { data: files } = await supabaseAdmin.storage
        .from('avatars')
        .list('', {
          search: userId
        });

      if (files && files.length > 0) {
        const filesToDelete = files.map(file => file.name);
        const { error: storageError } = await supabaseAdmin.storage
          .from('avatars')
          .remove(filesToDelete);
        
        if (storageError) {
          console.error('Error deleting avatar files:', storageError);
        } else {
          console.log(`Deleted ${filesToDelete.length} avatar files`);
        }
      }
    } catch (storageError) {
      console.error('Error accessing storage:', storageError);
      // Continue with deletion even if avatar cleanup fails
    }

    // Delete user's profile data
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting profile:', profileError);
      // Continue with user deletion even if profile deletion fails
    } else {
      console.log('Profile data deleted successfully');
    }

    // Delete the auth user account using admin client
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Error deleting user:', deleteUserError);
      return NextResponse.json(
        { error: `Failed to delete user account: ${deleteUserError.message}` },
        { status: 500 }
      );
    }

    console.log('User account deleted successfully');
    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
