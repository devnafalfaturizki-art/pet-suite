import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const HomePagePublic = lazy(() => import('@/features/website/pages/Public/HomePage'));
const ArticlesPagePublic = lazy(() => import('@/features/website/pages/Public/ArticlesPage'));
const ArticleDetailPage = lazy(() => import('@/features/website/pages/Public/ArticleDetailPage'));
const ServicesPagePublic = lazy(() => import('@/features/website/pages/Public/ServicesPage'));
const ContactPagePublic = lazy(() => import('@/features/website/pages/Public/ContactPage'));
const DoctorsPage = lazy(() => import('@/features/website/pages/Public/DoctorsPage'));
const BookingPage = lazy(() => import('@/features/website/pages/Public/BookingPage'));

export const publicRoutes: RouteObject[] = [
  { index: true, element: <HomePagePublic /> },
  { path: 'articles', element: <ArticlesPagePublic /> },
  { path: 'articles/:slug', element: <ArticleDetailPage /> },
  { path: 'services', element: <ServicesPagePublic /> },
  { path: 'contact', element: <ContactPagePublic /> },
  { path: 'doctors', element: <DoctorsPage /> },
  { path: 'booking', element: <BookingPage /> },
];