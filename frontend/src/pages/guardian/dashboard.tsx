/** @format */

"use client";

import { useState, useEffect} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/auth/useAuth";
import { MessageSquare, Send, Plus } from "lucide-react";
import announcementService from "@/services/announcementService";
import type { Announcement } from "@/services/announcementService";
import type { FormEvent } from "react";

type Feedback = Announcement;

const GuardianDashboard = () => {
  const { user } = useAuth();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const { data } = await announcementService.getAnnouncements();
        // Filter feedbacks by current guardian and sort by date descending
        console.log("Fetched feedbacks:", data); // Debug log
        const guardianFeedbacks: Feedback[] = data
          .filter(
            (item): item is Feedback =>
              item.type === "feedback" && item.author_id === user?.id
          )
          .sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 2);

        setFeedbacks(guardianFeedbacks);

      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    if (user?.id) {
      fetchFeedbacks();
    }
  }, [user?.id]);

  const handleCreateFeedback = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!feedbackForm.title.trim() || !feedbackForm.content.trim()) {
      alert("Sila isi semua maklumat wajib.");
      return;
    }

    setLoading(true);
    try {
      const { success, message } = await announcementService.createAnnouncement({
        title: feedbackForm.title,
        content: feedbackForm.content,
        date: feedbackForm.date,
        type: "feedback",
        author_id: user?.id,
        target: "semua", // Default target for feedback
      });

      if (success) {
        alert("Maklum balas berjaya dihantar!");
        setFeedbackForm({
          title: "",
          content: "",
          date: new Date().toISOString().split("T")[0],
        });
        setShowFeedbackForm(false);
      } else {
        throw new Error(message || "Failed to create feedback");
      }
    } catch (error: unknown) {
      console.error("Error creating feedback:", error);
      alert("Ralat semasa menghantar maklum balas: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">
          Dashboard Penjaga
        </h1>
        <p className="text-muted-foreground mt-2">
          Selamat datang, {user?.username || "Penjaga"}!
        </p>
      </div>

      {/* Feedback Creation Form */}
      {showFeedbackForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Hantar Maklum Balas Baharu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateFeedback} className="space-y-4">
              <div>
                <Label htmlFor="title">Tajuk Maklum Balas</Label>
                <Input
                  id="title"
                  value={feedbackForm.title}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Masukkan tajuk maklum balas"
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Kandungan Maklum Balas</Label>
                <Textarea
                  id="content"
                  value={feedbackForm.content}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      content: e.target.value,
                    })
                  }
                  placeholder="Masukkan kandungan maklum balas"
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Tarikh</Label>
                <Input
                  id="date"
                  type="date"
                  value={feedbackForm.date}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      date: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    "Menghantar..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Hantar Maklum Balas
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFeedbackForm(false)}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Create Feedback Button */}
      {!showFeedbackForm && (
        <div className="text-center">
          <Button
            onClick={() => setShowFeedbackForm(true)}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Hantar Maklum Balas Baharu
          </Button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold">Pelajar Di Bawah Jagaan</h3>
            <p className="text-3xl font-bold text-primary mt-2">2</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold">Maklum Balas Dihantar</h3>
            <p className="text-3xl font-bold text-primary mt-2">5</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold">Aktiviti Bulan Ini</h3>
            <p className="text-3xl font-bold text-primary mt-2">12</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktiviti Terkini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedbacks.slice(0, 2).map((feedback, index) => (
              <div
                key={feedback.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div
                  className={`w-10 h-10 ${
                    index === 0 ? "bg-blue-100" : "bg-green-100"
                  } rounded-full flex items-center justify-center`}
                >
                  <MessageSquare
                    className={`w-5 h-5 ${
                      index === 0 ? "text-blue-600" : "text-green-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{feedback.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(feedback.date).toLocaleDateString("ms-MY")}
                  </p>
                </div>
              </div>
            ))}
            {feedbacks.length === 0 && (
              <div className="p-4 text-muted-foreground text-sm">
                Tiada aktiviti terkini.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuardianDashboard;
