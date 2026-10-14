// ==============================================================================
// EDUMATE HUẾ - DANH MỤC 38 HỌC PHẦN ĐẠI HỌC CHUẨN
// Slogan: "Tìm đúng người dạy – Học đúng điều cần."
// ==============================================================================

export interface CourseSubject {
  stt: number;
  code: string;
  name: string;
  category: string;
  credits: number;
  description: string;
}

export const EDUMATE_SUBJECTS: CourseSubject[] = [
  {
    stt: 1,
    code: 'ECO2013',
    name: 'Nguyên lý kế toán',
    category: 'Kinh tế, Tài chính & Kế toán',
    credits: 3,
    description: 'Bản chất kế toán, các phương pháp hạch toán, hệ thống tài khoản và lập báo cáo tài chính cơ bản.'
  },
  {
    stt: 2,
    code: 'LLCTLS2',
    name: 'Lịch sử Đảng Cộng sản Việt Nam',
    category: 'Lý luận Chính trị & Khoa học Xã hội',
    credits: 2,
    description: 'Sự ra đời của Đảng, các đường lối chiến lược cách mạng Việt Nam qua các thời kỳ lịch sử.'
  },
  {
    stt: 3,
    code: 'LLCTTT2',
    name: 'Tư tưởng Hồ Chí Minh',
    category: 'Lý luận Chính trị & Khoa học Xã hội',
    credits: 2,
    description: 'Nguồn gốc, quá trình hình thành và hệ thống quan điểm toàn diện của Chủ tịch Hồ Chí Minh.'
  },
  {
    stt: 4,
    code: 'KTPT2023',
    name: 'Kinh tế vi mô 1',
    category: 'Kinh tế, Tài chính & Kế toán',
    credits: 3,
    description: 'Hành vi của người tiêu dùng, lý thuyết sản xuất - chi phí, cân bằng cung cầu và các cấu trúc thị trường.'
  },
  {
    stt: 5,
    code: 'KTPT2033',
    name: 'Kinh tế vĩ mô 1',
    category: 'Kinh tế, Tài chính & Kế toán',
    credits: 3,
    description: 'Sản lượng quốc gia GDP, lạm phát, thất nghiệp, chính sách tài khóa và tiền tệ trong nền kinh tế.'
  },
  {
    stt: 6,
    code: 'ECO1007',
    name: 'Thống kê trong Kinh tế và Kinh doanh',
    category: 'Toán, Thống kê & Kinh tế lượng',
    credits: 3,
    description: 'Thu thập, xử lý dữ liệu số liệu kinh tế, phân tích tương quan và dự báo chuỗi thời gian.'
  },
  {
    stt: 7,
    code: 'HTTT4233',
    name: 'Cơ sở dữ liệu nâng cao',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: 'Tối ưu hóa truy vấn SQL, chỉ mục nâng cao, Transaction ACID, NoSQL và thiết kế CSDL phân tán.'
  },
  {
    stt: 8,
    code: 'ECO2407',
    name: 'Hệ thống hoạch định nguồn lực doanh nghiệp (ERP)',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: 'Kiến trúc giải pháp ERP (SAP, Odoo), tích hợp quy trình nghiệp vụ mua bán hàng, kho vận và kế toán.'
  },
  {
    stt: 9,
    code: 'ECO2411',
    name: 'Kinh tế lượng',
    category: 'Toán, Thống kê & Kinh tế lượng',
    credits: 3,
    description: 'Mô hình hồi quy tuyến tính OLS, kiểm định đa cộng tuyến, phương sai thay đổi và tự tương quan với Stata/EViews/R.'
  },
  {
    stt: 10,
    code: 'ECO1009',
    name: 'Toán ứng dụng trong kinh tế',
    category: 'Toán, Thống kê & Kinh tế lượng',
    credits: 3,
    description: 'Ứng dụng đạo hàm, tích phân, ma trận nghịch đảo và quy hoạch tuyến tính trong tối ưu hóa lợi nhuận.'
  },
  {
    stt: 11,
    code: 'ECO2015',
    name: 'Quản trị học',
    category: 'Quản trị & Ứng dụng Thực tiễn',
    credits: 3,
    description: 'Các chức năng quản trị cốt lõi: Hoạch định, Tổ chức, Lãnh đạo và Kiểm soát trong doanh nghiệp hiện đại.'
  },
  {
    stt: 12,
    code: 'ECO2434',
    name: 'Toán rời rạc',
    category: 'Toán, Thống kê & Kinh tế lượng',
    credits: 3,
    description: 'Lý thuyết tập hợp, logic mệnh đề, tổ hợp, đồ thị và cây ứng dụng trong thuật toán tin học.'
  },
  {
    stt: 13,
    code: 'HTTT2123',
    name: 'Kiến trúc máy tính và hệ điều hành',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: 'Nguyên lý phần cứng CPU, bộ nhớ RAM, phân trang, luồng tiến trình và quản lý bộ nhớ HĐH Linux/Windows.'
  },
  {
    stt: 14,
    code: 'ECO2408',
    name: 'Hệ thống thông tin quản lý',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: 'Vai trò của MIS trong quản trị chiến lược, phân tích luồng thông tin và ứng dụng CNTT doanh nghiệp.'
  },
  {
    stt: 15,
    code: 'ECO2401',
    name: 'Cấu trúc dữ liệu và Giải thuật',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: 'Danh sách liên kết, Stack, Queue, Tree, Heap, các thuật toán sắp xếp (QuickSort, MergeSort) và tìm kiếm.'
  },
  {
    stt: 16,
    code: 'ECO2320',
    name: 'Lập và phân tích dự án',
    category: 'Quản trị & Ứng dụng Thực tiễn',
    credits: 3,
    description: 'Xây dựng dòng tiền dự án, thẩm định hiệu quả tài chính qua chỉ số NPV, IRR, BCR và thời gian hoàn vốn.'
  },
  {
    stt: 17,
    code: 'LLCTKT2',
    name: 'Kinh tế chính trị Mác - Lênin',
    category: 'Lý luận Chính trị & Khoa học Xã hội',
    credits: 2,
    description: 'Hàng hóa, tiền tệ, giá trị thặng dư, quy luật kinh tế thị trường và chủ nghĩa tư bản độc quyền.'
  },
  {
    stt: 18,
    code: 'HTTT1033',
    name: 'Lý thuyết xác suất và thống kê toán',
    category: 'Toán, Thống kê & Kinh tế lượng',
    credits: 3,
    description: 'Biến ngẫu nhiên, các hàm phân phối xác suất (Chuẩn, Nhị thức, Poisson), ước lượng tham số và kiểm định giả thuyết.'
  },
  {
    stt: 19,
    code: 'DHKT2023',
    name: 'Tiếng Anh chuyên ngành',
    category: 'Ngoại ngữ & Kỹ năng',
    credits: 3,
    description: 'Thuật ngữ tiếng Anh Kinh tế - Thương mại, đọc hiểu tài liệu tài chính và giao tiếp phỏng vấn chuyên nghiệp.'
  },
  {
    stt: 20,
    code: 'ECO2413',
    name: 'Lập trình hướng đối tượng',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: '4 trụ cột OOP (Đóng gói, Kế thừa, Đa hình, Trừu tượng), lập trình Java/C#/TypeScript và Design Patterns.'
  },
  {
    stt: 21,
    code: 'HTTT4243',
    name: 'Lập trình nâng cao',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: 'Xây dựng Web API RESTful, lập trình bất đồng bộ Asynchronous, kết nối ORM và kiến trúc microservices.'
  },
  {
    stt: 22,
    code: 'ECO2142',
    name: 'Quản trị tài chính',
    category: 'Kinh tế, Tài chính & Kế toán',
    credits: 3,
    description: 'Giá trị thời gian của tiền tệ, đòn bẩy hoạt động và tài chính, chi phí vốn WACC và quản trị vốn lưu động.'
  },
  {
    stt: 23,
    code: 'ECO2410',
    name: 'Khai phá dữ liệu',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: 'Data Mining: Tiền xử lý dữ liệu, phân lớp (Classification), gom cụm (Clustering), luật kết hợp Association Rules.'
  },
  {
    stt: 24,
    code: 'LUAT1062',
    name: 'Pháp luật đại cương',
    category: 'Lý luận Chính trị & Khoa học Xã hội',
    credits: 2,
    description: 'Nguồn gốc nhà nước và pháp luật, quy phạm pháp luật, quan hệ pháp luật và hệ thống pháp luật Việt Nam.'
  },
  {
    stt: 25,
    code: 'ECO2423',
    name: 'Phát triển hệ thống thông tin quản lý',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: 'Phương pháp luận SDLC, phân tích yêu cầu DFD, UML, thiết kế giao diện UI/UX và triển khai phần mềm.'
  },
  {
    stt: 26,
    code: 'ECO2414',
    name: 'Lập trình ứng dụng trong quản lý',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: 'Phát triển ứng dụng nghiệp vụ tự động hóa quản lý văn phòng, dashboard báo cáo và xử lý biểu mẫu.'
  },
  {
    stt: 27,
    code: 'LLCTXH2',
    name: 'Chủ nghĩa xã hội khoa học',
    category: 'Lý luận Chính trị & Khoa học Xã hội',
    credits: 2,
    description: 'Sứ mệnh lịch sử giai cấp công nhân, thời kỳ quá độ lên chủ nghĩa xã hội và vấn đề dân tộc, tôn giáo.'
  },
  {
    stt: 28,
    code: 'KTTC2223',
    name: 'Tài chính - tiền tệ 1',
    category: 'Kinh tế, Tài chính & Kế toán',
    credits: 3,
    description: 'Bản chất tiền tệ, hệ thống ngân hàng trung ương và thương mại, lãi suất và thị trường tài chính.'
  },
  {
    stt: 29,
    code: 'ECO2417',
    name: 'Mạng và truyền thông',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: 'Mô hình OSI, giao thức TCP/IP, định tuyến Router, bảo mật mạng LAN và điện toán đám mây.'
  },
  {
    stt: 30,
    code: 'ECO2433',
    name: 'Tin học ứng dụng nâng cao',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: 'Khai thác chuyên sâu Excel VBA, Power Query, Power BI xử lý mô hình hóa bảng tính doanh nghiệp.'
  },
  {
    stt: 31,
    code: 'ECO1616',
    name: 'Xã hội học đại cương',
    category: 'Lý luận Chính trị & Khoa học Xã hội',
    credits: 2,
    description: 'Cơ cấu xã hội, thiết chế xã hội, tương tác và biến đổi xã hội trong bối cảnh hiện đại hóa.'
  },
  {
    stt: 32,
    code: 'ECO2404',
    name: 'Cơ sở lập trình',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: 'Tư duy thuật toán, biến, vòng lặp, hàm, mảng, con trỏ và kỹ thuật viết code sạch với C/C++/Python.'
  },
  {
    stt: 33,
    code: 'ECO2403',
    name: 'Cơ sở dữ liệu',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: 'Mô hình thực thể kết hợp ERD, đại số quan hệ, chuẩn hóa dữ liệu 1NF - 3NF và câu lệnh SQL cơ bản.'
  },
  {
    stt: 34,
    code: 'ECO2412',
    name: 'Kỹ thuật thương mại điện tử',
    category: 'Quản trị & Ứng dụng Thực tiễn',
    credits: 3,
    description: 'Mô hình kinh doanh B2B/B2C, cổng thanh toán số, an toàn giao dịch trực tuyến và giải pháp sàn TMĐT.'
  },
  {
    stt: 35,
    code: 'LLCTTH3',
    name: 'Triết học Mác - Lênin',
    category: 'Lý luận Chính trị & Khoa học Xã hội',
    credits: 3,
    description: 'Chủ nghĩa duy vật biện chứng, phép biện chứng và chủ nghĩa duy vật lịch sử giải thích sự phát triển xã hội.'
  },
  {
    stt: 36,
    code: 'ECO1008',
    name: 'Tin học ứng dụng',
    category: 'Hệ thống Thông tin & Lập trình',
    credits: 3,
    description: 'Ứng dụng công nghệ thông tin văn phòng chuẩn quốc tế, soạn thảo văn bản, bảng tính và trình chiếu số.'
  },
  {
    stt: 37,
    code: 'DHSP1022',
    name: 'Tâm lý học đại cương',
    category: 'Lý luận Chính trị & Khoa học Xã hội',
    credits: 2,
    description: 'Các hiện tượng tâm lý người, nhận thức, tình cảm, ý chí, nhân cách và ứng dụng trong giao tiếp ứng xử.'
  },
  {
    stt: 38,
    code: 'ECO1001',
    name: 'Địa lý kinh tế',
    category: 'Kinh tế, Tài chính & Kế toán',
    credits: 2,
    description: 'Phân bố không gian các ngành kinh tế, vùng kinh tế trọng điểm miền Trung - Huế và kinh tế biển.'
  }
];

export const SUBJECT_CATEGORIES = [
  {
    id: 'cat-01',
    code: 'ECON_FIN',
    name: 'Kinh tế, Tài chính & Kế toán',
    icon: 'TrendingUp',
    description: 'Nguyên lý kế toán, Kinh tế vi mô 1, Kinh tế vĩ mô 1, Quản trị tài chính, Tài chính - tiền tệ 1, Địa lý kinh tế...',
    tutor_count: 14
  },
  {
    id: 'cat-02',
    code: 'MIS_TECH',
    name: 'Hệ thống Thông tin & Lập trình',
    icon: 'Code2',
    description: 'Cơ sở dữ liệu nâng cao, ERP, Cấu trúc dữ liệu, OOP, Khai phá dữ liệu, Cơ sở lập trình, Web API...',
    tutor_count: 18
  },
  {
    id: 'cat-03',
    code: 'MATH_STAT',
    name: 'Toán, Thống kê & Kinh tế lượng',
    icon: 'Calculator',
    description: 'Toán ứng dụng kinh tế, Thống kê kinh doanh, Kinh tế lượng, Xác suất & Thống kê toán, Toán rời rạc...',
    tutor_count: 12
  },
  {
    id: 'cat-04',
    code: 'MGMT_PROJECT',
    name: 'Quản trị & Ứng dụng Thực tiễn',
    icon: 'Briefcase',
    description: 'Quản trị học, Lập và phân tích dự án, Kỹ thuật TMĐT, Tin học ứng dụng, Tin học ứng dụng nâng cao...',
    tutor_count: 10
  },
  {
    id: 'cat-05',
    code: 'SOCIAL_LAW',
    name: 'Lý luận Chính trị & Khoa học Xã hội',
    icon: 'BookOpen',
    description: 'Triết học Mác - Lênin, Kinh tế chính trị, CNXHKH, Lịch sử Đảng, Tư tưởng HCM, Pháp luật đại cương, Tâm lý học...',
    tutor_count: 8
  },
  {
    id: 'cat-06',
    code: 'LANG_SKILLS',
    name: 'Ngoại ngữ & Kỹ năng',
    icon: 'Languages',
    description: 'Tiếng Anh chuyên ngành, Kỹ năng thuyết trình, Viết báo cáo học thuật, Luyện phản xạ giao tiếp...',
    tutor_count: 11
  }
];
