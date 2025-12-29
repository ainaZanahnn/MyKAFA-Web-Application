/** @format */

import { useState } from "react"; // use for hamburger-header
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  Award,
  ArrowRight,
  Star,
  Menu,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../components/ui/card";

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white  to-[#FFFADC] ">
      {/* Header */}
      <header className="border-b border-emerald-600 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-800">KAFA</h1>
              <p className="text-sm text-emerald-600">
                Kelas Al-Quran dan Fardu Ain
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/auth"
              className="px-4 py-2 border border-emerald-200 text-emerald-700 rounded-lg  hover:text-blue-600  hover:bg-emerald-50"
            >
              Daftar Sekarang
            </Link>
            {/*<Link
              to="/register"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
            >
              Daftar Sekarang
            </Link>*/}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-white-700  hover:text-emerald-700 bg-emerald-600 hover:bg-emerald-100"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-emerald-100 bg-white/95 backdrop-blur-sm">
            <div className="px-4 py-3 flex flex-col gap-2">
              <Link
                to="/auth"
                className="px-4 py-2 border border-emerald-200 text-emerald-700 rounded-lg  hover:text-blue-600  hover:bg-emerald-50"
                onClick={() => setIsOpen(false)}
              >
                Daftar Sekarang
              </Link>
              {/*<Link
                to="/register"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-center"
                onClick={() => setIsOpen(false)}
              >
                Daftar Sekarang
              </Link>*/}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Platform Pembelajaran Islam
            <span className="block text-emerald-600 mt-2">
              Yang Adaptif dan Interaktif
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Belajar Al-Quran dan Fardu Ain dengan teknologi pembelajaran adaptif
            yang disesuaikan dengan tahap perkembangan setiap pelajar.
            Menggabungkan tradisi Islam dengan inovasi pendidikan moden.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-8 py-3 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center"
            >
              Mulakan Pembelajaran
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/demo"
              className="px-8 py-3 sm:py-4 border border-emerald-200 text-emerald-700 hover:bg-emerald-50  hover:text-blue-600 rounded-lg"
            >
              Lihat Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Ciri-ciri Utama Platform KAFA
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Teknologi pembelajaran yang direka khas untuk pendidikan Islam di
              Malaysia
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="border border-emerald-100 p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-semibold text-emerald-800 mb-2">
                Pembelajaran Adaptif
              </h4>
              <p className="text-gray-600">
                Sistem yang menyesuaikan tahap kesukaran berdasarkan kemajuan
                pelajar
              </p>
            </div>

            <div className="border border-emerald-100 p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
              <h4 className="text-xl font-semibold text-emerald-800 mb-2">
                Pantauan Guru & Ibu Bapa
              </h4>
              <p className="text-gray-600">
                Dashboard untuk guru dan ibu bapa memantau kemajuan pelajar
              </p>
            </div>

            <div className="border border-emerald-100 p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-rose-600" />
              </div>
              <h4 className="text-xl font-semibold text-emerald-800 mb-2">
                Sistem Ganjaran
              </h4>
              <p className="text-gray-600">
                Motivasi pembelajaran melalui sistem mata, lencana, dan
                pencapaian
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Modules */}
      <section className="py-16 bg-gradient-to-r from-emerald-50 to-amber-50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Modul Pembelajaran
            </h3>
            <p className="text-lg text-gray-600">
              Kurikulum lengkap yang mengikuti sukatan KAFA Malaysia
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { title: "Al-Quran", desc: "Bacaan dan hafalan", icon: "📖" },
              { title: "Fardu Ain", desc: "Rukun Islam & Iman", icon: "🕌" },
              {
                title: "Akhlak",
                desc: "Akhlak Islamiah & Adab Harian",
                icon: "❤️",
              },
              { title: "Sirah", desc: "Sejarah Nabi & Sahabat", icon: "📚" },
              { title: "Fiqh", desc: "Ibadah & Amalan Harian", icon: "🕋" },
              { title: "Tauhid", desc: "Aqidah & Keimanan", icon: "☪️" },
              { title: "Jawi", desc: "Bacaan & Penulisan Asas", icon: "✍️" },
              { title: "Bahasa Arab", decs: "Asas Bahasa Arab", icon: "🗣️" },
            ].map((module, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow border-gray-100"
              >
                <CardHeader>
                  <div className="text-4xl mb-2">{module.icon}</div>
                  <CardTitle className="text-lg text-gray-800">
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{module.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
        <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-white">KAFA</h4>
            </div>
            <p className="text-sm">
              Platform pembelajaran Islam adaptif untuk generasi digital
              Malaysia
            </p>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4">Pembelajaran</h5>
            <ul className="space-y-2 text-sm">
              <li>Al-Quran</li>
              <li>Fardu Ain</li>
              <li>Akhlak</li>
              <li>Sirah</li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4">Sokongan</h5>
            <ul className="space-y-2 text-sm">
              <li>Pusat Bantuan</li>
              <li>Hubungi Kami</li>
              <li>FAQ</li>
              <li>Tutorial</li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold mb-4">Syarikat</h5>
            <ul className="space-y-2 text-sm">
              <li>Tentang Kami</li>
              <li>Dasar Privasi</li>
              <li>Terma Penggunaan</li>
              <li>Blog</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm">
          © 2025 KAFA Platform. Hak cipta terpelihara.
        </div>
      </footer>
    </div>
  );
}
