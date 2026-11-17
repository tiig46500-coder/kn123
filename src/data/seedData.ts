import type {
  Article,
  Banner,
  BootstrapData,
  Category,
  GalleryItem,
  ProcessStep,
  Product,
  ProductImage,
  SiteSettings,
  WorkshopInfo,
} from '../types/domain';

const SEED_TIMESTAMP = '2026-11-01T00:00:00.000Z';

export const SEED_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Gia dụng',
    slug: 'gia-dung',
    group_code: 'NHÓM A',
    description:
      'Các sản phẩm vệ sinh bếp, chăm sóc cơ thể và tiện ích gia đình từ xơ mướp tự nhiên.',
    display_order: 1,
  },
  {
    id: 2,
    name: 'Thời trang',
    slug: 'thoi-trang',
    group_code: 'NHÓM B',
    description:
      'Túi xách, phụ kiện và dép thủ công mang tinh thần sống xanh và dấu ấn Xứ Lạng.',
    display_order: 2,
  },
  {
    id: 3,
    name: 'Trang trí',
    slug: 'trang-tri',
    group_code: 'NHÓM C',
    description:
      'Đèn ngủ, tranh nghệ thuật, lót chén ấm trà và quà lưu niệm thủ công mộc mạc.',
    display_order: 3,
  },
  {
    id: 4,
    name: 'Quà tặng',
    slug: 'qua-tang',
    group_code: 'NHÓM D',
    description:
      'Set quà tặng thiên nhiên và dòng sản phẩm thiết kế riêng cho homestay, resort, quán cà phê.',
    display_order: 4,
  },
];

interface RawSeedProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  catSlug: string;
  short_description: string;
  full_description: string;
  highlights: string;
  price: number | null;
  specifications: string;
  material: string;
  availability: Product['availability'];
  featured: number;
  is_active: number;
  display_order: number;
  images: Array<{ url: string; caption: string; isCover?: boolean }>;
}

const RAW_SEED_PRODUCTS: RawSeedProduct[] = [
  {
    id: 1,
    name: 'Miếng rửa chén bát xơ mướp',
    slug: 'mieng-rua-chen-xo-muop',
    sku: 'LX-GD-01',
    catSlug: 'gia-dung',
    short_description:
      'Giải pháp vệ sinh gia dụng từ nguyên liệu xơ mướp tự nhiên, làm sạch nhẹ nhàng và thân thiện môi trường.',
    full_description:
      'Miếng rửa chén bát Lạng Xanh được chế tác từ xơ mướp già chọn lọc, ép phẳng và may viền vải mộc chắc chắn kèm dây treo tiện lợi. Khi thấm nước, sợi xơ mềm ra giúp làm sạch bát đĩa, xoong nồi mà không làm trầy xước bề mặt men hay chống dính.',
    highlights:
      'Làm sạch tự nhiên · Phân hủy sinh học · Có dây treo nhanh khô · Không trầy xước bề mặt',
    price: null,
    specifications: 'Dáng giọt nước / chữ nhật / bầu dục, có dây treo sợi đay',
    material: '100% xơ mướp tự nhiên, viền vải cotton và dây đay',
    availability: 'in_stock',
    featured: 1,
    is_active: 1,
    display_order: 1,
    images: [
      {
        url: '/images/products/mieng-rua-chen-giot-nuoc.jpg',
        caption: 'Miếng rửa chén bát dáng giọt nước đóng gói hoàn thiện',
        isCover: true,
      },
      {
        url: '/images/products/bo-san-pham-gia-dung.jpg',
        caption: 'Tổng hợp bộ sản phẩm gia dụng từ xơ mướp Lạng Xanh',
      },
      {
        url: '/images/products/mieng-rua-chen-bau-duc.jpg',
        caption: 'Cặp miếng xơ mướp chần viền dáng bầu dục trên nền lá xanh',
      },
      {
        url: '/images/projects/gian-hang-lang-xanh.jpg',
        caption: 'Sản phẩm trưng bày thực tế tại gian hàng Lạng Xanh',
      },
    ],
  },
  {
    id: 2,
    name: 'Bông tắm xơ mướp',
    slug: 'bong-tam-xo-muop',
    sku: 'LX-GD-02',
    catSlug: 'gia-dung',
    short_description:
      'Bông tắm xơ mướp tạo bọt tự nhiên, hỗ trợ làm sạch da nhẹ nhàng với dây treo tiện dụng.',
    full_description:
      'Bông tắm xơ mướp Lạng Xanh gồm các mẫu bông tắm trái tim có đai cầm êm ái, túi rút tắm xơ mướp và khăn tắm sợi xơ tự nhiên. Sợi xơ mềm mịn hơn khi thấm nước, giúp tạo bọt dễ dàng và mang lại cảm giác thư giãn khi sử dụng hằng ngày.',
    highlights:
      'Mềm hơn khi thấm nước · Tạo bọt dễ dàng · Có dây treo nhanh khô · 100% xơ mướp tự nhiên',
    price: null,
    specifications: 'Mẫu trái tim có đai giữ tay / túi tắm dây rút / mẫu tròn tự nhiên',
    material: 'Xơ mướp tự nhiên, dây đay và vải cotton mềm',
    availability: 'in_stock',
    featured: 1,
    is_active: 1,
    display_order: 2,
    images: [
      {
        url: '/images/products/bong-tam-trai-tim.jpg',
        caption: 'Cặp bông tắm xơ mướp trái tim kèm mặt vải êm ái và đai giữ tay',
        isCover: true,
      },
      {
        url: '/images/products/tui-rut-hoa-hoi-bong-tam.jpg',
        caption: 'Túi tắm xơ mướp dây rút gắn nhãn Lạng Xanh',
      },
      {
        url: '/images/projects/tam-soi-xo-muop.jpg',
        caption: 'Khăn tắm dệt từ sợi xơ mướp tự nhiên Lạng Xanh',
      },
      {
        url: '/images/products/bo-san-pham-gia-dung.jpg',
        caption: 'Bộ sản phẩm chăm sóc cơ thể và gia dụng từ xơ mướp Lạng Xanh',
      },
    ],
  },
  {
    id: 3,
    name: 'Túi treo hoa hồi',
    slug: 'tui-treo-hoa-hoi',
    sku: 'LX-GD-03',
    catSlug: 'gia-dung',
    short_description:
      'Sự kết hợp giữa vỏ túi xơ mướp mộc mạc và hương hoa hồi đặc trưng của vùng núi Xứ Lạng.',
    full_description:
      'Túi treo hoa hồi Lạng Xanh là sản phẩm kết nối hai nguồn tài nguyên bản địa Xứ Lạng: lớp vỏ xơ mướp thoáng khí kết hợp cùng hoa hồi khô tự nhiên và miệng túi vải dây rút. Thích hợp treo trong tủ quần áo, phòng ngủ, bàn làm việc hoặc làm quà lưu niệm mang hương sắc Lạng Sơn.',
    highlights:
      'Kết hợp hoa hồi Xứ Lạng · Thoáng khí tự nhiên · Dây rút cotton chắc chắn · Quà lưu niệm bản địa',
    price: null,
    specifications: 'Túi dây rút nhỏ gọn, đi kèm thẻ nhận diện Lạng Xanh',
    material: 'Xơ mướp tự nhiên, hoa hồi khô Lạng Sơn, vải bố cotton',
    availability: 'in_stock',
    featured: 1,
    is_active: 1,
    display_order: 3,
    images: [
      {
        url: '/images/products/tui-rut-hoa-hoi-bong-tam.jpg',
        caption: 'Túi treo dây rút xơ mướp gắn thẻ gỗ Lạng Xanh',
        isCover: true,
      },
      {
        url: '/images/projects/gian-hang-lang-xanh.jpg',
        caption: 'Trưng bày dòng sản phẩm thủ công Lạng Xanh tại gian hàng',
      },
    ],
  },
  {
    id: 4,
    name: 'Túi xách thời trang',
    slug: 'tui-xach-xo-muop',
    sku: 'LX-TT-01',
    catSlug: 'thoi-trang',
    short_description:
      'Thiết kế sáng tạo từ chất liệu xơ mướp tự nhiên, kết hợp họa tiết thêu đắp thủ công tinh tế.',
    full_description:
      'Bộ sưu tập túi xách thời trang Lạng Xanh gồm túi tote dáng đứng, túi đeo chéo nhỏ gọn và ví cầm tay đồng bộ. Bề mặt túi sử dụng tấm xơ mướp ép định hình kết hợp viền vải bố, khóa kéo chắc chắn và các họa tiết lá, quả đào, hoa oải hương hay thú cưng được khâu đắp thủ công.',
    highlights:
      'Tạo hình thủ công độc đáo · Đa dạng kiểu dáng tote và đeo chéo · Viền may chắc chắn · Nhẹ và thoáng',
    price: null,
    specifications: 'Túi tote, túi đeo chéo vuông và ví cầm tay kèm móc treo xơ mướp',
    material: 'Xơ mướp ép nhiệt, vải canvas viền, khóa kéo và chỉ thêu thủ công',
    availability: 'in_stock',
    featured: 1,
    is_active: 1,
    display_order: 4,
    images: [
      {
        url: '/images/products/tui-tote-gau-vit.jpg',
        caption: 'Túi tote xơ mướp kết hợp ví cầm tay họa tiết gấu và vịt',
        isCover: true,
      },
      {
        url: '/images/products/bo-doi-tui-tote-deo-cheo.jpg',
        caption: 'Bộ đôi túi tote và túi đeo chéo thời trang xơ mướp 100% thiên nhiên',
      },
      {
        url: '/images/products/tui-theu-la-dao.jpg',
        caption:
          'Bộ sưu tập túi đeo vai thêu đắp họa tiết lá cây, hoa lavender và trái đào thủ công',
      },
      {
        url: '/images/products/tui-deo-cheo-trai-tim.jpg',
        caption: 'Túi đeo chéo họa tiết trái tim chụp cùng không gian xanh',
      },
      {
        url: '/images/products/can-canh-tui-deo-cheo.jpg',
        caption: 'Cận cảnh mặt trước và dây đeo túi chéo xơ mướp',
      },
      {
        url: '/images/projects/nhom-hoc-sinh-lang-xanh.jpg',
        caption: 'Nhóm học sinh dự án cùng các mẫu sản phẩm thủ công Lạng Xanh',
      },
    ],
  },
  {
    id: 5,
    name: 'Quạt cầm tay',
    slug: 'quat-cam-tay',
    sku: 'LX-TT-02',
    catSlug: 'thoi-trang',
    short_description:
      'Quạt cầm tay bằng xơ mướp tự nhiên, trang trí họa tiết vẽ tay và tua rua truyền thống.',
    full_description:
      'Quạt cầm tay xơ mướp Lạng Xanh mang vẻ đẹp giao thoa giữa chất liệu mộc mạc và nét duyên thủ công truyền thống. Mặt quạt ép từ xơ mướp tự nhiên kết hợp họa tiết vẽ tay nổi bật, tay cầm quấn dây đay chắc chắn kèm tua rua tạo điểm nhấn.',
    highlights:
      'Tay cầm quấn dây đay êm tay · Họa tiết vẽ tay thủ công · Nhẹ gọn dễ mang theo · Phù hợp chụp ảnh và quà tặng',
    price: null,
    specifications: 'Dáng vuông, dáng tim và dáng giọt nước kèm tua rua',
    material: 'Xơ mướp ép, sợi đay tự nhiên và phụ kiện tua rua',
    availability: 'in_stock',
    featured: 1,
    is_active: 1,
    display_order: 5,
    images: [
      {
        url: '/images/products/quat-cam-tay-hoa-do.jpg',
        caption: 'Quạt cầm tay xơ mướp họa tiết hoa đỏ và tua rua',
        isCover: true,
      },
      {
        url: '/images/products/cap-quat-cam-tay.jpg',
        caption: 'Cặp quạt cầm tay xơ mướp dáng trái tim và giọt nước vẽ tay',
      },
      {
        url: '/images/projects/gian-hang-lang-xanh.jpg',
        caption: 'Quạt cầm tay trưng bày trên kệ gỗ gian hàng Lạng Xanh',
      },
    ],
  },
  {
    id: 6,
    name: 'Dép xơ mướp',
    slug: 'dep-xo-muop',
    sku: 'LX-TT-03',
    catSlug: 'thoi-trang',
    short_description:
      'Dép đi trong nhà làm từ xơ mướp ép thoáng khí, êm chân và thân thiện với môi trường.',
    full_description:
      'Dép xơ mướp đi trong nhà của Lạng Xanh có phần lòng dép và quai dép làm từ xơ mướp ép nhiều lớp, viền vải cotton mềm mại. Thiết kế hở mũi giúp thông thoáng, thấm hút mồ hôi tự nhiên, mang lại cảm giác nhẹ nhàng khi di chuyển trong nhà hoặc không gian nghỉ dưỡng.',
    highlights:
      'Thoáng khí tự nhiên · Êm chân khi di chuyển · Viền may gọn gàng · Thân thiện môi trường',
    price: null,
    specifications: 'Thiết kế hở mũi đi trong nhà, đa dạng kích cỡ',
    material: 'Xơ mướp ép tự nhiên, viền vải cotton, đế chống trượt nhẹ',
    availability: 'in_stock',
    featured: 1,
    is_active: 1,
    display_order: 6,
    images: [
      {
        url: '/images/products/dep-xo-muop-khay-may.jpg',
        caption: 'Cặp dép xơ mướp đi trong nhà trên khay mây tre đan',
        isCover: true,
      },
      {
        url: '/images/projects/tram-xanh-workshop.jpg',
        caption: 'Dép xơ mướp trưng bày cùng bộ sản phẩm Lạng Xanh Welcome',
      },
      {
        url: '/images/products/bo-san-pham-gia-dung.jpg',
        caption: 'Phối cảnh sản phẩm dép xơ mướp đi trong nhà',
      },
      {
        url: '/images/projects/gian-hang-lang-xanh.jpg',
        caption: 'Khu vực trưng bày dép xơ mướp tại hội chợ',
      },
    ],
  },
  {
    id: 7,
    name: 'Mũ nón',
    slug: 'mu-non-xo-muop',
    sku: 'LX-TT-04',
    catSlug: 'thoi-trang',
    short_description:
      'Mô hình nón lá và phụ kiện thủ công tạo hình từ xơ mướp tự nhiên gắn họa tiết cờ Tổ quốc.',
    full_description:
      'Mẫu nón tạo hình từ xơ mướp tự nhiên phối màu cờ đỏ sao vàng kèm mô hình nhà lưu niệm, thể hiện sự sáng tạo của nhóm học sinh Lạng Xanh trong việc tạo phom từ sợi xơ mướp nhuộm màu tự nhiên và viền dây vải chắc chắn.',
    highlights:
      'Tạo phom nón chóp độc đáo · Sắc màu truyền thống · Nhẹ và thoáng · Thủ công tỉ mỉ',
    price: null,
    specifications: 'Nón trang trí/trưng bày lưu niệm thủ công',
    material: 'Xơ mướp tự nhiên, sợi nhuộm màu, dây viền vải bố',
    availability: 'contact',
    featured: 0,
    is_active: 1,
    display_order: 7,
    images: [
      {
        url: '/images/products/mu-non-xo-muop.jpg',
        caption: 'Nón xơ mướp và mô hình trang trí Xơ mướp Việt thủ công',
        isCover: true,
      },
    ],
  },
  {
    id: 8,
    name: 'Lót chén, lót ấm trà',
    slug: 'lot-chen-lot-am-tra',
    sku: 'LX-TR-01',
    catSlug: 'trang-tri',
    short_description:
      'Tấm lót tròn dệt từ xơ mướp tự nhiên, cách nhiệt nhẹ và tôn nét mộc mạc cho bàn trà, gian bếp.',
    full_description:
      'Sản phẩm tấm lót tròn làm từ xơ mướp ép dày dặn, dùng để lót ấm trà, lót nồi hoặc lót xửng hấp tre tự nhiên. Sợi xơ đan xen giúp thoát hơi tốt, hạn chế đọng nước và tạo điểm nhấn ấm áp cho không gian thưởng trà và ẩm thực.',
    highlights:
      'Thoáng khí và cách nhiệt nhẹ · Chống đọng nước · Độ bền cao · Phù hợp bàn trà và gia đình',
    price: null,
    specifications: 'Tấm lót tròn dệt ép phẳng nhiều kích thước',
    material: '100% xơ mướp tự nhiên ép định hình',
    availability: 'in_stock',
    featured: 0,
    is_active: 1,
    display_order: 8,
    images: [
      {
        url: '/images/projects/tam-lot-ep-phang.jpg',
        caption: 'Tấm lót tròn xơ mướp đặt cạnh bát nóng trên bàn tre tự nhiên',
        isCover: true,
      },
      {
        url: '/images/projects/ep-nhiet-dinh-hinh.jpg',
        caption: 'Đặt vừa vặn trong xửng tre hấp bánh truyền thống',
      },
      {
        url: '/images/projects/kiem-thu-thoang-khi.jpg',
        caption: 'Ứng dụng tấm lót xơ mướp thoáng khí trong gian bếp xanh',
      },
    ],
  },
  {
    id: 9,
    name: 'Đèn trang trí',
    slug: 'den-trang-tri',
    sku: 'LX-TR-02',
    catSlug: 'trang-tri',
    short_description:
      'Đèn ngủ và đèn trang trí thủ công từ xơ mướp kết hợp đế gỗ tự nhiên, cho ánh sáng vàng dịu nhẹ.',
    full_description:
      'Bộ sưu tập đèn trang trí Lạng Xanh được chế tác thủ công với chụp đèn từ xơ mướp tự nhiên đặt trên đế gỗ mộc. Ánh sáng đi qua mạng sợi xơ mướp tạo hiệu ứng tán sắc ấm áp, dịu mắt. Sản phẩm có nhiều kiểu dáng: đèn trụ họa tiết hoa, đèn khối lập phương gắn lá, đèn chóp chuồn chuồn và đèn cây thông xếp lớp.',
    highlights:
      'Ánh sáng vàng dịu nhẹ · Đế gỗ tự nhiên · Đa dạng kiểu dáng nghệ thuật · Thủ công 100%',
    price: null,
    specifications:
      'Đèn bàn đế gỗ (dáng trụ, dáng lập phương, dáng chóp, dáng cây thông)',
    material: 'Xơ mướp tự nhiên, đế gỗ mộc, lá khô trang trí và bóng LED ánh sáng ấm',
    availability: 'in_stock',
    featured: 1,
    is_active: 1,
    display_order: 9,
    images: [
      {
        url: '/images/products/den-ngu-hoa-nam-canh.jpg',
        caption: 'Đèn ngủ xơ mướp dáng trụ họa tiết hoa 5 cánh trên đế gỗ',
        isCover: true,
      },
      {
        url: '/images/products/den-lap-phuong-gan-la.jpg',
        caption: 'Đèn trang trí khối lập phương nghiêng gắn lá khô tự nhiên',
      },
      {
        url: '/images/products/den-chop-chuon-chuon.jpg',
        caption: 'Đèn bàn dáng chóp trang trí cánh chuồn chuồn thủ công',
      },
      {
        url: '/images/products/den-cay-thong-xo-muop.jpg',
        caption: 'Đèn ngủ tạo hình cây thông xếp lớp xơ mướp bên giường ngủ',
      },
      {
        url: '/images/products/den-ban-anh-sang-am.jpg',
        caption: 'Đèn bàn xơ mướp khối lập phương ánh sáng vàng ấm trên bàn gỗ',
      },
      {
        url: '/images/products/bo-den-mini-that-no.jpg',
        caption: 'Bộ đèn lập phương mini thắt nơ trang trí không gian ấm cúng',
      },
    ],
  },
  {
    id: 10,
    name: 'Tranh nghệ thuật từ xơ mướp',
    slug: 'tranh-nghe-thuat-xo-muop',
    sku: 'LX-TR-03',
    catSlug: 'trang-tri',
    short_description:
      'Tranh nổi thủ công khắc họa hoa đào, núi non và bản sắc Xứ Lạng từ những cánh xơ mướp nhuộm màu.',
    full_description:
      'Mỗi bức tranh nghệ thuật của Lạng Xanh được ghép tỉ mỉ từng cánh hoa, chiếc lá và cảnh sắc quê hương Lạng Sơn bằng chất liệu xơ mướp cắt tạo hình và nhuộm màu. Từ cành đào Xứ Lạng thanh tao đến bức tranh phong cảnh kết hợp hoa hồi, đây là điểm nhấn trang trí giàu giá trị văn hóa.',
    highlights:
      'Tạo hình nổi 3D thủ công · Mang đậm bản sắc Xứ Lạng · Khung gỗ chắc chắn · Quà lưu niệm độc bản',
    price: null,
    specifications: 'Tranh khung vuông / khung chữ nhật hoàn thiện mặt kính hoặc mở',
    material: 'Xơ mướp tạo hình nhuộm màu, hoa hồi, khung gỗ tự nhiên',
    availability: 'contact',
    featured: 1,
    is_active: 1,
    display_order: 10,
    images: [
      {
        url: '/images/products/tranh-hoa-dao-lang-son.jpg',
        caption: 'Tranh hoa đào Lạng Sơn tạo hình nổi từ cánh xơ mướp và lá xơ',
        isCover: true,
      },
      {
        url: '/images/projects/tram-xanh-workshop.jpg',
        caption:
          'Tranh phong cảnh Lạng Xanh kết hợp trưng bày cùng đèn và dép xơ mướp',
      },
      {
        url: '/images/projects/gian-hang-lang-xanh.jpg',
        caption: 'Trưng bày tranh xơ mướp tại gian hàng Lạng Xanh',
      },
    ],
  },
  {
    id: 11,
    name: 'Set quà tặng từ thiên nhiên',
    slug: 'set-qua-tang-thien-nhien',
    sku: 'LX-QT-01',
    catSlug: 'qua-tang',
    short_description:
      'Bó hoa và set quà tặng thủ công làm từ xơ mướp tạo hình, gói giấy kraft mộc mạc và bền lâu.',
    full_description:
      'Set quà tặng từ thiên nhiên Lạng Xanh nổi bật với những bó hoa nghệ thuật kết từ xơ mướp tạo hình hoa sen, hoa hồng, hoa cúc và lá khô, được gói bằng giấy kraft thân thiện môi trường và buộc dây đay. Hoa không héo tàn, thích hợp làm quà tặng dịp lễ, sự kiện nhà trường và doanh nghiệp.',
    highlights:
      'Lưu giữ bền lâu không tàn · Gói giấy kraft thân thiện môi trường · Đa dạng tông màu tự nhiên và rực rỡ',
    price: null,
    specifications: 'Bó hoa xơ mướp thủ công phối giấy kraft và dây đay',
    material: 'Xơ mướp tạo hình, lá tự nhiên sấy khô, giấy kraft và dây đay',
    availability: 'in_stock',
    featured: 1,
    is_active: 1,
    display_order: 11,
    images: [
      {
        url: '/images/products/bo-hoa-sen-xo-muop.jpg',
        caption: 'Bó hoa xơ mướp phối hoa sen hồng và xơ mướp màu cam nổi bật',
        isCover: true,
      },
      {
        url: '/images/products/bo-hoa-vang-kem.jpg',
        caption: 'Bó hoa xơ mướp tông vàng kem mộc mạc gói giấy kraft',
      },
      {
        url: '/images/products/bo-hoa-hong-trang-kem.jpg',
        caption: 'Bó hoa hồng xơ mướp tông trắng kem thanh lịch',
      },
      {
        url: '/images/products/bo-hoa-cuc-la-xanh.jpg',
        caption: 'Bó hoa cúc xơ mướp phối lá xanh tự nhiên',
      },
      {
        url: '/images/products/bo-hoa-dang-cao.jpg',
        caption: 'Bó hoa xơ mướp dáng cao trang trí bàn hoặc tặng sự kiện',
      },
    ],
  },
  {
    id: 12,
    name: 'Set quà tặng cao cấp',
    slug: 'set-qua-tang-cao-cap',
    sku: 'LX-QT-02',
    catSlug: 'qua-tang',
    short_description:
      'Bộ quà tặng kết hợp nhiều sản phẩm thủ công đặc trưng của Lạng Xanh dành cho đối tác và khách mời.',
    full_description:
      'Set quà tặng cao cấp được phối hợp linh hoạt từ các sản phẩm tiêu biểu của Lạng Xanh như túi xách thời trang, đèn ngủ xơ mướp, dép đi trong nhà, túi hoa hồi và miếng rửa chén xơ mướp, kèm thẻ gỗ hoặc hộp mang nhận diện thương hiệu Lạng Xanh.',
    highlights:
      'Phối hợp sản phẩm theo nhu cầu · Kèm hộp/thẻ nhận diện Lạng Xanh · Phù hợp quà tặng sự kiện và đối tác',
    price: null,
    specifications: 'Thiết kế combo tùy chỉnh theo yêu cầu của đơn vị đặt hàng',
    material: 'Xơ mướp tự nhiên, gỗ, vải cotton, bao bì giấy kraft',
    availability: 'contact',
    featured: 0,
    is_active: 1,
    display_order: 12,
    images: [
      {
        url: '/images/projects/tram-xanh-workshop.jpg',
        caption: 'Gợi ý bộ sản phẩm quà tặng Lạng Xanh gồm tranh, đèn, dép và túi',
        isCover: true,
      },
      {
        url: '/images/products/tui-tote-gau-vit.jpg',
        caption: 'Combo túi xách thời trang và ví cầm tay họa tiết thủ công',
      },
      {
        url: '/images/products/bo-doi-tui-tote-deo-cheo.jpg',
        caption: 'Bộ đôi túi tote và túi đeo chéo xơ mướp Lạng Xanh',
      },
      {
        url: '/images/branding/kenh-truyen-thong-lang-xanh.jpg',
        caption: 'Đèn trang trí cây thông kết hợp không gian truyền thông Lạng Xanh',
      },
    ],
  },
  {
    id: 13,
    name: 'Dép xơ mướp dành cho cơ sở lưu trú',
    slug: 'dep-xo-muop-co-so-luu-tru',
    sku: 'LX-QT-03',
    catSlug: 'qua-tang',
    short_description:
      'Dòng dép xơ mướp đặt riêng cho homestay, resort theo hướng du lịch xanh và giảm nhựa dùng một lần.',
    full_description:
      'Thiết kế dành riêng cho các homestay, khách sạn và khu nghỉ dưỡng sinh thái mong muốn thay thế dép nhựa/xốp dùng một lần. Dép xơ mướp Lạng Xanh nhẹ, thoáng, mang đậm bản sắc thủ công địa phương và tạo ấn tượng thân thiện với du khách.',
    highlights:
      'Thay thế sản phẩm nhựa dùng một lần · Phù hợp homestay & resort sinh thái · Nhận đặt theo số lượng',
    price: null,
    specifications: 'Đặt riêng theo kích cỡ và số lượng của cơ sở lưu trú',
    material: 'Xơ mướp tự nhiên ép định hình và viền vải cotton',
    availability: 'contact',
    featured: 0,
    is_active: 1,
    display_order: 13,
    images: [
      {
        url: '/images/products/dep-xo-muop-khay-may.jpg',
        caption: 'Dép xơ mướp phong cách nghỉ dưỡng xanh trên khay mây',
        isCover: true,
      },
      {
        url: '/images/projects/tram-xanh-workshop.jpg',
        caption: 'Dép xơ mướp trưng bày cùng không gian đón khách Lạng Xanh',
      },
      {
        url: '/images/projects/gian-hang-lang-xanh.jpg',
        caption: 'Mẫu trưng bày dòng sản phẩm cho cơ sở lưu trú',
      },
    ],
  },
  {
    id: 14,
    name: 'Bông tắm dành cho khách sạn',
    slug: 'bong-tam-khach-san',
    sku: 'LX-QT-05',
    catSlug: 'qua-tang',
    short_description:
      'Bông tắm xơ mướp đóng gói gọn gàng cho bộ tiện ích phòng tắm của khách sạn và homestay.',
    full_description:
      'Giải pháp tiện ích phòng tắm thân thiện với môi trường dành cho khách sạn, homestay và khu nghỉ dưỡng. Bông tắm xơ mướp Lạng Xanh có dây treo sợi đay tiện lợi, dễ làm khô và phân hủy sinh học sau thời gian sử dụng.',
    highlights:
      'Thân thiện môi trường · Đóng gói sạch sẽ · Có dây treo sợi đay · Phù hợp bộ tiện ích phòng nghỉ',
    price: null,
    specifications: 'Kích thước tiêu chuẩn khách sạn, đóng gói theo yêu cầu',
    material: '100% xơ mướp tự nhiên và dây đay',
    availability: 'contact',
    featured: 0,
    is_active: 1,
    display_order: 14,
    images: [
      {
        url: '/images/products/bong-tam-trai-tim.jpg',
        caption: 'Bông tắm xơ mướp dáng trái tim mềm mại cho phòng nghỉ sinh thái',
        isCover: true,
      },
      {
        url: '/images/products/tui-rut-hoa-hoi-bong-tam.jpg',
        caption: 'Túi bông tắm xơ mướp dây rút đóng gói kèm nhãn Lạng Xanh',
      },
      {
        url: '/images/projects/tam-soi-xo-muop.jpg',
        caption: 'Khăn tắm dệt sợi xơ mướp tự nhiên đi kèm thẻ Lạng Xanh',
      },
    ],
  },
  // Draft items awaiting admin photos before public display
  {
    id: 15,
    name: 'Lọ hoa',
    slug: 'lo-hoa-xo-muop',
    sku: 'LX-TR-04',
    catSlug: 'trang-tri',
    short_description:
      'Lọ hoa trang trí thủ công kết hợp chất liệu xơ mướp tự nhiên.',
    full_description: 'Sản phẩm đang được cập nhật hình ảnh thực tế từ dự án.',
    highlights: 'Thủ công tỉ mỉ · Chất liệu tự nhiên',
    price: null,
    specifications: 'Đang cập nhật',
    material: 'Xơ mướp tự nhiên',
    availability: 'contact',
    featured: 0,
    is_active: 0,
    display_order: 15,
    images: [],
  },
  {
    id: 16,
    name: 'Móc treo',
    slug: 'moc-treo-xo-muop',
    sku: 'LX-TR-05',
    catSlug: 'trang-tri',
    short_description:
      'Móc treo trang trí nhỏ gọn tạo hình thủ công từ xơ mướp.',
    full_description: 'Sản phẩm đang được cập nhật hình ảnh thực tế từ dự án.',
    highlights: 'Nhẹ gọn · Trang trí balo, chìa khóa',
    price: null,
    specifications: 'Đang cập nhật',
    material: 'Xơ mướp tự nhiên',
    availability: 'contact',
    featured: 0,
    is_active: 0,
    display_order: 16,
    images: [],
  },
  {
    id: 17,
    name: 'Lót ly, lót ấm trà cho quán cà phê',
    slug: 'lot-ly-quan-ca-phe',
    sku: 'LX-QT-04',
    catSlug: 'qua-tang',
    short_description:
      'Bộ lót ly xơ mướp đặt riêng cho quán cà phê theo phong cách mộc.',
    full_description: 'Sản phẩm đang được cập nhật hình ảnh thực tế từ dự án.',
    highlights: 'Thấm hút tốt · Phù hợp không gian quán cà phê xanh',
    price: null,
    specifications: 'Đang cập nhật',
    material: 'Xơ mướp ép tự nhiên',
    availability: 'contact',
    featured: 0,
    is_active: 0,
    display_order: 17,
    images: [],
  },
];

const CAT_BY_SLUG = new Map(SEED_CATEGORIES.map((c) => [c.slug, c]));

let nextImageId = 1;
export const SEED_PRODUCTS: Product[] = RAW_SEED_PRODUCTS.map((p) => {
  const cat = CAT_BY_SLUG.get(p.catSlug) ?? SEED_CATEGORIES[0];
  const coverUrl =
    p.images.find((i) => i.isCover)?.url ?? p.images[0]?.url ?? '';
  const images: ProductImage[] = p.images.map((img, idx) => ({
    id: nextImageId++,
    product_id: p.id,
    image_url: img.url,
    alt_text: `${p.name} - ${img.caption}`,
    caption: img.caption,
    display_order: idx + 1,
    is_cover: img.isCover ? 1 : 0,
    created_at: SEED_TIMESTAMP,
  }));

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category_id: cat.id,
    category_name: cat.name,
    category_slug: cat.slug,
    short_description: p.short_description,
    full_description: p.full_description,
    highlights: p.highlights,
    price: p.price,
    specifications: p.specifications,
    material: p.material,
    availability: p.availability,
    featured: p.featured,
    is_active: p.is_active,
    display_order: p.display_order,
    cover_image: coverUrl,
    images,
    created_at: SEED_TIMESTAMP,
    updated_at: SEED_TIMESTAMP,
  };
});

export const SEED_GALLERY: GalleryItem[] = [
  [
    'Vùng nguyên liệu',
    'Xơ mướp tự nhiên nguyên trái chọn lọc',
    'Nguồn xơ mướp già sau thu hoạch và phơi khô giữ nguyên cấu trúc sợi chắc chắn.',
    '/images/projects/xo-muop-nguyen-trai.jpg',
  ],
  [
    'Vùng nguyên liệu',
    'Cận cảnh sợi xơ mướp tự nhiên trên bàn gỗ',
    'Các ống xơ mướp tự nhiên nguyên vẹn kết cấu sợi đan xen bền chắc.',
    '/images/projects/so-che-xo-muop.jpg',
  ],
  [
    'Sản phẩm gia dụng',
    'Bộ ba sản phẩm gia dụng tiêu biểu',
    'Bông tắm xơ mướp, dép đi trong nhà và miếng rửa bát thân thiện môi trường.',
    '/images/products/bo-san-pham-gia-dung.jpg',
  ],
  [
    'Sản phẩm gia dụng',
    'Túi tắm & túi treo dây rút xơ mướp',
    'Kết hợp xơ mướp tự nhiên cùng dây rút cotton gắn nhãn Lạng Xanh.',
    '/images/products/tui-rut-hoa-hoi-bong-tam.jpg',
  ],
  [
    'Sản phẩm gia dụng',
    'Miếng rửa chén dáng giọt nước',
    'Sản phẩm đóng gói gọn gàng kèm dây treo sợi đay tiện dụng.',
    '/images/products/mieng-rua-chen-giot-nuoc.jpg',
  ],
  [
    'Sản phẩm gia dụng',
    'Bông tắm trái tim xơ mướp',
    'Thiết kế dáng trái tim kèm mặt vải êm ái và đai cầm tiện lợi.',
    '/images/products/bong-tam-trai-tim.jpg',
  ],
  [
    'Sản phẩm gia dụng',
    'Tấm lót nồi hấp xơ mướp thoáng khí',
    'Ứng dụng xơ mướp ép phẳng cách nhiệt và thoáng hơi trên bàn tre.',
    '/images/projects/tam-lot-ep-phang.jpg',
  ],
  [
    'Sản phẩm thời trang',
    'Bộ sưu tập túi xách và ví xơ mướp',
    'Túi tote và ví cầm tay ép định hình cùng họa tiết gấu và vịt thủ công.',
    '/images/products/tui-tote-gau-vit.jpg',
  ],
  [
    'Sản phẩm thời trang',
    'Bộ đôi túi tote và túi đeo chéo xơ mướp',
    'Phiên bản túi thời trang Lạng Xanh 100% nguyên liệu tự nhiên.',
    '/images/products/bo-doi-tui-tote-deo-cheo.jpg',
  ],
  [
    'Sản phẩm thời trang',
    'Túi thêu họa tiết lá và quả đào',
    'Những đường chỉ thêu tay nổi bật trên nền sợi xơ mướp mộc mạc.',
    '/images/products/tui-theu-la-dao.jpg',
  ],
  [
    'Sản phẩm thời trang',
    'Quạt cầm tay hoa đỏ',
    'Quạt tay xơ mướp quấn dây đay mang nét duyên thủ công truyền thống.',
    '/images/products/quat-cam-tay-hoa-do.jpg',
  ],
  [
    'Sản phẩm thời trang',
    'Dép xơ mướp đi trong nhà',
    'Đôi dép xơ mướp thoáng khí bày trên khay mây tre đan.',
    '/images/products/dep-xo-muop-khay-may.jpg',
  ],
  [
    'Sản phẩm trang trí',
    'Tranh hoa đào Lạng Sơn',
    'Tác phẩm tranh nổi 3D ghép từ cánh hoa và lá xơ mướp nhuộm màu.',
    '/images/products/tranh-hoa-dao-lang-son.jpg',
  ],
  [
    'Sản phẩm trang trí',
    'Đèn ngủ xơ mướp hoa năm cánh',
    'Ánh sáng vàng ấm lan tỏa qua lớp sợi xơ mướp tự nhiên trên đế gỗ.',
    '/images/products/den-ngu-hoa-nam-canh.jpg',
  ],
  [
    'Sản phẩm trang trí',
    'Đèn lập phương gắn lá khô',
    'Thiết kế đèn để bàn tạo hình lập phương kết hợp lá mộc tinh tế.',
    '/images/products/den-lap-phuong-gan-la.jpg',
  ],
  [
    'Sản phẩm trang trí',
    'Đèn chóp cánh chuồn chuồn',
    'Tạo hình đèn ngủ xơ mướp phối cánh chuồn chuồn thủ công.',
    '/images/products/den-chop-chuon-chuon.jpg',
  ],
  [
    'Sản phẩm trang trí',
    'Bó hoa xơ mướp quà tặng',
    'Các mẫu bó hoa xơ mướp lưu giữ bền lâu gói giấy kraft mộc mạc.',
    '/images/products/bo-hoa-sen-xo-muop.jpg',
  ],
  [
    'Sản phẩm trang trí',
    'Ống cắm bút & bookmark xơ mướp',
    'Phụ kiện góc học tập sáng tạo trang trí họa tiết ngộ nghĩnh.',
    '/images/gallery/ong-cam-but-bookmark.jpg',
  ],
  [
    'Quy trình chế tác',
    'Xử lý tấm xơ mướp dệt phẳng',
    'Tấm sợi xơ mướp sau công đoạn làm sạch, làm mềm và gắn nhãn Lạng Xanh.',
    '/images/projects/tam-soi-xo-muop.jpg',
  ],
  [
    'Quy trình chế tác',
    'Tạo hình và kiểm thử độ thoáng khí',
    'Thành viên Lạng Xanh kiểm tra tấm lót tròn xơ mướp ép định hình.',
    '/images/projects/kiem-thu-thoang-khi.jpg',
  ],
  [
    'Workshop',
    'Bàn trưng bày Lạng Xanh Welcome',
    'Không gian giới thiệu tranh phong cảnh, đèn cây thông và dép xơ mướp.',
    '/images/projects/tram-xanh-workshop.jpg',
  ],
  [
    'Workshop',
    'Gian hàng Lạng Xanh tại ngày hội',
    'Gian hàng gỗ trưng bày đầy đủ các dòng sản phẩm thủ công từ xơ mướp.',
    '/images/projects/gian-hang-lang-xanh.jpg',
  ],
  [
    'Hoạt động nhóm',
    'Nhóm học sinh thực hiện dự án Lạng Xanh',
    'Các thành viên Trường THPT Dân tộc nội trú tỉnh Lạng Sơn giới thiệu sản phẩm hoàn thiện.',
    '/images/projects/nhom-hoc-sinh-lang-xanh.jpg',
  ],
  [
    'Hoạt động nhóm',
    'Kênh truyền thông chính thức Lạng Xanh',
    'Kết nối giới thiệu sản phẩm xanh tới cộng đồng qua Fanpage Lạng Xanh.',
    '/images/branding/kenh-truyen-thong-lang-xanh.jpg',
  ],
].map(([album, title, caption, image_url], idx) => ({
  id: idx + 1,
  album,
  title,
  caption,
  image_url,
  display_order: idx + 1,
  created_at: SEED_TIMESTAMP,
}));

export const SEED_PROCESS_STEPS: ProcessStep[] = [
  {
    id: 1,
    step_number: 1,
    title: 'Phát triển vùng nguyên liệu',
    description:
      'Lạng Xanh kết nối định hướng vùng trồng mướp sinh thái tại địa phương, chăm sóc theo hướng tự nhiên để cho trái mướp già có cấu trúc sợi chắc và đều.',
    image_url: '/images/projects/xo-muop-nguyen-trai.jpg',
    caption: 'Nguồn nguyên liệu gắn liền với định hướng nông nghiệp xanh Xứ Lạng',
  },
  {
    id: 2,
    step_number: 2,
    title: 'Thu hoạch',
    description:
      'Những quả mướp già đạt độ chín trên giàn được thu hái đúng thời điểm để lớp xơ bên trong giữ được độ dai và màu sắc tự nhiên.',
    image_url: '/images/projects/so-che-xo-muop.jpg',
    caption: 'Xơ mướp sau khi thu hái, tách vỏ và phơi khô tự nhiên',
  },
  {
    id: 3,
    step_number: 3,
    title: 'Sơ chế',
    description:
      'Quả mướp được tách vỏ, loại bỏ hạt và rửa sạch nhựa tự nhiên dưới nguồn nước sạch trước khi phơi nắng.',
    image_url: '/images/projects/tam-soi-xo-muop.jpg',
    caption: 'Sợi xơ mướp sạch hạt, làm mềm và phơi khô tự nhiên',
  },
  {
    id: 4,
    step_number: 4,
    title: 'Xử lý nguyên liệu',
    description:
      'Xơ mướp khô được phân loại theo độ dày mỏng, làm mềm sợi, cắt tỉa và xử lý sạch khuẩn trước khi đưa vào tạo hình.',
    image_url: '/images/projects/tam-lot-ep-phang.jpg',
    caption: 'Tấm sợi xơ mướp được phân loại và xử lý đồng đều',
  },
  {
    id: 5,
    step_number: 5,
    title: 'Ép nhiệt và tạo hình',
    description:
      'Ứng dụng kỹ thuật ép phẳng, tạo khối lập phương, hình nón hoặc cắt rập theo từng dòng sản phẩm gia dụng, thời trang và đèn trang trí.',
    image_url: '/images/projects/ep-nhiet-dinh-hinh.jpg',
    caption: 'Tấm xơ mướp ép phẳng định hình chính xác',
  },
  {
    id: 6,
    step_number: 6,
    title: 'May, lắp ráp hoặc hoàn thiện',
    description:
      'May viền vải cotton, gắn dây treo sợi đay, lắp ráp đế gỗ cho đèn hoặc thêu đắp họa tiết thủ công lên túi xách và tranh nghệ thuật.',
    image_url: '/images/products/tui-theu-la-dao.jpg',
    caption: 'Công đoạn may viền và thêu đắp họa tiết thủ công tỉ mỉ',
  },
  {
    id: 7,
    step_number: 7,
    title: 'Kiểm tra và đóng gói',
    description:
      'Từng sản phẩm hoàn thiện được kiểm tra kỹ đường may, độ chắc chắn, gắn nhãn thương hiệu Lạng Xanh và đóng gói sạch đẹp trước khi trưng bày.',
    image_url: '/images/projects/gian-hang-lang-xanh.jpg',
    caption:
      'Sản phẩm hoàn thiện được kiểm tra và trưng bày sẵn sàng đến tay khách hàng',
  },
];

export const SEED_ARTICLES: Article[] = [
  {
    id: 1,
    title: 'Kết hợp xơ mướp và hoa hồi Lạng Sơn trong sản phẩm quà tặng bản địa',
    slug: 'ket-hop-xo-muop-va-hoa-hoi-lang-son',
    summary:
      'Túi treo hoa hồi và tranh hoa đào Xứ Lạng là những sáng tạo mới giúp tôn vinh đặc sản địa phương trên nền chất liệu xơ mướp tự nhiên.',
    content:
      'Bên cạnh công năng gia dụng, Lạng Xanh chú trọng lồng ghép dấu ấn văn hóa Xứ Lạng vào từng thiết kế. Túi treo hoa hồi tận dụng khả năng thoáng khí tự nhiên của xơ mướp để lưu giữ hương thơm ấm áp của hoa hồi Lạng Sơn.\n\nTrong khi đó, dòng tranh nổi xơ mướp tái hiện hình ảnh hoa đào khoe sắc bên dãy núi vùng biên, trở thành món quà lưu niệm ý nghĩa dành tặng bạn bè và du khách.',
    cover_image: '/images/articles/ket-hop-xo-muop-hoa-hoi.jpg',
    published_at: '2026-11-01',
    is_published: 1,
  },
  {
    id: 2,
    title: 'Trạm Xanh Xứ Lạng – Không gian workshop trải nghiệm sáng tạo từ thiên nhiên',
    slug: 'tram-xanh-xu-lang-khong-gian-workshop',
    summary:
      'Khách tham quan, gia đình và học sinh có thể tự tay cắt ghép, tạo hình và mang về những món đồ thủ công độc đáo làm từ xơ mướp tự nhiên.',
    content:
      'Trạm Xanh Xứ Lạng được xây dựng như một cầu nối trải nghiệm giữa nông nghiệp sinh thái và nghệ thuật thủ công. Tại đây, người tham gia được tìm hiểu trực tiếp quy trình biến quả mướp già thành tấm xơ sạch, sau đó tự tay sáng tạo lót ly, đèn mini, túi nhỏ hoặc tranh trang trí từ xơ mướp.\n\nHoạt động hướng tới giáo dục ý thức giảm thiểu rác thải nhựa và khơi gợi niềm yêu thích với tài nguyên bản địa.',
    cover_image: '/images/articles/tram-xanh-workshop.jpg',
    published_at: '2026-10-22',
    is_published: 1,
  },
  {
    id: 3,
    title: 'Hành trình khởi nguồn giá trị kinh tế xanh từ xơ mướp của học sinh Xứ Lạng',
    slug: 'hanh-trinh-khoi-nguon-gia-tri-kinh-te-xanh',
    summary:
      'Nhóm học sinh Trường THPT Dân tộc nội trú tỉnh Lạng Sơn chung tay biến nguyên liệu xơ mướp quen thuộc thành dòng sản phẩm gia dụng, thời trang và trang trí bền vững.',
    content:
      'Từ những giàn mướp gần gũi với đời sống nông thôn miền núi, nhóm học sinh Trường THPT Dân tộc nội trú tỉnh Lạng Sơn đã ấp ủ dự án Lạng Xanh với mong muốn lan tỏa lối sống thân thiện với môi trường.\n\nThông qua quá trình nghiên cứu xử lý sợi xơ, thử nghiệm ép nhiệt và thiết kế thủ công, dự án từng bước hình thành hệ sinh thái sản phẩm đa dạng: từ miếng rửa chén bát, bông tắm, túi treo hoa hồi cho đến túi xách thời trang, dép đi trong nhà, đèn ngủ và tranh nghệ thuật mang đậm bản sắc Xứ Lạng.',
    cover_image: '/images/articles/hanh-trinh-khoi-nguon.jpg',
    published_at: '2026-10-15',
    is_published: 1,
  },
];

export const SEED_BANNERS: Banner[] = [
  {
    id: 1,
    key: 'hero_main',
    title: 'LẠNG XANH',
    subtitle: 'Khởi nguồn giá trị kinh tế xanh từ xơ mướp.',
    image_url: '/images/projects/gian-hang-lang-xanh.jpg',
    cta_label: 'KHÁM PHÁ SẢN PHẨM',
    cta_link: '/san-pham',
    is_active: 1,
  },
  {
    id: 2,
    key: 'showcase_strip',
    title: 'Chạm xanh – Sống lành',
    subtitle:
      'Bộ ba sản phẩm gia dụng và chăm sóc cá nhân 100% từ xơ mướp tự nhiên.',
    image_url: '/images/products/bo-san-pham-gia-dung.jpg',
    cta_label: 'Xem chi tiết',
    cta_link: '/san-pham',
    is_active: 1,
  },
];

export const SEED_SITE_SETTINGS: SiteSettings = {
  brand_name: 'Lạng Xanh',
  full_title: 'LẠNG XANH – KHỞI NGUỒN GIÁ TRỊ KINH TẾ XANH TỪ XƠ MƯỚP',
  primary_tagline:
    'Biến điều bình dị từ thiên nhiên thành những giá trị xanh cho cuộc sống.',
  secondary_tagline: 'Sống xanh từ những điều gần gũi nhất.',
  facebook_url: 'https://www.facebook.com/share/1E3CsadTwa/?mibextid=wwXIfr',
  tiktok_handle: '@langxanhkhoinghiep2026',
  school_unit: 'Nhóm học sinh Trường THPT Dân tộc nội trú tỉnh Lạng Sơn',
  intro_headline: 'TỪ XƠ MƯỚP TỰ NHIÊN ĐẾN NHỮNG GIÁ TRỊ SÁNG TẠO',
  intro_body:
    'Lạng Xanh phát triển chuỗi giá trị từ vùng trồng mướp sinh thái, kết hợp chế tác xơ mướp thành các sản phẩm gia dụng, thời trang và trang trí. Dự án đồng thời hướng tới xây dựng không gian du lịch nông nghiệp và workshop để khách hàng được tự tay trải nghiệm quá trình sáng tạo sản phẩm từ thiên nhiên.',
  story_headline: 'HÀNH TRÌNH KHỞI NGUỒN TỪ XƠ MƯỚP',
  story_body:
    'Lạng Xanh hướng tới xây dựng chuỗi giá trị từ vùng trồng mướp sinh thái, hợp tác với người dân địa phương và ứng dụng công nghệ chế tác để phát triển những sản phẩm gia dụng, thời trang và trang trí từ xơ mướp.\n\nTừ một nguyên liệu quen thuộc, dự án mong muốn mở ra những cách sử dụng mới, tạo thêm giá trị cho tài nguyên bản địa và lan tỏa lối sống thân thiện với môi trường.',
};

export const SEED_WORKSHOP_INFO: WorkshopInfo = {
  title: 'Trạm Xanh Xứ Lạng',
  subtitle: 'Tham quan không gian xanh & Workshop chế tác thủ công từ xơ mướp',
  intro:
    'Trạm Xanh Xứ Lạng là mô hình trải nghiệm kết hợp giữa tìm hiểu vùng nguyên liệu mướp sinh thái và tự tay sáng tạo những món đồ thủ công thân thiện môi trường cùng đội ngũ Lạng Xanh.',
  activities: [
    'Tham quan khu trưng bày các dòng sản phẩm gia dụng, thời trang và trang trí từ xơ mướp.',
    'Tìm hiểu quy trình thu hoạch, sơ chế, xử lý và tạo hình nguyên liệu xơ mướp tự nhiên.',
    'Trực tiếp thực hành cắt ghép, thêu đắp hoặc làm quà lưu niệm (đèn mini, lót ly, hoa xơ mướp, móc treo).',
    'Mang về sản phẩm thủ công do chính tay mình hoàn thiện và lan tỏa thông điệp sống xanh.',
  ],
  educational_benefits: [
    'Nâng cao nhận thức về giảm thiểu rác thải nhựa trong sinh hoạt hằng ngày.',
    'Khám phá giá trị sáng tạo từ nông sản và tài nguyên bản địa tỉnh Lạng Sơn.',
    'Hoạt động gắn kết ý nghĩa dành cho gia đình, nhóm bạn, học sinh và khách du lịch.',
  ],
  schedule_note:
    'Quý khách, nhà trường và đoàn du lịch vui lòng liên hệ qua Fanpage chính thức của Lạng Xanh để được tư vấn lịch tham quan và chuẩn bị nguyên liệu workshop phù hợp.',
  hero_image: '/images/projects/tram-xanh-workshop.jpg',
  gallery_images: [
    '/images/projects/tram-xanh-workshop.jpg',
    '/images/projects/nhom-hoc-sinh-lang-xanh.jpg',
    '/images/products/tranh-hoa-dao-lang-son.jpg',
    '/images/products/den-chop-chuon-chuon.jpg',
  ],
};

function cloneDeep<T>(val: T): T {
  return JSON.parse(JSON.stringify(val)) as T;
}

export function getPublicSeedBootstrap(): BootstrapData {
  return {
    categories: cloneDeep(SEED_CATEGORIES),
    products: cloneDeep(SEED_PRODUCTS.filter((p) => p.is_active === 1)),
    gallery: cloneDeep(SEED_GALLERY),
    articles: cloneDeep(SEED_ARTICLES.filter((a) => a.is_published === 1)),
    processSteps: cloneDeep(SEED_PROCESS_STEPS),
    banners: cloneDeep(SEED_BANNERS.filter((b) => b.is_active === 1)),
    settings: cloneDeep(SEED_SITE_SETTINGS),
    workshop: cloneDeep(SEED_WORKSHOP_INFO),
  };
}

export function getFullSeedBootstrap(): BootstrapData {
  return {
    categories: cloneDeep(SEED_CATEGORIES),
    products: cloneDeep(SEED_PRODUCTS),
    gallery: cloneDeep(SEED_GALLERY),
    articles: cloneDeep(SEED_ARTICLES),
    processSteps: cloneDeep(SEED_PROCESS_STEPS),
    banners: cloneDeep(SEED_BANNERS),
    settings: cloneDeep(SEED_SITE_SETTINGS),
    workshop: cloneDeep(SEED_WORKSHOP_INFO),
  };
}
