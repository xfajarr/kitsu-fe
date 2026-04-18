import * as React from "react";
import foxImg from "@/assets/fox-mascot.png";
import { PopButton } from "@/components/PopButton";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = {
  id: string;
  from: "fox" | "me";
  text: string;
};

const SUGGESTIONS = [
  "How do Money Dens work?",
  "How much should I save monthly?",
  "Is it safe?",
  "Help me set a goal",
];

/** Mock fox replies. Picks a friendly, contextual response. */
function foxReply(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("safe") || q.includes("risk")) {
    return "Great question! 🦊 Your coins live on the TON blockchain — no one (not even me!) can touch them without your permission. The Steady dens keep your money very safe; the Adventurous ones can wiggle a bit but earn more.";
  }
  if (q.includes("den") || q.includes("vault") || q.includes("save")) {
    return "Money Dens are cozy little spots where your TON grows automatically ✨. Pick a public one to save with the community, or make your own private den for friends or family. Tiny deposits count — even $5 starts the magic!";
  }
  if (q.includes("goal")) {
    return "Yay, goals! 🎯 Tell me what you're saving for (a trip, a laptop, an emergency fund) and I'll suggest a friendly monthly amount. You can set one in the Profile tab → Goals.";
  }
  if (q.includes("month") || q.includes("how much")) {
    return "A nice rule of paw 🐾: try saving 10% of what comes in. Even $20–$50 a month in a Steady den adds up faster than you'd expect — let's plan it together!";
  }
  if (q.includes("ton") || q.includes("crypto")) {
    return "TON is the network your savings live on. Think of it like a super-fast, super-cheap rail for moving money — perfect for tiny daily savings.";
  }
  if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
    return "Hi hi! 🦊✨ I'm Foxy, your wealth buddy. Ask me anything about saving, goals, or Money Dens!";
  }
  return "Oooh, fun question! Here's my take: small consistent deposits beat big rare ones. Want me to suggest a den that fits your vibe?";
}

export const FoxChatScreen: React.FC = () => {
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      id: "m0",
      from: "fox",
      text: "Hi! I'm Foxy 🦊✨ Your friendly wealth buddy. What's on your mind today?",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text) return;
    const myMsg: Msg = { id: `m-${Date.now()}`, from: "me", text };
    setMessages((p) => [...p, myMsg]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      const reply: Msg = { id: `f-${Date.now()}`, from: "fox", text: foxReply(text) };
      setMessages((p) => [...p, reply]);
      setTyping(false);
    }, 700 + Math.random() * 600);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] animate-fade-in">
      {/* Header */}
      <div className="px-4 pt-1 pb-3 flex items-center gap-3">
        <div className="relative">
          <img
            src={foxImg}
            alt="Foxy the AI fox mascot"
            width={64}
            height={64}
            className="w-14 h-14 rounded-2xl bg-primary-soft border-2 border-primary/40 object-contain animate-float"
          />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-success border-2 border-background" />
        </div>
        <div>
          <p className="font-display font-bold leading-tight">Foxy</p>
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Your wealth buddy · always here
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 space-y-3 pb-2"
      >
        {messages.map((m) => (
          <Bubble key={m.id} msg={m} />
        ))}
        {typing && (
          <div className="flex items-end gap-2">
            <img src={foxImg} alt="" width={32} height={32} className="w-8 h-8 rounded-xl bg-primary-soft border border-primary/30 object-contain" />
            <div className="bg-card border-2 border-border rounded-3xl rounded-bl-md px-4 py-2.5 flex items-center gap-1">
              <Dot delay={0} />
              <Dot delay={150} />
              <Dot delay={300} />
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="shrink-0 chip bg-secondary-soft text-secondary-foreground border border-secondary/60 press-effect"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="px-4 pb-3 pt-2"
      >
        <div className="flex items-center gap-2 bg-card border-2 border-border rounded-3xl px-3 py-2 shadow-[0_4px_0_0_hsl(var(--border))]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Foxy anything…"
            className="flex-1 bg-transparent outline-none text-sm font-semibold placeholder:text-muted-foreground"
            aria-label="Message Foxy"
          />
          <PopButton type="submit" tone="primary" size="sm" disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </PopButton>
        </div>
      </form>
    </div>
  );
};

const Bubble: React.FC<{ msg: Msg }> = ({ msg }) => {
  const isMe = msg.from === "me";
  return (
    <div className={cn("flex items-end gap-2", isMe && "flex-row-reverse")}>
      {!isMe && (
        <img
          src={foxImg}
          alt=""
          width={32}
          height={32}
          className="w-8 h-8 rounded-xl bg-primary-soft border border-primary/30 object-contain shrink-0"
        />
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-3xl px-4 py-2.5 text-sm font-semibold leading-snug border-2",
          isMe
            ? "bg-primary text-primary-foreground border-primary rounded-br-md"
            : "bg-card text-foreground border-border rounded-bl-md",
        )}
      >
        {msg.text}
      </div>
    </div>
  );
};

const Dot: React.FC<{ delay: number }> = ({ delay }) => (
  <span
    className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse"
    style={{ animationDelay: `${delay}ms` }}
  />
);
