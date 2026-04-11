import { redirect } from "next/navigation";

export default function SafetyTipsPage() {
  redirect("/legal?doc=safety-tips");
}
