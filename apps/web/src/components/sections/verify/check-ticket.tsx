"use client";

import { useEffect, useRef, useState } from "react";
import { CameraIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface Detector {
  detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]>;
}
type DetectorConstructor = new (options: { formats: string[] }) => Detector;

const findPnr = (text: string) =>
  /RG[A-Z0-9]{6}/i.exec(text)?.[0].toUpperCase();

export function CheckTicket() {
  const t = useTranslations("verify");
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string>();
  const [canScan, setCanScan] = useState(false);
  const [scanning, setScanning] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setCanScan("BarcodeDetector" in window), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!scanning) return;
    let active = true;
    let stream: MediaStream | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function start() {
      try {
        const Detector = (
          window as unknown as { BarcodeDetector: DetectorConstructor }
        ).BarcodeDetector;
        const detector = new Detector({ formats: ["qr_code"] });
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!active || !video.current) return;
        video.current.srcObject = stream;
        await video.current.play();
        const look = async () => {
          if (!active || !video.current) return;
          const codes = await detector.detect(video.current).catch(() => []);
          const pnr = codes.map((c) => findPnr(c.rawValue)).find(Boolean);
          if (pnr) {
            router.push(`/verify/${pnr}`);
            return;
          }
          timer = setTimeout(() => void look(), 300);
        };
        void look();
      } catch {
        if (active) {
          setError(t("cameraError"));
          setScanning(false);
        }
      }
    }
    void start();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [scanning, router, t]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const pnr = findPnr(text);
    if (!pnr) return setError(t("badPnr"));
    router.push(`/verify/${pnr}`);
  }

  return (
    <div className="mx-auto max-w-[520px] px-5 pb-20 pt-12">
      <h1 className="text-[clamp(26px,3.6vw,34px)] font-extrabold tracking-tight text-brand-deep">
        {t("title")}
      </h1>
      <p className="mt-2 text-[15.5px] text-muted-foreground">{t("intro")}</p>

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border bg-card p-5"
        noValidate
      >
        <label
          htmlFor="pnr"
          className="mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-[.08em] text-muted-foreground"
        >
          {t("pnr")}
        </label>
        <div className="flex gap-2.5">
          <input
            id="pnr"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(undefined);
            }}
            placeholder="RGXXXXXX"
            autoComplete="off"
            autoCapitalize="characters"
            className="h-12 min-w-0 flex-1 rounded-xl border-[1.5px] bg-background px-3.5 font-mono text-[17px] uppercase tracking-[.1em] outline-none focus:border-primary"
          />
          <Button type="submit" className="h-12 rounded-xl px-5 font-bold">
            <SearchIcon className="size-4" />
            {t("check")}
          </Button>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-2 text-[14px] font-medium text-destructive"
          >
            {error}
          </p>
        )}
      </form>

      {canScan && (
        <div className="mt-4 rounded-2xl border bg-card p-5">
          {scanning ? (
            <>
              <video
                ref={video}
                muted
                playsInline
                className="aspect-square w-full rounded-xl bg-black object-cover"
              />
              <Button
                variant="outline"
                onClick={() => setScanning(false)}
                className="mt-3 h-11 w-full rounded-xl font-semibold"
              >
                {t("stopScan")}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setError(undefined);
                setScanning(true);
              }}
              className="h-12 w-full rounded-xl text-[15.5px] font-semibold"
            >
              <CameraIcon className="size-4" />
              {t("scan")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
