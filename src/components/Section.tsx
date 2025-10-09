import { Divider } from "@/features/scheme-mapper/Divider"
import { ReactNode } from "react"

export const Section = ({
  title,
  children
}: {
  title: string,
  children: ReactNode
}) => {
  return (
    <section className="border border-[var(--grey-color)] rounded-xl p-4 bg-[var(--secondary-color)] overflow-hidden">
      <div className="flex justify-between items-center ">
        <h2 className="m-0 text-[22px] text-[var(--text-color)]">{title}</h2>
      </div>

      <Divider size={1} />

      {children}
    </section>
  )
}
