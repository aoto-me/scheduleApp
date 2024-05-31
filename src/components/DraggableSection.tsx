import { FC, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Section, SectionWithIndex } from "../types";

type DraggableSectionProps = {
  item: Section;
  index: number;
  swapItems: (dragIndex: number, hoverIndex: number, sectionId: number) => void;
  children: React.ReactNode;
};

const DraggableSection: FC<DraggableSectionProps> = ({
  item,
  index,
  swapItems,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: item.dragType,

    hover(dragItem: SectionWithIndex, monitor) {
      if (!ref.current) return;

      const dragIndex = dragItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;
      if (dragIndex === undefined) return;

      if (item.id === dragItem.id) {
        // グループ内での並び替えの場合は入れ替え方向とhover位置に応じて入れ替えるかを確定
        const hoverRect = ref.current.getBoundingClientRect();
        const hoverMiddleY = (hoverRect.bottom - hoverRect.top) / 2;
        const mousePosition = monitor.getClientOffset(); // ドラッグ操作中に最後に記録されたポインタ { x, y } を返す。ドラッグ中の項目がない場合は null を返す。
        if (!mousePosition) return;

        const hoverClientY = mousePosition.y - hoverRect.top;
        // ドラッグされている要素がホバーされている要素よりも上にある場合
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY * 0.5) return;
        // ドラッグされている要素がホバーされている要素よりも下にある場合
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY * 1.5) return;
      }

      swapItems(dragIndex, hoverIndex, item.id);

      /* eslint-disable */
      dragItem.index = hoverIndex;
      /* eslint-disable */
    },
  });

  // collectでmonitorから取得したデータのみが戻り値として利用できる (collectに指定することで型補完も適用される)
  const [{ isDragging, canDrag }, drag] = useDrag({
    type: item.dragType,
    item: { ...item, index },
    isDragging: (monitor) => monitor.getItem().id === item.id,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      canDrag: monitor.canDrag(),
    }),
  });

  // refをconnectorと呼ばれる関数(drag,drop)に渡すことで、対象refと↑のuseDrag,useDropでの処理を結びつける
  drag(drop(ref));

  return (
    <div
      style={{
        opacity: isDragging ? 0.4 : 1,
        cursor: canDrag ? "move" : "default",
        height: "100%",
        padding: "1rem",
      }}
      ref={ref}
    >
      {children}
    </div>
  );
};

export default DraggableSection;
