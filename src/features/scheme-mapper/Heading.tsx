'use client'

import { useRef, useState } from "react";
import { useSchemeMapperContext } from "@/context/SchemeMapperContext";
import { Modal } from "@/components/ui/modals/Modal";
import { Button } from "@/components/ui/buttons/Button";
import { Mapper } from "./Mapper";

export const Heading = () => {
  const { 
    image, 
    setImage, 
    polygons, 
    setPoints,
    setPolygons 
  } = useSchemeMapperContext();
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShowResultModalOpen, setIsShowResultModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const onImageInputChangeHandler = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => setImage(img);
  }

  const onRestartClickHandler = () => {
    setImage(null);
    setPoints([]);
    setPolygons([]);
  }

  const onExportModalAcceptClickHandler = () => {
    navigator.clipboard.writeText(JSON.stringify(polygons, null, 2))
    setIsCopied(true);
  }

  const onExportModalCloseClickHandler = () => {
    setIsExportModalOpen(false)
    setIsCopied(false);
  }

  return (
    <div className="flex items-center gap-4 mb-4">
      { !image && (
        <>
          <input 
            ref={imageInputRef} 
            type="file" 
            className="hidden" 
            onChange={e => onImageInputChangeHandler(e)} 
          />

          <Button onClick={() => imageInputRef?.current?.click()}>
            Download image
          </Button>
        </>
      )}

      { image && (
        <>
          <Button 
            onClick={onRestartClickHandler} 
            type="secondary"
            withIcon
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>

            Try another image
          </Button>

          <Button 
            onClick={() => setIsShowResultModalOpen(true)}
            type="secondary"
            withIcon
          >
            Show result
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>

          </Button>

          <Button 
            onClick={() => setIsExportModalOpen(true)} 
            disabled={polygons.length == 0}
          >
            Export JSON
          </Button>
        </>
      ) }

      <Modal 
        isOpen={isExportModalOpen}
        title="Export JSON"
        acceptLabel={isCopied ? 'Copied!' : 'Copy JSON'}
        onAccept={onExportModalAcceptClickHandler}
        onClose={onExportModalCloseClickHandler}
      >
        {JSON.stringify(polygons, null, 2)}
      </Modal>

      <Modal 
        isOpen={isShowResultModalOpen}
        title="Image map result"
        onClose={() => setIsShowResultModalOpen(false)}
      >
        <Mapper />
      </Modal>
    </div>
  )
}
