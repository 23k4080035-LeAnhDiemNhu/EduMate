#!/usr/bin/env node
/**
 * EDUMATE HUẾ - SECURE ACCOUNT PROVISIONING TOOL
 * 
 * Công cụ quản trị an toàn để cấp tài khoản ban đầu cho EduMate Huế:
 * 1. Người học: 23K4080035@hce.edu.vn (Role: student)
 * 2. Quản lý:   Leanhdiemnhu240905@gmail.com (Role: manager)
 * 3. Người dạy: Gmail thật của từng người dạy (Role: tutor)
 * 
 * NGUYÊN TẮC BẢO MẬT:
 * - KHÔNG lưu mật khẩu hoặc Service Role Key trong mã nguồn hoặc Git.
 * - Đọc SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY từ biến môi trường.
 * - Mật khẩu được nhập trực tiếp qua CLI hoặc tạo mật khẩu tạm thời yêu cầu đổi khi đăng nhập.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('\n[LỖI CẤU HÌNH BẢO MẬT]');
  console.error('Vui lòng thiết lập biến môi trường trước khi chạy công cụ này:');
  console.error('  $env:SUPABASE_URL = "https://your-project.supabase.co"');
  console.error('  $env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"');
  console.error('\nLƯU Ý: Tuyệt đối không commit hoặc để lộ Service Role Key vào kho mã nguồn Git!\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DESIGNATED_ACCOUNTS = [
  {
    role: 'student',
    email: '23K4080035@hce.edu.vn',
    full_name: 'Lê Anh Diễm Như (Người học)',
    student_code: '23K4080035',
    phone: '0912345678',
    notes: 'Tài khoản người học chính thức của sinh viên Khoa HTTT Kinh tế, HCE'
  },
  {
    role: 'manager',
    email: 'Leanhdiemnhu240905@gmail.com',
    full_name: 'Lê Anh Diễm Như (Quản lý EduMate)',
    student_code: null,
    phone: '0987654321',
    notes: 'Tài khoản Quản trị viên cấp cao có thẩm quyền đối soát VietQR và duyệt hoàn tiền'
  }
];

async function provisionAccount(account, initialPassword) {
  console.log(`\n-------------------------------------------------------------`);
  console.log(`Đang xử lý tài khoản: ${account.email} (${account.role})`);

  // 1. Kiểm tra tài khoản đã tồn tại trong auth.users chưa
  const { data: usersList, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    throw new Error(`Lỗi kiểm tra auth.users: ${listErr.message}`);
  }

  const existingUser = usersList.users.find(u => u.email?.toLowerCase() === account.email.toLowerCase());
  let userId;

  if (existingUser) {
    userId = existingUser.id;
    console.log(`  ✓ Tài khoản auth.users đã tồn tại (ID: ${userId})`);
    
    // Nếu có truyền mật khẩu, cập nhật lại mật khẩu an toàn
    if (initialPassword) {
      const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
        password: initialPassword,
        email_confirm: true,
        user_metadata: {
          full_name: account.full_name,
          role: account.role,
          student_code: account.student_code,
          phone: account.phone
        }
      });
      if (updateErr) throw updateErr;
      console.log(`  ✓ Đã cập nhật mật khẩu và metadata`);
    }
  } else {
    // Tạo mới tài khoản qua Supabase Auth Admin API
    if (!initialPassword) {
      throw new Error(`Tài khoản mới bắt buộc phải cung cấp mật khẩu ban đầu an toàn.`);
    }

    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: account.email,
      password: initialPassword,
      email_confirm: true, // Tự động xác thực email để người dùng có thể đăng nhập ngay
      user_metadata: {
        full_name: account.full_name,
        role: account.role,
        student_code: account.student_code,
        phone: account.phone
      }
    });

    if (createErr) throw createErr;
    userId = newUser.user.id;
    console.log(`  ✓ Tạo mới thành công tài khoản auth.users (ID: ${userId})`);
  }

  // 2. Đồng bộ bảng public.profiles
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: account.email,
      full_name: account.full_name,
      student_code: account.student_code,
      phone: account.phone,
      updated_at: new Date().toISOString()
    });

  if (profileErr) {
    console.warn(`  ! Cảnh báo khi ghi profiles: ${profileErr.message}`);
  } else {
    console.log(`  ✓ Đã đồng bộ thông tin vào public.profiles`);
  }

  // 3. Phân định vai trò độc lập trong public.user_roles (Chặn tự leo thang quyền)
  const { error: roleErr } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role: account.role,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

  if (roleErr) {
    throw new Error(`Lỗi cập nhật bảng user_roles: ${roleErr.message}`);
  } else {
    console.log(`  ✓ Đã gán vai trò chính thức [${account.role.toUpperCase()}] trong public.user_roles`);
  }

  console.log(`  => Hoàn tất khởi tạo cho: ${account.email}`);
}

async function main() {
  console.log('=============================================================');
  console.log(' EDU MATE HUẾ - KHỞI TẠO TÀI KHOẢN VÀ PHÂN QUYỀN AN TOÀN');
  console.log('=============================================================');

  const args = process.argv.slice(2);
  const passwordArg = args.find(a => a.startsWith('--password='))?.split('=')[1];
  const tutorEmailArg = args.find(a => a.startsWith('--tutor-email='))?.split('=')[1];
  const tutorNameArg = args.find(a => a.startsWith('--tutor-name='))?.split('=')[1] || 'Người dạy (Khóa trước)';

  if (!passwordArg) {
    console.log('\nHướng dẫn sử dụng:');
    console.log('  node scripts/provision_accounts.mjs --password="<MatKhauKhoiTaoAnToan>"');
    console.log('\nThêm người dạy bằng Gmail thật:');
    console.log('  node scripts/provision_accounts.mjs --password="<MatKhau>" --tutor-email="giaosu@gmail.com" --tutor-name="Anh Lê Hoàng Nam (K44)"');
    console.log('\nLƯU Ý: Không sử dụng mật khẩu đơn giản; yêu cầu tối thiểu 8 ký tự.');
    return;
  }

  try {
    for (const acc of DESIGNATED_ACCOUNTS) {
      await provisionAccount(acc, passwordArg);
    }

    if (tutorEmailArg) {
      const tutorAccount = {
        role: 'tutor',
        email: tutorEmailArg,
        full_name: tutorNameArg,
        student_code: null,
        phone: null,
        notes: 'Người dạy được cấp tài khoản bằng Gmail thật'
      };
      await provisionAccount(tutorAccount, passwordArg);
    }

    console.log('\n=============================================================');
    console.log(' TẤT CẢ TÀI KHOẢN ĐÃ ĐƯỢC CẤP QUYỀN VÀ KHỞI TẠO THÀNH CÔNG!');
    console.log('=============================================================\n');
  } catch (err) {
    console.error('\n[LỖI QUÁ TRÌNH KHỞI TẠO]:', err.message);
    process.exit(1);
  }
}

main();

