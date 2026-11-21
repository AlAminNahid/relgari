import type { Metadata } from "next";
import { ContactForm } from "@/components/sections/contact/contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <ContactForm />;
}
