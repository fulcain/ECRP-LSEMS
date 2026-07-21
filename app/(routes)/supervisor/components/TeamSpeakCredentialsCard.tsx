"use client";

import { Button } from "@/components/ui/button";
import { copyBBCode } from "@/app/helpers/copyBBCode";
import { Copy, Headphones } from "lucide-react";

const IP_COPY_TEXT = "(( IP: ts.eclipse-rp.net ))";
const PASSWORD_COPY_TEXT = "(( Password: ecrpsagov ))";

export function TeamSpeakCredentialsCard() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Headphones className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-medium text-slate-300">
         (( TeamSpeak Access ))
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              IP
            </p>
            <p className="truncate font-mono text-sm text-white">
              ts.eclipse-rp.net
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => copyBBCode({ bbCodeText: IP_COPY_TEXT })}
            className="h-7 gap-1 px-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Copy OOC IP line"
          >
            <Copy className="h-3 w-3" />
            <span className="text-xs">Copy IP</span>
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              Password
            </p>
            <p className="truncate font-mono text-sm text-white">ecrpsagov</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => copyBBCode({ bbCodeText: PASSWORD_COPY_TEXT })}
            className="h-7 gap-1 px-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Copy OOC password line"
          >
            <Copy className="h-3 w-3" />
            <span className="text-xs">Copy Password</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
