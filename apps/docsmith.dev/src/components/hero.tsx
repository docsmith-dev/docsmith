import { CornerUpRight } from "lucide-react";

export const Hero = () => {
  return (
    <div className={"max-w-2xl mx-auto flex flex-col items-center"}>
      <h1 className={"font-display text-7xl font-bold my-20 text-center"}>
        Headless documentation primitives for the future
      </h1>
      <a
        href={"/docs"}
        className={
          "bg-black text-white px-4 py-2 rounded-md font-display text-xl flex flex-row gap-2 hover:bg-gray-800 transition-all cursor-pointer hover:translate-y-[-1px] active:translate-y-[1px] active:scale-[0.99] active:bg-gray-900 items-center shadow-sm"
        }
      >
        Get started <CornerUpRight className={"size-4"} />
      </a>
    </div>
  );
};
