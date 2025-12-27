"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 hover:opacity-90">
      <span className="relative block h-10 w-[180px] overflow-hidden">
        <Image
          src="/logoLight.png"
          alt="ConsensusAI logo light"
          fill
          sizes="180px"
          className="object-cover show-on-light"
          priority
        />
        <Image
          src="/logoDark.png"
          alt="ConsensusAI logo dark"
          fill
          sizes="180px"
          className="object-cover show-on-dark"
          priority
        />
      </span>
    </Link>
  );
}


