"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuestionBankRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // The question bank has been separated into dedicated Clinical Problem Solving and Professional Dilemmas portals
    router.replace("/dashboard/clinical-problem-solving");
  }, [router]);

  return null;
}
