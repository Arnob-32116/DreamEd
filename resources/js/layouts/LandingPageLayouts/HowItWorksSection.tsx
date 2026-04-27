const steps = [
    {
        number: '1',
        color: 'bg-blue-500',
        title: 'Create Your Profile',
        description: 'Tell us about your academic background, interests, and goals',
    },
    {
        number: '2',
        color: 'bg-violet-500',
        title: 'Discover & Compare',
        description: 'Browse universities, compare programs, and save your favorites',
    },
    {
        number: '3',
        color: 'bg-pink-500',
        title: 'Apply & Track',
        description: 'Manage applications, track deadlines, and achieve your goals',
    },
];

export default function HowItWorksSection() {
    return (
        <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">How It Works</h2>
                <p className="text-gray-500 text-lg mb-16">Get started in just three simple steps</p>

                {/* Steps */}
                <div className="relative flex flex-col sm:flex-row items-center sm:items-start justify-center gap-8 sm:gap-0">
                    {steps.map((step, index) => (
                        <div key={step.number} className="relative flex flex-col items-center flex-1">
                            {/* Connector line (between steps, desktop only) */}
                            {index < steps.length - 1 && (
                                <div className="hidden sm:block absolute top-7 left-1/2 w-full h-px bg-gradient-to-r from-gray-300 to-gray-200 z-0" />
                            )}

                            {/* Circle */}
                            <div className={`relative z-10 w-14 h-14 ${step.color} rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg mb-5`}>
                                {step.number}
                            </div>

                            <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-[180px]">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
