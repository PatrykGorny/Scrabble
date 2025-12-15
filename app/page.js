"use client";

import { Button, Card } from "flowbite-react";
import { useAuth } from "@/app/lib/AuthContext";
import Link from "next/link";
import { FaPlay } from "react-icons/fa";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 md:p-24">
      <Card className="max-w-4xl w-full">
        <div className="text-center mb-6">
          <h5 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Witaj w Scrabble!
          </h5>
          <p className="text-lg font-normal text-gray-700 dark:text-gray-400 mb-6">
            Gra planszowa dla miłośników słów. Zaloguj się, aby zacząć grać.
          </p>
          <div className="flex justify-center">
            {user ? (
              <Link href="/scrabble">
                <Button
                  size="lg"
                  color="success"
                  className="flex items-center gap-2 ring-4 ring-green-300 hover:ring-green-400"
                >
                  <FaPlay size={20} />
                  Przejdź do gry
                </Button>
              </Link>
            ) : (
              <Link href="/user/signin">
                <Button
                  size="lg"
                  color="success"
                  className="flex items-center gap-2 ring-4 ring-green-300 hover:ring-green-400"
                >
                  <FaPlay size={20} />
                  Przejdź do gry
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Zasady Scrabble
          </h5>
          <div className="text-sm text-gray-700 dark:text-gray-400 space-y-3">
            <p>
              <strong>Cel gry:</strong> Uzyskać jak najwięcej punktów poprzez
              układanie słów na planszy Scrabble.
            </p>
            <p>
              <strong>Przygotowanie:</strong> Każdy gracz losuje 7 płytek z
              literami na początku gry.
            </p>
            <p>
              <strong>Jak grać:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Pierwszy gracz układa słowo na środkowym polu planszy.</li>
              <li>
                Kolejni gracze dodają nowe słowa, krzyżując istniejące litery.
              </li>
              <li>Słowa muszą być poprawne i istnieć w słowniku.</li>
              <li>Po każdym ruchu gracz uzupełnia płytki do 7.</li>
              <li>
                Punkty naliczane są za wartość liter oraz premie pól (np.
                podwójna litera).
              </li>
            </ul>
            <p>
              <strong>Zakończenie gry:</strong> Gra kończy się, gdy wszystkie
              płytki zostaną wykorzystane lub żaden gracz nie może wykonać
              ruchu. Wygrywa gracz z najwyższą liczbą punktów.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
