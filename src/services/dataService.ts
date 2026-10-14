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
  ReportItem
} from '../types';
import { EDUMATE_SUBJECTS, SUBJECT_CATEGORIES } from '../data/subjects';

// ==============================================================================
// SEED DATA: EDUMATE HUẾ - NỀN TẢNG KẾT NỐI NGƯỜI HỌC VÀ NGƯỜI DẠY
// ==============================================================================

const initialProfiles: Profile[] = [
  {
    id: 'usr-student-01',
    email: 'sinhvien@edumate.vn',
    full_name: 'Nguyễn Văn An',
    phone: '0912345678',
    student_code: 'SV2026-0891',
    role: 'student',
    status: 'active',
    district: 'TP. Huế',
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
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-10-03T08:00:00Z',
    updated_at: '2026-10-03T08:00:00Z'
  },
  {
    id: 'usr-tutor-01',
    email: 'tutor@edumate.vn',
    full_name: 'Anh Lê Hoàng Nam (K44)',
    phone: '0977889900',
    role: 'tutor',
    status: 'active',
    district: 'TP. Huế',
    bio: 'Cựu sinh viên Thủ khoa K44 ĐH Huế. Hơn 3 năm kinh nghiệm chia sẻ đề cương, giải bài tập lớn và kèm ôn thi học phần cho các em sinh viên khóa dưới.',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-09-10T08:00:00Z',
    updated_at: '2026-09-10T08:00:00Z'
  },
  {
    id: 'usr-tutor-02',
    email: 'ngoc.ielts@edumate.vn',
    full_name: 'Chị Trần Thị Bích Ngọc (K45)',
    phone: '0944556677',
    role: 'tutor',
    status: 'active',
    district: 'Hương Thủy, Huế',
    bio: 'Sinh viên năm cuối K45. IELTS 8.0, điểm A Tiếng Anh chuyên ngành. Phương pháp giải thích trực quan, chia sẻ đề thi các kỳ trước của khoa.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-09-12T08:00:00Z',
    updated_at: '2026-09-12T08:00:00Z'
  },
  {
    id: 'usr-manager-01',
    email: 'quanly@edumate.vn',
    full_name: 'Chị Trần Thị Mai (Quản trị viên EduMate Huế)',
    phone: '0987654321',
    role: 'manager',
    status: 'active',
    district: 'TP. Huế',
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
    hourly_rate: 120000,
    teaching_mode: 'both',
    district: 'TP. Huế (Khu vực ĐH Khoa học & ĐH Sư phạm)',
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
    hourly_rate: 150000,
    teaching_mode: 'both',
    district: 'Hương Thủy & TP. Huế',
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
    hourly_rate: 160000,
    teaching_mode: 'online',
    district: 'Hương Trà & TP. Huế (Dạy trực tuyến toàn quốc)',
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
    hourly_rate: 95000,
    teaching_mode: 'offline',
    district: 'Phú Vang & TP. Huế',
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
    headline: 'Cựu sinh viên K44 • Điểm A+ Hệ thống thông tin quản lý, Khai phá dữ liệu & TMĐT',
    bio: 'Anh là cựu sinh viên K44 chuyên ngành MIS. Từng hướng dẫn nhiều nhóm sinh viên khóa dưới làm đồ án môn học, phân tích yêu cầu HTTT quản lý và xử lý dữ liệu đạt điểm 9-10.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    subjects: ['Hệ thống thông tin quản lý', 'Khai phá dữ liệu', 'Phát triển hệ thống thông tin quản lý', 'Lập trình ứng dụng trong quản lý', 'Kỹ thuật thương mại điện tử', 'Tin học ứng dụng nâng cao'],
    hourly_rate: 130000,
    teaching_mode: 'both',
    district: 'TP. Huế',
    experience_years: 3,
    verification_status: 'verified',
    rating_avg: 4.9,
    rating_count: 16,
    available_days: ['Tối thứ 3', 'Tối thứ 5', 'Chiều thứ 7'],
    certifications: 'Điểm A+ HTTT quản lý, Khai phá dữ liệu, Giải thưởng Nghiên cứu khoa học sinh viên',
    created_at: '2026-09-20T08:00:00Z',
    updated_at: '2026-10-01T08:00:00Z'
  },
  {
    id: 'tut-06',
    user_id: 'usr-tutor-06',
    full_name: 'Chị Lê Thu Hằng (K45)',
    headline: 'Sinh viên K45 • Thủ khoa Triết học Mác - Lênin & Các môn Lý luận chính trị',
    bio: 'Chị là sinh viên năm 4 K45. Bí quyết liên hệ thực tế và vẽ sơ đồ tư duy giúp các em khóa dưới hiểu sâu bản chất các môn Lý luận chính trị, không cần học vẹt mà vẫn đạt điểm A/A+ các kỳ thi.',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    subjects: ['Triết học Mác - Lênin', 'Kinh tế chính trị Mác - Lênin', 'Tư tưởng Hồ Chí Minh', 'Lịch sử Đảng Cộng sản Việt Nam', 'Chủ nghĩa xã hội khoa học', 'Pháp luật đại cương'],
    hourly_rate: 110000,
    teaching_mode: 'both',
    district: 'TP. Huế',
    experience_years: 2,
    verification_status: 'verified',
    rating_avg: 5.0,
    rating_count: 21,
    available_days: ['Sáng thứ 2', 'Tối thứ 4', 'Chiều Chủ nhật'],
    certifications: 'Điểm A+ Triết học Mác - Lênin, Tư tưởng HCM, Lịch sử Đảng, Pháp luật đại cương',
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
    teaching_mode: 'offline',
    preferred_schedule: 'Tối thứ 4 (19:00 - 21:00)',
    learning_goals: 'Cần anh Nam hỗ trợ ôn đề cương Tích phân suy rộng và Chuỗi Fourier để thi qua môn cuối kỳ ĐH.',
    address: 'Khu ký túc xá ĐH Huế, 42 Lê Hồng Phong, TP. Huế',
    notes: 'Em muốn học kèm trực tiếp 1-1 khoảng 4 buổi.',
    status: 'pending', // Chờ xác nhận
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
    teaching_mode: 'both',
    preferred_schedule: 'Tối thứ 6 (18:30 - 20:30)',
    learning_goals: 'Luyện phản xạ giao tiếp phỏng vấn xin việc cho sinh viên chuẩn bị ra trường.',
    notes: 'Chị Ngọc đã chấp nhận yêu cầu và hẹn bắt đầu từ tuần này.',
    status: 'accepted', // Đã chấp nhận
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
    teaching_mode: 'online',
    preferred_schedule: 'Chủ nhật (14:00 - 16:00)',
    learning_goals: 'Học tối ưu hóa truy vấn SQL và làm đồ án Cơ sở dữ liệu nâng cao cho trường.',
    notes: 'Đã hoàn thành khóa học 6 buổi rất hiệu quả.',
    status: 'completed', // Đã hoàn thành -> cho phép đánh giá
    completed_at: '2026-10-10T16:00:00Z',
    reviewed: true,
    created_at: '2026-09-20T09:00:00Z',
    updated_at: '2026-10-10T16:00:00Z'
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
    const hasLegacy = cached?.some(p => p.full_name.includes('Thầy') || p.full_name.includes('Cô'));
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
    const hasLegacyName = cached?.some(t => t.full_name.includes('Thầy') || t.full_name.includes('Cô'));
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
    const requests: LearningRequest[] = this.get('learning_requests', initialLearningRequests);
    if (!userId) return requests;

    if (role === 'student') {
      return requests.filter(r => r.student_id === userId);
    }
    if (role === 'tutor') {
      // Find tutorProfile for this user
      const myTutor = this.getTutors().find(t => t.user_id === userId);
      return requests.filter(r => r.tutor_id === myTutor?.id || r.tutor_id === userId);
    }
    return requests; // Manager/Admin sees all
  }

  createLearningRequest(data: Omit<LearningRequest, 'id' | 'request_code' | 'status' | 'reviewed' | 'created_at' | 'updated_at'>): LearningRequest {
    if (!data.learning_goals || data.learning_goals.trim().length < 10) {
      throw new Error('VALIDATION ERROR: Vui lòng mô tả mục tiêu/nội dung cần học tối thiểu 10 ký tự.');
    }

    const requests = this.getLearningRequests();
    const count = requests.length + 1;
    const newReq: LearningRequest = {
      ...data,
      id: `lreq-${Date.now()}`,
      request_code: `YCH-2026-${String(count).padStart(3, '0')}`,
      status: 'pending', // Trạng thái ban đầu bắt buộc là Chờ xác nhận
      reviewed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    requests.unshift(newReq);
    this.set('learning_requests', requests);
    this.logAction('learning_requests', newReq.id, 'CREATE', data.student_id, data.student_name, null, newReq);
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

    const old = { ...req };
    requests[idx] = {
      ...req,
      status,
      rejected_reason: status === 'rejected' ? notes : req.rejected_reason,
      completed_at: status === 'completed' ? new Date().toISOString() : req.completed_at,
      updated_at: new Date().toISOString()
    };

    this.set('learning_requests', requests);
    this.logAction('learning_requests', requestId, status === 'accepted' ? 'APPROVE' : status === 'rejected' ? 'REJECT' : 'UPDATE', userId, userName, old, requests[idx]);
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
