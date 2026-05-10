import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * LogoCircle — logo bulat, cocok untuk sidebar kecil, halaman login, avatar-style
 */
export function LogoCircle({
  size = 40,
  href,
  className,
}: {
  size?: number;
  href?: string;
  className?: string;
}) {
  const img = (
    <Image
      src="/logo-circle.png"
      alt="Next Swimming School"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {img}
      </Link>
    );
  }
  return img;
}

/**
 * LogoWide — logo persegi panjang (icon + teks), cocok untuk header publik dan tempat horizontal
 */
export function LogoWide({
  height = 36,
  href,
  className,
}: {
  height?: number;
  href?: string;
  className?: string;
}) {
  // Aspect ratio logo wide ≈ 2.5 : 1
  const width = Math.round(height * 2.5);

  const img = (
    <Image
      src="/logo-wide.png"
      alt="Next Swimming School"
      width={width}
      height={height}
      className={cn("shrink-0", className)}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {img}
      </Link>
    );
  }
  return img;
}
