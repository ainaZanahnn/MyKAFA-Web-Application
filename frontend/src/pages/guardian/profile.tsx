/** @format */

"use client";
import { useState, useEffect } from "react";
import type React from "react";
import axios from "@/lib/axios";
import { toast } from "react-toastify";

import { Card, CardContent } from "@/components/ui/card";
import { Edit2 } from "lucide-react";

export function ProfileAccount() {
  const [userData, setUserData] = useState({
    id: 0,
    fullName: "",
    email: "",
    userId: "",
    state: "",
    phoneNumber: "",
    password: "************",
    relationshipType: "Ibu Bapa",
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

        const user = response.data?.data;
        if (user) {
          setUserData({
            id: user.id || 0,
            fullName: user.full_name || "",
            email: user.email || "",
            userId: user.id_pengguna || "",
            state: user.negeri || "",
            phoneNumber: user.telefon || "",
            password: "************",
            relationshipType: "Ibu Bapa", // Default value, could be stored in DB if needed
            profilePicture: "",
          });
        }
      } catch (error: unknown) {
        console.error("Error fetching user profile:", error);
        toast.error("Gagal mendapatkan data profil");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const relationshipTypes = ["Ibu Bapa", "Cikgu", "Datuk", "Adik Beradik"];
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(userData);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSave = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Kata laluan tidak sepadan!");
      return;
    }

    try {
      const updates: Record<string, string> = {
        full_name: editedData.fullName,
        email: editedData.email,
        id_pengguna: editedData.userId,
        negeri: editedData.state,
        telefon: editedData.phoneNumber,
      };

      // Only include password if it's being changed
      if (newPassword) {
        // Note: Password updates would need a separate endpoint
        // For now, we'll skip password updates in this implementation
      }

      const response = await axios.put(
        "users/profile",
        updates,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedUser = response.data?.data;
      if (updatedUser) {
        setUserData({
          ...userData,
          fullName: updatedUser.full_name || "",
          email: updatedUser.email || "",
          userId: updatedUser.id_pengguna || "",
          state: updatedUser.negeri || "",
          phoneNumber: updatedUser.telefon || "",
        });
      }

      toast.success("Profil berjaya dikemaskini!");
      setIsEditing(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
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



  if (loading) {
    return <div className="max-w-5xl mx-auto p-6">Memuatkan...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with Avatar and Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`}
                alt="Profile Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Akaun Saya</h1>
            <p className="text-sm text-gray-600">{userData.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-300 hover:bg-blue-600 text-white rounded-lg font-medium shadow-md transition-colors"
            >
              <Edit2 className="h-2 w-2" /> Sunting
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-3 justify-end mb-6">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-300 hover:bg-green-600 text-white rounded-lg font-medium shadow-md transition-colors"
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
        <Card className="bg-white border-2 border-gray-200 shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Jenis Penjaga */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Jenis Penjaga
                </label>
                {isEditing ? (
                  <select
                    value={editedData.relationshipType}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        relationshipType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {relationshipTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-600 py-2">
                    {userData.relationshipType}
                  </p>
                )}
              </div>

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  ID Pengguna
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.userId}
                    onChange={(e) =>
                      setEditedData({ ...editedData, userId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="password"
                      placeholder="Sahkan kata laluan"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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



      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <button className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-md transition-colors">
          Delete account
        </button>
      </div>
    </div>
  );
}

export default ProfileAccount;
