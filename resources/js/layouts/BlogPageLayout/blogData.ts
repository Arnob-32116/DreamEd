export interface BlogPost {
    id: number;
    title: string;
    slug?: string;
    category: string;
    author: string;
    authorAvatar: string;
    date: string;
    readTime: string;
    excerpt: string;
    shares: number;
    views?: number;
    image?: string;
    imageColor?: string;
    cover_image?: string | null;
    status?: string;
    content?: string;
}

// ✅ Must match exactly what BlogController::getCategories() returns
export const CATEGORIES = [
    "All",
    "Study Abroad",
    "Student Life",
    "Career",
    "Programs",
    "Side Hustle",
    "Visa Guide",
    "Education",
    "Scholarship",   // ← was missing, causing posts with this category to fail validation
];

export const BLOG_POSTS: BlogPost[] = [
    {
        id: 1,
        title: "Top Destinations for Study Abroad in 2024",
        category: "Study Abroad",
        author: "Sarah Johnson",
        authorAvatar: "SJ",
        date: "Jan 15, 2024",
        readTime: "5 min read",
        excerpt: "Discover the most popular and affordable destinations for international students looking to broaden their horizons.",
        shares: 1200,
        imageColor: "#c9a96e",
    },
    {
        id: 2,
        title: "How to Balance Study and Social Life Abroad",
        category: "Student Life",
        author: "Emily Chen",
        authorAvatar: "EC",
        date: "Jan 12, 2024",
        readTime: "7 min read",
        excerpt: "Tips and strategies to make the most of your time abroad without sacrificing your academic performance.",
        shares: 850,
        imageColor: "#6a8fa8",
    },
    {
        id: 3,
        title: "Building Your Career While Studying Overseas",
        category: "Career",
        author: "Alex Turner",
        authorAvatar: "AT",
        date: "Jan 10, 2024",
        readTime: "6 min read",
        excerpt: "Learn how to leverage your international experience to build a strong career foundation from day one.",
        shares: 2100,
        imageColor: "#7a6a5a",
    },
    {
        id: 4,
        title: "You Can Study Surveying and It's Fun",
        category: "Programs",
        author: "Michael Roberts",
        authorAvatar: "MR",
        date: "Jan 8, 2024",
        readTime: "6 min read",
        excerpt: "Discover the exciting world of surveying and geomatics - a field that combines technology, outdoor work, and career opportunities.",
        shares: 650,
        imageColor: "#8a9a7a",
    },
    {
        id: 5,
        title: "Mobile Photography: An Easy Income Source",
        category: "Side Hustle",
        author: "Lisa Park",
        authorAvatar: "LP",
        date: "Jan 5, 2024",
        readTime: "8 min read",
        excerpt: "Turn your smartphone into a money-making tool by mastering mobile photography and selling your work online.",
        shares: 1500,
        imageColor: "#3a3a4a",
    },
    {
        id: 6,
        title: "Bring Your Better Half With You Using Spouse Visa",
        category: "Visa Guide",
        author: "David Kumar",
        authorAvatar: "DK",
        date: "Jan 3, 2024",
        readTime: "9 min read",
        excerpt: "Navigate the spouse visa process successfully and bring your partner along on your study abroad journey.",
        shares: 920,
        imageColor: "#7a8a9a",
    },
    {
        id: 7,
        title: "Fisheries and Marine Biology: A New Door for Better Future",
        category: "Programs",
        author: "Rachel Green",
        authorAvatar: "RG",
        date: "Dec 28, 2023",
        readTime: "7 min read",
        excerpt: "Explore the fascinating world of marine sciences and discover career opportunities in this growing field.",
        shares: 780,
        imageColor: "#4a6a8a",
    },
    {
        id: 8,
        title: "Highway to Higher Studies for All",
        category: "Education",
        author: "James Wilson",
        authorAvatar: "JW",
        date: "Dec 25, 2023",
        readTime: "6 min read",
        excerpt: "Breaking down barriers to education and making higher studies accessible to students from all backgrounds.",
        shares: 1350,
        imageColor: "#b0b0b0",
    },
    {
        id: 9,
        title: "Visa Processing Made Easy Using These Techniques",
        category: "Visa Guide",
        author: "Anna Martinez",
        authorAvatar: "AM",
        date: "Dec 22, 2023",
        readTime: "11 min read",
        excerpt: "Simplify your visa application process with these proven strategies and expert tips from successful applicants.",
        shares: 1680,
        imageColor: "#b0b0b0",
    },
    {
        id: 10,
        title: "Scholarship Hunting: A Step-by-Step Guide",
        category: "Scholarship",
        author: "Priya Patel",
        authorAvatar: "PP",
        date: "Dec 18, 2023",
        readTime: "10 min read",
        excerpt: "Master the art of finding and applying for scholarships that can fund your entire education abroad.",
        shares: 2300,
        imageColor: "#e8c97a",
    },
    {
        id: 11,
        title: "Freelancing While Studying: Make It Work",
        category: "Side Hustle",
        author: "Tom Baker",
        authorAvatar: "TB",
        date: "Dec 15, 2023",
        readTime: "8 min read",
        excerpt: "A practical guide to freelancing while managing your studies — time management, platforms, and earning strategies.",
        shares: 1100,
        imageColor: "#a0c0d0",
    },
    {
        id: 12,
        title: "Student Accommodation: What to Expect",
        category: "Student Life",
        author: "Nina Scott",
        authorAvatar: "NS",
        date: "Dec 12, 2023",
        readTime: "5 min read",
        excerpt: "From dorms to shared apartments — everything you need to know about finding and living in student accommodation abroad.",
        shares: 960,
        imageColor: "#d0a090",
    },
];
