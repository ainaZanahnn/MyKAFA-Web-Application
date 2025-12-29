/** @format */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";

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
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const itemsPerPage = 3;

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/users", {
        params: {
          role:
            userType === "all"
              ? undefined
              : userType === "pelajar"
              ? "student"
              : "guardian",
          page: currentPage,
          limit: itemsPerPage,
          search: searchQuery || undefined,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalUsers(response.data.pagination.total);
    } catch (error: unknown) {
      console.error("Error fetching users:", error);
      toast.error("Gagal mendapatkan data pengguna");
    } finally {
      setLoading(false);
    }
  }, [userType, currentPage, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [userType, currentPage]);

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
  }, [searchQuery]); // Removed fetchUsers from dependencies to prevent infinite loop

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewUserOpen(true);
  };

  const handleSuspendUser = async (user: User) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/users/${user.id}/suspend`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
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
      await axios.delete(`http://localhost:5000/api/users/${userToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
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

      {/* Delete Confirm Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sahkan Padam</DialogTitle>
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
