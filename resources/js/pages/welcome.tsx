import { Head, usePage } from '@inertiajs/react';
import Navbar from '@/layouts/LandingPageLayouts/Navbar';
import HeroSection from '@/layouts/LandingPageLayouts/HeroSection';
import FeaturesSection from '@/layouts/LandingPageLayouts/FeatureSection';
import HowItWorksSection from '@/layouts/LandingPageLayouts/HowItWorksSection';
import Footer from '@/layouts/LandingPageLayouts/Footer'
import WhyChooseSection from '@/layouts/LandingPageLayouts/WhyChooseSection';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="UniSearch — Find Your Dream University">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,800"
                    rel="stylesheet"
                />
            </Head>

            <div className="font-[instrument-sans] antialiased text-gray-900">
                <Navbar
                    isAuthenticated={!!auth?.user}
                    canRegister={canRegister}
                />

                <main>
                    <HeroSection />
                    <FeaturesSection />
                    <HowItWorksSection />
                    <WhyChooseSection/>
                    <Footer/>
                </main>

                
            </div>
        </>
    );
}
