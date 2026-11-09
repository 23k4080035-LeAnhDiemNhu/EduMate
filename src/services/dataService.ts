import type { 
  Profile, 
  UserRole,
  TutorProfile,
  LearningRequest,
  LearningRequestStatus,
  Review,
  SubjectCategory,
  ServiceForm, 
  ServiceRequest, 
  AcademicItem, 
  Enrollment, 
  Order, 
  Payment, 
  AuditLog,
  RequestStatus,
  PaymentStatus,
  OrderStatus,
  CourseSubject,
  ReportItem,
  CoursePackage,
  CoursePackageType,
  PaymentIntent,
  PaymentIntentStatus,
  PaymentVerification,
  PaymentVerificationStatus,
  RefundRequest,
  RefundStatus,
  StudentBankAccount,
  BankConfig
} from '../types';
import { EDUMATE_PACKAGES, DEFAULT_BANK_CONFIG } from '../types';
import { EDUMATE_SUBJECTS, SUBJECT_CATEGORIES, EDUMATE_CONTENT_GROUPS } from '../data/subjects';

// ==============================================================================
// SEED DATA: EDUMATE HUẾ - NỀN TẢNG KẾT NỐI NGƯỜI HỌC VÀ NGƯỜI DẠY
// Khách hàng trọng tâm: Sinh viên Trường Đại học Kinh tế, Đại học Huế
// ==============================================================================

const initialProfiles: Profile[] = [
  {
    id: 'usr-student-01',
    email: '23K4080035@hce.edu.vn',
    full_name: 'Lê Anh Diễm Như (Sinh viên 23K4080035)',
    phone: '0912345678',
    student_code: '23K4080035',
    role: 'student',
    status: 'active',
    district: 'TP. Huế',
    university: 'Trường Đại học Kinh tế, Đại học Huế',
    faculty: 'Khoa Hệ thống thông tin kinh tế',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-10-01T08:00:00Z',
    updated_at: '2026-10-01T08:00:00Z'
  },
  {
    id: 'usr-student-02',
    email: 'sinhvien2@edumate.vn',
    full_name: 'Lê Thị Bình',
    phone: '0933221100',
    student_code: 'SV2026-1044',
    role: 'student',
    status: 'active',
    district: 'Hương Thủy, Thừa Thiên Huế',
    university: 'Trường Đại học Kinh tế, Đại học Huế',
    faculty: 'Khoa Kế toán - Kiểm toán',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-10-03T08:00:00Z',
    updated_at: '2026-10-03T08:00:00Z'
  },
  {
    id: 'usr-tutor-01',
    email: 'lehoangnam.k44@gmail.com',
    full_name: 'Anh Lê Hoàng Nam (K44)',
    phone: '0977889900',
    role: 'tutor',
    status: 'active',
    district: 'TP. Huế',
    university: 'Trường Đại học Kinh tế, Đại học Huế',
    faculty: 'Khoa Kinh tế & Phát triển',
    bio: 'Cựu sinh viên Thủ khoa K44 ĐH Huế. Hơn 3 năm kinh nghiệm chia sẻ đề cương, giải bài tập lớn và kèm ôn thi học phần cho các em sinh viên khóa dưới.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-09-10T08:00:00Z',
    updated_at: '2026-09-10T08:00:00Z'
  },
  {
    id: 'usr-tutor-02',
    email: 'tranbichngoc.k45@gmail.com',
    full_name: 'Chị Trần Thị Bích Ngọc (K45)',
    phone: '0944556677',
    role: 'tutor',
    status: 'active',
    district: 'Hương Thủy, Huế',
    university: 'Trường Đại học Kinh tế, Đại học Huế',
    faculty: 'Khoa Quản trị kinh doanh',
    bio: 'Sinh viên năm cuối K45. IELTS 8.0, điểm A Tiếng Anh chuyên ngành. Phương pháp giải thích trực quan, chia sẻ đề thi các kỳ trước của khoa.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-09-12T08:00:00Z',
    updated_at: '2026-09-12T08:00:00Z'
  },
  {
    id: 'usr-manager-01',
    email: 'Leanhdiemnhu240905@gmail.com',
    full_name: 'Lê Anh Diễm Như (Quản trị viên EduMate)',
    phone: '0987654321',
    role: 'manager',
    status: 'active',
    district: 'TP. Huế',
    university: 'Trường Đại học Kinh tế, Đại học Huế',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-09-01T08:00:00Z'
  }
];

const initialTutors: TutorProfile[] = [
  {
    id: 'tut-01',
    user_id: 'usr-tutor-01',
    full_name: 'Anh Lê Hoàng Nam (K44)',
    headline: 'Thủ khoa K44 • Điểm A+ Toán ứng dụng, Kinh tế lượng & Thống kê',
    bio: 'Anh là cựu sinh viên K44 tốt nghiệp thủ khoa. Hơn 3 năm kinh nghiệm chia sẻ đề thi, giải bài tập lớn và kèm ôn thi cấp tốc cho các em sinh viên khóa dưới đạt điểm A học phần.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    subjects: ['Toán ứng dụng trong kinh tế', 'Toán cao cấp', 'Kinh tế lượng', 'Thống kê trong Kinh tế và Kinh doanh', 'Toán rời rạc', 'Lý thuyết xác suất và thống kê toán'],
    packages: ['trial', 'intensive', 'long_term'],
    hourly_rate: 120000,
    teaching_mode: 'both',
    district: 'TP. Huế (Khu vực ĐH Khoa học & ĐH Sư phạm)',
    university: 'Trường Đại học Kinh tế, Đại học Huế',
    faculty: 'Khoa Kinh tế & Phát triển',
    experience_years: 3,
    verification_status: 'verified',
    rating_avg: 4.9,
    rating_count: 18,
    available_days: ['Tối thứ 2', 'Tối thứ 4', 'Chiều thứ 7', 'Chủ nhật'],
    certifications: 'Cựu sinh viên Xuất sắc K44 ĐH Huế, Điểm A+ toàn bộ các học phần Toán & Kinh tế lượng',
    created_at: '2026-09-10T08:00:00Z',
    updated_at: '2026-10-01T08:00:00Z'
  },
  {
    id: 'tut-02',
    user_id: 'usr-tutor-02',
    full_name: 'Chị Trần Thị Bích Ngọc (K45)',
    headline: 'Sinh viên năm 4 K45 • IELTS 8.0 • Điểm A Tiếng Anh chuyên ngành',
    bio: 'Chị là sinh viên năm cuối K45. Nắm rất rõ cấu trúc đề thi và yêu cầu của thầy cô trong khoa, sẵn sàng hỗ trợ các em khóa dưới vượt qua nỗi sợ tiếng Anh chuyên ngành và ôn thi học phần đạt điểm cao.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    subjects: ['Tiếng Anh chuyên ngành', 'Quản trị học', 'Kinh tế vi mô 1', 'Kinh tế vĩ mô 1'],
    packages: ['trial', 'intensive', 'long_term'],
    hourly_rate: 150000,
    teaching_mode: 'both',
    district: 'Hương Thủy & TP. Huế',
    university: 'Trường Đại học Kinh tế, Đại học Huế',
    faculty: 'Khoa Quản trị kinh doanh',
    experience_years: 2,
    verification_status: 'verified',
    rating_avg: 5.0,
    rating_count: 24,
    available_days: ['Sáng thứ 3', 'Chiều thứ 5', 'Tối thứ 6', 'Chủ nhật'],
    certifications: 'IELTS 8.0, Điểm A Tiếng Anh chuyên ngành Kinh tế & Quản trị học',
    created_at: '2026-09-12T08:00:00Z',
    updated_at: '2026-10-05T08:00:00Z'
  },
  {
    id: 'tut-03',
    user_id: 'usr-tutor-03',
    full_name: 'Anh Phan Minh Trí (K43)',
    headline: 'Cựu sinh viên K43 MIS • Software Engineer • Kèm CSDL, ERP & OOP',
    bio: 'Anh là cựu sinh viên K43 Hệ thống thông tin quản lý, hiện là Kỹ sư phần mềm tại Huế. Kèm 1-1 cho các em khóa dưới thực hành CSDL nâng cao, viết code OOP, cấu trúc dữ liệu và triển khai ERP.',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    subjects: ['Cơ sở dữ liệu nâng cao', 'Cấu trúc dữ liệu và Giải thuật', 'Lập trình hướng đối tượng', 'Hệ thống hoạch định nguồn lực doanh nghiệp (ERP)', 'Cơ sở lập trình', 'Khai phá dữ liệu'],
    packages: ['trial', 'intensive', 'long_term'],
    hourly_rate: 160000,
    teaching_mode: 'online',
    district: 'Hương Trà & TP. Huế (Dạy trực tuyến toàn quốc)',
    university: 'Trường Đại học Kinh tế, Đại học Huế',
    faculty: 'Khoa Hệ thống thông tin kinh tế',
    experience_years: 3,
    verification_status: 'verified',
    rating_avg: 4.8,
    rating_count: 12,
    available_days: ['Tối thứ 3', 'Tối thứ 5', 'Cả ngày Chủ nhật'],
    certifications: 'Cựu sinh viên Giỏi K43, AWS Certified Solutions Architect, Điểm A+ CSDL nâng cao & OOP',
    created_at: '2026-09-15T08:00:00Z',
    updated_at: '2026-10-08T08:00:00Z'
  },
  {
    id: 'tut-04',
    user_id: 'usr-tutor-04',
    full_name: 'Chị Hoàng Thị Diệu Thảo (K46)',
    headline: 'Sinh viên K46 • Thủ khoa Nguyên lý kế toán & Kinh tế vi mô 1',
    bio: 'Chị là sinh viên năm 3 K46. Phương pháp lập sơ đồ hạch toán chữ T, định khoản kế toán và phân tích đồ thị vi mô giúp các em sinh viên năm 1, năm 2 nắm chắc kiến thức và tự tin đi thi.',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    subjects: ['Nguyên lý kế toán', 'Kinh tế vi mô 1', 'Kinh tế vĩ mô 1', 'Quản trị tài chính', 'Tài chính - tiền tệ 1'],
    packages: ['trial', 'intensive', 'long_term'],
    hourly_rate: 95000,
    teaching_mode: 'offline',
    district: 'Phú Vang & TP. Huế',
    university: 'Trường Đại học Kinh tế, Đại học Huế',
    faculty: 'Khoa Kế toán - Kiểm toán',
    experience_years: 1,
    verification_status: 'pending', // Đang chờ Quản trị viên duyệt hồ sơ
    rating_avg: 0,
    rating_count: 0,
    available_days: ['Chiều thứ 2', 'Chiều thứ 4', 'Sáng thứ 7'],
    certifications: 'Điểm A+ Nguyên lý kế toán, Kinh tế vi mô 1, Học bổng Khuyến khích học tập ĐH Huế',
    created_at: '2026-10-10T08:00:00Z',
    updated_at: '2026-10-10T08:00:00Z'
  },
  {
    id: 'tut-05',
    user_id: 'usr-tutor-05',
    full_name: 'Anh Nguyễn Đăng Khoa (K44)',
    headline: 'Cựu sinh viên K44 • Điểm A+ Excel Kinh tế, Slide PowerPoint & HTTT Quản lý',
    bio: 'Anh là cựu sinh viên K44 chuyên ngành MIS. Chuyên gia hướng dẫn sinh viên làm chủ Excel xử lý số liệu kinh tế, thiết kế Slide PowerPoint báo cáo đồ án đạt điểm cao và phân tích HTTT.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    subjects: ['Excel Ứng Dụng Trong Kinh Tế & Báo Cáo', 'Thiết Kế Slide PowerPoint Báo Cáo Chuyên Nghiệp', 'Tin Học Văn Phòng Chuẩn MOS (Word & Excel)', 'Hệ thống thông tin quản lý', 'Khai phá dữ liệu'],
    packages: ['trial', 'intensive', 'long_term'],
    hourly_rate: 130000,
    teaching_mode: 'both',
    district: 'TP. Huế',
    university: 'Trường Đại học Kinh tế, Đại học Huế',
    faculty: 'Khoa Hệ thống thông tin kinh tế',
    experience_years: 3,
    verification_status: 'verified',
    rating_avg: 4.9,
    rating_count: 16,
    available_days: ['Tối thứ 3', 'Tối thứ 5', 'Chiều thứ 7'],
    certifications: 'Chứng chỉ Tin học văn phòng quốc tế MOS Master, Điểm A+ HTTT quản lý & Khai phá dữ liệu',
    created_at: '2026-09-20T08:00:00Z',
    updated_at: '2026-10-01T08:00:00Z'
  },
  {
    id: 'tut-06',
    user_id: 'usr-tutor-06',
    full_name: 'Chị Lê Thu Hằng (K45)',
    headline: 'Sinh viên K45 • Thủ khoa Triết học Mác - Lênin, Canva & Các môn Đại cương',
    bio: 'Chị là sinh viên năm 4 K45. Bí quyết liên hệ thực tế, vẽ sơ đồ tư duy bằng Canva giúp các em khóa dưới hiểu sâu bản chất các môn Lý luận chính trị và thiết kế bài thuyết trình sinh động.',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    subjects: ['Thiết Kế Đồ Họa Truyền Thông Với Canva', 'Triết học Mác - Lênin', 'Kinh tế chính trị Mác - Lênin', 'Tư tưởng Hồ Chí Minh', 'Lịch sử Đảng Cộng sản Việt Nam', 'Pháp luật đại cương'],
    packages: ['trial', 'intensive', 'long_term'],
    hourly_rate: 110000,
    teaching_mode: 'both',
    district: 'TP. Huế',
    university: 'Trường Đại học Kinh tế, Đại học Huế',
    faculty: 'Khoa Lý luận chính trị',
    experience_years: 2,
    verification_status: 'verified',
    rating_avg: 5.0,
    rating_count: 21,
    available_days: ['Sáng thứ 2', 'Tối thứ 4', 'Chiều Chủ nhật'],
    certifications: 'Điểm A+ Triết học Mác - Lênin, Tư tưởng HCM, Lịch sử Đảng, Kỹ năng thiết kế Canva Pro',
    created_at: '2026-09-22T08:00:00Z',
    updated_at: '2026-10-02T08:00:00Z'
  }
];

const initialLearningRequests: LearningRequest[] = [
  {
    id: 'lreq-01',
    request_code: 'YCH-2026-001',
    student_id: 'usr-student-01',
    student_name: 'Nguyễn Văn An',
    student_phone: '0912345678',
    student_email: 'sinhvien@edumate.vn',
    tutor_id: 'tut-01',
    tutor_name: 'Anh Lê Hoàng Nam (K44)',
    subject_name: 'Toán ứng dụng trong kinh tế',
    content_group: 'major_specialization',
    package_type: 'trial',
    package_name: 'Gói học thử',
    total_sessions: 3,
    total_price: 90000,
    platform_fee: 13500,
    tutor_earnings: 76500,
    teaching_mode: 'offline',
    preferred_schedule: 'Tối thứ 4 (19:00 - 21:00)',
    learning_goals: 'Cần anh Nam hỗ trợ ôn đề cương Tích phân suy rộng và Chuỗi Fourier để thi qua môn cuối kỳ ĐH.',
    address: 'Khu ký túc xá ĐH Huế, 42 Lê Hồng Phong, TP. Huế',
    notes: 'Em chọn Gói học thử 3 buổi để trải nghiệm phương pháp học.',
    status: 'pending', // Chờ xác nhận
    payment_status: 'awaiting_verification',
    payment_intent_id: 'pi-01',
    reviewed: false,
    created_at: '2026-10-12T10:00:00Z',
    updated_at: '2026-10-12T10:00:00Z'
  },
  {
    id: 'lreq-02',
    request_code: 'YCH-2026-002',
    student_id: 'usr-student-02',
    student_name: 'Lê Thị Bình',
    student_phone: '0933221100',
    student_email: 'sinhvien2@edumate.vn',
    tutor_id: 'tut-02',
    tutor_name: 'Chị Trần Thị Bích Ngọc (K45)',
    subject_name: 'Tiếng Anh chuyên ngành',
    content_group: 'general_education',
    package_type: 'intensive',
    package_name: 'Gói cấp tốc',
    total_sessions: 15,
    total_price: 450000,
    platform_fee: 67500,
    tutor_earnings: 382500,
    teaching_mode: 'both',
    preferred_schedule: 'Tối thứ 6 (18:30 - 20:30)',
    learning_goals: 'Luyện phản xạ giao tiếp phỏng vấn xin việc và ôn đề thi tiếng Anh chuyên ngành cuối khóa.',
    notes: 'Chị Ngọc đã chấp nhận yêu cầu và hẹn bắt đầu từ tuần này.',
    status: 'accepted', // Đã chấp nhận
    payment_status: 'paid',
    payment_intent_id: 'pi-02',
    reviewed: false,
    created_at: '2026-10-11T14:30:00Z',
    updated_at: '2026-10-12T08:00:00Z'
  },
  {
    id: 'lreq-03',
    request_code: 'YCH-2026-003',
    student_id: 'usr-student-01',
    student_name: 'Nguyễn Văn An',
    student_phone: '0912345678',
    student_email: 'sinhvien@edumate.vn',
    tutor_id: 'tut-03',
    tutor_name: 'Anh Phan Minh Trí (K43)',
    subject_name: 'Cơ sở dữ liệu nâng cao',
    content_group: 'major_specialization',
    package_type: 'long_term',
    package_name: 'Gói dài hạn',
    total_sessions: 12,
    total_price: 360000,
    platform_fee: 54000,
    tutor_earnings: 306000,
    teaching_mode: 'online',
    preferred_schedule: 'Chủ nhật (14:00 - 16:00)',
    learning_goals: 'Học tối ưu hóa truy vấn SQL và làm đồ án Cơ sở dữ liệu nâng cao cho trường.',
    notes: 'Đã hoàn thành khóa học 12 buổi rất hiệu quả.',
    status: 'completed', // Đã hoàn thành -> cho phép đánh giá
    payment_status: 'paid',
    payment_intent_id: 'pi-03',
    completed_at: '2026-10-10T16:00:00Z',
    reviewed: true,
    created_at: '2026-09-20T09:00:00Z',
    updated_at: '2026-10-10T16:00:00Z'
  },
  {
    id: 'lreq-04',
    request_code: 'YCH-2026-004',
    student_id: 'usr-student-02',
    student_name: 'Lê Thị Bình',
    student_phone: '0933221100',
    student_email: 'sinhvien2@edumate.vn',
    tutor_id: 'tut-05',
    tutor_name: 'Anh Nguyễn Đăng Khoa (K44)',
    subject_name: 'Excel Ứng Dụng Trong Kinh Tế & Báo Cáo',
    content_group: 'practical_skills',
    package_type: 'trial',
    package_name: 'Gói học thử',
    total_sessions: 3,
    total_price: 90000,
    platform_fee: 13500,
    tutor_earnings: 76500,
    teaching_mode: 'both',
    preferred_schedule: 'Tối thứ 3 (19:30 - 21:00)',
    learning_goals: 'Thành thạo hàm xử lý số liệu VLOOKUP, INDEX/MATCH và PivotTable để làm bài tập lớn Kế toán.',
    notes: 'Khóa học kèm 3 buổi học thử thành công tốt đẹp.',
    status: 'completed',
    payment_status: 'paid',
    payment_intent_id: 'pi-04',
    completed_at: '2026-10-14T10:00:00Z',
    reviewed: false,
    created_at: '2026-10-05T09:00:00Z',
    updated_at: '2026-10-14T10:00:00Z'
  }
];

const initialReviews: Review[] = [
  {
    id: 'rev-01',
    request_id: 'lreq-03',
    student_id: 'usr-student-01',
    student_name: 'Nguyễn Văn An',
    tutor_id: 'tut-03',
    rating: 5,
    comment: 'Anh Trí là anh khóa trên dạy cực kỳ nhiệt tình, hướng dẫn từng bước Debug lỗi, chia sẻ đề thi các năm và truyền kinh nghiệm làm đồ án rất bổ ích cho các em khóa dưới. Em đã qua môn đồ án xuất sắc!',
    created_at: '2026-10-10T16:30:00Z'
  },
  {
    id: 'rev-02',
    request_id: 'lreq-old-01',
    student_id: 'usr-student-02',
    student_name: 'Lê Thị Bình',
    tutor_id: 'tut-02',
    rating: 5,
    comment: 'Chị Ngọc kèm rất có tâm, chia sẻ cả bộ đề cương ôn thi học phần của khoa và giải thích dễ hiểu. Sau 1 tháng em tự tin hẳn lên. Cảm ơn chị nhiều ạ!',
    created_at: '2026-10-05T19:00:00Z'
  }
];

const initialCategories: SubjectCategory[] = SUBJECT_CATEGORIES;

const initialReports: ReportItem[] = [
  {
    id: 'rep-01',
    reporter_id: 'usr-student-02',
    reporter_name: 'Lê Thị Bình',
    target_id: 'tut-01',
    target_name: 'Anh Lê Hoàng Nam (K44)',
    type: 'tutor_profile',
    reason: 'Người dạy dời lịch học sát giờ 2 lần liên tiếp do bận việc gấp ở trường.',
    status: 'pending',
    created_at: '2026-10-13T10:00:00Z'
  }
];

// ==============================================================================
// LEGACY COMPATIBILITY INITIAL DATA
// ==============================================================================
const initialForms: ServiceForm[] = [
  {
    id: 'form-01',
    code: 'FORM-HOAN-THI',
    title: 'Đơn xin hoãn / đổi lịch đánh giá học tập',
    description: 'Dành cho người học có lý do bất khả kháng cần dời lịch đánh giá học phần hoặc kỳ thi.',
    schema_definition: { fields: ['ly_do', 'ngay_mong_muon', 'minh_chung'] },
    is_active: true,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z'
  }
];

const initialRequests: ServiceRequest[] = [
  {
    id: 'req-101',
    request_code: 'REQ-2026-001',
    student_id: 'usr-student-01',
    form_type_id: 'form-01',
    form_type_title: 'Đơn xin hoãn / đổi lịch đánh giá học tập',
    student_name: 'Nguyễn Văn An',
    student_email: 'sinhvien@edumate.vn',
    student_code: 'SV2026-0891',
    form_data: {
      ly_do_noi_dung: 'Tham gia hội thảo nghiên cứu khoa học cấp quốc gia',
      ngay_mong_muon: '2026-11-05'
    },
    status: 'approved',
    reviewer_id: 'usr-manager-01',
    reviewer_name: 'Trần Thị Mai',
    review_notes: 'Hồ sơ đầy đủ điều kiện.',
    reviewed_at: '2026-10-11T09:15:00Z',
    created_at: '2026-10-08T10:00:00Z',
    updated_at: '2026-10-11T09:15:00Z'
  }
];

const initialAcademicItems: AcademicItem[] = EDUMATE_SUBJECTS.map((s) => ({
  id: `acad-${s.code.toLowerCase()}`,
  code: s.code,
  title: s.name,
  description: s.description,
  category: s.category,
  standard_fee: 120000,
  status: 'published' as const,
  metadata: {
    stt: s.stt,
    credits: s.credits,
    university: 'Đại học Huế',
  },
  created_by: 'usr-manager-01',
  created_at: '2026-10-01T08:00:00Z',
  updated_at: '2026-10-01T08:00:00Z'
}));
const initialEnrollments: Enrollment[] = [];
const initialOrders: Order[] = [];
const initialPayments: Payment[] = [];
const initialAuditLogs: AuditLog[] = [];

// ==============================================================================
// INITIAL VIETQR PAYMENT INTENTS & REFUNDS DATA (DEMO SANDBOX)
// ==============================================================================
const initialPaymentIntents: PaymentIntent[] = [
  {
    id: 'pi-01',
    learning_request_id: 'lreq-01',
    request_code: 'YCH-2026-001',
    student_id: 'usr-student-01',
    student_name: 'Nguyễn Văn An',
    student_phone: '0912345678',
    student_email: 'sinhvien@edumate.vn',
    tutor_id: 'tut-01',
    tutor_name: 'Anh Lê Hoàng Nam (K44)',
    package_id: 'trial',
    package_name: 'Gói học thử',
    amount_vnd: 90000,
    platform_fee_vnd: 13500,
    tutor_share_vnd: 76500,
    transfer_reference: 'MB8472910394',
    transfer_memo: 'EDM YCH-2026-001',
    status: 'awaiting_verification',
    payment_method: 'vietqr_transfer',
    proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
    student_note: 'Em đã chuyển khoản thành công từ tài khoản MBBank, nhờ Admin đối soát giúp em.',
    is_demo: true,
    created_at: '2026-10-12T10:05:00Z',
    updated_at: '2026-10-12T10:10:00Z'
  },
  {
    id: 'pi-02',
    learning_request_id: 'lreq-02',
    request_code: 'YCH-2026-002',
    student_id: 'usr-student-02',
    student_name: 'Lê Thị Bình',
    student_phone: '0933221100',
    student_email: 'sinhvien2@edumate.vn',
    tutor_id: 'tut-02',
    tutor_name: 'Chị Trần Thị Bích Ngọc (K45)',
    package_id: 'intensive',
    package_name: 'Gói cấp tốc',
    amount_vnd: 450000,
    platform_fee_vnd: 67500,
    tutor_share_vnd: 382500,
    transfer_reference: 'VCB9928172635',
    transfer_memo: 'EDM YCH-2026-002',
    status: 'paid',
    payment_method: 'vietqr_transfer',
    proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
    is_demo: true,
    created_at: '2026-10-11T14:35:00Z',
    updated_at: '2026-10-11T15:00:00Z',
    paid_at: '2026-10-11T15:00:00Z'
  },
  {
    id: 'pi-03',
    learning_request_id: 'lreq-03',
    request_code: 'YCH-2026-003',
    student_id: 'usr-student-01',
    student_name: 'Nguyễn Văn An',
    student_phone: '0912345678',
    student_email: 'sinhvien@edumate.vn',
    tutor_id: 'tut-03',
    tutor_name: 'Anh Phan Minh Trí (K43)',
    package_id: 'long_term',
    package_name: 'Gói dài hạn',
    amount_vnd: 360000,
    platform_fee_vnd: 54000,
    tutor_share_vnd: 306000,
    transfer_reference: 'MB7749201948',
    transfer_memo: 'EDM YCH-2026-003',
    status: 'paid',
    payment_method: 'vietqr_transfer',
    is_demo: true,
    created_at: '2026-09-20T09:10:00Z',
    updated_at: '2026-09-20T10:00:00Z',
    paid_at: '2026-09-20T10:00:00Z'
  },
  {
    id: 'pi-04',
    learning_request_id: 'lreq-04',
    request_code: 'YCH-2026-004',
    student_id: 'usr-student-02',
    student_name: 'Lê Thị Bình',
    student_phone: '0933221100',
    student_email: 'sinhvien2@edumate.vn',
    tutor_id: 'tut-05',
    tutor_name: 'Anh Nguyễn Đăng Khoa (K44)',
    package_id: 'trial',
    package_name: 'Gói học thử',
    amount_vnd: 90000,
    platform_fee_vnd: 13500,
    tutor_share_vnd: 76500,
    transfer_reference: 'VCB1123498765',
    transfer_memo: 'EDM YCH-2026-004',
    status: 'paid',
    payment_method: 'vietqr_transfer',
    is_demo: true,
    created_at: '2026-10-05T09:05:00Z',
    updated_at: '2026-10-05T09:40:00Z',
    paid_at: '2026-10-05T09:40:00Z'
  }
];

const initialPaymentVerifications: PaymentVerification[] = [
  {
    id: 'pv-01',
    payment_intent_id: 'pi-02',
    bank_transaction_reference: 'VCB9928172635',
    verified_amount_vnd: 450000,
    verification_status: 'verified',
    verified_by: 'usr-manager-01',
    verified_by_name: 'Chị Trần Thị Mai (Quản trị viên EduMate Huế)',
    verified_at: '2026-10-11T15:00:00Z',
    notes: 'Đã khớp sao kê tài khoản ngân hàng VietinBank số 107879627729'
  },
  {
    id: 'pv-02',
    payment_intent_id: 'pi-03',
    bank_transaction_reference: 'MB7749201948',
    verified_amount_vnd: 360000,
    verification_status: 'verified',
    verified_by: 'usr-manager-01',
    verified_by_name: 'Chị Trần Thị Mai (Quản trị viên EduMate Huế)',
    verified_at: '2026-09-20T10:00:00Z',
    notes: 'Đã khớp sao kê tài khoản ngân hàng'
  },
  {
    id: 'pv-03',
    payment_intent_id: 'pi-04',
    bank_transaction_reference: 'VCB1123498765',
    verified_amount_vnd: 90000,
    verification_status: 'verified',
    verified_by: 'usr-manager-01',
    verified_by_name: 'Chị Trần Thị Mai (Quản trị viên EduMate Huế)',
    verified_at: '2026-10-05T09:40:00Z',
    notes: 'Đã khớp sao kê tài khoản ngân hàng'
  }
];

const initialRefundRequests: RefundRequest[] = [];

// ==============================================================================
// DATASTORE WITH PERSISTENCE & SECURE AUTHORIZATION
// ==============================================================================

class DataStore {
  private get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(`edumate_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(`edumate_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }

  // ----------------------------------------------------------------------------
  // Profiles
  // ----------------------------------------------------------------------------
  getProfiles(): Profile[] {
    const cached = this.get<Profile[]>('profiles', initialProfiles);
    const hasLegacy = cached?.some(p => p.full_name.includes('Thầy') || p.full_name.includes('Cô') || p.email === 'sinhvien@edumate.vn');
    if (!cached || hasLegacy) {
      this.set('profiles', initialProfiles);
      return initialProfiles;
    }
    return cached;
  }

  getUsers(): Profile[] {
    return this.getProfiles();
  }

  getProfileById(id: string): Profile | null {
    const profiles = this.getProfiles();
    return profiles.find(p => p.id === id) || null;
  }

  registerProfile(data: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Profile {
    // SECURITY CONSTRAINT: Prevent self-registration as manager or admin
    if (['manager', 'admin'].includes(data.role)) {
      throw new Error('SECURITY VIOLATION: Không được phép tự đăng ký với vai trò Quản lý hoặc Admin.');
    }

    const profiles = this.getProfiles();
    const newProfile: Profile = {
      ...data,
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    profiles.push(newProfile);
    this.set('profiles', profiles);
    return newProfile;
  }

  updateProfile(id: string, updates: Partial<Profile>, callerId?: string): Profile | null {
    if (callerId && callerId !== id) {
      const caller = this.getProfileById(callerId);
      if (!caller || !['manager', 'admin'].includes(caller.role)) {
        throw new Error('UNAUTHORIZED: Bạn chỉ có thể cập nhật hồ sơ cá nhân của chính mình.');
      }
    }

    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) return null;

    if (updates.full_name !== undefined) {
      const trimmed = updates.full_name.trim();
      if (!trimmed || trimmed.length < 2) {
        throw new Error('VALIDATION ERROR: Họ và tên không được để trống và phải có ít nhất 2 ký tự.');
      }
    }

    if (updates.phone !== undefined && updates.phone.trim() !== '') {
      const cleaned = updates.phone.replace(/[\s-]/g, '');
      if (!/^[0-9]{9,11}$/.test(cleaned)) {
        throw new Error('VALIDATION ERROR: Số điện thoại không hợp lệ (cần từ 9 đến 11 chữ số).');
      }
    }

    const { role: _role, status: _status, id: _id, email: _email, ...allowedUpdates } = updates;

    const old = { ...profiles[idx] };
    profiles[idx] = {
      ...profiles[idx],
      ...allowedUpdates,
      updated_at: new Date().toISOString()
    };
    this.set('profiles', profiles);
    this.logAction('profiles', id, 'UPDATE', callerId || id, profiles[idx].full_name, old, profiles[idx]);
    return profiles[idx];
  }

  // ----------------------------------------------------------------------------
  // Tutor Profiles (Người dạy - Anh/Chị Khóa Trước)
  // ----------------------------------------------------------------------------
  getTutors(filterVerifiedOnly = false): TutorProfile[] {
    const cached = this.get<TutorProfile[]>('tutors', initialTutors);
    let tutors = cached;
    const hasLegacyName = cached?.some(t => t.full_name.includes('Thầy') || t.full_name.includes('Cô') || !t.packages);
    if (!cached || cached.length < initialTutors.length || hasLegacyName) {
      tutors = initialTutors;
      this.set('tutors', initialTutors);
    }
    if (filterVerifiedOnly) {
      return tutors.filter(t => t.verification_status === 'verified');
    }
    return tutors;
  }

  getTutorById(id: string): TutorProfile | null {
    const tutors = this.getTutors();
    return tutors.find(t => t.id === id) || null;
  }

  registerTutorProfile(data: Omit<TutorProfile, 'id' | 'verification_status' | 'rating_avg' | 'rating_count' | 'created_at' | 'updated_at'>): TutorProfile {
    const tutors = this.getTutors();
    const newTutor: TutorProfile = {
      ...data,
      packages: data.packages || ['trial', 'intensive', 'long_term'],
      id: `tut-${Date.now()}`,
      verification_status: 'pending', // Bắt buộc chờ Admin duyệt
      rating_avg: 0,
      rating_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    tutors.unshift(newTutor);
    this.set('tutors', tutors);
    this.logAction('tutor_profiles', newTutor.id, 'CREATE', data.user_id, data.full_name, null, newTutor);
    return newTutor;
  }

  registerTutor(data: Omit<TutorProfile, 'id' | 'verification_status' | 'rating_avg' | 'rating_count' | 'created_at' | 'updated_at'>): TutorProfile {
    return this.registerTutorProfile(data);
  }

  verifyTutor(tutorId: string, status: 'verified' | 'rejected', adminId: string, adminName: string): TutorProfile | null {
    const admin = this.getProfileById(adminId);
    if (!admin || !['manager', 'admin'].includes(admin.role)) {
      throw new Error('UNAUTHORIZED: Chỉ Quản trị viên mới có quyền duyệt hồ sơ người dạy.');
    }

    const tutors = this.getTutors();
    const idx = tutors.findIndex(t => t.id === tutorId);
    if (idx === -1) return null;

    const old = { ...tutors[idx] };
    tutors[idx] = {
      ...tutors[idx],
      verification_status: status,
      verified_by: adminId,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.set('tutors', tutors);
    this.logAction('tutor_profiles', tutorId, status === 'verified' ? 'APPROVE' : 'REJECT', adminId, adminName, old, tutors[idx]);
    return tutors[idx];
  }

  updateTutorProfile(tutorId: string, updates: Partial<TutorProfile>, userId: string): TutorProfile | null {
    const tutors = this.getTutors(false);
    const idx = tutors.findIndex(t => t.id === tutorId || t.user_id === userId);
    if (idx === -1) throw new Error('NOT FOUND: Không tìm thấy hồ sơ người dạy.');
    
    const user = this.getProfileById(userId);
    if (tutors[idx].user_id !== userId && (!user || !['manager', 'admin'].includes(user.role))) {
      throw new Error('UNAUTHORIZED: Bạn không có quyền cập nhật hồ sơ người dạy này.');
    }

    const old = { ...tutors[idx] };
    tutors[idx] = {
      ...tutors[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.set('tutors', tutors);
    this.logAction('tutor_profiles', tutors[idx].id, 'UPDATE', userId, user?.full_name, old, tutors[idx]);
    return tutors[idx];
  }

  // ----------------------------------------------------------------------------
  // Learning Requests (Yêu cầu học)
  // ----------------------------------------------------------------------------
  getLearningRequests(userId?: string, role?: UserRole): LearningRequest[] {
    const cached = this.get<LearningRequest[]>('learning_requests', initialLearningRequests);
    const hasLegacy = cached?.some(r => !r.package_type);
    let requests = cached;
    if (!cached || hasLegacy) {
      this.set('learning_requests', initialLearningRequests);
      requests = initialLearningRequests;
    }
    if (!userId) return requests;

    if (role === 'student') {
      return requests.filter(r => r.student_id === userId);
    }
    if (role === 'tutor') {
      // Find tutorProfile for this user
      const myTutor = this.getTutors().find(t => t.user_id === userId);
      const myTutorId = myTutor?.id;
      return requests.filter(r => (myTutorId && r.tutor_id === myTutorId) || r.tutor_id === userId);
    }
    return requests; // Manager/Admin sees all
  }

  createLearningRequest(data: Omit<LearningRequest, 'id' | 'request_code' | 'status' | 'reviewed' | 'created_at' | 'updated_at'>): LearningRequest {
    if (!data.learning_goals || data.learning_goals.trim().length < 10) {
      throw new Error('VALIDATION ERROR: Vui lòng mô tả mục tiêu/nội dung cần học tối thiểu 10 ký tự.');
    }

    const packageType: CoursePackageType = data.package_type || 'trial';
    const pkg = EDUMATE_PACKAGES.find(p => p.id === packageType) || EDUMATE_PACKAGES[0];

    const requests = this.getLearningRequests();
    const count = requests.length + 1;
    const newReq: LearningRequest = {
      ...data,
      package_type: pkg.id,
      package_name: data.package_name || pkg.name,
      total_sessions: data.total_sessions || pkg.sessions,
      total_price: data.total_price || pkg.price,
      platform_fee: data.platform_fee || pkg.platform_fee,
      tutor_earnings: data.tutor_earnings || pkg.tutor_earnings,
      id: `lreq-${Date.now()}`,
      request_code: `YCH-2026-${String(count).padStart(3, '0')}`,
      status: 'pending', // Trạng thái ban đầu bắt buộc là Chờ xác nhận
      payment_status: 'pending',
      reviewed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    requests.unshift(newReq);
    this.set('learning_requests', requests);
    this.logAction('learning_requests', newReq.id, 'CREATE', data.student_id, data.student_name, null, newReq);

    // Tự động khởi tạo PaymentIntent tương ứng cho yêu cầu học này
    try {
      const intent = this.createPaymentIntent({
        learning_request_id: newReq.id,
        idempotency_key: `req-${newReq.id}`
      });
      newReq.payment_intent_id = intent.id;
      this.set('learning_requests', requests);
    } catch {
      // Ignored if intent cannot be created automatically
    }

    return newReq;
  }

  updateLearningRequestStatus(
    requestId: string,
    status: LearningRequestStatus,
    userId: string,
    userName: string,
    notes?: string
  ): LearningRequest | null {
    const requests = this.getLearningRequests();
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx === -1) throw new Error('NOT FOUND: Không tìm thấy yêu cầu học.');

    const req = requests[idx];
    const user = this.getProfileById(userId);

    // Security check:
    // If student: only allowed to cancel if status is pending
    if (user?.role === 'student' || req.student_id === userId) {
      if (status !== 'cancelled') {
        throw new Error('UNAUTHORIZED: Người học chỉ có quyền hủy bỏ yêu cầu khi đang chờ xác nhận.');
      }
      if (req.status !== 'pending') {
        throw new Error('BUSINESS RULE VIOLATION: Không thể hủy yêu cầu khi người dạy đã chấp nhận hoặc buổi học đã hoàn thành.');
      }
    }

    // If tutor: can accept, reject, complete
    if (user?.role === 'tutor') {
      if (status === 'rejected' && (!notes || notes.trim().length === 0)) {
        throw new Error('VALIDATION ERROR: Vui lòng cung cấp lý do từ chối để học viên nắm rõ.');
      }
    }

    // Nếu từ chối, kích hoạt luồng xử lý hoàn tiền / hủy thanh toán chuẩn hóa
    if (status === 'rejected') {
      const res = this.processTutorRejectionRefund(requestId, notes || 'Người dạy từ chối yêu cầu', userId);
      return res.request;
    }

    // Nếu người học hủy khi đang pending, hủy luôn PaymentIntent nếu có
    if (status === 'cancelled') {
      const intents = this.getPaymentIntents();
      const pIdx = intents.findIndex(i => i.learning_request_id === requestId);
      if (pIdx !== -1 && intents[pIdx].status === 'pending') {
        intents[pIdx] = {
          ...intents[pIdx],
          status: 'cancelled',
          updated_at: new Date().toISOString()
        };
        this.set('payment_intents', intents);
      }
    }

    const old = { ...req };
    requests[idx] = {
      ...req,
      status,
      payment_status: status === 'cancelled' && req.payment_status === 'pending' ? 'cancelled' : req.payment_status,
      rejected_reason: req.rejected_reason,
      completed_at: status === 'completed' ? new Date().toISOString() : req.completed_at,
      updated_at: new Date().toISOString()
    };

    this.set('learning_requests', requests);
    this.logAction('learning_requests', requestId, status === 'accepted' ? 'APPROVE' : 'UPDATE', userId, userName, old, requests[idx]);
    return requests[idx];
  }

  // ----------------------------------------------------------------------------
  // Reviews & Ratings (Đánh giá sau khi học)
  // ----------------------------------------------------------------------------
  getReviews(tutorId?: string): Review[] {
    const reviews: Review[] = this.get('reviews', initialReviews);
    if (tutorId) {
      return reviews.filter(r => r.tutor_id === tutorId);
    }
    return reviews;
  }

  addReview(data: Omit<Review, 'id' | 'created_at'>): Review {
    // Business rule: Only completed requests can be reviewed
    const requests = this.getLearningRequests();
    const req = requests.find(r => r.id === data.request_id);
    if (!req) throw new Error('NOT FOUND: Không tìm thấy buổi học tương ứng.');

    if (req.status !== 'completed') {
      throw new Error('BUSINESS RULE VIOLATION: Chỉ có thể gửi đánh giá sau khi buổi học đã được xác nhận hoàn thành.');
    }
    if (req.reviewed) {
      throw new Error('BUSINESS RULE VIOLATION: Buổi học này đã được gửi đánh giá trước đó.');
    }

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new Error('VALIDATION ERROR: Điểm đánh giá phải từ 1 đến 5 sao.');
    }

    if (!data.comment || data.comment.trim().length < 5) {
      throw new Error('VALIDATION ERROR: Vui lòng nhập nhận xét tối thiểu 5 ký tự.');
    }

    const reviews = this.getReviews();
    const newRev: Review = {
      ...data,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    reviews.unshift(newRev);
    this.set('reviews', reviews);

    // Mark request as reviewed
    req.reviewed = true;
    this.set('learning_requests', requests);

    // Recalculate tutor's rating average
    const tutors = this.getTutors();
    const tutorIdx = tutors.findIndex(t => t.id === data.tutor_id);
    if (tutorIdx !== -1) {
      const tutorReviews = reviews.filter(r => r.tutor_id === data.tutor_id);
      const avg = tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length;
      tutors[tutorIdx].rating_avg = Math.round(avg * 10) / 10;
      tutors[tutorIdx].rating_count = tutorReviews.length;
      this.set('tutors', tutors);
    }

    return newRev;
  }

  deleteReview(reviewId: string, managerId: string, managerName: string): boolean {
    const mgr = this.getProfileById(managerId);
    if (!mgr || !['manager', 'admin'].includes(mgr.role)) {
      throw new Error('UNAUTHORIZED: Chỉ Quản trị viên mới có quyền xóa hoặc kiểm duyệt đánh giá.');
    }
    const reviews = this.getReviews();
    const idx = reviews.findIndex(r => r.id === reviewId);
    if (idx === -1) return false;
    const removed = reviews[idx];
    reviews.splice(idx, 1);
    this.set('reviews', reviews);

    // Recalculate tutor's rating average
    const tutors = this.getTutors();
    const tutorIdx = tutors.findIndex(t => t.id === removed.tutor_id);
    if (tutorIdx !== -1) {
      const tutorReviews = reviews.filter(r => r.tutor_id === removed.tutor_id);
      if (tutorReviews.length > 0) {
        const avg = tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length;
        tutors[tutorIdx].rating_avg = Math.round(avg * 10) / 10;
        tutors[tutorIdx].rating_count = tutorReviews.length;
      } else {
        tutors[tutorIdx].rating_avg = 5.0;
        tutors[tutorIdx].rating_count = 0;
      }
      this.set('tutors', tutors);
    }
    this.logAction('reviews', reviewId, 'DELETE', managerId, managerName, removed, null);
    return true;
  }

  // ----------------------------------------------------------------------------
  // User Accounts & Roles Management
  // ----------------------------------------------------------------------------
  updateUserRole(userId: string, newRole: UserRole, managerId: string, managerName: string): Profile | null {
    const mgr = this.getProfileById(managerId);
    if (!mgr || !['manager', 'admin'].includes(mgr.role)) {
      throw new Error('UNAUTHORIZED: Chỉ Quản trị viên mới có quyền cập nhật vai trò người dùng.');
    }
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === userId);
    if (idx === -1) return null;
    const old = { ...profiles[idx] };
    profiles[idx].role = newRole;
    profiles[idx].updated_at = new Date().toISOString();
    this.set('profiles', profiles);
    this.logAction('profiles', userId, 'UPDATE', managerId, managerName, old, profiles[idx]);
    return profiles[idx];
  }

  toggleUserStatus(userId: string, managerId: string, managerName: string): Profile | null {
    const mgr = this.getProfileById(managerId);
    if (!mgr || !['manager', 'admin'].includes(mgr.role)) {
      throw new Error('UNAUTHORIZED: Chỉ Quản trị viên mới có quyền khóa/mở khóa tài khoản.');
    }
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === userId);
    if (idx === -1) return null;
    const old = { ...profiles[idx] };
    profiles[idx].status = profiles[idx].status === 'active' ? 'suspended' : 'active';
    profiles[idx].updated_at = new Date().toISOString();
    this.set('profiles', profiles);
    this.logAction('profiles', userId, 'UPDATE', managerId, managerName, old, profiles[idx]);
    return profiles[idx];
  }

  // ----------------------------------------------------------------------------
  // Reports & Disputes (Phản ánh & Khiếu nại)
  // ----------------------------------------------------------------------------
  getReports(): ReportItem[] {
    return this.get<ReportItem[]>('reports', initialReports);
  }

  createReport(data: Omit<ReportItem, 'id' | 'created_at' | 'status'>): ReportItem {
    if (!data.reason || data.reason.trim().length < 5) {
      throw new Error('VALIDATION ERROR: Vui lòng nhập lý do phản ánh tối thiểu 5 ký tự.');
    }
    const reports = this.getReports();
    const newReport: ReportItem = {
      ...data,
      id: `rep-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    reports.unshift(newReport);
    this.set('reports', reports);
    this.logAction('reports', newReport.id, 'CREATE', data.reporter_id, data.reporter_name, null, newReport);
    return newReport;
  }

  resolveReport(reportId: string, status: 'resolved' | 'dismissed', notes?: string, managerId?: string, managerName?: string): ReportItem | null {
    if (managerId) {
      const mgr = this.getProfileById(managerId);
      if (!mgr || !['manager', 'admin'].includes(mgr.role)) {
        throw new Error('UNAUTHORIZED: Chỉ Quản trị viên mới có quyền xử lý phản ánh.');
      }
    }
    const reports = this.getReports();
    const idx = reports.findIndex(r => r.id === reportId);
    if (idx === -1) return null;
    const old = { ...reports[idx] };
    reports[idx].status = status;
    reports[idx].resolution_notes = notes ? notes.trim() : undefined;
    this.set('reports', reports);
    this.logAction('reports', reportId, status === 'resolved' ? 'APPROVE' : 'REJECT', managerId || 'system', managerName || 'Quản trị viên', old, reports[idx]);
    return reports[idx];
  }

  // ----------------------------------------------------------------------------
  // Subject Categories
  // ----------------------------------------------------------------------------
  getSubjectCategories(): SubjectCategory[] {
    const cached = this.get<SubjectCategory[]>('categories', initialCategories);
    if (!cached || cached.length < initialCategories.length) {
      this.set('categories', initialCategories);
      return initialCategories;
    }
    return cached;
  }

  getSubjects(): CourseSubject[] {
    return EDUMATE_SUBJECTS;
  }

  getSubjectByCode(code: string): CourseSubject | undefined {
    return EDUMATE_SUBJECTS.find(s => s.code.toLowerCase() === code.toLowerCase());
  }

  // ----------------------------------------------------------------------------
  // Course Packages & Financial Metrics (Chương 2.6 & Chương 3.3 của PDF Đồ Án)
  // ----------------------------------------------------------------------------
  getPackages(): CoursePackage[] {
    return EDUMATE_PACKAGES;
  }

  getPackageById(id: CoursePackageType): CoursePackage | undefined {
    return EDUMATE_PACKAGES.find(p => p.id === id);
  }

  getContentGroups() {
    return EDUMATE_CONTENT_GROUPS;
  }

  getPlatformFinancialMetrics() {
    const requests = this.getLearningRequests();
    const intents = this.getPaymentIntents();
    const refunds = this.get<RefundRequest[]>('refund_requests', initialRefundRequests);

    // Gói học đã hoàn thành
    const completed = requests.filter(r => r.status === 'completed');
    const total_gmv = completed.reduce((sum, r) => sum + (r.total_price || 0), 0);
    const total_platform_fee = completed.reduce((sum, r) => sum + (r.platform_fee || 0), 0);
    const total_tutor_earnings = completed.reduce((sum, r) => sum + (r.tutor_earnings || 0), 0);

    // Đối soát thanh toán VietQR:
    // Chờ đối soát (awaiting_verification) - KHÔNG ĐƯỢC TÍNH VÀO DOANH THU THỰC TẾ
    const pendingIntents = intents.filter(i => i.status === 'awaiting_verification');
    const pending_verification_volume = pendingIntents.reduce((sum, i) => sum + i.amount_vnd, 0);
    const pending_verification_count = pendingIntents.length;

    // Đã xác minh thanh toán (paid)
    const paidIntents = intents.filter(i => i.status === 'paid');
    const paid_volume = paidIntents.reduce((sum, i) => sum + i.amount_vnd, 0);
    const paid_count = paidIntents.length;
    const paid_platform_fee = paidIntents.reduce((sum, i) => sum + i.platform_fee_vnd, 0);

    // Nghĩa vụ hoàn tiền đang xử lý (requested, under_review, approved, processing)
    const activeRefunds = refunds.filter(r => ['requested', 'under_review', 'approved', 'processing'].includes(r.status));
    const refund_liability_volume = activeRefunds.reduce((sum, r) => sum + r.refund_amount_vnd, 0);
    const refund_liability_count = activeRefunds.length;

    // Đã hoàn tiền thực tế (refunded)
    const completedRefunds = refunds.filter(r => r.status === 'refunded');
    const refunded_volume = completedRefunds.reduce((sum, r) => sum + r.refund_amount_vnd, 0);
    const refunded_count = completedRefunds.length;

    // Kế hoạch tài chính Chương 2.6.6 của PDF:
    // Chi phí vận hành hằng tháng = 2.200.000đ/tháng
    // Giá trị trung bình mỗi gói học = 300.000đ (Phí EduMate 15% = 45.000đ/gói)
    // Điểm hòa vốn lý thuyết = 2.200.000 / 45.000 ≈ 48,89 gói/tháng (~49 gói)
    const monthly_operating_cost = 2200000;
    const avg_package_fee = 45000;
    const break_even_target_packages = 49;

    return {
      completed_packages_count: completed.length,
      total_gmv,
      total_platform_fee,
      total_tutor_earnings,
      platform_fee_percent: 15,
      // VietQR Payment & Refund Metrics
      pending_verification_volume,
      pending_verification_count,
      paid_volume,
      paid_count,
      paid_platform_fee,
      refund_liability_volume,
      refund_liability_count,
      refunded_volume,
      refunded_count,
      monthly_operating_cost,
      avg_package_fee,
      break_even_target_packages,
      break_even_percent: Math.min(100, Math.round((completed.length / break_even_target_packages) * 100))
    };
  }

  // ----------------------------------------------------------------------------
  // VietQR Payments & Refund Management (Thanh toán VietQR & Quản lý hoàn tiền)
  // ----------------------------------------------------------------------------
  getBankConfig(): BankConfig {
    const config = this.get<BankConfig>('bank_config', DEFAULT_BANK_CONFIG);
    if (config && config.account_number === '0838383838') {
      this.set('bank_config', DEFAULT_BANK_CONFIG);
      return DEFAULT_BANK_CONFIG;
    }
    return config || DEFAULT_BANK_CONFIG;
  }

  updateBankConfig(updates: Partial<BankConfig>, adminId: string): BankConfig {
    const admin = this.getProfileById(adminId);
    if (!admin || !['manager', 'admin'].includes(admin.role)) {
      throw new Error('UNAUTHORIZED: Chỉ Quản trị viên mới có quyền cập nhật cấu hình tài khoản nhận thanh toán.');
    }
    const current = this.getBankConfig();
    const updated = { ...current, ...updates };
    this.set('bank_config', updated);
    this.logAction('bank_config', 'default', 'UPDATE', adminId, admin.full_name, current, updated);
    return updated;
  }

  getPaymentIntents(filter?: { student_id?: string; tutor_id?: string; status?: PaymentIntentStatus }): PaymentIntent[] {
    const cached = this.get<PaymentIntent[]>('payment_intents', initialPaymentIntents);
    let list = cached;
    if (!cached || cached.length < initialPaymentIntents.length) {
      this.set('payment_intents', initialPaymentIntents);
      list = initialPaymentIntents;
    }
    if (!filter) return list;

    if (filter.student_id) {
      list = list.filter(i => i.student_id === filter.student_id);
    }
    if (filter.tutor_id) {
      list = list.filter(i => i.tutor_id === filter.tutor_id);
    }
    if (filter.status) {
      list = list.filter(i => i.status === filter.status);
    }
    return list;
  }

  getPaymentIntentById(id: string): PaymentIntent | null {
    const intents = this.getPaymentIntents();
    return intents.find(i => i.id === id) || null;
  }

  getPaymentIntentByRequestId(requestId: string): PaymentIntent | null {
    const intents = this.getPaymentIntents();
    return intents.find(i => i.learning_request_id === requestId) || null;
  }

  createPaymentIntent(data: {
    learning_request_id: string;
    idempotency_key?: string;
    student_note?: string;
    amount_vnd?: number;
    package_id?: CoursePackageType;
    student_id?: string;
    student_name?: string;
    tutor_id?: string;
    tutor_name?: string;
  }): PaymentIntent {
    const intents = this.getPaymentIntents();

    // 1. Idempotency Check by idempotency_key
    if (data.idempotency_key) {
      const existing = intents.find(i => i.idempotency_key === data.idempotency_key);
      if (existing) return existing;
    }

    // 2. Anti-duplicate: only 1 active intent per learning_request_id
    const existingActive = intents.find(
      i => i.learning_request_id === data.learning_request_id && i.status !== 'cancelled'
    );
    if (existingActive) return existingActive;

    // Fetch learning request details if available
    const requests = this.getLearningRequests();
    const req = requests.find(r => r.id === data.learning_request_id);

    const packageType: CoursePackageType = data.package_id || req?.package_type || 'trial';
    const pkg = EDUMATE_PACKAGES.find(p => p.id === packageType) || EDUMATE_PACKAGES[0];

    const amount = data.amount_vnd ?? req?.total_price ?? pkg.price;
    const platform_fee = req?.platform_fee ?? pkg.platform_fee;
    const tutor_share = req?.tutor_earnings ?? pkg.tutor_earnings;
    const requestCode = req?.request_code || `YCH-${Date.now()}`;
    const studentId = data.student_id || req?.student_id || 'unknown';
    const studentName = data.student_name || req?.student_name || 'Học viên';
    const tutorId = data.tutor_id || req?.tutor_id || 'unknown';
    const tutorName = data.tutor_name || req?.tutor_name || 'Người dạy';

    const newIntent: PaymentIntent = {
      id: `pi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      learning_request_id: data.learning_request_id,
      request_code: requestCode,
      student_id: studentId,
      student_name: studentName,
      student_email: req?.student_email,
      student_phone: req?.student_phone,
      tutor_id: tutorId,
      tutor_name: tutorName,
      package_id: packageType,
      package_name: pkg.name,
      amount_vnd: amount,
      platform_fee_vnd: platform_fee,
      tutor_share_vnd: tutor_share,
      transfer_memo: `EDM ${requestCode}`,
      status: 'pending', // Khởi tạo bắt buộc là pending
      idempotency_key: data.idempotency_key,
      payment_method: 'vietqr_transfer',
      student_note: data.student_note,
      is_demo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    intents.unshift(newIntent);
    this.set('payment_intents', intents);

    // Update learning request with payment_intent_id if needed
    if (req && !req.payment_intent_id) {
      req.payment_intent_id = newIntent.id;
      req.payment_status = 'pending';
      this.set('learning_requests', requests);
    }

    this.logAction('payment_intents', newIntent.id, 'CREATE', studentId, studentName, null, newIntent);
    return newIntent;
  }

  submitPaymentTransfer(
    paymentIntentId: string,
    transactionRef: string,
    proofUrl?: string,
    studentNote?: string,
    studentId?: string
  ): PaymentIntent {
    const intents = this.getPaymentIntents();
    const idx = intents.findIndex(i => i.id === paymentIntentId);
    if (idx === -1) throw new Error('NOT FOUND: Không tìm thấy giao dịch thanh toán.');

    const intent = intents[idx];

    // RLS: Caller verification
    if (studentId && intent.student_id !== studentId) {
      const user = this.getProfileById(studentId);
      if (!user || !['manager', 'admin'].includes(user.role)) {
        throw new Error('UNAUTHORIZED: Bạn không có quyền thao tác trên giao dịch thanh toán của người khác.');
      }
    }

    if (!transactionRef || transactionRef.trim().length < 3) {
      throw new Error('VALIDATION ERROR: Vui lòng nhập mã giao dịch ngân hàng hoặc số tham chiếu chuyển khoản hợp lệ (tối thiểu 3 ký tự).');
    }

    if (intent.status === 'paid') {
      throw new Error('BUSINESS RULE VIOLATION: Giao dịch này đã được xác nhận thanh toán thành công trước đó.');
    }
    if (intent.status === 'cancelled') {
      throw new Error('BUSINESS RULE VIOLATION: Không thể gửi xác nhận cho giao dịch thanh toán đã bị hủy.');
    }

    const old = { ...intent };
    intents[idx] = {
      ...intent,
      status: 'awaiting_verification', // BẮT BUỘC: Chờ đối soát, không bao giờ tự ý thành paid
      transfer_reference: transactionRef.trim(),
      proof_url: proofUrl || intent.proof_url,
      student_note: studentNote?.trim() || intent.student_note,
      updated_at: new Date().toISOString()
    };
    this.set('payment_intents', intents);

    // Update learning request payment_status
    const requests = this.getLearningRequests();
    const req = requests.find(r => r.id === intent.learning_request_id);
    if (req) {
      req.payment_status = 'awaiting_verification';
      req.updated_at = new Date().toISOString();
      this.set('learning_requests', requests);
    }

    this.logAction('payment_intents', intent.id, 'UPDATE', studentId || intent.student_id, intent.student_name, old, intents[idx]);
    return intents[idx];
  }

  verifyPaymentIntent(
    paymentIntentId: string,
    verificationStatus: PaymentVerificationStatus,
    managerId: string,
    managerName: string,
    bankTransactionRef: string,
    notes?: string
  ): { intent: PaymentIntent; verification: PaymentVerification } {
    const manager = this.getProfileById(managerId);
    if (!manager || !['manager', 'admin'].includes(manager.role)) {
      throw new Error('UNAUTHORIZED: Chỉ Quản trị viên mới có quyền đối soát và xác minh giao dịch thanh toán.');
    }

    const intents = this.getPaymentIntents();
    const idx = intents.findIndex(i => i.id === paymentIntentId);
    if (idx === -1) throw new Error('NOT FOUND: Không tìm thấy giao dịch thanh toán.');

    const intent = intents[idx];
    const old = { ...intent };

    let newStatus: PaymentIntentStatus = intent.status;
    if (verificationStatus === 'verified') {
      newStatus = 'paid';
    } else if (verificationStatus === 'rejected') {
      newStatus = 'cancelled';
    } else if (verificationStatus === 'needs_review') {
      newStatus = 'needs_review';
    }

    intents[idx] = {
      ...intent,
      status: newStatus,
      paid_at: verificationStatus === 'verified' ? new Date().toISOString() : intent.paid_at,
      updated_at: new Date().toISOString()
    };
    this.set('payment_intents', intents);

    // Create PaymentVerification record
    const verifications = this.getPaymentVerifications();
    const newVerification: PaymentVerification = {
      id: `pv-${Date.now()}`,
      payment_intent_id: intent.id,
      bank_transaction_reference: bankTransactionRef || intent.transfer_reference || 'N/A',
      verified_amount_vnd: intent.amount_vnd,
      verification_status: verificationStatus,
      verified_by: managerId,
      verified_by_name: managerName,
      verified_at: new Date().toISOString(),
      notes: notes?.trim()
    };
    verifications.unshift(newVerification);
    this.set('payment_verifications', verifications);

    // Update learning request payment_status
    const requests = this.getLearningRequests();
    const req = requests.find(r => r.id === intent.learning_request_id);
    if (req) {
      req.payment_status = newStatus;
      req.updated_at = new Date().toISOString();
      this.set('learning_requests', requests);
    }

    this.logAction(
      'payment_intents',
      intent.id,
      verificationStatus === 'verified' ? 'APPROVE' : verificationStatus === 'rejected' ? 'REJECT' : 'UPDATE',
      managerId,
      managerName,
      old,
      intents[idx]
    );

    return { intent: intents[idx], verification: newVerification };
  }

  getPaymentVerifications(paymentIntentId?: string): PaymentVerification[] {
    const list = this.get<PaymentVerification[]>('payment_verifications', initialPaymentVerifications);
    if (paymentIntentId) {
      return list.filter(v => v.payment_intent_id === paymentIntentId);
    }
    return list;
  }

  processTutorRejectionRefund(
    requestId: string,
    reason: string,
    tutorId: string
  ): { request: LearningRequest; intent: PaymentIntent | null; refund: RefundRequest | null } {
    if (!reason || reason.trim().length === 0) {
      throw new Error('VALIDATION ERROR: Vui lòng cung cấp lý do từ chối để học viên nắm rõ.');
    }

    const requests = this.getLearningRequests();
    const reqIdx = requests.findIndex(r => r.id === requestId);
    if (reqIdx === -1) throw new Error('NOT FOUND: Không tìm thấy yêu cầu học.');

    const req = requests[reqIdx];
    const tutorUser = this.getProfileById(tutorId);

    // Authorization check: Must be the tutor or manager/admin
    if (tutorUser && tutorUser.role === 'tutor') {
      const myTutor = this.getTutors().find(t => t.user_id === tutorId);
      if (req.tutor_id !== tutorId && (!myTutor || req.tutor_id !== myTutor.id)) {
        throw new Error('UNAUTHORIZED: Bạn không có quyền từ chối yêu cầu của người dạy khác.');
      }
    }

    const intents = this.getPaymentIntents();
    const intentIdx = intents.findIndex(i => i.learning_request_id === requestId);
    let intent: PaymentIntent | null = intentIdx !== -1 ? intents[intentIdx] : null;
    let refund: RefundRequest | null = null;

    if (!intent || intent.status === 'pending') {
      // Case 1: Tutor rejects when unpaid (pending) -> cancel payment intent, no refund needed
      if (intent) {
        intents[intentIdx] = {
          ...intent,
          status: 'cancelled',
          updated_at: new Date().toISOString()
        };
        this.set('payment_intents', intents);
        intent = intents[intentIdx];
      }
      requests[reqIdx] = {
        ...req,
        status: 'rejected',
        payment_status: 'cancelled',
        rejected_reason: reason.trim(),
        updated_at: new Date().toISOString()
      };
    } else if (intent.status === 'awaiting_verification') {
      // Case 2: Tutor rejects when in verification -> flag for admin review
      intents[intentIdx] = {
        ...intent,
        status: 'needs_review',
        updated_at: new Date().toISOString()
      };
      this.set('payment_intents', intents);
      intent = intents[intentIdx];

      requests[reqIdx] = {
        ...req,
        status: 'rejected',
        payment_status: 'needs_review',
        rejected_reason: reason.trim(),
        updated_at: new Date().toISOString()
      };
    } else if (intent.status === 'paid') {
      // Case 3: Tutor rejects when already paid -> auto-creates RefundRequest (100% package price, NO 15% platform fee penalty)
      intents[intentIdx] = {
        ...intent,
        status: 'refund_pending',
        updated_at: new Date().toISOString()
      };
      this.set('payment_intents', intents);
      intent = intents[intentIdx];

      requests[reqIdx] = {
        ...req,
        status: 'rejected',
        payment_status: 'refund_pending',
        rejected_reason: reason.trim(),
        updated_at: new Date().toISOString()
      };

      // Anti-double refund check
      const refunds = this.get<RefundRequest[]>('refund_requests', initialRefundRequests);
      const existingRefund = refunds.find(r => r.payment_intent_id === intent?.id);
      if (existingRefund) {
        refund = existingRefund;
      } else {
        refund = {
          id: `ref-${Date.now()}`,
          payment_intent_id: intent.id,
          learning_request_id: req.id,
          request_code: req.request_code,
          student_id: req.student_id,
          student_name: req.student_name,
          refund_amount_vnd: intent.amount_vnd, // 100% HOÀN TIỀN, KHÔNG PHẠT PHÍ NỀN TẢNG!
          reason: `Người dạy từ chối: ${reason.trim()}`,
          status: 'requested',
          requested_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        refunds.unshift(refund);
        this.set('refund_requests', refunds);
        this.logAction('refund_requests', refund.id, 'CREATE', tutorId, tutorUser?.full_name || 'Người dạy', null, refund);
      }
    } else {
      // Already cancelled or refunded
      requests[reqIdx] = {
        ...req,
        status: 'rejected',
        rejected_reason: reason.trim(),
        updated_at: new Date().toISOString()
      };
    }

    this.set('learning_requests', requests);
    this.logAction('learning_requests', req.id, 'REJECT', tutorId, tutorUser?.full_name || 'Người dạy', null, requests[reqIdx]);

    return { request: requests[reqIdx], intent, refund };
  }

  getRefundRequests(userId?: string, role?: UserRole): RefundRequest[] {
    const cached = this.get<RefundRequest[]>('refund_requests', initialRefundRequests);
    if (role === 'student' && userId) {
      return cached.filter(r => r.student_id === userId);
    }
    if (role === 'tutor') {
      // Tutor sees refund info without sensitive student bank account (Bảo mật quyền riêng tư)
      return cached.map(r => {
        const { student_bank_account: _omitted, ...safeRefund } = r;
        return safeRefund as RefundRequest;
      });
    }
    return cached; // Manager/Admin sees all with bank details
  }

  getRefundRequestById(id: string): RefundRequest | null {
    const refunds = this.getRefundRequests();
    return refunds.find(r => r.id === id) || null;
  }

  getRefundRequestByRequestId(requestId: string): RefundRequest | null {
    const refunds = this.getRefundRequests();
    return refunds.find(r => r.learning_request_id === requestId) || null;
  }

  createRefundRequest(data: {
    payment_intent_id: string;
    learning_request_id: string;
    reason: string;
    student_id: string;
    student_name: string;
  }): RefundRequest {
    const refunds = this.get<RefundRequest[]>('refund_requests', initialRefundRequests);
    const existing = refunds.find(r => r.payment_intent_id === data.payment_intent_id && r.status !== 'rejected');
    if (existing) return existing;

    const intent = this.getPaymentIntentById(data.payment_intent_id);
    if (!intent) throw new Error('NOT FOUND: Không tìm thấy giao dịch thanh toán để hoàn tiền.');
    if (intent.status !== 'paid' && intent.status !== 'refund_pending') {
      throw new Error('BUSINESS RULE VIOLATION: Chỉ có thể yêu cầu hoàn tiền cho giao dịch đã thanh toán thành công.');
    }

    const requests = this.getLearningRequests();
    const req = requests.find(r => r.id === data.learning_request_id);

    const newRefund: RefundRequest = {
      id: `ref-${Date.now()}`,
      payment_intent_id: data.payment_intent_id,
      learning_request_id: data.learning_request_id,
      request_code: req?.request_code || intent.request_code,
      student_id: data.student_id,
      student_name: data.student_name,
      refund_amount_vnd: intent.amount_vnd,
      reason: data.reason.trim(),
      status: 'requested',
      requested_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    refunds.unshift(newRefund);
    this.set('refund_requests', refunds);

    intent.status = 'refund_pending';
    this.set('payment_intents', this.getPaymentIntents());

    if (req) {
      req.payment_status = 'refund_pending';
      this.set('learning_requests', requests);
    }

    this.logAction('refund_requests', newRefund.id, 'CREATE', data.student_id, data.student_name, null, newRefund);
    return newRefund;
  }

  updateStudentRefundAccount(refundId: string, studentId: string, bankAccount: StudentBankAccount): RefundRequest {
    if (!bankAccount.bank_name?.trim() || !bankAccount.account_number?.trim() || !bankAccount.account_holder?.trim()) {
      throw new Error('VALIDATION ERROR: Vui lòng nhập đầy đủ Tên ngân hàng, Số tài khoản và Tên chủ tài khoản nhận tiền hoàn.');
    }

    const refunds = this.get<RefundRequest[]>('refund_requests', initialRefundRequests);
    const idx = refunds.findIndex(r => r.id === refundId);
    if (idx === -1) throw new Error('NOT FOUND: Không tìm thấy yêu cầu hoàn tiền.');

    const refund = refunds[idx];
    if (refund.student_id !== studentId) {
      const user = this.getProfileById(studentId);
      if (!user || !['manager', 'admin'].includes(user.role)) {
        throw new Error('UNAUTHORIZED: Bạn không có quyền cập nhật tài khoản nhận tiền hoàn của sinh viên khác.');
      }
    }

    refunds[idx] = {
      ...refund,
      student_bank_account: {
        bank_name: bankAccount.bank_name.trim(),
        bank_code: bankAccount.bank_code?.trim(),
        account_number: bankAccount.account_number.trim(),
        account_holder: bankAccount.account_holder.trim().toUpperCase()
      },
      updated_at: new Date().toISOString()
    };
    this.set('refund_requests', refunds);
    return refunds[idx];
  }

  processRefundRequest(
    refundId: string,
    status: RefundStatus,
    managerId: string,
    managerName: string,
    bankRefundRef?: string,
    notes?: string
  ): RefundRequest {
    const manager = this.getProfileById(managerId);
    if (!manager || !['manager', 'admin'].includes(manager.role)) {
      throw new Error('UNAUTHORIZED: Chỉ Quản trị viên mới có quyền xử lý yêu cầu hoàn tiền.');
    }

    const refunds = this.get<RefundRequest[]>('refund_requests', initialRefundRequests);
    const idx = refunds.findIndex(r => r.id === refundId);
    if (idx === -1) throw new Error('NOT FOUND: Không tìm thấy yêu cầu hoàn tiền.');

    const refund = refunds[idx];

    // Anti-double refund
    if (refund.status === 'refunded' && status !== 'refunded') {
      throw new Error('BUSINESS RULE VIOLATION: Giao dịch này đã được hoàn tất hoàn tiền trước đó. Không thể thay đổi trạng thái.');
    }

    if (status === 'refunded') {
      if (!bankRefundRef || bankRefundRef.trim().length === 0) {
        throw new Error('VALIDATION ERROR: Bắt buộc phải nhập mã giao dịch/tham chiếu ngân hàng để xác nhận đã hoàn tiền thực tế.');
      }
    }

    if (status === 'rejected' && (!notes || notes.trim().length === 0)) {
      throw new Error('VALIDATION ERROR: Bắt buộc phải có lý do/ghi chú khi từ chối yêu cầu hoàn tiền.');
    }

    const old = { ...refund };
    refunds[idx] = {
      ...refund,
      status,
      approved_by: ['approved', 'processing', 'refunded'].includes(status) ? managerId : refund.approved_by,
      approved_by_name: ['approved', 'processing', 'refunded'].includes(status) ? managerName : refund.approved_by_name,
      approved_at: status === 'approved' ? new Date().toISOString() : refund.approved_at,
      refunded_at: status === 'refunded' ? new Date().toISOString() : refund.refunded_at,
      bank_refund_reference: bankRefundRef ? bankRefundRef.trim() : refund.bank_refund_reference,
      admin_notes: notes ? notes.trim() : refund.admin_notes,
      updated_at: new Date().toISOString()
    };
    this.set('refund_requests', refunds);

    // If marked refunded, update PaymentIntent and LearningRequest
    if (status === 'refunded') {
      const intents = this.getPaymentIntents();
      const pIdx = intents.findIndex(i => i.id === refund.payment_intent_id);
      if (pIdx !== -1) {
        intents[pIdx] = {
          ...intents[pIdx],
          status: 'refunded',
          updated_at: new Date().toISOString()
        };
        this.set('payment_intents', intents);
      }
      const requests = this.getLearningRequests();
      const rIdx = requests.findIndex(r => r.id === refund.learning_request_id);
      if (rIdx !== -1) {
        requests[rIdx] = {
          ...requests[rIdx],
          payment_status: 'refunded',
          updated_at: new Date().toISOString()
        };
        this.set('learning_requests', requests);
      }
    }

    this.logAction(
      'refund_requests',
      refund.id,
      status === 'approved' || status === 'refunded' ? 'APPROVE' : status === 'rejected' ? 'REJECT' : 'UPDATE',
      managerId,
      managerName,
      old,
      refunds[idx]
    );

    return refunds[idx];
  }

  // ----------------------------------------------------------------------------
  // Legacy Methods for Backwards Compatibility with Existing Tests
  // ----------------------------------------------------------------------------
  getServiceForms(): ServiceForm[] { return this.get('forms', initialForms); }
  getRequests(userId?: string, role?: UserRole): ServiceRequest[] {
    const list: ServiceRequest[] = this.get('requests', initialRequests);
    if (role === 'student' && userId) return list.filter(r => r.student_id === userId);
    return list;
  }
  createRequest(data: any): ServiceRequest {
    if (!['draft', 'submitted'].includes(data.status)) throw new Error(`RLS / SECURITY VIOLATION: Sinh viên không được phép tự khởi tạo yêu cầu với trạng thái '${data.status}'.`);
    if (data.reviewer_id || data.reviewed_at) throw new Error('RLS / SECURITY VIOLATION: Sinh viên không thể tự gán người thẩm định hoặc thời điểm thẩm định.');
    const reason = data.form_data?.ly_do_noi_dung || data.form_data?.ly_do || '';
    if (data.status === 'submitted' && (!reason || String(reason).trim().length < 10)) throw new Error('VALIDATION ERROR: Lý do / nội dung yêu cầu phải có tối thiểu 10 ký tự.');
    const requests = this.getRequests();
    const count = requests.length + 1;
    const newReq: ServiceRequest = {
      ...data,
      id: `req-${Date.now()}`,
      request_code: `REQ-2026-${String(count).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    requests.unshift(newReq);
    this.set('requests', requests);
    return newReq;
  }
  cancelRequest(requestId: string, studentId: string): boolean {
    const requests = this.getRequests();
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx === -1) throw new Error('NOT FOUND: Không tìm thấy yêu cầu.');
    if (requests[idx].student_id !== studentId) throw new Error('UNAUTHORIZED: Bạn không có quyền hủy yêu cầu của sinh viên khác.');
    if (!['draft', 'submitted'].includes(requests[idx].status)) throw new Error(`BUSINESS RULE VIOLATION: Không thể hủy hồ sơ khi đã ở trạng thái '${requests[idx].status}'.`);
    requests[idx].status = 'cancelled';
    this.set('requests', requests);
    return true;
  }
  updateRequestStatus(requestId: string, status: RequestStatus, reviewerId: string, reviewerName: string, notes?: string): ServiceRequest | null {
    const reviewer = this.getProfileById(reviewerId);
    if (!reviewer || !['manager', 'admin'].includes(reviewer.role)) throw new Error('UNAUTHORIZED: Chỉ Người quản lý (Manager/Admin) mới có quyền duyệt hoặc từ chối yêu cầu.');
    if (!['in_review', 'approved', 'rejected'].includes(status)) throw new Error(`BUSINESS RULE VIOLATION: Trạng thái thẩm định không hợp lệ: '${status}'.`);
    if (status === 'rejected' && (!notes || notes.trim().length === 0)) throw new Error('VALIDATION ERROR: Bắt buộc phải có lý do/ghi chú khi từ chối hồ sơ (Ràng buộc toàn vẹn chk_review_notes_on_reject).');
    const requests = this.getRequests();
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx === -1) throw new Error('NOT FOUND: Không tìm thấy yêu cầu.');
    if (requests[idx].status === 'cancelled') throw new Error('BUSINESS RULE VIOLATION: Không thể xử lý hồ sơ đã bị người học hủy bỏ.');
    requests[idx].status = status;
    requests[idx].reviewer_id = reviewerId;
    requests[idx].reviewer_name = reviewerName;
    requests[idx].review_notes = notes ? notes.trim() : requests[idx].review_notes;
    requests[idx].reviewed_at = new Date().toISOString();
    this.set('requests', requests);
    return requests[idx];
  }
  getAcademicItems(): AcademicItem[] {
    const cached = this.get<AcademicItem[]>('academic_items', initialAcademicItems);
    if (!cached || cached.length < initialAcademicItems.length) {
      this.set('academic_items', initialAcademicItems);
      return initialAcademicItems;
    }
    return cached;
  }
  createAcademicItem(item: any): AcademicItem {
    const items = this.getAcademicItems();
    const newItem = { ...item, id: `acad-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    items.unshift(newItem);
    this.set('academic_items', items);
    return newItem;
  }
  updateAcademicItem(id: string, updates: any, managerId: string, _managerName: string): AcademicItem | null {
    const mgr = this.getProfileById(managerId);
    if (!mgr || !['manager', 'admin'].includes(mgr.role)) throw new Error('UNAUTHORIZED: Chỉ Người quản lý (Manager/Admin) mới có quyền chỉnh sửa mục học tập.');
    const items = this.getAcademicItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() };
    this.set('academic_items', items);
    return items[idx];
  }
  getEnrollments(_userId?: string, _role?: UserRole): Enrollment[] { return this.get('enrollments', initialEnrollments); }
  enrollStudent(studentId: string, academicItemId: string, itemTitle: string): Enrollment {
    const enrollments = this.getEnrollments();
    const newEnr = { id: `enr-${Date.now()}`, student_id: studentId, academic_item_id: academicItemId, academic_item_title: itemTitle, status: 'active' as const, enrolled_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    enrollments.unshift(newEnr);
    this.set('enrollments', enrollments);
    return newEnr;
  }
  getOrders(_userId?: string, _role?: UserRole): Order[] { return this.get('orders', initialOrders); }
  updateOrderStatus(orderId: string, status: OrderStatus, managerId: string, _managerName: string): Order | null {
    const mgr = this.getProfileById(managerId);
    if (!mgr || !['manager', 'admin'].includes(mgr.role)) throw new Error('UNAUTHORIZED: Chỉ Người quản lý (Manager/Admin) mới có quyền cập nhật trạng thái đơn hàng.');
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;
    orders[idx] = { ...orders[idx], status, updated_at: new Date().toISOString() };
    this.set('orders', orders);
    return orders[idx];
  }
  getPayments(): Payment[] { return this.get('payments', initialPayments); }
  createPayment(payment: any): Payment {
    if (payment.status && payment.status !== 'pending') throw new Error('SECURITY VIOLATION: Giao dịch thanh toán mới khởi tạo bắt buộc phải ở trạng thái chờ xử lý (pending).');
    if (payment.confirmed_by || payment.confirmed_at) throw new Error('SECURITY VIOLATION: Người dùng không được phép tự gán người xác nhận thanh toán.');
    const payments = this.getPayments();
    const newPay = { ...payment, id: `pay-${Date.now()}`, payment_code: `PAY-2026-${String(payments.length + 1).padStart(3, '0')}`, status: 'pending' as const, created_at: new Date().toISOString() };
    payments.unshift(newPay);
    this.set('payments', payments);
    return newPay;
  }
  verifyPayment(paymentId: string, status: PaymentStatus, managerId: string, _managerName: string): Payment | null {
    const mgr = this.getProfileById(managerId);
    if (!mgr || !['manager', 'admin'].includes(mgr.role)) throw new Error('UNAUTHORIZED: Chỉ Người quản lý (Manager/Admin) mới có quyền đối soát và xác nhận thanh toán.');
    const payments = this.getPayments();
    const idx = payments.findIndex(p => p.id === paymentId);
    if (idx === -1) return null;
    payments[idx] = { ...payments[idx], status, confirmed_by: managerId, confirmed_at: new Date().toISOString() };
    this.set('payments', payments);
    return payments[idx];
  }
  getAuditLogs(): AuditLog[] { return this.get('audit_logs', initialAuditLogs); }

  private logAction(entity_name: string, entity_id: string, action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT', performed_by: string, performed_by_name?: string, old_values?: any, new_values?: any): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = { id: `log-${Date.now()}`, entity_name, entity_id, action, performed_by, performed_by_name, old_values, new_values, created_at: new Date().toISOString() };
    logs.unshift(newLog);
    this.set('audit_logs', logs.slice(0, 50));
  }
}

export const dataService = new DataStore();
