import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    GraduationCap,
    LayoutGrid,
    Award,
    PenSquare,
    University,
    BookMarked,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import type { Auth } from '@/types/auth';

interface SharedData {
    auth: Auth;
    name: string;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const role = auth?.user?.role as string; // 'student' | 'contributor' | 'admin'

    

    const studentItems: NavItem[] = [
        {
            title: 'Universities',
            href: '/universities',
            icon: University,
        },
        {
            title: 'Scholarships',
            href: '/scholarships',
            icon: Award,
        },
        {
            title: 'Blog',
            href: '/blog',
            icon: BookMarked,
        },
        {
            title: 'Calendar',
            href: '/calendar',
            icon: Calendar,
        },
    ];

    const contributorItems: NavItem[] = [
        {
            title: 'My Universities',
            href: '/contributor/universities',
            icon: University,
        },
        {
            title: 'My Scholarships',
            href: '/contributor/scholarships',
            icon: Award,
        },
        
    ];

    const adminItems: NavItem[] = [
        {
            title: 'All Universities',
            href: '/universities',
            icon: University,
        },
        {
            title: 'All Scholarships',
            href: '/scholarships',
            icon: Award,
        },
        {
            title: 'Manage Contributors',
            href: '/contributor/universities',
            icon: GraduationCap,
        },
        {
            title: 'Blog',
            href: '/blog',
            icon: BookMarked,
        },
    ];

    const roleItems =
        role === 'admin'       ? adminItems :
        role === 'contributor' ? contributorItems :
                                 studentItems;

    const mainNavItems = [...roleItems];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}