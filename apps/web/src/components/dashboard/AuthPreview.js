"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AuthPreview() {
  return (
    <div className="hidden bg-[#f8f5f4] p-4 lg:block lg:p-6">
      <div className="relative h-full min-h-[760px] overflow-hidden rounded-[30px]">
        <Image
          src="/images/login-bg.png"
          alt="Orange background"
          fill
          priority
          className="object-cover"
        />

        <motion.div
          initial={{ x: 180, opacity: 0, scale: 2 }}
          animate={{ x: 0, opacity: 1, scale: 2 }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute left-[40%] top-[34%]"
        >
          <Image
            src="/images/login-dashboard.png"
            alt="Dashboard preview"
            width={1400}
            height={900}
            priority
            className="drop-shadow-[0_70px_180px_rgba(0,0,0,0.25)]"
          />
        </motion.div>
      </div>
    </div>
  );
}