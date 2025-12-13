import Link from "next/link";
import { Button } from "flowbite-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-6">
        Strona nie została znaleziona
      </h2>
      <p className="text-gray-500 mb-8">
        Przepraszamy, ale strona którą próbujesz otworzyć nie istnieje.
      </p>
      <Link href="/">
        <Button color="blue" size="lg">
          Powrót do strony głównej
        </Button>
      </Link>
    </div>
  );
}