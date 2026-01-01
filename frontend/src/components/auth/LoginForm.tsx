/** @format */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Star as Mosque } from "lucide-react";
import { Link } from "react-router-dom";
import { validateLoginForm } from "./validator";
import { useAuth } from "./useAuth";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs = validateLoginForm(loginIdentifier, loginPassword);
    setLoginErrors(errs);

    if (Object.keys(errs).length === 0) {
      try {
        const result = await login(loginIdentifier, loginPassword);

        if (result.success && result.user) {
          if (result.user.role === "admin") {
            navigate("/admin/dashboard");
          } else if (result.user.role === "student") {
            navigate("/student/dashboard");
          } else if (result.user.role === "guardian") {
            navigate("/guardian/dashboard");
          }
        }
      } catch (error) {
        console.error("Login failed", error);
        setLoginErrors({ general: "Invalid username or password" });
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
          <Mosque className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-emerald-800">MyKAFA</h1>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Log Masuk</h1>
      <form onSubmit={handleLogin} className="w-full space-y-3 text-left">
        <input
          type="text"
          placeholder="Alamat E-mel/ID Pengguna"
          className="w-full bg-gray-100 p-3 rounded"
          value={loginIdentifier}
          onChange={(e) => setLoginIdentifier(e.target.value)}
        />
        {loginErrors.identifier && (
          <p className="text-sm text-red-600">{loginErrors.identifier}</p>
        )}

        <div className="relative">
          <input
            type={showLoginPassword ? "text" : "password"}
            placeholder="Kata Laluan"
            className="w-full bg-gray-100 p-3 rounded pr-10"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowLoginPassword(!showLoginPassword)}
            className="absolute inset-y-0 right-3 text-gray-500 bg-transparent"
          >
            {showLoginPassword ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
          {loginErrors.password && (
            <p className="text-sm text-red-600">{loginErrors.password}</p>
          )}
        </div>

        <div className="flex justify-between items-center text-sm mb-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-gray-600">Ingat saya</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-emerald-600 hover:text-emerald-700"
          >
            Lupa kata laluan?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg"
        >
          Log Masuk
        </button>

        {/* general error */}
        {loginErrors.general && (
          <p className="text-red-500 text-sm">{loginErrors.general}</p>
        )}
      </form>
    </>
  );
};

export default LoginForm;
