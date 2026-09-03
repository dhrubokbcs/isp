import { NextResponse } from 'next/server';
import {
  fetchUsersFromSupabase,
  createAdminInSupabase,
  updateUserStatusInSupabase,
  updateUserRoleInSupabase,
  updateUserPasswordInSupabase,
  deleteUserInSupabase,
} from '@/lib/db/supabaseUsers';
import { sendUserCredentialsWelcomeEmail } from '@/lib/email/mailer';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/requireSession';

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const users = await fetchUsersFromSupabase();

    const counts = {
      total: users.length,
      superadmins: users.filter((u) => u.role === 'SUPERADMIN').length,
      admins: users.filter((u) => u.role === 'ADMIN').length,
      teachers: users.filter((u) => u.role === 'TEACHER').length,
      students: users.filter((u) => u.role === 'STUDENT').length,
      active: users.filter((u) => u.status === 'ACTIVE').length,
      inactive: users.filter((u) => u.status === 'INACTIVE').length,
    };

    return NextResponse.json({
      success: true,
      counts,
      users,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const { fullName, email, phone, password } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, error: 'Full Name and Email are required.' },
        { status: 400 }
      );
    }

    const { user: createdAdmin, initialPassword } = await createAdminInSupabase({
      fullName,
      email,
      phone,
      password,
    });

    // Send Welcome Email with credentials & password change instructions
    try {
      await sendUserCredentialsWelcomeEmail({
        to: createdAdmin.email,
        fullName: createdAdmin.fullName,
        role: createdAdmin.role || 'ADMIN',
        initialPassword: initialPassword,
      });
    } catch (mailErr) {
      console.warn('Welcome email dispatch notice for admin:', mailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Admin user ${createdAdmin.fullName} created successfully`,
        user: createdAdmin,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create admin' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json();
    const { action, id } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    if (action === 'TOGGLE_STATUS') {
      const { status } = body;
      const res = await updateUserStatusInSupabase(id, status);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: `Status updated to ${status}` });
    }

    if (action === 'CHANGE_ROLE') {
      // Changing user roles strictly requires Superadmin privilege
      const superAuth = await requireSuperAdmin(request);
      if (superAuth.errorResponse) return superAuth.errorResponse;

      const { role } = body;
      if (role !== 'ADMIN' && role !== 'TEACHER') {
        return NextResponse.json({ success: false, error: 'Role must be ADMIN or TEACHER' }, { status: 400 });
      }
      const res = await updateUserRoleInSupabase(id, role);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: `Role updated to ${role}` });
    }

    if (action === 'RESET_PASSWORD') {
      const { password } = body;
      if (!password || password.length < 6) {
        return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      const res = await updateUserPasswordInSupabase(id, password);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'Password updated successfully' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // User deletion is a critical destructive action strictly requiring Superadmin
    const auth = await requireSuperAdmin(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const res = await deleteUserInSupabase(id);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'User account deleted successfully' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
