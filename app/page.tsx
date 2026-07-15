import Chat from "@/components/Chat";
import RoadmapWidget from "@/components/RoadmapWidget";

export default function Home() {
  return (
    <div className="flex h-screen flex-1 flex-col overflow-hidden bg-zinc-50 dark:bg-black">
      <header className="border-b border-black/10 px-4 py-4 dark:border-white/10">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
              LogHub Spedition GmbH
            </p>
            <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
              AI Intake Assistant
              <span className="font-normal text-black/50 dark:text-white/40"> — powered by grounded company knowledge</span>
            </h1>
          </div>
          <RoadmapWidget />
        </div>
      </header>
      <Chat />
    </div>
  );
}
