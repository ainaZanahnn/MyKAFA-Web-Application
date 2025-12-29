/** @format */
/**
 * components/auth/validators.ts
 *
 * Reusable validation helpers for Login/Register.
 * Returns either `null` (no error) or an error message (string).
 */

export type PasswordRules = {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
};

export const isEmail = (value: string): boolean => /\S+@\S+\.\S+/.test(value);

/** Email Validation */
export const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) return "Alamat e-mel diperlukan";
  if (!isEmail(email)) return "Alamat e-mel tidak sah";
  return null;
};

/** Password Validation */
export const passwordRules = (
  password: string,
  minLength = 8
): PasswordRules => ({
  minLength: password.length >= minLength,
  hasUpper: /[A-Z]/.test(password),
  hasLower: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecial: /[^A-Za-z0-9]/.test(password),
});

export const isPasswordValid = (password: string, minLength = 8): boolean =>
  Object.values(passwordRules(password, minLength)).every(Boolean);

export const validatePassword = (
  password: string,
  minLength = 8
): string | null => {
  if (!password) return "Kata laluan diperlukan";
  const r = passwordRules(password, minLength);
  if (Object.values(r).every(Boolean)) return null;

  const missing: string[] = [];
  if (!r.minLength) missing.push(`${minLength} aksara`);
  if (!r.hasUpper) missing.push("huruf besar");
  if (!r.hasLower) missing.push("huruf kecil");
  if (!r.hasNumber) missing.push("nombor");
  if (!r.hasSpecial) missing.push("aksara khas");

  return `Kata laluan mesti mengandungi: ${missing.join(", ")}`;
};

export const validateConfirmPassword = (
  password: string,
  confirm: string
): string | null => {
  if (confirm !== password) return "Kata laluan tidak sepadan";
  return null;
};

/** General Name Validation */
export const validateName = (name: string): string | null => {
  if (!name || !name.trim()) return "Nama diperlukan";
  return null;
};

/** ID Pengguna Validation (letters, numbers, symbols) */
export const validateUserId = (id: string): string | null => {
  if (!id || !id.trim()) return "ID pengguna diperlukan";
  if (id.trim().length < 3) return "ID pengguna terlalu pendek";
  if (!/^[A-Za-z0-9._@-]+$/.test(id))
    return "ID pengguna hanya boleh mengandungi huruf, nombor, titik, dash, atau @";
  return null;
};

/** State Validation */
export const validateState = (s: string): string | null => {
  if (!s) return "Negeri diperlukan";
  return null;
};

/** Phone Validation */
export const validatePhone = (phone: string): string | null => {
  if (!phone || !phone.trim()) return "Nombor telefon diperlukan";
  const cleaned = phone.replace(/[\s-]/g, "");
  if (!/^\+?\d{7,15}$/.test(cleaned)) return "Nombor telefon tidak sah";
  return null;
};

/** Role Validation */
export const validateRole = (role: string): string | null => {
  if (!role) return "Sila pilih peranan";
  if (!(role === "student" || role === "guardian" || role === "admin"))
    return "Peranan tidak sah";
  return null;
};

/**
 * Composite validator for register form.
 */
export type RegisterData = {
  role: string;
  full_name: string;
  email: string;
  id_pengguna: string;
  state: string;
  grade?: string;
  schoolType?: string;
  schoolName?: string;
  phone?: string;
  password: string;
  confirmPassword: string;
};

export const validateRegisterForm = (
  data: RegisterData,
  passwordMinLength = 8
): Record<string, string> => {
  const errs: Record<string, string> = {};

  const rRole = validateRole(data.role);
  if (rRole) errs.role = rRole;

  const rName = validateName(data.full_name);
  if (rName) errs.full_name = rName;

  const rEmail = validateEmail(data.email);
  if (rEmail) errs.email = rEmail;

  const rUserId = validateUserId(data.id_pengguna);
  if (rUserId) errs.id_pengguna = rUserId;

  const rState = validateState(data.state);
  if (rState) errs.state = rState;

  if (data.role === "student") {
    if (!data.grade || !data.grade.trim())
      errs.grade = "Tahun / Darjah diperlukan";
    if (!data.schoolType) errs.schoolType = "Jenis sekolah diperlukan";
    if (
      (data.schoolType === "kerajaan" || data.schoolType === "swasta") &&
      (!data.schoolName || !data.schoolName.trim())
    )
      errs.schoolName = "Nama sekolah diperlukan";
  }

  if (data.role === "guardian") {
    const rPhone = validatePhone(data.phone || "");
    if (rPhone) errs.phone = rPhone;
  }

  const rPass = validatePassword(data.password, passwordMinLength);
  if (rPass) errs.password = rPass;

  const rConfirm = validateConfirmPassword(data.password, data.confirmPassword);
  if (rConfirm) errs.confirmPassword = rConfirm;

  return errs;
};

/**
 * Composite validator for login
 */
export const validateLoginForm = (
  identifier: string,
  password: string
): Record<string, string> => {
  const errs: Record<string, string> = {};

  // Accept either id_pengguna or email
  const isId = /^[A-Za-z0-9@._#-]{3,30}$/.test(identifier);
  const isMail = /\S+@\S+\.\S+/.test(identifier);

  if (!isId && !isMail)
    errs.identifier = "Masukkan ID pengguna atau e-mel yang sah";

  const p = validatePassword(password, 6);
  if (p) errs.password = p;

  return errs;
};
