"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import NotificationDropdown from "@/components/NotificationDropdown";

const starDescriptions = [
  "",
  "★ ควรปรับปรุงเร่งด่วน (1 ดาว)",
  "★★ พอใช้ แต่ยังมีข้อบกพร่อง (2 ดาว)",
  "★★★ ปานกลาง เป็นไปตามมาตรฐาน (3 ดาว)",
  "★★★★ ดีมาก แก้ปัญหาได้เรียบร้อย (4 ดาว)",
  "★★★★★ ยอดเยี่ยม ประทับใจมาก (5 ดาว)",
];

const criteriaList = [
  { id: 1, text: "1. ความรวดเร็วในการเข้าตรวจสอบและระงับเหตุ" },
  { id: 2, text: "2. การแก้ไขปัญหาเสร็จสิ้นได้ทันเวลาที่นัดหมาย" },
  { id: 3, text: "3. ความสุภาพและการพูดจาประสานงานของเจ้าหน้าที่" },
  { id: 4, text: "4. ความเป็นมืออาชีพและความพร้อมของอุปกรณ์ในการแก้ปัญหา" },
  { id: 5, text: "5. การอัปเดตสถานะและขั้นตอนการทำงานอย่างต่อเนื่อง" },
  { id: 6, text: "6. คำชี้แจงและบันทึกผลการปฏิบัติงานมีความชัดเจน" },
  { id: 7, text: "7. การรักษาความสะอาดและความเรียบร้อยหลังทำงานเสร็จ" },
  { id: 8, text: "8. ปัญหาสิ่งแวดล้อม/เสียงรบกวนได้รับการแก้ไขอย่างตรงจุด" },
  { id: 9, text: "9. ความมั่นใจในมาตรการป้องกันไม่ให้เกิดปัญหาซ้ำ" },
  { id: 10, text: "10. ความสะดวกและความพึงพอใจต่อระบบแจ้งเหตุ UniCare" },
];

export default function FeedbackUserPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("กิตติภูมิ ปราชญนคร");
  const [overallRating, setOverallRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const [criteriaScores, setCriteriaScores] = useState<Record<number, number>>({
    1: 5,
    2: 5,
    3: 5,
    4: 5,
    5: 5,
    6: 5,
    7: 5,
    8: 5,
    9: 5,
    10: 5,
  });

  const [isSolved, setIsSolved] = useState<"yes" | "no">("yes");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    async function loadUserData() {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.user_metadata?.full_name) {
        setUserName(authData.user.user_metadata.full_name);
      }
    }
    loadUserData();
  }, []);

  const hasConflict = useMemo(() => {
    if (overallRating !== 5) return false;
    const hasLowScore = Object.values(criteriaScores).some(
      (score) => score <= 2,
    );
    return hasLowScore || isSolved === "no";
  }, [overallRating, criteriaScores, isSolved]);

  const handleCriteriaChange = (questionId: number, score: number) => {
    setCriteriaScores((prev) => ({
      ...prev,
      [questionId]: score,
    }));
  };

  const handleLogout = async () => {
    if (confirm("คุณต้องการออกจากระบบหรือไม่?")) {
      await supabase.auth.signOut();
      router.push("/");
    }
  };

  const handleEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (overallRating === 0) {
      alert("กรุณาคลิกเลือกดาวเพื่อประเมินระดับความพึงพอใจในภาพรวมก่อนส่งครับ");
      return;
    }

    if (hasConflict && feedbackText.trim() === "") {
      alert(
        "คุณประเมิน 5 ดาวแต่ระบุว่ามีข้อบกพร่องที่ควรปรับปรุง โปรดพิมพ์ข้อเสนอแนะเพื่อให้ทีมงานนำไปแก้ไขได้ตรงจุดครับ",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        router.push("/my-reports");
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f4f7f5] text-slate-800 antialiased min-h-screen flex font-['Prompt',sans-serif]">
      {/* แถบเมนูด้านซ้าย (Sidebar) */}
      <aside
        className="w-64 text-white flex-shrink-0 sticky top-0 h-screen overflow-y-auto p-5 hidden md:flex flex-col justify-between border-r border-[#103e31]"
        style={{
          background:
            "linear-gradient(180deg, #2b8273 0%, #1c5e52 40%, #15453b 70%, #0f3028 100%)",
        }}
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-white/15">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-bold border border-white/30 shadow-xs">
              🌱
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-wider uppercase leading-none text-white drop-shadow-xs">
                UniCare
              </h1>
            </div>
          </div>

          <nav className="space-y-1.5 text-xs font-medium">
            <Link
              href="/user/dashboard"
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-emerald-100/80 hover:bg-white/10 hover:text-white transition"
            >
              <span className="text-base">🏠</span>
              <span>หน้าหลัก</span>
            </Link>
            <Link
              href="/report"
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-emerald-100/80 hover:bg-white/10 hover:text-white transition"
            >
              <span className="text-base">📢</span>
              <span>แจ้งปัญหา</span>
            </Link>
            <Link
              href="/my-reports"
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl bg-[#c5e8d5] text-[#0d3b2e] font-bold shadow-xs transition"
            >
              <span className="text-base">📋</span>
              <span>รายการของฉัน</span>
            </Link>
            <Link
              href="/news"
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-emerald-100/80 hover:bg-white/10 hover:text-white transition"
            >
              <span className="text-base">📰</span>
              <span>ข่าวสาร / ประกาศ</span>
            </Link>
            <Link
              href="/user/faq"
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-emerald-100/80 hover:bg-white/10 hover:text-white transition"
            >
              <span className="text-base">❓</span>
              <span>คำถามที่พบบ่อย</span>
            </Link>
            <Link
              href="/user/contact"
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-emerald-100/80 hover:bg-white/10 hover:text-white transition"
            >
              <span className="text-base">💬</span>
              <span>ติดต่อเรา</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-rose-200 hover:text-white border border-white/15 text-xs font-semibold transition mt-4 shadow-xs text-left cursor-pointer"
            >
              <span className="text-base">🚪</span>
              <span>ออกจากระบบ</span>
            </button>
          </nav>
        </div>

        <div className="bg-black/15 p-3.5 rounded-2xl border border-white/10 text-center mt-6">
          <p className="text-xs text-emerald-100/90 font-medium leading-relaxed">
            ร่วมสร้างมหาวิทยาลัยน่าอยู่ไปด้วยกัน 🌱
          </p>
        </div>
      </aside>

      {/* ส่วนเนื้อหาหลัก (Main Content) */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200/80 px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">
              ระบบประเมินผลการแก้ไขปัญหา (Feedback & Rating)
            </h1>
            <p className="text-xs text-slate-400">
              UniCare • ยกระดับคุณภาพการจัดการสิ่งแวดล้อมภายในมหาวิทยาลัย
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationDropdown />

            <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full text-xs shadow-xs">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[12px]">
                👤
              </div>
              <span className="font-medium text-slate-800">{userName}</span>
              <span className="bg-[#1b5e4a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                User
              </span>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8 space-y-6 overflow-y-auto max-w-4xl w-full mx-auto">
          {/* Banner */}
          <section className="rounded-2xl bg-gradient-to-r from-[#0e4435] via-[#145946] to-[#1b6852] text-white p-6 sm:p-7 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="bg-emerald-400/20 text-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                เคสเสร็จสิ้นแล้ว (Resolved)
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight pt-1">
                ร่วมประเมินความพึงพอใจการให้บริการ
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-light">
                ความคิดเห็นของคุณมีความสำคัญยิ่งต่อการปรับปรุงการทำงานของทีมสวัสดิการมหาวิทยาลัย
              </p>
            </div>
            <div className="hidden sm:flex text-4xl p-3 bg-white/10 rounded-2xl border border-white/20">
              ⭐
            </div>
          </section>

          {/* สรุปข้อมูลเคส */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🔊</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    เสียงเปิดเพลงและกีตาร์ดังยามวิกาล
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    รหัสเคส: #REC-20260907-004
                  </p>
                </div>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                ✓ ดำเนินการแก้ไขแล้ว
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-2.5 bg-[#f8faf9] rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 block">
                  สถานที่เกิดเหตุ:
                </span>
                <span className="font-semibold text-slate-800">
                  หอพักนักศึกษาชาย 3 (ชั้น 4)
                </span>
              </div>
              <div className="p-2.5 bg-[#f8faf9] rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 block">
                  เวลาที่แจ้งเรื่อง:
                </span>
                <span className="font-semibold text-slate-800">
                  4 ก.ย. 2026 • 23:15 น.
                </span>
              </div>
              <div className="p-2.5 bg-[#f8faf9] rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-400 block">
                  เวลาที่เข้าตรวจสอบ:
                </span>
                <span className="font-semibold text-slate-800">
                  4 ก.ย. 2026 • 23:45 น. (30 นาที)
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-slate-700">
              <span className="font-bold text-emerald-900">
                บันทึกการปฏิบัติงานของเจ้าหน้าที่ (Action Log):{" "}
              </span>
              "รปภ. และอาจารย์ประจำหอเข้าตักเตือนผู้พักอาศัยห้องต้นเหตุ
              ให้ปิดเครื่องเสียงและงดกิจกรรมส่งเสียงรบกวนทันที
              เหตุการณ์สงบเรียบร้อย"
            </div>
          </div>

          {/* แบบฟอร์มประเมิน */}
          <form
            onSubmit={handleEvaluationSubmit}
            className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6"
          >
            {/* ส่วนที่ 1: คะแนนดาวภาพรวม */}
            <div className="space-y-2 text-center pb-6 border-b border-slate-100">
              <label className="block text-sm font-bold text-slate-800">
                ความพึงพอใจในภาพรวมต่อการแก้ปัญหาครั้งนี้{" "}
                <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-400">
                คลิกเลือกดาวเพื่อประเมินระดับความพึงพอใจ
              </p>

              <div className="flex justify-center items-center space-x-2 text-4xl text-slate-200 py-2 select-none">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setOverallRating(star)}
                    className={`transition-transform hover:scale-110 cursor-pointer ${
                      (hoverRating || overallRating) >= star
                        ? "text-amber-400"
                        : "text-slate-200"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <p className="text-xs font-semibold text-[#154c3c] h-4">
                {starDescriptions[hoverRating || overallRating]}
              </p>

              {hasConflict && (
                <div className="mt-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left flex items-start space-x-2.5">
                  <span className="text-base shrink-0">⚠️</span>
                  <div>
                    <span className="font-bold">ข้อสังเกต:</span>{" "}
                    คุณให้คะแนนภาพรวม 5 ดาว
                    แต่มีการประเมินในรายละเอียดว่าควรปรับปรุง
                    หากต้องการให้ทีมงานเข้าตรวจสอบซ้ำหรือมีข้อเสนอแนะเพิ่มเติม
                    โปรดระบุในช่องความคิดเห็นด้านล่างครับ
                  </div>
                </div>
              )}
            </div>

            {/* ส่วนที่ 2: รายละเอียด 10 ข้อ */}
            <div className="space-y-4 pb-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  ประเมินรายละเอียดการบริการ (10 ข้อสำคัญ)
                </h4>
                <span className="text-[11px] text-slate-400">
                  1 = แย่มาก, 5 = ดีเยี่ยม
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs space-y-2">
                {criteriaList.map((item) => (
                  <div
                    key={item.id}
                    className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <span className="font-medium text-slate-700">
                      {item.text}
                    </span>
                    <div className="flex items-center space-x-3 text-slate-600">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <label
                          key={val}
                          className="flex items-center space-x-1 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`q${item.id}`}
                            value={val}
                            checked={criteriaScores[item.id] === val}
                            onChange={() => handleCriteriaChange(item.id, val)}
                            className="text-emerald-700 focus:ring-0"
                          />
                          <span>{val}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ส่วนที่ 3: สถานะหน้างาน */}
            <div className="bg-[#f8faf9] p-4 rounded-xl border border-slate-200/70 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                ผลลัพธ์ในปัจจุบัน: ปัญหานี้ได้รับการแก้ไขหมดสิ้นแล้วหรือไม่?
              </span>
              <div className="flex items-center space-x-6 text-xs text-slate-700">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="is_solved"
                    value="yes"
                    checked={isSolved === "yes"}
                    onChange={() => setIsSolved("yes")}
                    className="text-emerald-700 focus:ring-0"
                  />
                  <span className="font-medium">
                    ✅ ปัญหาหมดสิ้นแล้ว ไม่ถูกรบกวนอีก
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="is_solved"
                    value="no"
                    checked={isSolved === "no"}
                    onChange={() => setIsSolved("no")}
                    className="text-emerald-700 focus:ring-0"
                  />
                  <span className="font-medium text-rose-700">
                    ❌ ยังพบปัญหาเดิมอยู่ (ต้องการให้ตรวจซ้ำ)
                  </span>
                </label>
              </div>
            </div>

            {/* ส่วนที่ 4: ข้อเสนอแนะ */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                ข้อเสนอแนะเพิ่มเติม หรือจุดที่ต้องการให้ปรับปรุง{" "}
                {hasConflict && (
                  <span className="text-rose-500">
                    * (จำเป็นต้องระบุเนื่องจากมีคะแนนแย้ง)
                  </span>
                )}
              </label>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={
                  hasConflict
                    ? "โปรดระบุจุดที่ควรปรับปรุงเพิ่มเติม เนื่องจากมีบางหัวข้อที่คุณประเมินในระดับต่ำ..."
                    : "ระบุข้อคิดเห็นเพื่อให้ทีมงานนำไปปรับปรุง เช่น อยากให้เพิ่มรอบตรวจช่วงดึก..."
                }
                className="w-full text-xs p-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1b5e4a] bg-[#f9fcfa] transition resize-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                ไว้ประเมินภายหลัง
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#1b5e4a] hover:bg-[#154c3c] rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isSubmitting ? "กำลังส่งแบบประเมิน..." : "ส่งแบบประเมิน"}
                </span>
                <span>→</span>
              </button>
            </div>
          </form>
        </main>
      </div>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[#0f382c] text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-500/30 flex items-center space-x-3 z-50 animate-bounce">
          <span className="text-xl">🎉</span>
          <div>
            <p className="text-xs font-bold">บันทึกผลการประเมินสำเร็จ!</p>
            <p className="text-[11px] text-emerald-200">
              ขอบคุณที่ร่วมเป็นส่วนหนึ่งในการพัฒนามหาวิทยาลัยวลัยลักษณ์
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
