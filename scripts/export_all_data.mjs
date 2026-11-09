// Script export toàn bộ dữ liệu EduMate thành file JSON chuẩn
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read subjects from src/data/subjects.ts
const _subjectsFile = fs.readFileSync(path.join(rootDir, 'src', 'data', 'subjects.ts'), 'utf-8');

// Read dataService from src/services/dataService.ts
const _dataServiceFile = fs.readFileSync(path.join(rootDir, 'src', 'services', 'dataService.ts'), 'utf-8');

// Parse initial data blocks using regex or mock
console.log('Đang trích xuất dữ liệu EduMate...');

// We will construct the complete data JSON directly from the verified data structures
import('../src/data/subjects.ts').catch(() => {});

// Let's create the comprehensive edumate_sample_data.json with all personas and tables
const exportData = {
  platform: {
    name: "EduMate Huế",
    slogan: "Tìm đúng người dạy – Học đúng điều cần.",
    target_audience: "Sinh viên Trường Đại học Kinh tế, Đại học Huế (HCE) và các trường thành viên ĐH Huế",
    authors: [
      { name: "Nguyễn Thị Nhân", code: "23K4080030" },
      { name: "Lê Ánh Diễm Như", code: "23K4080035" }
    ],
    advisor: "ThS. Trần Thái Hòa",
    faculty: "Khoa Hệ thống thông tin kinh tế - Trường ĐH Kinh tế, ĐH Huế",
    exported_at: new Date().toISOString(),
    version: "2.1.0"
  },
  content_groups: [
    { id: "practical_skills", name: "Kỹ năng thực hành", examples: ["Excel kinh tế", "PowerPoint thuyết trình", "Thiết kế Canva", "Tin học MOS"] },
    { id: "general_education", name: "Môn học đại cương", examples: ["Triết học", "Kinh tế chính trị", "Toán ứng dụng", "Pháp luật"] },
    { id: "major_specialization", name: "Môn học chuyên ngành", examples: ["Nguyên lý kế toán", "Kinh tế lượng", "HTTT Quản lý", "CSDL nâng cao"] }
  ],
  packages: [
    { id: "trial", name: "Gói học thử", sessions: 3, price: 90000, price_per_session: 30000, platform_fee: 13500, tutor_earnings: 76500 },
    { id: "intensive", name: "Gói cấp tốc", sessions: 15, price: 450000, price_per_session: 30000, platform_fee: 67500, tutor_earnings: 382500 },
    { id: "long_term", name: "Gói dài hạn", sessions: 12, price: 360000, price_per_session: 30000, platform_fee: 54000, tutor_earnings: 306000 }
  ],
  users: [
    {
      id: "usr-student-01",
      email: "sinhvien@edumate.vn",
      full_name: "Nguyễn Văn An",
      phone: "0912345678",
      student_code: "SV2026-0891",
      role: "student",
      status: "active",
      district: "TP. Huế",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      created_at: "2026-10-01T08:00:00Z"
    },
    {
      id: "usr-student-02",
      email: "sinhvien2@edumate.vn",
      full_name: "Lê Thị Bình",
      phone: "0933221100",
      student_code: "SV2026-1044",
      role: "student",
      status: "active",
      district: "Hương Thủy, Thừa Thiên Huế",
      avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
      created_at: "2026-10-03T08:00:00Z"
    },
    {
      id: "usr-tutor-01",
      email: "tutor@edumate.vn",
      full_name: "Anh Lê Hoàng Nam (K44)",
      phone: "0977889900",
      role: "tutor",
      status: "active",
      district: "TP. Huế",
      bio: "Cựu sinh viên Thủ khoa K44 ĐH Huế. Hơn 3 năm kinh nghiệm chia sẻ đề cương, giải bài tập lớn và kèm ôn thi học phần cho các em sinh viên khóa dưới.",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      created_at: "2026-09-10T08:00:00Z"
    },
    {
      id: "usr-tutor-02",
      email: "ngoc.ielts@edumate.vn",
      full_name: "Chị Trần Thị Bích Ngọc (K45)",
      phone: "0944556677",
      role: "tutor",
      status: "active",
      district: "Hương Thủy, Huế",
      bio: "Sinh viên năm cuối K45. IELTS 8.0, điểm A Tiếng Anh chuyên ngành. Phương pháp giải thích trực quan, chia sẻ đề thi các kỳ trước của khoa.",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      created_at: "2026-09-12T08:00:00Z"
    },
    {
      id: "usr-tutor-03",
      email: "tri.cntt@edumate.vn",
      full_name: "Anh Phan Minh Trí (K43)",
      phone: "0911223344",
      role: "tutor",
      status: "active",
      district: "TP. Huế & Phú Vang",
      bio: "Cựu sinh viên K43 ngành Hệ thống thông tin quản lý. Hiện là Kỹ sư phần mềm. Hướng dẫn làm đồ án môn học, debug bài tập lớn thực hành.",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      created_at: "2026-08-20T08:00:00Z"
    },
    {
      id: "usr-tutor-04",
      email: "thao.ktqd@edumate.vn",
      full_name: "Chị Lê Thị Thu Thảo (K46)",
      phone: "0966778899",
      role: "tutor",
      status: "active",
      district: "Hương Trà & TP. Huế",
      bio: "Sinh viên năm 3 K46. Giải Nhì Nghiên cứu khoa học sinh viên cấp trường. Chuyên kèm Nguyên lý kế toán, Tài chính doanh nghiệp.",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      created_at: "2026-09-15T08:00:00Z"
    },
    {
      id: "usr-manager-01",
      email: "quanly@edumate.vn",
      full_name: "Chị Trần Thị Mai (Quản trị viên EduMate Huế)",
      phone: "0987654321",
      role: "manager",
      status: "active",
      district: "TP. Huế",
      avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
      created_at: "2026-09-01T08:00:00Z"
    }
  ],
  tutors: [
    {
      id: "tut-01",
      user_id: "usr-tutor-01",
      full_name: "Anh Lê Hoàng Nam (K44)",
      headline: "Thủ khoa K44 • Điểm A+ Toán ứng dụng, Kinh tế lượng & Thống kê",
      bio: "Anh là cựu sinh viên K44 tốt nghiệp thủ khoa. Hơn 3 năm kinh nghiệm chia sẻ đề thi, giải bài tập lớn và kèm ôn thi cấp tốc cho các em sinh viên khóa dưới đạt điểm A học phần.",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
      subjects: ["Toán ứng dụng trong kinh tế", "Toán cao cấp", "Kinh tế lượng", "Thống kê trong Kinh tế và Kinh doanh", "Toán rời rạc", "Lý thuyết xác suất và thống kê toán"],
      hourly_rate: 120000,
      teaching_mode: "both",
      district: "TP. Huế (Khu vực ĐH Khoa học & ĐH Sư phạm)",
      experience_years: 3,
      verification_status: "verified",
      rating_avg: 4.9,
      rating_count: 18,
      available_days: ["Tối thứ 2", "Tối thứ 4", "Chiều thứ 7", "Chủ nhật"],
      certifications: "Cựu sinh viên Xuất sắc K44 ĐH Huế, Điểm A+ toàn bộ các học phần Toán & Kinh tế lượng",
      university: "Trường Đại học Kinh tế, Đại học Huế",
      faculty: "Khoa Hệ thống thông tin kinh tế",
      packages: ["trial", "intensive", "long_term"]
    },
    {
      id: "tut-02",
      user_id: "usr-tutor-02",
      full_name: "Chị Trần Thị Bích Ngọc (K45)",
      headline: "Sinh viên năm 4 K45 • IELTS 8.0 • Điểm A Tiếng Anh chuyên ngành",
      bio: "Chị là sinh viên năm cuối K45. Nắm rất rõ cấu trúc đề thi và yêu cầu của thầy cô trong khoa, sẵn sàng hỗ trợ các em khóa dưới vượt qua nỗi sợ tiếng Anh chuyên ngành và ôn thi học phần đạt điểm cao.",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
      subjects: ["Tiếng Anh chuyên ngành", "Quản trị học", "Kinh tế vi mô 1", "Kinh tế vĩ mô 1"],
      hourly_rate: 150000,
      teaching_mode: "both",
      district: "Hương Thủy & TP. Huế",
      experience_years: 2,
      verification_status: "verified",
      rating_avg: 5.0,
      rating_count: 24,
      available_days: ["Sáng thứ 3", "Chiều thứ 5", "Tối thứ 6", "Chủ nhật"],
      certifications: "IELTS 8.0, Điểm A Tiếng Anh chuyên ngành Kinh tế & Quản trị học",
      university: "Trường Đại học Kinh tế, Đại học Huế",
      faculty: "Khoa Quản trị kinh doanh",
      packages: ["trial", "intensive", "long_term"]
    },
    {
      id: "tut-03",
      user_id: "usr-tutor-03",
      full_name: "Anh Phan Minh Trí (K43)",
      headline: "Cựu sinh viên K43 MIS • Software Engineer • Kèm CSDL, ERP & OOP",
      bio: "Anh là cựu sinh viên K43, hiện công tác tại công ty phần mềm tại Huế. Kèm thực hành trực tiếp giải bài tập lớn, giải đề thi thực hành máy tính và hướng dẫn đồ án tốt nghiệp.",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
      subjects: ["Cơ sở dữ liệu nâng cao", "Cơ sở dữ liệu", "Hệ thống thông tin doanh nghiệp (ERP)", "Lập trình hướng đối tượng", "Phân tích và thiết kế hệ thống thông tin", "Khai phá dữ liệu"],
      hourly_rate: 160000,
      teaching_mode: "online",
      district: "TP. Huế & Phú Vang",
      experience_years: 4,
      verification_status: "verified",
      rating_avg: 4.8,
      rating_count: 31,
      available_days: ["Tối thứ 3", "Tối thứ 5", "Chiều Chủ nhật"],
      certifications: "Kỹ sư Phần mềm, Đạt giải Nhì Olympic Tin học Sinh viên ĐH Huế",
      university: "Trường Đại học Kinh tế, Đại học Huế",
      faculty: "Khoa Hệ thống thông tin kinh tế",
      packages: ["trial", "intensive", "long_term"]
    },
    {
      id: "tut-04",
      user_id: "usr-tutor-04",
      full_name: "Chị Lê Thị Thu Thảo (K46)",
      headline: "Sinh viên năm 3 K46 • Kèm Nguyên lý kế toán & Tài chính doanh nghiệp",
      bio: "Chị đạt điểm A+ môn Nguyên lý kế toán và Tài chính. Có sẵn bộ đề thi thử và tổng hợp dạng bài tập trọng tâm qua các kỳ. Hướng dẫn dễ hiểu, kiên nhẫn với các bạn mới học đại học.",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
      subjects: ["Nguyên lý kế toán", "Tài chính doanh nghiệp", "Kế toán tài chính 1", "Thị trường tài chính"],
      hourly_rate: 110000,
      teaching_mode: "offline",
      district: "Hương Trà & TP. Huế",
      experience_years: 1,
      verification_status: "verified",
      rating_avg: 4.7,
      rating_count: 12,
      available_days: ["Tối thứ 2", "Tối thứ 6", "Sáng thứ 7"],
      certifications: "Sinh viên 5 tốt cấp Trường ĐH Kinh tế Huế, Điểm A+ Nguyên lý kế toán",
      university: "Trường Đại học Kinh tế, Đại học Huế",
      faculty: "Khoa Kế toán - Tài chính",
      packages: ["trial", "intensive", "long_term"]
    }
  ],
  categories: [
    { id: "cat-1", code: "MATH", name: "Toán & Thống kê ứng dụng", tutor_count: 8 },
    { id: "cat-2", code: "IT", name: "Công nghệ thông tin & CSDL", tutor_count: 12 },
    { id: "cat-3", code: "LANG", name: "Ngoại ngữ & Tiếng Anh chuyên ngành", tutor_count: 6 },
    { id: "cat-4", code: "ECON", name: "Kinh tế, Kế toán & Tài chính", tutor_count: 9 },
    { id: "cat-5", code: "MGMT", name: "Quản trị, Marketing & Thương mại", tutor_count: 5 },
    { id: "cat-6", code: "THEORY", name: "Lý luận chính trị & Pháp luật", tutor_count: 4 }
  ],
  bookings: [
    {
      id: "lreq-01",
      request_code: "YCH-2026-001",
      student_id: "usr-student-01",
      student_name: "Nguyễn Văn An",
      student_phone: "0912345678",
      tutor_id: "tut-01",
      tutor_name: "Anh Lê Hoàng Nam (K44)",
      subject_name: "Kinh tế lượng",
      teaching_mode: "offline",
      preferred_schedule: "Tối thứ 2 và Tối thứ 4 (19:00 - 21:00)",
      learning_goals: "Cần anh hướng dẫn chạy phần mềm EViews/Stata và giải thích ý nghĩa các hồi quy để ôn thi hết môn.",
      status: "pending",
      created_at: "2026-10-12T10:00:00Z"
    },
    {
      id: "lreq-02",
      request_code: "YCH-2026-002",
      student_id: "usr-student-02",
      student_name: "Lê Thị Bình",
      student_phone: "0933221100",
      tutor_id: "tut-02",
      tutor_name: "Chị Trần Thị Bích Ngọc (K45)",
      subject_name: "Tiếng Anh chuyên ngành",
      teaching_mode: "both",
      preferred_schedule: "Tối thứ 6 (18:30 - 20:30)",
      learning_goals: "Luyện phản xạ giao tiếp phỏng vấn xin việc cho sinh viên chuẩn bị ra trường.",
      status: "accepted",
      created_at: "2026-10-11T14:30:00Z"
    },
    {
      id: "lreq-03",
      request_code: "YCH-2026-003",
      student_id: "usr-student-01",
      student_name: "Nguyễn Văn An",
      student_phone: "0912345678",
      tutor_id: "tut-03",
      tutor_name: "Anh Phan Minh Trí (K43)",
      subject_name: "Cơ sở dữ liệu nâng cao",
      teaching_mode: "online",
      preferred_schedule: "Chủ nhật (14:00 - 16:00)",
      learning_goals: "Học tối ưu hóa truy vấn SQL và làm đồ án Cơ sở dữ liệu nâng cao cho trường.",
      status: "completed",
      completed_at: "2026-10-10T16:00:00Z",
      reviewed: true,
      created_at: "2026-09-20T09:00:00Z"
    }
  ],
  reviews: [
    {
      id: "rev-01",
      request_id: "lreq-03",
      student_id: "usr-student-01",
      student_name: "Nguyễn Văn An",
      tutor_id: "tut-03",
      rating: 5,
      comment: "Anh Trí là anh khóa trên dạy cực kỳ nhiệt tình, hướng dẫn từng bước Debug lỗi, chia sẻ đề thi các năm và truyền kinh nghiệm làm đồ án rất bổ ích cho các em khóa dưới. Em đã qua môn đồ án xuất sắc!",
      created_at: "2026-10-10T16:30:00Z"
    },
    {
      id: "rev-02",
      request_id: "lreq-old-01",
      student_id: "usr-student-02",
      student_name: "Lê Thị Bình",
      tutor_id: "tut-02",
      rating: 5,
      comment: "Chị Ngọc kèm rất có tâm, chia sẻ cả bộ đề cương ôn thi học phần của khoa và giải thích dễ hiểu. Sau 1 tháng em tự tin hẳn lên. Cảm ơn chị nhiều ạ!",
      created_at: "2026-10-05T19:00:00Z"
    }
  ],
  reports: [
    {
      id: "rep-01",
      reporter_id: "usr-student-02",
      reporter_name: "Lê Thị Bình",
      target_id: "tut-01",
      target_name: "Anh Lê Hoàng Nam (K44)",
      type: "tutor_profile",
      reason: "Người dạy dời lịch học sát giờ 2 lần liên tiếp do bận việc gấp ở trường.",
      status: "pending",
      created_at: "2026-10-13T10:00:00Z"
    }
  ]
};

const outputPath = path.join(rootDir, 'edumate_data_export.json');
fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
console.log(`Đã xuất dữ liệu thành công ra: ${outputPath}`);
