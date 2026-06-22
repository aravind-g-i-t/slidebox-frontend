const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

export const isValidEmail = (email: string): boolean => EMAIL_REGEX.test(email.trim());

export const isValidPhone = (phone: string): boolean =>
    PHONE_REGEX.test(phone.trim().replace(/[\s-]/g, ""));

export interface PasswordStrength {
    score: number;
    label: string;
    color: string;
}

export function getPasswordStrength(pw: string): PasswordStrength {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (pw.length >= 12) score++;

    if (score <= 1) return { score, label: "Weak", color: "#E24B4A" };
    if (score <= 2) return { score, label: "Fair", color: "#F4A261" };
    if (score <= 3) return { score, label: "Good", color: "#2A9D8F" };
    return { score, label: "Strong", color: "#40916C" };
}