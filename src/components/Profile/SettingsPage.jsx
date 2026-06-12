import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  User, KeyRound, Save, RefreshCw, Eye, EyeOff, Check, X,
  MapPin, Phone, Mail, ShieldAlert, BadgeInfo, FileCheck, Info,
  AlertTriangle, Trash2, Database, Upload, Camera, Palette, Sparkles
} from 'lucide-react';
import { getProfile, updateProfile, changePassword } from '../../Services/profile';
import { wipeTimetable, wipeAttendance, wipeAlerts, wipeDirectory } from '../../Services/admin';

const AESTHETIC_PRESETS = [
  {
    id: 'slate',
    name: 'Default Slate',
    description: 'Clean, professional slate theme.',
    style: {
      card: 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 shadow-sm relative overflow-hidden',
      avatarBorder: 'border-slate-200 dark:border-zinc-700',
      avatarGlow: '',
      badge: 'bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-zinc-600',
      vibeText: 'Standard mode',
      vibeIcon: '💼',
      cardBackgroundEffects: ''
    }
  }
];

const themeConfigs = {
  student: {
    bg: "bg-slate-50 dark:bg-zinc-900",
    card: "bg-white dark:bg-zinc-800",
    textPrimary: "text-slate-900 dark:text-white",
    textSecondary: "text-slate-500 dark:text-slate-400",
    accentText: "text-indigo-600 dark:text-indigo-400",
    accentBg: "bg-indigo-600 hover:bg-indigo-700 text-white",
    accentLight: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400",
    border: "border-slate-100 dark:border-zinc-700",
    inputBg: "bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-700",
    ring: "focus:border-indigo-500 focus:ring-indigo-500"
  },
  faculty: {
    bg: "bg-[#F9FBFC] dark:bg-[#0D1512]",
    card: "bg-white dark:bg-[#14221C]",
    textPrimary: "text-slate-800 dark:text-slate-100",
    textSecondary: "text-slate-500 dark:text-slate-400",
    accentText: "text-emerald-600 dark:text-emerald-400",
    accentBg: "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white",
    accentLight: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200/40 dark:border-emerald-950/60",
    inputBg: "bg-slate-50 dark:bg-[#0D1512]/40 border-slate-202 dark:border-emerald-950/60",
    ring: "focus:border-emerald-500 focus:ring-emerald-500"
  },
  admin: {
    bg: "bg-[#F8F9FA] dark:bg-[#0B0F19]",
    card: "bg-white dark:bg-[#161B26]",
    textPrimary: "text-slate-900 dark:text-white",
    textSecondary: "text-slate-500 dark:text-slate-400",
    accentText: "text-indigo-600 dark:text-[#6366F1]",
    accentBg: "bg-indigo-600 hover:bg-indigo-700 dark:bg-[#6366F1] dark:hover:bg-indigo-600 text-white",
    accentLight: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-[#6366F1]",
    border: "border-slate-100 dark:border-slate-800/60",
    inputBg: "bg-slate-50 dark:bg-[#0B0F19]/40 border-slate-202 dark:border-slate-800/60",
    ring: "focus:border-indigo-500 focus:ring-indigo-500"
  }
};

export default function SettingsPage({ userRole = 'student' }) {
  const role = (userRole || 'student').toLowerCase();
  const theme = themeConfigs[role] || themeConfigs.student;

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable Profile fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileTheme, setProfileTheme] = useState(localStorage.getItem('ucmp-profile-theme') || 'slate');
  const selectedThemePreset = AESTHETIC_PRESETS.find(p => p.id === profileTheme) || AESTHETIC_PRESETS[0];

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Maintenance wipe states
  const [confirmInputs, setConfirmInputs] = useState({
    timetable: '',
    attendance: '',
    alerts: '',
    directory: ''
  });
  const [wipingState, setWipingState] = useState({
    timetable: false,
    attendance: false,
    alerts: false,
    directory: false
  });
  const [showConfirmField, setShowConfirmField] = useState({
    timetable: false,
    attendance: false,
    alerts: false,
    directory: false
  });

  const isSuperAdmin = role === 'admin' ||
    profile?.roles?.includes('ADMIN') ||
    profile?.roles?.includes('admin');

  console.log("SettingsPage Render Details:", {
    role,
    userRole,
    profileDepartment: profile?.department,
    profileCollegeId: profile?.collegeId,
    isSuperAdmin,
    activeTab
  });

  const handleWipeAction = async (actionType, apiCall, label) => {
    if (confirmInputs[actionType] !== 'WIPE') {
      toast.error(`Please type "WIPE" to confirm deleting ${label}.`);
      return;
    }

    setWipingState(prev => ({ ...prev, [actionType]: true }));
    try {
      const res = await apiCall();
      toast.success(res?.data || `${label} wiped successfully.`);
      setConfirmInputs(prev => ({ ...prev, [actionType]: '' }));
      setShowConfirmField(prev => ({ ...prev, [actionType]: false }));
    } catch (err) {
      console.error(`Failed to wipe ${actionType}:`, err);
      toast.error(err.response?.data?.message || err.message || `Failed to wipe ${label}.`);
    } finally {
      setWipingState(prev => ({ ...prev, [actionType]: false }));
    }
  };

  // Load user profile
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const collegeId = localStorage.getItem('collegeId');
        if (!collegeId) throw new Error("No College ID found in storage");
        const res = await getProfile(collegeId);
        if (res && res.data) {
          setProfile(res.data);
          setPhone(res.data.phoneNumber || '');
          setAddress(res.data.address || '');
          setAvatarUrl(res.data.profilePictureUrl || '');
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        toast.error("Failed to load settings data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  // Password Validation Checks
  const passChecks = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    digit: /[0-9]/.test(newPassword),
    special: /[@#$%^&+=!]/.test(newPassword)
  };

  const isPasswordValid = Object.values(passChecks).every(Boolean);
  const isPasswordMatch = newPassword === confirmPassword;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize using a canvas to keep base64 string small (~10-15KB max)
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to compressed JPEG base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setAvatarUrl(compressedBase64);
        toast.success("Image uploaded and optimized successfully!");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handlers
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({
        profilePictureUrl: avatarUrl.trim(),
        phoneNumber: phone.trim(),
        address: address.trim()
      });
      toast.success("Profile updated successfully!");
      if (res && res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error(err.response?.data?.message || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error("Password does not meet all requirements.");
      return;
    }
    if (!isPasswordMatch) {
      toast.error("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await changePassword(oldPassword, newPassword);
      toast.success("Password changed successfully! Keep it secure.");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error("Password change failed:", err);
      toast.error(err.response?.data?.message || "Failed to change password. Please check your current password.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center py-24 min-h-[calc(100vh-64px)] ${theme.bg}`}>
        <RefreshCw className={`w-10 h-10 ${theme.accentText} animate-spin mb-4`} />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-left">

      {/* Header Area */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-800/10 border ${theme.border} p-6 rounded-3xl shadow-sm ${theme.card}`}>
        <div>
          <span className={`text-xs font-semibold tracking-wider uppercase ${theme.accentText}`}>
            User Configuration Control
          </span>
          <h1 className="text-4xl font-light tracking-tight mt-1 text-slate-900 dark:text-white capitalize">
            {role} Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Update personal contact information, modify configuration, and manage security settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* Left Column: Profile Card + Navigation Tabs */}
        <div className="lg:col-span-1 space-y-6">

          {/* Profile Overview Card */}
          <div className={`border rounded-3xl p-6 text-center space-y-4 shadow-sm transition-all duration-300 relative overflow-hidden ${selectedThemePreset.style.card}`}>

            {/* Role Badge */}
            <div className="relative z-10 flex justify-center">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-zinc-600">
                <span>{role === 'student' ? '🎓' : (role === 'faculty' ? '📚' : '🛡️')}</span>
                <span>{role.toUpperCase()}</span>
              </span>
            </div>

            <div className="relative mx-auto w-24 h-24 z-10 group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profile?.name || 'User'}
                  className={`w-24 h-24 rounded-full object-cover border-2 shadow-inner transition-all duration-300 ${selectedThemePreset.style.avatarBorder}`}
                />
              ) : (
                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-slate-100 dark:bg-zinc-800 ${selectedThemePreset.style.avatarBorder}`}>
                  <User className="w-12 h-12 text-slate-400" />
                </div>
              )}

              {/* Floating Camera Button */}
              <label htmlFor="avatar-file-upload" className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:scale-110 text-white rounded-full cursor-pointer shadow-md transition-all">
                <Camera className="w-3.5 h-3.5" />
                <input
                  id="avatar-file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white leading-tight">
                {profile?.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                {profile?.collegeId}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                {profile?.roles?.map((r) => (
                  <span key={r} className={`px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary uppercase tracking-wider`}>
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className={`pt-4 border-t ${theme.border} text-left space-y-2 text-xs text-slate-500 dark:text-slate-400`}>
              {profile?.email && (
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile?.department && (
                <div className="flex items-center gap-2">
                  <BadgeInfo className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{profile.department}</span>
                </div>
              )}
              {profile?.student?.rollNumber && (
                <div className="flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Roll: {profile.student.rollNumber} • Yr {profile.student.year}</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className={`border ${theme.border} rounded-3xl p-2.5 space-y-1 shadow-sm ${theme.card}`}>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${activeTab === 'profile'
                ? theme.accentBg + ' shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-zinc-800/40'
                }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Details</span>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${activeTab === 'password'
                ? theme.accentBg + ' shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-zinc-800/40'
                }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Change Password</span>
            </button>
            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${activeTab === 'maintenance'
                  ? theme.accentBg + ' shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-zinc-800/40'
                  }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>System Maintenance</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Tab View Content */}
        <div className="lg:col-span-3">

          {/* TAB 1: Profile Info Form */}
          {activeTab === 'profile' && (
            <div className={`border ${theme.border} rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm ${theme.card}`}>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Personal Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manage your personal details. Core academic and organizational data are restricted to read-only for security reasons.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* Name field (READ-ONLY) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Full Name (Read-Only)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profile?.name || ''}
                      className="px-3.5 py-2.5 text-xs rounded-xl border bg-slate-100 dark:bg-zinc-800 cursor-not-allowed border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-slate-400"
                    />
                  </div>

                  {/* College ID field (READ-ONLY) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      College ID / Code
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profile?.collegeId || ''}
                      className="px-3.5 py-2.5 text-xs rounded-xl border bg-slate-100 dark:bg-zinc-800 cursor-not-allowed border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-slate-400 font-mono"
                    />
                  </div>

                  {/* Email field (READ-ONLY) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ''}
                      className="px-3.5 py-2.5 text-xs rounded-xl border bg-slate-100 dark:bg-zinc-800 cursor-not-allowed border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-slate-400"
                    />
                  </div>

                  {/* Phone Number (EDITABLE) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border ${theme.inputBg} focus:outline-none focus:ring-1 ${theme.ring} text-slate-800 dark:text-slate-100 transition-all`}
                      />
                    </div>
                  </div>



                  {/* Address (EDITABLE) */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Residential Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <textarea
                        rows={2}
                        placeholder="Enter your current address details..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border ${theme.inputBg} focus:outline-none focus:ring-1 ${theme.ring} text-slate-800 dark:text-slate-100 transition-all resize-none`}
                      />
                    </div>
                  </div>

                </div>

                {/* Role Specific Meta Card (READ-ONLY info) */}
                <div className={`p-4 rounded-2xl border text-xs text-slate-500 dark:text-slate-400 space-y-3 bg-slate-50/50 dark:bg-zinc-950/20 border-slate-200 dark:border-zinc-800/40`}>
                  <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider text-slate-400">
                    <Info className="w-3.5 h-3.5" />
                    <span>Academic Scope Details</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                    {role === 'student' && (
                      <>
                        <div>
                          <span className="font-semibold text-slate-400">Branch Name:</span>{' '}
                          <span className="font-medium text-slate-800 dark:text-white">{profile?.student?.batchName || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">Current Year:</span>{' '}
                          <span className="font-medium text-slate-800 dark:text-white">Year {profile?.student?.year || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">Assigned Section:</span>{' '}
                          <span className="font-medium text-slate-800 dark:text-white">{profile?.student?.sectionName || 'N/A'}</span>
                        </div>
                      </>
                    )}
                    {role === 'faculty' && (
                      <>
                        <div>
                          <span className="font-semibold text-slate-400">Department:</span>{' '}
                          <span className="font-medium text-slate-800 dark:text-white">{profile?.faculty?.department || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">Designation:</span>{' '}
                          <span className="font-medium text-slate-800 dark:text-white">{profile?.faculty?.designation || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">Office Location:</span>{' '}
                          <span className="font-medium text-slate-800 dark:text-white">{profile?.faculty?.officeLocation || 'N/A'}</span>
                        </div>
                      </>
                    )}
                    {role === 'admin' && (
                      <>
                        <div>
                          <span className="font-semibold text-slate-400">Scoped Department:</span>{' '}
                          <span className="font-medium text-slate-800 dark:text-white">{profile?.department || 'Global (All)'}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">Year Scope:</span>{' '}
                          <span className="font-medium text-slate-800 dark:text-white">{profile?.yearScope ? `Year ${profile.yearScope}` : 'Global (All)'}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">Access Tier:</span>{' '}
                          <span className="font-medium text-slate-800 dark:text-white">
                            {(!profile?.department || profile.department.toLowerCase() === 'administration') ? 'Super Admin' : 'Department Admin'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all ${theme.accentBg} disabled:opacity-50`}
                  >
                    {saving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{saving ? 'Saving changes...' : 'Save Profile Details'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Change Password Form */}
          {activeTab === 'password' && (
            <div className={`border ${theme.border} rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm ${theme.card}`}>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Security Configuration
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Change your system password. A strong password helps block unauthorized entries to your dashboard.
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">

                <div className="space-y-4 max-w-xl">

                  {/* Old Password */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPass ? 'text' : 'password'}
                        placeholder="Enter your current password..."
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border ${theme.inputBg} focus:outline-none focus:ring-1 ${theme.ring} text-slate-800 dark:text-slate-100 transition-all font-mono`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      New Strong Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        placeholder="Choose a strong password..."
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border ${theme.inputBg} focus:outline-none focus:ring-1 ${theme.ring} text-slate-800 dark:text-slate-100 transition-all font-mono`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        placeholder="Re-type your new password..."
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border ${theme.inputBg} focus:outline-none focus:ring-1 ${theme.ring} text-slate-800 dark:text-slate-100 transition-all font-mono`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Password Checklist & Match Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">

                  {/* Checklist */}
                  <div className={`p-4 rounded-2xl border text-xs space-y-2 bg-slate-50/50 dark:bg-zinc-950/20 border-slate-200 dark:border-zinc-800/40 text-slate-500 dark:text-slate-400`}>
                    <div className="font-bold text-[9px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Security Strength Checklist</span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center gap-2">
                        {passChecks.length ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span className={passChecks.length ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>At least 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passChecks.upper ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span className={passChecks.upper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>One uppercase letter (A-Z)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passChecks.lower ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span className={passChecks.lower ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>One lowercase letter (a-z)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passChecks.digit ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span className={passChecks.digit ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>One numeric digit (0-9)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passChecks.special ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span className={passChecks.special ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>One special character (@#$%^&+=!)</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Indicator card */}
                  <div className={`p-4 rounded-2xl border text-xs flex flex-col justify-center gap-3 bg-slate-50/50 dark:bg-zinc-950/20 border-slate-200 dark:border-zinc-800/40 text-slate-500`}>
                    <div className="font-bold text-[9px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Password Match Status</span>
                    </div>

                    {newPassword && confirmPassword ? (
                      isPasswordMatch ? (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-2 text-xs font-semibold">
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Passwords Match! Ready.</span>
                        </div>
                      ) : (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-2 text-xs font-semibold">
                          <X className="w-4 h-4 stroke-[3]" />
                          <span>Passwords do not match yet.</span>
                        </div>
                      )
                    ) : (
                      <div className="p-3 bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-slate-500 rounded-xl flex items-center gap-2 text-xs">
                        <Info className="w-4 h-4" />
                        <span>Awaiting input...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-3 max-w-xl">
                  <button
                    type="submit"
                    disabled={saving || !isPasswordValid || !isPasswordMatch || !oldPassword}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all ${theme.accentBg} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {saving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <KeyRound className="w-3.5 h-3.5" />
                    )}
                    <span>{saving ? 'Encrypting...' : 'Change Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: System Maintenance */}
          {activeTab === 'maintenance' && isSuperAdmin && (
            <div className={`border ${theme.border} rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm ${theme.card}`}>
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-rose-500" />
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    System Developer Maintenance
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Perform high-impact administrative cleanups and reset options. These operations execute direct database mutations and are strictly meant for testing environments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Wipe Timetable */}
                <div className="border border-red-200/40 dark:border-red-950/40 rounded-2xl p-5 space-y-4 bg-red-50/5 dark:bg-red-950/5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-500">
                      <Database className="w-4 h-4" />
                      <span className="font-bold text-xs uppercase tracking-wider">Wipe Timetable Data</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Deletes all scheduled timetable entries, extra class overrides, cancellations, and class subject assignments.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {showConfirmField.timetable ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">
                          Type "WIPE" to confirm:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type WIPE"
                            value={confirmInputs.timetable}
                            onChange={(e) => setConfirmInputs(prev => ({ ...prev, timetable: e.target.value }))}
                            className={`flex-1 px-3 py-1.5 text-xs rounded-xl border bg-slate-50 dark:bg-zinc-900 border-red-200 dark:border-red-950 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500`}
                          />
                          <button
                            onClick={() => handleWipeAction('timetable', wipeTimetable, 'Timetable data')}
                            disabled={confirmInputs.timetable !== 'WIPE' || wipingState.timetable}
                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                          >
                            {wipingState.timetable ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            Wipe
                          </button>
                          <button
                            onClick={() => setShowConfirmField(prev => ({ ...prev, timetable: false }))}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowConfirmField(prev => ({ ...prev, timetable: true }))}
                        className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Wipe Timetable Data</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Wipe Attendance */}
                <div className="border border-red-200/40 dark:border-red-950/40 rounded-2xl p-5 space-y-4 bg-red-50/5 dark:bg-red-950/5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-500">
                      <Database className="w-4 h-4" />
                      <span className="font-bold text-xs uppercase tracking-wider">Wipe Attendance Data</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Deletes all student attendance record history, session logs, and class segment records.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {showConfirmField.attendance ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">
                          Type "WIPE" to confirm:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type WIPE"
                            value={confirmInputs.attendance}
                            onChange={(e) => setConfirmInputs(prev => ({ ...prev, attendance: e.target.value }))}
                            className={`flex-1 px-3 py-1.5 text-xs rounded-xl border bg-slate-50 dark:bg-zinc-900 border-red-200 dark:border-red-950 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500`}
                          />
                          <button
                            onClick={() => handleWipeAction('attendance', wipeAttendance, 'Attendance data')}
                            disabled={confirmInputs.attendance !== 'WIPE' || wipingState.attendance}
                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                          >
                            {wipingState.attendance ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            Wipe
                          </button>
                          <button
                            onClick={() => setShowConfirmField(prev => ({ ...prev, attendance: false }))}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowConfirmField(prev => ({ ...prev, attendance: true }))}
                        className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Wipe Attendance Data</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Wipe Alerts */}
                <div className="border border-red-200/40 dark:border-red-950/40 rounded-2xl p-5 space-y-4 bg-red-50/5 dark:bg-red-950/5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-500">
                      <Database className="w-4 h-4" />
                      <span className="font-bold text-xs uppercase tracking-wider">Wipe Communications & Alerts</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Deletes all global, batch, and section-specific announcements, updates, and notice board logs.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {showConfirmField.alerts ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">
                          Type "WIPE" to confirm:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type WIPE"
                            value={confirmInputs.alerts}
                            onChange={(e) => setConfirmInputs(prev => ({ ...prev, alerts: e.target.value }))}
                            className={`flex-1 px-3 py-1.5 text-xs rounded-xl border bg-slate-50 dark:bg-zinc-900 border-red-200 dark:border-red-950 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500`}
                          />
                          <button
                            onClick={() => handleWipeAction('alerts', wipeAlerts, 'Announcements and alerts')}
                            disabled={confirmInputs.alerts !== 'WIPE' || wipingState.alerts}
                            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                          >
                            {wipingState.alerts ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            Wipe
                          </button>
                          <button
                            onClick={() => setShowConfirmField(prev => ({ ...prev, alerts: false }))}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowConfirmField(prev => ({ ...prev, alerts: true }))}
                        className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Wipe Alerts & Notices</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. Reset User Directory */}
                <div className="border border-red-200 dark:border-red-900/60 rounded-2xl p-5 space-y-4 bg-red-50/10 dark:bg-red-950/10 flex flex-col justify-between md:col-span-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-500">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="font-bold text-xs uppercase tracking-wider">Reset User Directory (Nuclear Option)</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Deletes all student registry files, faculty assignments, personal profiles, and login user credentials from the database.
                      <strong className="text-red-600 dark:text-red-400 ml-1">Warning:</strong> To protect admin access, this deletes all user classes EXCEPT accounts assigned with the ADMIN role.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {showConfirmField.directory ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                          Type "WIPE" to confirm this full system reset:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type WIPE"
                            value={confirmInputs.directory}
                            onChange={(e) => setConfirmInputs(prev => ({ ...prev, directory: e.target.value }))}
                            className={`flex-1 px-3 py-1.5 text-xs rounded-xl border bg-slate-50 dark:bg-zinc-900 border-red-300 dark:border-red-900 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-600`}
                          />
                          <button
                            onClick={() => handleWipeAction('directory', wipeDirectory, 'User Directory')}
                            disabled={confirmInputs.directory !== 'WIPE' || wipingState.directory}
                            className="px-5 py-1.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-40 disabled:hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                          >
                            {wipingState.directory ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            Full Wipe
                          </button>
                          <button
                            onClick={() => setShowConfirmField(prev => ({ ...prev, directory: false }))}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowConfirmField(prev => ({ ...prev, directory: true }))}
                        className="w-full py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-700 dark:text-red-400 border border-red-600/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Reset User Directory (Wipe Students, Faculty & Logins)</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
