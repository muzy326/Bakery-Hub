import { useState } from "react";
import { User, Mail, Lock, Save, CheckCircle } from "lucide-react";
import { useAuth } from "../context/useAuth";

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!user) {
    return null;
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await updateProfile(
        name,
        email,
        password || undefined,
      );

      setPassword("");
      setMessage("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F3EC] py-12 px-4">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#2C1810] shadow-md">
            <User size={34} className="text-[#D4A017]" />
          </div>

          <h1 className="font-serif text-3xl font-bold text-[#2C1810]">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-[#756A61]">
            Manage your account information
          </p>
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-[#E5D8C9] bg-white shadow-sm">

          {/* Card Header */}
          <div className="border-b border-[#E5D8C9] bg-[#FFF9F2] px-6 py-5">
            <h2 className="text-lg font-semibold text-[#2C1810]">
              Account Information
            </h2>

            <p className="mt-1 text-sm text-[#756A61]">
              Update your name, email, or password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">

            {/* Name */}
            <div className="mb-5">
              <label
                htmlFor="name"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#2C1810]"
              >
                <User size={16} className="text-[#B77E4D]" />
                Name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-[#D9CEC2] bg-[#FFFDF9] px-4 py-3 text-sm text-[#302119] outline-none transition focus:border-[#B77E4D] focus:ring-2 focus:ring-[#B77E4D]/15"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#2C1810]"
              >
                <Mail size={16} className="text-[#B77E4D]" />
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-[#D9CEC2] bg-[#FFFDF9] px-4 py-3 text-sm text-[#302119] outline-none transition focus:border-[#B77E4D] focus:ring-2 focus:ring-[#B77E4D]/15"
                required
              />
            </div>

            {/* Password Section */}
            <div className="mb-6 border-t border-[#E5D8C9] pt-6">
              <div className="mb-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-[#2C1810]">
                  <Lock size={17} className="text-[#B77E4D]" />
                  Change Password
                </h3>

                <p className="mt-1 text-sm text-[#756A61]">
                  Leave this field empty if you don't want to change your password.
                </p>
              </div>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter a new password"
                minLength={6}
                className="w-full rounded-xl border border-[#D9CEC2] bg-[#FFFDF9] px-4 py-3 text-sm text-[#302119] outline-none transition placeholder:text-[#A69A90] focus:border-[#B77E4D] focus:ring-2 focus:ring-[#B77E4D]/15"
              />

              <p className="mt-2 text-xs text-[#8B7D72]">
                Password must contain at least 6 characters.
              </p>
            </div>

            {/* Success */}
            {message && (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle size={18} />
                <span>{message}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2C1810] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#42251A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Account Role */}
        <div className="mt-4 rounded-xl border border-[#E5D8C9] bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#756A61]">
              Account Type
            </span>

            <span className="rounded-full bg-[#FFF3D6] px-3 py-1 text-xs font-semibold capitalize text-[#8A5A00]">
              {user.role}
            </span>
          </div>
        </div>

      </div>
    </main>
  );
}