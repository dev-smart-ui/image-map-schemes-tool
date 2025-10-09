'use client'

import { useEffect, useRef, useState } from "react";
import { useSchemeMapperContext } from "@/context/SchemeMapperContext";
import { Modal } from "@/components/ui/modals/Modal";
import { Button } from "@/components/ui/buttons/Button";
import { Mapper } from "./Mapper";
import { Divider } from "./Divider";
import classNames from "classnames";

export const Heading = () => {
  const { 
    name,
    image,
    polygons, 
    exportData,
    setImage, 
    setImageUrl,
    setName,
    setPoints,
    setPolygons 
  } = useSchemeMapperContext();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShowResultModalOpen, setIsShowResultModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [imageUrlState, setImageUrlState] = useState('');
  const [imageUrlError, setImageUrlError] = useState('');

  const onDownLoadClickHandler = async () => {
    try {
      setImageUrlError('');

      const response = await fetch(imageUrlState);

      if (response.status !== 200) {
        throw 'Error in load image!';
      }

      const blob = await response.blob();      
      const mime = blob.type;
      const ext = mime.split('/')[1] || 'bin';

      const file = new File([blob], `scheme.${ext}`, { type: mime });

      if (!file) return;      

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        setImage(img);
      };

      setImageUrl(imageUrlState); 
    } catch(err) {
      console.warn(err);     
      setImageUrlError('Error in load image!'); 
    }
  }

  const onRestartClickHandler = () => {
    setImage(null);
    setImageUrlState('');
    setImageUrl('');
    setPoints([]);
    setPolygons([]);
  }

  const onExportModalAcceptClickHandler = () => {
    console.log(exportData);
    navigator.clipboard.writeText(JSON.stringify(exportData))
    setIsCopied(true);
  }

  const onExportModalCloseClickHandler = () => {
    setIsExportModalOpen(false)
    setIsCopied(false);
  }

  useEffect(() => {
    setIsCopied(false);
  }, [name])

  return (
    <div className={classNames('flex items-center gap-4', {
      'mb-4': image
    })}>
      { !image && (
        <>
          <div className="w-1/2">
            <div className="flex flex-col gap-2">
              <label htmlFor="inputUrl">Image url:</label>
              <input 
                id="inputUrl"
                type="text" 
                className="bg-[var(--primary-color)] p-2 text-[14px]" 
                value={imageUrlState}
                onChange={e => setImageUrlState(e.target.value)}
              />
            </div>

            {imageUrlError && (
              <div className="text-[var(--error-color)] mt-2">{imageUrlError}</div>
            )}

            <Button 
              className="mt-8" 
              onClick={onDownLoadClickHandler}
              disabled={!imageUrlState}
            >
              Download
            </Button>
          </div>
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
        acceptLabel={isCopied ? 'Copied!' : 'Copy'}
        acceptType={isCopied ? 'success' : 'secondary'}
        onAccept={onExportModalAcceptClickHandler}
        onClose={onExportModalCloseClickHandler}
      >
        <div>
          <div className="inline-flex flex-col gap-2">
            <label htmlFor="inputName">Scheme name:</label>
            <input 
              id="inputName" 
              type="text" 
              className="bg-[var(--primary-color)] p-2 text-[14px]" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>
        </div>

        <Divider />

        <code>
          {JSON.stringify(exportData, null, 2)}
        </code>
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
