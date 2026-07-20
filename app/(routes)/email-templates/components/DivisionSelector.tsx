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
      <div className="h-full rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/20">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Select Division
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
          {ArrayToLoop.map((item, idx) => (
            <div
              key={idx}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border p-4 transition-all duration-200 ${
                selectedDivision?.label === item.label
                  ? "border-sky-500/60 bg-sky-500/10 shadow-lg shadow-sky-500/10"
                  : "border-white/10 bg-slate-800/50 hover:border-white/20 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-white/5"
              }`}
              onClick={() => {
                setSelectedDivision(item);
                setSelectedRank("");
              }}
            >
              <div className="mb-2 flex h-12 w-12 items-center justify-center transition-transform duration-200 hover:scale-110">
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
