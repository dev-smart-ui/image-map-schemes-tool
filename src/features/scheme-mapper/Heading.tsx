'use client'

import { useEffect, useRef, useState } from "react";
import { useSchemeMapperContext } from "@/context/SchemeMapperContext";
import { Modal } from "@/components/ui/modals/Modal";
import { Button } from "@/components/ui/buttons/Button";
import { Mapper } from "./Mapper";
import { Divider } from "./Divider";
import classNames from "classnames";
import { safeFetchJson } from "@/services/safeFetchJson";

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
    setPolygons,
  } = useSchemeMapperContext();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShowResultModalOpen, setIsShowResultModalOpen] = useState(false);
  const [isShowUploadExistsModalOpen, setIsShowUploadExistsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isUploadUrlMethod, setIsUploadUrlMethod] = useState(false);
  const [imageUrlState, setImageUrlState] = useState('');
  const [imageUrlError, setImageUrlError] = useState('');
  const [existsImages, setExistsImages] = useState<string[] | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const onImageInputChangeHandler = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => setImage(img);
  }

  const onExistsMethodClickHandler = () => {
    fetchExistsImages();
    setIsShowUploadExistsModalOpen(true);
  }

  const onRestartClickHandler = () => {
    setImage(null);
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

  const onDownLoadClickHandler = async (url?: string) => {
    try {
      setImageUrlError('');
      setIsShowUploadExistsModalOpen(false);

      const sourceUrl = url || imageUrlState

      const response = await fetch(sourceUrl);

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

      setImageUrl(sourceUrl); 
    } catch(err) {
      console.warn(err);     
      setImageUrlError('Error in load image!'); 
    }
  }

  const fetchExistsImages = async () => {
    const { ok, data } = await safeFetchJson(`/api/sheets/images`);

    if (ok) {
      setExistsImages(data?.payload || []);
    }    
  }

  useEffect(() => {
    setIsCopied(false);
  }, [name]);

  return (
    <div className={classNames('flex items-center gap-4', {
      'mb-4': image
    })}>
      { !image && (
        <>
          { !isUploadUrlMethod && (
            <div>
              <p>Upload image: </p>

              <div className="mt-4 flex gap-2">
                <Button onClick={() => setIsUploadUrlMethod(true)}>
                  From url
                </Button>

                <input 
                  ref={imageInputRef} 
                  type="file" 
                  className="hidden" 
                  onChange={e => onImageInputChangeHandler(e)}
                />

                <Button onClick={() => imageInputRef?.current?.click()}>
                  From device
                </Button>

                <Button onClick={onExistsMethodClickHandler}>
                  From exists in table
                </Button>
              </div>
            </div>
          ) }

          { isUploadUrlMethod && (
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
      
              <div className="mt-8 flex gap-2">
                <Button 
                  onClick={() => setIsUploadUrlMethod(false)} 
                  type="secondary"
                  withIcon
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                  </svg>

                  Cancel
                </Button>

                <Button 
                  onClick={onDownLoadClickHandler}
                  disabled={!imageUrlState}
                >
                  Download
                </Button>
              </div>
            </div>
          ) }
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

      <Modal 
        isOpen={isShowUploadExistsModalOpen}
        title="Exists images"
        onClose={() => setIsShowUploadExistsModalOpen(false)}
      >
        { existsImages === null && (
          'Loading...'
        )}

        { (existsImages && existsImages.length === 0) && (
          'No data'
        )}

        { (existsImages && existsImages.length) && (
          <div className="grid grid-cols-5 gap-2">
            { existsImages.map((url, i) => (
              <button 
                key={i} 
                className="border hover:opacity-70 p-1 rounded-xl cursor-pointer" 
                onClick={() => onDownLoadClickHandler(url)}
              >
                <img src={url} alt="" width={100} height={100} className="w-full h-full object-contain" />
              </button>
            )) }
          </div>
        )}
      </Modal>
    </div>
  )
}
