"use client";

import { useState } from "react";
import { SchemeMapper } from "@/features/scheme-mapper/SchemeMapper";
import { Section } from "@/components/Section";
import { Switcher } from "@/components/Switcher";
import { SchemeAdd } from "@/features/scheme-add/SchemeAdd";
import { SchemeUpdate } from "@/features/scheme-update/SchemeUpdate";

const tabs = [
  { key: "markup", label: "Mark up an image" },
  { key: "add", label: "Add scheme" },
  { key: "update", label: "Update scheme" },
]

export default function HomeTemplate() {
  const [activeTab, setActiveTab] = useState("markup");

  return (
    <div className="max-w-[1100px] mx-auto p-5 grid gap-3">
      <Switcher 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={tab => setActiveTab(tab)} 
      />

      { activeTab === "markup" && (
        <Section title="Mark up an image">
          <SchemeMapper />
        </Section>
      ) }

      { activeTab === "add" && (
        <Section title="Add scheme">
          <SchemeAdd />
        </Section>
      ) } 

      { activeTab === "update" && (
        <Section title="Update scheme">
          <SchemeUpdate />
        </Section>
      ) }   
    </div>
  );
}
