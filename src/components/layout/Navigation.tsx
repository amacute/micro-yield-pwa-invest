
import { Shield, Users, Wallet, User, Bell } from 'lucide-react';

export const userNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Users,
  },
  {
    title: 'P2P Lending',
    href: '/p2p',
    icon: Users,
  },
  {
    title: 'Wallet',
    href: '/wallet',
    icon: Wallet,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    title: 'KYC Verification',
    href: '/profile/kyc',
    icon: Shield,
  },
];

export const adminNavItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Users,
  },
  {
    title: 'P2P Management',
    href: '/admin/p2p',
    icon: Users,
  },
  {
    title: 'KYC Verifications',
    href: '/admin/kyc',
    icon: Shield,
  },
  {
    title: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
  },
];
