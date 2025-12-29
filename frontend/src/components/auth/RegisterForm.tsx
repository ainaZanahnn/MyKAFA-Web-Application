/** @format */

import { useState, useEffect } from "react";
import { Eye, EyeOff, User, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { validateRegisterForm, passwordRules } from "./validator";
import { useAuth } from "./useAuth";
import { toast } from "react-toastify";

const RegisterForm = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [stateName, setStateName] = useState("");
  const [grade, setGrade] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset role-specific fields when role changes
  useEffect(() => {
    if (role === "student") {
      setPhone("");
    } else if (role === "guardian") {
      setGrade("");
      setSchoolType("");
      setSchoolName("");
    }
  }, [role]);

  // Handle registration form submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateRegisterForm(
      {
        role,
        full_name: fullName,
        email,
        id_pengguna: userId,
        state: stateName,
        grade,
        schoolType,
        schoolName,
        phone,
        password,
        confirmPassword,
      },
      8
    );

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setIsSubmitting(true);

        const formData = {
          role,
          full_name: fullName,
          email,
          id_pengguna: userId,
          state: stateName,
          grade,
          schoolType,
          schoolName,
          phone,
          password,
        };

        const result = await register(formData);

        if (result.success) {
          toast.success(result.message || "Akaun berjaya didaftarkan!");
          // Reset
          setRole("");
          setFullName("");
          setEmail("");
          setUserId("");
          setStateName("");
          setGrade("");
          setSchoolType("");
          setSchoolName("");
          setPhone("");
          setPassword("");
          setConfirmPassword("");

          // Redirect based on role
          if (user) {
            if (user.role === "admin") {
              navigate("/admin/dashboard");
            } else if (user.role === "student") {
              navigate("/student/dashboard");
            } else if (user.role === "guardian") {
              navigate("/guardian/dashboard");
            }
          }
        } else {
          toast.error(result.message || "Pendaftaran gagal!");
        }
      } catch (err: unknown) {
        toast.error("Ralat semasa pendaftaran pengguna.");
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const firstKey = Object.keys(newErrors)[0];
      const el = document.querySelector<HTMLInputElement | HTMLSelectElement>(
        `[name="${firstKey}"]`
      );
      if (el) el.focus();
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-emerald-700 mb-4 pt-24">
        Daftar Akaun
      </h1>

      <form onSubmit={handleRegister} className="w-full space-y-3 text-left">
        {/* Role */}
        <div className="flex justify-center gap-4 mb-3">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex flex-col items-center p-3 border rounded-md transition-colors duration-200
              ${
                role === "student"
                  ? "bg-blue-200 border-blue-400 text-blue-800 hover:bg-blue-300"
                  : "border-blue-200 bg-transparent text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
          >
            <User
              className={`w-6 h-6 mb-1 ${
                role === "student" ? "text-blue-700" : "text-blue-600"
              }`}
            />
            <span className="text-xs font-medium">Pelajar</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("guardian")}
            className={`flex flex-col items-center p-3 border rounded-md transition-colors duration-200
              ${
                role === "guardian"
                  ? "bg-amber-200 border-amber-400 text-amber-800 hover:bg-amber-300"
                  : "border-amber-200 bg-transparent text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              }`}
          >
            <Users
              className={`w-6 h-6 mb-1 ${
                role === "guardian" ? "text-amber-700" : "text-amber-600"
              }`}
            />
            <span className="text-xs font-medium">Ibu Bapa</span>
          </button>
        </div>
        {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}

        {/* Full Name */}
        <input
          name="full_name"
          type="text"
          placeholder="Nama Penuh"
          className="w-full bg-gray-100 p-2 rounded"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        {errors.full_name && (
          <p className="text-sm text-red-600">{errors.full_name}</p>
        )}

        {/* Email */}
        <input
          name="email"
          type="email"
          placeholder="Alamat E-mel"
          className="w-full bg-gray-100 p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}

        {/*ID Pengguna */}
        <input
          name="id_pengguna"
          type="text"
          placeholder="ID Pengguna"
          className="w-full bg-gray-100 p-2 rounded"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        {errors.id_pengguna && (
          <p className="text-sm text-red-600">{errors.id_pengguna}</p>
        )}

        {/* Negeri */}
        <select
          name="state"
          className="w-full bg-gray-100 p-2 rounded"
          value={stateName}
          onChange={(e) => setStateName(e.target.value)}
        >
          <option value="">-- Pilih Negeri --</option>
          <option value="selangor">Selangor</option>
          <option value="johor">Johor</option>
          <option value="kedah">Kedah</option>
          <option value="perak">Perak</option>
          <option value="pahang">Pahang</option>
          <option value="kelantan">Kelantan</option>
          <option value="terengganu">Terengganu</option>
          <option value="penang">Pulau Pinang</option>
          <option value="perlis">Perlis</option>
          <option value="negeri-sembilan">Negeri Sembilan</option>
          <option value="melaka">Melaka</option>
          <option value="sabah">Sabah</option>
          <option value="sarawak">Sarawak</option>
          <option value="wp-kl">W.P. Kuala Lumpur</option>
          <option value="wp-labuan">W.P. Labuan</option>
          <option value="wp-putrajaya">W.P. Putrajaya</option>
        </select>
        {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}

        {/*Student fields */}
        {role === "student" && (
          <>
            <input
              name="grade"
              type="text"
              placeholder="Tahun / Darjah"
              className="w-full bg-gray-100 p-2 rounded"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
            <select
              name="schoolType"
              className="w-full bg-gray-100 p-2 rounded"
              value={schoolType}
              onChange={(e) => setSchoolType(e.target.value)}
            >
              <option value="">-- Pilih Jenis Sekolah --</option>
              <option value="kerajaan">Sekolah Kerajaan</option>
              <option value="swasta">Sekolah Swasta</option>
              <option value="home">Home School</option>
            </select>
            {(schoolType === "kerajaan" || schoolType === "swasta") && (
              <input
                name="schoolName"
                type="text"
                placeholder="Nama Sekolah"
                className="w-full bg-gray-100 p-2 rounded"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            )}
          </>
        )}

        {/* Guardian field */}
        {role === "guardian" && (
          <input
            name="phone"
            type="tel"
            placeholder="Nombor Telefon"
            className="w-full bg-gray-100 p-2 rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        )}

        {/* Password */}
        <div className="relative mb-2">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Kata Laluan"
            className="w-full bg-gray-100 p-2 rounded pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-2 text-gray-500 bg-transparent"
          >
            {showPassword ? <Eye /> : <EyeOff />}
          </button>

          {/*Live Password Rules */}
          {password && (
            <div className="mt-1 text-xs space-y-0.5">
              {(() => {
                const r = passwordRules(password, 8);
                const conditions = [
                  { ok: r.minLength, text: "Minimum 8 aksara" },
                  { ok: r.hasUpper, text: "Huruf besar" },
                  { ok: r.hasLower, text: "Huruf kecil" },
                  { ok: r.hasNumber, text: "Nombor" },
                  { ok: r.hasSpecial, text: "Aksara khas (!@#$%)" },
                ];
                return conditions.map((c, i) => (
                  <p
                    key={i}
                    className={`transition-colors duration-200 ${
                      c.ok ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {c.text}
                  </p>
                ));
              })()}
            </div>
          )}

          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Sahkan Kata Laluan"
            className="w-full bg-gray-100 p-2 rounded pr-10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-2 text-gray-500 bg-transparent"
          >
            {showConfirmPassword ? <Eye /> : <EyeOff />}
          </button>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms */}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" required />
          Saya bersetuju dengan{" "}
          <Link to="/terms" className="text-emerald-600">
            Terma Penggunaan
          </Link>{" "}
          dan{" "}
          <Link to="/privacy" className="text-emerald-600">
            Dasar Privasi
          </Link>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg mt-2 disabled:opacity-60 mb-6"
        >
          {isSubmitting ? "Sedang memproses..." : "Daftar Akaun"}
        </button>
      </form>
    </>
  );
};

export default RegisterForm;
