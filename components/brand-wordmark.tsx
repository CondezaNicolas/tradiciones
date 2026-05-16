import { cn } from "@/lib/utils";

const BRAND_TEXT = "Chile País de Tradiciones";

interface BrandWordmarkProps {
  text?: string;
  mobileText?: string;
  className?: string;
  fillClassName?: string;
  strokeClassName?: string;
  strokeWidth?: string;
  strokeColor?: string;
}

interface BrandWordmarkLayerProps {
  text: string;
  className?: string;
  fillClassName?: string;
  strokeClassName?: string;
  strokeWidth: string;
  strokeColor: string;
}

function BrandWordmarkLayer({
  text,
  className,
  fillClassName,
  strokeClassName,
  strokeWidth,
  strokeColor,
}: BrandWordmarkLayerProps) {
  return (
    <span className={cn("relative inline-block w-fit", className)}>
      <span
        aria-hidden="true"
        className={cn("absolute inset-0 text-transparent", strokeClassName)}
        style={{ WebkitTextStroke: `${strokeWidth} ${strokeColor}` }}
      >
        {text}
      </span>
      <span
        className={cn(
          "relative bg-gradient-to-r from-brand-start via-brand-middle to-brand-end bg-clip-text text-transparent",
          fillClassName,
        )}
        style={{
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {text}
      </span>
    </span>
  );
}

export function BrandWordmark({
  text = BRAND_TEXT,
  mobileText,
  className,
  fillClassName,
  strokeClassName,
  strokeWidth = "1px",
  strokeColor = "rgba(0, 0, 0, 0.9)",
}: BrandWordmarkProps) {
  if (mobileText) {
    return (
      <>
        <BrandWordmarkLayer
          text={mobileText}
          className={cn(className, "sm:hidden")}
          fillClassName={fillClassName}
          strokeClassName={strokeClassName}
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
        />
        <BrandWordmarkLayer
          text={text}
          className={cn(className, "hidden sm:inline-block")}
          fillClassName={fillClassName}
          strokeClassName={strokeClassName}
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
        />
      </>
    );
  }

  return (
    <BrandWordmarkLayer
      text={text}
      className={className}
      fillClassName={fillClassName}
      strokeClassName={strokeClassName}
      strokeWidth={strokeWidth}
      strokeColor={strokeColor}
    />
  );
}
