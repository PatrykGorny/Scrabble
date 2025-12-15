"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";
import { Button, Card } from "flowbite-react";
import { FaSignOutAlt } from "react-icons/fa";

export default function LogoutForm() {
  const router = useRouter();

  const onSubmit = () => {
    signOut(auth);
    router.push("/");
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Wylogowanie</h2>
        <p className="text-gray-600 mb-6">Czy na pewno chcesz się wylogować?</p>
        <div className="flex gap-3">
          <Button
            color="failure"
            onClick={onSubmit}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <FaSignOutAlt size={16} />
            Wyloguj się
          </Button>
          <Button color="gray" onClick={() => router.back()} className="flex-1">
            Anuluj
          </Button>
        </div>
      </Card>
    </div>
  );
}
