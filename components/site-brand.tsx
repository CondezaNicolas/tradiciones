import Image from "next/image";
import Link from "next/link";

interface SiteBrandProps {
  className?: string;
  href?: string;
  logoClassName?: string;
  subtitleClassName?: string;
  textClassName?: string;
  titleClassName?: string;
}

export function SiteBrand({
  className,
  href = "/",
  logoClassName = "h-14 w-14 sm:h-16 sm:w-16",
  subtitleClassName = "text-xs sm:text-sm md:text-base",
  textClassName = "pb-1",
  titleClassName = "text-base sm:text-lg md:text-xl",
}: SiteBrandProps) {
  return (
    <Link className={["inline-flex items-end gap-2 text-primary", className].filter(Boolean).join(" ")} href={href}>
      <Image
        src="/images/logo.svg"
        alt="Logo de Chile País de Tradiciones"
        width={64}
        height={64}
        className={["object-contain", logoClassName].filter(Boolean).join(" ")}
        priority
      />
      <span
        className={[
          "flex flex-col text-left font-headline font-semibold leading-[0.9] tracking-tight",
          textClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className={titleClassName}>Chile</span>
        <span className={subtitleClassName}>País de Tradiciones</span>
      </span>
    </Link>
  );
}
