import { redirect } from "next/navigation";

export default function TermsPage() {
  redirect("/legal?doc=terms-of-service");
}
