import * as React from "react";
import { TOKENS, type Token } from "@/data/mock";
import { PopButton } from "@/components/PopButton";
import { FoxBuddy } from "@/components/FoxBuddy";
import { ArrowDown, ChevronDown, Settings2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SideProps = {
  label: string;
  token: Token;
  amount: string;
  onAmount?: (v: string) => void;
  onPick: () => void;
  readOnly?: boolean;
};

const Side: React.FC<SideProps> = ({ label, token, amount, onAmount, onPick, readOnly }) => {
  const usd = (parseFloat(amount || "0") * token.priceUsd).toFixed(2);
  return (
    <div className="bg-muted/60 border-2 border-border rounded-2xl p-4">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
        <span>{label}</span>
        <span>Balance: {token.balance.toLocaleString()}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          inputMode="decimal"
          value={amount}
          readOnly={readOnly}
          onChange={(e) => onAmount?.(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0.0"
          className={cn(
            "flex-1 min-w-0 bg-transparent outline-none font-display text-3xl font-bold tabular-nums",
            "placeholder:text-muted-foreground",
          )}
        />
        <button
          type="button"
          onClick={onPick}
          className="press-effect flex items-center gap-2 bg-card border-2 border-border rounded-2xl px-3 py-2 font-display font-bold pop-shadow-muted"
        >
          <span aria-hidden className="text-lg leading-none">{token.icon}</span>
          <span>{token.symbol}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-1">≈ ${usd}</p>
    </div>
  );
};

const TokenPicker: React.FC<{
  open: boolean;
  exclude: string;
  onPick: (t: Token) => void;
  onClose: () => void;
}> = ({ open, exclude, onPick, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" role="dialog" aria-modal>
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30"
      />
      <div className="relative w-full max-w-md bg-card rounded-t-3xl sm:rounded-3xl border-2 border-border p-4 animate-pop-in">
        <div className="mx-auto w-10 h-1.5 bg-border rounded-full mb-3 sm:hidden" />
        <h3 className="font-display font-bold text-lg mb-2">Choose a token</h3>
        <ul className="space-y-2 max-h-[55vh] overflow-y-auto no-scrollbar">
          {TOKENS.filter((t) => t.symbol !== exclude).map((t) => (
            <li key={t.symbol}>
              <button
                onClick={() => onPick(t)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-muted/60 border-2 border-border press-effect"
              >
                <span className="w-10 h-10 rounded-2xl bg-card border-2 border-border flex items-center justify-center text-xl">
                  {t.icon}
                </span>
                <div className="flex-1 text-left">
                  <p className="font-display font-bold">{t.symbol}</p>
                  <p className="text-xs text-muted-foreground">{t.name}</p>
                </div>
                <p className="text-sm font-bold tabular-nums">{t.balance.toLocaleString()}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const SwapScreen: React.FC = () => {
  const [from, setFrom] = React.useState<Token>(TOKENS[0]);
  const [to, setTo] = React.useState<Token>(TOKENS[1]);
  const [amount, setAmount] = React.useState("10");
  const [picker, setPicker] = React.useState<null | "from" | "to">(null);
  const [submitting, setSubmitting] = React.useState(false);

  const rate = from.priceUsd / to.priceUsd;
  const out = amount ? (parseFloat(amount) * rate).toFixed(4) : "0";

  const flip = () => {
    setFrom(to);
    setTo(from);
    setAmount(out);
  };

  const handleSwap = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    toast.success(`Swapped ${amount} ${from.symbol} → ${out} ${to.symbol}`, {
      description: "Quest progress +25 XP",
    });
  };

  return (
    <div className="px-4 pt-2 pb-28 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="font-display text-2xl font-bold">Swap</h1>
          <p className="text-xs text-muted-foreground">Powered by ston.fi · best route auto-picked</p>
        </div>
        <button className="press-effect w-10 h-10 rounded-2xl bg-card border-2 border-border flex items-center justify-center pop-shadow-muted">
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      <section className="game-card p-4 space-y-2 relative">
        <Side
          label="You pay"
          token={from}
          amount={amount}
          onAmount={setAmount}
          onPick={() => setPicker("from")}
        />

        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={flip}
            aria-label="Flip tokens"
            className="press-effect w-10 h-10 rounded-2xl bg-primary text-primary-foreground border-2 border-card pop-shadow flex items-center justify-center"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        <Side
          label="You receive"
          token={to}
          amount={out}
          readOnly
          onPick={() => setPicker("to")}
        />

        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pt-2 px-1">
          <span>1 {from.symbol} ≈ {rate.toFixed(4)} {to.symbol}</span>
          <span>Fee 0.30%</span>
        </div>

        <PopButton
          tone="primary"
          size="lg"
          block
          disabled={submitting || !parseFloat(amount)}
          onClick={handleSwap}
        >
          {submitting ? "Swapping…" : (
            <>
              <Check className="w-5 h-5" />
              Swap now
            </>
          )}
        </PopButton>
      </section>

      <FoxBuddy
        message={
          <span>
            Tip: small, regular swaps build your <span className="text-primary-deep font-bold">streak</span> and unlock bonus XP.
          </span>
        }
      />

      <TokenPicker
        open={picker !== null}
        exclude={picker === "from" ? to.symbol : from.symbol}
        onPick={(t) => {
          if (picker === "from") setFrom(t);
          else setTo(t);
          setPicker(null);
        }}
        onClose={() => setPicker(null)}
      />
    </div>
  );
};
