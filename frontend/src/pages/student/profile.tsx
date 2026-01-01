/** @format */

"use client";
import { useState, useEffect } from "react";
import type React from "react";
import axios from "axios";
import { toast } from "react-toastify";

import { Card, CardContent } from "@/components/ui/card";
import { Camera, Edit2 } from "lucide-react";

export function ProfileStudent() {
  const [userData, setUserData] = useState({
    id: 0,
    fullName: "",
    email: "",
    userId: "",
    state: "",
    grade: "",
    schoolType: "",
    schoolName: "",
    phoneNumber: "",
    password: "************",
    class: "Kelas 1A/2025",
    achievements: 3,
    totalAchievements: 600,
    profilePicture: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(userData);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          "/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const user = response.data.data;
        setUserData({
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          userId: user.id_pengguna,
          state: user.negeri,
          grade: user.tahun_darjah || "",
          schoolType: user.jenis_sekolah || "",
          schoolName: user.nama_sekolah || "",
          phoneNumber: user.telefon || "",
          password: "************",
          class: "Kelas 1A/2025",
          achievements: 3,
          totalAchievements: 600,
          profilePicture: user.profile_picture
            ? `/${user.profile_picture}`
            : "",
        });
      } catch (error: any) {
        console.error("Error fetching user profile:", error);
        toast.error("Gagal mendapatkan data profil");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const malaysianStates = [
    "Johor",
    "Kedah",
    "Kelantan",
    "Melaka",
    "Negeri Sembilan",
    "Pahang",
    "Penang",
    "Perak",
    "Perlis",
    "Sabah",
    "Sarawak",
    "Selangor",
    "Terengganu",
    "Kuala Lumpur",
    "Labuan",
    "Putrajaya",
  ];

  const grades = [
    "Darjah 1",
    "Darjah 2",
    "Darjah 3",
    "Darjah 4",
    "Darjah 5",
    "Darjah 6",
  ];
  const schoolTypes = [
    { value: "kerajaan", label: "Sekolah Kerajaan" },
    { value: "swasta", label: "Sekolah Swasta" },
    { value: "home", label: "Home School" },
  ];

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(userData);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSave = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Kata laluan tidak sama!");
      return;
    }

    try {
      const updates: any = {
        full_name: editedData.fullName,
        email: editedData.email,
        id_pengguna: editedData.userId,
        negeri: editedData.state,
        tahun_darjah: editedData.grade,
        jenis_sekolah: editedData.schoolType,
        nama_sekolah: editedData.schoolName,
        telefon: editedData.phoneNumber,
      };

      // Only include password if it's being changed
      if (newPassword) {
        // Note: Password updates would need a separate endpoint
        // For now, we'll skip password updates in this implementation
      }

      const response = await axios.put(
        "/api/users/profile",
        updates,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedUser = response.data.data;
      setUserData({
        ...userData,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        userId: updatedUser.id_pengguna,
        state: updatedUser.negeri,
        grade: updatedUser.tahun_darjah || "",
        schoolType: updatedUser.jenis_sekolah || "",
        schoolName: updatedUser.nama_sekolah || "",
        phoneNumber: updatedUser.telefon || "",
      });

      toast.success("Profil berjaya dikemaskini!");
      setIsEditing(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Gagal mengemaskini profil");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(userData);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("profilePicture", file);

        const response = await axios.put(
          "/api/users/profile/picture",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const updatedUser = response.data.data;
        const newPictureUrl = updatedUser.profile_picture
          ? `/${updatedUser.profile_picture}`
          : "";

        if (isEditing) {
          setEditedData({ ...editedData, profilePicture: newPictureUrl });
        } else {
          setUserData({ ...userData, profilePicture: newPictureUrl });
        }

        toast.success("Gambar profil berjaya dikemaskini!");
      } catch (error: any) {
        console.error("Error uploading profile picture:", error);
        toast.error("Gagal mengemaskini gambar profil");
      }
    }
  };

  if (loading) {
    return <div className="p-6">Memuatkan...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with Avatar and Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              {(
                isEditing ? editedData.profilePicture : userData.profilePicture
              ) ? (
                <img
                  src={
                    (isEditing
                      ? editedData.profilePicture
                      : userData.profilePicture) || "/placeholder.svg"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-3xl text-white font-bold">😊</span>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <Camera className="h-7 w-7 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureChange}
              />
            </label>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
            <p className="text-sm text-gray-600">{userData.class}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-300 hover:bg-blue-600 text-white rounded-lg font-medium shadow-md transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              Sunting
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-3 justify-end mb-6">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-300 hover:bg-green-700 text-white rounded-lg font-medium shadow-md transition-colors"
          >
            Simpan
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-400 hover:bg-gray-800 text-white rounded-lg font-medium shadow-md transition-colors"
          >
            Batal
          </button>
        </div>
      )}

      {/* Personal Details */}
      <div className="mb-6">
        <Card className="bg-white border-2 border-blue-200 shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Nama Penuh
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.fullName}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-600 py-2">
                    {userData.fullName}
                  </p>
                )}
              </div>

              {/* ID Pengguna */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  ID Pelajar
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.userId}
                    onChange={(e) =>
                      setEditedData({ ...editedData, userId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-600 py-2">
                    {userData.userId}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Alamat Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedData.email}
                    onChange={(e) =>
                      setEditedData({ ...editedData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-600 py-2">{userData.email}</p>
                )}
              </div>

              {/* Negeri */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Negeri
                </label>
                {isEditing ? (
                  <select
                    value={editedData.state}
                    onChange={(e) =>
                      setEditedData({ ...editedData, state: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {malaysianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-600 py-2">{userData.state}</p>
                )}
              </div>

              {/* Tahun/Darjah */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Tahun/Darjah
                </label>
                {isEditing ? (
                  <select
                    value={editedData.grade}
                    onChange={(e) =>
                      setEditedData({ ...editedData, grade: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {grades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-600 py-2">{userData.grade}</p>
                )}
              </div>

              {/* Jenis Sekolah */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Jenis Sekolah
                </label>
                {isEditing ? (
                  <select
                    value={editedData.schoolType}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        schoolType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">-- Pilih Jenis Sekolah --</option>
                    {schoolTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-600 py-2">
                    {schoolTypes.find(
                      (type) => type.value === userData.schoolType
                    )?.label || userData.schoolType}
                  </p>
                )}
              </div>

              {/* Nama Sekolah */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Nama Sekolah
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.schoolName}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        schoolName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-600 py-2">
                    {userData.schoolName}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Nombor Telefon
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedData.phoneNumber}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-600 py-2">
                    {userData.phoneNumber}
                  </p>
                )}
              </div>

              {/* Password - Full width */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">
                  Kata Laluan
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="password"
                      placeholder="Kata laluan baru (kosongkan jika tidak mahu tukar)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Sahkan kata laluan"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 py-2">
                    {userData.password}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fun Message */}
      <div className="text-center mb-6">
        <p className="text-lg font-semibold text-purple-600">
          Teruskan belajar dan dapatkan lebih banyak pencapaian
        </p>
      </div>
    </div>
  );
}

export default ProfileStudent;
