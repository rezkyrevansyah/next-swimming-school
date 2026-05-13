import type { Metadata } from "next";
import { LoginSplitScreen } from "./login-split-screen";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return <LoginSplitScreen />;
}
