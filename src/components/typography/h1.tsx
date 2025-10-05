import { PropsWithChildren } from "react";

export function H1({ children }: PropsWithChildren) {
  return <h1 className="text-3xl font-bold">{children}</h1>;
}
