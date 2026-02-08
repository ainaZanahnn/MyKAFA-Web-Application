/** @format */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import userService from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  UserX,
  UserCheck2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trophy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import dashboardService, { type DashboardData } from "@/services/dashboardService";

interface User {
  id: number;
  role: "student" | "guardian" | "admin";
  id_pengguna: string;
  full_name: string;
  email: string;
  negeri: string;
  tahun_darjah?: string;
  jenis_sekolah?: string;
  nama_sekolah?: string;
  telefon?: string;
  status?: "active" | "suspended";
  created_at?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isViewPrestasiOpen, setIsViewPrestasiOpen] = useState(false);
  const [selectedUserPrestasi, setSelectedUserPrestasi] = useState<DashboardData | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const itemsPerPage = 3;

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers({
        role:
          userType === "all"
            ? undefined
            : userType === "pelajar"
            ? "student"
            : "guardian",
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
      });
      setUsers(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalUsers(response.pagination?.total || 0);
    } catch (error: unknown) {
      console.error("Error fetching users:", error);
      toast.error("Gagal mendapatkan data pengguna");
    } finally {
      setLoading(false);
    }
  }, [userType, currentPage, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [userType, currentPage, fetchUsers]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      fetchUsers();
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, fetchUsers]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewUserOpen(true);
  };

  const handleViewPrestasi = async (user: User) => {
    try {
      const prestasiData = await dashboardService.getStudentPrestasiById(user.id);
      setSelectedUser(user);
      setSelectedUserPrestasi(prestasiData);
      setIsViewPrestasiOpen(true);
    } catch (error) {
      console.error("Error fetching student prestasi:", error);
      toast.error("Gagal mendapatkan data prestasi pelajar");
    }
  };

  const handleSuspendUser = async (user: User) => {
    try {
      await userService.suspendUser(user.id);
      toast.success("Status pengguna berjaya dikemaskini");
      fetchUsers(); // Refresh data
    } catch (error: unknown) {
      console.error("Error suspending user:", error);
      toast.error("Gagal mengemaskini status pengguna");
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await userService.deleteUser(userToDelete.id);
      toast.success("Pengguna berjaya dipadam");
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
      fetchUsers(); // Refresh data
    } catch (error: unknown) {
      console.error("Error deleting user:", error);
      toast.error("Gagal memadam pengguna");
    }
  };

  if (loading) {
    return <div className="p-6">Memuatkan...</div>;
  }

  return (
    <div className="p-6">
      <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pengurusan Pengguna</h2>
        <div className="flex items-center gap-3">
          <Select value={userType} onValueChange={setUserType}>
            <SelectTrigger className="w-32 bg-primary-foreground/10 text-primary-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Pengguna</SelectItem>
              <SelectItem value="pelajar">Pelajar</SelectItem>
              <SelectItem value="penjaga">Penjaga</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <Plus className="w-4 h-4 mr-1" /> Tambah Pengguna
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baharu</DialogTitle>
                <DialogDescription>
                  Masukkan butiran pengguna baharu untuk menambah ke dalam sistem.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nama Pertama</Label>
                    <Input placeholder="Masukkan nama pertama" />
                  </div>
                  <div>
                    <Label>Nama Akhir</Label>
                    <Input placeholder="Masukkan nama akhir" />
                  </div>
                </div>
                <div>
                  <Label>Emel</Label>
                  <Input type="email" placeholder="Masukkan emel" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddUserOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button>Tambah</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card p-4 border-b">
        <Input
          placeholder="Cari mengikut nama, emel, atau ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-card rounded-b-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4">Gambar</th>
              <th className="text-left p-4">Nama</th>
              <th className="text-left p-4">ID Pengguna</th>
              <th className="text-left p-4">Tarikh Sertai</th>
              <th className="text-left p-4">Peranan</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-muted/30">
                <td className="p-4">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </td>
                <td className="p-4">
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </td>
                <td className="p-4">{user.id_pengguna}</td>
                <td className="p-4">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="p-4">
                  <Badge variant="secondary">
                    {user.role === "student"
                      ? "Pelajar"
                      : user.role === "guardian"
                      ? "Penjaga"
                      : "Admin"}
                  </Badge>
                </td>
                <td className="p-4">
                  <Badge
                    variant={
                      user.status === "active" ? "success" : "destructive"
                    }
                  >
                    {user.status === "active" ? "Aktif" : "Digantung"}
                  </Badge>
                </td>
                <td className="p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewUser(user)}>
                        <Eye className="w-4 h-4 mr-2" /> Lihat
                      </DropdownMenuItem>
                      {user.role === "student" && (
                        <DropdownMenuItem onClick={() => handleViewPrestasi(user)}>
                          <Trophy className="w-4 h-4 mr-2" /> Lihat Prestasi
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleSuspendUser(user)}>
                        {user.status === "active" ? (
                          <>
                            <UserX className="w-4 h-4 mr-2" /> Gantung
                          </>
                        ) : (
                          <>
                            <UserCheck2 className="w-4 h-4 mr-2" /> Aktifkan
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteClick(user)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Padam
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            Menunjukkan {(currentPage - 1) * itemsPerPage + 1} hingga{" "}
            {Math.min(currentPage * itemsPerPage, totalUsers)} daripada {totalUsers}
          </div>
          <div className="flex gap-2">
            <Button
              variant={currentPage === 1 ? "ghost" : "secondary"}
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className={
                currentPage === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-secondary/80"
              }
            >
              <ChevronLeft /> Sebelum
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === currentPage ? "default" : "secondary"}
                size="sm"
                onClick={() => setCurrentPage(p)}
                className={
                  p === currentPage
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-secondary/80"
                }
              >
                {p}
              </Button>
            ))}
            <Button
              variant={currentPage === totalPages ? "ghost" : "secondary"}
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className={
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-secondary/80"
              }
            >
              Seterusnya <ChevronRight />
            </Button>
          </div>
        </div>
      </div>

      {/* View User Dialog */}
      <Dialog open={isViewUserOpen} onOpenChange={setIsViewUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Butiran Pengguna</DialogTitle>
            <DialogDescription>
              Lihat butiran lengkap pengguna yang dipilih.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.id}`}
                className="w-20 h-20 rounded-full mx-auto"
              />
              <h3 className="text-center font-semibold">
                {selectedUser.full_name}
              </h3>
              <p className="text-center text-sm">{selectedUser.email}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>User ID:</strong> {selectedUser.id_pengguna}
                </div>
                <div>
                  <strong>Role:</strong> {selectedUser.role}
                </div>
                <div>
                  <strong>State:</strong> {selectedUser.negeri}
                </div>
                <div>
                  <strong>Status:</strong> {selectedUser.status}
                </div>
                {selectedUser.role === "student" && (
                  <>
                    <div>
                      <strong>Grade:</strong> {selectedUser.tahun_darjah}
                    </div>
                    <div>
                      <strong>School Type:</strong> {selectedUser.jenis_sekolah}
                    </div>
                    <div className="col-span-2">
                      <strong>School Name:</strong> {selectedUser.nama_sekolah}
                    </div>
                  </>
                )}
                {selectedUser.role === "guardian" && (
                  <div>
                    <strong>Phone:</strong> {selectedUser.telefon}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Prestasi Dialog */}
      <Dialog open={isViewPrestasiOpen} onOpenChange={setIsViewPrestasiOpen}>
        <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Prestasi Pelajar - Laporan Terperinci</DialogTitle>
            <DialogDescription className="text-base">
              Analisis komprehensif prestasi pembelajaran pelajar yang dipilih.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && selectedUserPrestasi && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.id}`}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold">{selectedUser.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <p className="text-sm">ID: {selectedUser.id_pengguna}</p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-blue-800">Tahun Semasa</h4>
                  <p className="text-2xl font-bold text-blue-600">{selectedUserPrestasi.currentLevel}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-green-800">Jumlah Mata Kuiz</h4>
                  <p className="text-2xl font-bold text-green-600">{selectedUserPrestasi.quizPoints}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border">
                  <h4 className="font-semibold text-purple-800">Purata Kemahiran</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {(selectedUserPrestasi.currentAbility * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Subject Abilities */}
              {selectedUserPrestasi.subjectYearAbilities.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Penilaian Kemahiran Mengikut Mata Pelajaran</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUserPrestasi.subjectYearAbilities.map((subject, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{subject.subject}</h5>
                          <span className="text-sm text-muted-foreground">Tahun {subject.year}</span>
                        </div>
                        <p className="text-sm">Kemahiran: {(subject.ability * 100).toFixed(1)}%</p>
                        <p className="text-sm">Percubaan: {subject.attempts}</p>
                        <p className="text-sm">Terbaik: {(subject.maxAbility * 100).toFixed(1)}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weak Areas */}
              {selectedUserPrestasi.weakAreas.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Topik Yang Perlu Diperbaiki</h4>
                  <div className="space-y-3">
                    {selectedUserPrestasi.weakAreas.map((area, index) => (
                      <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h5 className="font-medium text-red-800">{area.subject} - {area.topic}</h5>
                        <p className="text-sm text-red-700 mt-1">{area.issue}</p>
                        <p className="text-sm text-red-600 mt-1">{area.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz History */}
              {selectedUserPrestasi.quizHistory && selectedUserPrestasi.quizHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Sejarah Kuiz (20 Terakhir)</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2">Mata Pelajaran</th>
                          <th className="border border-gray-300 p-2">Topik</th>
                          <th className="border border-gray-300 p-2">Tahun</th>
                          <th className="border border-gray-300 p-2">Skor Terakhir</th>
                          <th className="border border-gray-300 p-2">Skor Terbaik</th>
                          <th className="border border-gray-300 p-2">Percubaan</th>
                          <th className="border border-gray-300 p-2">Status</th>
                          <th className="border border-gray-300 p-2">Tarikh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedUserPrestasi.quizHistory.map((quiz, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-2">{quiz.subject}</td>
                            <td className="border border-gray-300 p-2">{quiz.topic}</td>
                            <td className="border border-gray-300 p-2">{quiz.year}</td>
                            <td className="border border-gray-300 p-2">{quiz.lastScore}%</td>
                            <td className="border border-gray-300 p-2">{quiz.bestScore}%</td>
                            <td className="border border-gray-300 p-2">{quiz.totalAttempts}</td>
                            <td className="border border-gray-300 p-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                quiz.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {quiz.passed ? 'Lulus' : 'Gagal'}
                              </span>
                            </td>
                            <td className="border border-gray-300 p-2">
                              {new Date(quiz.lastActivity).toLocaleDateString('ms-MY')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Ability Progression */}
              {selectedUserPrestasi.abilityProgression && selectedUserPrestasi.abilityProgression.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Kemajuan Kemahiran (30 Hari Terakhir)</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      {selectedUserPrestasi.abilityProgression.map((progress, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {new Date(progress.date).toLocaleDateString('ms-MY')}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${Math.min(progress.avgAbility * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {(progress.avgAbility * 100).toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-500">
                              ({progress.attempts} percubaan)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Lesson History */}
              {selectedUserPrestasi.lessonHistory && selectedUserPrestasi.lessonHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Sejarah Pelajaran Selesai (10 Terakhir)</h4>
                  <div className="space-y-2">
                    {selectedUserPrestasi.lessonHistory.map((lesson, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                        <div>
                          <span className="font-medium">{lesson.subject}</span>
                          <span className="text-gray-600 ml-2">- {lesson.topic}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(lesson.completedAt).toLocaleDateString('ms-MY')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Pelajaran Selesai:</strong> {selectedUserPrestasi.lessonsCompleted}
                </div>
                <div>
                  <strong>Kuiz Lulus:</strong> {selectedUserPrestasi.quizzesPassed}
                </div>
                <div>
                  <strong>Jumlah Percubaan:</strong> {selectedUserPrestasi.totalQuizAttempts}
                </div>
                <div>
                  <strong>Kemahiran Tertinggi:</strong> {(selectedUserPrestasi.highestAbility * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sahkan Padam</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak boleh dibuat asal. Sila sahkan untuk meneruskan.
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <p>
              Padam <strong>{userToDelete.full_name}</strong>? Tindakan ini
              tidak boleh dibuat asal.
            </p>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Padam
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
