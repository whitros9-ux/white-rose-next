export type CategoryId = string;

export type Category = {
  id: CategoryId;
  name: string;
  icon: string;
  image: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: CategoryId;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  colors: string[];
  sizes?: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  stock: number;
};

export const categories: Category[] = [
  { id: "dresses", name: "فساتين", icon: "dress", image: "/images/product-dress.png" },
  { id: "abayas", name: "عبايات", icon: "abaya", image: "/images/product-abaya.png" },
  { id: "perfumes", name: "عطور", icon: "perfume", image: "/images/product-perfume.png" },
  { id: "bags", name: "حقائب", icon: "bag", image: "/images/product-bag.png" },
  { id: "jewelry", name: "إكسسوارات", icon: "jewelry", image: "/images/product-jewelry.png" },
  { id: "kids", name: "أطفال", icon: "baby", image: "/images/product-dress.png" },
];

export const products: Product[] = [
  {
    id: "p1", name: "فستان وردي ناعم", price: 119, oldPrice: 159, category: "dresses",
    image: "/images/product-dress.png",
    description: "فستان سهرة من الشيفون الناعم بلون الورد الباهت، تصميم انسيابي يبرز أنوثتك في كل مناسبة. مثالي للحفلات والمناسبات الخاصة.",
    rating: 4.8, reviews: 124, colors: ["#F8D7DF", "#C9385E", "#FFFFFF"], sizes: ["S", "M", "L", "XL"], isBestseller: true, stock: 15,
  },
  {
    id: "p2", name: "فستان كلاسيكي أبيض", price: 99, category: "dresses",
    image: "/images/product-dress.png",
    description: "فستان أبيض بقصة كلاسيكية أنيقة، مصنوع من أجود الأقمشة. يناسب الحفلات النهارية والمناسبات الراقية.",
    rating: 4.6, reviews: 89, colors: ["#FFFFFF", "#F5E7EA"], sizes: ["S", "M", "L"], isNew: true, stock: 10,
  },
  {
    id: "p3", name: "عباية مطرزة فاخرة", price: 189, oldPrice: 239, category: "abayas",
    image: "/images/product-abaya.png",
    description: "عباية سوداء بتطريز ذهبي يدوي على الأكمام، قصة عصرية تجمع بين الأناقة والأصالة. خامة كريب فاخرة ومريحة.",
    rating: 4.9, reviews: 256, colors: ["#000000", "#3A2418"], sizes: ["S", "M", "L", "XL"], isBestseller: true, stock: 8,
  },
  {
    id: "p4", name: "عباية ساتان أنيقة", price: 145, category: "abayas",
    image: "/images/product-abaya.png",
    description: "عباية من قماش الساتان الناعم بلمسات ذهبية. تصميم بسيط وراقي للإطلالات اليومية المميزة.",
    rating: 4.7, reviews: 142, colors: ["#000000", "#7A2B40", "#3A2418"], sizes: ["M", "L", "XL"], stock: 12,
  },
  {
    id: "p5", name: "عطر الوردة البيضاء", price: 85, category: "perfumes",
    image: "/images/product-perfume.png",
    description: "عطر نسائي فاخر بنفحات الورد البلغاري والمسك الأبيض. ثبات يدوم لساعات وعبوة كريستالية أنيقة.",
    rating: 4.9, reviews: 412, colors: ["#F8D7DF"], isBestseller: true, stock: 20,
  },
  {
    id: "p6", name: "عطر الياسمين الذهبي", price: 75, oldPrice: 95, category: "perfumes",
    image: "/images/product-perfume.png",
    description: "تركيبة شرقية فريدة من الياسمين والعود والعنبر. عطر يحكي قصة الأنوثة الشرقية الأصيلة.",
    rating: 4.7, reviews: 198, colors: ["#D4AF7A"], isNew: true, stock: 7,
  },
  {
    id: "p7", name: "حقيبة وردية مع سلسلة", price: 109, category: "bags",
    image: "/images/product-bag.png",
    description: "حقيبة كتف من الجلد الإيطالي بلون الورد الباهت مع سلسلة ذهبية. تتسع لأساسياتك اليومية.",
    rating: 4.8, reviews: 167, colors: ["#F8D7DF", "#FFFFFF", "#000000"], isBestseller: true, stock: 14,
  },
  {
    id: "p8", name: "حقيبة سهرة كلاسيكية", price: 65, category: "bags",
    image: "/images/product-bag.png",
    description: "حقيبة سهرة صغيرة بتصميم كلاسيكي أنيق، مناسبة للمناسبات والحفلات.",
    rating: 4.5, reviews: 78, colors: ["#000000", "#D4AF7A", "#C9385E"], stock: 5,
  },
  {
    id: "p9", name: "قلادة لؤلؤ ذهبية", price: 52, oldPrice: 69, category: "jewelry",
    image: "/images/product-jewelry.png",
    description: "قلادة من الذهب المطلي مع تعليقة لؤلؤ طبيعي. قطعة كلاسيكية تضفي لمسة من الأناقة على إطلالتك.",
    rating: 4.9, reviews: 234, colors: ["#D4AF7A"], isBestseller: true, stock: 18,
  },
  {
    id: "p10", name: "أقراط الورد الذهبية", price: 39, category: "jewelry",
    image: "/images/product-jewelry.png",
    description: "أقراط بتصميم وردة ذهبية، خفيفة الوزن ومناسبة للاستخدام اليومي.",
    rating: 4.6, reviews: 112, colors: ["#D4AF7A", "#C9385E"], isNew: true, stock: 9,
  },
  {
    id: "p11", name: "فستان كوكتيل أحمر", price: 129, category: "dresses",
    image: "/images/product-dress.png",
    description: "فستان كوكتيل أحمر جذاب بقصة عصرية، مثالي للسهرات الراقية.",
    rating: 4.7, reviews: 95, colors: ["#C9385E", "#7A2B40"], sizes: ["S", "M", "L"], stock: 11,
  },
  {
    id: "p12", name: "إسوارة كريستال", price: 32, category: "jewelry",
    image: "/images/product-jewelry.png",
    description: "إسوارة مرصعة بأحجار كريستال متلألئة بتصميم راقي وأنيق.",
    rating: 4.5, reviews: 67, colors: ["#FFFFFF", "#D4AF7A"], stock: 6,
  },
  {
    id: "p13", name: "فستان أطفال وردي", price: 49, category: "kids",
    image: "/images/product-dress.png",
    description: "فستان أطفال بنقشة زهرية ناعمة، خفيف ومريح للعب والسهرات الصغيرة.",
    rating: 4.6, reviews: 58, colors: ["#F8D7DF", "#FFFFFF"], sizes: ["2Y", "4Y", "6Y"], isNew: true, stock: 13,
  },
  {
    id: "p14", name: "طقم أطفال أنيق", price: 56, category: "kids",
    image: "/images/product-dress.png",
    description: "طقم أطفال متناسق مؤلف من بلوزة وتنورة، تصميم حديث مناسب للمناسبات العائلية.",
    rating: 4.7, reviews: 45, colors: ["#FFFFFF", "#C9385E"], sizes: ["3Y", "5Y", "7Y"], stock: 8,
  },
];

export const featuredProducts = products.filter((p) => p.isBestseller);
export const newProducts = products.filter((p) => p.isNew);
