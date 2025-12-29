/** @format */
import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthSlider = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4">
      <div
        className={`relative w-full max-w-[950px] min-h-[580px] md:min-h-[580px] rounded-xl shadow-xl overflow-hidden transition-all duration-700 ${
          isRightPanelActive ? "right-panel-active" : ""
        }`}
      >
        {/* Register Panel */}
        <div
          className={`absolute top-0 left-0 h-full w-full md:w-1/2 flex flex-col items-center justify-center bg-white px-8 text-center transition-all duration-700 overflow-y-auto ${
            isRightPanelActive
              ? "md:translate-x-full opacity-100 z-20"
              : "opacity-0 md:opacity-0 z-10"
          }`}
        >
          <RegisterForm />
        </div>

        {/* Login Panel */}
        <div
          className={`absolute top-0 left-0 h-full w-full md:w-1/2 flex flex-col items-center justify-center bg-white px-12 text-center transition-all duration-700 ${
            isRightPanelActive
              ? "md:translate-x-full opacity-0 z-10"
              : "opacity-100 z-20"
          }`}
        >
          <LoginForm />
        </div>

        {/* Overlay */}
        <div
          className={`absolute top-0 left-0 md:left-1/2 w-full md:w-1/2 h-full transition-transform duration-700 ${
            isRightPanelActive ? "md:-translate-x-full" : ""
          }`}
        >
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white h-full flex items-center justify-center">
            {isRightPanelActive ? (
              <div className="flex flex-col items-center text-center px-4 md:px-10">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">
                  Selamat Kembali!
                </h1>
                <p className="mb-4 text-sm md:text-base">
                  Untuk teruskan, sila log masuk dengan maklumat peribadi anda
                </p>
                <button
                  onClick={() => setIsRightPanelActive(false)}
                  className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-emerald-600 transition"
                >
                  Log Masuk
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center px-4 md:px-10">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">
                  Hai, Rakan!
                </h1>
                <p className="mb-4 text-sm md:text-base">
                  Masukkan maklumat anda dan mulakan perjalanan anda bersama
                  kami
                </p>
                <button
                  onClick={() => setIsRightPanelActive(true)}
                  className="border border-white px-6 py-2 rounded-full hover:bg-white hover:text-emerald-600 transition"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Toggle Buttons */}
        <div className="md:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 z-30">
          <button
            onClick={() => setIsRightPanelActive(false)}
            className={`px-4 py-2 rounded-full transition ${
              !isRightPanelActive
                ? "bg-emerald-600 text-white"
                : "bg-white text-emerald-600 border border-emerald-600"
            }`}
          >
            Log Masuk
          </button>
          <button
            onClick={() => setIsRightPanelActive(true)}
            className={`px-4 py-2 rounded-full transition ${
              isRightPanelActive
                ? "bg-emerald-600 text-white"
                : "bg-white text-emerald-600 border border-emerald-600"
            }`}
          >
            Daftar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthSlider;
