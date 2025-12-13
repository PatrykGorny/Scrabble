"use client";

import { Button, Card } from "flowbite-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Card className="max-w-sm">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Witaj w projekcie Next.js!
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          Flowbite React i Firebase są gotowe do użycia.
        </p>
        <Button>
          Kliknij mnie
        </Button>
      </Card>
    </main>
  );
}