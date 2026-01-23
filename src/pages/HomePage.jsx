import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, Shield, Zap, Globe } from 'lucide-react';
import Button from '../components/Button';
import useAuthStore from '../store/authStore';

export default function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 bg-clip-text text-transparent leading-tight">
              Welcome to LibraryHub
            </h1>
            <p className="text-xl text-gray-600">
              A modern library management system designed for seamless book borrowing and management.  Discover, borrow, and manage your favorite books effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {user ?  (
                <Link to="/books">
                  <Button size="lg">
                    Browse Books
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="lg" variant="outline">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in">
            <div className="w-full h-96 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-2xl flex items-center justify-center shadow-large">
              <BookOpen className="w-40 h-40 text-white opacity-30" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg: px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
          Powerful Features
        </h2>
        <div className="grid md: grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass rounded-xl p-8 border border-white/20 hover:shadow-medium transition-smooth hover:scale-105"
            >
              <feature.icon className="w-12 h-12 text-primary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm: px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="glass rounded-xl p-8 border border-white/20 text-center"
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {! user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="glass rounded-2xl border border-white/20 p-12 text-center bg-gradient-to-r from-primary-50 to-secondary-50">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Start Managing Your Library?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already using LibraryHub to manage their book collections efficiently.
            </p>
            <Link to="/register">
              <Button size="lg">Create Your Account</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

const features = [
  {
    icon: BookOpen,
    title: 'Vast Collection',
    description: 'Access thousands of books across multiple categories and genres.',
  },
  {
    icon: Users,
    title: 'Easy Borrowing',
    description:  'Borrow and return books with just a few clicks.',
  },
  {
    icon: TrendingUp,
    title: 'Track History',
    description: 'Keep track of your borrowing history and overdue books.',
  },
  {
    icon: Shield,
    title: 'Secure',
    description: 'Your data is protected with industry-standard encryption.',
  },
  {
    icon: Zap,
    title: 'Fast & Reliable',
    description: 'Lightning-fast performance and 99.9% uptime.',
  },
  {
    icon: Globe,
    title: 'Always Available',
    description: 'Access your library anytime, anywhere on any device.',
  },
];

const stats = [
  { number: '10K+', label: 'Books in Collection' },
  { number: '5K+', label: 'Active Users' },
  { number:  '50K+', label: 'Books Borrowed' },
];