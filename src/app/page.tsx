"use client";

import { card, user } from "@/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function Home() {
  const [cards, setCards] = useState<string[]>([]);
  const [user, setUser] = useState<any>();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (!user) {
        router.push("/sign-in");
      } else {
        setUser(JSON.parse(user));
      }
    }
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col justify-between items-center p-24">
      <div>
        <h1 className="text-2xl font-semibold mb-2">
          COP 4331 MERN Stack Demo
        </h1>
        <div className="flex gap-4 items-center mb-4">
          <p>Welcome, {user?.username}</p>
          <button
            onClick={() => {
              localStorage.removeItem("user");
              router.push("/sign-in");
            }}
            className="bg-slate-800 px-3 py-1 ml-auto rounded font-semibold hover:bg-slate-700 transition-colors focus-within:ring-2 focus-within:ring-slate-500 focus-within:outline-none"
            type="submit"
          >
            Sign Out
          </button>
        </div>
        <SearchCardsForm setCards={setCards} cards={cards} currentUser={user} />
        <AddCardForm setCards={setCards} currentUser={user} />
      </div>
    </main>
  );
}

function SearchCardsForm({
  currentUser,
  cards,
  setCards,
}: {
  currentUser: any;
  cards: string[];
  setCards: Dispatch<SetStateAction<string[]>>;
}) {
  const {
    setValue,
    formState: { isSubmitting, errors },
    register,
    handleSubmit,
  } = useForm<{ userId: string; search: string }>();

  const onSubmit = async (data: any) => {
    fetchCards(data.search);
  };

  const fetchCards = useCallback(
    async (search?: string) => {
      if (!currentUser) {
        return;
      }

      const url = new URL("/api/cards", window.location.origin);
      url.searchParams.append("userId", currentUser.id);
      if (search) {
        url.searchParams.append("search", search);
      }

      const response = await fetch(url.toString());
      const json = await response.json();
      const cards = json.map((card: any) => card.name);
      setCards(cards);
    },
    [currentUser, setCards]
  );

  useEffect(() => {
    setValue("userId", currentUser?.id);
  }, [currentUser, setValue]);

  useEffect(() => {
    fetchCards();
  }, [setCards, currentUser, fetchCards]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="search">Search</label>
          <div className="flex gap-2 w-full">
            <input
              id="search"
              className="flex-1 bg-slate-900 border-slate-800 border rounded px-4 py-2 outline-none focus-within:ring-2 focus-within:ring-slate-500"
              placeholder="search"
              {...register("search")}
            />
            <button
              disabled={isSubmitting}
              className="bg-slate-800 px-4 py-2 rounded font-semibold hover:bg-slate-700 transition-colors focus-within:ring-2 focus-within:ring-slate-500 focus-within:outline-none border border-slate-800 hover:border-slate-600"
            >
              Search
            </button>
          </div>
          {errors.search && (
            <span className="text-red-500 text-sm">
              {errors.search.message}
            </span>
          )}
        </div>
      </form>
      {cards.length > 0 ? (
        <ul className="grid gap-2 mb-4">
          {cards.map((card) => (
            <li key={card} className="bg-slate-800 px-4 py-2 rounded">
              {card}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4">No cards found</p>
      )}
    </>
  );
}

function AddCardForm({
  currentUser,
  setCards,
}: {
  currentUser: any;
  setCards: Dispatch<SetStateAction<string[]>>;
}) {
  const {
    setValue,
    formState: { isSubmitting, errors },
    register,
    handleSubmit,
  } = useForm<z.infer<typeof card>>({
    resolver: zodResolver(card),
  });

  useEffect(() => {
    setValue("userId", currentUser?.id);
  }, [currentUser, setValue]);

  const onSubmit = async (data: z.infer<typeof card>) => {
    const response = await fetch("/api/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      setCards((prev: string[]) => [...prev, data.name]);
    } else {
      const json = await response.json();
      console.error(json.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-1">
        <label htmlFor="add">Add Card</label>
        <div className="flex gap-2">
          <input
            id="add"
            className="flex-1 bg-slate-900 border-slate-800 border rounded px-4 py-2 outline-none focus-within:ring-2 focus-within:ring-slate-500"
            placeholder="name"
            {...register("name")}
          />
          <button
            disabled={isSubmitting}
            className="bg-slate-800 px-4 py-2 rounded font-semibold hover:bg-slate-700 transition-colors focus-within:ring-2 focus-within:ring-slate-500 focus-within:outline-none border border-slate-800 hover:border-slate-600"
          >
            Add Card
          </button>
        </div>
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name.message}</span>
        )}
      </div>
    </form>
  );
}
