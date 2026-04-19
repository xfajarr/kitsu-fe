import * as React from "react";
import foxImg from "@/assets/fox-mascot.png";
import { PopButton } from "@/components/PopButton";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/queries/useChat";
import { usePortfolio } from "@/hooks/queries/usePortfolio";
import { useUser } from "@/hooks/queries/useUser";
import { useGoals } from "@/hooks/queries/useGoals";
import { useMyDens } from "@/hooks/queries/useDens";
import { toast } from "sonner";

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

export const FoxChatScreen: React.FC = () => {
  const [messages, setMessages] = React.useState<Msg[]>([
    {
      id: "m0",
      from: "fox",
      text: "Hi! I'm Foxy 🦊✨ Your friendly wealth buddy. What's on your mind today?",
    },
  ]);
  const [input, setInput] = React.useState("");
  const chat = useChat();
  const { data: portfolio } = usePortfolio();
  const { data: user } = useUser();
  const { data: goals = [] } = useGoals();
  const { data: myDens = [] } = useMyDens();
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, chat.isPending]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || chat.isPending) return;
    const myMsg: Msg = { id: `m-${Date.now()}`, from: "me", text };
    setMessages((p) => [...p, myMsg]);
    setInput("");
    try {
      const reply = await chat.mutateAsync({
        message: text,
        context: {
          portfolioUsd: portfolio?.totalUsd,
          goalsCount: goals.length,
          densCount: myDens.length,
          level: user?.level,
        },
      });
      setMessages((p) => [...p, { id: `f-${Date.now()}`, from: "fox", text: reply }]);
    } catch {
      toast.error("Foxy couldn't reach the server. Try again in a moment.");
    }
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
            className="w-14 h-14 rounded-2xl bg-primary-soft border-2 border-primary/40 object-contain"
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3 pb-2">
        {messages.map((m) => (
          <Bubble key={m.id} msg={m} />
        ))}
        {chat.isPending && (
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
              type="button"
              onClick={() => void send(s)}
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
          void send();
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
          <PopButton type="submit" tone="primary" size="sm" disabled={!input.trim() || chat.isPending}>
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
