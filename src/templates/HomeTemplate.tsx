"use client";

import { useState } from "react";
import { SchemeMapper } from "@/features/scheme-mapper/SchemeMapper";
import { Section } from "@/components/Section";
import { Switcher } from "@/components/Switcher";
import { SchemeAdd } from "@/features/scheme-add/SchemeAdd";
import { SchemeUpdate } from "@/features/scheme-update/SchemeUpdate";
import classNames from "classnames";
import { useSchemeMapperContext } from "@/context/SchemeMapperContext";

const tabs = [
  { key: "markup", label: "Mark up an image" },
  { key: "add", label: "Add scheme" },
  { key: "update", label: "Update scheme" },
]

export default function HomeTemplate() {
  const [activeTab, setActiveTab] = useState("markup");

  const { image } = useSchemeMapperContext();

  return (
    <div className={classNames('max-w-[1100px] mx-auto p-5 grid gap-3', {
      'max-w-full': activeTab == 'markup' && image
    })}>
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
