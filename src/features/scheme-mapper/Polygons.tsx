import React from 'react';
import { Layer, Stage, Image as KonvaImage, Line, Circle } from "react-konva";
import styles from './Polygons.module.scss'
import classNames from 'classnames';
import { useSchemeMapperContext } from '@/context/SchemeMapperContext';

export const Polygons = ({
  isAddNew,
  hoveredId,
  setHoveredId
}: {
  isAddNew: boolean,
  hoveredId: string | null,
  setHoveredId: (id: string | null) => void
}) => {
  const { 
    image, 
    points, 
    polygons,
    setPoints,
  } = useSchemeMapperContext();

  const handleClick = (e: any) => {
    if (!isAddNew) return

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    setPoints([...points, pointer.x, pointer.y]);
  };

  return (
    <div className={classNames('', {
      [styles.animBorder]: isAddNew
    })}>
      <Stage
        width={image.width}
        height={image.height}
        onClick={handleClick}
        className="flex justify-center"
      >
        <Layer>
          <KonvaImage image={image} />
          {polygons.map((poly) => (
            <Line
              key={poly.id}
              strokeWidth={1}
              points={poly.coords}
              closed
              stroke={poly.strokeColor}
              fill={
                poly.id === hoveredId
                  ? poly.fillColor
                  : poly.preFillColor
              }
              onMouseEnter={() => setHoveredId(poly.id)}
              onMouseLeave={() => setHoveredId(null)}
            />
          ))}
          {points.length > 0 && (
            <>
              <Line points={points} stroke="red" />
              {points.map((p, i) =>
                i % 2 === 0 ? (
                  <Circle
                    key={i}
                    x={points[i]}
                    y={points[i + 1]}
                    radius={3}
                    fill="red"
                  />
                ) : null
              )}
            </>
          )}
        </Layer>
      </Stage>
    </div>
  )
};
