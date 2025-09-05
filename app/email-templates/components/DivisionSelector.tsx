import { Divisions } from "@/app/configs/divisions/";
import { divisions } from "@/app/configs/divisions/";
import Image from "next/image";

interface DivisionSelectorProps {
  selectedDivision: Divisions | null;
  setSelectedDivision: (division: Divisions | null) => void;
  setSelectedRank: (rank: string) => void;
}

export default function DivisionSelector({
  selectedDivision,
  setSelectedDivision,
  setSelectedRank,
}: DivisionSelectorProps) {
  return (
    <div className="lg:col-span-1">
      <div className="bg-slate-800 rounded-lg p-6 shadow-lg h-full">
        <h2 className="text-xl font-semibold text-white mb-4">
          Select Division
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3">
          {divisions.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center p-3 rounded-md border transition-all cursor-pointer ${
                selectedDivision?.label === item.label
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-700 bg-slate-700/50 hover:bg-slate-700/80"
              }`}
              onClick={() => {
                setSelectedDivision(item);
                setSelectedRank("");
              }}
            >
              <div className="flex items-center justify-center w-12 h-12 mb-2">
                <Image
                  src={item.image}
                  alt={item.label}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <span className="text-sm text-center text-white font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
