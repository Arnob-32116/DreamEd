const footerLinks = {
    Product: ['Universities', 'Scholarships', 'Applications', 'Calendar'],
    Resources: ['Blog', 'Guides', 'FAQ', 'Support'],
    Company: ['About', 'Careers', 'Contact', 'Privacy'],
};

export default function Footer() {
    return (
        <footer className="bg-[#0f1117] text-gray-400 py-14 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-10">
                    {/* Brand */}
                    <div className="col-span-2 sm:col-span-1">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            </div>
                            <span className="text-white font-semibold text-base">UniSearch</span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">Your gateway to global education opportunities</p>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([heading, links]) => (
                        <div key={heading}>
                            <h4 className="text-white text-sm font-semibold mb-4">{heading}</h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-sm text-gray-500 hover:text-gray-200 transition-colors">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-600">
                    © {new Date().getFullYear()} UniSearch. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
