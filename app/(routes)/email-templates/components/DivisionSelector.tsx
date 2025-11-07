import { Divisions } from "@/app/constants/divisions";
import Image from "next/image";

interface DivisionSelectorProps {
  selectedDivision: Divisions | null;
  setSelectedDivision: (division: Divisions | null) => void;
  setSelectedRank: (rank: string) => void;
  ArrayToLoop: Divisions[];
}

export default function DivisionSelector({
  selectedDivision,
  setSelectedDivision,
  setSelectedRank,
  ArrayToLoop,
}: DivisionSelectorProps) {
  return (
    <div className="lg:col-span-1">
      <div className="h-full rounded-lg bg-slate-800 p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Select Division
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
          {ArrayToLoop.map((item, idx) => (
            <div
              key={idx}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-md border p-3 transition-all ${
                selectedDivision?.label === item.label
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-700 bg-slate-700/50 hover:bg-slate-700/80"
              }`}
              onClick={() => {
                setSelectedDivision(item);
                setSelectedRank("");
              }}
            >
              <div className="mb-2 flex h-12 w-12 items-center justify-center">
                <Image
                  src={item.image}
                  alt={item.label}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <span className="text-center text-sm font-medium text-white">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
